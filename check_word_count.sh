#!/bin/bash

# Find all MDX files in content directories
files=$(find . -path "./content/*" -name "*.mdx" -o -path "./src/content/*" -name "*.mdx" -o -path "./apps/web/content/*" -name "*.mdx")

echo "Word count analysis for articles:"
echo "=================================="

for file in $files; do
    # Skip frontmatter lines between --- markers and count words
    word_count=$(awk '/^---$/{f=!f;next} !f' "$file" | wc -w)
    echo "$word_count words: $file"
done | sort -nr