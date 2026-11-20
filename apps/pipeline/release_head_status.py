#!/usr/bin/env python3
"""Publish a GitHub commit status only for a verified release-head artifact."""

import argparse
import hashlib
import json
import os
import subprocess
import urllib.error
import urllib.request
from pathlib import Path

from review import APPROVED_RELEASE_MODEL, CODEX_THREAD_ID_PATTERN, candidate_sha256

STATUS_CONTEXT = 'release-head-attestation'


def _git(root: Path, *args: str) -> str:
    completed = subprocess.run(
        ['git', *args], cwd=root, check=True, capture_output=True, text=True
    )
    return completed.stdout.strip()


def validate_release_head_artifact(
    artifact_path: Path,
    candidate_path: Path,
    published_article_path: Path,
    repo_root: Path,
) -> tuple[dict, str]:
    """Bind the external Codex artifact to the clean local HEAD and article provenance."""
    root = repo_root.resolve()
    candidate = candidate_path.resolve()
    published = published_article_path.resolve()
    artifact_file = artifact_path.resolve()

    candidate_root = (root / 'artifacts' / 'editorial' / 'release-candidates').resolve()
    content_root = (root / 'content').resolve()
    try:
        candidate_relative = candidate.relative_to(candidate_root)
        published_relative = published.relative_to(content_root)
    except ValueError as exc:
        raise ValueError('Candidate and published article must use canonical repository paths') from exc
    if (
        len(candidate_relative.parts) != 2
        or len(published_relative.parts) != 2
        or candidate_relative != published_relative
        or not candidate.is_file()
        or not published.is_file()
    ):
        raise ValueError('Candidate and published article must be matching <category>/<slug>.mdx files')
    if not artifact_file.is_file():
        raise ValueError('Release-head artifact does not exist')
    if _git(root, 'status', '--porcelain', '--untracked-files=all'):
        raise PermissionError('Release-head status requires a clean repository worktree')

    try:
        artifact = json.loads(artifact_file.read_text(encoding='utf-8'))
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        raise ValueError('Release-head artifact is not valid UTF-8 JSON') from exc
    if not isinstance(artifact, dict):
        raise ValueError('Release-head artifact must be a JSON object')

    head = _git(root, 'rev-parse', 'HEAD')
    digest = candidate_sha256(candidate)
    required = {
        'version': 1,
        'scope': 'release-head',
        'reviewer': 'codex',
        'verdict': 'NO BLOCKERS',
        'candidateSha256': digest,
        'repositorySha': head,
        'modelUsed': APPROVED_RELEASE_MODEL,
        'reviewBackend': 'codex-cli-oauth',
        'authenticationStatus': 'chatgpt-oauth',
        'blockers': [],
    }
    for key, expected in required.items():
        if artifact.get(key) != expected:
            raise PermissionError(f'Release-head artifact has invalid {key}')
    if not str(artifact.get('reviewedAt', '')).strip():
        raise ValueError('Release-head artifact is missing reviewedAt')
    if not CODEX_THREAD_ID_PATTERN.fullmatch(str(artifact.get('reviewRunId', '')).strip()):
        raise ValueError('Release-head artifact has an invalid Codex thread ID')
    cli_digest = str(artifact.get('codexCliSha256', '')).strip().lower()
    if len(cli_digest) != 64 or any(character not in '0123456789abcdef' for character in cli_digest):
        raise ValueError('Release-head artifact has an invalid CLI checksum')
    if f'candidateSha256: "{digest}"' not in published.read_text(encoding='utf-8'):
        raise PermissionError('Published article does not preserve exact candidate provenance')
    return artifact, head


def publish_status(
    artifact_path: Path,
    candidate_path: Path,
    published_article_path: Path,
    repo_root: Path,
    repository: str,
    token: str,
    target_url: str,
) -> str:
    artifact, head = validate_release_head_artifact(
        artifact_path, candidate_path, published_article_path, repo_root
    )
    if not repository or repository.count('/') != 1:
        raise ValueError('Repository must be owner/name')
    if not token:
        raise RuntimeError('GITHUB_TOKEN is required to publish the attestation status')
    artifact_digest = hashlib.sha256(artifact_path.read_bytes()).hexdigest()
    payload = json.dumps(
        {
            'state': 'success',
            'context': STATUS_CONTEXT,
            'description': f'Codex release-head NO BLOCKERS; artifact {artifact_digest[:12]}',
            'target_url': target_url,
        }
    ).encode('utf-8')
    request = urllib.request.Request(
        f'https://api.github.com/repos/{repository}/statuses/{head}',
        data=payload,
        method='POST',
        headers={
            'Accept': 'application/vnd.github+json',
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json',
            'User-Agent': 'trends-today-release-head-gate',
            'X-GitHub-Api-Version': '2022-11-28',
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            result = json.load(response)
    except urllib.error.HTTPError as exc:
        raise RuntimeError(f'GitHub rejected release-head status: HTTP {exc.code}') from exc
    if result.get('state') != 'success' or result.get('context') != STATUS_CONTEXT:
        raise RuntimeError('GitHub did not confirm the release-head status')
    return str(result.get('url') or '')


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('artifact', type=Path)
    parser.add_argument('--candidate', required=True, type=Path)
    parser.add_argument('--published-article', required=True, type=Path)
    parser.add_argument('--repo-root', type=Path, default=Path(__file__).resolve().parents[2])
    parser.add_argument('--repository', default=os.getenv('GITHUB_REPOSITORY', 'Farhaan96/trends-today'))
    parser.add_argument('--target-url', required=True)
    args = parser.parse_args()
    url = publish_status(
        args.artifact,
        args.candidate,
        args.published_article,
        args.repo_root,
        args.repository,
        os.getenv('GITHUB_TOKEN', ''),
        args.target_url,
    )
    print(f'Release-head status accepted: {url}')


if __name__ == '__main__':
    main()
