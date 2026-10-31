import sys
import unittest
from pathlib import Path


PIPELINE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PIPELINE_DIR))

from strategy import build_research_queue, score_candidate  # noqa: E402


class StrategyTests(unittest.TestCase):
    def candidate(self):
        return {
            'title': 'A researched opportunity',
            'lane': 'daily-local-utility',
            'category': 'transit',
            'locality': 'Burnaby',
            'storyType': 'reported-update',
            'confidence': 'current-hypothesis',
            'ratings': {
                'localRelevance': 5,
                'readerUtility': 5,
                'freshness': 5,
                'evidenceStrength': 5,
                'uniqueAngle': 4,
                'repeatVisitPotential': 4,
                'speedToUsefulDraft': 4,
            },
            'evidence': {
                'sourceUrls': ['https://a.example', 'https://b.example'],
                'primarySourceUrls': ['https://a.example'],
                'readerImpact': 'Changes the reader\'s Expo Line trip this weekend',
                'freshnessEvidence': 'Official notice published today',
                'uniqueAngleEvidence': 'Existing inventory gap',
            },
        }

    def test_researched_candidate_can_be_briefed(self):
        result = score_candidate(self.candidate())
        self.assertEqual('brief', result.decision)
        self.assertGreaterEqual(result.score, 70)

    def test_missing_rating_is_not_invented(self):
        candidate = self.candidate()
        candidate['ratings']['freshness'] = None
        result = score_candidate(candidate)
        self.assertEqual('needs-research', result.decision)
        self.assertEqual(0, result.score)

    def test_weak_evidence_blocks_high_total_score(self):
        candidate = self.candidate()
        candidate['ratings']['evidenceStrength'] = 2
        result = score_candidate(candidate)
        self.assertEqual('repair', result.decision)
        self.assertIn('Evidence strength is below the release threshold', result.reasons)

    def test_secondary_lead_cannot_qualify_without_primary_source(self):
        candidate = self.candidate()
        candidate['evidence']['sourceUrls'] = [
            'https://publication.example/vancouver/store-closing',
            'https://context.example/neighbourhood',
        ]
        candidate['evidence']['primarySourceUrls'] = []

        result = score_candidate(candidate)

        self.assertEqual('repair', result.decision)
        self.assertIn('No primary source recorded', result.reasons)

    def test_secondary_lead_cannot_self_declare_as_primary_source(self):
        candidate = self.candidate()
        candidate['discoveryRole'] = 'lead'
        candidate['sourceUrl'] = 'https://publication.example/vancouver/store-closing'
        candidate['evidence']['sourceUrls'] = [
            'https://publication.example/vancouver/store-closing',
            'https://context.example/neighbourhood',
        ]
        candidate['evidence']['primarySourceUrls'] = [
            'https://www.publication.example/vancouver/store-closing',
        ]

        result = score_candidate(candidate)

        self.assertEqual('repair', result.decision)
        self.assertIn(
            'Discovery-lead domain cannot be used as a primary source',
            result.reasons,
        )
        self.assertIn('No primary source recorded', result.reasons)

    def test_secondary_tier_without_role_still_cannot_self_declare_primary(self):
        candidate = self.candidate()
        candidate['sourceTier'] = 'secondary'
        candidate['url'] = 'https://publication.example/store-closing'
        candidate['evidence']['primarySourceUrls'] = [
            'https://publication.example/store-closing',
        ]

        result = score_candidate(candidate)

        self.assertEqual('repair', result.decision)
        self.assertIn(
            'Discovery-lead domain cannot be used as a primary source',
            result.reasons,
        )

    def test_scheme_less_primary_source_is_rejected(self):
        candidate = self.candidate()
        candidate['evidence']['primarySourceUrls'] = [
            'city.example/official-notice',
        ]

        result = score_candidate(candidate)

        self.assertEqual('repair', result.decision)
        self.assertIn(
            'Primary source URLs must use http or https',
            result.reasons,
        )

    def test_missing_locality_blocks_publication(self):
        candidate = self.candidate()
        candidate['locality'] = ''
        result = score_candidate(candidate)
        self.assertEqual('repair', result.decision)
        self.assertIn('No Lower Mainland locality recorded', result.reasons)

    def test_bulletin_can_use_one_primary_source(self):
        candidate = self.candidate()
        candidate['storyType'] = 'bulletin'
        candidate['evidence']['sourceUrls'] = ['https://a.example']
        result = score_candidate(candidate)
        self.assertEqual('brief', result.decision)

    def test_research_queue_preserves_source_topic_and_skip_contract(self):
        queue = build_research_queue([
            {
                'title': 'Community market returns Saturday',
                'sourceName': 'City events',
                'sourceTier': 'primary',
                'url': 'https://city.example/events/community-market',
                'locality': 'Port Coquitlam',
                'category': 'things-to-do',
                'sourceTopic': 'civic and community events',
                'storyType': 'reported-update',
            }
        ])

        self.assertEqual('civic and community events', queue[0]['sourceTopic'])
        self.assertEqual('reported-update', queue[0]['storyType'])
        self.assertIn('skipReasonIfUnqualified', queue[0])
        self.assertIn('primary-source support', queue[0]['skipReasonIfUnqualified'])

    def test_research_queue_preserves_secondary_discovery_lead_boundary(self):
        queue = build_research_queue([{
            'title': 'Longtime Vancouver store set to close',
            'sourceName': 'Local publication leads',
            'sourceTier': 'secondary',
            'discoveryRole': 'lead',
            'url': 'https://publication.example/vancouver/store-closing',
            'locality': 'Vancouver',
            'category': 'local-news',
        }])

        self.assertEqual('secondary', queue[0]['sourceTier'])
        self.assertEqual('lead', queue[0]['discoveryRole'])
        self.assertIn(
            'independent reporting angle not copied from a discovery lead',
            queue[0]['requiredEvidence'],
        )


if __name__ == '__main__':
    unittest.main()
