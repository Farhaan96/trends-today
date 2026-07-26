import sys
import tempfile
import unittest
from pathlib import Path


PIPELINE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PIPELINE_DIR))

from validation import (  # noqa: E402
    validate_published_content_tree,
    validate_release_candidate,
)


class ValidationTests(unittest.TestCase):
    def article(self):
        filler = '\n\n'.join(
            ' '.join(['evidence'] * 70)
            for _ in range(9)
        )
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

    def local_metadata(self, **overrides):
        metadata = {
            'lengthRationale': 'A reported update is the shortest complete reader treatment.',
            'commercialIntent': 'none',
            'commercialFitReason': 'No commercial fit is asserted; editorial utility leads.',
            'brandSafety': 'standard',
            'sponsorshipStatus': 'editorial',
            'commercialApprovalRecorded': False,
            'highlights': [
                'The confirmed change and its local effect.',
                'The practical action residents can take now.',
                'The timing or condition readers should verify.',
            ],
            'reportingMethod': 'Checked against the supplied primary and secondary sources today.',
        }
        metadata.update(overrides)
        return metadata

    def published_article(self, root: Path, category: str, slug: str):
        destination = root / category / f'{slug}.mdx'
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text('---\ntitle: Context\n---\n', encoding='utf-8')

    def test_valid_candidate_passes(self):
        result = validate_release_candidate(
            self.article(), self.sources(), {'slug': 'valid'}, {'path': '/images/valid.webp'}
        )
        self.assertTrue(result.passed, result.errors)

    def test_public_content_tree_rejects_pending_candidate(self):
        with tempfile.TemporaryDirectory() as temp:
            content_dir = Path(temp)
            published = content_dir / 'local-news/published.mdx'
            pending = content_dir / 'local-news/pending.mdx'
            published.parent.mkdir(parents=True)
            published.write_text(
                '---\nstatus: published\n---\n\nPublished.\n',
                encoding='utf-8',
            )
            pending.write_text(
                '---\nstatus: release-candidate\n---\n\nPending.\n',
                encoding='utf-8',
            )

            result = validate_published_content_tree(content_dir)

        self.assertFalse(result.passed)
        self.assertEqual(
            result.errors,
            ['local-news/pending.mdx has non-public status release-candidate'],
        )

    def test_prose_em_dash_blocks_release(self):
        article = self.article()
        article['body_mdx'] = article['body_mdx'].replace(
            'Opening', 'Opening—with a formulaic aside'
        )
        result = validate_release_candidate(
            article, self.sources(), {'slug': 'em-dash'}, {'path': '/images/valid.webp'}
        )
        self.assertFalse(result.passed)
        self.assertIn('article prose must not use em dashes', result.errors)

    def test_quote_attribution_em_dash_is_allowed(self):
        article = self.article()
        article['body_mdx'] = article['body_mdx'].replace(
            '\n\n## Sources', '\n\n> A direct quote.\n> — Source Name\n\n## Sources'
        )
        result = validate_release_candidate(
            article,
            self.sources(),
            {'slug': 'attribution-dash'},
            {'path': '/images/valid.webp'},
        )
        self.assertTrue(result.passed, result.errors)

    def test_em_dash_inside_exact_direct_quote_is_allowed(self):
        article = self.article()
        article['body_mdx'] = article['body_mdx'].replace(
            'Opening', 'Opening with "an exact quote—including its punctuation"'
        )
        result = validate_release_candidate(
            article,
            self.sources(),
            {'slug': 'direct-quote-dash'},
            {'path': '/images/valid.webp'},
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
                'Opening for Burnaby riders.\n\n## What changed\n\n'
                + '\n\n'.join(' '.join(['local'] * 70) for _ in range(4))
                + '\n\nSee [earlier Burnaby transit changes](/transit/burnaby-context).'
                + '\n\n## What riders should do\n\n'
                + '\n\n'.join(' '.join(['action'] * 70) for _ in range(4))
                + '\n\n- Check the revised route.\n- Allow extra time.\n- Confirm the affected stop.'
                + '\n\n## Sources\n\n'
                + '\n'.join(urls)
            ),
            **self.local_metadata(),
        }
        sources = [
            {'url': urls[0], 'tier': 'primary'},
            {'url': urls[1], 'tier': 'secondary'},
        ]
        with tempfile.TemporaryDirectory() as temp:
            content_dir = Path(temp)
            self.published_article(content_dir, 'transit', 'burnaby-context')
            result = validate_release_candidate(
                article,
                sources,
                {'slug': 'burnaby-bus-change'},
                {'path': '/images/bus.webp'},
                published_content_dir=content_dir,
            )
            self.assertTrue(result.passed, result.errors)

    def test_locality_keeps_primary_source_gate_after_category_misroute(self):
        article = self.article()
        article.update({
            'category': 'space',
            'locality': 'Richmond',
            'storyType': 'reported-update',
            **self.local_metadata(),
        })
        sources = [
            {'url': source['url'], 'tier': 'secondary'}
            for source in self.sources()
        ]

        result = validate_release_candidate(
            article,
            sources,
            {'slug': 'richmond-store-change'},
            {'path': '/images/store.webp'},
        )

        self.assertFalse(result.passed)
        self.assertIn(
            'at least one primary source is required for local stories',
            result.errors,
        )

    def test_local_location_promise_requires_concrete_directory(self):
        article = {
            'title': 'Where to cool down in Surrey',
            'meta_description': 'Find Surrey cooling locations.',
            'category': 'local-news',
            'locality': 'Surrey',
            'storyType': 'reported-update',
            'readerImpact': 'Residents can find cooling locations.',
            'body_mdx': (
                'Opening.\n\n## What changed\n\n'
                + '\n\n'.join(' '.join(['local'] * 70) for _ in range(8))
                + '\n\n## What to do\n\nCheck the city website.'
                + '\n\n## Sources\n\nhttps://a.example/source\nhttps://b.example/source'
            ),
            **self.local_metadata(),
        }
        result = validate_release_candidate(
            article,
            [
                {'url': 'https://a.example/source', 'tier': 'primary'},
                {'url': 'https://b.example/source', 'tier': 'secondary'},
            ],
            {'slug': 'surrey-cooling'},
            {'path': '/images/surrey.webp'},
        )
        self.assertFalse(result.passed)
        self.assertTrue(any('location promise' in error for error in result.errors))

    def test_local_reported_update_requires_contextual_resolving_link(self):
        article = {
            'title': 'Surrey service update',
            'meta_description': 'A useful Surrey service update.',
            'category': 'local-news',
            'locality': 'Surrey',
            'storyType': 'reported-update',
            'body_mdx': (
                'Opening.\n\n## What changed\n\n'
                + ' '.join(['local'] * 220)
                + '\n\n## What to do\n\n'
                + ' '.join(['action'] * 220)
                + '\n\n[Click here](/local-news/missing-context)\n\n## Sources\n\n'
                + 'https://a.example/source\nhttps://b.example/source'
            ),
            **self.local_metadata(),
        }
        sources = [
            {'url': 'https://a.example/source', 'tier': 'primary'},
            {'url': 'https://b.example/source', 'tier': 'secondary'},
        ]
        with tempfile.TemporaryDirectory() as temp:
            result = validate_release_candidate(
                article,
                sources,
                {'slug': 'surrey-service-update'},
                {'path': '/images/surrey.webp'},
                published_content_dir=Path(temp),
            )
        self.assertFalse(result.passed)
        self.assertTrue(any('non-descriptive' in error for error in result.errors))
        self.assertTrue(any('does not resolve' in error for error in result.errors))

    def test_local_story_requires_commercial_research_metadata(self):
        article = {
            'title': 'Burnaby local update',
            'meta_description': 'A useful Burnaby local update.',
            'category': 'local-news',
            'locality': 'Burnaby',
            'storyType': 'bulletin',
            'body_mdx': (
                'Opening.\n\n## What changed\n\n'
                + ' '.join(['local'] * 140)
                + '\n\n## What to do\n\n'
                + ' '.join(['action'] * 100)
                + '\n\n## Sources\n\nhttps://a.example/source'
            ),
        }
        result = validate_release_candidate(
            article,
            [{'url': 'https://a.example/source', 'tier': 'primary'}],
            {'slug': 'burnaby-local-update'},
            {'path': '/images/burnaby.webp'},
        )
        self.assertFalse(result.passed)
        self.assertIn('commercial intent is missing or unsupported', result.errors)
        self.assertIn('commercial fit reason is required', result.errors)

    def test_commercial_coverage_requires_owner_approval(self):
        article = {
            'title': 'Richmond event guide',
            'meta_description': 'A concise Richmond event guide.',
            'category': 'things-to-do',
            'locality': 'Richmond',
            'storyType': 'bulletin',
            'body_mdx': (
                'Opening.\n\n## Event details\n\n'
                + ' '.join(['event'] * 140)
                + '\n\n## What to know\n\n'
                + ' '.join(['local'] * 100)
                + '\n\n## Sources\n\nhttps://a.example/source'
            ),
            **self.local_metadata(
                commercialIntent='sponsor-fit',
                commercialFitReason='A local event audience may fit a future sponsor test.',
                sponsorshipStatus='supported',
            ),
        }
        result = validate_release_candidate(
            article,
            [{'url': 'https://a.example/source', 'tier': 'primary'}],
            {'slug': 'richmond-event-guide'},
            {'path': '/images/richmond.webp'},
        )
        self.assertFalse(result.passed)
        self.assertIn('commercial coverage requires recorded owner approval', result.errors)

    def test_bold_first_paragraph_still_respects_length_limit(self):
        article = {
            'title': 'Burnaby service bulletin',
            'meta_description': 'A concise Burnaby service bulletin.',
            'category': 'local-news',
            'locality': 'Burnaby',
            'storyType': 'bulletin',
            'body_mdx': (
                '**Important:** '
                + ' '.join(['detail'] * 130)
                + '\n\n## What changed\n\n'
                + ' '.join(['update'] * 60)
                + '\n\n## What to do\n\n'
                + ' '.join(['action'] * 60)
                + '\n\n## Sources\n\nhttps://a.example/source'
            ),
            **self.local_metadata(),
        }
        result = validate_release_candidate(
            article,
            [{'url': 'https://a.example/source', 'tier': 'primary'}],
            {'slug': 'burnaby-service-bulletin'},
            {'path': '/images/burnaby.webp'},
        )
        self.assertFalse(result.passed)
        self.assertTrue(any('paragraph 1 has' in error for error in result.errors))

    def test_non_local_commercial_coverage_requires_owner_approval(self):
        article = {
            'title': 'Science explainer',
            'meta_description': 'A complete science explainer.',
            'category': 'science',
            'storyType': 'legacy',
            'sponsorshipStatus': 'branded',
            'commercialApprovalRecorded': False,
            'body_mdx': (
                'Opening.\n\n## What happened\n\n'
                + ' '.join(['science'] * 300)
                + '\n\n## Why it matters\n\n'
                + ' '.join(['evidence'] * 300)
                + '\n\n## Sources\n\nhttps://a.example/source\n\n'
                + 'https://b.example/source\n\nhttps://c.example/source'
            ),
        }
        result = validate_release_candidate(
            article,
            self.sources(),
            {'slug': 'science-explainer'},
            {'path': '/images/science.webp'},
        )
        self.assertFalse(result.passed)
        self.assertIn('commercial coverage requires recorded owner approval', result.errors)

    def test_sensitive_local_story_requires_recorded_approval(self):
        article = self.article()
        article['manualApprovalRequired'] = True
        result = validate_release_candidate(
            article, self.sources(), {'slug': 'sensitive'}, {'path': '/images/valid.webp'}
        )
        self.assertFalse(result.passed)
        self.assertIn('manual approval is required for this sensitive story', result.errors)

    def test_final_post_qa_text_is_scanned_for_sensitive_signals(self):
        article = self.article()
        article['body_mdx'] += '\n\nOfficials said one person died at the scene.'
        result = validate_release_candidate(
            article,
            self.sources(),
            {'slug': 'sensitive-final-copy'},
            {'path': '/images/valid.webp'},
            sensitive_keywords=['died', 'arrest'],
        )
        self.assertFalse(result.passed)
        self.assertIn('manual approval is required for this sensitive story', result.errors)

    def test_recorded_approval_allows_sensitive_final_text(self):
        article = self.article()
        article['body_mdx'] += '\n\nOfficials said one person died at the scene.'
        article['manualApprovalRecorded'] = True
        result = validate_release_candidate(
            article,
            self.sources(),
            {'slug': 'approved-final-copy'},
            {'path': '/images/valid.webp'},
            sensitive_keywords=['died'],
        )
        self.assertTrue(result.passed, result.errors)


if __name__ == '__main__':
    unittest.main()
