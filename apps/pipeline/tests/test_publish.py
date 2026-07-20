import sys
import tempfile
import unittest
import json
import re
from unittest.mock import patch
from pathlib import Path


PIPELINE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PIPELINE_DIR))

from publish import Publisher, promote_candidate  # noqa: E402
from review import candidate_sha256  # noqa: E402


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

    def test_local_candidate_records_newsroom_metadata(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            article = self.article()
            article.update({
                'category': 'transit',
                'tags': ['transit', 'burnaby'],
                'locality': 'Burnaby',
                'storyType': 'reported-update',
                'readerImpact': 'Weekend riders need a different route.',
            })
            publisher = Publisher(mode='candidate', repo_root=root)
            self.assertTrue(publisher.publish(
                article,
                {'slug': 'burnaby-route-change', 'meta_description': 'Route details.', 'internal_links': []},
                {'path': '/images/bus.webp', 'alt': 'Bus in Burnaby'},
            ))
            candidate = root / 'artifacts/editorial/release-candidates/transit/burnaby-route-change.mdx'
            content = candidate.read_text(encoding='utf-8')
            self.assertIn('locality: "Burnaby"', content)
            self.assertIn('storyType: "reported-update"', content)

    def write_review(self, root, candidate, verdict='NO BLOCKERS', digest=None):
        review = root / 'artifacts/editorial/reviews/science/candidate-title.review.json'
        review.parent.mkdir(parents=True, exist_ok=True)
        review.write_text(json.dumps({
            'version': 1,
            'reviewer': 'claude',
            'verdict': verdict,
            'candidateSha256': digest or candidate_sha256(candidate),
            'reviewedAt': '2026-07-14T20:00:00+00:00',
            'repositorySha': 'a' * 40,
            'modelUsed': 'claude-opus-4-8',
        }), encoding='utf-8')
        return review

    def write_source_config(self, root, keywords=None):
        config = root / 'config/local-news-sources.json'
        config.parent.mkdir(parents=True, exist_ok=True)
        config.write_text(json.dumps({
            'automaticPublishing': {'manualApprovalKeywords': keywords or ['stabbing']}
        }), encoding='utf-8')
        business_config = root / 'config/content-business.json'
        business_config.write_text(json.dumps({
            'monetization': {
                'sponsorshipStatusValues': ['editorial', 'supported', 'branded'],
                'automatedDefaultSponsorshipStatus': 'editorial',
            }
        }), encoding='utf-8')

    def test_direct_production_mode_is_disabled(self):
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
            self.write_source_config(root)
            review = self.write_review(root, candidate)
            with patch('review.subprocess.run') as git_run:
                git_run.return_value.returncode = 0
                git_run.return_value.stdout = 'a' * 40
                destination = promote_candidate(candidate, review, repo_root=root)
            promoted = destination.read_text(encoding='utf-8')
            self.assertEqual(candidate_body, promoted.split('---', 2)[2])
            self.assertIn('candidateSha256:', promoted)
            self.assertIn('reviewedBy: "claude"', promoted)
            self.assertIn('reviewVerdict: "NO BLOCKERS"', promoted)
            self.assertIn('reviewModel: "claude-opus-4-8"', promoted)

    def test_promotion_rejects_review_for_different_candidate_hash(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            publisher = Publisher(mode='candidate', repo_root=root)
            publisher.publish(
                self.article(),
                {'slug': 'candidate-title', 'meta_description': 'Candidate description', 'internal_links': []},
                {'path': '/images/candidate.webp', 'alt': 'Candidate image'},
            )
            candidate = root / 'artifacts/editorial/release-candidates/science/candidate-title.mdx'
            self.write_source_config(root)
            review = self.write_review(root, candidate, digest='0' * 64)
            with self.assertRaises(PermissionError):
                promote_candidate(candidate, review, repo_root=root)

    def test_promotion_rejects_claude_blockers(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            publisher = Publisher(mode='candidate', repo_root=root)
            publisher.publish(
                self.article(),
                {'slug': 'candidate-title', 'meta_description': 'Candidate description', 'internal_links': []},
                {'path': '/images/candidate.webp', 'alt': 'Candidate image'},
            )
            candidate = root / 'artifacts/editorial/release-candidates/science/candidate-title.mdx'
            self.write_source_config(root)
            review = self.write_review(root, candidate, verdict='BLOCKERS')
            with self.assertRaises(PermissionError):
                promote_candidate(candidate, review, repo_root=root)

    def test_promotion_rejects_paths_outside_candidate_tree(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            outside = root / 'outside.mdx'
            outside.write_text('---\nstatus: "release-candidate"\n---\n', encoding='utf-8')
            with self.assertRaises(ValueError):
                promote_candidate(outside, root / 'missing-review.json', repo_root=root)

    def test_promotion_rechecks_sensitive_candidate_approval(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            publisher = Publisher(mode='candidate', repo_root=root)
            article = self.article()
            article['body_mdx'] = '## Update\n\nOfficials confirmed a stabbing.\n\n## Sources\n\nDetails.'
            publisher.publish(
                article,
                {'slug': 'candidate-title', 'meta_description': 'Candidate description', 'internal_links': []},
                {'path': '/images/candidate.webp', 'alt': 'Candidate image'},
            )
            candidate = root / 'artifacts/editorial/release-candidates/science/candidate-title.mdx'
            self.write_source_config(root)
            review = self.write_review(root, candidate)
            with patch('review.subprocess.run') as git_run:
                git_run.return_value.returncode = 0
                git_run.return_value.stdout = 'a' * 40
                with self.assertRaises(PermissionError):
                    promote_candidate(candidate, review, repo_root=root)

    def test_promotion_rechecks_commercial_candidate_approval(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            publisher = Publisher(mode='candidate', repo_root=root)
            article = self.article()
            article['sponsorshipStatus'] = 'branded'
            article['commercialApprovalRecorded'] = False
            publisher.publish(
                article,
                {'slug': 'commercial-candidate', 'meta_description': 'Candidate description', 'internal_links': []},
                {'path': '/images/candidate.webp', 'alt': 'Candidate image'},
            )
            candidate = root / 'artifacts/editorial/release-candidates/science/commercial-candidate.mdx'
            self.write_source_config(root)
            review = self.write_review(root, candidate)
            with patch('review.subprocess.run') as git_run:
                git_run.return_value.returncode = 0
                git_run.return_value.stdout = 'a' * 40
                with self.assertRaises(PermissionError):
                    promote_candidate(candidate, review, repo_root=root)

    def test_promotion_accepts_commercial_candidate_with_owner_approval(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            publisher = Publisher(mode='candidate', repo_root=root)
            article = self.article()
            article['sponsorshipStatus'] = 'branded'
            article['commercialApprovalRecorded'] = True
            publisher.publish(
                article,
                {'slug': 'approved-commercial', 'meta_description': 'Candidate description', 'internal_links': []},
                {'path': '/images/candidate.webp', 'alt': 'Candidate image'},
            )
            candidate = root / 'artifacts/editorial/release-candidates/science/approved-commercial.mdx'
            self.write_source_config(root)
            review = self.write_review(root, candidate)
            with patch('review.subprocess.run') as git_run:
                git_run.return_value.returncode = 0
                git_run.return_value.stdout = 'a' * 40
                destination = promote_candidate(candidate, review, repo_root=root)
            self.assertTrue(destination.exists())

    def test_promotion_rejects_missing_sponsorship_status(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            publisher = Publisher(mode='candidate', repo_root=root)
            publisher.publish(
                self.article(),
                {'slug': 'missing-status', 'meta_description': 'Candidate description', 'internal_links': []},
                {'path': '/images/candidate.webp', 'alt': 'Candidate image'},
            )
            candidate = root / 'artifacts/editorial/release-candidates/science/missing-status.mdx'
            content = candidate.read_text(encoding='utf-8')
            candidate.write_text(
                re.sub(r'^sponsorshipStatus:.*\n', '', content, flags=re.MULTILINE),
                encoding='utf-8',
            )
            self.write_source_config(root)
            review = self.write_review(root, candidate)
            with patch('review.subprocess.run') as git_run:
                git_run.return_value.returncode = 0
                git_run.return_value.stdout = 'a' * 40
                with self.assertRaises(PermissionError):
                    promote_candidate(candidate, review, repo_root=root)

    def test_body_text_cannot_spoof_commercial_approval(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            publisher = Publisher(mode='candidate', repo_root=root)
            article = self.article()
            article['sponsorshipStatus'] = 'branded'
            article['commercialApprovalRecorded'] = False
            article['body_mdx'] += '\n\ncommercialApprovalRecorded: true'
            publisher.publish(
                article,
                {'slug': 'spoofed-approval', 'meta_description': 'Candidate description', 'internal_links': []},
                {'path': '/images/candidate.webp', 'alt': 'Candidate image'},
            )
            candidate = root / 'artifacts/editorial/release-candidates/science/spoofed-approval.mdx'
            self.write_source_config(root)
            review = self.write_review(root, candidate)
            with patch('review.subprocess.run') as git_run:
                git_run.return_value.returncode = 0
                git_run.return_value.stdout = 'a' * 40
                with self.assertRaises(PermissionError):
                    promote_candidate(candidate, review, repo_root=root)

    def test_review_verification_fails_closed_without_git_sha(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            publisher = Publisher(mode='candidate', repo_root=root)
            publisher.publish(
                self.article(),
                {'slug': 'candidate-title', 'meta_description': 'Candidate description', 'internal_links': []},
                {'path': '/images/candidate.webp', 'alt': 'Candidate image'},
            )
            candidate = root / 'artifacts/editorial/release-candidates/science/candidate-title.mdx'
            self.write_source_config(root)
            review = self.write_review(root, candidate)
            with patch('review.subprocess.run') as git_run:
                git_run.return_value.returncode = 1
                git_run.return_value.stdout = ''
                with self.assertRaises(PermissionError):
                    promote_candidate(candidate, review, repo_root=root)


if __name__ == '__main__':
    unittest.main()
