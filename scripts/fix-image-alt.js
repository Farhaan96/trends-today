#!/usr/bin/env node
/**
 * Add imageAlt to content frontmatter if missing, using the article title
 */
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, 'content');

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).flatMap(name => {
    const p = path.join(dir, name);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) return walk(p);
    if (name.endsWith('.mdx') || name.endsWith('.md')) return [p];
    return [];
  });
}

function main() {
  const files = walk(CONTENT_DIR);
  let changed = 0;
  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf8');
    const parsed = matter(raw);
    const data = parsed.data || {};
    if (data.image && !data.imageAlt && data.title) {
      data.imageAlt = `${data.title}`;
      const out = matter.stringify(parsed.content, data, { lineWidth: 120 });
      fs.writeFileSync(file, out, 'utf8');
      changed++;
      console.log(`Updated imageAlt: ${path.relative(CONTENT_DIR, file)}`);
    }
  }
  console.log(`Done. Updated ${changed} file(s).`);
}

main();

