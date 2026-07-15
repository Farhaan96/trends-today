import sys
import unittest
from datetime import datetime, timezone
from pathlib import Path


PIPELINE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PIPELINE_DIR))

from metrics import build_article_decisions, build_metrics_summary  # noqa: E402


NOW = datetime(2026, 7, 15, tzinfo=timezone.utc)


class MetricsTests(unittest.TestCase):
    def test_missing_metrics_remain_unavailable(self):
        result = build_metrics_summary(None, now=NOW)
        self.assertEqual('unavailable', result['status'])
        self.assertEqual('repair-measurement', result['decision'])
        self.assertEqual([], result['articles'])

    def test_missing_values_are_not_coerced_to_zero(self):
        [article] = build_article_decisions(
            [{'slug': 'one', 'publishedAt': '2026-07-01T00:00:00Z'}],
            now=NOW,
        )
        self.assertIsNone(article['impressions'])
        self.assertIsNone(article['engagedSessions'])
        self.assertIsNone(article['ctr'])

    def test_young_article_is_observed(self):
        [article] = build_article_decisions(
            [{'slug': 'one', 'publishedAt': '2026-07-10T00:00:00Z'}],
            now=NOW,
        )
        self.assertEqual('observe', article['decision'])

    def test_mature_cohort_uses_relative_decisions(self):
        records = []
        for index, values in enumerate(((100, 10, 20), (120, 12, 24), (140, 14, 28), (160, 16, 32), (180, 18, 36))):
            impressions, clicks, engaged = values
            records.append({
                'slug': f'article-{index}',
                'beat': 'software-update-utility',
                'publishedAt': '2026-05-01T00:00:00Z',
                'impressions': impressions,
                'clicks': clicks,
                'engagedSessions': engaged,
            })
        result = build_article_decisions(records, now=NOW)
        self.assertEqual('stop', result[0]['decision'])
        self.assertEqual('keep', result[-1]['decision'])


if __name__ == '__main__':
    unittest.main()
