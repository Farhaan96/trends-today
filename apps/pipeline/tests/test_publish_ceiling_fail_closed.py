import sys
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path


PIPELINE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PIPELINE_DIR))

from publish import _commit_promotion  # noqa: E402


class DailyPromotionCeilingFailClosedTests(unittest.TestCase):
    def commit(self, root: Path, at: datetime) -> None:
        _commit_promotion(
            root,
            root / 'content/science/new.mdx',
            '---\nstatus: published\nslug: new\n---\n',
            at,
            'slug: new',
            False,
        )

    def test_rejects_malformed_published_frontmatter(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            published = root / 'content/science/malformed.mdx'
            published.parent.mkdir(parents=True)
            published.write_text(
                'status: published\npublishedAt: "2026-11-16T07:00:00-08:00"\n',
                encoding='utf-8',
            )
            with self.assertRaisesRegex(ValueError, 'missing or malformed frontmatter'):
                self.commit(root, datetime(2026, 11, 17, 18, 0, tzinfo=timezone.utc))

    def test_rejects_published_article_without_date(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            published = root / 'content/science/missing-date.mdx'
            published.parent.mkdir(parents=True)
            published.write_text(
                '---\nstatus: published\nslug: missing-date\n---\n\nBody.\n',
                encoding='utf-8',
            )
            with self.assertRaisesRegex(ValueError, 'no valid publication date'):
                self.commit(root, datetime(2026, 11, 17, 18, 0, tzinfo=timezone.utc))

    def test_accepts_bom_frontmatter_and_counts_its_date(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            published = root / 'content/science/bom.mdx'
            published.parent.mkdir(parents=True)
            published.write_text(
                '\ufeff---\nstatus: published\npublishedAt: "2026-11-16T07:00:00-08:00"\n'
                '---\n\nBody.\n',
                encoding='utf-8',
            )
            with self.assertRaisesRegex(PermissionError, 'Daily promotion ceiling'):
                self.commit(root, datetime(2026, 11, 16, 18, 0, tzinfo=timezone.utc))


if __name__ == '__main__':
    unittest.main()
