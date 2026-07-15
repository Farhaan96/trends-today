#!/usr/bin/env python3
"""Run the approved Claude CLI review path for an exact release candidate."""

import argparse
import json
import os
import subprocess
from datetime import datetime, timezone
from pathlib import Path

from review import candidate_sha256


DEFAULT_RUNNER = Path('C:/Users/farha/.codex/scripts/invoke-claude-review.ps1')


def validate_runner_result(result: dict, returncode: int, digest: str) -> dict:
    """Accept only the approved runner's successful, hash-echoing verdict."""
    if returncode != 0 or result.get('status') not in {'success', 'reviewed'}:
        raise RuntimeError(
            f"Claude review was not accepted: {result.get('status', 'runner failure')}"
        )
    if result.get('verdict') != 'NO BLOCKERS':
        raise PermissionError('Claude returned blockers; repair and review again')
    if not str(result.get('modelUsed', '')).strip():
        raise RuntimeError('Claude review runner did not report modelUsed')
    review_text = str(result.get('review', ''))
    if digest not in review_text:
        raise RuntimeError('Claude review did not echo the exact candidate SHA-256')
    return result


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


def run_review(candidate: Path, repo_root: Path, runner: Path) -> Path:
    root = repo_root.resolve()
    relative = _candidate_relative(candidate, root)
    digest = candidate_sha256(candidate)
    repository_sha = subprocess.run(
        ['git', 'rev-parse', 'HEAD'],
        cwd=root,
        check=True,
        capture_output=True,
        text=True,
    ).stdout.strip()
    prompt = (
        'Your response MUST start with exactly one bare line: NO BLOCKERS or BLOCKERS. '
        f'Review the exact release candidate {relative.as_posix()} with SHA-256 {digest}. '
        'Check factual support and source use, unsupported claims, title/meta fit, structure, '
        'reader usefulness, image/frontmatter integrity, and reputational or legal risk. '
        f'After the first line include CANDIDATE_SHA256: {digest} and concise evidence. '
        'Return BLOCKERS if the candidate needs any correction before public publication.'
    )
    command = [
        'powershell.exe',
        '-NoProfile',
        '-ExecutionPolicy',
        'Bypass',
        '-File',
        str(runner),
        '-Prompt',
        prompt,
        '-WorkingDirectory',
        str(root),
        '-ExpectedSha',
        repository_sha,
        '-PrimaryModel',
        'fable',
        '-FallbackModel',
        'opus',
    ]
    completed = subprocess.run(command, cwd=root, capture_output=True, text=True)
    try:
        result = json.loads(completed.stdout.strip())
    except json.JSONDecodeError as exc:
        raise RuntimeError('Claude review runner did not return structured JSON') from exc
    result = validate_runner_result(result, completed.returncode, digest)
    review_text = str(result.get('review', ''))

    artifact = {
        'version': 1,
        'reviewer': 'claude',
        'verdict': 'NO BLOCKERS',
        'candidateSha256': digest,
        'reviewedAt': datetime.now(timezone.utc).isoformat(),
        'repositorySha': repository_sha,
        'modelUsed': result.get('modelUsed'),
        'observedModels': result.get('observedModels', []),
        'review': review_text,
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
    return output


def main() -> None:
    parser = argparse.ArgumentParser(description='Review an exact Trends Today release candidate')
    parser.add_argument('candidate', type=Path)
    parser.add_argument('--repo-root', type=Path, default=Path(__file__).resolve().parents[2])
    parser.add_argument(
        '--runner',
        type=Path,
        default=Path(os.getenv('CLAUDE_REVIEW_RUNNER', str(DEFAULT_RUNNER))),
    )
    args = parser.parse_args()
    output = run_review(args.candidate, args.repo_root, args.runner)
    print(f'Claude review accepted: {output}')


if __name__ == '__main__':
    main()
