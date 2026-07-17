#!/usr/bin/env python3
"""Validate independent review artifacts for exact MDX release candidates."""

import hashlib
import json
import subprocess
from pathlib import Path
from typing import Dict, Tuple


def candidate_sha256(candidate_path: Path) -> str:
    return hashlib.sha256(Path(candidate_path).read_bytes()).hexdigest()


def _relative_file(path: Path, root: Path, label: str) -> Path:
    resolved = Path(path).resolve()
    try:
        relative = resolved.relative_to(root.resolve())
    except ValueError as exc:
        raise ValueError(f'{label} must be inside {root}') from exc
    if not resolved.is_file():
        raise ValueError(f'{label} does not exist: {resolved}')
    return relative


def verify_claude_review(
    candidate_path: Path,
    review_path: Path,
    repo_root: Path,
) -> Tuple[Dict, str, Path, Path]:
    """Require a NO BLOCKERS Claude review bound to the exact candidate hash."""
    root = Path(repo_root).resolve()
    candidate_root = root / 'artifacts' / 'editorial' / 'release-candidates'
    review_root = root / 'artifacts' / 'editorial' / 'reviews'
    candidate_relative = _relative_file(candidate_path, candidate_root, 'Candidate')
    review_relative = _relative_file(review_path, review_root, 'Review artifact')

    if len(candidate_relative.parts) != 2 or candidate_relative.suffix.lower() != '.mdx':
        raise ValueError('Candidate path must be <category>/<slug>.mdx')
    if review_relative.suffix.lower() != '.json':
        raise ValueError('Review artifact must be JSON')

    try:
        review = json.loads(Path(review_path).read_text(encoding='utf-8'))
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        raise ValueError('Review artifact is not valid UTF-8 JSON') from exc
    if not isinstance(review, dict):
        raise ValueError('Review artifact must be a JSON object')

    digest = candidate_sha256(candidate_path)
    if review.get('version') != 1:
        raise ValueError('Review artifact version must be 1')
    if str(review.get('reviewer', '')).lower() != 'claude':
        raise ValueError('Independent reviewer must be Claude')
    if review.get('verdict') != 'NO BLOCKERS':
        raise PermissionError('Claude review must return NO BLOCKERS')
    if review.get('candidateSha256') != digest:
        raise PermissionError('Review artifact does not match the exact candidate SHA-256')
    if not str(review.get('reviewedAt', '')).strip():
        raise ValueError('Review artifact is missing reviewedAt')
    if not str(review.get('repositorySha', '')).strip():
        raise ValueError('Review artifact is missing repositorySha')
    if not str(review.get('modelUsed', '')).strip():
        raise ValueError('Review artifact is missing modelUsed')

    git_head = subprocess.run(
        ['git', 'rev-parse', 'HEAD'],
        cwd=root,
        capture_output=True,
        text=True,
    )
    if git_head.returncode != 0:
        raise PermissionError('Unable to verify the current repository SHA')
    if review.get('repositorySha') != git_head.stdout.strip():
        raise PermissionError('Review artifact was created for a different repository SHA')

    return review, digest, candidate_relative, review_relative
