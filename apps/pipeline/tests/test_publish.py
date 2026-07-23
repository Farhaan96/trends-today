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
                'highlights': ['Route change', 'Weekend timing', 'Alternate stop'],
                'reportingMethod': 'Checked against TransLink source material.',
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
            self.assertIn('author: "Trends Today Newsroom"', content)
            self.assertIn('editor: "Farhaan"', content)
            self.assertIn('reportingMethod: "Checked against TransLink source material."', content)

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

    def write_gpt_review(self, root, candidate, **overrides):
        review = root / 'artifacts/editorial/reviews/gpt/science/candidate-title.review.json'
        review.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            'version': 1,
            'reviewer': 'openai-gpt',
            'verdict': 'PASS',
            'candidateSha256': candidate_sha256(candidate),
            'reviewedAt': '2026-07-20T20:00:00+00:00',
            'repositorySha': 'a' * 40,
            'modelUsed': 'gpt-5.6-sol',
            'reviewBackend': 'responses-api',
            'reviewRunId': 'resp_test',
            'scores': {
                'factualSupport': 4,
                'quality': 4,
                'readability': 4,
                'formatting': 4,
                'engagement': 4,
            },
            'proseEmDashCount': 0,
            'blockers': [],
            'summary': 'Ready for independent release review.',
        }
        payload.update(overrides)
        review.write_text(json.dumps(payload), encoding='utf-8')
        return review

    def promote(self, root, candidate, review, **gpt_overrides):
        gpt_review = self.write_gpt_review(root, candidate, **gpt_overrides)
        return promote_candidate(candidate, review, gpt_review, repo_root=root)

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
                destination = self.promote(root, candidate, review)
            promoted = destination.read_text(encoding='utf-8')
            self.assertEqual(candidate_body, promoted.split('---', 2)[2])
            self.assertIn('candidateSha256:', promoted)
            self.assertIn('reviewedBy: "claude"', promoted)
            self.assertIn('reviewVerdict: "NO BLOCKERS"', promoted)
            self.assertIn('reviewModel: "claude-opus-4-8"', promoted)
            self.assertIn('editorialReviewVerdict: "PASS"', promoted)
            self.assertIn('editorialReviewModel: "gpt-5.6-sol"', promoted)

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
            gpt_review = self.write_gpt_review(root, candidate)
            with self.assertRaises(PermissionError):
                promote_candidate(candidate, review, gpt_review, repo_root=root)

    def test_revision_promotion_requires_explicit_replace(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            publisher = Publisher(mode='candidate', repo_root=root)
            publisher.publish(
                self.article(),
                {
                    'slug': 'candidate-title',
                    'meta_description': 'Candidate description',
                    'internal_links': [],
                },
                {'path': '/images/candidate.webp', 'alt': 'Candidate image'},
            )
            candidate = root / 'artifacts/editorial/release-candidates/science/candidate-title.mdx'
            destination = root / 'content/science/candidate-title.mdx'
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_text(
                '---\n'
                'title: Existing article\n'
                'category: science\n'
                'slug: candidate-title\n'
                'status: published\n'
                '---\n\nOld body.\n',
                encoding='utf-8',
            )
            self.write_source_config(root)
            review = self.write_review(root, candidate)
            gpt_review = self.write_gpt_review(root, candidate)

            with patch('review.subprocess.run') as git_run:
                git_run.return_value.returncode = 0
                git_run.return_value.stdout = 'a' * 40
                with self.assertRaises(FileExistsError):
                    promote_candidate(
                        candidate,
                        review,
                        gpt_review,
                        repo_root=root,
                    )

                promoted = promote_candidate(
                    candidate,
                    review,
                    gpt_review,
                    repo_root=root,
                    replace_existing=True,
                )

            content = promoted.read_text(encoding='utf-8')
            self.assertIn('status: "published"', content)
            self.assertIn('Useful copy.', content)
            self.assertNotIn('Old body.', content)

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
            gpt_review = self.write_gpt_review(root, candidate)
            with self.assertRaises(PermissionError):
                promote_candidate(candidate, review, gpt_review, repo_root=root)

    def test_promotion_rejects_low_gpt_editorial_score(self):
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
            weak_scores = {
                'factualSupport': 4,
                'quality': 4,
                'readability': 3,
                'formatting': 4,
                'engagement': 4,
            }
            with self.assertRaises(PermissionError):
                self.promote(root, candidate, review, scores=weak_scores)

    def test_promotion_rejects_gpt_review_for_different_candidate_hash(self):
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
            with self.assertRaises(PermissionError):
                self.promote(root, candidate, review, candidateSha256='0' * 64)

    def test_promotion_rejects_paths_outside_candidate_tree(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            outside = root / 'outside.mdx'
            outside.write_text('---\nstatus: "release-candidate"\n---\n', encoding='utf-8')
            with self.assertRaises(ValueError):
                promote_candidate(
                    outside,
                    root / 'missing-review.json',
                    root / 'missing-gpt-review.json',
                    repo_root=root,
                )

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
                    self.promote(root, candidate, review)

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
                    self.promote(root, candidate, review)

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
                destination = self.promote(root, candidate, review)
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
                    self.promote(root, candidate, review)

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
                    self.promote(root, candidate, review)

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
                    self.promote(root, candidate, review)


if __name__ == '__main__':
    unittest.main()
