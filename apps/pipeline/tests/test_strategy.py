import sys
import unittest
from pathlib import Path


PIPELINE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PIPELINE_DIR))

from strategy import score_candidate  # noqa: E402


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


if __name__ == '__main__':
    unittest.main()
