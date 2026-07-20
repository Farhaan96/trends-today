#!/usr/bin/env python3
"""Import Vercel Web Analytics page views into the scorecard contract."""

from __future__ import annotations

import argparse
import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable, Dict, List, Mapping, Optional
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


REPO_ROOT = Path(__file__).resolve().parents[2]
API_URL = 'https://api.vercel.com/v1/query/web-analytics/visits/aggregate'
ARTICLE_CATEGORIES = {
    'local-news',
    'transit',
    'things-to-do',
    'food-drink',
    'housing',
    'sports',
    'science',
    'technology',
    'space',
    'health',
    'psychology',
    'culture',
}
MISSING_COMMERCIAL_FIELDS = [
    'engaged sessions',
    'returning sessions',
    'scroll depth',
    'measurable ad impressions',
    'viewable ad impressions',
    'Active View rate',
    'ad revenue',
    'page RPM',
    'sponsor inquiries',
    'qualified sponsor inquiries',
    'sponsorship revenue',
    'content cost',
]


def _frontmatter_value(content: str, key: str) -> Optional[str]:
    match = re.search(rf"^{re.escape(key)}:\s*['\"]?([^'\"\r\n]+)", content, re.MULTILINE)
    return match.group(1).strip() if match else None


def discover_articles(content_dir: Path) -> List[Dict[str, Any]]:
    articles: List[Dict[str, Any]] = []
    for category in sorted(ARTICLE_CATEGORIES):
        category_dir = content_dir / category
        if not category_dir.exists():
            continue
        for file_path in sorted(category_dir.glob('*.mdx')):
            if file_path.name.lower().endswith('.backup.mdx'):
                continue
            content = file_path.read_text(encoding='utf-8-sig', errors='replace')[:5000]
            slug = _frontmatter_value(content, 'slug') or file_path.stem
            story_type = _frontmatter_value(content, 'storyType')
            articles.append({
                'path': f'/{category}/{slug}',
                'slug': slug,
                'category': category,
                'beat': category,
                'storyType': story_type,
                'publishedAt': _frontmatter_value(content, 'publishedAt'),
            })
    articles.sort(key=lambda article: article.get('publishedAt') or '', reverse=True)
    return articles


def _extract_page_views(payload: Mapping[str, Any]) -> Optional[float]:
    data = payload.get('data')
    if not isinstance(data, list) or not data:
        return None
    row = data[0]
    if not isinstance(row, Mapping):
        return None
    for key in ('pageViews', 'pageviews', 'page_views', 'views', 'visits', 'count', 'value'):
        value = row.get(key)
        if isinstance(value, bool) or value in (None, ''):
            continue
        try:
            return float(value)
        except (TypeError, ValueError):
            continue
    return None


def _request_page_views(
    *,
    request_path: str,
    since: str,
    until: str,
    project_id: str,
    token: str,
    team_id: Optional[str],
    team_slug: Optional[str],
    opener: Callable[..., Any],
    timeout_seconds: int = 30,
) -> Optional[float]:
    escaped_request_path = request_path.replace("'", "''")
    query = {
        'projectId': project_id,
        'since': since,
        'until': until,
        'by': 'requestPath',
        'filter': f"requestPath eq '{escaped_request_path}'",
        'limit': '1',
    }
    if team_id:
        query['teamId'] = team_id
    if team_slug:
        query['slug'] = team_slug

    request = Request(
        f'{API_URL}?{urlencode(query)}',
        headers={
            'Authorization': f'Bearer {token}',
            'Accept': 'application/json',
            'User-Agent': 'trends-today-weekly-growth-review',
        },
    )
    with opener(request, timeout=timeout_seconds) as response:
        payload = json.loads(response.read().decode('utf-8'))
    return _extract_page_views(payload)


def build_export(
    *,
    content_dir: Path,
    since: str,
    until: str,
    env: Mapping[str, str] = os.environ,
    opener: Callable[..., Any] = urlopen,
) -> Dict[str, Any]:
    articles = discover_articles(content_dir)
    token = env.get('VERCEL_ANALYTICS_TOKEN') or env.get('VERCEL_TOKEN')
    project_id = env.get('VERCEL_PROJECT_ID')
    team_id = env.get('VERCEL_TEAM_ID')
    team_slug = env.get('VERCEL_TEAM_SLUG')

    if not token or not project_id:
        return {
            'status': 'unavailable',
            'sources': [],
            'missing': [
                'VERCEL_TOKEN or VERCEL_ANALYTICS_TOKEN',
                'VERCEL_PROJECT_ID',
                *MISSING_COMMERCIAL_FIELDS,
            ],
            'decision': 'repair-measurement',
            'articles': [],
            'generatedAt': datetime.now(timezone.utc).isoformat(),
        }

    output_articles = []
    errors = []
    for article in articles:
        try:
            page_views = _request_page_views(
                request_path=article['path'],
                since=since,
                until=until,
                project_id=project_id,
                token=token,
                team_id=team_id,
                team_slug=team_slug,
                opener=opener,
            )
        except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as error:
            errors.append({'path': article['path'], 'error': error.__class__.__name__})
            page_views = None
        output_articles.append({
            **article,
            'pageViews': page_views,
            'engagedSessions': None,
            'returningSessions': None,
            'averageScrollDepth': None,
            'measurableAdImpressions': None,
            'viewableAdImpressions': None,
            'adRevenue': None,
            'sponsorInquiries': None,
            'qualifiedSponsorInquiries': None,
            'sponsorshipRevenue': None,
            'contentCost': None,
        })

    return {
        'status': 'available',
        'sources': ['vercel-web-analytics-visits-aggregate'],
        'since': since,
        'until': until,
        'articles': output_articles,
        'missing': MISSING_COMMERCIAL_FIELDS,
        'errors': errors,
        'generatedAt': datetime.now(timezone.utc).isoformat(),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description='Import Vercel Web Analytics page views')
    parser.add_argument('--content-dir', type=Path, default=REPO_ROOT / 'content')
    parser.add_argument('--since', required=True)
    parser.add_argument('--until', required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()

    payload = build_export(
        content_dir=args.content_dir,
        since=args.since,
        until=args.until,
    )
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, indent=2) + '\n', encoding='utf-8')
    print(f"Wrote Vercel analytics export to {args.output}")


if __name__ == '__main__':
    main()
