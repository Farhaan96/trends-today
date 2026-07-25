#!/usr/bin/env python3
"""Run the fail-closed OpenAI GPT editorial gate for an exact candidate."""

import argparse
import json
import os
import shutil
import subprocess
import tempfile
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict

import requests

from review import GPT_SCORE_FIELDS, candidate_sha256, verify_gpt_review


DEFAULT_MODEL = 'gpt-5.6-sol'
RESPONSES_URL = 'https://api.openai.com/v1/responses'

REVIEW_SCHEMA = {
    'type': 'object',
    'properties': {
        'verdict': {'type': 'string', 'enum': ['PASS', 'BLOCKERS']},
        'candidateSha256': {'type': 'string'},
        'repositorySha': {'type': 'string'},
        'scores': {
            'type': 'object',
            'properties': {
                field: {'type': 'integer', 'minimum': 1, 'maximum': 5}
                for field in sorted(GPT_SCORE_FIELDS)
            },
            'required': sorted(GPT_SCORE_FIELDS),
            'additionalProperties': False,
        },
        'proseEmDashCount': {'type': 'integer', 'minimum': 0},
        'blockers': {'type': 'array', 'items': {'type': 'string'}},
        'summary': {'type': 'string'},
    },
    'required': [
        'verdict',
        'candidateSha256',
        'repositorySha',
        'scores',
        'proseEmDashCount',
        'blockers',
        'summary',
    ],
    'additionalProperties': False,
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


def _response_text(payload: Dict) -> str:
    for item in payload.get('output', []):
        if item.get('type') != 'message':
            continue
        for content in item.get('content', []):
            if content.get('type') == 'output_text' and content.get('text'):
                return content['text']
    raise RuntimeError('OpenAI response did not contain editorial review output')


def _prompt(candidate_text: str, relative: Path, digest: str, repository_sha: str) -> str:
    return f"""Review this exact Trends Today release candidate as a strict second editorial gate.

Candidate: {relative.as_posix()}
Candidate SHA-256: {digest}
Repository SHA: {repository_sha}

Score each dimension from 1 to 5:
- factualSupport: every factual claim is supported by the cited material in the candidate
- quality: specific, useful, coherent, original, and free of repetition or filler
- readability: clear language, varied sentence rhythm, short paragraphs, and minimal jargon
- formatting: valid, scannable MDX with useful headings, restrained emphasis, and a Sources section
- engagement: a concrete supported lead, clear local stakes, active verbs, and an actionable close without clickbait
- headlineStrength: the title leads with the strongest supported newsworthy fact and
  active factual subject, rather than weak attribution such as "Surrey says" when a
  commitment, amount, concrete change, or start date provides a stronger lead

Return PASS only when every score is at least 4, blockers is empty, and authorial prose
contains zero em dashes. Do not count an em dash inside an exact direct quotation,
blockquote, source title, or Sources section. Treat unsupported hype, manufactured stakes,
generic openings, repetitive phrasing, weak transitions, buried reader impact, weak
attribution ahead of a stronger supported newsworthy fact, or a flat ending as blockers
when they require revision. Do not edit the article. Echo both hashes exactly.

<candidate>
{candidate_text}
</candidate>"""


def _responses_api_review(api_key: str, model: str, prompt: str) -> Dict:
    response = requests.post(
        RESPONSES_URL,
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
        },
        json={
            'model': model,
            'store': False,
            'reasoning': {'effort': 'medium'},
            'max_output_tokens': 2000,
            'instructions': (
                'You are a rigorous local-news editor. Apply the rubric exactly. '
                'Do not reward polished prose when evidence, usefulness, or formatting is weak.'
            ),
            'input': prompt,
            'text': {
                'format': {
                    'type': 'json_schema',
                    'name': 'trends_today_editorial_review',
                    'strict': True,
                    'schema': REVIEW_SCHEMA,
                }
            },
        },
        timeout=180,
    )
    if response.status_code != 200:
        raise RuntimeError(
            f'OpenAI editorial review failed with HTTP {response.status_code}: '
            f'{response.text[:300]}'
        )
    response_payload = response.json()
    if response_payload.get('status') != 'completed':
        raise RuntimeError(
            f"OpenAI editorial review did not complete: {response_payload.get('status')}"
        )
    try:
        model_review = json.loads(_response_text(response_payload))
    except json.JSONDecodeError as exc:
        raise RuntimeError('OpenAI editorial review was not valid JSON') from exc
    return {
        'review': model_review,
        'modelUsed': response_payload.get('model', model),
        'reviewBackend': 'responses-api',
        'reviewRunId': response_payload.get('id'),
    }


def _codex_cli_review(model: str, prompt: str, root: Path) -> Dict:
    codex_bin = shutil.which('codex')
    if not codex_bin:
        raise RuntimeError(
            'GPT editorial review requires OPENAI_API_KEY or an authenticated Codex CLI'
        )

    with tempfile.TemporaryDirectory(prefix='trends-gpt-review-') as temp:
        temp_dir = Path(temp)
        schema_path = temp_dir / 'review-schema.json'
        output_path = temp_dir / 'review.json'
        schema_path.write_text(json.dumps(REVIEW_SCHEMA), encoding='utf-8')
        command = [
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
        ]
        completed = subprocess.run(
            command,
            input=prompt,
            capture_output=True,
            text=True,
            timeout=300,
        )
        if completed.returncode != 0 or not output_path.is_file():
            raise RuntimeError(
                'Authenticated Codex GPT editorial review failed: '
                f'{(completed.stderr or completed.stdout)[:300]}'
            )
        try:
            model_review = json.loads(output_path.read_text(encoding='utf-8'))
        except json.JSONDecodeError as exc:
            raise RuntimeError('Codex GPT editorial review was not valid JSON') from exc

        run_id = None
        for line in completed.stdout.splitlines():
            try:
                event = json.loads(line)
            except json.JSONDecodeError:
                continue
            if event.get('type') == 'thread.started' and event.get('thread_id'):
                run_id = event['thread_id']
                break
        return {
            'review': model_review,
            'modelUsed': model,
            'reviewBackend': 'codex-cli-oauth',
            'reviewRunId': run_id or f'local-{uuid.uuid4()}',
        }


def run_review(candidate: Path, repo_root: Path, model: str = DEFAULT_MODEL) -> Path:
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
    candidate_text = candidate.read_text(encoding='utf-8')
    prompt = _prompt(candidate_text, relative, digest, repository_sha)
    api_key = os.getenv('OPENAI_API_KEY')
    result = (
        _responses_api_review(api_key, model, prompt)
        if api_key
        else _codex_cli_review(model, prompt, root)
    )
    model_review = result['review']

    artifact = {
        'version': 1,
        'reviewer': 'openai-gpt',
        'verdict': model_review.get('verdict'),
        'candidateSha256': model_review.get('candidateSha256'),
        'repositorySha': model_review.get('repositorySha'),
        'reviewedAt': datetime.now(timezone.utc).isoformat(),
        'modelUsed': result['modelUsed'],
        'reviewBackend': result['reviewBackend'],
        'reviewRunId': result['reviewRunId'],
        'scores': model_review.get('scores'),
        'proseEmDashCount': model_review.get('proseEmDashCount'),
        'blockers': model_review.get('blockers'),
        'summary': model_review.get('summary'),
    }
    output = (
        root
        / 'artifacts'
        / 'editorial'
        / 'reviews'
        / 'gpt'
        / relative.parent
        / f'{relative.stem}.{digest[:12]}.json'
    )
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(artifact, indent=2) + '\n', encoding='utf-8')

    # This raises after preserving the artifact when GPT returns blockers.
    verify_gpt_review(candidate, output, root)
    return output


def main() -> None:
    parser = argparse.ArgumentParser(description='Run the GPT editorial review gate')
    parser.add_argument('candidate', type=Path)
    parser.add_argument('--repo-root', type=Path, default=Path(__file__).resolve().parents[2])
    parser.add_argument(
        '--model',
        default=os.getenv('OPENAI_EDITORIAL_REVIEW_MODEL', DEFAULT_MODEL),
    )
    args = parser.parse_args()
    output = run_review(args.candidate, args.repo_root, args.model)
    print(f'GPT editorial review accepted: {output}')


if __name__ == '__main__':
    main()
