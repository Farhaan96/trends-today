import sys
import json
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch


PIPELINE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PIPELINE_DIR))

from claude_review import run_review, validate_runner_result  # noqa: E402
from review import candidate_sha256  # noqa: E402


class ClaudeRunnerResultTests(unittest.TestCase):
    DIGEST = 'a' * 64

    def result(self, **overrides):
        value = {
            'status': 'success',
            'verdict': 'NO BLOCKERS',
            'modelUsed': 'claude-opus-5',
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

    def test_rejects_any_non_opus_5_model(self):
        for model in ('fable', 'claude-fable-5', 'claude-haiku-4-5-20251001', 'opus'):
            with self.subTest(model=model):
                with self.assertRaises(PermissionError):
                    validate_runner_result(self.result(modelUsed=model), 0, self.DIGEST)

    def test_run_review_requests_only_opus_5_without_fallback(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            candidate = root / 'artifacts/editorial/release-candidates/science/story.mdx'
            candidate.parent.mkdir(parents=True)
            candidate.write_text('---\nstatus: release-candidate\n---\n\nBody.\n', encoding='utf-8')
            digest = candidate_sha256(candidate)
            runner_result = {
                'status': 'success',
                'verdict': 'NO BLOCKERS',
                'modelUsed': 'claude-opus-5',
                'observedModels': ['claude-opus-5'],
                'review': f'NO BLOCKERS\nCANDIDATE_SHA256: {digest}',
            }
            calls = [
                subprocess.CompletedProcess([], 0, stdout='b' * 40, stderr=''),
                subprocess.CompletedProcess([], 0, stdout=json.dumps(runner_result), stderr=''),
            ]
            with patch('claude_review.subprocess.run', side_effect=calls) as run:
                output = run_review(candidate, root, Path('runner.ps1'))
            command = run.call_args_list[1].args[0]
            self.assertIn('claude-opus-5', command)
            self.assertIn('-DisableFallback', command)
            self.assertNotIn('fable', command)
            self.assertTrue(output.exists())


if __name__ == '__main__':
    unittest.main()
