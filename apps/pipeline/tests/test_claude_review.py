import sys
import unittest
from pathlib import Path


PIPELINE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PIPELINE_DIR))

from claude_review import validate_runner_result  # noqa: E402


class ClaudeRunnerResultTests(unittest.TestCase):
    DIGEST = 'a' * 64

    def result(self, **overrides):
        value = {
            'status': 'success',
            'verdict': 'NO BLOCKERS',
            'modelUsed': 'opus',
            'review': f'NO BLOCKERS\nCANDIDATE_SHA256: {self.DIGEST}',
        }
        value.update(overrides)
        return value

    def test_accepts_current_runner_success_contract(self):
        result = self.result()
        self.assertIs(validate_runner_result(result, 0, self.DIGEST), result)

    def test_rejects_non_success_runner_status(self):
        with self.assertRaises(RuntimeError):
            validate_runner_result(self.result(status='malformed_verdict'), 4, self.DIGEST)

    def test_rejects_blockers(self):
        with self.assertRaises(PermissionError):
            validate_runner_result(self.result(verdict='BLOCKERS'), 0, self.DIGEST)

    def test_rejects_review_without_exact_digest(self):
        with self.assertRaises(RuntimeError):
            validate_runner_result(self.result(review='NO BLOCKERS'), 0, self.DIGEST)


if __name__ == '__main__':
    unittest.main()
