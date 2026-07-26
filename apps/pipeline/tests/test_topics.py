import sys
import tempfile
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
        self.assertTrue(
            discovery.source_config['leadSourcePolicy'][
                'directFetchRequiresConfiguredAccessAndRobotsApproval'
            ]
        )
        self.assertGreater(
            discovery.source_config['searchDiscovery'][
                'reservedLocalChangeCandidates'
            ],
            0,
        )
        self.assertIn(
            'Lower Mainland',
            discovery.source_config['searchDiscovery'][
                'googleCseScopeRequirement'
            ],
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
                'storyType': 'bulletin',
                'topicGroup': 'community services',
                'maxCandidatesPerSweep': 2,
            }]
        }
        candidates = discovery.discover_official_pages(1)

        self.assertEqual(1, len(candidates))
        self.assertEqual('Burnaby', candidates[0]['locality'])
        self.assertEqual('transit', candidates[0]['category'])
        self.assertEqual('reported-update', candidates[0]['storyType'])
        self.assertEqual('community services', candidates[0]['sourceTopic'])
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

    @patch('topics.requests.get')
    def test_primary_source_uses_visible_headline_not_title_attribute(self, get):
        response = Mock()
        response.status_code = 200
        response.url = 'https://city.example/news'
        response.text = (
            '<a title="Read more" href="/news/water-main-work">'
            'Richmond water-main work closes two lanes Monday'
            '</a>'
        )
        get.return_value = response

        discovery = TopicDiscovery()
        discovery.source_config = {
            'sources': [{
                'name': 'Test city source',
                'url': 'https://city.example/news',
                'domain': 'city.example',
                'locality': 'Richmond',
                'desks': ['local-news'],
                'tier': 'primary',
                'discoveryEnabled': True,
                'includeUrlPatterns': ['/news/'],
            }]
        }

        candidates = discovery.discover_official_pages(1)

        self.assertEqual(1, len(candidates))
        self.assertEqual(
            'Richmond water-main work closes two lanes Monday',
            candidates[0]['title'],
        )

    @patch('topics.requests.get')
    def test_primary_source_drops_image_only_title_attribute(self, get):
        response = Mock()
        response.status_code = 200
        response.url = 'https://city.example/news'
        response.text = (
            '<a title="Invisible promotional headline" href="/news/promo">'
            '<img src="promo.jpg"></a>'
        )
        get.return_value = response

        discovery = TopicDiscovery()
        discovery.source_config = {
            'sources': [{
                'name': 'Test city source',
                'url': 'https://city.example/news',
                'domain': 'city.example',
                'locality': 'Richmond',
                'desks': ['local-news'],
                'tier': 'primary',
                'discoveryEnabled': True,
                'includeUrlPatterns': ['/news/'],
            }]
        }

        self.assertEqual([], discovery.discover_official_pages(1))

    @patch('topics.requests.get')
    def test_source_contract_can_exclude_application_links(self, get):
        response = Mock()
        response.status_code = 200
        response.url = 'https://city.example/events'
        response.text = (
            '<a href="/events/list-event">List an Event on City.example</a>'
            '<a href="/events/neighbourhood-picnic">Neighbourhood picnic in the plaza</a>'
        )
        get.return_value = response

        discovery = TopicDiscovery()
        discovery.source_config = {
            'sources': [{
                'name': 'Test event source',
                'url': 'https://city.example/events',
                'domain': 'city.example',
                'locality': 'New Westminster',
                'desks': ['things-to-do'],
                'tier': 'primary',
                'discoveryEnabled': True,
                'includeUrlPatterns': ['/events/'],
                'excludeTitleRegex': 'list an event|application',
            }]
        }

        candidates = discovery.discover_official_pages(5)

        self.assertEqual(1, len(candidates))
        self.assertEqual('Neighbourhood picnic in the plaza', candidates[0]['title'])

    @patch('topics.requests.get')
    def test_secondary_lead_source_requires_a_local_change_title(self, get):
        response = Mock()
        response.status_code = 200
        response.url = 'https://publication.example/vancouver/closings'
        response.text = (
            '<a title="Sporting goods store set to close" '
            'href="/vancouver/store-closing">'
            '<span>Retail</span><h3>Sporting goods store set to close</h3>'
            '<span>Reporter Name</span></a>'
            '<a href="/vancouver/neighbourhood-profile">A guide to the neighbourhood</a>'
        )
        get.return_value = response

        discovery = TopicDiscovery()
        discovery.source_config = {
            'sources': [{
                'name': 'Local publication leads',
                'url': 'https://publication.example/vancouver/closings',
                'domain': 'publication.example',
                'locality': 'Vancouver',
                'desks': ['local-news'],
                'tier': 'secondary',
                'discoveryRole': 'lead',
                'discoveryEnabled': True,
                'automatedAccessApproved': True,
                'writtenPermissionReference': 'publisher-email-2026-07-25',
                'includeUrlPatterns': ['/vancouver/'],
                'includeTitleRegex': r'\b(closing|close|opening|open)\b',
            }]
        }

        candidates = discovery.discover_official_pages(5)

        self.assertEqual(1, len(candidates))
        self.assertEqual('secondary_lead_page', candidates[0]['source'])
        self.assertEqual('lead', candidates[0]['discoveryRole'])
        self.assertEqual('secondary', candidates[0]['sourceTier'])
        self.assertEqual('Sporting goods store set to close', candidates[0]['title'])

    @patch('topics.requests.get')
    def test_robots_disallow_blocks_configured_source_page(self, get):
        robots = Mock()
        robots.status_code = 200
        robots.text = 'User-agent: TrendsTodayLocalDesk\nDisallow: /news'
        get.return_value = robots

        discovery = TopicDiscovery()
        discovery.source_config = {
            'sources': [{
                'name': 'Blocked city source',
                'url': 'https://city.example/news',
                'domain': 'city.example',
                'locality': 'Surrey',
                'desks': ['local-news'],
                'tier': 'primary',
                'discoveryEnabled': True,
            }]
        }

        self.assertEqual([], discovery.discover_official_pages(1))
        self.assertEqual(1, get.call_count)
        self.assertIn('robots policy', discovery.last_source_scan[0]['status'])

    @patch('topics.requests.get')
    def test_secondary_lead_without_access_approval_is_not_requested(self, get):
        discovery = TopicDiscovery()
        discovery.source_config = {
            'sources': [{
                'name': 'Unapproved publication leads',
                'url': 'https://publication.example/vancouver/closings',
                'domain': 'publication.example',
                'locality': 'Vancouver',
                'desks': ['local-news'],
                'tier': 'secondary',
                'discoveryRole': 'lead',
                'discoveryEnabled': True,
            }]
        }

        self.assertEqual([], discovery.discover_official_pages(5))
        get.assert_not_called()

    def test_secondary_source_without_role_still_needs_written_permission(self):
        discovery = TopicDiscovery()
        discovery.source_config = {
            'sources': [{
                'name': 'Unapproved secondary source',
                'url': 'https://publication.example/local',
                'domain': 'publication.example',
                'locality': 'Vancouver',
                'desks': ['local-news'],
                'tier': 'secondary',
                'discoveryEnabled': True,
                'automatedAccessApproved': True,
            }]
        }

        self.assertEqual([], discovery.discovery_sources)

    def test_source_yield_summary_groups_candidates_for_skip_reports(self):
        summary = TopicDiscovery.summarize_source_yield([
            {
                'title': 'Event one',
                'sourceName': 'City events',
                'category': 'things-to-do',
                'sourceTopic': 'civic events',
            },
            {
                'title': 'Event two',
                'sourceName': 'City events',
                'category': 'things-to-do',
                'sourceTopic': 'civic events',
            },
        ])

        self.assertEqual([
            {
                'sourceName': 'City events',
                'category': 'things-to-do',
                'sourceTopic': 'civic events',
                'count': 2,
                'acceptedCount': 0,
                'includedCount': 2,
                'sampleTitles': ['Event one', 'Event two'],
            }
        ], summary)

    @patch('topics.requests.get')
    def test_primary_source_scan_round_robins_across_sources(self, get):
        first = Mock()
        first.status_code = 200
        first.url = 'https://first.example/news'
        first.text = ''.join(
            f'<a href="/news/story-{index}">First city service update number {index}</a>'
            for index in range(1, 5)
        )
        second = Mock()
        second.status_code = 200
        second.url = 'https://second.example/events'
        second.text = ''.join(
            f'<a href="/events/story-{index}">Second city event listing number {index}</a>'
            for index in range(1, 5)
        )
        robots = Mock()
        robots.status_code = 404
        robots.text = ''
        get.side_effect = [robots, first, robots, second]

        discovery = TopicDiscovery()
        discovery.source_config = {
            'sources': [
                {
                    'name': 'First source',
                    'url': 'https://first.example/news',
                    'domain': 'first.example',
                    'locality': 'Surrey',
                    'desks': ['local-news'],
                    'tier': 'primary',
                    'discoveryEnabled': True,
                    'includeUrlPatterns': ['/news/'],
                    'maxCandidatesPerSweep': 4,
                },
                {
                    'name': 'Second source',
                    'url': 'https://second.example/events',
                    'domain': 'second.example',
                    'locality': 'New Westminster',
                    'desks': ['things-to-do'],
                    'tier': 'primary',
                    'discoveryEnabled': True,
                    'includeUrlPatterns': ['/events/'],
                    'maxCandidatesPerSweep': 4,
                },
            ]
        }

        candidates = discovery.discover_official_pages(3)

        self.assertEqual(3, len(candidates))
        self.assertEqual(
            ['First source', 'Second source', 'First source'],
            [candidate['sourceName'] for candidate in candidates],
        )
        self.assertEqual(4, discovery.last_source_scan[0]['acceptedCount'])
        self.assertEqual(4, discovery.last_source_scan[1]['acceptedCount'])

    @patch('topics.requests.post')
    def test_perplexity_search_includes_non_event_local_changes(self, post):
        response = Mock()
        response.status_code = 200
        response.json.return_value = {
            'choices': [{
                'message': {
                    'content': (
                        'Richmond | Richmond retailer announces a new location'
                    )
                }
            }]
        }
        post.return_value = response

        discovery = TopicDiscovery()
        discovery.perplexity_key = 'test-key'
        candidates = discovery.discover_perplexity(5)

        prompt = post.call_args.kwargs['json']['messages'][0]['content']
        self.assertIn('local retail and business openings, closures, relocations', prompt)
        self.assertIn('useful non-event changes', prompt)
        self.assertIn('discovery leads only', prompt)
        self.assertIn('primary source', prompt)
        self.assertEqual('secondary', candidates[0]['sourceTier'])
        self.assertEqual('lead', candidates[0]['discoveryRole'])

    def test_discovery_reserves_local_change_lane_when_official_queue_is_full(self):
        discovery = TopicDiscovery()
        discovery.source_config = {
            'officialCandidateLimit': 5,
            'searchDiscovery': {
                'enabled': True,
                'reservedLocalChangeCandidates': 2,
            },
        }
        local_changes = [
            {'title': f'Local business change {index}', 'source': 'search'}
            for index in range(2)
        ]
        official = [
            {'title': f'Official event update {index}', 'source': 'official'}
            for index in range(5)
        ]
        with tempfile.TemporaryDirectory() as temp:
            discovery.cache_dir = Path(temp)
            with (
                patch.object(
                    discovery,
                    'discover_local_changes',
                    return_value=local_changes,
                ) as changes,
                patch.object(
                    discovery,
                    'discover_official_pages',
                    return_value=official,
                ),
            ):
                topics = discovery.discover(5)

        self.assertEqual(5, len(topics))
        self.assertEqual(local_changes, topics[:2])
        changes.assert_called_once_with(2)

    def test_locality_resolution_prefers_longest_match_and_excludes_homonyms(self):
        discovery = TopicDiscovery()

        self.assertEqual(
            'Port Coquitlam',
            discovery._resolve_locality(
                'Port Coquitlam hardware store closing sale',
            ),
        )
        self.assertEqual(
            'North Vancouver',
            discovery._resolve_locality(
                'North Vancouver retailer announces new location',
            ),
        )
        self.assertEqual(
            '',
            discovery._resolve_locality(
                'Surrey, England high street retailer shutters',
            ),
        )
        self.assertEqual(
            '',
            discovery._resolve_locality(
                'Delta Air Lines opens new airport lounge',
            ),
        )

    @patch('topics.requests.get')
    def test_duplicate_google_results_do_not_consume_reserved_lane(self, get):
        response = Mock()
        response.status_code = 200
        response.json.return_value = {
            'items': [{
                'title': 'Burnaby hardware store announces closing sale',
                'snippet': 'The Burnaby, B.C. store closes next month.',
                'link': 'https://publication.example/burnaby/store-closing',
            }]
        }
        get.return_value = response
        discovery = TopicDiscovery()
        discovery.google_key = 'test-key'
        discovery.google_cse_id = 'test-cse'
        discovery.source_config = {
            'localities': ['Burnaby'],
            'searchDiscovery': {
                'enabled': True,
                'localChangeQueries': ['query one', 'query two'],
                'approvedRegionalLabels': [],
            },
            'sources': [],
        }
        perplexity_fill = [{
            'title': 'Burnaby retailer relocates',
            'source': 'perplexity',
        }, {
            'title': 'Burnaby storefront reopens',
            'source': 'perplexity',
        }]

        with patch.object(
            discovery,
            'discover_perplexity',
            return_value=perplexity_fill,
        ) as perplexity:
            topics = discovery.discover_local_changes(3)

        self.assertEqual(3, len(topics))
        self.assertEqual(
            1,
            len([
                topic for topic in topics
                if topic.get('source') == 'google_local_change'
            ]),
        )
        perplexity.assert_called_once_with(2, local_changes_only=True)

    @patch('topics.requests.get')
    def test_google_search_includes_local_business_change_queries(self, get):
        response = Mock()
        response.status_code = 200
        response.json.return_value = {
            'items': [{
                'title': 'Burnaby retailer confirms store relocation',
                'link': 'https://publication.example/burnaby/store-relocation',
            }]
        }
        get.return_value = response

        discovery = TopicDiscovery()
        discovery.google_key = 'test-key'
        discovery.google_cse_id = 'test-cse'
        candidates = discovery.discover_local_changes(5)

        queries = [
            call.kwargs['params']['q']
            for call in get.call_args_list
        ]
        self.assertTrue(
            any(
                'retail store local business opening closing relocation' in query
                for query in queries
            )
        )
        self.assertEqual('secondary', candidates[0]['sourceTier'])
        self.assertEqual('lead', candidates[0]['discoveryRole'])
        self.assertEqual('google_local_change', candidates[0]['source'])
        self.assertEqual('Burnaby', candidates[0]['locality'])

    @patch('topics.requests.get')
    def test_google_result_on_configured_primary_domain_keeps_primary_tier(self, get):
        response = Mock()
        response.status_code = 200
        response.json.return_value = {
            'items': [{
                'title': 'Vancouver confirms a new community service location',
                'link': 'https://vancouver.ca/news-calendar/new-location.aspx',
            }]
        }
        get.return_value = response

        discovery = TopicDiscovery()
        discovery.google_key = 'test-key'
        discovery.google_cse_id = 'test-cse'
        discovery.source_config = {
            'localities': ['Vancouver'],
            'sources': [{
                'name': 'City of Vancouver news',
                'url': 'https://vancouver.ca/news-calendar/news.aspx',
                'domain': 'vancouver.ca',
                'locality': 'Vancouver',
                'tier': 'primary',
            }]
        }

        candidates = discovery.discover_google_news(
            1,
            categories=['Vancouver local service updates'],
        )

        self.assertEqual('primary', candidates[0]['sourceTier'])
        self.assertEqual('evidence', candidates[0]['discoveryRole'])
        self.assertEqual('Vancouver', candidates[0]['locality'])

    @patch('topics.requests.get')
    def test_google_result_without_approved_locality_is_dropped(self, get):
        response = Mock()
        response.status_code = 200
        response.json.return_value = {
            'items': [{
                'title': 'Queen Street shop closes after 40 years',
                'snippet': 'The Toronto retailer will close next month.',
                'link': 'https://publication.example/toronto/shop-closes',
            }]
        }
        get.return_value = response

        discovery = TopicDiscovery()
        discovery.google_key = 'test-key'
        discovery.google_cse_id = 'test-cse'
        discovery.source_config = {
            'localities': ['Vancouver', 'Burnaby', 'Richmond'],
            'searchDiscovery': {
                'approvedRegionalLabels': ['Lower Mainland'],
            },
            'sources': [],
        }

        candidates = discovery.discover_google_news(
            1,
            categories=['retail store closures'],
        )

        self.assertEqual([], candidates)

    @patch('topics.requests.get')
    def test_province_wide_configured_source_still_needs_local_evidence(self, get):
        response = Mock()
        response.status_code = 200
        response.json.return_value = {
            'items': [{
                'title': 'Northern highway project receives approval',
                'snippet': 'The project is located near Prince George.',
                'link': 'https://news.gov.bc.ca/releases/2026TT001',
            }]
        }
        get.return_value = response

        discovery = TopicDiscovery()
        discovery.google_key = 'test-key'
        discovery.google_cse_id = 'test-cse'
        discovery.source_config = {
            'localities': ['Vancouver', 'Burnaby', 'Richmond'],
            'searchDiscovery': {'approvedRegionalLabels': ['Lower Mainland']},
            'sources': [{
                'name': 'BC Government news',
                'url': 'https://news.gov.bc.ca/',
                'domain': 'news.gov.bc.ca',
                'locality': 'British Columbia',
                'tier': 'primary',
            }],
        }

        candidates = discovery.discover_google_news(
            1,
            categories=['British Columbia government news'],
        )

        self.assertEqual([], candidates)

    @patch('topics.requests.get')
    def test_google_result_locality_comes_from_result_text(self, get):
        response = Mock()
        response.status_code = 200
        response.json.return_value = {
            'items': [{
                'title': 'Independent hardware store closes after 40 years',
                'snippet': 'The Burnaby shop will close at the end of July.',
                'link': 'https://publication.example/local/shop-closes',
            }]
        }
        get.return_value = response

        discovery = TopicDiscovery()
        discovery.google_key = 'test-key'
        discovery.google_cse_id = 'test-cse'
        discovery.source_config = {
            'localities': ['Vancouver', 'Burnaby', 'Richmond'],
            'searchDiscovery': {'approvedRegionalLabels': []},
            'sources': [],
        }

        candidates = discovery.discover_google_news(
            1,
            categories=['retail store closures'],
        )

        self.assertEqual('Burnaby', candidates[0]['locality'])


if __name__ == '__main__':
    unittest.main()
