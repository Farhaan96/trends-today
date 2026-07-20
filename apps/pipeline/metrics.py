#!/usr/bin/env python3
"""Normalize article analytics and make evidence-bounded editorial decisions.

The input contract is deliberately provider-neutral so Search Console, GA4, or
an exported analytics file can be joined without treating missing values as 0.
"""

from __future__ import annotations

import statistics
from datetime import datetime, timezone
from typing import Any, Dict, Iterable, List, Optional


NUMERIC_FIELDS = (
    'impressions',
    'clicks',
    'pageViews',
    'engagedSessions',
    'returningSessions',
    'appCtaClicks',
    'averageScrollDepth',
    'measurableAdImpressions',
    'viewableAdImpressions',
    'adRevenue',
    'sponsorInquiries',
    'qualifiedSponsorInquiries',
    'sponsorshipRevenue',
    'revenue',
    'contentCost',
)


def _number(value: Any) -> Optional[float]:
    if value is None or value == '':
        return None
    if isinstance(value, bool):
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _parse_date(value: Any) -> Optional[datetime]:
    if not isinstance(value, str) or not value.strip():
        return None
    try:
        parsed = datetime.fromisoformat(value.strip().replace('Z', '+00:00'))
    except ValueError:
        return None
    return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)


def normalize_articles(records: Iterable[Dict[str, Any]]) -> List[Dict[str, Any]]:
    normalized: List[Dict[str, Any]] = []
    for record in records:
        item = {
            'path': record.get('path'),
            'slug': record.get('slug'),
            'beat': record.get('beat') or record.get('category') or 'unclassified',
            'category': record.get('category'),
            'publishedAt': record.get('publishedAt'),
        }
        for field in NUMERIC_FIELDS:
            item[field] = _number(record.get(field))

        impressions = item['impressions']
        clicks = item['clicks']
        item['ctr'] = clicks / impressions if impressions and clicks is not None else None
        measurable = item['measurableAdImpressions']
        viewable = item['viewableAdImpressions']
        item['activeViewRate'] = (
            viewable / measurable
            if measurable and viewable is not None
            else None
        )
        page_views = item['pageViews']
        item['pageRpm'] = (
            item['adRevenue'] * 1000 / page_views
            if page_views and item['adRevenue'] is not None
            else None
        )
        if item['revenue'] is None:
            known_revenue = [
                value
                for value in (item['adRevenue'], item['sponsorshipRevenue'])
                if value is not None
            ]
            item['revenue'] = sum(known_revenue) if known_revenue else None
        if item['revenue'] is not None and item['contentCost'] is not None:
            item['contribution'] = item['revenue'] - item['contentCost']
        else:
            item['contribution'] = None
        normalized.append(item)
    return normalized


def _median(items: Iterable[Dict[str, Any]], field: str) -> Optional[float]:
    values = [item[field] for item in items if item.get(field) is not None]
    return statistics.median(values) if values else None


def build_article_decisions(
    records: Iterable[Dict[str, Any]],
    *,
    now: Optional[datetime] = None,
    minimum_comparable: int = 5,
) -> List[Dict[str, Any]]:
    now = now or datetime.now(timezone.utc)
    articles = normalize_articles(records)
    mature = []
    for article in articles:
        published = _parse_date(article.get('publishedAt'))
        article['ageDays'] = (now - published).days if published else None
        if article['ageDays'] is not None and article['ageDays'] >= 28:
            mature.append(article)

    for article in articles:
        age = article['ageDays']
        if age is None:
            article['decision'] = 'repair-metadata'
            article['decisionReason'] = 'publishedAt is missing or invalid'
            continue
        if age < 7:
            article['decision'] = 'observe'
            article['decisionReason'] = 'first 7-day measurement window is incomplete'
            continue
        if age < 28:
            article['decision'] = 'observe'
            article['decisionReason'] = '28-day decision window is incomplete'
            continue

        cohort = [candidate for candidate in mature if candidate['beat'] == article['beat']]
        if len(cohort) < minimum_comparable:
            article['decision'] = 'collect-comparable-reps'
            article['decisionReason'] = (
                f"{len(cohort)} mature articles in beat; {minimum_comparable} required"
            )
            continue

        peers = [candidate for candidate in cohort if candidate is not article]
        engaged_median = _median(peers, 'engagedSessions')
        impression_median = _median(peers, 'impressions')
        ctr_median = _median(peers, 'ctr')

        if article['engagedSessions'] is None or article['impressions'] is None:
            article['decision'] = 'repair-measurement'
            article['decisionReason'] = 'required 28-day traffic metrics are unavailable'
        elif engaged_median is not None and article['engagedSessions'] >= engaged_median:
            article['decision'] = 'keep'
            article['decisionReason'] = 'engaged sessions meet or exceed the mature beat median'
        elif (
            impression_median is not None
            and article['impressions'] >= impression_median
            and ctr_median is not None
            and article['ctr'] is not None
            and article['ctr'] < ctr_median
        ):
            article['decision'] = 'repair'
            article['decisionReason'] = 'demand exists, but click-through trails the mature beat median'
        elif (
            engaged_median is not None
            and impression_median is not None
            and article['engagedSessions'] < engaged_median
            and article['impressions'] < impression_median
        ):
            article['decision'] = 'stop'
            article['decisionReason'] = 'both discovery and engaged sessions trail the mature beat median'
        else:
            article['decision'] = 'repair'
            article['decisionReason'] = 'performance is mixed; change one input and run another rep'

    return articles


def build_metrics_summary(
    analytics: Optional[Dict[str, Any]],
    *,
    now: Optional[datetime] = None,
    minimum_comparable: int = 5,
) -> Dict[str, Any]:
    if not analytics or analytics.get('status') != 'available':
        return {
            'status': 'unavailable',
            'missing': (analytics or {}).get('missing', [
                'article-level search impressions and clicks',
                'organic engaged sessions',
                'returning sessions',
                'app CTA clicks',
                'page views and ad revenue',
                'measurable and viewable ad impressions',
                'qualified sponsor inquiries',
            ]),
            'decision': 'repair-measurement',
            'articles': [],
        }

    decisions = build_article_decisions(
        analytics.get('articles', []),
        now=now,
        minimum_comparable=minimum_comparable,
    )
    return {
        'status': 'available',
        'sources': analytics.get('sources', []),
        'articles': decisions,
        'decisionCounts': {
            decision: sum(1 for article in decisions if article['decision'] == decision)
            for decision in sorted({article['decision'] for article in decisions})
        },
        'decision': 'review-article-level-decisions',
    }
