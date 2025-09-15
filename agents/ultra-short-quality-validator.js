#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

function parseFrontmatter(mdx) {
  const m = mdx.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const fm = {};
  if (!m) return fm;
  m[1].split(/\r?\n/).forEach(line => {
    const mm = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
    if (mm) fm[mm[1].trim()] = mm[2].trim().replace(/^['"]|['"]$/g, '');
  });
  return fm;
}

function validateArticle(file) {
  const full = path.resolve(file);
  const content = fs.readFileSync(full, 'utf8');
  const fm = parseFrontmatter(content);

  const body = content.replace(/^---[\s\S]*?---/, '').trim();
  const words = body.split(/\s+/).filter(Boolean).length;
  const h2s = (body.match(/^##\s+/gm) || []).length;
  const imagePath = fm.image || '';
  const imageExists = imagePath && fs.existsSync(path.join(process.cwd(), 'public', imagePath.replace(/^\//, '')));

  const checks = [
    { key: 'wordCount', pass: words >= 400 && words <= 900, info: `${words} words` },
    { key: 'h2Count', pass: h2s >= 2 && h2s <= 6, info: `${h2s} H2 sections` },
    { key: 'image', pass: !!imagePath, info: imagePath || 'missing' },
    { key: 'imageFile', pass: imageExists, info: imageExists ? 'exists' : 'missing' },
  ];

  const ok = checks.every(c => c.pass);
  return { ok, checks };
}

async function main() {
  const file = process.argv[2] || 'content/science/anunnaki-sumerian-gods-mystery.mdx';
  if (!fs.existsSync(file)) {
    console.error(`File not found: ${file}`);
    process.exit(1);
  }
  const res = validateArticle(file);
  console.log('Quality Report:', res);
  process.exit(res.ok ? 0 : 1);
}

main().catch(e => { console.error(e); process.exit(1); });

