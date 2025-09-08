#!/usr/bin/env node

// Auto-fix broken internal image paths in MDX frontmatter using latest QA report
 
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const CONTENT_DIR = path.join(process.cwd(), 'content');
const REPORTS_DIR = path.join(process.cwd(), 'reports');
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

function latestReportPath() {
  if (!fs.existsSync(REPORTS_DIR)) return null;
  const files = fs.readdirSync(REPORTS_DIR).filter(f => f.startsWith('site-qa-') && f.endsWith('.json'));
  if (!files.length) return null;
  files.sort();
  return path.join(REPORTS_DIR, files[files.length - 1]);
}

function toLocalPath(urlOrPath) {
  try {
    if (urlOrPath.startsWith('http')) {
      const u = new URL(urlOrPath);
      const base = new URL(SITE_URL);
      if (u.origin !== base.origin) return null; // external
      return decodeURIComponent(u.pathname);
    }
    return urlOrPath.startsWith('/') ? urlOrPath : `/${urlOrPath}`;
  } catch {
    return null;
  }
}

function fileExistsInPublic(p) {
  const loc = path.join(PUBLIC_DIR, p.replace(/^\//, ''));
  return fs.existsSync(loc);
}

function guessFallbackForSlug(slug) {
  const s = slug.toLowerCase();
  if (s.includes('iphone')) return '/images/products/iphone-15-pro-hero.jpg';
  if (s.includes('s24') || s.includes('samsung')) return '/images/products/samsung-galaxy-s24-hero.jpg';
  if (s.includes('pixel')) return '/images/products/google-pixel-8-pro-hero.jpg';
  if (s.includes('oneplus')) return '/images/products/oneplus-12-hero.jpg';
  if (s.includes('xiaomi')) return '/images/products/xiaomi-14-ultra-hero.jpg';
  return '/images/products/macbook-air-m3-hero.jpg';
}

function updateFrontmatterImage(fp, brokenSet) {
  const src = fs.readFileSync(fp, 'utf8');
  const parsed = matter(src);
  const fm = parsed.data || {};

  let changed = false;
  const slug = path.basename(fp, '.mdx');

  const checkAndFix = (val) => {
    if (!val) return val;
    const local = toLocalPath(val);
    if (!local) return val;
    if (!fileExistsInPublic(local) || brokenSet.has(local)) {
      const fallback = guessFallbackForSlug(slug);
      changed = true;
      return fallback;
    }
    return val;
  };

  // top-level image
  if (fm.image) fm.image = checkAndFix(fm.image);

  // images.featured
  if (fm.images && fm.images.featured) fm.images.featured = checkAndFix(fm.images.featured);

  // images.gallery
  if (fm.images && Array.isArray(fm.images.gallery)) {
    fm.images.gallery = fm.images.gallery.map(checkAndFix).filter(Boolean);
  }

  if (changed) {
    const out = matter.stringify(parsed.content, fm);
    fs.writeFileSync(fp, out);
  }
  return changed;
}

function main() {
  const reportPath = latestReportPath();
  if (!reportPath) {
    console.error('No QA report found in reports/. Run npm run qa:site first.');
    process.exit(1);
  }
  console.log('Using report:', reportPath);
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const brokenSet = new Set();
  (report.details?.brokenImages || []).forEach((b) => {
    const p = toLocalPath(b.src);
    if (p) brokenSet.add(p);
  });

  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir)) {
      const p = path.join(dir, entry);
      const st = fs.statSync(p);
      if (st.isDirectory()) walk(p);
      else if (p.endsWith('.mdx')) files.push(p);
    }
  };
  walk(CONTENT_DIR);

  let changedCount = 0;
  for (const f of files) {
    const changed = updateFrontmatterImage(f, brokenSet);
    if (changed) {
      changedCount++;
      console.log('Fixed:', path.relative(process.cwd(), f));
    }
  }

  console.log(`\nFinished. Updated ${changedCount} MDX file(s).`);
}

if (require.main === module) {
  main();
}

module.exports = { main };

