import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch


PIPELINE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PIPELINE_DIR))

from codex_review import run_review, validate_codex_result  # noqa: E402
from review import candidate_sha256, verify_codex_review  # noqa: E402


class CodexReviewTests(unittest.TestCase):
    DIGEST = 'a' * 64
    REPOSITORY_SHA = 'b' * 40

    def result(self, **overrides):
        value = {
            'verdict': 'NO BLOCKERS',
            'candidateSha256': self.DIGEST,
            'repositorySha': self.REPOSITORY_SHA,
            'blockers': [],
            'summary': 'The exact candidate is ready.',
        }
        value.update(overrides)
        return value

    def test_accepts_exact_structured_no_blockers_result(self):
        result = self.result()
        self.assertIs(
            validate_codex_result(result, self.DIGEST, self.REPOSITORY_SHA),
            result,
        )

    def test_rejects_blockers(self):
        with self.assertRaises(PermissionError):
            validate_codex_result(
                self.result(verdict='BLOCKERS', blockers=['Unsupported claim']),
                self.DIGEST,
                self.REPOSITORY_SHA,
            )

    def test_rejects_wrong_candidate_or_repository_identity(self):
        with self.assertRaises(RuntimeError):
            validate_codex_result(
                self.result(candidateSha256='c' * 64),
                self.DIGEST,
                self.REPOSITORY_SHA,
            )
        with self.assertRaises(RuntimeError):
            validate_codex_result(
                self.result(repositorySha='d' * 40),
                self.DIGEST,
                self.REPOSITORY_SHA,
            )

    def test_run_review_uses_authenticated_read_only_codex_and_writes_artifact(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            candidate = root / 'artifacts/editorial/release-candidates/science/story.mdx'
            candidate.parent.mkdir(parents=True)
            candidate.write_text(
                '---\nstatus: release-candidate\n---\n\nBody.\n',
                encoding='utf-8',
            )
            digest = candidate_sha256(candidate)

            def fake_run(command, **kwargs):
                if command[:3] == ['git', 'rev-parse', 'HEAD']:
                    return subprocess.CompletedProcess(command, 0, stdout=self.REPOSITORY_SHA, stderr='')
                output_path = Path(command[command.index('--output-last-message') + 1])
                output_path.write_text(
                    json.dumps({
                        'verdict': 'NO BLOCKERS',
                        'candidateSha256': digest,
                        'repositorySha': self.REPOSITORY_SHA,
                        'blockers': [],
                        'summary': 'Ready.',
                    }),
                    encoding='utf-8',
                )
                return subprocess.CompletedProcess(
                    command,
                    0,
                    stdout=json.dumps({'type': 'thread.started', 'thread_id': 'thread_123'}),
                    stderr='',
                )

            with (
                patch('codex_review.shutil.which', return_value='codex'),
                patch('codex_review.subprocess.run', side_effect=fake_run) as codex_run,
            ):
                output = run_review(candidate, root)

            command = codex_run.call_args_list[1].args[0]
            self.assertIn('--sandbox', command)
            self.assertIn('read-only', command)
            self.assertIn('--ephemeral', command)
            self.assertEqual('gpt-5.6-sol', command[command.index('--model') + 1])
            artifact = json.loads(output.read_text(encoding='utf-8'))
            self.assertEqual('codex', artifact['reviewer'])
            self.assertEqual(digest, artifact['candidateSha256'])
            self.assertEqual(self.REPOSITORY_SHA, artifact['repositorySha'])
            self.assertEqual('codex-cli-oauth', artifact['reviewBackend'])
            self.assertEqual('thread_123', artifact['reviewRunId'])

    def test_verifier_rejects_missing_authenticated_run_provenance(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            candidate = root / 'artifacts/editorial/release-candidates/science/story.mdx'
            candidate.parent.mkdir(parents=True)
            candidate.write_text('Body.\n', encoding='utf-8')
            review = root / 'artifacts/editorial/reviews/science/story.json'
            review.parent.mkdir(parents=True)
            review.write_text(json.dumps({
                'version': 1,
                'reviewer': 'codex',
                'verdict': 'NO BLOCKERS',
                'candidateSha256': candidate_sha256(candidate),
                'repositorySha': self.REPOSITORY_SHA,
                'reviewedAt': '2026-11-16T12:00:00+00:00',
                'modelUsed': 'gpt-5.6-sol',
            }), encoding='utf-8')
            with self.assertRaisesRegex(ValueError, 'authenticated CLI backend'):
                verify_codex_review(candidate, review, root)


if __name__ == '__main__':
    unittest.main()
