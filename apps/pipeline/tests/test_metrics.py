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

    def test_reported_click_through_rate_is_preserved(self):
        [article] = normalize_articles([{
            'slug': 'reported-ctr',
            'impressions': 1000,
            'ctr': 0.004,
        }])
        self.assertEqual(0.004, article['ctr'])
        self.assertIsNone(article['clicks'])

    def test_a_reported_zero_click_through_rate_stays_zero(self):
        [article] = normalize_articles([{
            'slug': 'measured-zero-ctr',
            'impressions': 1000,
            'clicks': 0,
            'ctr': 0,
        }])
        self.assertEqual(0, article['ctr'])

    def test_an_unreported_click_through_rate_stays_none(self):
        [article] = normalize_articles([{
            'slug': 'no-ctr',
            'impressions': 1000,
        }])
        self.assertIsNone(article['ctr'])

    def test_derived_click_through_rate_is_used_when_none_is_reported(self):
        [article] = normalize_articles([{
            'slug': 'derived-ctr',
            'impressions': 1000,
            'clicks': 40,
        }])
        self.assertEqual(0.04, article['ctr'])

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


def cohort(published, *, beat='vancouver-now', count=5, **metrics):
    return [
        {
            'slug': f'{beat}-{index}',
            'beat': beat,
            'publishedAt': published,
            **metrics,
        }
        for index in range(count)
    ]


class DecisionWindowTests(unittest.TestCase):
    """Each window is judged under its own maturity, and says which one."""

    def decide(self, published, **kwargs):
        [article] = build_article_decisions(
            [{'slug': 'one', 'publishedAt': published}],
            now=NOW,
            **kwargs,
        )
        return article

    def test_default_maturity_is_unchanged_at_28_days(self):
        self.assertEqual(28, self.decide('2026-06-17T00:00:00Z')['maturityDays'])
        self.assertEqual('28-day', self.decide('2026-06-17T00:00:00Z')['decisionPeriod'])

    def test_age_6_is_observed_in_both_windows(self):
        default = self.decide('2026-07-09T00:00:00Z')
        seven = self.decide('2026-07-09T00:00:00Z', maturity_days=7, period_label='7-day')
        self.assertEqual(6, default['ageDays'])
        self.assertEqual('observe', default['decision'])
        self.assertEqual(
            'first 7-day measurement window is incomplete', default['decisionReason']
        )
        self.assertEqual('observe', seven['decision'])
        self.assertEqual(
            'first 7-day measurement window is incomplete', seven['decisionReason']
        )

    def test_age_7_is_mature_only_in_the_seven_day_window(self):
        default = self.decide('2026-07-08T00:00:00Z')
        seven = self.decide('2026-07-08T00:00:00Z', maturity_days=7, period_label='7-day')
        self.assertEqual(7, default['ageDays'])
        self.assertEqual('observe', default['decision'])
        self.assertEqual('28-day decision window is incomplete', default['decisionReason'])
        self.assertEqual('collect-comparable-reps', seven['decision'])

    def test_age_27_is_still_incomplete_in_the_28_day_window(self):
        article = self.decide('2026-06-18T00:00:00Z')
        self.assertEqual(27, article['ageDays'])
        self.assertEqual('observe', article['decision'])
        self.assertEqual('28-day decision window is incomplete', article['decisionReason'])

    def test_age_28_is_mature_in_the_28_day_window(self):
        article = self.decide('2026-06-17T00:00:00Z')
        self.assertEqual(28, article['ageDays'])
        self.assertEqual('collect-comparable-reps', article['decision'])

    def test_unavailable_metrics_state_the_window_that_asked_for_them(self):
        records = cohort('2026-07-08T00:00:00Z')
        [article] = build_article_decisions(
            records, now=NOW, maturity_days=7, period_label='7-day'
        )[:1]
        self.assertEqual('repair-measurement', article['decision'])
        self.assertEqual(
            'required 7-day traffic metrics are unavailable', article['decisionReason']
        )

    def test_a_seven_day_keep_is_never_emitted_from_28_day_semantics(self):
        records = cohort('2026-07-08T00:00:00Z', impressions=100, clicks=10, engagedSessions=20)
        default = build_article_decisions(records, now=NOW)
        seven = build_article_decisions(
            records, now=NOW, maturity_days=7, period_label='7-day'
        )
        self.assertEqual({'observe'}, {article['decision'] for article in default})
        self.assertEqual({'keep'}, {article['decision'] for article in seven})

    def test_the_period_label_defaults_to_the_maturity(self):
        article = self.decide('2026-07-05T00:00:00Z', maturity_days=14)
        self.assertEqual('14-day', article['decisionPeriod'])
        self.assertEqual('14-day decision window is incomplete', article['decisionReason'])

    def test_the_summary_reports_the_window_it_evaluated(self):
        summary = build_metrics_summary(
            {'status': 'available', 'sources': ['test'], 'articles': cohort('2026-07-08T00:00:00Z')},
            now=NOW,
            maturity_days=7,
            period_label='7-day',
        )
        self.assertEqual('7-day', summary['period'])
        self.assertEqual(7, summary['maturityDays'])

    def test_an_unavailable_summary_still_names_its_window(self):
        summary = build_metrics_summary(None, now=NOW, maturity_days=7, period_label='7-day')
        self.assertEqual('unavailable', summary['status'])
        self.assertEqual('7-day', summary['period'])
        self.assertEqual(7, summary['maturityDays'])

    def test_the_default_summary_window_is_unchanged(self):
        summary = build_metrics_summary(
            {'status': 'available', 'sources': [], 'articles': cohort('2026-06-01T00:00:00Z')},
            now=NOW,
        )
        self.assertEqual('28-day', summary['period'])
        self.assertEqual(28, summary['maturityDays'])


if __name__ == '__main__':
    unittest.main()
