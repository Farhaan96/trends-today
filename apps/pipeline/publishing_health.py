#!/usr/bin/env python3
"""Build a deterministic publishing-health and analytics receipt.

The receipt answers one operational question per run: is the publication
actually shipping, is measurement actually connected, and what is the single
next editorial action. It reuses the existing metrics contract so unavailable
data stays unavailable and never becomes zero.

Design rules enforced here:

* a research workflow success is not publication proof;
* a draft pull request is neither publication nor traffic;
* only editorial article drafts, identified by ``isDraft`` plus a ``draft/`` head
  branch, can raise a stale or relevance-expired repair. Infrastructure, review,
  and other open pull requests are counted but never gate an article;
* each decision window is evaluated under its own maturity, so seven-day data
  never produces a keep or a stop using 28-day semantics;
* ``qualify`` requires explicit exact-candidate review evidence and is never
  inferred from research output;
* candidate evidence is only believed when the named candidate is an existing
  regular file inside the release-candidate root, its SHA-256 is recomputed from
  the exact bytes on disk, and both independent reviews bind to that recomputed
  digest and to the current repository HEAD;
* the optional reporting token is read from the environment, sent only as a
  bearer header, and never written to the receipt, the summary, or an error.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable, Dict, Iterable, List, Optional, Sequence, Tuple
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen

from metrics import build_metrics_summary, period_label_for
from vercel_analytics import discover_articles


REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_SITE_URL = 'https://www.trendstoday.ca'
DEFAULT_INVENTORY_PATH = '/api/analytics'
DEFAULT_REPORTING_PATH = '/api/analytics/reporting'
DEFAULT_TOKEN_ENV = 'ANALYTICS_REPORTING_TOKEN'
DEFAULT_ATTEMPTS = 3
DEFAULT_BACKOFF_SECONDS = 2.0
DEFAULT_TIMEOUT_SECONDS = 20
DEFAULT_FRESHNESS_TARGET_HOURS = 24
DEFAULT_STALE_PUBLICATION_HOURS = 48
DEFAULT_STALE_DRAFT_DAYS = 7
DEFAULT_RELEVANCE_EXPIRY_DAYS = 14
REDACTED = '[redacted]'
MISSING_RULE = 'Unavailable metrics are null and are never represented as zero.'
RESEARCH_WORKFLOW_PATH = '.github/workflows/daily-content.yml'
RESEARCH_WORKFLOW_NAME = 'Daily Content Opportunity Research'
UNJOINED_COMMERCIAL_FIELDS = [
    'app CTA clicks',
    'measurable ad impressions',
    'viewable ad impressions',
    'ad revenue',
    'sponsor inquiries',
    'qualified sponsor inquiries',
    'sponsorship revenue',
    'content cost',
]
GPT_SCORE_FIELDS = (
    'factualSupport',
    'quality',
    'readability',
    'formatting',
    'engagement',
)
APPROVED_RELEASE_MODEL = 'claude-opus-5'
DECISION_PERIOD_MATURITY_DAYS = {'day7': 7, 'day28': 28}
# An editorial article draft is identified by branch convention, not by being an
# open pull request. Infrastructure, review-evidence, and monitored-inbox pull
# requests are reported for observability but never gate an article.
ARTICLE_DRAFT_BRANCH_PREFIX = 'draft/'
ARTICLE_DRAFT_TITLE_PREFIX = 'draft cos-'
CANDIDATE_ROOT_PARTS = ('artifacts', 'editorial', 'release-candidates')
CANDIDATE_ROOT_LABEL = '/'.join(CANDIDATE_ROOT_PARTS)
HEX_DIGITS = frozenset('0123456789abcdef')


class PublishingHealthError(RuntimeError):
    """A bounded, visible operational failure while building the receipt."""

    def __init__(self, message: str, *, status: Optional[int] = None):
        super().__init__(message)
        self.status = status


def _redact(text: Any, token: Optional[str]) -> str:
    value = str(text)
    if token and token.strip():
        value = value.replace(token, REDACTED).replace(token.strip(), REDACTED)
    return value


def _parse_date(value: Any) -> Optional[datetime]:
    if not isinstance(value, str) or not value.strip():
        return None
    try:
        parsed = datetime.fromisoformat(value.strip().replace('Z', '+00:00'))
    except ValueError:
        return None
    return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)


def _normalize_path(value: Any) -> Optional[str]:
    if not isinstance(value, str) or not value.strip():
        return None
    candidate = value.strip()
    if '://' in candidate:
        candidate = urlparse(candidate).path or '/'
    if not candidate.startswith('/'):
        candidate = f'/{candidate}'
    if len(candidate) > 1:
        candidate = candidate.rstrip('/')
    return candidate


def _number(value: Any) -> Optional[float]:
    if value is None or value == '' or isinstance(value, bool):
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def fetch_json(
    url: str,
    *,
    token: Optional[str] = None,
    opener: Callable[..., Any] = urlopen,
    attempts: int = DEFAULT_ATTEMPTS,
    backoff_seconds: float = DEFAULT_BACKOFF_SECONDS,
    sleeper: Callable[[float], Any] = time.sleep,
    timeout_seconds: int = DEFAULT_TIMEOUT_SECONDS,
) -> Dict[str, Any]:
    """Fetch JSON with bounded retries. Client errors never retry."""
    headers = {
        'Accept': 'application/json',
        'User-Agent': 'trends-today-publishing-health',
    }
    if token and token.strip():
        headers['Authorization'] = f'Bearer {token.strip()}'

    last_status: Optional[int] = None
    last_reason = 'unknown'
    total = max(1, int(attempts))
    for attempt in range(total):
        try:
            request = Request(url, headers=headers)
            with opener(request, timeout=timeout_seconds) as response:
                body = response.read()
            return json.loads(body.decode('utf-8'))
        except HTTPError as error:
            last_status = int(error.code)
            last_reason = f'http_{error.code}'
            if 400 <= last_status < 500:
                break
        except (URLError, TimeoutError, OSError) as error:
            last_reason = f'transport_{error.__class__.__name__}'
        except (json.JSONDecodeError, UnicodeDecodeError):
            last_reason = 'malformed_json_body'
        if attempt < total - 1:
            sleeper(backoff_seconds * (2**attempt))

    raise PublishingHealthError(
        _redact(
            f'{url} did not return usable JSON after {attempt + 1} attempts ({last_reason})',
            token,
        ),
        status=last_status,
    )


def fetch_inventory(url: str, **kwargs: Any) -> Dict[str, Any]:
    """Fetch and shape-check the public article inventory endpoint."""
    payload = fetch_json(url, **kwargs)
    if not isinstance(payload, dict) or not payload.get('success'):
        raise PublishingHealthError(f'{url} did not return a successful analytics payload')
    data = payload.get('data')
    if not isinstance(data, dict):
        raise PublishingHealthError(f'{url} did not return an analytics data object')
    content = data.get('content')
    if not isinstance(content, dict) or not isinstance(content.get('totalArticles'), int):
        raise PublishingHealthError(f'{url} did not return a content inventory with totalArticles')
    return data


def fetch_reporting(
    url: str,
    *,
    token: Optional[str],
    **kwargs: Any,
) -> Tuple[Optional[Dict[str, Any]], Dict[str, Any]]:
    """Fetch the protected reporting snapshot only when a token is supplied."""
    if not token or not token.strip():
        return None, {'status': 'unavailable', 'reason': 'reporting-token-not-provided'}

    try:
        payload = fetch_json(url, token=token, **kwargs)
    except PublishingHealthError as error:
        if error.status == 503:
            return None, {
                'status': 'unavailable',
                'reason': 'reporting-not-configured-on-the-server',
            }
        if error.status in (401, 403):
            return None, {
                'status': 'error',
                'reason': 'reporting-token-was-rejected',
            }
        return None, {
            'status': 'error',
            'reason': _redact(str(error), token),
        }

    data = payload.get('data') if isinstance(payload, dict) else None
    if not isinstance(payload, dict) or not payload.get('success') or not isinstance(data, dict):
        return None, {
            'status': 'error',
            'reason': 'reporting-endpoint-returned-an-unexpected-payload',
        }
    return data, {'status': 'available', 'reason': None}


def summarize_publication(
    inventory: Dict[str, Any],
    *,
    now: datetime,
    repository_articles: Optional[Sequence[Dict[str, Any]]] = None,
    site_url: str = DEFAULT_SITE_URL,
    freshness_target_hours: int = DEFAULT_FRESHNESS_TARGET_HOURS,
    stale_publication_hours: int = DEFAULT_STALE_PUBLICATION_HOURS,
) -> Dict[str, Any]:
    content = inventory.get('content') or {}
    recent = [item for item in content.get('recentArticles') or [] if isinstance(item, dict)]
    recent.sort(key=lambda item: _parse_date(item.get('publishedAt')) or datetime.min.replace(tzinfo=timezone.utc), reverse=True)

    newest: Optional[Dict[str, Any]] = None
    freshness: Dict[str, Any] = {
        'status': 'unavailable',
        'reason': 'the live inventory did not expose a dated article',
        'ageHours': None,
        'targetHours': freshness_target_hours,
        'staleAfterHours': stale_publication_hours,
    }
    if recent:
        top = recent[0]
        published = _parse_date(top.get('publishedAt'))
        category = str(top.get('category') or '').strip()
        slug = str(top.get('slug') or '').strip()
        newest = {
            'slug': slug or None,
            'title': top.get('title'),
            'category': category or None,
            'publishedAt': top.get('publishedAt'),
            'canonicalUrl': f'{site_url.rstrip("/")}/{category}/{slug}' if category and slug else None,
        }
        if published:
            age_hours = int((now - published).total_seconds() // 3600)
            freshness = {
                'status': 'stale' if age_hours > stale_publication_hours else 'fresh',
                'reason': None,
                'ageHours': age_hours,
                'targetHours': freshness_target_hours,
                'staleAfterHours': stale_publication_hours,
            }

    live_count = content.get('totalArticles')
    repository_count = len(repository_articles) if repository_articles is not None else None
    return {
        'status': 'available',
        'totalArticles': live_count,
        'byCategory': content.get('byCategory') or {},
        'newestArticle': newest,
        'freshness': freshness,
        'deployment': {
            'liveArticleCount': live_count,
            'repositoryArticleCount': repository_count,
            'drift': (
                bool(repository_count is not None and live_count is not None and repository_count != live_count)
            ),
            'note': 'A repository article is only live after merge, deployment, and verification.',
        },
    }


def _provider_entry(
    *,
    configuration: Any,
    report: Optional[Dict[str, Any]],
    window: Optional[Dict[str, Any]],
    retrieved_at: Optional[str],
    fallback_reason: str,
) -> Dict[str, Any]:
    if isinstance(report, dict) and report.get('status') == 'available':
        return {
            'status': 'available',
            'configuration': configuration,
            'reason': None,
            'totals': report.get('totals'),
            'window': window,
            'retrievedAt': retrieved_at,
        }
    reason = (report or {}).get('reason') if isinstance(report, dict) else None
    return {
        'status': (report or {}).get('status', 'unavailable') if isinstance(report, dict) else 'unavailable',
        'configuration': configuration,
        'reason': reason or fallback_reason,
        'totals': None,
        'window': window,
        'retrievedAt': retrieved_at,
    }


def summarize_analytics(
    inventory: Dict[str, Any],
    reporting: Optional[Dict[str, Any]],
    reporting_availability: Dict[str, Any],
) -> Dict[str, Any]:
    measurement = inventory.get('measurement') or {}
    windows = (reporting or {}).get('windows') or {}
    retrieved_at = (reporting or {}).get('generatedAt')
    fallback_reason = reporting_availability.get('reason') or 'protected reporting was not retrieved'

    providers = {
        'vercelWebAnalytics': {
            'status': 'unavailable',
            'configuration': (measurement.get('vercelWebAnalytics') or {}).get('status'),
            'reason': 'provider page-view data is not exposed by the repository endpoint',
            'totals': None,
            'window': None,
            'retrievedAt': None,
        },
        'googleAnalytics': _provider_entry(
            configuration=(measurement.get('googleAnalytics') or {}).get('dataExportStatus'),
            report=(reporting or {}).get('googleAnalytics'),
            window=windows.get('googleAnalytics'),
            retrieved_at=retrieved_at,
            fallback_reason=fallback_reason,
        ),
        'googleSearchConsole': _provider_entry(
            configuration=(measurement.get('googleSearchConsole') or {}).get('dataExportStatus'),
            report=(reporting or {}).get('googleSearchConsole'),
            window=windows.get('googleSearchConsole'),
            retrieved_at=retrieved_at,
            fallback_reason=fallback_reason,
        ),
        'protectedReporting': {
            'status': reporting_availability.get('status', 'unavailable'),
            'configuration': (measurement.get('protectedReporting') or {}).get('status'),
            'reason': reporting_availability.get('reason'),
            'totals': None,
            'window': None,
            'retrievedAt': retrieved_at,
        },
    }

    measured = [providers['googleAnalytics']['status'], providers['googleSearchConsole']['status']]
    available = measured.count('available')
    if 'error' in measured or providers['protectedReporting']['status'] == 'error':
        status = 'error'
    elif available == 2:
        status = 'available'
    elif available == 1:
        status = 'partial'
    else:
        status = 'unavailable'

    return {
        'status': status,
        'providers': providers,
        'missingRule': MISSING_RULE,
    }


def analytics_payload_from_reporting(
    reporting: Optional[Dict[str, Any]],
    articles: Sequence[Dict[str, Any]],
    *,
    period: str,
) -> Optional[Dict[str, Any]]:
    """Join reported page rows onto repository articles in the metrics contract."""
    block = ((reporting or {}).get('periods') or {}).get(period) or {}
    analytics_block = block.get('googleAnalytics') if isinstance(block.get('googleAnalytics'), dict) else None
    search_block = block.get('googleSearchConsole') if isinstance(block.get('googleSearchConsole'), dict) else None
    if not analytics_block and not search_block:
        return None

    analytics_rows: Dict[str, Dict[str, Any]] = {}
    for row in (analytics_block or {}).get('pages') or []:
        path = _normalize_path(row.get('path') or row.get('pagePath'))
        if path:
            analytics_rows[path] = row
    search_rows: Dict[str, Dict[str, Any]] = {}
    for row in (search_block or {}).get('pages') or []:
        path = _normalize_path(row.get('url') or row.get('page'))
        if path:
            search_rows[path] = row

    sources: List[str] = []
    missing = list(UNJOINED_COMMERCIAL_FIELDS)
    if analytics_block:
        sources.append('google-analytics-page-report')
    else:
        missing.insert(0, 'organic engaged sessions and returning sessions')
    if search_block:
        sources.append('search-console-page-report')
    else:
        missing.insert(0, 'search impressions and clicks')

    joined: List[Dict[str, Any]] = []
    for article in articles:
        path = _normalize_path(article.get('path'))
        analytics_row = analytics_rows.get(path or '')
        search_row = search_rows.get(path or '')
        joined.append({
            'path': path,
            'slug': article.get('slug'),
            'category': article.get('category'),
            'beat': article.get('beat') or article.get('category'),
            'publishedAt': article.get('publishedAt'),
            'pageViews': _number((analytics_row or {}).get('pageViews')),
            'engagedSessions': _number((analytics_row or {}).get('engagedSessions')),
            'returningSessions': _number((analytics_row or {}).get('returningSessions')),
            'impressions': _number((search_row or {}).get('impressions')),
            'clicks': _number((search_row or {}).get('clicks')),
            # Search Console reports page-level CTR directly. Carrying it
            # through keeps the low-click-through repair decision reachable even
            # when a row omits one of its components. An absent CTR stays None.
            'ctr': _number((search_row or {}).get('ctr')),
        })

    window = (analytics_block or search_block or {}).get('window')
    return {
        'status': 'available',
        'sources': sources,
        'window': window,
        'missing': missing,
        'articles': joined,
    }


def build_article_decision_windows(
    reporting: Optional[Dict[str, Any]],
    articles: Sequence[Dict[str, Any]],
    *,
    now: datetime,
    minimum_comparable: int = 5,
) -> Dict[str, Any]:
    windows: Dict[str, Any] = {}
    for period, maturity_days in DECISION_PERIOD_MATURITY_DAYS.items():
        label = period_label_for(maturity_days)
        payload = analytics_payload_from_reporting(reporting, articles, period=period)
        if payload is None:
            windows[period] = {
                'status': 'unavailable',
                'reason': (
                    f'{period} page-level analytics window is not present in the '
                    'protected reporting snapshot'
                ),
                'window': None,
                'period': label,
                'maturityDays': maturity_days,
                'sources': [],
                'missing': ['search impressions and clicks', 'organic engaged sessions and returning sessions', *UNJOINED_COMMERCIAL_FIELDS],
                'decision': 'repair-measurement',
                'decisionCounts': {},
                'articles': [],
            }
            continue
        # Each window is evaluated under its own maturity. Seven-day rows are
        # never judged with 28-day semantics.
        summary = build_metrics_summary(
            payload,
            now=now,
            minimum_comparable=minimum_comparable,
            maturity_days=maturity_days,
            period_label=label,
        )
        windows[period] = {
            'status': summary['status'],
            'reason': None,
            'window': payload['window'],
            'period': label,
            'maturityDays': maturity_days,
            'sources': summary.get('sources', []),
            'missing': payload['missing'],
            'decision': summary['decision'],
            'decisionCounts': summary.get('decisionCounts', {}),
            'articles': summary['articles'],
        }
    return windows


def is_article_draft(pull_request: Dict[str, Any]) -> bool:
    """Report whether one open pull request is an editorial article draft.

    The canonical convention is ``isDraft`` true and a head branch that begins
    ``draft/``. The title prefix ``Draft COS-`` is a defensive fallback used only
    when the head ref is absent from the metadata. Everything else, including
    growth-review evidence, infrastructure work, monitored-inbox branches, and
    ordinary non-draft pull requests, is not an article draft and therefore never
    contributes a stale or relevance-expired reason.
    """
    if not bool(pull_request.get('isDraft')):
        return False
    head_ref = pull_request.get('headRefName')
    head_ref = head_ref.strip() if isinstance(head_ref, str) else ''
    if head_ref:
        return head_ref.lower().startswith(ARTICLE_DRAFT_BRANCH_PREFIX)
    title = pull_request.get('title')
    title = title.strip() if isinstance(title, str) else ''
    return title.lower().startswith(ARTICLE_DRAFT_TITLE_PREFIX)


def summarize_drafts(
    drafts: Optional[Iterable[Dict[str, Any]]],
    *,
    now: datetime,
    stale_draft_days: int = DEFAULT_STALE_DRAFT_DAYS,
    relevance_expiry_days: int = DEFAULT_RELEVANCE_EXPIRY_DAYS,
) -> Dict[str, Any]:
    """Summarize open pull requests using metadata only. Bodies are never copied.

    Every open pull request is kept for observability, but only article drafts
    feed the stale and relevance-expiry disposition. An unrelated infrastructure
    or review pull request must never force an editorial repair day.
    """
    if drafts is None:
        return {
            'status': 'unavailable',
            'reason': 'pull-request metadata was not supplied to this run',
            'openCount': None,
            'articleDraftCount': None,
            'pullRequests': [],
            'articleDrafts': [],
            'stale': [],
            'relevanceExpired': [],
            'staleAfterDays': stale_draft_days,
            'relevanceExpiryDays': relevance_expiry_days,
            'articleDraftConvention': (
                f'isDraft true and headRefName beginning "{ARTICLE_DRAFT_BRANCH_PREFIX}"'
            ),
            'publicationEvidence': 'not-published',
            'trafficEvidence': 'not-traffic',
        }

    records: List[Dict[str, Any]] = []
    article_drafts: List[Any] = []
    stale: List[Any] = []
    expired: List[Any] = []
    for draft in drafts:
        created = _parse_date(draft.get('createdAt'))
        updated = _parse_date(draft.get('updatedAt')) or created
        age_days = int((now - created).days) if created else None
        idle_days = int((now - updated).days) if updated else None
        article_draft = is_article_draft(draft)
        is_stale = (
            article_draft and idle_days is not None and idle_days >= stale_draft_days
        )
        is_expired = (
            article_draft and age_days is not None and age_days >= relevance_expiry_days
        )
        number = draft.get('number')
        if article_draft:
            article_drafts.append(number)
        if is_stale:
            stale.append(number)
        if is_expired:
            expired.append(number)
        records.append({
            'number': number,
            'title': draft.get('title'),
            'headRefName': draft.get('headRefName'),
            'isDraft': bool(draft.get('isDraft')),
            'articleDraft': article_draft,
            'createdAt': draft.get('createdAt'),
            'updatedAt': draft.get('updatedAt'),
            'url': draft.get('url'),
            'ageDays': age_days,
            'idleDays': idle_days,
            'stale': is_stale,
            'relevanceExpired': is_expired,
        })

    return {
        'status': 'available',
        'reason': None,
        'openCount': len(records),
        'articleDraftCount': len(article_drafts),
        'pullRequests': records,
        'articleDrafts': article_drafts,
        'stale': stale,
        'relevanceExpired': expired,
        'staleAfterDays': stale_draft_days,
        'relevanceExpiryDays': relevance_expiry_days,
        'articleDraftConvention': (
            f'isDraft true and headRefName beginning "{ARTICLE_DRAFT_BRANCH_PREFIX}"'
        ),
        'publicationEvidence': 'not-published',
        'trafficEvidence': 'not-traffic',
    }


def summarize_research(research: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    if not research:
        return {
            'status': 'unavailable',
            'reason': 'research workflow metadata was not supplied to this run',
            'workflow': RESEARCH_WORKFLOW_NAME,
            'path': RESEARCH_WORKFLOW_PATH,
            'conclusion': None,
            'completedAt': None,
            'url': None,
            'publicationEvidence': 'research-only',
        }
    return {
        'status': 'available',
        'reason': None,
        'workflow': research.get('workflow') or research.get('name') or RESEARCH_WORKFLOW_NAME,
        'path': research.get('path') or RESEARCH_WORKFLOW_PATH,
        'conclusion': research.get('conclusion'),
        'completedAt': research.get('completedAt') or research.get('updatedAt'),
        'url': research.get('url'),
        'queuedCandidates': research.get('queuedCandidates'),
        'publicationEvidence': 'research-only',
    }


def resolve_repository_head(repo_root: Path) -> Optional[str]:
    """Return the exact current repository HEAD, or None when it is unverifiable.

    This mirrors the review-verifier convention in ``review.py``. It is the
    default implementation of the head seam, so callers and tests can supply an
    exact HEAD without shelling out. Any failure returns None, which the caller
    treats as a blocking reason rather than as agreement.
    """
    try:
        completed = subprocess.run(
            ['git', 'rev-parse', 'HEAD'],
            cwd=str(repo_root),
            capture_output=True,
            text=True,
        )
    except OSError:
        return None
    if completed.returncode != 0:
        return None
    return completed.stdout.strip() or None


def _resolve_head_value(
    resolver: Callable[[Path], Optional[str]],
    repo_root: Path,
) -> Optional[str]:
    """Call the head seam and normalize its answer. Any failure means unverified."""
    try:
        head = resolver(Path(repo_root))
    except Exception:  # noqa: BLE001 - an unverifiable HEAD must never qualify
        return None
    head = str(head).strip() if head else ''
    return head or None


def _verify_candidate_file(
    path_value: str,
    repo_root: Path,
) -> Tuple[Optional[Path], Optional[Path], Optional[str]]:
    """Constrain a declared path to an existing release-candidate file.

    Returns ``(resolved, repo_relative, reason)``. ``reason`` is set whenever the
    declared path escapes the release-candidate root, is not a
    ``<category>/<slug>.mdx`` name, or is not an existing regular file.
    """
    root = Path(repo_root).resolve()
    candidate_root = root.joinpath(*CANDIDATE_ROOT_PARTS).resolve()
    declared = Path(path_value)
    resolved = (declared if declared.is_absolute() else root / declared).resolve()

    try:
        relative = resolved.relative_to(candidate_root)
    except ValueError:
        return None, None, f'candidatePath is outside {CANDIDATE_ROOT_LABEL}'
    if len(relative.parts) != 2 or relative.suffix.lower() != '.mdx':
        return None, None, 'candidatePath must be <category>/<slug>.mdx'
    if not resolved.is_file():
        return None, None, 'candidatePath is not an existing regular file'
    return resolved, Path(*CANDIDATE_ROOT_PARTS) / relative, None


def _binding_reasons(
    label: str,
    review: Dict[str, Any],
    file_digest: Optional[str],
    head: Optional[str],
) -> List[str]:
    """Require one review to bind to the recomputed digest and the current HEAD."""
    reasons: List[str] = []
    review_digest = str(review.get('candidateSha256') or '').strip().lower()
    if not file_digest or review_digest != file_digest:
        reasons.append(f'{label} is not bound to the exact candidate SHA-256')

    review_head = str(review.get('repositorySha') or '').strip()
    if not review_head:
        reasons.append(f'{label} is missing repositorySha')
    elif head and review_head != head:
        reasons.append(f'{label} was created for a different repository SHA')
    return reasons


def evaluate_candidate_eligibility(
    candidate: Optional[Dict[str, Any]],
    *,
    repo_root: Path = REPO_ROOT,
    head_resolver: Optional[Callable[[Path], Optional[str]]] = None,
) -> Dict[str, Any]:
    """Report whether supplied review evidence binds to one exact candidate.

    This never runs or synthesizes a review. It proves that the named candidate
    exists inside the release-candidate root, recomputes its SHA-256 from the
    exact bytes on disk, and requires the declared digest and both independent
    review bindings to equal that recomputed digest. It also requires both
    reviews to carry a ``repositorySha`` equal to the current repository HEAD.
    Every unverifiable input is a blocking reason, never a silent pass.
    """
    if not candidate:
        return {
            'status': 'none',
            'reasons': [],
            'candidatePath': None,
            'candidateSha256': None,
            'repositorySha': None,
        }

    reasons: List[str] = []
    path = str(candidate.get('candidatePath') or '').strip()
    declared_digest = str(candidate.get('candidateSha256') or '').strip().lower()
    if not path:
        reasons.append('candidatePath is missing')
    if len(declared_digest) != 64 or not set(declared_digest) <= HEX_DIGITS:
        reasons.append('candidateSha256 is missing or is not a SHA-256 digest')

    relative_path: Optional[Path] = None
    file_digest: Optional[str] = None
    if path:
        resolved, relative_path, path_reason = _verify_candidate_file(path, repo_root)
        if path_reason:
            reasons.append(path_reason)
        else:
            try:
                file_digest = hashlib.sha256(resolved.read_bytes()).hexdigest()
            except OSError:
                reasons.append('candidate file could not be read to recompute its SHA-256')
    if file_digest and file_digest != declared_digest:
        reasons.append('candidateSha256 does not match the SHA-256 of the candidate file')

    head = _resolve_head_value(head_resolver or resolve_repository_head, repo_root)
    if not head:
        reasons.append('the current repository SHA could not be verified')

    validation = candidate.get('validation')
    if not isinstance(validation, dict) or validation.get('passed') is not True:
        reasons.append('deterministic validation did not pass')

    gpt = candidate.get('gptReview')
    if not isinstance(gpt, dict):
        reasons.append('gpt editorial review evidence is missing')
    else:
        if gpt.get('verdict') != 'PASS':
            reasons.append('gpt editorial review did not return PASS')
        reasons.extend(_binding_reasons('gpt review', gpt, file_digest, head))
        scores = gpt.get('scores')
        if not isinstance(scores, dict) or set(scores) != set(GPT_SCORE_FIELDS):
            reasons.append('gpt review is missing the complete editorial scorecard')
        else:
            for field in GPT_SCORE_FIELDS:
                value = scores[field]
                if type(value) is not int or value < 4 or value > 5:
                    reasons.append(f'gpt editorial score {field} is below 4')
        if gpt.get('blockers') != []:
            reasons.append('gpt editorial review reported blockers')
        if gpt.get('proseEmDashCount') != 0:
            reasons.append('gpt review reported an em dash in article prose')

    claude = candidate.get('claudeReview')
    if not isinstance(claude, dict):
        reasons.append('claude release review evidence is missing')
    else:
        if claude.get('verdict') != 'NO BLOCKERS':
            reasons.append('claude release review did not return NO BLOCKERS')
        reasons.extend(_binding_reasons('claude review', claude, file_digest, head))
        if str(claude.get('modelUsed') or '').strip().lower() != APPROVED_RELEASE_MODEL:
            reasons.append(f'release review must use {APPROVED_RELEASE_MODEL}')

    return {
        'status': 'ineligible' if reasons else 'eligible',
        'reasons': reasons,
        'candidatePath': relative_path.as_posix() if relative_path else (path or None),
        'candidateSha256': file_digest or declared_digest or None,
        'repositorySha': head,
    }


def _decide(
    publication: Dict[str, Any],
    analytics: Dict[str, Any],
    research: Dict[str, Any],
    drafts: Dict[str, Any],
    candidate: Dict[str, Any],
) -> Dict[str, Any]:
    failed: List[Dict[str, Any]] = []
    warnings: List[Dict[str, Any]] = []

    if publication['freshness']['status'] == 'stale':
        failed.append({
            'check': 'publication-freshness',
            'detail': (
                f"newest live article is {publication['freshness']['ageHours']} hours old; "
                f"stale after {publication['freshness']['staleAfterHours']} hours"
            ),
        })
    elif publication['freshness']['status'] == 'unavailable':
        warnings.append({'check': 'publication-freshness', 'detail': publication['freshness']['reason']})

    for name, provider in analytics['providers'].items():
        if provider['status'] == 'error':
            failed.append({'check': 'analytics-provider-error', 'detail': f'{name}: {provider["reason"]}'})
        elif provider['status'] != 'available':
            warnings.append({'check': 'analytics-unavailable', 'detail': f'{name}: {provider["reason"]}'})

    if research['status'] == 'available' and research['conclusion'] not in (None, 'success'):
        failed.append({
            'check': 'research-workflow',
            'detail': f'last {research["workflow"]} run concluded {research["conclusion"]}',
        })

    if drafts['status'] == 'available' and (drafts['stale'] or drafts['relevanceExpired']):
        failed.append({
            'check': 'stale-drafts',
            'detail': (
                f'stale article drafts {drafts["stale"] or []}; '
                f'relevance-expired article drafts {drafts["relevanceExpired"] or []}'
            ),
        })
    elif drafts['status'] != 'available':
        warnings.append({'check': 'draft-metadata', 'detail': drafts['reason']})

    if candidate['status'] == 'ineligible':
        failed.append({
            'check': 'candidate-eligibility',
            'detail': '; '.join(candidate['reasons']),
        })

    if publication['deployment']['drift']:
        warnings.append({
            'check': 'deployment-drift',
            'detail': (
                f"live inventory reports {publication['deployment']['liveArticleCount']} articles; "
                f"the repository holds {publication['deployment']['repositoryArticleCount']}"
            ),
        })

    if failed:
        return {
            'action': 'repair',
            'reason': f'repair the narrowest failed check first: {failed[0]["detail"]}',
            'candidatePath': None,
            'failedChecks': failed,
            'warnings': warnings,
        }
    if candidate['status'] == 'eligible':
        return {
            'action': 'qualify',
            'reason': 'one exact-reviewed candidate has complete GPT and Claude release evidence',
            'candidatePath': candidate['candidatePath'],
            'failedChecks': [],
            'warnings': warnings,
        }
    return {
        'action': 'skip',
        'reason': (
            'no eligible reviewed candidate was supplied; research output alone never qualifies a story'
        ),
        'candidatePath': None,
        'failedChecks': [],
        'warnings': warnings,
    }


def build_receipt(
    *,
    inventory: Dict[str, Any],
    reporting: Optional[Dict[str, Any]] = None,
    reporting_availability: Optional[Dict[str, Any]] = None,
    repository_articles: Optional[Sequence[Dict[str, Any]]] = None,
    research: Optional[Dict[str, Any]] = None,
    drafts: Optional[Iterable[Dict[str, Any]]] = None,
    candidate: Optional[Dict[str, Any]] = None,
    now: Optional[datetime] = None,
    site_url: str = DEFAULT_SITE_URL,
    freshness_target_hours: int = DEFAULT_FRESHNESS_TARGET_HOURS,
    stale_publication_hours: int = DEFAULT_STALE_PUBLICATION_HOURS,
    stale_draft_days: int = DEFAULT_STALE_DRAFT_DAYS,
    relevance_expiry_days: int = DEFAULT_RELEVANCE_EXPIRY_DAYS,
    minimum_comparable: int = 5,
    repo_root: Path = REPO_ROOT,
    head_resolver: Optional[Callable[[Path], Optional[str]]] = None,
) -> Dict[str, Any]:
    now = now or datetime.now(timezone.utc)
    data = inventory.get('data') if isinstance(inventory.get('data'), dict) else inventory
    availability = reporting_availability or {
        'status': 'unavailable',
        'reason': 'reporting-token-not-provided',
    }
    articles = list(repository_articles or [])

    publication = summarize_publication(
        data,
        now=now,
        repository_articles=repository_articles,
        site_url=site_url,
        freshness_target_hours=freshness_target_hours,
        stale_publication_hours=stale_publication_hours,
    )
    analytics = summarize_analytics(data, reporting, availability)
    decisions = build_article_decision_windows(
        reporting,
        articles,
        now=now,
        minimum_comparable=minimum_comparable,
    )
    research_summary = summarize_research(research)
    drafts_summary = summarize_drafts(
        drafts,
        now=now,
        stale_draft_days=stale_draft_days,
        relevance_expiry_days=relevance_expiry_days,
    )
    candidate_summary = evaluate_candidate_eligibility(
        candidate,
        repo_root=repo_root,
        head_resolver=head_resolver,
    )
    disposition = _decide(publication, analytics, research_summary, drafts_summary, candidate_summary)

    return {
        'version': 1,
        'status': 'receipt-complete',
        'generatedAt': now.isoformat(),
        'siteUrl': site_url,
        'publication': publication,
        'analytics': analytics,
        'articleDecisions': decisions,
        'research': research_summary,
        'drafts': drafts_summary,
        'candidate': candidate_summary,
        'disposition': disposition,
        'contract': {
            'workflowSuccessIsNotPublicationProof': True,
            'draftPullRequestIsNotTraffic': True,
            'qualifyRequiresExactCandidateReviewEvidence': True,
            'missingRule': MISSING_RULE,
        },
    }


def build_error_receipt(message: str, *, now: datetime, site_url: str = DEFAULT_SITE_URL) -> Dict[str, Any]:
    return {
        'version': 1,
        'status': 'error',
        'generatedAt': now.isoformat(),
        'siteUrl': site_url,
        'error': message,
        'publication': None,
        'analytics': None,
        'articleDecisions': None,
        'research': None,
        'drafts': None,
        'candidate': None,
        'disposition': {
            'action': 'repair',
            'reason': f'the receipt could not be built: {message}',
            'candidatePath': None,
            'failedChecks': [{'check': 'receipt-build', 'detail': message}],
            'warnings': [],
        },
        'contract': {
            'workflowSuccessIsNotPublicationProof': True,
            'draftPullRequestIsNotTraffic': True,
            'qualifyRequiresExactCandidateReviewEvidence': True,
            'missingRule': MISSING_RULE,
        },
    }


def _window_line(label: str, window: Dict[str, Any]) -> str:
    if window['status'] != 'available':
        return f'- {label}: unavailable ({window["reason"]})'
    counts = ', '.join(f'{key} {value}' for key, value in sorted(window['decisionCounts'].items()))
    return f'- {label}: {counts or "no decisions"} (sources: {", ".join(window["sources"]) or "none"})'


def render_markdown(receipt: Dict[str, Any]) -> str:
    lines = ['# Trends Today publishing health receipt', '']
    lines.append(f'Generated at {receipt["generatedAt"]}')
    lines.append('')
    disposition = receipt['disposition']
    lines.append(f'Disposition: **{disposition["action"]}**')
    lines.append(f'Reason: {disposition["reason"]}')
    if disposition.get('candidatePath'):
        lines.append(f'Candidate: `{disposition["candidatePath"]}`')
    lines.append('')

    if receipt['status'] == 'error':
        lines.append(f'Receipt error: {receipt["error"]}')
        return '\n'.join(lines) + '\n'

    publication = receipt['publication']
    newest = publication['newestArticle'] or {}
    lines.append('## Live publication')
    lines.append(f'- Live articles: {publication["totalArticles"]}')
    lines.append(f'- Newest: {newest.get("slug") or "unavailable"} ({newest.get("publishedAt") or "unavailable"})')
    lines.append(f'- Canonical: {newest.get("canonicalUrl") or "unavailable"}')
    freshness = publication['freshness']
    age = freshness['ageHours']
    lines.append(
        f'- Freshness: {freshness["status"]}'
        + (f' ({age} hours old)' if age is not None else ' (unavailable)')
    )
    lines.append('')

    lines.append('## Measurement')
    for name, provider in receipt['analytics']['providers'].items():
        detail = provider['reason'] or 'available'
        lines.append(f'- {name}: {provider["status"]} ({detail})')
    lines.append(f'- Rule: {receipt["analytics"]["missingRule"]}')
    lines.append('')

    lines.append('## Article decisions')
    lines.append(_window_line('day 7', receipt['articleDecisions']['day7']))
    lines.append(_window_line('day 28', receipt['articleDecisions']['day28']))
    lines.append('')

    drafts = receipt['drafts']
    research = receipt['research']
    lines.append('## Pipeline state')
    lines.append(
        f'- Research workflow: {research["status"]}'
        + (f' ({research["conclusion"]})' if research['conclusion'] else '')
        + ' - research output is not publication proof'
    )
    lines.append(
        f'- Open pull requests: {drafts["openCount"] if drafts["openCount"] is not None else "unavailable"}'
        f' (article drafts {drafts["articleDraftCount"] if drafts["articleDraftCount"] is not None else "unavailable"})'
        ' - a draft is not traffic'
    )
    lines.append(
        f'- Article drafts: stale {drafts["stale"] or "none"},'
        f' relevance-expired {drafts["relevanceExpired"] or "none"}'
        f' (convention: {drafts["articleDraftConvention"]})'
    )
    lines.append(f'- Candidate evidence: {receipt["candidate"]["status"]}')
    for warning in disposition['warnings']:
        lines.append(f'- Warning: {warning["check"]} - {warning["detail"]}')
    return '\n'.join(lines) + '\n'


def _load_json(path: Optional[Path]) -> Any:
    if not path:
        return None
    try:
        return json.loads(Path(path).read_text(encoding='utf-8-sig'))
    except FileNotFoundError as error:
        raise PublishingHealthError(f'{path} does not exist') from error
    except (json.JSONDecodeError, UnicodeDecodeError) as error:
        raise PublishingHealthError(f'{path} is not valid UTF-8 JSON') from error


def _first_record(payload: Any) -> Optional[Dict[str, Any]]:
    if isinstance(payload, list):
        return payload[0] if payload else None
    return payload if isinstance(payload, dict) else None


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description='Build the Trends Today publishing health receipt')
    parser.add_argument('--site-url', default=DEFAULT_SITE_URL)
    parser.add_argument('--inventory-url')
    parser.add_argument('--inventory-file', type=Path)
    parser.add_argument('--reporting-url')
    parser.add_argument('--reporting-file', type=Path)
    parser.add_argument('--reporting-token-env', default=DEFAULT_TOKEN_ENV)
    parser.add_argument('--repo-root', type=Path, default=REPO_ROOT)
    parser.add_argument('--content-dir', type=Path, default=REPO_ROOT / 'content')
    parser.add_argument('--drafts-file', type=Path)
    parser.add_argument('--research-file', type=Path)
    parser.add_argument('--candidate-file', type=Path)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--markdown-output', type=Path)
    parser.add_argument('--analytics-output', type=Path)
    parser.add_argument('--analytics-period', default='day28', choices=['day7', 'day28'])
    parser.add_argument('--now')
    parser.add_argument('--attempts', type=int, default=DEFAULT_ATTEMPTS)
    parser.add_argument('--timeout-seconds', type=int, default=DEFAULT_TIMEOUT_SECONDS)
    parser.add_argument('--freshness-target-hours', type=int, default=DEFAULT_FRESHNESS_TARGET_HOURS)
    parser.add_argument('--stale-publication-hours', type=int, default=DEFAULT_STALE_PUBLICATION_HOURS)
    parser.add_argument('--stale-draft-days', type=int, default=DEFAULT_STALE_DRAFT_DAYS)
    parser.add_argument('--relevance-expiry-days', type=int, default=DEFAULT_RELEVANCE_EXPIRY_DAYS)
    return parser


def main(argv: Optional[Sequence[str]] = None, env: Optional[Dict[str, str]] = None) -> int:
    args = _build_parser().parse_args(argv)
    environment = env if env is not None else os.environ
    now = _parse_date(args.now) or datetime.now(timezone.utc)
    token = str(environment.get(args.reporting_token_env, '') or '')

    try:
        if args.inventory_file:
            payload = _load_json(args.inventory_file)
            if not isinstance(payload, dict) or not isinstance(payload.get('data'), dict):
                raise PublishingHealthError(f'{args.inventory_file} is not an /api/analytics payload')
            inventory = payload['data']
        else:
            inventory = fetch_inventory(
                args.inventory_url or f'{args.site_url.rstrip("/")}{DEFAULT_INVENTORY_PATH}',
                attempts=args.attempts,
                timeout_seconds=args.timeout_seconds,
            )

        if args.reporting_file:
            reporting = _load_json(args.reporting_file)
            reporting = reporting.get('data', reporting) if isinstance(reporting, dict) else None
            availability = (
                {'status': 'available', 'reason': None}
                if isinstance(reporting, dict)
                else {'status': 'unavailable', 'reason': 'reporting-file-did-not-contain-a-snapshot'}
            )
        else:
            reporting, availability = fetch_reporting(
                args.reporting_url or f'{args.site_url.rstrip("/")}{DEFAULT_REPORTING_PATH}',
                token=token,
                attempts=args.attempts,
                timeout_seconds=args.timeout_seconds,
            )

        repository_articles = (
            discover_articles(args.content_dir) if args.content_dir and Path(args.content_dir).exists() else None
        )
        drafts = _load_json(args.drafts_file) if args.drafts_file else None
        research = _first_record(_load_json(args.research_file)) if args.research_file else None
        candidate = _load_json(args.candidate_file) if args.candidate_file else None

        receipt = build_receipt(
            inventory=inventory,
            reporting=reporting,
            reporting_availability=availability,
            repository_articles=repository_articles,
            research=research,
            drafts=drafts,
            candidate=candidate,
            now=now,
            site_url=args.site_url,
            freshness_target_hours=args.freshness_target_hours,
            stale_publication_hours=args.stale_publication_hours,
            stale_draft_days=args.stale_draft_days,
            relevance_expiry_days=args.relevance_expiry_days,
            repo_root=args.repo_root,
        )
        exit_code = 0
    except PublishingHealthError as error:
        receipt = build_error_receipt(_redact(str(error), token), now=now, site_url=args.site_url)
        exit_code = 1

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(receipt, indent=2, sort_keys=True) + '\n', encoding='utf-8')
    if args.markdown_output:
        args.markdown_output.parent.mkdir(parents=True, exist_ok=True)
        args.markdown_output.write_text(render_markdown(receipt), encoding='utf-8')
    if args.analytics_output and receipt['status'] != 'error':
        window = receipt['articleDecisions'][args.analytics_period]
        payload = analytics_payload_from_reporting(
            reporting,
            list(repository_articles or []),
            period=args.analytics_period,
        ) or {
            'status': 'unavailable',
            'missing': window['missing'],
            'decision': 'repair-measurement',
            'articles': [],
        }
        args.analytics_output.parent.mkdir(parents=True, exist_ok=True)
        args.analytics_output.write_text(
            json.dumps(payload, indent=2, sort_keys=True) + '\n',
            encoding='utf-8',
        )
    print(f'Wrote publishing health receipt to {args.output}')
    print(f'Disposition: {receipt["disposition"]["action"]}')
    return exit_code


if __name__ == '__main__':
    sys.exit(main())
