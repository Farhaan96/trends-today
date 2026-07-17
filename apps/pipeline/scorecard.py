#!/usr/bin/env python3
"""Build an honest editorial scorecard from repository and optional analytics data."""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional

from metrics import build_metrics_summary


REPO_ROOT = Path(__file__).resolve().parents[2]
VALID_CATEGORIES = {
    'local-news', 'transit', 'things-to-do', 'food-drink', 'housing', 'sports',
    'science', 'culture', 'psychology', 'technology', 'health', 'space',
}


def _published_at(path: Path) -> Optional[str]:
    text = path.read_text(encoding='utf-8', errors='replace')[:4000]
    match = re.search(r"^publishedAt:\s*['\"]?([^'\"\r\n]+)", text, re.MULTILINE)
    return match.group(1).strip() if match else None


def build_scorecard(content_dir: Path, analytics: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    counts: Counter[str] = Counter()
    dates = []
    for category in sorted(VALID_CATEGORIES):
        category_dir = content_dir / category
        for article in category_dir.glob('*.mdx') if category_dir.exists() else []:
            if article.name.lower().endswith('.backup.mdx'):
                continue
            counts[category] += 1
            published = _published_at(article)
            if published:
                try:
                    parsed = datetime.fromisoformat(published.replace('Z', '+00:00'))
                    dates.append(parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc))
                except ValueError:
                    pass

    latest = max(dates) if dates else None
    now = datetime.now(timezone.utc)
    return {
        'generatedAt': now.isoformat(),
        'inventory': {
            'totalActiveArticles': sum(counts.values()),
            'byCategory': dict(counts),
            'lastPublishedAt': latest.isoformat() if latest else None,
            'daysSinceLastPublish': (now - latest).days if latest else None,
        },
        'analytics': build_metrics_summary(analytics, now=now),
        'decision': (
            'repair-measurement-while-running-bounded-local-sweeps'
            if not analytics or analytics.get('status') != 'available'
            else 'review-article-level-keep-repair-stop-decisions'
        ),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description='Build the Trends Today content scorecard')
    parser.add_argument('--content-dir', type=Path, default=REPO_ROOT / 'content')
    parser.add_argument('--analytics', type=Path)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()

    analytics = None
    if args.analytics:
        analytics = json.loads(args.analytics.read_text(encoding='utf-8'))
    payload = build_scorecard(args.content_dir, analytics)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, indent=2) + '\n', encoding='utf-8')
    print(f"Wrote scorecard to {args.output}")


if __name__ == '__main__':
    main()
