import sys
import unittest
from unittest.mock import patch
from pathlib import Path


PIPELINE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PIPELINE_DIR))

from runner import (  # noqa: E402
    eligible_candidates_from_payload,
    primary_source_urls_for_topic,
    requires_manual_approval,
    has_manual_approval,
    resolve_category,
    seed_urls_for_topic,
)


class RunnerSourceTests(unittest.TestCase):
    def test_reviewed_research_urls_are_preserved_without_duplicates(self):
        topic = {
            'sourceUrl': 'https://city.example/news/update',
            'sourceTier': 'primary',
            'evidence': {
                'primarySourceUrls': ['https://city.example/news/update'],
                'sourceUrls': [
                    'https://city.example/news/update',
                    'https://transit.example/advisory',
                ],
            },
        }

        self.assertEqual(
            [
                'https://city.example/news/update',
                'https://transit.example/advisory',
            ],
            seed_urls_for_topic(topic),
        )

    def test_discovery_source_is_marked_primary(self):
        topic = {
            'url': 'https://city.example/news/update',
            'sourceTier': 'primary',
            'evidence': {'sourceUrls': ['https://secondary.example/report']},
        }

        self.assertEqual(
            {'https://city.example/news/update'},
            primary_source_urls_for_topic(topic),
        )

    def test_discovery_lead_is_not_retrieved_or_treated_as_primary(self):
        topic = {
            'sourceUrl': 'https://publication.example/vancouver/store-closing',
            'sourceTier': 'secondary',
            'discoveryRole': 'lead',
            'evidence': {
                'primarySourceUrls': [
                    'https://www.publication.example/vancouver/store-closing',
                    'https://retailer.example/store/vancouver',
                ],
                'sourceUrls': [
                    'https://publication.example/vancouver/store-closing',
                    'https://city.example/permits/store-renovation',
                ],
            },
        }

        self.assertEqual(
            [
                'https://retailer.example/store/vancouver',
                'https://city.example/permits/store-renovation',
            ],
            seed_urls_for_topic(topic),
        )
        self.assertEqual(
            {'https://retailer.example/store/vancouver'},
            primary_source_urls_for_topic(topic),
        )

    def test_sensitive_story_signal_requires_manual_approval(self):
        config = {
            'automaticPublishing': {
                'manualApprovalKeywords': ['missing person', 'fatal']
            }
        }
        article = {
            'title': 'Search continues in Surrey',
            'body_mdx': 'Police issued a missing person notice on Friday.',
        }

        self.assertTrue(requires_manual_approval({}, article, config))

    def test_routine_service_update_does_not_require_manual_approval(self):
        config = {
            'automaticPublishing': {
                'manualApprovalKeywords': ['missing person', 'fatal']
            }
        }
        article = {
            'title': 'Expo Line service changes this weekend',
            'body_mdx': 'TransLink says trains will run every 12 minutes.',
        }

        self.assertFalse(requires_manual_approval({}, article, config))

    def test_topic_boolean_cannot_spoof_manual_approval(self):
        with patch.dict('os.environ', {}, clear=True):
            self.assertFalse(has_manual_approval({'manualApprovalRecorded': True}))

    def test_operator_secret_records_manual_approval(self):
        with patch.dict(
            'os.environ', {'TRENDS_TODAY_SENSITIVE_APPROVAL_TOKEN': 'operator-secret'}
        ):
            self.assertTrue(has_manual_approval({'manualApprovalToken': 'operator-secret'}))
            self.assertFalse(has_manual_approval({'manualApprovalToken': 'wrong-secret'}))


class RunnerEligibilityTests(unittest.TestCase):
    def test_only_brief_decisions_are_eligible(self):
        payload = {
            'results': [
                {
                    'title': 'Eligible',
                    'decision': 'brief',
                    'candidate': {'category': 'science'},
                },
                {
                    'title': 'Repair',
                    'decision': 'repair',
                    'candidate': {'category': 'health'},
                },
                {
                    'title': 'Missing',
                    'decision': 'needs-research',
                    'candidate': {},
                },
            ]
        }
        self.assertEqual(
            [{'title': 'Eligible', 'category': 'science'}],
            eligible_candidates_from_payload(payload),
        )

    def test_invalid_payload_is_rejected(self):
        with self.assertRaises(ValueError):
            eligible_candidates_from_payload({'results': 'not-a-list'})


class RunnerCategoryTests(unittest.TestCase):
    def test_non_food_store_closing_routes_to_local_news(self):
        topic = {
            'title': 'Vancouver Sport Chek store set to close after nearly 20 years'
        }

        self.assertEqual('local-news', resolve_category(topic, {}))

    def test_restaurant_opening_stays_in_food_and_drink(self):
        topic = {'title': 'Family-run Vancouver restaurant opening in Kitsilano'}

        self.assertEqual('food-drink', resolve_category(topic, {}))

    def test_explicit_researched_category_still_wins(self):
        topic = {
            'title': 'Neighbourhood cafe closes after 20 years',
            'category': 'local-news',
        }

        self.assertEqual('local-news', resolve_category(topic, {}))

    def test_public_hearing_routes_to_housing_not_food_and_drink(self):
        topic = {'title': 'Public hearing set for Vancouver rezoning proposal'}

        self.assertEqual('housing', resolve_category(topic, {}))

    def test_public_consultation_defaults_to_local_news(self):
        topic = {'title': 'Public consultation opens on Richmond community plan'}

        self.assertEqual('local-news', resolve_category(topic, {}))

    def test_actual_pub_closing_routes_to_food_and_drink(self):
        topic = {'title': 'Long-running Vancouver pub closes at end of month'}

        self.assertEqual('food-drink', resolve_category(topic, {}))

    def test_retail_space_phrase_does_not_route_to_space(self):
        topic = {'title': 'New retailer takes over vacant Vancouver retail space'}

        self.assertEqual('local-news', resolve_category(topic, {}))


if __name__ == '__main__':
    unittest.main()
