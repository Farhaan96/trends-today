#!/usr/bin/env python3
"""Run the authorized Codex CLI release review for an exact candidate."""

import argparse
import hashlib
import json
import os
import subprocess
import tempfile
from datetime import datetime, timezone
from pathlib import Path

from review import (
    APPROVED_RELEASE_MODEL,
    CODEX_THREAD_ID_PATTERN,
    candidate_sha256,
    verify_codex_review,
)


REVIEW_SCHEMA = {
    'type': 'object',
    'additionalProperties': False,
    'required': [
        'verdict',
        'candidateSha256',
        'repositorySha',
        'blockers',
        'summary',
    ],
    'properties': {
        'verdict': {'type': 'string', 'enum': ['NO BLOCKERS', 'BLOCKERS']},
        'candidateSha256': {'type': 'string'},
        'repositorySha': {'type': 'string'},
        'blockers': {'type': 'array', 'items': {'type': 'string'}},
        'summary': {'type': 'string'},
    },
}


def _candidate_relative(candidate: Path, root: Path) -> Path:
    candidate_root = (root / 'artifacts' / 'editorial' / 'release-candidates').resolve()
    source = candidate.resolve()
    try:
        relative = source.relative_to(candidate_root)
    except ValueError as exc:
        raise ValueError('Candidate must be inside artifacts/editorial/release-candidates') from exc
    if len(relative.parts) != 2 or relative.suffix.lower() != '.mdx' or not source.is_file():
        raise ValueError('Candidate path must be an existing <category>/<slug>.mdx file')
    return relative


def validate_codex_result(result: dict, digest: str, repository_sha: str) -> dict:
    """Accept only a structured blocker-free result for both exact identities."""
    if result.get('verdict') != 'NO BLOCKERS' or result.get('blockers') != []:
        raise PermissionError('Codex returned blockers; repair and review again')
    if result.get('candidateSha256') != digest:
        raise RuntimeError('Codex review did not bind to the exact candidate SHA-256')
    if result.get('repositorySha') != repository_sha:
        raise RuntimeError('Codex review did not bind to the exact repository SHA')
    return result


def _resolve_authenticated_codex(env: dict[str, str]) -> tuple[Path, str]:
    """Bind review execution to an operator-approved CLI binary and OAuth login."""
    raw_path = str(env.get('CODEX_RELEASE_CLI') or '').strip()
    expected_digest = str(env.get('CODEX_RELEASE_CLI_SHA256') or '').strip().lower()
    if not raw_path or len(expected_digest) != 64:
        raise RuntimeError(
            'Release review requires CODEX_RELEASE_CLI and CODEX_RELEASE_CLI_SHA256'
        )
    executable = Path(raw_path).expanduser().resolve()
    if not executable.is_file():
        raise RuntimeError('Configured Codex release CLI is not an existing file')
    observed_digest = hashlib.sha256(executable.read_bytes()).hexdigest()
    if observed_digest != expected_digest:
        raise RuntimeError('Configured Codex release CLI checksum did not match')
    login = subprocess.run(
        [str(executable), 'login', 'status'],
        capture_output=True,
        text=True,
    )
    if login.returncode != 0 or login.stdout.strip() != 'Logged in using ChatGPT':
        raise RuntimeError('Codex release CLI is not authenticated with ChatGPT OAuth')
    return executable, observed_digest


def run_review(
    candidate: Path,
    repo_root: Path,
    model: str = APPROVED_RELEASE_MODEL,
    env: dict[str, str] | None = None,
    *,
    release_head: bool = False,
    published_article: Path | None = None,
    output_dir: Path | None = None,
) -> Path:
    root = repo_root.resolve()
    relative = _candidate_relative(candidate, root)
    if model.strip().lower() != APPROVED_RELEASE_MODEL:
        raise PermissionError(f'Release review must use {APPROVED_RELEASE_MODEL}')
    if release_head:
        if published_article is None or output_dir is None:
            raise ValueError('Release-head review requires --published-article and --output-dir')
        published = Path(published_article).resolve()
        try:
            published_relative = published.relative_to((root / 'content').resolve())
        except ValueError as exc:
            raise ValueError('Published article must be inside content/') from exc
        if not published.is_file() or len(published_relative.parts) != 2:
            raise ValueError('Published article must be an existing content/<category>/<slug>.mdx')
        clean = subprocess.run(
            ['git', 'status', '--porcelain', '--untracked-files=all'],
            cwd=root,
            check=True,
            capture_output=True,
            text=True,
        ).stdout
        if clean.strip():
            raise PermissionError('Release-head review requires a clean repository worktree')
    else:
        published = None
        published_relative = None

    codex_bin, codex_bin_sha256 = _resolve_authenticated_codex(
        os.environ if env is None else env
    )

    digest = candidate_sha256(candidate)
    repository_sha = subprocess.run(
        ['git', 'rev-parse', 'HEAD'],
        cwd=root,
        check=True,
        capture_output=True,
        text=True,
    ).stdout.strip()
    candidate_text = candidate.read_text(encoding='utf-8')
    release_context = ''
    if release_head:
        published_text = published.read_text(encoding='utf-8')
        if f'candidateSha256: "{digest}"' not in published_text:
            raise PermissionError(
                'Published article does not preserve the exact candidate SHA-256 provenance'
            )
        release_context = (
            '\nThis is the final clean release HEAD. Review the promoted article and repository '
            'state as well as the staged candidate. The repository SHA in your result must '
            'identify this exact deployable commit.\n'
            f'Published article: {published_relative.as_posix()}\n\n{published_text}\n'
        )
    prompt = (
        'Act as the independent release reviewer, not the implementation writer. '
        'Review only the exact candidate below for factual support and source use, unsupported '
        'claims, title/meta fit, structure, reader usefulness, image/frontmatter integrity, and '
        'reputational or legal risk. Return BLOCKERS for any required correction. '
        f'Candidate: {relative.as_posix()}\n'
        f'Candidate SHA-256: {digest}\n'
        f'Repository SHA: {repository_sha}\n\n'
        f'{candidate_text}'
        f'{release_context}'
    )

    with tempfile.TemporaryDirectory(prefix='trends-codex-release-review-') as temp:
        temp_dir = Path(temp)
        schema_path = temp_dir / 'review-schema.json'
        output_path = temp_dir / 'review.json'
        schema_path.write_text(json.dumps(REVIEW_SCHEMA), encoding='utf-8')
        completed = subprocess.run(
            [
                str(codex_bin),
                'exec',
                '--ephemeral',
                '--ignore-user-config',
                '--sandbox',
                'read-only',
                '--model',
                model,
                '--cd',
                str(root),
                '--output-schema',
                str(schema_path),
                '--output-last-message',
                str(output_path),
                '--json',
                '-',
            ],
            input=prompt,
            capture_output=True,
            text=True,
        )
        if completed.returncode != 0 or not output_path.is_file():
            raise RuntimeError(
                'Authenticated Codex release review failed: '
                f'{(completed.stderr or completed.stdout)[:300]}'
            )
        try:
            result = json.loads(output_path.read_text(encoding='utf-8'))
        except json.JSONDecodeError as exc:
            raise RuntimeError('Codex release review was not valid JSON') from exc
        result = validate_codex_result(result, digest, repository_sha)

        run_id = None
        for line in completed.stdout.splitlines():
            try:
                event = json.loads(line)
            except json.JSONDecodeError:
                continue
            if event.get('type') == 'thread.started' and event.get('thread_id'):
                run_id = event['thread_id']
                break

        if not isinstance(run_id, str) or not CODEX_THREAD_ID_PATTERN.fullmatch(run_id):
            raise RuntimeError('Codex CLI did not emit a valid thread.started thread_id')

    artifact = {
        'version': 1,
        'scope': 'release-head' if release_head else 'candidate',
        'reviewer': 'codex',
        'verdict': result['verdict'],
        'candidateSha256': result['candidateSha256'],
        'repositorySha': result['repositorySha'],
        'reviewedAt': datetime.now(timezone.utc).isoformat(),
        'modelUsed': model,
        'reviewBackend': 'codex-cli-oauth',
        'authenticationStatus': 'chatgpt-oauth',
        'codexCliSha256': codex_bin_sha256,
        'reviewRunId': run_id,
        'blockers': result['blockers'],
        'summary': result['summary'],
    }
    if release_head:
        observed_head = subprocess.run(
            ['git', 'rev-parse', 'HEAD'],
            cwd=root,
            check=True,
            capture_output=True,
            text=True,
        ).stdout.strip()
        observed_status = subprocess.run(
            ['git', 'status', '--porcelain', '--untracked-files=all'],
            cwd=root,
            check=True,
            capture_output=True,
            text=True,
        ).stdout
        if observed_head != repository_sha or observed_status.strip():
            raise PermissionError('Repository changed during the release-head review')
        output_root = Path(output_dir).expanduser().resolve()
        try:
            output_root.relative_to(root)
        except ValueError:
            pass
        else:
            raise ValueError('Release-head review output must be outside the repository')
    else:
        output_root = root / 'artifacts' / 'editorial' / 'reviews'

    output = output_root / relative.parent / f'{relative.stem}.{digest[:12]}.json'
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(artifact, indent=2) + '\n', encoding='utf-8')
    if not release_head:
        verify_codex_review(candidate, output, root)
    return output


def main() -> None:
    parser = argparse.ArgumentParser(description='Run the Codex independent release review gate')
    parser.add_argument('candidate', type=Path)
    parser.add_argument('--repo-root', type=Path, default=Path(__file__).resolve().parents[2])
    parser.add_argument(
        '--model',
        default=os.getenv('CODEX_RELEASE_REVIEW_MODEL', APPROVED_RELEASE_MODEL),
    )
    parser.add_argument(
        '--release-head',
        action='store_true',
        help='Attest the final clean deployable commit after promotion is committed',
    )
    parser.add_argument('--published-article', type=Path)
    parser.add_argument('--output-dir', type=Path)
    args = parser.parse_args()
    output = run_review(
        args.candidate,
        args.repo_root,
        args.model,
        release_head=args.release_head,
        published_article=args.published_article,
        output_dir=args.output_dir,
    )
    print(f'Codex release review accepted: {output}')


if __name__ == '__main__':
    main()
