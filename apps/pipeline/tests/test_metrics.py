import sys
import unittest
from datetime import datetime, timezone
from pathlib import Path


PIPELINE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PIPELINE_DIR))

from metrics import build_article_decisions, build_metrics_summary, normalize_articles  # noqa: E402


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
        self.assertIsNone(article['pageRpm'])
        self.assertIsNone(article['activeViewRate'])

    def test_ad_and_sponsor_metrics_are_derived_only_when_available(self):
        [article] = normalize_articles([{
            'slug': 'commercial-test',
            'pageViews': 2000,
            'measurableAdImpressions': 1000,
            'viewableAdImpressions': 650,
            'adRevenue': 24,
            'sponsorshipRevenue': 100,
            'contentCost': 30,
            'qualifiedSponsorInquiries': 1,
        }])
        self.assertEqual(12, article['pageRpm'])
        self.assertEqual(0.65, article['activeViewRate'])
        self.assertEqual(124, article['revenue'])
        self.assertEqual(94, article['contribution'])

    def test_partial_revenue_components_do_not_create_a_false_total(self):
        [article] = normalize_articles([{
            'slug': 'partial-commercial-test',
            'pageViews': 2000,
            'adRevenue': 24,
            'contentCost': 30,
        }])
        self.assertEqual(12, article['pageRpm'])
        self.assertIsNone(article['revenue'])
        self.assertIsNone(article['contribution'])

    def test_young_article_is_observed(self):
        [article] = build_article_decisions(
            [{'slug': 'one', 'publishedAt': '2026-07-10T00:00:00Z'}],
            now=NOW,
        )
        self.assertEqual('observe', article['decision'])

    def test_invalid_publication_date_repairs_metadata(self):
        [article] = build_article_decisions(
            [{'slug': 'one', 'publishedAt': 'not-a-date'}],
            now=NOW,
        )
        self.assertEqual('repair-metadata', article['decision'])

    def test_small_mature_cohort_collects_more_reps(self):
        [article] = build_article_decisions(
            [{'slug': 'one', 'publishedAt': '2026-05-01T00:00:00Z'}],
            now=NOW,
        )
        self.assertEqual('collect-comparable-reps', article['decision'])

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

    def test_available_demand_with_weak_ctr_is_repaired(self):
        records = []
        for index in range(5):
            records.append({
                'slug': f'article-{index}',
                'beat': 'vancouver-now',
                'publishedAt': '2026-05-01T00:00:00Z',
                'impressions': 200 if index == 0 else 100,
                'clicks': 2 if index == 0 else 10,
                'engagedSessions': 5 if index == 0 else 20,
            })
        result = build_article_decisions(records, now=NOW)
        self.assertEqual('repair', result[0]['decision'])

    def test_missing_mature_metrics_repairs_measurement(self):
        records = [{
            'slug': f'article-{index}',
            'beat': 'remarkable-explained',
            'publishedAt': '2026-05-01T00:00:00Z',
            'impressions': 100 if index else None,
            'engagedSessions': 10 if index else None,
        } for index in range(5)]
        result = build_article_decisions(records, now=NOW)
        self.assertEqual('repair-measurement', result[0]['decision'])


if __name__ == '__main__':
    unittest.main()
