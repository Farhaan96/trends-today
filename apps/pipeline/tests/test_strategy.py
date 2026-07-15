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
            'lane': 'compounding-search',
            'confidence': 'current-hypothesis',
            'ratings': {
                'audienceFit': 5,
                'demandSignal': 4,
                'evidenceStrength': 5,
                'uniqueAngle': 4,
                'compoundingValue': 5,
                'monetizationFit': 3,
                'appFit': 2,
                'speedToUsefulDraft': 4,
            },
            'evidence': {
                'sourceUrls': ['https://a.example', 'https://b.example', 'https://c.example'],
                'demandEvidence': 'Search Console query evidence',
                'uniqueAngleEvidence': 'Existing inventory gap',
            },
        }

    def test_researched_candidate_can_be_briefed(self):
        result = score_candidate(self.candidate())
        self.assertEqual('brief', result.decision)
        self.assertGreaterEqual(result.score, 70)

    def test_missing_rating_is_not_invented(self):
        candidate = self.candidate()
        candidate['ratings']['demandSignal'] = None
        result = score_candidate(candidate)
        self.assertEqual('needs-research', result.decision)
        self.assertEqual(0, result.score)

    def test_weak_evidence_blocks_high_total_score(self):
        candidate = self.candidate()
        candidate['ratings']['evidenceStrength'] = 2
        result = score_candidate(candidate)
        self.assertEqual('repair', result.decision)
        self.assertIn('Evidence strength is below the release threshold', result.reasons)


if __name__ == '__main__':
    unittest.main()
