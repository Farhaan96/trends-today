import sys
import unittest
from pathlib import Path
from unittest.mock import Mock, patch


PIPELINE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PIPELINE_DIR))

from topics import TopicDiscovery  # noqa: E402


class LocalTopicDiscoveryTests(unittest.TestCase):
    def test_config_is_local_first(self):
        discovery = TopicDiscovery()
        self.assertEqual('Lower Mainland, British Columbia', discovery.source_config['region'])
        self.assertTrue(discovery.discovery_sources)
        self.assertTrue(
            all(source['tier'] == 'primary' for source in discovery.discovery_sources)
        )

    @patch('topics.requests.get')
    def test_primary_source_link_becomes_local_candidate(self, get):
        response = Mock()
        response.status_code = 200
        response.url = 'https://city.example/news'
        response.text = (
            '<a href="/news/weekend-expo-line-work">'
            'Weekend Expo Line work changes service in Burnaby'
            '</a>'
        )
        get.return_value = response

        discovery = TopicDiscovery()
        discovery.source_config = {
            'sources': [{
                'name': 'Test transit source',
                'url': 'https://city.example/news',
                'domain': 'city.example',
                'locality': 'Burnaby',
                'desks': ['transit'],
                'tier': 'primary',
                'discoveryEnabled': True,
                'includeUrlPatterns': ['/news/'],
            }]
        }
        candidates = discovery.discover_official_pages(1)

        self.assertEqual(1, len(candidates))
        self.assertEqual('Burnaby', candidates[0]['locality'])
        self.assertEqual('transit', candidates[0]['category'])
        self.assertEqual('primary', candidates[0]['sourceTier'])
        self.assertEqual(
            'https://city.example/news/weekend-expo-line-work',
            candidates[0]['url'],
        )

    @patch('topics.requests.get')
    def test_primary_source_navigation_links_are_rejected(self, get):
        response = Mock()
        response.status_code = 200
        response.url = 'https://city.example/news'
        response.text = (
            '<a href="/services/transportation">Parking, Streets and Transportation</a>'
        )
        get.return_value = response

        discovery = TopicDiscovery()
        discovery.source_config = {
            'sources': [{
                'name': 'Test city source',
                'url': 'https://city.example/news',
                'domain': 'city.example',
                'locality': 'Surrey',
                'desks': ['local-news'],
                'tier': 'primary',
                'discoveryEnabled': True,
                'includeUrlPatterns': ['/news/'],
            }]
        }

        self.assertEqual([], discovery.discover_official_pages(1))


if __name__ == '__main__':
    unittest.main()
