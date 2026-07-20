#!/usr/bin/env python3
"""Stage MDX release candidates and promote independently reviewed articles."""

import os
import json
import logging
import re
from pathlib import Path
from datetime import datetime
from typing import Dict
from abc import ABC, abstractmethod

from review import verify_claude_review

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(message)s')
logger = logging.getLogger(__name__)

class PublisherAdapter(ABC):
    """Base publisher adapter interface"""
    
    @abstractmethod
    def publish(self, article: Dict, seo: Dict, image: Dict) -> bool:
        """Publish article to target platform"""
        pass

class MDXStaticPublisher(PublisherAdapter):
    """Publisher for the active category-based MDX site.

    Candidate mode writes outside the live ``content`` tree. Direct production
    writes are disabled; an exact candidate must be promoted with an accepted
    Claude review artifact.
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
                'tags': article.get('tags', ['technology']),
                'category': category,
                'author': 'Trends Today Team',
                'readingTime': max(1, len(article['body_mdx'].split()) // 200),
                'slug': slug,
                'locality': article.get('locality', ''),
                'storyType': article.get('storyType', 'guide-or-explainer'),
                'readerImpact': article.get('readerImpact', ''),
                'lengthRationale': article.get('lengthRationale', ''),
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


def promote_candidate(candidate_path: Path, review_path: Path, repo_root: Path = None) -> Path:
    """Promote a candidate only after Claude clears its exact SHA-256."""
    root = Path(repo_root) if repo_root else Path(__file__).resolve().parents[2]
    source = Path(candidate_path).resolve()
    review, digest, relative, review_relative = verify_claude_review(
        source,
        review_path,
        root,
    )
    category = relative.parts[0]
    if category not in MDXStaticPublisher.VALID_CATEGORIES:
        raise ValueError(f'Unsupported category: {category}')

    original = source.read_text(encoding='utf-8')
    if not re.search(r'^status:\s*["\']?release-candidate["\']?\s*$', original, re.MULTILINE):
        raise ValueError('File is not marked as a release candidate')
    source_config_path = root / 'config' / 'local-news-sources.json'
    source_config = json.loads(source_config_path.read_text(encoding='utf-8'))
    sensitive_keywords = (
        source_config.get('automaticPublishing', {}).get('manualApprovalKeywords', [])
    )
    requires_approval = bool(
        re.search(r'^manualApprovalRequired:\s*true\s*$', original, re.MULTILINE)
        or any(str(keyword).lower() in original.lower() for keyword in sensitive_keywords)
    )
    approval_recorded = bool(
        re.search(r'^manualApprovalRecorded:\s*true\s*$', original, re.MULTILINE)
    )
    if requires_approval and not approval_recorded:
        raise PermissionError('Sensitive candidate requires recorded human approval')
    sponsorship_match = re.search(
        r'^sponsorshipStatus:\s*["\']?([a-z-]+)["\']?\s*$',
        original,
        re.MULTILINE,
    )
    commercial_approval_recorded = bool(
        re.search(r'^commercialApprovalRecorded:\s*true\s*$', original, re.MULTILINE)
    )
    if (
        sponsorship_match
        and sponsorship_match.group(1) != 'editorial'
        and not commercial_approval_recorded
    ):
        raise PermissionError('Commercial candidate requires recorded owner approval')
    review_metadata = (
        'status: "published"\n'
        f'reviewedBy: {json.dumps(review["reviewer"], ensure_ascii=False)}\n'
        f'reviewVerdict: {json.dumps(review["verdict"], ensure_ascii=False)}\n'
        f'reviewModel: {json.dumps(review["modelUsed"], ensure_ascii=False)}\n'
        f'reviewArtifact: {json.dumps(review_relative.as_posix(), ensure_ascii=False)}\n'
        f'candidateSha256: "{digest}"\n'
        f'promotedAt: "{datetime.now().isoformat()}"'
    )
    promoted = re.sub(
        r'^status:\s*["\']?release-candidate["\']?\s*$',
        lambda _match: review_metadata,
        original,
        count=1,
        flags=re.MULTILINE,
    )

    destination = root / 'content' / category / relative.name
    if destination.exists():
        raise FileExistsError(f'Refusing to overwrite existing article: {destination}')
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(promoted, encoding='utf-8')
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
