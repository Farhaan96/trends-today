import sys
import tempfile
import unittest
from pathlib import Path


PIPELINE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PIPELINE_DIR))

from publish import Publisher, promote_candidate  # noqa: E402


class PublisherTests(unittest.TestCase):
    def article(self):
        return {
            'title': 'Candidate title',
            'subtitle': 'Candidate subtitle',
            'body_mdx': '## Body\n\nUseful copy.',
            'meta_description': 'Candidate description',
            'tags': ['science'],
            'category': 'science',
        }

    def test_candidate_stays_outside_live_content_tree(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            publisher = Publisher(mode='candidate', repo_root=root)
            self.assertTrue(publisher.publish(
                self.article(),
                {'slug': 'candidate-title', 'meta_description': 'Candidate description', 'internal_links': []},
                {'path': '/images/candidate.webp', 'alt': 'Candidate image'},
            ))
            self.assertTrue((root / 'artifacts/editorial/release-candidates/science/candidate-title.mdx').exists())
            self.assertFalse((root / 'content/science/candidate-title.mdx').exists())

    def test_production_requires_named_authorization(self):
        with tempfile.TemporaryDirectory() as temp:
            with self.assertRaises(PermissionError):
                Publisher(mode='production', repo_root=Path(temp))

    def test_promotion_uses_exact_candidate_and_records_hash(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            publisher = Publisher(mode='candidate', repo_root=root)
            publisher.publish(
                self.article(),
                {'slug': 'candidate-title', 'meta_description': 'Candidate description', 'internal_links': []},
                {'path': '/images/candidate.webp', 'alt': 'Candidate image'},
            )
            candidate = root / 'artifacts/editorial/release-candidates/science/candidate-title.mdx'
            candidate_body = candidate.read_text(encoding='utf-8').split('---', 2)[2]
            destination = promote_candidate(candidate, 'Farhaan', repo_root=root)
            promoted = destination.read_text(encoding='utf-8')
            self.assertEqual(candidate_body, promoted.split('---', 2)[2])
            self.assertIn('candidateSha256:', promoted)
            self.assertIn('approvedBy: "Farhaan"', promoted)

    def test_promotion_rejects_paths_outside_candidate_tree(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            outside = root / 'outside.mdx'
            outside.write_text('---\nstatus: "release-candidate"\n---\n', encoding='utf-8')
            with self.assertRaises(ValueError):
                promote_candidate(outside, 'Farhaan', repo_root=root)


if __name__ == '__main__':
    unittest.main()
