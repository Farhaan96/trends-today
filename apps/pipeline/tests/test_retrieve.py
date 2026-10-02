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
        robots = Mock()
        robots.status_code = 404
        robots.text = ''
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
        get.side_effect = [robots, response]

        retrieval = ContentRetrieval(source_config={
            'sources': [{
                'url': 'https://transit.example/news',
                'domain': 'transit.example',
                'tier': 'primary',
            }]
        })
        result = retrieval.retrieve_direct_urls(
            ['https://transit.example/update']
        )

        self.assertEqual('direct', result['method'])
        self.assertEqual('https://transit.example/update', result['sources'][0]['url'])
        self.assertIn('Trains will run every 12 minutes', result['sources'][0]['snippet'])

    @patch('retrieve.requests.get')
    def test_unconfigured_host_is_not_requested(self, get):
        result = ContentRetrieval(source_config={'sources': []}).retrieve_direct_urls(
            ['https://publication.example/vancouver/store-closing']
        )

        self.assertEqual({}, result)
        get.assert_not_called()

    @patch('retrieve.requests.get')
    def test_robots_disallow_blocks_direct_retrieval(self, get):
        robots = Mock()
        robots.status_code = 200
        robots.text = 'User-agent: *\nDisallow: /update'
        get.return_value = robots
        retrieval = ContentRetrieval(source_config={
            'sources': [{
                'url': 'https://transit.example/news',
                'domain': 'transit.example',
                'tier': 'primary',
            }]
        })

        result = retrieval.retrieve_direct_urls(
            ['https://transit.example/update']
        )

        self.assertEqual({}, result)
        self.assertEqual(1, get.call_count)

    @patch('retrieve.requests.get')
    def test_cached_robots_policy_is_evaluated_for_each_path(self, get):
        robots = Mock()
        robots.status_code = 200
        robots.text = 'User-agent: *\nDisallow: /private'
        page = Mock()
        page.status_code = 200
        page.apparent_encoding = 'utf-8'
        page.text = (
            '<html><head><title>Public update</title></head>'
            '<body><p>This public notice contains enough verified detail '
            'for the direct retrieval fallback to retain it safely.</p></body></html>'
        )
        get.side_effect = [robots, page]
        retrieval = ContentRetrieval(source_config={
            'sources': [{
                'url': 'https://city.example/news',
                'domain': 'city.example',
                'tier': 'primary',
            }]
        })

        result = retrieval.retrieve_direct_urls([
            'https://city.example/private/notice',
            'https://city.example/public/notice',
        ])

        self.assertEqual(
            ['https://city.example/public/notice'],
            [source['url'] for source in result['sources']],
        )
        self.assertEqual(2, get.call_count)

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

    @patch('retrieve.requests.get')
    @patch('retrieve.requests.post')
    def test_firecrawl_search_does_not_scrape_unconfigured_result(self, post, get):
        search = Mock()
        search.status_code = 200
        search.json.return_value = {
            'data': [{
                'url': 'https://publication.example/vancouver/store-closing',
            }]
        }
        post.return_value = search
        retrieval = ContentRetrieval(source_config={'sources': []})
        retrieval.firecrawl_key = 'test-key'

        result = retrieval.retrieve_firecrawl('Vancouver store closing')

        self.assertEqual({'sources': [], 'method': 'firecrawl'}, result)
        self.assertEqual(1, post.call_count)
        get.assert_not_called()


if __name__ == '__main__':
    unittest.main()
