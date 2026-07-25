#!/usr/bin/env python3
"""Validate independent review artifacts for exact MDX release candidates."""

import hashlib
import json
import subprocess
from pathlib import Path
from typing import Dict, Tuple

from validation import count_prose_em_dashes


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


GPT_SCORE_FIELDS = {
    'factualSupport',
    'quality',
    'readability',
    'formatting',
    'engagement',
    'headlineStrength',
}


def verify_gpt_review(
    candidate_path: Path,
    review_path: Path,
    repo_root: Path,
) -> Tuple[Dict, str, Path, Path]:
    """Require a passing GPT editorial review bound to the exact candidate."""
    root = Path(repo_root).resolve()
    candidate_root = root / 'artifacts' / 'editorial' / 'release-candidates'
    review_root = root / 'artifacts' / 'editorial' / 'reviews' / 'gpt'
    candidate_relative = _relative_file(candidate_path, candidate_root, 'Candidate')
    review_relative = _relative_file(review_path, review_root, 'GPT review artifact')

    if len(candidate_relative.parts) != 2 or candidate_relative.suffix.lower() != '.mdx':
        raise ValueError('Candidate path must be <category>/<slug>.mdx')
    if len(review_relative.parts) != 2 or review_relative.suffix.lower() != '.json':
        raise ValueError('GPT review path must be <category>/<artifact>.json')

    try:
        review = json.loads(Path(review_path).read_text(encoding='utf-8'))
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        raise ValueError('GPT review artifact is not valid UTF-8 JSON') from exc
    if not isinstance(review, dict):
        raise ValueError('GPT review artifact must be a JSON object')

    digest = candidate_sha256(candidate_path)
    if review.get('version') != 1:
        raise ValueError('GPT review artifact version must be 1')
    if str(review.get('reviewer', '')).lower() != 'openai-gpt':
        raise ValueError('Editorial reviewer must be OpenAI GPT')
    if review.get('verdict') != 'PASS':
        raise PermissionError('GPT editorial review must return PASS')
    if review.get('candidateSha256') != digest:
        raise PermissionError('GPT review does not match the exact candidate SHA-256')
    if not str(review.get('reviewedAt', '')).strip():
        raise ValueError('GPT review is missing reviewedAt')
    if review.get('reviewBackend') not in {'responses-api', 'codex-cli-oauth'}:
        raise ValueError('GPT review is missing an approved review backend')
    if not str(review.get('reviewRunId', '')).strip():
        raise ValueError('GPT review is missing reviewRunId')
    model = str(review.get('modelUsed', '')).lower()
    if not model.startswith('gpt-'):
        raise ValueError('GPT review is missing a GPT model identifier')

    scores = review.get('scores')
    if not isinstance(scores, dict) or set(scores) != GPT_SCORE_FIELDS:
        raise ValueError('GPT review must contain the complete editorial scorecard')
    if any(type(scores[field]) is not int or scores[field] < 4 or scores[field] > 5 for field in GPT_SCORE_FIELDS):
        raise PermissionError('Every GPT editorial score must be at least 4 out of 5')
    if review.get('blockers') != []:
        raise PermissionError('GPT editorial review must have no blockers')
    if review.get('proseEmDashCount') != 0:
        raise PermissionError('GPT review found an em dash in article prose')

    candidate_text = Path(candidate_path).read_text(encoding='utf-8')
    if count_prose_em_dashes(candidate_text) != 0:
        raise PermissionError('Candidate contains an em dash in article prose')

    git_head = subprocess.run(
        ['git', 'rev-parse', 'HEAD'],
        cwd=root,
        capture_output=True,
        text=True,
    )
    if git_head.returncode != 0:
        raise PermissionError('Unable to verify the current repository SHA')
    if review.get('repositorySha') != git_head.stdout.strip():
        raise PermissionError('GPT review was created for a different repository SHA')

    return review, digest, candidate_relative, review_relative
