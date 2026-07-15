#!/usr/bin/env python3
"""Deterministic release-candidate checks that do not depend on an LLM."""

from dataclasses import dataclass
from typing import Dict, List
from urllib.parse import urlparse


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
    minimum_sources: int = 3,
) -> ValidationResult:
    errors: List[str] = []
    body = str(article.get('body_mdx', ''))
    words = len(body.split())
    source_urls = _valid_source_urls(sources)

    if not str(article.get('title', '')).strip():
        errors.append('title is missing')
    if not str(article.get('meta_description', '')).strip():
        errors.append('meta description is missing')
    if words < 600 or words > 1200:
        errors.append(f'word count is {words}; expected 600-1200')
    if body.count('\n## ') < 2:
        errors.append('fewer than two H2 sections')
    if body.count('—') > 2:
        errors.append('more than two em dashes')
    if len(source_urls) < minimum_sources:
        errors.append(f'only {len(source_urls)} valid source URLs; {minimum_sources} required')
    uncited = [url for url in source_urls if url not in body]
    if uncited:
        errors.append(f'{len(uncited)} source URLs are absent from the article body')
    if not str(seo.get('slug', '')).strip():
        errors.append('SEO slug is missing')
    image_path = str(image.get('path', '')).strip()
    if not image_path or 'placeholder' in image_path.lower():
        errors.append('non-placeholder image is required')

    return ValidationResult(passed=not errors, errors=errors)
