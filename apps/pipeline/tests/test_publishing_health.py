import hashlib
import json
import subprocess
import sys
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError

try:
    import yaml
except ImportError:  # pragma: no cover - the text assertions still run
    yaml = None


PIPELINE_DIR = Path(__file__).resolve().parents[1]
REPO_ROOT = PIPELINE_DIR.parents[1]
sys.path.insert(0, str(PIPELINE_DIR))

from publishing_health import (  # noqa: E402
    PublishingHealthError,
    build_receipt,
    evaluate_candidate_eligibility,
    fetch_inventory,
    fetch_json,
    fetch_reporting,
    render_markdown,
    resolve_repository_head,
    summarize_drafts,
)


NOW = datetime(2026, 8, 22, 12, 0, tzinfo=timezone.utc)
TOKEN = 'super-secret-reporting-token'
HEAD_SHA = 'ff35c5c974a64339a6e16e0ff601a7153e6e809b'
CANDIDATE_RELATIVE = 'artifacts/editorial/release-candidates/local-news/story-0.mdx'
CANDIDATE_BYTES = (
    b"---\ntitle: 'Coquitlam fall registration opens'\ncategory: 'local-news'\n---\n\n"
    b'Registration opens Tuesday at nine.\n'
)
WORKFLOW_PATH = REPO_ROOT / '.github' / 'workflows' / 'publishing-health.yml'


class CandidateWorkspace:
    """A throwaway repository root holding one real release-candidate file."""

    def __init__(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.root = Path(self._tmp.name)
        self.candidate = self.root / CANDIDATE_RELATIVE
        self.candidate.parent.mkdir(parents=True, exist_ok=True)
        self.write(CANDIDATE_BYTES)

    def write(self, payload: bytes) -> str:
        self.candidate.write_bytes(payload)
        return self.digest()

    def digest(self) -> str:
        return hashlib.sha256(self.candidate.read_bytes()).hexdigest()

    def cleanup(self) -> None:
        self._tmp.cleanup()


WORKSPACE: CandidateWorkspace


def setUpModule():
    global WORKSPACE
    WORKSPACE = CandidateWorkspace()


def tearDownModule():
    WORKSPACE.cleanup()


def head_returning(sha):
    """A testable seam that reports an exact HEAD without shelling out to git."""

    def resolver(_repo_root):
        return sha

    return resolver


def evaluate(candidate, *, head=HEAD_SHA, repo_root=None):
    return evaluate_candidate_eligibility(
        candidate,
        repo_root=repo_root if repo_root is not None else WORKSPACE.root,
        head_resolver=head_returning(head),
    )


class FakeResponse:
    def __init__(self, body: bytes):
        self.body = body

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def read(self):
        return self.body


def json_response(payload):
    return FakeResponse(json.dumps(payload).encode('utf-8'))


def http_error(status: int):
    return HTTPError('https://example.test', status, 'boom', {}, None)


def inventory_payload(
    *,
    total=171,
    newest='2026-08-19T15:00:00-07:00',
    ga_export='configured',
    gsc_export='configured',
    protected='configured',
):
    return {
        'success': True,
        'data': {
            'content': {
                'totalArticles': total,
                'byCategory': {'local-news': total},
                'recentArticles': [
                    {
                        'title': 'Coquitlam fall registration opens',
                        'category': 'local-news',
                        'slug': 'coquitlam-fall-registration',
                        'publishedAt': newest,
                    },
                    {
                        'title': 'Older story',
                        'category': 'local-news',
                        'slug': 'older-story',
                        'publishedAt': '2026-07-31T09:00:00-07:00',
                    },
                ],
            },
            'measurement': {
                'vercelWebAnalytics': {'status': 'enabled-in-site'},
                'googleAnalytics': {
                    'status': 'configured',
                    'dataExportStatus': ga_export,
                },
                'googleSearchConsole': {
                    'status': gsc_export,
                    'propertyStatus': 'configured',
                    'dataExportStatus': gsc_export,
                },
                'protectedReporting': {
                    'status': protected,
                    'endpoint': '/api/analytics/reporting',
                    'authentication': 'bearer-token',
                },
                'missingRule': 'Unavailable metrics are never represented as zero.',
            },
            'generatedAt': '2026-08-22T12:00:00.000Z',
        },
    }


def reporting_snapshot(*, ga_status='available', gsc_status='available', periods=True):
    day28_pages = {
        'window': {'startDate': '2026-07-25', 'endDate': '2026-08-21', 'days': 28},
        'pages': [
            {
                'path': f'/local-news/story-{index}',
                'pageViews': 120 - index * 10,
                'sessions': 100 - index * 10,
                'engagedSessions': 90 - index * 10,
                'returningSessions': 20 - index,
            }
            for index in range(6)
        ],
    }
    day7_pages = {
        'window': {'startDate': '2026-08-15', 'endDate': '2026-08-21', 'days': 7},
        'pages': [
            {
                'path': f'/local-news/story-{index}',
                'pageViews': 12,
                'sessions': 10,
                'engagedSessions': 9,
                'returningSessions': 2,
            }
            for index in range(6)
        ],
    }
    search28 = {
        'window': {'startDate': '2026-07-23', 'endDate': '2026-08-19', 'days': 28},
        'pages': [
            {
                'url': f'https://www.trendstoday.ca/local-news/story-{index}',
                'clicks': 12 - index,
                'impressions': 400 - index * 10,
                'ctr': 0.03,
                'position': 12.0,
            }
            for index in range(6)
        ],
    }
    snapshot = {
        'status': (
            'available'
            if ga_status == 'available' and gsc_status == 'available'
            else 'partial'
            if 'available' in (ga_status, gsc_status)
            else 'unavailable'
        ),
        'googleAnalytics': (
            {
                'status': 'available',
                'propertyId': '123',
                'totals': {'activeUsers': 4, 'sessions': 5, 'pageViews': 9},
                'topPages': [],
            }
            if ga_status == 'available'
            else {'status': 'unavailable', 'reason': 'http_403', 'totals': None, 'topPages': []}
        ),
        'googleSearchConsole': (
            {
                'status': 'available',
                'siteUrl': 'https://www.trendstoday.ca',
                'totals': {'clicks': 0, 'impressions': 0, 'ctr': 0, 'position': None},
                'topPages': [],
            }
            if gsc_status == 'available'
            else {'status': 'unavailable', 'reason': 'missing_configuration', 'totals': None, 'topPages': []}
        ),
        'windows': {
            'googleAnalytics': {'startDate': '2026-07-25', 'endDate': '2026-08-21', 'days': 28},
            'googleSearchConsole': {'startDate': '2026-07-23', 'endDate': '2026-08-19', 'days': 28},
        },
        'generatedAt': '2026-08-22T11:59:00.000Z',
        'missingRule': 'Unavailable metrics are null or omitted and are never represented as zero.',
    }
    if periods:
        snapshot['periods'] = {
            'day7': {
                'googleAnalytics': day7_pages if ga_status == 'available' else None,
                'googleSearchConsole': None,
            },
            'day28': {
                'googleAnalytics': day28_pages if ga_status == 'available' else None,
                'googleSearchConsole': search28 if gsc_status == 'available' else None,
            },
        }
    return snapshot


def repository_articles(count=6, published='2026-06-01T00:00:00-07:00'):
    return [
        {
            'path': f'/local-news/story-{index}',
            'slug': f'story-{index}',
            'category': 'local-news',
            'beat': 'local-news',
            'storyType': 'bulletin',
            'publishedAt': published,
        }
        for index in range(count)
    ]


# Open pull requests that are not editorial article drafts. Every one of them is
# old enough to be stale and relevance-expired, so any of them leaking into the
# article gate would force a repair day.
NON_ARTICLE_PULL_REQUESTS = [
    {
        'number': 120,
        'title': 'Weekly growth review evidence 2026-08-03',
        'headRefName': 'codex/weekly-growth-review-2026-08-03',
        'isDraft': True,
        'createdAt': '2026-07-01T00:00:00Z',
        'updatedAt': '2026-07-01T00:00:00Z',
        'url': 'https://github.com/Farhaan96/trends-today/pull/120',
    },
    {
        'number': 121,
        'title': 'Upgrade the analytics client',
        'headRefName': 'chore/upgrade-analytics-client',
        'isDraft': True,
        'createdAt': '2026-07-02T00:00:00Z',
        'updatedAt': '2026-07-02T00:00:00Z',
        'url': 'https://github.com/Farhaan96/trends-today/pull/121',
    },
    {
        'number': 122,
        'title': 'Monitored inbox sweep',
        'headRefName': 'monitored-inbox/2026-07-03',
        'isDraft': True,
        'createdAt': '2026-07-03T00:00:00Z',
        'updatedAt': '2026-07-03T00:00:00Z',
        'url': 'https://github.com/Farhaan96/trends-today/pull/122',
    },
    {
        'number': 123,
        'title': 'Fix the news sitemap fallback',
        'headRefName': 'fix/news-sitemap-fallback',
        'isDraft': False,
        'createdAt': '2026-07-04T00:00:00Z',
        'updatedAt': '2026-07-04T00:00:00Z',
        'url': 'https://github.com/Farhaan96/trends-today/pull/123',
    },
]


def eligible_candidate(digest=None, *, repository_sha=HEAD_SHA):
    """Evidence that binds to the real candidate bytes and to the current HEAD."""
    digest = digest if digest is not None else WORKSPACE.digest()
    return {
        'candidatePath': CANDIDATE_RELATIVE,
        'candidateSha256': digest,
        'validation': {'passed': True, 'errors': []},
        'gptReview': {
            'verdict': 'PASS',
            'candidateSha256': digest,
            'repositorySha': repository_sha,
            'reviewer': 'openai-gpt',
            'scores': {
                'factualSupport': 5,
                'quality': 4,
                'readability': 4,
                'formatting': 5,
                'engagement': 4,
            },
            'blockers': [],
            'proseEmDashCount': 0,
        },
        'claudeReview': {
            'verdict': 'NO BLOCKERS',
            'candidateSha256': digest,
            'repositorySha': repository_sha,
            'reviewer': 'claude',
            'modelUsed': 'claude-opus-5',
        },
    }


def receipt(**overrides):
    kwargs = {
        'inventory': inventory_payload(),
        'reporting': None,
        'reporting_availability': {'status': 'unavailable', 'reason': 'reporting-token-not-provided'},
        'repository_articles': repository_articles(),
        'research': None,
        'drafts': None,
        'candidate': None,
        'now': NOW,
        'repo_root': WORKSPACE.root,
        'head_resolver': head_returning(HEAD_SHA),
    }
    kwargs.update(overrides)
    return build_receipt(**kwargs)


class FetchTests(unittest.TestCase):
    def test_transient_failures_retry_until_the_endpoint_answers(self):
        attempts = []
        slept = []

        def opener(request, timeout=None):
            attempts.append(request.full_url)
            if len(attempts) < 3:
                raise URLError('temporary dns failure')
            return json_response({'ok': True})

        payload = fetch_json(
            'https://www.trendstoday.ca/api/analytics',
            opener=opener,
            attempts=3,
            backoff_seconds=2,
            sleeper=slept.append,
        )

        self.assertEqual({'ok': True}, payload)
        self.assertEqual(3, len(attempts))
        self.assertEqual([2, 4], slept)

    def test_exhausted_retries_fail_visibly(self):
        def opener(request, timeout=None):
            raise http_error(503)

        with self.assertRaises(PublishingHealthError) as caught:
            fetch_json(
                'https://www.trendstoday.ca/api/analytics',
                opener=opener,
                attempts=2,
                backoff_seconds=0,
                sleeper=lambda _seconds: None,
            )
        self.assertIn('2 attempts', str(caught.exception))

    def test_authorization_failure_does_not_retry(self):
        attempts = []

        def opener(request, timeout=None):
            attempts.append(request.full_url)
            raise http_error(401)

        with self.assertRaises(PublishingHealthError):
            fetch_json(
                'https://www.trendstoday.ca/api/analytics/reporting',
                token=TOKEN,
                opener=opener,
                attempts=3,
                backoff_seconds=0,
                sleeper=lambda _seconds: None,
            )
        self.assertEqual(1, len(attempts))

    def test_malformed_endpoint_body_fails_visibly(self):
        def opener(request, timeout=None):
            return FakeResponse(b'<html>not json</html>')

        with self.assertRaises(PublishingHealthError):
            fetch_json(
                'https://www.trendstoday.ca/api/analytics',
                opener=opener,
                attempts=2,
                backoff_seconds=0,
                sleeper=lambda _seconds: None,
            )

    def test_malformed_inventory_shape_fails_visibly(self):
        def opener(request, timeout=None):
            return json_response({'success': True, 'data': {'measurement': {}}})

        with self.assertRaises(PublishingHealthError) as caught:
            fetch_inventory(
                'https://www.trendstoday.ca/api/analytics',
                opener=opener,
                attempts=1,
                backoff_seconds=0,
                sleeper=lambda _seconds: None,
            )
        self.assertIn('content', str(caught.exception))

    def test_missing_token_never_calls_the_protected_endpoint(self):
        def opener(request, timeout=None):
            raise AssertionError('the protected endpoint must not be called without a token')

        snapshot, availability = fetch_reporting(
            'https://www.trendstoday.ca/api/analytics/reporting',
            token='',
            opener=opener,
        )
        self.assertIsNone(snapshot)
        self.assertEqual('unavailable', availability['status'])
        self.assertEqual('reporting-token-not-provided', availability['reason'])

    def test_unconfigured_protected_endpoint_stays_unavailable(self):
        def opener(request, timeout=None):
            raise http_error(503)

        snapshot, availability = fetch_reporting(
            'https://www.trendstoday.ca/api/analytics/reporting',
            token=TOKEN,
            opener=opener,
            attempts=1,
            backoff_seconds=0,
            sleeper=lambda _seconds: None,
        )
        self.assertIsNone(snapshot)
        self.assertEqual('unavailable', availability['status'])
        self.assertEqual('reporting-not-configured-on-the-server', availability['reason'])

    def test_protected_endpoint_sends_a_bearer_header(self):
        headers = {}

        def opener(request, timeout=None):
            headers.update(request.headers)
            return json_response({'success': True, 'data': reporting_snapshot()})

        snapshot, availability = fetch_reporting(
            'https://www.trendstoday.ca/api/analytics/reporting',
            token=TOKEN,
            opener=opener,
        )
        self.assertEqual('available', availability['status'])
        self.assertEqual('available', snapshot['status'])
        self.assertEqual(f'Bearer {TOKEN}', headers['Authorization'])

    def test_rejected_token_is_reported_as_an_error_without_echoing_it(self):
        def opener(request, timeout=None):
            raise http_error(401)

        snapshot, availability = fetch_reporting(
            'https://www.trendstoday.ca/api/analytics/reporting',
            token=TOKEN,
            opener=opener,
            attempts=1,
            backoff_seconds=0,
            sleeper=lambda _seconds: None,
        )
        self.assertIsNone(snapshot)
        self.assertEqual('error', availability['status'])
        self.assertNotIn(TOKEN, json.dumps(availability))


class PublicationTests(unittest.TestCase):
    def test_newest_live_article_is_recorded_with_a_canonical_url(self):
        result = receipt()
        newest = result['publication']['newestArticle']
        self.assertEqual('coquitlam-fall-registration', newest['slug'])
        self.assertEqual('Coquitlam fall registration opens', newest['title'])
        self.assertEqual('2026-08-19T15:00:00-07:00', newest['publishedAt'])
        self.assertEqual(
            'https://www.trendstoday.ca/local-news/coquitlam-fall-registration',
            newest['canonicalUrl'],
        )
        self.assertEqual(171, result['publication']['totalArticles'])

    def test_stale_live_publication_forces_a_repair_disposition(self):
        result = receipt()
        freshness = result['publication']['freshness']
        self.assertEqual('stale', freshness['status'])
        self.assertEqual(62, freshness['ageHours'])
        self.assertEqual('repair', result['disposition']['action'])
        self.assertIn(
            'publication-freshness',
            [item['check'] for item in result['disposition']['failedChecks']],
        )

    def test_fresh_live_publication_clears_the_freshness_check(self):
        result = receipt(
            inventory=inventory_payload(newest='2026-08-22T04:00:00-07:00'),
        )
        self.assertEqual('fresh', result['publication']['freshness']['status'])
        self.assertNotIn(
            'publication-freshness',
            [item['check'] for item in result['disposition']['failedChecks']],
        )

    def test_a_workflow_success_is_never_publication_proof(self):
        result = receipt(
            research={
                'workflow': 'Daily Content Opportunity Research',
                'path': '.github/workflows/daily-content.yml',
                'conclusion': 'success',
                'completedAt': '2026-08-22T11:30:00Z',
            },
        )
        self.assertEqual('success', result['research']['conclusion'])
        self.assertEqual('research-only', result['research']['publicationEvidence'])
        self.assertEqual('repair', result['disposition']['action'])

    def test_live_and_repository_article_count_drift_is_reported(self):
        result = receipt(
            inventory=inventory_payload(total=170),
            repository_articles=repository_articles(count=6),
        )
        deployment = result['publication']['deployment']
        self.assertEqual(170, deployment['liveArticleCount'])
        self.assertEqual(6, deployment['repositoryArticleCount'])
        self.assertTrue(deployment['drift'])


class AnalyticsAvailabilityTests(unittest.TestCase):
    def test_absent_token_keeps_a_truthful_successful_receipt(self):
        result = receipt()
        protected = result['analytics']['providers']['protectedReporting']
        self.assertEqual('unavailable', protected['status'])
        self.assertEqual('reporting-token-not-provided', protected['reason'])
        self.assertEqual('receipt-complete', result['status'])

    def test_unavailable_metrics_are_null_and_never_zero(self):
        result = receipt()
        self.assertEqual(
            'Unavailable metrics are null and are never represented as zero.',
            result['analytics']['missingRule'],
        )
        for provider in result['analytics']['providers'].values():
            if provider['status'] != 'available':
                self.assertIsNone(provider.get('totals'))
                self.assertTrue(provider.get('reason'))
        for window in result['articleDecisions'].values():
            self.assertEqual('unavailable', window['status'])
            self.assertTrue(window['reason'])
            self.assertEqual([], window['articles'])

    def test_partial_provider_data_is_recorded_per_provider(self):
        result = receipt(
            reporting=reporting_snapshot(gsc_status='unavailable'),
            reporting_availability={'status': 'available', 'reason': None},
        )
        providers = result['analytics']['providers']
        self.assertEqual('available', providers['googleAnalytics']['status'])
        self.assertEqual('unavailable', providers['googleSearchConsole']['status'])
        self.assertEqual('missing_configuration', providers['googleSearchConsole']['reason'])
        self.assertIsNone(providers['googleSearchConsole']['totals'])
        self.assertEqual('partial', result['analytics']['status'])

    def test_verified_zero_stays_available_with_a_zero_value(self):
        result = receipt(
            reporting=reporting_snapshot(),
            reporting_availability={'status': 'available', 'reason': None},
        )
        search_console = result['analytics']['providers']['googleSearchConsole']
        self.assertEqual('available', search_console['status'])
        self.assertEqual(0, search_console['totals']['clicks'])

    def test_provider_freshness_window_is_recorded(self):
        result = receipt(
            reporting=reporting_snapshot(),
            reporting_availability={'status': 'available', 'reason': None},
        )
        analytics = result['analytics']['providers']['googleAnalytics']
        self.assertEqual('2026-08-21', analytics['window']['endDate'])
        self.assertEqual(28, analytics['window']['days'])


class ArticleDecisionTests(unittest.TestCase):
    def test_day28_decisions_are_derived_from_reported_pages(self):
        result = receipt(
            reporting=reporting_snapshot(),
            reporting_availability={'status': 'available', 'reason': None},
        )
        day28 = result['articleDecisions']['day28']
        self.assertEqual('available', day28['status'])
        decisions = {article['slug']: article['decision'] for article in day28['articles']}
        self.assertEqual('keep', decisions['story-0'])
        self.assertEqual('stop', decisions['story-5'])
        self.assertIn('impressions', day28['articles'][0])
        self.assertEqual(400, day28['articles'][0]['impressions'])

    def test_articles_absent_from_the_report_are_unavailable_not_zero(self):
        result = receipt(
            reporting=reporting_snapshot(),
            reporting_availability={'status': 'available', 'reason': None},
            repository_articles=repository_articles(count=7),
        )
        day28 = result['articleDecisions']['day28']
        missing = [a for a in day28['articles'] if a['slug'] == 'story-6'][0]
        self.assertIsNone(missing['pageViews'])
        self.assertIsNone(missing['impressions'])
        self.assertIsNone(missing['engagedSessions'])
        self.assertEqual('repair-measurement', missing['decision'])

    def test_missing_day7_window_states_an_explicit_unavailable_reason(self):
        snapshot = reporting_snapshot()
        snapshot['periods']['day7']['googleAnalytics'] = None
        result = receipt(
            reporting=snapshot,
            reporting_availability={'status': 'available', 'reason': None},
        )
        day7 = result['articleDecisions']['day7']
        self.assertEqual('unavailable', day7['status'])
        self.assertEqual([], day7['articles'])
        self.assertIn('day7', day7['reason'])

    def test_day7_decisions_are_reported_when_the_window_exists(self):
        result = receipt(
            reporting=reporting_snapshot(),
            reporting_availability={'status': 'available', 'reason': None},
        )
        day7 = result['articleDecisions']['day7']
        self.assertEqual('available', day7['status'])
        self.assertEqual(7, day7['window']['days'])
        self.assertEqual(6, len(day7['articles']))

    def test_each_window_declares_its_own_maturity(self):
        result = receipt(
            reporting=reporting_snapshot(),
            reporting_availability={'status': 'available', 'reason': None},
        )
        decisions = result['articleDecisions']
        self.assertEqual(7, decisions['day7']['maturityDays'])
        self.assertEqual('7-day', decisions['day7']['period'])
        self.assertEqual(28, decisions['day28']['maturityDays'])
        self.assertEqual('28-day', decisions['day28']['period'])
        self.assertEqual(7, decisions['day7']['articles'][0]['maturityDays'])
        self.assertEqual(28, decisions['day28']['articles'][0]['maturityDays'])

    def test_day7_reasons_never_use_28_day_semantics(self):
        result = receipt(
            reporting=reporting_snapshot(),
            reporting_availability={'status': 'available', 'reason': None},
        )
        day7 = result['articleDecisions']['day7']
        # The day-7 window in this snapshot has no Search Console rows, so
        # impressions are unavailable and every article repairs measurement.
        reasons = {article['decisionReason'] for article in day7['articles']}
        self.assertEqual({'required 7-day traffic metrics are unavailable'}, reasons)
        self.assertNotIn('28-day', json.dumps(day7['articles']))

    def test_an_article_mature_at_day_7_is_still_observed_at_day_28(self):
        result = receipt(
            reporting=reporting_snapshot(),
            reporting_availability={'status': 'available', 'reason': None},
            repository_articles=repository_articles(
                count=6,
                published='2026-08-10T00:00:00Z',
            ),
        )
        day7 = result['articleDecisions']['day7']
        day28 = result['articleDecisions']['day28']
        self.assertEqual(
            {'28-day decision window is incomplete'},
            {article['decisionReason'] for article in day28['articles']},
        )
        self.assertEqual(
            {'observe'},
            {article['decision'] for article in day28['articles']},
        )
        self.assertNotIn('observe', {article['decision'] for article in day7['articles']})

    def test_a_day_7_article_never_receives_a_28_day_keep_or_stop(self):
        snapshot = reporting_snapshot()
        snapshot['periods']['day7']['googleSearchConsole'] = {
            'window': {'startDate': '2026-08-15', 'endDate': '2026-08-21', 'days': 7},
            'pages': [
                {
                    'url': f'https://www.trendstoday.ca/local-news/story-{index}',
                    'clicks': 3,
                    'impressions': 100,
                    'ctr': 0.03,
                    'position': 12.0,
                }
                for index in range(6)
            ],
        }
        result = receipt(
            reporting=snapshot,
            reporting_availability={'status': 'available', 'reason': None},
            repository_articles=repository_articles(
                count=6,
                published='2026-08-16T00:00:00Z',
            ),
        )
        day7 = result['articleDecisions']['day7']
        self.assertEqual(
            {'observe'},
            {article['decision'] for article in day7['articles']},
        )
        self.assertEqual(
            {'first 7-day measurement window is incomplete'},
            {article['decisionReason'] for article in day7['articles']},
        )


def low_ctr_snapshot():
    """A joined 28-day window where one article has demand but weak click-through.

    Story 0 reports no ``clicks`` at all, so its click-through rate can only come
    from the Search Console ``ctr`` field. If that field is dropped in the join,
    the low-click-through repair reason is unreachable.
    """
    snapshot = reporting_snapshot()
    snapshot['periods']['day28']['googleAnalytics'] = {
        'window': {'startDate': '2026-07-25', 'endDate': '2026-08-21', 'days': 28},
        'pages': [
            {
                'path': f'/local-news/story-{index}',
                'pageViews': 20 if index == 0 else 200,
                'engagedSessions': 1 if index == 0 else 50,
                'returningSessions': 1,
            }
            for index in range(6)
        ],
    }
    snapshot['periods']['day28']['googleSearchConsole'] = {
        'window': {'startDate': '2026-07-23', 'endDate': '2026-08-19', 'days': 28},
        'pages': [
            {
                'url': 'https://www.trendstoday.ca/local-news/story-0',
                'impressions': 1000,
                'ctr': 0.005,
                'position': 18.0,
            },
            *[
                {
                    'url': f'https://www.trendstoday.ca/local-news/story-{index}',
                    'clicks': 10,
                    'impressions': 100,
                    'ctr': 0.1,
                    'position': 8.0,
                }
                for index in range(1, 6)
            ],
        ],
    }
    return snapshot


class SearchConsoleCtrJoinTests(unittest.TestCase):
    def test_provider_click_through_rate_survives_the_join(self):
        result = receipt(
            reporting=low_ctr_snapshot(),
            reporting_availability={'status': 'available', 'reason': None},
        )
        story = [
            article
            for article in result['articleDecisions']['day28']['articles']
            if article['slug'] == 'story-0'
        ][0]
        self.assertEqual(0.005, story['ctr'])
        self.assertIsNone(story['clicks'])

    def test_low_click_through_repair_is_reachable_from_joined_data(self):
        result = receipt(
            reporting=low_ctr_snapshot(),
            reporting_availability={'status': 'available', 'reason': None},
        )
        story = [
            article
            for article in result['articleDecisions']['day28']['articles']
            if article['slug'] == 'story-0'
        ][0]
        self.assertEqual('repair', story['decision'])
        self.assertEqual(
            'demand exists, but click-through trails the mature beat median',
            story['decisionReason'],
        )

    def test_an_unreported_click_through_rate_stays_unavailable_not_zero(self):
        snapshot = low_ctr_snapshot()
        snapshot['periods']['day28']['googleSearchConsole']['pages'] = [
            {
                'url': 'https://www.trendstoday.ca/local-news/story-0',
                'impressions': 1000,
                'position': 18.0,
            }
        ]
        result = receipt(
            reporting=snapshot,
            reporting_availability={'status': 'available', 'reason': None},
        )
        articles = {
            article['slug']: article
            for article in result['articleDecisions']['day28']['articles']
        }
        self.assertIsNone(articles['story-0']['ctr'])
        self.assertIsNone(articles['story-0']['clicks'])
        # An article with no reported row at all is unavailable, never zero.
        self.assertIsNone(articles['story-1']['ctr'])
        self.assertIsNone(articles['story-1']['impressions'])


class DraftTests(unittest.TestCase):
    def test_stale_and_relevance_expired_drafts_are_listed_as_metadata_only(self):
        drafts = [
            {
                'number': 143,
                'title': 'Draft COS-901 Surrey tree sale',
                'headRefName': 'draft/cos-901-surrey-tree-sale',
                'isDraft': True,
                'createdAt': '2026-08-01T00:00:00Z',
                'updatedAt': '2026-08-01T00:00:00Z',
                'url': 'https://github.com/Farhaan96/trends-today/pull/143',
                'body': 'private notes that must not be copied',
            },
            {
                'number': 148,
                'title': 'Draft COS-906 Burnaby bylaw',
                'headRefName': 'draft/cos-906-burnaby-bylaw',
                'isDraft': True,
                'createdAt': '2026-08-20T00:00:00Z',
                'updatedAt': '2026-08-20T00:00:00Z',
                'url': 'https://github.com/Farhaan96/trends-today/pull/148',
            },
        ]
        summary = summarize_drafts(
            drafts,
            now=NOW,
            stale_draft_days=7,
            relevance_expiry_days=14,
        )
        self.assertEqual(2, summary['openCount'])
        self.assertEqual([143], summary['relevanceExpired'])
        self.assertEqual([143], summary['stale'])
        self.assertNotIn('body', summary['pullRequests'][0])
        self.assertNotIn('private notes', json.dumps(summary))
        self.assertEqual(21, summary['pullRequests'][0]['ageDays'])

    def test_a_draft_pull_request_is_never_counted_as_traffic_or_publication(self):
        result = receipt(
            drafts=[
                {
                    'number': 143,
                    'title': 'Draft COS-901 Surrey tree sale',
                    'headRefName': 'draft/cos-901-surrey-tree-sale',
                    'isDraft': True,
                    'createdAt': '2026-08-01T00:00:00Z',
                    'updatedAt': '2026-08-01T00:00:00Z',
                    'url': 'https://github.com/Farhaan96/trends-today/pull/143',
                }
            ],
        )
        self.assertEqual('not-published', result['drafts']['publicationEvidence'])
        self.assertEqual('not-traffic', result['drafts']['trafficEvidence'])
        self.assertEqual('repair', result['disposition']['action'])
        self.assertIn(
            'stale-drafts',
            [item['check'] for item in result['disposition']['failedChecks']],
        )

    def test_unavailable_draft_metadata_is_not_reported_as_zero(self):
        result = receipt(drafts=None)
        self.assertEqual('unavailable', result['drafts']['status'])
        self.assertIsNone(result['drafts']['openCount'])
        self.assertIsNone(result['drafts']['articleDraftCount'])

    def test_non_article_pull_requests_never_force_an_editorial_repair(self):
        summary = summarize_drafts(
            NON_ARTICLE_PULL_REQUESTS,
            now=NOW,
            stale_draft_days=7,
            relevance_expiry_days=14,
        )
        self.assertEqual(4, summary['openCount'])
        self.assertEqual(0, summary['articleDraftCount'])
        self.assertEqual([], summary['articleDrafts'])
        self.assertEqual([], summary['stale'])
        self.assertEqual([], summary['relevanceExpired'])
        self.assertEqual(
            [False, False, False, False],
            [record['articleDraft'] for record in summary['pullRequests']],
        )

    def test_an_idle_infrastructure_draft_does_not_block_qualification(self):
        result = receipt(
            inventory=inventory_payload(newest='2026-08-22T04:00:00-07:00'),
            drafts=NON_ARTICLE_PULL_REQUESTS,
            candidate=eligible_candidate(),
        )
        self.assertEqual('qualify', result['disposition']['action'])
        self.assertEqual([], result['disposition']['failedChecks'])
        self.assertEqual(4, result['drafts']['openCount'])
        self.assertEqual(0, result['drafts']['articleDraftCount'])

    def test_only_article_drafts_are_measured_for_staleness(self):
        summary = summarize_drafts(
            [
                *NON_ARTICLE_PULL_REQUESTS,
                {
                    'number': 143,
                    'title': 'Draft COS-901 Surrey tree sale',
                    'headRefName': 'draft/cos-901-surrey-tree-sale',
                    'isDraft': True,
                    'createdAt': '2026-08-01T00:00:00Z',
                    'updatedAt': '2026-08-01T00:00:00Z',
                    'url': 'https://github.com/Farhaan96/trends-today/pull/143',
                },
            ],
            now=NOW,
            stale_draft_days=7,
            relevance_expiry_days=14,
        )
        self.assertEqual(5, summary['openCount'])
        self.assertEqual(1, summary['articleDraftCount'])
        self.assertEqual([143], summary['articleDrafts'])
        self.assertEqual([143], summary['stale'])
        self.assertEqual([143], summary['relevanceExpired'])

    def test_a_missing_head_ref_falls_back_to_the_draft_title_prefix(self):
        summary = summarize_drafts(
            [
                {
                    'number': 150,
                    'title': 'Draft COS-910 Port Moody detour',
                    'headRefName': None,
                    'isDraft': True,
                    'createdAt': '2026-07-01T00:00:00Z',
                    'updatedAt': '2026-07-01T00:00:00Z',
                },
                {
                    'number': 151,
                    'title': 'Rework the analytics client',
                    'headRefName': None,
                    'isDraft': True,
                    'createdAt': '2026-07-01T00:00:00Z',
                    'updatedAt': '2026-07-01T00:00:00Z',
                },
            ],
            now=NOW,
            stale_draft_days=7,
            relevance_expiry_days=14,
        )
        self.assertEqual([150], summary['articleDrafts'])
        self.assertEqual([150], summary['stale'])

    def test_the_title_fallback_never_overrides_a_present_head_ref(self):
        summary = summarize_drafts(
            [
                {
                    'number': 152,
                    'title': 'Draft COS-911 evidence bundle',
                    'headRefName': 'codex/weekly-growth-review-2026-08-03',
                    'isDraft': True,
                    'createdAt': '2026-07-01T00:00:00Z',
                    'updatedAt': '2026-07-01T00:00:00Z',
                }
            ],
            now=NOW,
            stale_draft_days=7,
            relevance_expiry_days=14,
        )
        self.assertEqual([], summary['articleDrafts'])
        self.assertEqual([], summary['stale'])

    def test_a_ready_for_review_article_branch_is_not_a_draft(self):
        summary = summarize_drafts(
            [
                {
                    'number': 153,
                    'title': 'COS-901 Surrey tree sale',
                    'headRefName': 'draft/cos-901-surrey-tree-sale',
                    'isDraft': False,
                    'createdAt': '2026-07-01T00:00:00Z',
                    'updatedAt': '2026-07-01T00:00:00Z',
                }
            ],
            now=NOW,
            stale_draft_days=7,
            relevance_expiry_days=14,
        )
        self.assertEqual(1, summary['openCount'])
        self.assertEqual([], summary['articleDrafts'])
        self.assertEqual([], summary['stale'])


class CandidateEligibilityTests(unittest.TestCase):
    def test_complete_review_evidence_is_eligible(self):
        evaluation = evaluate(eligible_candidate())
        self.assertEqual('eligible', evaluation['status'])
        self.assertEqual([], evaluation['reasons'])

    def test_matching_bytes_both_reviews_and_current_head_qualify(self):
        evaluation = evaluate(eligible_candidate())
        self.assertEqual('eligible', evaluation['status'])
        self.assertEqual(WORKSPACE.digest(), evaluation['candidateSha256'])
        self.assertEqual(HEAD_SHA, evaluation['repositorySha'])
        self.assertEqual(CANDIDATE_RELATIVE, evaluation['candidatePath'])

    def test_absent_candidate_evidence_is_never_eligible(self):
        evaluation = evaluate_candidate_eligibility(None)
        self.assertEqual('none', evaluation['status'])

    def test_review_bound_to_a_different_candidate_is_ineligible(self):
        candidate = eligible_candidate()
        candidate['claudeReview']['candidateSha256'] = 'b' * 64
        evaluation = evaluate(candidate)
        self.assertEqual('ineligible', evaluation['status'])
        self.assertIn(
            'claude review is not bound to the exact candidate SHA-256',
            evaluation['reasons'],
        )

    def test_low_gpt_score_is_ineligible(self):
        candidate = eligible_candidate()
        candidate['gptReview']['scores']['readability'] = 3
        evaluation = evaluate(candidate)
        self.assertEqual('ineligible', evaluation['status'])
        self.assertIn('gpt editorial score readability is below 4', evaluation['reasons'])

    def test_non_opus_release_review_is_ineligible(self):
        candidate = eligible_candidate()
        candidate['claudeReview']['modelUsed'] = 'claude-sonnet-5'
        evaluation = evaluate(candidate)
        self.assertEqual('ineligible', evaluation['status'])
        self.assertIn('release review must use claude-opus-5', evaluation['reasons'])

    def test_failed_deterministic_validation_is_ineligible(self):
        candidate = eligible_candidate()
        candidate['validation'] = {'passed': False, 'errors': ['missing primary source']}
        evaluation = evaluate(candidate)
        self.assertEqual('ineligible', evaluation['status'])
        self.assertIn('deterministic validation did not pass', evaluation['reasons'])


class CandidateFileProofTests(unittest.TestCase):
    """A shared digest is only believed when the named file proves it."""

    def test_a_missing_candidate_file_cannot_qualify(self):
        candidate = eligible_candidate()
        candidate['candidatePath'] = (
            'artifacts/editorial/release-candidates/local-news/never-written.mdx'
        )
        evaluation = evaluate(candidate)
        self.assertEqual('ineligible', evaluation['status'])
        self.assertIn('candidatePath is not an existing regular file', evaluation['reasons'])

    def test_a_candidate_directory_cannot_stand_in_for_a_file(self):
        directory = WORKSPACE.root / CANDIDATE_RELATIVE.replace('story-0.mdx', 'folder.mdx')
        directory.mkdir(parents=True, exist_ok=True)
        candidate = eligible_candidate()
        candidate['candidatePath'] = (
            'artifacts/editorial/release-candidates/local-news/folder.mdx'
        )
        evaluation = evaluate(candidate)
        self.assertEqual('ineligible', evaluation['status'])
        self.assertIn('candidatePath is not an existing regular file', evaluation['reasons'])

    def test_a_path_outside_the_release_candidate_root_cannot_qualify(self):
        outside = WORKSPACE.root / 'content' / 'local-news' / 'story-0.mdx'
        outside.parent.mkdir(parents=True, exist_ok=True)
        outside.write_bytes(CANDIDATE_BYTES)
        candidate = eligible_candidate()
        candidate['candidatePath'] = 'content/local-news/story-0.mdx'
        evaluation = evaluate(candidate)
        self.assertEqual('ineligible', evaluation['status'])
        self.assertIn(
            'candidatePath is outside artifacts/editorial/release-candidates',
            evaluation['reasons'],
        )

    def test_a_traversal_path_cannot_escape_the_release_candidate_root(self):
        escaped = WORKSPACE.root.parent / 'escaped-candidate.mdx'
        escaped.write_bytes(CANDIDATE_BYTES)
        try:
            candidate = eligible_candidate()
            candidate['candidatePath'] = (
                'artifacts/editorial/release-candidates/../../../escaped-candidate.mdx'
            )
            evaluation = evaluate(candidate)
            self.assertEqual('ineligible', evaluation['status'])
            self.assertIn(
                'candidatePath is outside artifacts/editorial/release-candidates',
                evaluation['reasons'],
            )
        finally:
            escaped.unlink()

    def test_a_nested_candidate_path_is_rejected(self):
        nested = WORKSPACE.root / CANDIDATE_RELATIVE.replace(
            'story-0.mdx', 'nested/story-9.mdx'
        )
        nested.parent.mkdir(parents=True, exist_ok=True)
        nested.write_bytes(CANDIDATE_BYTES)
        candidate = eligible_candidate()
        candidate['candidatePath'] = (
            'artifacts/editorial/release-candidates/local-news/nested/story-9.mdx'
        )
        evaluation = evaluate(candidate)
        self.assertEqual('ineligible', evaluation['status'])
        self.assertIn('candidatePath must be <category>/<slug>.mdx', evaluation['reasons'])

    def test_a_declared_digest_that_does_not_match_the_file_cannot_qualify(self):
        candidate = eligible_candidate(digest='a' * 64)
        evaluation = evaluate(candidate)
        self.assertEqual('ineligible', evaluation['status'])
        self.assertIn(
            'candidateSha256 does not match the SHA-256 of the candidate file',
            evaluation['reasons'],
        )
        self.assertIn('gpt review is not bound to the exact candidate SHA-256', evaluation['reasons'])
        self.assertIn(
            'claude review is not bound to the exact candidate SHA-256',
            evaluation['reasons'],
        )

    def test_tampered_candidate_bytes_cannot_qualify(self):
        candidate = eligible_candidate()
        self.addCleanup(WORKSPACE.write, CANDIDATE_BYTES)
        WORKSPACE.write(CANDIDATE_BYTES + b'\nAn unreviewed sentence.\n')
        evaluation = evaluate(candidate)
        self.assertEqual('ineligible', evaluation['status'])
        self.assertIn(
            'candidateSha256 does not match the SHA-256 of the candidate file',
            evaluation['reasons'],
        )
        self.assertEqual(WORKSPACE.digest(), evaluation['candidateSha256'])

    def test_a_shared_digest_never_substitutes_for_the_file(self):
        candidate = eligible_candidate(digest='b' * 64)
        candidate['candidatePath'] = (
            'artifacts/editorial/release-candidates/local-news/never-written.mdx'
        )
        evaluation = evaluate(candidate)
        self.assertEqual('ineligible', evaluation['status'])
        for reason in (
            'gpt review is not bound to the exact candidate SHA-256',
            'claude review is not bound to the exact candidate SHA-256',
        ):
            self.assertIn(reason, evaluation['reasons'])


class RepositoryShaBindingTests(unittest.TestCase):
    """Both independent reviews must name the exact current repository HEAD."""

    def test_a_gpt_review_without_repository_sha_cannot_qualify(self):
        candidate = eligible_candidate()
        del candidate['gptReview']['repositorySha']
        evaluation = evaluate(candidate)
        self.assertEqual('ineligible', evaluation['status'])
        self.assertIn('gpt review is missing repositorySha', evaluation['reasons'])

    def test_a_claude_review_without_repository_sha_cannot_qualify(self):
        candidate = eligible_candidate()
        candidate['claudeReview']['repositorySha'] = '   '
        evaluation = evaluate(candidate)
        self.assertEqual('ineligible', evaluation['status'])
        self.assertIn('claude review is missing repositorySha', evaluation['reasons'])

    def test_a_gpt_review_for_a_different_head_cannot_qualify(self):
        candidate = eligible_candidate()
        candidate['gptReview']['repositorySha'] = 'd' * 40
        evaluation = evaluate(candidate)
        self.assertEqual('ineligible', evaluation['status'])
        self.assertIn('gpt review was created for a different repository SHA', evaluation['reasons'])

    def test_a_claude_review_for_a_different_head_cannot_qualify(self):
        candidate = eligible_candidate()
        candidate['claudeReview']['repositorySha'] = 'e' * 40
        evaluation = evaluate(candidate)
        self.assertEqual('ineligible', evaluation['status'])
        self.assertIn(
            'claude review was created for a different repository SHA',
            evaluation['reasons'],
        )

    def test_reviews_for_a_stale_head_cannot_qualify_after_a_new_commit(self):
        candidate = eligible_candidate(repository_sha='c' * 40)
        evaluation = evaluate(candidate, head=HEAD_SHA)
        self.assertEqual('ineligible', evaluation['status'])
        self.assertIn('gpt review was created for a different repository SHA', evaluation['reasons'])
        self.assertIn(
            'claude review was created for a different repository SHA',
            evaluation['reasons'],
        )

    def test_an_unverifiable_head_fails_closed(self):
        evaluation = evaluate(eligible_candidate(), head=None)
        self.assertEqual('ineligible', evaluation['status'])
        self.assertIn('the current repository SHA could not be verified', evaluation['reasons'])
        self.assertIsNone(evaluation['repositorySha'])

    def test_a_raising_head_seam_fails_closed(self):
        def broken(_repo_root):
            raise OSError('git is not installed')

        evaluation = evaluate_candidate_eligibility(
            eligible_candidate(),
            repo_root=WORKSPACE.root,
            head_resolver=broken,
        )
        self.assertEqual('ineligible', evaluation['status'])
        self.assertIn('the current repository SHA could not be verified', evaluation['reasons'])

    def test_the_default_seam_reads_the_real_repository_head(self):
        try:
            completed = subprocess.run(
                ['git', 'rev-parse', 'HEAD'],
                cwd=str(REPO_ROOT),
                capture_output=True,
                text=True,
            )
        except OSError:  # pragma: no cover - git is present in this repository
            self.skipTest('git is not available')
        if completed.returncode != 0:  # pragma: no cover
            self.skipTest('not inside a git work tree')
        self.assertEqual(completed.stdout.strip(), resolve_repository_head(REPO_ROOT))


class DispositionTests(unittest.TestCase):
    def test_qualify_requires_explicit_eligible_candidate_evidence(self):
        result = receipt(
            inventory=inventory_payload(newest='2026-08-22T04:00:00-07:00'),
            drafts=[],
            candidate=eligible_candidate(),
        )
        self.assertEqual('qualify', result['disposition']['action'])
        self.assertEqual(
            'artifacts/editorial/release-candidates/local-news/story-0.mdx',
            result['disposition']['candidatePath'],
        )

    def test_research_alone_never_qualifies(self):
        result = receipt(
            inventory=inventory_payload(newest='2026-08-22T04:00:00-07:00'),
            drafts=[],
            research={
                'workflow': 'Daily Content Opportunity Research',
                'path': '.github/workflows/daily-content.yml',
                'conclusion': 'success',
                'completedAt': '2026-08-22T11:30:00Z',
                'queuedCandidates': 60,
            },
        )
        self.assertEqual('skip', result['disposition']['action'])
        self.assertIn('no eligible reviewed candidate', result['disposition']['reason'])

    def test_ineligible_candidate_repairs_instead_of_qualifying(self):
        candidate = eligible_candidate()
        candidate['gptReview']['blockers'] = ['unsupported claim in paragraph 3']
        result = receipt(
            inventory=inventory_payload(newest='2026-08-22T04:00:00-07:00'),
            drafts=[],
            candidate=candidate,
        )
        self.assertEqual('repair', result['disposition']['action'])

    def test_an_unproven_candidate_file_repairs_instead_of_qualifying(self):
        candidate = eligible_candidate()
        candidate['candidatePath'] = (
            'artifacts/editorial/release-candidates/local-news/never-written.mdx'
        )
        result = receipt(
            inventory=inventory_payload(newest='2026-08-22T04:00:00-07:00'),
            drafts=[],
            candidate=candidate,
        )
        self.assertEqual('repair', result['disposition']['action'])
        self.assertIsNone(result['disposition']['candidatePath'])

    def test_a_review_bound_to_another_head_repairs_instead_of_qualifying(self):
        result = receipt(
            inventory=inventory_payload(newest='2026-08-22T04:00:00-07:00'),
            drafts=[],
            candidate=eligible_candidate(repository_sha='c' * 40),
        )
        self.assertEqual('repair', result['disposition']['action'])
        self.assertIn(
            'candidate-eligibility',
            [item['check'] for item in result['disposition']['failedChecks']],
        )

    def test_exactly_one_bounded_action_is_emitted(self):
        result = receipt()
        action = result['disposition']['action']
        self.assertIsInstance(action, str)
        self.assertIn(action, {'qualify', 'skip', 'repair'})


class ReceiptContractTests(unittest.TestCase):
    def test_receipt_is_deterministic_for_identical_inputs(self):
        first = receipt(
            reporting=reporting_snapshot(),
            reporting_availability={'status': 'available', 'reason': None},
            drafts=[],
            candidate=eligible_candidate(),
        )
        second = receipt(
            reporting=reporting_snapshot(),
            reporting_availability={'status': 'available', 'reason': None},
            drafts=[],
            candidate=eligible_candidate(),
        )
        self.assertEqual(
            json.dumps(first, sort_keys=True),
            json.dumps(second, sort_keys=True),
        )

    def test_receipt_is_json_serializable_and_versioned(self):
        result = receipt()
        self.assertEqual(1, result['version'])
        self.assertEqual('2026-08-22T12:00:00+00:00', result['generatedAt'])
        json.dumps(result)

    def test_markdown_summary_reports_the_single_disposition(self):
        result = receipt(
            drafts=[],
            inventory=inventory_payload(newest='2026-08-22T04:00:00-07:00'),
            candidate=eligible_candidate(),
        )
        markdown = render_markdown(result)
        self.assertIn('# Trends Today publishing health receipt', markdown)
        self.assertIn('Disposition: **qualify**', markdown)
        self.assertIn('coquitlam-fall-registration', markdown)
        self.assertLess(len(markdown.splitlines()), 60)

    def test_markdown_states_unavailable_rather_than_zero(self):
        markdown = render_markdown(receipt())
        self.assertIn('unavailable', markdown)
        self.assertNotIn('0 sessions', markdown)


class SecretHandlingTests(unittest.TestCase):
    def test_token_never_reaches_the_receipt_or_the_markdown_summary(self):
        result = receipt(
            reporting=reporting_snapshot(),
            reporting_availability={'status': 'available', 'reason': None},
            candidate=eligible_candidate(),
            drafts=[],
        )
        self.assertNotIn(TOKEN, json.dumps(result))
        self.assertNotIn(TOKEN, render_markdown(result))

    def test_transport_errors_never_echo_the_token(self):
        def opener(request, timeout=None):
            raise URLError(f'failed to reach host with header Bearer {TOKEN}')

        snapshot, availability = fetch_reporting(
            'https://www.trendstoday.ca/api/analytics/reporting',
            token=TOKEN,
            opener=opener,
            attempts=1,
            backoff_seconds=0,
            sleeper=lambda _seconds: None,
        )
        self.assertIsNone(snapshot)
        self.assertNotIn(TOKEN, json.dumps(availability))

    def test_hard_failures_never_echo_the_token(self):
        def opener(request, timeout=None):
            raise URLError(f'boom Bearer {TOKEN}')

        with self.assertRaises(PublishingHealthError) as caught:
            fetch_json(
                'https://www.trendstoday.ca/api/analytics/reporting',
                token=TOKEN,
                opener=opener,
                attempts=1,
                backoff_seconds=0,
                sleeper=lambda _seconds: None,
            )
        self.assertNotIn(TOKEN, str(caught.exception))


class CliTests(unittest.TestCase):
    def test_cli_writes_a_receipt_and_a_markdown_summary(self):
        from publishing_health import main

        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            inventory_file = root / 'inventory.json'
            inventory_file.write_text(json.dumps(inventory_payload()), encoding='utf-8')
            content_dir = root / 'content' / 'local-news'
            content_dir.mkdir(parents=True)
            (content_dir / 'story-0.mdx').write_text(
                "---\nslug: 'story-0'\npublishedAt: '2026-06-01T00:00:00-07:00'\n---\n",
                encoding='utf-8',
            )
            receipt_path = root / 'receipt.json'
            markdown_path = root / 'receipt.md'

            exit_code = main([
                '--inventory-file', str(inventory_file),
                '--content-dir', str(content_dir.parent),
                '--output', str(receipt_path),
                '--markdown-output', str(markdown_path),
                '--now', '2026-08-22T12:00:00+00:00',
            ])

            self.assertEqual(0, exit_code)
            payload = json.loads(receipt_path.read_text(encoding='utf-8'))
            self.assertEqual('repair', payload['disposition']['action'])
            self.assertIn('Disposition: **repair**', markdown_path.read_text(encoding='utf-8'))

    def test_cli_writes_an_error_receipt_when_the_endpoint_is_unreachable(self):
        from publishing_health import main

        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            receipt_path = root / 'receipt.json'
            exit_code = main([
                '--inventory-file', str(root / 'missing.json'),
                '--output', str(receipt_path),
                '--now', '2026-08-22T12:00:00+00:00',
            ])
            self.assertEqual(1, exit_code)
            payload = json.loads(receipt_path.read_text(encoding='utf-8'))
            self.assertEqual('error', payload['status'])
            self.assertEqual('repair', payload['disposition']['action'])


class WorkflowTriggerTests(unittest.TestCase):
    """One receipt per completed research run. No second daily schedule."""

    def setUp(self):
        self.text = WORKFLOW_PATH.read_text(encoding='utf-8')

    def document(self):
        if yaml is None:  # pragma: no cover - PyYAML is present locally
            self.skipTest('PyYAML is not installed')
        return yaml.safe_load(self.text)

    def triggers(self):
        document = self.document()
        # PyYAML reads the bare `on` key as the boolean True.
        return document.get('on', document.get(True))

    def test_the_workflow_declares_no_schedule_of_its_own(self):
        self.assertNotIn('cron', self.text)
        self.assertNotIn('schedule', self.triggers())

    def test_the_only_triggers_are_workflow_run_and_workflow_dispatch(self):
        triggers = self.triggers()
        self.assertEqual({'workflow_run', 'workflow_dispatch'}, set(triggers))
        self.assertEqual(
            ['Daily Content Opportunity Research'],
            triggers['workflow_run']['workflows'],
        )
        self.assertEqual(['completed'], triggers['workflow_run']['types'])

    def test_the_receipt_job_is_unguarded_so_a_failed_research_run_still_reports(self):
        job = self.document()['jobs']['build-receipt']
        self.assertNotIn('if', job)
        for step in job['steps']:
            self.assertNotIn('workflow_run.conclusion ==', str(step.get('if', '')))

    def test_the_source_workflow_conclusion_is_encoded_into_the_receipt(self):
        steps = self.document()['jobs']['build-receipt']['steps']
        step = next(s for s in steps if s['name'] == 'Collect research workflow metadata')
        self.assertEqual(
            '${{ github.event.workflow_run.conclusion }}',
            step['env']['SOURCE_CONCLUSION'],
        )
        self.assertIn('"$SOURCE_EVENT" = "workflow_run"', step['run'])
        self.assertIn(
            'conclusion: (if $conclusion == "" then "unknown" else $conclusion end)',
            step['run'],
        )

    def test_an_unsuccessful_source_conclusion_becomes_a_repair_check(self):
        for conclusion in ('failure', 'cancelled', 'timed_out', 'unknown'):
            with self.subTest(conclusion=conclusion):
                result = receipt(
                    inventory=inventory_payload(newest='2026-08-22T04:00:00-07:00'),
                    drafts=[],
                    candidate=eligible_candidate(),
                    research={
                        'name': 'Daily Content Opportunity Research',
                        'path': '.github/workflows/daily-content.yml',
                        'conclusion': conclusion,
                        'updatedAt': '2026-08-22T11:30:00Z',
                    },
                )
                self.assertEqual('repair', result['disposition']['action'])
                self.assertIn(
                    'research-workflow',
                    [item['check'] for item in result['disposition']['failedChecks']],
                )
                self.assertEqual(conclusion, result['research']['conclusion'])


if __name__ == '__main__':
    unittest.main()
