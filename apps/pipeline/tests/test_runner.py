import sys
import unittest
from pathlib import Path


PIPELINE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PIPELINE_DIR))

from runner import (  # noqa: E402
    eligible_candidates_from_payload,
    primary_source_urls_for_topic,
    requires_manual_approval,
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


if __name__ == '__main__':
    unittest.main()
