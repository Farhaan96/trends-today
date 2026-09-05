#!/usr/bin/env python3
"""Deterministic release-candidate checks that do not depend on an LLM."""

import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List
from urllib.parse import urlparse


LOCAL_CATEGORIES = {
    'local-news', 'transit', 'things-to-do', 'food-drink', 'housing', 'sports'
}
ARTICLE_CATEGORIES = LOCAL_CATEGORIES | {
    'science', 'technology', 'space', 'health', 'psychology', 'culture'
}
REPO_ROOT = Path(__file__).resolve().parents[2]
CONTENT_BUSINESS_CONFIG = REPO_ROOT / 'config' / 'content-business.json'
LOCAL_SOURCE_CONFIG = REPO_ROOT / 'config' / 'local-news-sources.json'


@dataclass(frozen=True)
class ValidationResult:
    passed: bool
    errors: List[str]


def _valid_source_urls(sources: List[Dict]) -> List[str]:
    urls = []
    for source in sources:
        url = str(source.get('url', '')).strip()
        parsed = urlparse(url)
        if parsed.scheme in {'http', 'https'} and parsed.netloc:
            urls.append(url)
    return list(dict.fromkeys(urls))


def _approved_localities() -> set:
    config = json.loads(LOCAL_SOURCE_CONFIG.read_text(encoding='utf-8'))
    values = list(config.get('localities', []))
    values.extend(
        config.get('searchDiscovery', {}).get('approvedRegionalLabels', [])
    )
    return {
        str(value).strip().lower()
        for value in values
        if str(value).strip()
    }


def _load_contract(config_path: Path = None) -> Dict:
    path = Path(config_path) if config_path else CONTENT_BUSINESS_CONFIG
    payload = json.loads(path.read_text(encoding='utf-8-sig'))
    if payload.get('version', 0) < 5:
        raise ValueError('content-business config v5 or newer is required')
    return {
        'editorial': payload['editorialContract'],
        'monetization': payload['monetization'],
    }


def _paragraphs(body: str) -> List[str]:
    paragraphs = []
    for block in re.split(r'\n\s*\n', body):
        text = block.strip()
        if (
            not text
            or text.startswith(('#', '>', '|'))
            or re.match(r'^(?:[-*+]\s+|\d+\.\s+)', text)
        ):
            continue
        if re.fullmatch(r'https?://\S+', text):
            continue
        paragraphs.append(text)
    return paragraphs


def count_prose_em_dashes(body: str) -> int:
    """Count em dashes in editorial prose, not quotes or source citations."""
    prose_lines = []
    in_sources = False

    for line in body.splitlines():
        stripped = line.strip()
        if re.match(r'^##\s+sources\s*$', stripped, re.IGNORECASE):
            in_sources = True
            continue
        if in_sources and re.match(r'^##\s+\S', stripped):
            in_sources = False
        if in_sources or line.lstrip().startswith('>'):
            continue

        # Preserve exact punctuation inside direct quotations.
        prose_lines.append(re.sub(r'"[^"\r\n]*"', '', line))

    return '\n'.join(prose_lines).count('—')


def _sentence_count(paragraph: str) -> int:
    without_urls = re.sub(r'https?://\S+', '', paragraph)
    return len(re.findall(r'[.!?](?=\s|$)', without_urls))


def _article_links(body: str) -> List[Dict[str, str]]:
    links = []
    for anchor, href in re.findall(r'\[([^\]]+)\]\((/[^)\s]+)\)', body):
        clean_path = href.split('#', 1)[0].split('?', 1)[0].strip('/')
        parts = clean_path.split('/')
        if len(parts) == 2 and parts[0] in ARTICLE_CATEGORIES:
            links.append({'anchor': anchor.strip(), 'href': href, 'path': clean_path})
    return links


def validate_published_content_tree(content_dir: Path = None) -> ValidationResult:
    """Fail when a staged or pending candidate is placed in the public content tree."""
    root = Path(content_dir) if content_dir else REPO_ROOT / 'content'
    errors: List[str] = []

    for article_path in root.glob('**/*.mdx'):
        text = article_path.read_text(encoding='utf-8')
        frontmatter_match = re.match(r'^---\s*\n(.*?)\n---\s*\n', text, re.DOTALL)
        if not frontmatter_match:
            continue
        status_match = re.search(
            r'^status:\s*["\']?([^"\'\n]+)["\']?\s*$',
            frontmatter_match.group(1),
            re.MULTILINE,
        )
        if status_match and status_match.group(1).strip().lower() != 'published':
            errors.append(
                f'{article_path.relative_to(root).as_posix()} has non-public status '
                f'{status_match.group(1).strip()}'
            )

    return ValidationResult(passed=not errors, errors=errors)


def validate_release_candidate(
    article: Dict,
    sources: List[Dict],
    seo: Dict,
    image: Dict,
    minimum_sources: int = None,
    sensitive_keywords: List[str] = None,
    config_path: Path = None,
    published_content_dir: Path = None,
) -> ValidationResult:
    errors: List[str] = []
    body = str(article.get('body_mdx', ''))
    words = len(body.split())
    source_urls = _valid_source_urls(sources)
    category = str(article.get('category', '')).lower()
    locality = str(article.get('locality', '')).strip()
    declared_story_type = str(
        article.get('storyType') or article.get('story_type') or ''
    ).strip()
    is_local = category in LOCAL_CATEGORIES or bool(locality)
    story_type = declared_story_type or ('reported-update' if is_local else 'legacy')
    contract = _load_contract(config_path)
    story_contracts = contract['editorial']['storyTypes']
    story_contract = story_contracts.get(story_type, story_contracts['legacy'])
    minimum_sources = minimum_sources or story_contract['minimumSources']
    minimum_words = story_contract['wordRange']['min']
    maximum_words = story_contract['wordRange']['max']
    minimum_h2 = story_contract['minimumH2']
    minimum_lists = story_contract['minimumLists']
    internal_link_range = story_contract['internalLinks']
    formatting = contract['editorial']['formatting']
    link_contract = contract['editorial']['internalLinks']
    monetization = contract['monetization']
    content_dir = Path(published_content_dir) if published_content_dir else REPO_ROOT / 'content'
    primary_sources = [
        source for source in sources
        if source.get('tier') == 'primary'
        or source.get('sourceTier') == 'primary'
        or source.get('isPrimary') is True
    ]

    if not str(article.get('title', '')).strip():
        errors.append('title is missing')
    if not str(article.get('meta_description', '')).strip():
        errors.append('meta description is missing')
    if words < minimum_words or words > maximum_words:
        errors.append(
            f'word count is {words}; expected {minimum_words}-{maximum_words} for {story_type}'
        )
    h2_count = len(re.findall(r'^##\s+\S', body, re.MULTILINE))
    if h2_count < minimum_h2:
        errors.append(f'only {h2_count} H2 sections; {minimum_h2} required for {story_type}')
    list_count = len(re.findall(r'^(?:[-*+]\s+|\d+\.\s+)', body, re.MULTILINE))
    if list_count < minimum_lists:
        errors.append(f'only {list_count} list items; {minimum_lists} required for {story_type}')
    for index, paragraph in enumerate(_paragraphs(body), start=1):
        paragraph_words = len(paragraph.split())
        paragraph_sentences = _sentence_count(paragraph)
        if paragraph_words > formatting['maximumParagraphWords']:
            errors.append(
                f'paragraph {index} has {paragraph_words} words; '
                f"maximum is {formatting['maximumParagraphWords']}"
            )
        if paragraph_sentences > formatting['maximumParagraphSentences']:
            errors.append(
                f'paragraph {index} has {paragraph_sentences} sentences; '
                f"maximum is {formatting['maximumParagraphSentences']}"
            )
    if count_prose_em_dashes(body):
        errors.append('article prose must not use em dashes')
    if len(source_urls) < minimum_sources:
        errors.append(f'only {len(source_urls)} valid source URLs; {minimum_sources} required')
    if is_local and not primary_sources:
        errors.append('at least one primary source is required for local stories')
    if is_local and not locality:
        errors.append('Lower Mainland locality is required')
    if is_local and locality and locality.lower() not in _approved_localities():
        errors.append('locality is not in the approved Lower Mainland coverage area')
    if is_local and not str(article.get('lengthRationale', '')).strip():
        errors.append('length rationale is required for local stories')
    if is_local:
        highlights = article.get('highlights')
        minimum_highlights = formatting.get('minimumHighlights', 3)
        maximum_highlights = formatting.get('maximumHighlights', 5)
        if not isinstance(highlights, list):
            errors.append('article highlights are required for local stories')
        else:
            clean_highlights = [
                str(highlight).strip() for highlight in highlights
                if str(highlight).strip()
            ]
            if not minimum_highlights <= len(clean_highlights) <= maximum_highlights:
                errors.append(
                    f'local stories require {minimum_highlights}-{maximum_highlights} highlights'
                )
            if len(set(clean_highlights)) != len(clean_highlights):
                errors.append('article highlights must be unique')
        if (
            formatting.get('reportingMethodRequired')
            and not str(article.get('reportingMethod', '')).strip()
        ):
            errors.append('reporting method is required for local stories')
        utility_text = ' '.join(
            str(article.get(field, '') or '')
            for field in ('title', 'subtitle', 'readerImpact')
        ).lower()
        location_promise = bool(
            re.search(r'\b(where|location|locations|places|centres|centers)\b', utility_text)
        )
        if location_promise:
            headings = ' '.join(
                re.findall(r'^##\s+(.+)$', body, re.MULTILINE)
            ).lower()
            if not re.search(r'\b(where|find|location|locations|places)\b', headings):
                errors.append('location promise requires a find-or-location section')
            if list_count < 3:
                errors.append('location promise requires at least three concrete list items')
    if is_local:
        commercial_intent = str(article.get('commercialIntent', '')).strip()
        if commercial_intent not in monetization['commercialIntentValues']:
            errors.append('commercial intent is missing or unsupported')
        if not str(article.get('commercialFitReason', '')).strip():
            errors.append('commercial fit reason is required')
        expected_brand_safety = (
            'sensitive-owner-review'
            if article.get('manualApprovalRequired')
            else 'standard'
        )
        if article.get('brandSafety') != expected_brand_safety:
            errors.append(f'brand safety must be {expected_brand_safety}')
    sponsorship_status = str(article.get('sponsorshipStatus', '')).strip()
    if not sponsorship_status and not is_local:
        sponsorship_status = monetization['automatedDefaultSponsorshipStatus']
    if sponsorship_status not in monetization['sponsorshipStatusValues']:
        errors.append('sponsorship status is missing or unsupported')
    elif sponsorship_status != monetization['automatedDefaultSponsorshipStatus']:
        if not article.get('commercialApprovalRecorded'):
            errors.append('commercial coverage requires recorded owner approval')
    sensitive_text = ' '.join(
        str(article.get(field, '') or '')
        for field in ('title', 'subtitle', 'meta_description', 'body_mdx')
    ).lower()
    has_sensitive_signal = article.get('manualApprovalRequired') or any(
        str(keyword).lower() in sensitive_text
        for keyword in (sensitive_keywords or [])
    )
    if has_sensitive_signal and not article.get('manualApprovalRecorded'):
        errors.append('manual approval is required for this sensitive story')
    article_links = _article_links(body)
    unique_links = list(dict.fromkeys(link['path'] for link in article_links))
    if len(unique_links) < internal_link_range['min']:
        errors.append(
            f'only {len(unique_links)} contextual internal article links; '
            f"{internal_link_range['min']} required for {story_type}"
        )
    if len(unique_links) > internal_link_range['max']:
        errors.append(
            f'{len(unique_links)} contextual internal article links; '
            f"maximum is {internal_link_range['max']} for {story_type}"
        )
    forbidden_anchors = {anchor.lower() for anchor in link_contract['forbiddenAnchors']}
    current_path = f"{category}/{seo.get('slug', '')}".strip('/')
    for link in article_links:
        if link['anchor'].lower() in forbidden_anchors:
            errors.append(f"non-descriptive internal link anchor: {link['anchor']}")
        if link_contract['selfLinksForbidden'] and link['path'] == current_path:
            errors.append('article must not link to itself')
        if link_contract['mustResolveToPublishedArticle']:
            category_name, slug = link['path'].split('/', 1)
            if not (content_dir / category_name / f'{slug}.mdx').is_file():
                errors.append(f"internal link does not resolve to a published article: /{link['path']}")
    uncited = [url for url in source_urls if url not in body]
    if uncited:
        errors.append(f'{len(uncited)} source URLs are absent from the article body')
    if not str(seo.get('slug', '')).strip():
        errors.append('SEO slug is missing')
    image_path = str(image.get('path', '')).strip()
    if not image_path or 'placeholder' in image_path.lower():
        errors.append('non-placeholder image is required')

    return ValidationResult(passed=not errors, errors=errors)
