import sys
import unittest
from pathlib import Path


PIPELINE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PIPELINE_DIR))

from runner import eligible_candidates_from_payload  # noqa: E402


class RunnerEligibilityTests(unittest.TestCase):
    def test_only_brief_decisions_are_eligible(self):
        payload = {
            'results': [
                {'title': 'Eligible', 'decision': 'brief', 'candidate': {'category': 'science'}},
                {'title': 'Repair', 'decision': 'repair', 'candidate': {'category': 'health'}},
                {'title': 'Missing', 'decision': 'needs-research', 'candidate': {}},
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
