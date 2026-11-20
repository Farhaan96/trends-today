import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch


PIPELINE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PIPELINE_DIR))

from release_head_status import validate_release_head_artifact  # noqa: E402
from review import candidate_sha256  # noqa: E402


class ReleaseHeadStatusTests(unittest.TestCase):
    HEAD = 'b' * 40
    THREAD_ID = '019a8f5e-6f5d-7a21-8d9c-52e8b09d9a70'

    def fixture(self, root: Path) -> tuple[Path, Path, Path]:
        candidate = root / 'artifacts/editorial/release-candidates/science/story.mdx'
        published = root / 'content/science/story.mdx'
        artifact = root.parent / f'{root.name}-release-head.json'
        candidate.parent.mkdir(parents=True)
        published.parent.mkdir(parents=True)
        candidate.write_text('---\nstatus: release-candidate\n---\nBody.\n', encoding='utf-8')
        digest = candidate_sha256(candidate)
        published.write_text(
            f'---\nstatus: published\ncandidateSha256: "{digest}"\n---\nBody.\n',
            encoding='utf-8',
        )
        artifact.write_text(
            json.dumps(
                {
                    'version': 1,
                    'scope': 'release-head',
                    'reviewer': 'codex',
                    'verdict': 'NO BLOCKERS',
                    'candidateSha256': digest,
                    'repositorySha': self.HEAD,
                    'reviewedAt': '2026-11-20T15:00:00+00:00',
                    'modelUsed': 'gpt-5.6-sol',
                    'reviewBackend': 'codex-cli-oauth',
                    'authenticationStatus': 'chatgpt-oauth',
                    'codexCliSha256': 'c' * 64,
                    'reviewRunId': self.THREAD_ID,
                    'blockers': [],
                    'summary': 'Ready.',
                }
            ),
            encoding='utf-8',
        )
        return candidate, published, artifact

    @staticmethod
    def fake_git(command, **kwargs):
        if command[1:3] == ['status', '--porcelain']:
            return subprocess.CompletedProcess(command, 0, stdout='', stderr='')
        if command[1:3] == ['rev-parse', 'HEAD']:
            return subprocess.CompletedProcess(command, 0, stdout=ReleaseHeadStatusTests.HEAD, stderr='')
        raise AssertionError(command)

    def test_accepts_exact_clean_release_head_artifact(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            candidate, published, artifact = self.fixture(root)
            with patch('release_head_status.subprocess.run', side_effect=self.fake_git):
                value, head = validate_release_head_artifact(
                    artifact, candidate, published, root
                )
            self.assertEqual('NO BLOCKERS', value['verdict'])
            self.assertEqual(self.HEAD, head)

    def test_rejects_wrong_head_or_missing_candidate_provenance(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            candidate, published, artifact = self.fixture(root)
            value = json.loads(artifact.read_text(encoding='utf-8'))
            value['repositorySha'] = 'd' * 40
            artifact.write_text(json.dumps(value), encoding='utf-8')
            with patch('release_head_status.subprocess.run', side_effect=self.fake_git):
                with self.assertRaisesRegex(PermissionError, 'repositorySha'):
                    validate_release_head_artifact(artifact, candidate, published, root)

            value['repositorySha'] = self.HEAD
            artifact.write_text(json.dumps(value), encoding='utf-8')
            published.write_text('---\nstatus: published\n---\nBody.\n', encoding='utf-8')
            with patch('release_head_status.subprocess.run', side_effect=self.fake_git):
                with self.assertRaisesRegex(PermissionError, 'candidate provenance'):
                    validate_release_head_artifact(artifact, candidate, published, root)

    def test_rejects_dirty_worktree(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            candidate, published, artifact = self.fixture(root)

            def dirty_git(command, **kwargs):
                if command[1:3] == ['status', '--porcelain']:
                    return subprocess.CompletedProcess(command, 0, stdout=' M content/science/story.mdx\n', stderr='')
                return self.fake_git(command, **kwargs)

            with patch('release_head_status.subprocess.run', side_effect=dirty_git):
                with self.assertRaisesRegex(PermissionError, 'clean repository worktree'):
                    validate_release_head_artifact(artifact, candidate, published, root)


if __name__ == '__main__':
    unittest.main()
