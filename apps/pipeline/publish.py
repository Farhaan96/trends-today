#!/usr/bin/env python3
"""Stage MDX release candidates and promote independently reviewed articles."""

import errno
import os
import json
import logging
import re
import tempfile
import time
from contextlib import contextmanager
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict
from abc import ABC, abstractmethod
from urllib.parse import urlparse
from zoneinfo import ZoneInfo

from codex_review import run_review as run_codex_review
from review import verify_codex_review, verify_gpt_review

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(message)s')
logger = logging.getLogger(__name__)

# Approved source categories for a promoted hero visual: an official map, an
# official/work-area diagram, or an attributed primary-source/licensed photo.
# Sharpness, resolution, and dimensions are deliberately excluded: a low-resolution
# official or licensed visual must still pass this gate.
ALLOWED_IMAGE_SOURCE_TYPES = {
    'official-map',
    'official-diagram',
    'work-area-diagram',
    'official-photo',
    'primary-source-photo',
    'licensed-photo',
}

# Explicitly rejected regardless of how polished or on-topic the visual looks.
REJECTED_IMAGE_SOURCE_TYPES = {
    'stock',
    'stock-photo',
    'ai-generated',
    'decorative',
    'decorative-ai',
    'illustrative',
    'generic',
    'unrelated',
    'invented',
}

PUBLICATION_TIMEZONE = ZoneInfo('America/Vancouver')


def _frontmatter_value(frontmatter: str, field: str) -> str:
    match = re.search(rf'^{re.escape(field)}:\s*(.*)$', frontmatter, re.MULTILINE)
    return match.group(1).strip().strip('"\'').strip() if match else ''


def _frontmatter_values(frontmatter: str, field: str) -> list[str]:
    return [
        value.strip().strip('"\'').strip()
        for value in re.findall(
            rf'^{re.escape(field)}:\s*(.*)$',
            frontmatter,
            re.MULTILINE,
        )
    ]


def _valid_http_url(value: str) -> bool:
    parsed = urlparse(value)
    return (
        parsed.scheme.lower() in {'http', 'https'}
        and bool(parsed.netloc and parsed.hostname)
        and not any(character.isspace() for character in value)
    )


def _promotion_time(value: datetime = None) -> datetime:
    current = value or datetime.now(timezone.utc)
    if current.tzinfo is None:
        raise ValueError('Promotion time must be timezone-aware')
    return current


def _published_day(frontmatter: str, published_path: Path):
    """Return the trusted publication day, rejecting ambiguous metadata."""
    for field in ('promotedAt', 'publishedAt', 'datePublished'):
        values = _frontmatter_values(frontmatter, field)
        if len(values) > 1:
            raise ValueError(f'Published article has duplicate {field}: {published_path}')
        if not values:
            continue
        value = values[0]
        try:
            recorded = datetime.fromisoformat(value.replace('Z', '+00:00'))
        except ValueError as exc:
            raise ValueError(
                f'Published article has malformed {field}: {published_path}'
            ) from exc
        if recorded.tzinfo is None:
            recorded = recorded.replace(tzinfo=PUBLICATION_TIMEZONE)
        return recorded.astimezone(PUBLICATION_TIMEZONE).date()
    return None


def _enforce_daily_promotion_ceiling(
    root: Path, promotion_time: datetime, excluded_path: Path = None
) -> None:
    target_day = promotion_time.astimezone(PUBLICATION_TIMEZONE).date()
    content_root = root / 'content'
    if not content_root.exists():
        return
    for published_path in content_root.glob('*/*.mdx'):
        if excluded_path is not None and published_path.resolve() == excluded_path.resolve():
            continue
        text = published_path.read_text(encoding='utf-8')
        match = re.match(r'^\ufeff?---\s*\n(.*?)\n---\s*\n', text, re.DOTALL)
        if not match:
            raise ValueError(
                f'Published article has missing or malformed frontmatter: {published_path}'
            )
        published_day = _published_day(match.group(1), published_path)
        if published_day is None:
            raise ValueError(
                f'Published article has no valid publication date: {published_path}'
            )
        if published_day == target_day:
            raise PermissionError(
                f'Daily promotion ceiling already reached for {target_day} America/Vancouver'
            )


@contextmanager
def _promotion_lock(root: Path, timeout_seconds: float = 30.0):
    """Hold one repository-wide promotion lock across processes."""
    lock_path = root / 'artifacts' / 'editorial' / '.promotion.lock'
    lock_path.parent.mkdir(parents=True, exist_ok=True)
    lock_file = open(lock_path, 'a+b')
    try:
        lock_file.seek(0, os.SEEK_END)
        if lock_file.tell() == 0:
            lock_file.write(b'\0')
            lock_file.flush()
        deadline = time.monotonic() + timeout_seconds
        if os.name == 'nt':
            import msvcrt

            while True:
                try:
                    lock_file.seek(0)
                    msvcrt.locking(lock_file.fileno(), msvcrt.LK_NBLCK, 1)
                    break
                except OSError:
                    if time.monotonic() >= deadline:
                        raise TimeoutError('Timed out waiting for the promotion lock')
                    time.sleep(0.05)
        else:
            import fcntl

            while True:
                try:
                    fcntl.flock(
                        lock_file.fileno(),
                        fcntl.LOCK_EX | fcntl.LOCK_NB,
                    )
                    break
                except OSError as exc:
                    if exc.errno not in {errno.EACCES, errno.EAGAIN}:
                        raise
                    remaining = deadline - time.monotonic()
                    if remaining <= 0:
                        raise TimeoutError('Timed out waiting for the promotion lock')
                    time.sleep(min(0.05, remaining))
        try:
            yield
        finally:
            lock_file.seek(0)
            if os.name == 'nt':
                msvcrt.locking(lock_file.fileno(), msvcrt.LK_UNLCK, 1)
            else:
                fcntl.flock(lock_file.fileno(), fcntl.LOCK_UN)
    finally:
        lock_file.close()


def _atomic_write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(
            mode='w',
            encoding='utf-8',
            dir=path.parent,
            prefix=f'.{path.name}.',
            suffix='.tmp',
            delete=False,
        ) as handle:
            handle.write(content)
            handle.flush()
            os.fsync(handle.fileno())
            temporary = Path(handle.name)
        os.replace(temporary, path)
    finally:
        if temporary is not None and temporary.exists():
            temporary.unlink()


def _commit_promotion(
    root: Path,
    destination: Path,
    promoted: str,
    promotion_time: datetime,
    candidate_frontmatter: str,
    replace_existing: bool,
) -> None:
    """Atomically enforce the daily cap and write one promoted article."""
    with _promotion_lock(root):
        if destination.exists() and not replace_existing:
            raise FileExistsError(f'Refusing to overwrite existing article: {destination}')
        _enforce_daily_promotion_ceiling(
            root,
            promotion_time,
            destination if replace_existing else None,
        )
        if destination.exists():
            existing = destination.read_text(encoding='utf-8')
            existing_frontmatter_match = re.match(
                r'^---\s*\n(.*?)\n---\s*\n',
                existing,
                re.DOTALL,
            )
            if not existing_frontmatter_match:
                raise ValueError('Existing article frontmatter is missing or malformed')
            existing_frontmatter = existing_frontmatter_match.group(1)
            if not re.search(
                r'^status:\s*["\']?published["\']?\s*$',
                existing_frontmatter,
                re.MULTILINE,
            ):
                raise PermissionError('Only an existing published article may be revised')
            existing_slug = re.search(
                r'^slug:\s*["\']?([^"\'\n]+)["\']?\s*$',
                existing_frontmatter,
                re.MULTILINE,
            )
            candidate_slug = re.search(
                r'^slug:\s*["\']?([^"\'\n]+)["\']?\s*$',
                candidate_frontmatter,
                re.MULTILINE,
            )
            if (
                not existing_slug
                or not candidate_slug
                or existing_slug.group(1).strip() != candidate_slug.group(1).strip()
            ):
                raise PermissionError('Revision candidate slug must match the published article')
        _atomic_write(destination, promoted)

class PublisherAdapter(ABC):
    """Base publisher adapter interface"""
    
    @abstractmethod
    def publish(self, article: Dict, seo: Dict, image: Dict) -> bool:
        """Publish article to target platform"""
        pass

class MDXStaticPublisher(PublisherAdapter):
    """Publisher for the active category-based MDX site.

    Candidate mode writes outside the live ``content`` tree. Direct production
    writes are disabled; an exact candidate must be promoted with accepted GPT
    editorial and Codex release-review artifacts.
    """

    VALID_CATEGORIES = {
        'science', 'culture', 'psychology', 'technology', 'health', 'space',
        'local-news', 'transit', 'things-to-do', 'food-drink', 'housing', 'sports'
    }

    def __init__(self, mode: str = 'candidate', repo_root: Path = None):
        if mode != 'candidate':
            raise PermissionError('Direct production writes are disabled; promote a reviewed candidate')
        self.mode = mode
        self.repo_root = Path(repo_root) if repo_root else Path(__file__).resolve().parents[2]
        self.posts_dir = self.repo_root / 'artifacts' / 'editorial' / 'release-candidates'
        self.posts_dir.mkdir(parents=True, exist_ok=True)
        
    def publish(self, article: Dict, seo: Dict, image: Dict) -> bool:
        """Write MDX file with frontmatter"""
        try:
            if not image.get('path') or 'placeholder' in image.get('path', '').lower():
                raise ValueError('A non-placeholder image is required for a release candidate')
            slug = seo['slug']
            category = str(article.get('category') or article.get('tags', ['technology'])[0]).lower()
            if category not in self.VALID_CATEGORIES:
                raise ValueError(f"Unsupported category: {category}")
            category_dir = self.posts_dir / category
            category_dir.mkdir(parents=True, exist_ok=True)
            filepath = category_dir / f"{slug}.mdx"
            
            # Build frontmatter
            frontmatter = {
                'title': article['title'],
                'subtitle': article.get('subtitle', ''),
                'description': seo['meta_description'],
                'publishedAt': datetime.now().isoformat(),
                'image': image['path'],
                'imageAlt': image['alt'],
                'imageAttribution': image.get('attribution', ''),
                'imageSourceUrl': image.get('sourceUrl', ''),
                'imageLicense': image.get('license', ''),
                'imageLicenseUrl': image.get('licenseUrl', ''),
                'imageSourceType': image.get('sourceType', ''),
                'imageRelevanceConfirmed': bool(image.get('relevanceConfirmed', False)),
                'tags': article.get('tags', ['technology']),
                'category': category,
                'author': 'Trends Today Newsroom',
                'editor': article.get('editor', 'Moe'),
                'readingTime': max(1, len(article['body_mdx'].split()) // 200),
                'slug': slug,
                'locality': article.get('locality', ''),
                'storyType': article.get('storyType', 'guide-or-explainer'),
                'readerImpact': article.get('readerImpact', ''),
                'lengthRationale': article.get('lengthRationale', ''),
                'highlights': article.get('highlights', []),
                'reportingMethod': article.get('reportingMethod', ''),
                'commercialIntent': article.get('commercialIntent', 'none'),
                'commercialFitReason': article.get('commercialFitReason', ''),
                'brandSafety': article.get('brandSafety', 'standard'),
                'sponsorshipStatus': article.get('sponsorshipStatus', 'editorial'),
                'commercialApprovalRecorded': bool(article.get('commercialApprovalRecorded')),
                'manualApprovalRequired': bool(article.get('manualApprovalRequired')),
                'manualApprovalRecorded': bool(article.get('manualApprovalRecorded')),
            }
            frontmatter['status'] = 'release-candidate'
            
            # Process body to replace internal link placeholders
            body = article['body_mdx']
            for link in seo.get('internal_links', []):
                # For now, just remove the placeholders
                # In production, would link to actual posts
                body = body.replace(link['placeholder'], link['keyword'])
            
            # Write MDX file
            content = "---\n"
            for key, value in frontmatter.items():
                if isinstance(value, list):
                    content += f"{key}:\n"
                    for item in value:
                        content += f"  - {json.dumps(str(item), ensure_ascii=False)}\n"
                else:
                    content += f"{key}: {json.dumps(value, ensure_ascii=False)}\n"
            content += "---\n\n"
            content += body
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            
            logger.info(f"Wrote {self.mode} article: {filepath}")
            return True
            
        except Exception as e:
            logger.error(f"Publish error: {e}")
            return False

class WordPressPublisher(PublisherAdapter):
    """Stub for WordPress API publishing"""
    
    def __init__(self):
        self.api_url = os.getenv('WORDPRESS_API_URL')
        self.api_key = os.getenv('WORDPRESS_API_KEY')
        
    def publish(self, article: Dict, seo: Dict, image: Dict) -> bool:
        """Publish to WordPress via REST API"""
        logger.info("WordPress publisher not implemented (stub)")
        # Would implement WordPress REST API calls here
        return False

class HeadlessCMSPublisher(PublisherAdapter):
    """Stub for headless CMS publishing"""
    
    def __init__(self):
        self.cms_url = os.getenv('CMS_API_URL')
        self.cms_key = os.getenv('CMS_API_KEY')
        
    def publish(self, article: Dict, seo: Dict, image: Dict) -> bool:
        """Publish to headless CMS"""
        logger.info("Headless CMS publisher not implemented (stub)")
        # Would implement CMS API calls here
        return False

class Publisher:
    """Main publisher with adapter selection"""
    
    def __init__(
        self,
        adapter: str = 'mdx_static',
        mode: str = 'candidate',
        repo_root: Path = None,
    ):
        self.adapters = {
            'mdx_static': MDXStaticPublisher,
            'wordpress': WordPressPublisher,
            'headless_cms': HeadlessCMSPublisher
        }
        
        adapter_class = self.adapters.get(adapter, MDXStaticPublisher)
        if adapter_class is MDXStaticPublisher:
            self.adapter = adapter_class(mode=mode, repo_root=repo_root)
        else:
            self.adapter = adapter_class()
        self.mode = mode
        
    def publish(self, article: Dict, seo: Dict, image: Dict) -> bool:
        """Publish article using selected adapter"""
        return self.adapter.publish(article, seo, image)
    
    def _update_index(self, article: Dict, seo: Dict):
        """Update posts index for homepage"""
        try:
            # Load existing index
            index_file = Path('artifacts/editorial/legacy-index.json')
            if index_file.exists():
                with open(index_file, 'r') as f:
                    index = json.load(f)
            else:
                index = []
            
            # Add new post
            index.insert(0, {
                'slug': seo['slug'],
                'title': article['title'],
                'subtitle': article['subtitle'],
                'date': datetime.now().isoformat(),
                'category': article.get('tags', ['technology'])[0],
                'image': article.get('image', {}).get('path', '/images/placeholder.jpg')
            })
            
            # Keep only recent 100 posts in index
            index = index[:100]
            
            # Save index
            index_file.parent.mkdir(parents=True, exist_ok=True)
            with open(index_file, 'w') as f:
                json.dump(index, f, indent=2)
                
        except Exception as e:
            logger.error(f"Index update error: {e}")


def promote_candidate(
    candidate_path: Path,
    gpt_review_path: Path,
    repo_root: Path = None,
    replace_existing: bool = False,
    now: datetime = None,
    review_path: Path = None,
) -> Path:
    """Promote after GPT review and an internally invoked authenticated Codex gate."""
    root = Path(repo_root) if repo_root else Path(__file__).resolve().parents[2]
    source = Path(candidate_path).resolve()
    if review_path is not None:
        raise PermissionError(
            'External Codex review artifacts are not accepted; promotion runs the trusted gate'
        )
    gpt_review, gpt_digest, _, gpt_review_relative = verify_gpt_review(
        source,
        gpt_review_path,
        root,
    )
    digest = gpt_digest
    candidate_root = root.resolve() / 'artifacts' / 'editorial' / 'release-candidates'
    relative = source.relative_to(candidate_root)
    category = relative.parts[0]
    if category not in MDXStaticPublisher.VALID_CATEGORIES:
        raise ValueError(f'Unsupported category: {category}')

    original = source.read_text(encoding='utf-8')
    frontmatter_match = re.match(r'^---\s*\n(.*?)\n---\s*\n', original, re.DOTALL)
    if not frontmatter_match:
        raise ValueError('Candidate frontmatter is missing or malformed')
    frontmatter = frontmatter_match.group(1)
    if not re.search(r'^status:\s*["\']?release-candidate["\']?\s*$', frontmatter, re.MULTILINE):
        raise ValueError('File is not marked as a release candidate')
    promotion_fields = {
        'promotedAt',
        'candidateSha256',
        'reviewedBy',
        'reviewVerdict',
        'reviewModel',
        'reviewArtifact',
        'editorialReviewedBy',
        'editorialReviewVerdict',
        'editorialReviewModel',
        'editorialReviewScores',
        'editorialReviewArtifact',
    }
    supplied_promotion_fields = [
        field for field in promotion_fields if _frontmatter_values(frontmatter, field)
    ]
    if supplied_promotion_fields:
        raise ValueError(
            'Candidate contains reserved promotion metadata: '
            + ', '.join(sorted(supplied_promotion_fields))
        )
    image_match = re.search(r'^image:\s*(.*)$', frontmatter, re.MULTILINE)
    image_value = image_match.group(1).strip() if image_match else ''
    if not image_value.strip('"\'').strip():
        raise ValueError('Candidate has a blank or whitespace-only image')

    image_source_type = _frontmatter_value(frontmatter, 'imageSourceType').lower()
    if not image_source_type or image_source_type in REJECTED_IMAGE_SOURCE_TYPES:
        raise ValueError(
            'Candidate hero image must be an official/licensed source visual '
            '(e.g. an official map, work-area diagram, or attributed primary-source photo), '
            'not a stock, decorative AI, invented, or unrelated image'
        )
    if image_source_type not in ALLOWED_IMAGE_SOURCE_TYPES:
        raise ValueError(f'Candidate hero image source type "{image_source_type}" is not an approved source visual category')

    relevance_match = re.search(r'^imageRelevanceConfirmed:\s*(true|false)\s*$', frontmatter, re.MULTILINE)
    if not relevance_match or relevance_match.group(1) != 'true':
        raise ValueError('Candidate hero image relevance to the story has not been confirmed')

    image_attribution = _frontmatter_value(frontmatter, 'imageAttribution')
    if not image_attribution:
        raise ValueError('Candidate hero image is missing required source attribution')
    if image_source_type == 'licensed-photo':
        image_source_url = _frontmatter_value(frontmatter, 'imageSourceUrl')
        image_license = _frontmatter_value(frontmatter, 'imageLicense')
        image_license_url = _frontmatter_value(frontmatter, 'imageLicenseUrl')
        if not _valid_http_url(image_source_url):
            raise ValueError('Licensed photo requires a valid HTTP(S) imageSourceUrl')
        if not image_license:
            raise ValueError('Licensed photo requires a non-empty imageLicense')
        if not _valid_http_url(image_license_url):
            raise ValueError('Licensed photo requires a valid HTTP(S) imageLicenseUrl')

    source_config_path = root / 'config' / 'local-news-sources.json'
    source_config = json.loads(source_config_path.read_text(encoding='utf-8'))
    sensitive_keywords = (
        source_config.get('automaticPublishing', {}).get('manualApprovalKeywords', [])
    )
    requires_approval = bool(
        re.search(r'^manualApprovalRequired:\s*true\s*$', frontmatter, re.MULTILINE)
        or any(str(keyword).lower() in original.lower() for keyword in sensitive_keywords)
    )
    approval_recorded = bool(
        re.search(r'^manualApprovalRecorded:\s*true\s*$', frontmatter, re.MULTILINE)
    )
    if requires_approval and not approval_recorded:
        raise PermissionError('Sensitive candidate requires recorded human approval')
    business_config_path = root / 'config' / 'content-business.json'
    business_config = json.loads(business_config_path.read_text(encoding='utf-8-sig'))
    release_config = business_config.get('release', {})
    if release_config.get('publicPublishingRequiresHumanAuthorization', True):
        raise PermissionError('Routine autonomous public promotion is not authorized')
    if not release_config.get('routineEditorialPublishingAuthorized', False):
        raise PermissionError('Routine autonomous public promotion is disabled')
    monetization = business_config['monetization']
    allowed_sponsorship_statuses = set(monetization['sponsorshipStatusValues'])
    automated_status = monetization['automatedDefaultSponsorshipStatus']
    sponsorship_match = re.search(
        r'^sponsorshipStatus:\s*["\']?([a-z-]+)["\']?\s*$',
        frontmatter,
        re.MULTILINE,
    )
    if not sponsorship_match or sponsorship_match.group(1) not in allowed_sponsorship_statuses:
        raise PermissionError('Candidate has missing or unsupported sponsorship status')
    commercial_approval_recorded = bool(
        re.search(r'^commercialApprovalRecorded:\s*true\s*$', frontmatter, re.MULTILINE)
    )
    if (
        sponsorship_match.group(1) != automated_status
        and not commercial_approval_recorded
    ):
        raise PermissionError('Commercial candidate requires recorded owner approval')
    trusted_review_path = run_codex_review(source, root)
    review, codex_digest, codex_relative, review_relative = verify_codex_review(
        source,
        trusted_review_path,
        root,
    )
    if codex_digest != digest or codex_relative != relative:
        raise PermissionError('Editorial and release reviews do not cover the same candidate')
    promotion_time = _promotion_time(now)
    review_metadata = (
        'status: "published"\n'
        f'editorialReviewedBy: {json.dumps(gpt_review["reviewer"], ensure_ascii=False)}\n'
        f'editorialReviewVerdict: {json.dumps(gpt_review["verdict"], ensure_ascii=False)}\n'
        f'editorialReviewModel: {json.dumps(gpt_review["modelUsed"], ensure_ascii=False)}\n'
        f'editorialReviewScores: {json.dumps(gpt_review["scores"], ensure_ascii=False)}\n'
        f'editorialReviewArtifact: {json.dumps((Path("gpt") / gpt_review_relative).as_posix(), ensure_ascii=False)}\n'
        f'reviewedBy: {json.dumps(review["reviewer"], ensure_ascii=False)}\n'
        f'reviewVerdict: {json.dumps(review["verdict"], ensure_ascii=False)}\n'
        f'reviewModel: {json.dumps(review["modelUsed"], ensure_ascii=False)}\n'
        f'reviewArtifact: {json.dumps(review_relative.as_posix(), ensure_ascii=False)}\n'
        f'candidateSha256: "{digest}"\n'
        f'promotedAt: "{promotion_time.isoformat()}"'
    )
    promoted = re.sub(
        r'^status:\s*["\']?release-candidate["\']?\s*$',
        lambda _match: review_metadata,
        original,
        count=1,
        flags=re.MULTILINE,
    )

    promoted = re.sub(
        r'^draft:\s*true\s*$',
        'draft: false',
        promoted,
        flags=re.MULTILINE | re.IGNORECASE,
    )

    destination = root / 'content' / category / relative.name
    _commit_promotion(
        root,
        destination,
        promoted,
        promotion_time,
        frontmatter,
        replace_existing,
    )
    logger.info('Promoted reviewed candidate %s to %s', source, destination)
    return destination

if __name__ == '__main__':
    publisher = Publisher('mdx_static')
    
    test_article = {
        'title': 'Test Article',
        'subtitle': 'Testing the publisher',
        'body_mdx': '## Test Content\n\nThis is a test.',
        'tags': ['test']
    }
    
    test_seo = {
        'slug': 'test-article',
        'meta_description': 'Test description',
        'internal_links': []
    }
    
    test_image = {
        'path': '/images/test.jpg',
        'alt': 'Test image',
        'attribution': 'Test attribution'
    }
    
    success = publisher.publish(test_article, test_seo, test_image)
    print(f"Publish {'succeeded' if success else 'failed'}")
