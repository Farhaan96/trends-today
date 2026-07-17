import sys
import unittest
from pathlib import Path
from unittest.mock import Mock, patch


PIPELINE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PIPELINE_DIR))

from retrieve import ContentRetrieval  # noqa: E402


class DirectRetrievalTests(unittest.TestCase):
    @patch('retrieve.requests.get')
    def test_reviewed_url_can_be_read_without_firecrawl(self, get):
        response = Mock()
        response.status_code = 200
        response.apparent_encoding = 'utf-8'
        response.text = (
            '<html><head><title>Transit update</title>'
            '<meta name="description" content="Expo Line service changes Saturday.">'
            '</head><body><main><h1>Weekend work</h1>'
            '<p>Trains will run every 12 minutes between the affected stations.</p>'
            '</main></body></html>'
        )
        get.return_value = response

        result = ContentRetrieval().retrieve_direct_urls(
            ['https://transit.example/update']
        )

        self.assertEqual('direct', result['method'])
        self.assertEqual('https://transit.example/update', result['sources'][0]['url'])
        self.assertIn('Trains will run every 12 minutes', result['sources'][0]['snippet'])

    def test_retrieve_keeps_seed_and_fills_remaining_source_slots(self):
        retrieval = ContentRetrieval()
        seed = {
            'method': 'direct',
            'sources': [{
                'url': 'https://city.example/update',
                'snippet': 'Official city update with enough verified detail.',
            }],
        }
        secondary = {
            'method': 'google',
            'sources': [
                {'url': 'https://one.example/report', 'snippet': 'One'},
                {'url': 'https://two.example/report', 'snippet': 'Two'},
            ],
        }
        with (
            patch.object(retrieval, 'retrieve_firecrawl', return_value={}),
            patch.object(retrieval, 'retrieve_direct_urls', return_value=seed),
            patch.object(retrieval, 'retrieve_perplexity', return_value={}),
            patch.object(retrieval, 'retrieve_google', return_value=secondary),
        ):
            result = retrieval.retrieve(
                'Surrey service update',
                urls=['https://city.example/update'],
            )

        self.assertEqual(3, len(result['sources']))
        self.assertEqual('https://city.example/update', result['sources'][0]['url'])


if __name__ == '__main__':
    unittest.main()
