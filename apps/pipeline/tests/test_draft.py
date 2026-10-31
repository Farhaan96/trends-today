import sys
import unittest
from pathlib import Path


PIPELINE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PIPELINE_DIR))

from draft import ArticleDrafter  # noqa: E402


class DraftPromptTests(unittest.TestCase):
    def test_prompt_labels_source_tiers_and_blocks_competitor_mirroring(self):
        prompt = ArticleDrafter()._build_prompt(
            'Vancouver retailer announces a store closure',
            [{
                'title': 'Official store page',
                'url': 'https://retailer.example/store/vancouver',
                'snippet': 'The retailer says this location is closing.',
                'tier': 'primary',
            }, {
                'title': 'Neighbourhood coverage',
                'url': 'https://publication.example/vancouver/store-closing',
                'snippet': 'A local publication reported the change.',
                'tier': 'secondary',
            }],
        )

        self.assertIn('[primary] Official store page', prompt)
        self.assertIn('[secondary] Neighbourhood coverage', prompt)
        self.assertIn(
            "never mirror\n  another publication's structure",
            prompt,
        )


if __name__ == '__main__':
    unittest.main()
