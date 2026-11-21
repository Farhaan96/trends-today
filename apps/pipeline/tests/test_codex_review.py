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
    THREAD_ID = '019a8f5e-6f5d-7a21-8d9c-52e8b09d9a70'

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

            codex = root / 'approved-codex'
            codex.write_text('trusted test cli', encoding='utf-8')
            codex_digest = candidate_sha256(codex)

            def fake_run(command, **kwargs):
                if command[1:] == ['login', 'status']:
                    return subprocess.CompletedProcess(
                        command, 0, stdout='', stderr='Logged in using ChatGPT\n'
                    )
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
                    stdout=json.dumps({'type': 'thread.started', 'thread_id': self.THREAD_ID}),
                    stderr='',
                )

            with patch('codex_review.subprocess.run', side_effect=fake_run) as codex_run:
                output = run_review(candidate, root, env={
                    'CODEX_RELEASE_CLI': str(codex),
                    'CODEX_RELEASE_CLI_SHA256': codex_digest,
                })

            command = codex_run.call_args_list[2].args[0]
            review_call_kwargs = codex_run.call_args_list[2].kwargs
            self.assertNotIn('timeout', review_call_kwargs)
            self.assertIn('--sandbox', command)
            self.assertIn('read-only', command)
            self.assertIn('--ephemeral', command)
            self.assertEqual('gpt-5.6-sol', command[command.index('--model') + 1])
            artifact = json.loads(output.read_text(encoding='utf-8'))
            self.assertEqual('codex', artifact['reviewer'])
            self.assertEqual(digest, artifact['candidateSha256'])
            self.assertEqual(self.REPOSITORY_SHA, artifact['repositorySha'])
            self.assertEqual('codex-cli-oauth', artifact['reviewBackend'])
            self.assertEqual('chatgpt-oauth', artifact['authenticationStatus'])
            self.assertEqual(codex_digest, artifact['codexCliSha256'])
            self.assertEqual(self.THREAD_ID, artifact['reviewRunId'])

    def test_run_review_fails_closed_without_codex_thread_id(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            candidate = root / 'artifacts/editorial/release-candidates/science/story.mdx'
            candidate.parent.mkdir(parents=True)
            candidate.write_text('Body.\n', encoding='utf-8')
            digest = candidate_sha256(candidate)

            codex = root / 'approved-codex'
            codex.write_text('trusted test cli', encoding='utf-8')
            codex_digest = candidate_sha256(codex)

            def fake_run(command, **kwargs):
                if command[1:] == ['login', 'status']:
                    return subprocess.CompletedProcess(
                        command, 0, stdout='', stderr='Logged in using ChatGPT\n'
                    )
                if command[:3] == ['git', 'rev-parse', 'HEAD']:
                    return subprocess.CompletedProcess(command, 0, stdout=self.REPOSITORY_SHA, stderr='')
                output_path = Path(command[command.index('--output-last-message') + 1])
                output_path.write_text(json.dumps(self.result(
                    candidateSha256=digest,
                )), encoding='utf-8')
                return subprocess.CompletedProcess(command, 0, stdout='', stderr='')

            with patch('codex_review.subprocess.run', side_effect=fake_run):
                with self.assertRaisesRegex(RuntimeError, 'valid thread.started thread_id'):
                    run_review(candidate, root, env={
                        'CODEX_RELEASE_CLI': str(codex),
                        'CODEX_RELEASE_CLI_SHA256': codex_digest,
                    })

    def test_release_head_review_rejects_dirty_worktree_before_codex(self):
        with tempfile.TemporaryDirectory() as temp, tempfile.TemporaryDirectory() as output_temp:
            root = Path(temp)
            candidate = root / 'artifacts/editorial/release-candidates/science/story.mdx'
            candidate.parent.mkdir(parents=True)
            candidate.write_text('Body.\n', encoding='utf-8')
            published = root / 'content/science/story.mdx'
            published.parent.mkdir(parents=True)
            published.write_text(
                f'---\nstatus: published\ncandidateSha256: "{candidate_sha256(candidate)}"\n'
                '---\n\nBody.\n',
                encoding='utf-8',
            )
            dirty = subprocess.CompletedProcess(
                ['git', 'status'], 0, stdout='?? untracked.txt\n', stderr=''
            )
            with patch('codex_review.subprocess.run', return_value=dirty):
                with self.assertRaisesRegex(PermissionError, 'clean repository worktree'):
                    run_review(
                        candidate,
                        root,
                        release_head=True,
                        published_article=published,
                        output_dir=Path(output_temp),
                    )

    def test_verifier_rejects_forged_run_id(self):
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
                'reviewBackend': 'codex-cli-oauth',
                'authenticationStatus': 'chatgpt-oauth',
                'codexCliSha256': 'c' * 64,
                'reviewRunId': 'local-forged',
                'blockers': [],
            }), encoding='utf-8')
            with self.assertRaisesRegex(ValueError, 'Codex CLI thread ID'):
                verify_codex_review(candidate, review, root)

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
                'blockers': [],
            }), encoding='utf-8')
            with self.assertRaisesRegex(ValueError, 'authenticated CLI backend'):
                verify_codex_review(candidate, review, root)

    def test_verifier_requires_blockers_to_be_exactly_empty(self):
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
                'reviewBackend': 'codex-cli-oauth',
                'authenticationStatus': 'chatgpt-oauth',
                'codexCliSha256': 'c' * 64,
                'reviewRunId': self.THREAD_ID,
                'blockers': ['forged artifact hid this blocker behind its verdict'],
            }), encoding='utf-8')
            with self.assertRaisesRegex(PermissionError, 'exactly zero blockers'):
                verify_codex_review(candidate, review, root)


if __name__ == '__main__':
    unittest.main()
