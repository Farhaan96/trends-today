import sys
import unittest
from pathlib import Path


PIPELINE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PIPELINE_DIR))

from source_policy import (  # noqa: E402
    automated_access_approved,
    canonical_http_url,
    host_is_same_or_subdomain,
    is_http_url,
    url_host,
)


class SourcePolicyTests(unittest.TestCase):
    def test_scheme_less_host_can_be_compared_but_is_not_a_fetchable_url(self):
        self.assertEqual(
            'publication.example',
            url_host('publication.example/vancouver/story'),
        )
        self.assertFalse(is_http_url('publication.example/vancouver/story'))

    def test_canonical_url_ignores_tracking_query_and_trailing_slash(self):
        self.assertEqual(
            canonical_http_url('https://www.city.example/news/update/?utm_source=x'),
            canonical_http_url('https://city.example/news/update'),
        )

    def test_lead_subdomain_does_not_block_parent_domain(self):
        self.assertFalse(
            host_is_same_or_subdomain(
                'https://example.com/official',
                'blog.example.com',
            )
        )

    def test_secondary_direct_access_needs_written_permission_reference(self):
        config = {
            'sources': [{
                'domain': 'publication.example',
                'tier': 'secondary',
                'automatedAccessApproved': True,
            }]
        }
        self.assertFalse(
            automated_access_approved(
                'https://publication.example/story',
                config,
            )
        )
        config['sources'][0]['writtenPermissionReference'] = 'owner-email-2026-07-25'
        self.assertTrue(
            automated_access_approved(
                'https://publication.example/story',
                config,
            )
        )


if __name__ == '__main__':
    unittest.main()
