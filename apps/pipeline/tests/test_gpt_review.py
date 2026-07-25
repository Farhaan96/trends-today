import json
import sys
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch


PIPELINE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PIPELINE_DIR))

from gpt_review import (  # noqa: E402
    REVIEW_SCHEMA,
    _codex_cli_review,
    _prompt,
    _response_text,
    _responses_api_review,
)
from review import GPT_SCORE_FIELDS  # noqa: E402


class GPTReviewTests(unittest.TestCase):
    def test_schema_requires_complete_editorial_scorecard(self):
        scores = REVIEW_SCHEMA['properties']['scores']
        self.assertEqual(GPT_SCORE_FIELDS, set(scores['required']))
        self.assertFalse(scores['additionalProperties'])
        self.assertIn('headlineStrength', scores['required'])
        self.assertIn('proseEmDashCount', REVIEW_SCHEMA['required'])
        self.assertIn('blockers', REVIEW_SCHEMA['required'])

    def test_prompt_scores_strongest_supported_news_value_first(self):
        prompt = _prompt(
            "title: 'Surrey says Newton park upgrades are moving ahead'",
            Path('local-news/newton-parks.mdx'),
            'a' * 64,
            'b' * 40,
        )

        self.assertIn('headlineStrength', prompt)
        self.assertIn('strongest supported newsworthy fact', prompt)
        self.assertIn('weak attribution', prompt)

    def test_response_text_reads_structured_output_message(self):
        expected = {'verdict': 'PASS'}
        payload = {
            'output': [{
                'type': 'message',
                'content': [{
                    'type': 'output_text',
                    'text': json.dumps(expected),
                }],
            }]
        }
        self.assertEqual(json.dumps(expected), _response_text(payload))

    def test_response_text_fails_closed_without_output(self):
        with self.assertRaises(RuntimeError):
            _response_text({'output': []})

    def test_responses_api_uses_structured_stateless_review(self):
        model_review = {
            'verdict': 'PASS',
            'candidateSha256': 'a' * 64,
            'repositorySha': 'b' * 40,
            'scores': {field: 4 for field in GPT_SCORE_FIELDS},
            'proseEmDashCount': 0,
            'blockers': [],
            'summary': 'Pass.',
        }
        response = SimpleNamespace(
            status_code=200,
            text='',
            json=lambda: {
                'id': 'resp_test',
                'status': 'completed',
                'model': 'gpt-5.6-sol-2026-07-01',
                'output': [{
                    'type': 'message',
                    'content': [{'type': 'output_text', 'text': json.dumps(model_review)}],
                }],
            },
        )
        with patch('gpt_review.requests.post', return_value=response) as post:
            result = _responses_api_review('test-key', 'gpt-5.6-sol', 'Review this.')
        request = post.call_args.kwargs['json']
        self.assertFalse(request['store'])
        self.assertTrue(request['text']['format']['strict'])
        self.assertEqual('medium', request['reasoning']['effort'])
        self.assertEqual('responses-api', result['reviewBackend'])
        self.assertEqual('resp_test', result['reviewRunId'])

    def test_codex_cli_fallback_is_ephemeral_and_read_only(self):
        model_review = {
            'verdict': 'PASS',
            'candidateSha256': 'a' * 64,
            'repositorySha': 'b' * 40,
            'scores': {field: 4 for field in GPT_SCORE_FIELDS},
            'proseEmDashCount': 0,
            'blockers': [],
            'summary': 'Pass.',
        }

        def fake_run(command, **_kwargs):
            output = Path(command[command.index('--output-last-message') + 1])
            output.write_text(json.dumps(model_review), encoding='utf-8')
            return SimpleNamespace(
                returncode=0,
                stdout='{"type":"thread.started","thread_id":"thread_test"}\n',
                stderr='',
            )

        with tempfile.TemporaryDirectory() as temp:
            with patch('gpt_review.shutil.which', return_value='codex'), patch(
                'gpt_review.subprocess.run', side_effect=fake_run
            ) as run:
                result = _codex_cli_review('gpt-5.6-sol', 'Review this.', Path(temp))
        command = run.call_args.args[0]
        self.assertIn('--ephemeral', command)
        self.assertEqual('read-only', command[command.index('--sandbox') + 1])
        self.assertEqual('codex-cli-oauth', result['reviewBackend'])
        self.assertEqual('thread_test', result['reviewRunId'])


if __name__ == '__main__':
    unittest.main()
