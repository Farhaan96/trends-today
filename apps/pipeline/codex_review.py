#!/usr/bin/env python3
"""Run the authorized Codex CLI release review for an exact candidate."""

import argparse
import json
import os
import shutil
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


def run_review(
    candidate: Path,
    repo_root: Path,
    model: str = APPROVED_RELEASE_MODEL,
) -> Path:
    root = repo_root.resolve()
    relative = _candidate_relative(candidate, root)
    if model.strip().lower() != APPROVED_RELEASE_MODEL:
        raise PermissionError(f'Release review must use {APPROVED_RELEASE_MODEL}')

    codex_bin = shutil.which('codex')
    if not codex_bin:
        raise RuntimeError('Release review requires an authenticated Codex CLI')

    digest = candidate_sha256(candidate)
    repository_sha = subprocess.run(
        ['git', 'rev-parse', 'HEAD'],
        cwd=root,
        check=True,
        capture_output=True,
        text=True,
    ).stdout.strip()
    candidate_text = candidate.read_text(encoding='utf-8')
    prompt = (
        'Act as the independent release reviewer, not the implementation writer. '
        'Review only the exact candidate below for factual support and source use, unsupported '
        'claims, title/meta fit, structure, reader usefulness, image/frontmatter integrity, and '
        'reputational or legal risk. Return BLOCKERS for any required correction. '
        f'Candidate: {relative.as_posix()}\n'
        f'Candidate SHA-256: {digest}\n'
        f'Repository SHA: {repository_sha}\n\n'
        f'{candidate_text}'
    )

    with tempfile.TemporaryDirectory(prefix='trends-codex-release-review-') as temp:
        temp_dir = Path(temp)
        schema_path = temp_dir / 'review-schema.json'
        output_path = temp_dir / 'review.json'
        schema_path.write_text(json.dumps(REVIEW_SCHEMA), encoding='utf-8')
        completed = subprocess.run(
            [
                codex_bin,
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
            timeout=300,
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
        'reviewer': 'codex',
        'verdict': result['verdict'],
        'candidateSha256': result['candidateSha256'],
        'repositorySha': result['repositorySha'],
        'reviewedAt': datetime.now(timezone.utc).isoformat(),
        'modelUsed': model,
        'reviewBackend': 'codex-cli-oauth',
        'reviewRunId': run_id,
        'blockers': result['blockers'],
        'summary': result['summary'],
    }
    output = (
        root
        / 'artifacts'
        / 'editorial'
        / 'reviews'
        / relative.parent
        / f'{relative.stem}.{digest[:12]}.json'
    )
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(artifact, indent=2) + '\n', encoding='utf-8')
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
    args = parser.parse_args()
    output = run_review(args.candidate, args.repo_root, args.model)
    print(f'Codex release review accepted: {output}')


if __name__ == '__main__':
    main()
