import sys
import unittest
from pathlib import Path
from unittest.mock import patch


PIPELINE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PIPELINE_DIR))

from draft import ArticleDrafter  # noqa: E402


class ArticleDrafterHeadlineTests(unittest.TestCase):
    def setUp(self):
        self.drafter = ArticleDrafter()
        self.drafter.primary_llm = 'claude'
        self.sources = [{
            'title': 'Newton parks investment',
            'url': 'https://surrey.example/newton-parks',
            'snippet': (
                'Surrey committed $27.5 million to Newton park upgrades, '
                'with construction starting this summer.'
            ),
        }]

    @staticmethod
    def article(title):
        return {
            'title': title,
            'subtitle': 'Newton parks will receive upgrades.',
            'body_mdx': '## What changed\n\nSupported copy.',
            'meta_description': 'Newton park upgrades are set to begin this summer.',
            'tags': ['surrey', 'newton', 'parks'],
        }

    def test_prompt_requires_strongest_verified_fact_in_title(self):
        prompt = self.drafter._build_prompt('Newton park upgrades', self.sources)

        self.assertIn('strongest verified newsworthy fact', prompt)
        self.assertIn('$27.5 million', prompt)
        self.assertIn('Do not lead with attribution', prompt)

    def test_retries_attribution_led_title_when_source_has_stronger_fact(self):
        first = self.article('Surrey says Newton park upgrades are moving ahead')
        revised = self.article(
            'Surrey commits $27.5M to Newton parks; work starts this summer'
        )

        with patch.object(
            self.drafter,
            'draft_claude',
            side_effect=[first, revised],
        ) as draft_claude:
            result = self.drafter.draft('Newton park upgrades', self.sources)

        self.assertEqual(revised['title'], result['title'])
        self.assertEqual(2, draft_claude.call_count)

    def test_does_not_retry_attribution_without_a_stronger_supported_fact(self):
        sources = [{
            'title': 'Park survey',
            'url': 'https://surrey.example/park-survey',
            'snippet': 'Residents can comment on the park survey until Friday.',
        }]
        article = self.article('Surrey says park feedback closes Friday')

        with patch.object(
            self.drafter,
            'draft_claude',
            return_value=article,
        ) as draft_claude:
            result = self.drafter.draft('Surrey park survey', sources)

        self.assertEqual(article['title'], result['title'])
        self.assertEqual(1, draft_claude.call_count)


if __name__ == '__main__':
    unittest.main()
