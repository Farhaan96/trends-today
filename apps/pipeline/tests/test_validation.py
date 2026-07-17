import sys
import unittest
from pathlib import Path


PIPELINE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PIPELINE_DIR))

from validation import validate_release_candidate  # noqa: E402


class ValidationTests(unittest.TestCase):
    def article(self):
        filler = ' '.join(['evidence'] * 610)
        urls = '\n'.join([
            'https://a.example/source',
            'https://b.example/source',
            'https://c.example/source',
        ])
        return {
            'title': 'A valid release candidate',
            'meta_description': 'A precise description.',
            'body_mdx': f"Opening\n\n## Finding\n\n{filler}\n\n## Sources\n\n{urls}",
        }

    def sources(self):
        return [
            {'url': 'https://a.example/source'},
            {'url': 'https://b.example/source'},
            {'url': 'https://c.example/source'},
        ]

    def test_valid_candidate_passes(self):
        result = validate_release_candidate(
            self.article(), self.sources(), {'slug': 'valid'}, {'path': '/images/valid.webp'}
        )
        self.assertTrue(result.passed, result.errors)

    def test_placeholder_and_missing_citations_block_release(self):
        article = self.article()
        article['body_mdx'] = article['body_mdx'].replace('https://c.example/source', '')
        result = validate_release_candidate(
            article, self.sources(), {'slug': 'blocked'}, {'path': '/images/placeholder.jpg'}
        )
        self.assertFalse(result.passed)
        self.assertTrue(any('absent' in error for error in result.errors))
        self.assertTrue(any('placeholder' in error for error in result.errors))

    def test_local_reported_update_uses_shorter_contract(self):
        urls = ['https://city.example/update', 'https://transit.example/context']
        article = {
            'title': 'Burnaby road work changes two bus routes',
            'meta_description': 'What Burnaby riders need to know this weekend.',
            'category': 'transit',
            'locality': 'Burnaby',
            'storyType': 'reported-update',
            'body_mdx': (
                'Opening\n\n## What changed\n\n'
                + ' '.join(['local'] * 470)
                + '\n\n## Sources\n\n'
                + '\n'.join(urls)
            ),
        }
        sources = [
            {'url': urls[0], 'tier': 'primary'},
            {'url': urls[1], 'tier': 'secondary'},
        ]
        result = validate_release_candidate(
            article, sources, {'slug': 'burnaby-bus-change'}, {'path': '/images/bus.webp'}
        )
        self.assertTrue(result.passed, result.errors)

    def test_sensitive_local_story_requires_recorded_approval(self):
        article = self.article()
        article['manualApprovalRequired'] = True
        result = validate_release_candidate(
            article, self.sources(), {'slug': 'sensitive'}, {'path': '/images/valid.webp'}
        )
        self.assertFalse(result.passed)
        self.assertIn('manual approval is required for this sensitive story', result.errors)


if __name__ == '__main__':
    unittest.main()
