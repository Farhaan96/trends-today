import sys
import tempfile
import unittest
from pathlib import Path


PIPELINE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PIPELINE_DIR))

from scorecard import build_scorecard  # noqa: E402


class ScorecardTests(unittest.TestCase):
    def test_missing_analytics_stays_unavailable(self):
        with tempfile.TemporaryDirectory() as temp:
            content = Path(temp) / 'content'
            science = content / 'science'
            science.mkdir(parents=True)
            (science / 'one.mdx').write_text(
                "---\npublishedAt: '2026-07-01T00:00:00Z'\n---\nBody\n",
                encoding='utf-8',
            )
            result = build_scorecard(content)
            self.assertEqual(1, result['inventory']['totalActiveArticles'])
            self.assertEqual('unavailable', result['analytics']['status'])
            self.assertEqual('repair-measurement-before-scaling-volume', result['decision'])

    def test_supplied_analytics_is_preserved(self):
        with tempfile.TemporaryDirectory() as temp:
            analytics = {
                'status': 'available',
                'articles': [{
                    'slug': 'one',
                    'publishedAt': '2026-07-01T00:00:00Z',
                    'clicks': 4,
                }],
            }
            result = build_scorecard(Path(temp), analytics)
            self.assertEqual('available', result['analytics']['status'])
            self.assertEqual(4.0, result['analytics']['articles'][0]['clicks'])
            self.assertEqual('review-article-level-keep-repair-stop-decisions', result['decision'])


if __name__ == '__main__':
    unittest.main()
