import json
import sys
import tempfile
import unittest
from pathlib import Path
from urllib.parse import parse_qs, urlparse


PIPELINE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PIPELINE_DIR))

from vercel_analytics import build_export, discover_articles  # noqa: E402


class FakeResponse:
    def __init__(self, payload):
        self.payload = payload

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def read(self):
        return json.dumps(self.payload).encode('utf-8')


class VercelAnalyticsTests(unittest.TestCase):
    def write_article(self, root: Path, category: str, slug: str, published_at: str):
        directory = root / category
        directory.mkdir(parents=True, exist_ok=True)
        (directory / f'{slug}.mdx').write_text(
            "\n".join([
                '---',
                f"title: '{slug}'",
                f"slug: '{slug}'",
                f"category: '{category}'",
                "storyType: 'bulletin'",
                f"publishedAt: '{published_at}'",
                '---',
                '',
                'Body text.',
            ]),
            encoding='utf-8',
        )

    def test_discovers_articles_with_canonical_paths(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self.write_article(root, 'transit', 'fare-update', '2026-07-19T00:00:00-07:00')
            [article] = discover_articles(root)
            self.assertEqual('/transit/fare-update', article['path'])
            self.assertEqual('transit', article['category'])
            self.assertEqual('bulletin', article['storyType'])

    def test_missing_credentials_returns_unavailable_without_zeroes(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self.write_article(root, 'transit', 'fare-update', '2026-07-19T00:00:00-07:00')
            payload = build_export(
                content_dir=root,
                since='2026-07-13T00:00:00Z',
                until='2026-07-20T00:00:00Z',
                env={},
            )
            self.assertEqual('unavailable', payload['status'])
            self.assertEqual([], payload['articles'])
            self.assertIn('VERCEL_PROJECT_ID', payload['missing'])

    def test_imports_page_views_and_keeps_other_metrics_null(self):
        calls = []

        def opener(request, timeout=None):
            calls.append((request, timeout))
            return FakeResponse({'data': [{'requestPath': '/transit/fare-update', 'pageViews': 17}]})

        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self.write_article(root, 'transit', 'fare-update', '2026-07-19T00:00:00-07:00')
            payload = build_export(
                content_dir=root,
                since='2026-07-13T00:00:00Z',
                until='2026-07-20T00:00:00Z',
                env={
                    'VERCEL_TOKEN': 'token',
                    'VERCEL_PROJECT_ID': 'prj_test',
                    'VERCEL_TEAM_ID': 'team_test',
                },
                opener=opener,
            )

        self.assertEqual('available', payload['status'])
        [article] = payload['articles']
        self.assertEqual(17, article['pageViews'])
        self.assertIsNone(article['engagedSessions'])
        self.assertIsNone(article['qualifiedSponsorInquiries'])
        request, timeout = calls[0]
        self.assertEqual(30, timeout)
        parsed = urlparse(request.full_url)
        query = parse_qs(parsed.query)
        self.assertEqual(['prj_test'], query['projectId'])
        self.assertEqual(["requestPath eq '/transit/fare-update'"], query['filter'])
        self.assertEqual('Bearer token', request.headers['Authorization'])


if __name__ == '__main__':
    unittest.main()
