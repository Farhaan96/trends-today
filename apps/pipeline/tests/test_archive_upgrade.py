import tempfile
import unittest
from pathlib import Path

from apps.pipeline.archive_upgrade import (
    audit_document,
    split_document,
    upgrade_document,
)


class ArchiveUpgradeTests(unittest.TestCase):
    def test_upgrade_adds_truthful_archive_metadata_and_preserves_claims(self):
        original = """---
title: 'Example'
description: 'A concise description with enough words to serve as one useful highlight for readers.'
author: 'Alex Chen'
---

This first sentence contains enough words to become a useful highlight for the reader. This second sentence provides another exact statement from the existing article body.

## What changed

The original claim remains unchanged — only its punctuation and presentation change.
"""
        updated, changed = upgrade_document(original)
        frontmatter, body = split_document(updated)

        self.assertTrue(changed)
        self.assertIn("author: 'Trends Today Newsroom'", frontmatter)
        self.assertIn("archiveReviewStatus:", frontmatter)
        self.assertIn("Sources not freshly reverified", frontmatter)
        self.assertIn("highlights:", frontmatter)
        self.assertNotIn("—", body)
        self.assertIn("The original claim remains unchanged", body)

    def test_upgrade_lists_only_sources_already_linked_in_body(self):
        original = """---
title: 'Sources'
description: 'A description with enough words to become one of the article highlights for readers.'
author: 'Trends Today Team'
---

The article cites an [official report](https://example.gov/report) and explains what it originally said. Another existing [study](https://example.edu/study) supplies context for the article.

## Findings

A third existing [dataset](https://data.example.org/table) is also linked in the original text.
"""
        updated, _ = upgrade_document(original)
        _, body = split_document(updated)

        self.assertIn("## Sources", body)
        self.assertIn("[official report](https://example.gov/report)", body)
        self.assertIn("[study](https://example.edu/study)", body)
        self.assertIn("[dataset](https://data.example.org/table)", body)

    def test_existing_reviewed_metadata_is_not_relabelled_as_archive_only(self):
        original = """---
title: 'Reviewed'
description: 'Reviewed article'
author: 'Trends Today Newsroom'
highlights:
  - 'One useful fact'
  - 'A second useful fact'
  - 'A third useful fact'
reportingMethod: 'Checked against the linked primary sources today.'
---

Reviewed body with no formatting changes.
"""
        updated, _ = upgrade_document(original)
        frontmatter, _ = split_document(updated)

        self.assertNotIn("archiveReviewStatus", frontmatter)
        self.assertIn(
            "reportingMethod: 'Checked against the linked primary sources today.'",
            frontmatter,
        )

    def test_exact_release_review_is_preserved_as_historical_metadata(self):
        original = """---
title: 'Reviewed'
description: 'Reviewed article'
author: 'Trends Today Newsroom'
candidateSha256: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
reviewVerdict: 'NO BLOCKERS'
reviewArtifact: 'review.json'
highlights:
  - 'One useful fact'
  - 'A second useful fact'
  - 'A third useful fact'
reportingMethod: 'Checked against the linked primary sources today.'
---

Reviewed body with no formatting changes.
"""
        updated, _ = upgrade_document(original)
        frontmatter, _ = split_document(updated)

        self.assertNotIn("\ncandidateSha256:", frontmatter)
        self.assertIn("originalCandidateSha256:", frontmatter)
        self.assertIn("originalReviewVerdict:", frontmatter)
        self.assertIn("originalIndependentReviewArtifact:", frontmatter)
        self.assertIn(
            "format-reviewed-original-release-check-preserved", frontmatter
        )

    def test_audit_detects_source_refresh_gap(self):
        text = """---
title: 'Gap'
description: 'Gap'
highlights:
  - 'One'
  - 'Two'
  - 'Three'
reportingMethod: 'Archive formatting pass.'
archiveReviewStatus: 'format-reviewed-needs-source-refresh'
---

Short body.
"""
        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "gap.mdx"
            audit = audit_document(path, text)

        self.assertTrue(audit.source_refresh_required)
        self.assertIn("missing Sources section", audit.issues)
        self.assertIn(
            "fewer than 3 external source link(s) required for legacy",
            audit.issues,
        )


if __name__ == "__main__":
    unittest.main()
