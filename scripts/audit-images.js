#!/usr/bin/env node
/**
 * Audit content images for validity and metadata
 * - Verifies referenced image files exist in /public
 * - Flags tiny files (<5KB) or text/HTML masquerading as images
 * - Checks optional frontmatter: imageAlt, imageCredit{name,url}, imageLicense, imageIsConcept
 */
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, 'content');
const PUBLIC_DIR = path.join(ROOT, 'public');

function isTextLike(buf) {
  const str = buf.toString('utf8', 0, Math.min(200, buf.length)).trim();
  return /^<(!doctype|html)|^#\s*placeholder/i.test(str);
}

function checkImage(relPath) {
  const result = { path: relPath, exists: false, ok: false, reason: '' };
  if (!relPath || typeof relPath !== 'string') {
    result.reason = 'No image path';
    return result;
  }
  // normalize leading slash
  const p = relPath.startsWith('/') ? relPath.slice(1) : relPath;
  const abs = path.join(PUBLIC_DIR, p);
  result.exists = fs.existsSync(abs);
  if (!result.exists) {
    result.reason = 'Missing file in /public';
    return result;
  }
  try {
    const buf = fs.readFileSync(abs);
    if (buf.length < 5 * 1024) {
      result.reason = `Too small (${buf.length} bytes)`;
      return result;
    }
    if (isTextLike(buf)) {
      result.reason = 'Text/HTML placeholder instead of image';
      return result;
    }
    result.ok = true;
    return result;
  } catch (e) {
    result.reason = 'Read error';
    return result;
  }
}

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
  const issues = [];
  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf8');
    const { data } = matter(raw);
    const rel = path.relative(CONTENT_DIR, file).replace(/\\/g, '/');
    const imgCheck = checkImage(data.image);
    const missingMeta = [];
    if (!data.imageAlt) missingMeta.push('imageAlt');
    if (!data.imageCredit || (!data.imageCredit.name && !data.imageCredit.url)) missingMeta.push('imageCredit');
    if (!data.imageLicense) missingMeta.push('imageLicense');
    // For news, prefer explicit concept labeling when product is unreleased
    if (rel.startsWith('news/') && typeof data.imageIsConcept === 'undefined') missingMeta.push('imageIsConcept');

    if (!imgCheck.ok || missingMeta.length) {
      issues.push({ file: rel, image: imgCheck, missingMeta });
    }
  }

  if (!issues.length) {
    console.log('✅ All images look good with required metadata.');
    return;
  }
  console.log('⚠️  Image audit found issues:\n');
  for (const it of issues) {
    console.log(`- ${it.file}`);
    if (it.image && !it.image.ok) {
      console.log(`  • image: ${it.image.path} — ${it.image.reason}`);
    }
    if (it.missingMeta && it.missingMeta.length) {
      console.log(`  • missing meta: ${it.missingMeta.join(', ')}`);
    }
  }
  process.exitCode = 1;
}

main();

