#!/usr/bin/env python3
"""Deterministic release-candidate checks that do not depend on an LLM."""

from dataclasses import dataclass
from typing import Dict, List
from urllib.parse import urlparse


LOCAL_CATEGORIES = {
    'local-news', 'transit', 'things-to-do', 'food-drink', 'housing', 'sports'
}
STORY_CONTRACTS = {
    'legacy': {'word_range': (600, 1200), 'minimum_sources': 3},
    'bulletin': {'word_range': (250, 450), 'minimum_sources': 1},
    'reported-update': {'word_range': (450, 800), 'minimum_sources': 2},
    'guide-or-explainer': {'word_range': (700, 1200), 'minimum_sources': 3},
}


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


def validate_release_candidate(
    article: Dict,
    sources: List[Dict],
    seo: Dict,
    image: Dict,
    minimum_sources: int = None,
    sensitive_keywords: List[str] = None,
) -> ValidationResult:
    errors: List[str] = []
    body = str(article.get('body_mdx', ''))
    words = len(body.split())
    source_urls = _valid_source_urls(sources)
    category = str(article.get('category', '')).lower()
    is_local = category in LOCAL_CATEGORIES
    story_type = str(
        article.get('storyType')
        or article.get('story_type')
        or ('reported-update' if is_local else 'legacy')
    )
    contract = STORY_CONTRACTS.get(story_type, STORY_CONTRACTS['legacy'])
    minimum_sources = minimum_sources or contract['minimum_sources']
    minimum_words, maximum_words = contract['word_range']
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
    if body.count('\n## ') < 2:
        errors.append('fewer than two H2 sections')
    if body.count('—') > (0 if is_local else 2):
        errors.append(
            'local stories must not use em dashes'
            if is_local else 'more than two em dashes'
        )
    if len(source_urls) < minimum_sources:
        errors.append(f'only {len(source_urls)} valid source URLs; {minimum_sources} required')
    if is_local and not primary_sources:
        errors.append('at least one primary source is required for local stories')
    if is_local and not str(article.get('locality', '')).strip():
        errors.append('Lower Mainland locality is required')
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
    uncited = [url for url in source_urls if url not in body]
    if uncited:
        errors.append(f'{len(uncited)} source URLs are absent from the article body')
    if not str(seo.get('slug', '')).strip():
        errors.append('SEO slug is missing')
    image_path = str(image.get('path', '')).strip()
    if not image_path or 'placeholder' in image_path.lower():
        errors.append('non-placeholder image is required')

    return ValidationResult(passed=not errors, errors=errors)
