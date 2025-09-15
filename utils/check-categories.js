#!/usr/bin/env node
/*
  Scans all content articles and checks that:
  - Front matter `category` exists
  - `category` is one of the allowed categories
  - File lives under the matching category folder: content/<category>/...
  Outputs a JSON report and a human-readable summary.
*/

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const CONTENT_DIR = path.join(process.cwd(), 'content');
const ALLOWED = new Set([
  'science',
  'culture',
  'psychology',
  'technology',
  'health',
  'space',
  'lifestyle',
]);

/** Recursively collect files by extension */
function walk(dir, exts, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(p, exts, out);
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (exts.includes(ext)) out.push(p);
    }
  }
  return out;
}

function rel(p) {
  return path.relative(process.cwd(), p).replace(/\\/g, '/');
}

function main() {
  if (!fs.existsSync(CONTENT_DIR)) {
    console.error('No content directory found:', CONTENT_DIR);
    process.exit(1);
  }

  const files = walk(CONTENT_DIR, ['.md', '.mdx']);
  const issues = [];
  const ok = [];

  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf8');
    let fm = {};
    try {
      fm = matter(raw).data || {};
    } catch (e) {
      issues.push({
        file: rel(file),
        type: 'frontmatter_parse_error',
        message: e.message,
      });
      continue;
    }

    const declared = (fm.category || fm.Category || fm.categories)
      ?.toString()
      .trim();
    const parts = rel(file).split('/');
    // Expect structure content/<folder>/<file>
    const folder =
      parts.length >= 3 && parts[0] === 'content' ? parts[1] : null;

    // Track ok if it passes all checks
    const record = { file: rel(file), folder, declared };

    if (!declared) {
      issues.push({
        ...record,
        type: 'missing_category',
        message: 'No category in front matter',
      });
      continue;
    }

    const declaredLower = declared.toLowerCase();
    if (!ALLOWED.has(declaredLower)) {
      issues.push({
        ...record,
        type: 'invalid_category',
        message: `Category "${declared}" is not in allowed set`,
      });
      continue;
    }

    if (!folder) {
      issues.push({
        ...record,
        type: 'unexpected_path',
        message: 'File path not under content/<category>/',
      });
      continue;
    }

    if (folder.toLowerCase() !== declaredLower) {
      issues.push({
        ...record,
        type: 'folder_mismatch',
        message: `Folder "${folder}" != front matter "${declared}"`,
      });
      continue;
    }

    ok.push(record);
  }

  const summary = {
    total: files.length,
    ok: ok.length,
    issues: issues.length,
    issueBreakdown: issues.reduce((acc, i) => {
      acc[i.type] = (acc[i.type] || 0) + 1;
      return acc;
    }, {}),
    timestamp: new Date().toISOString(),
  };

  const reportPath = path.join(process.cwd(), 'category-audit-report.json');
  fs.writeFileSync(
    reportPath,
    JSON.stringify({ summary, issues, ok }, null, 2)
  );

  // Human-readable output
  console.log('Category Audit Summary');
  console.log('—'.repeat(60));
  console.log(`Files scanned: ${summary.total}`);
  console.log(`OK: ${summary.ok}`);
  console.log(`Issues: ${summary.issues}`);
  console.log('Breakdown:', summary.issueBreakdown);
  if (issues.length) {
    console.log('\nExamples:');
    for (const i of issues.slice(0, 20)) {
      console.log(`- [${i.type}] ${i.file} :: ${i.message}`);
    }
    if (issues.length > 20) console.log(`... and ${issues.length - 20} more`);
  }

  console.log(`\nFull report written to ${rel(reportPath)}`);
}

if (require.main === module) {
  main();
}
