#!/usr/bin/env node

/**
 * Light-weight Site QA crawler for trendstoday.ca
 * - Crawls internal links up to a limit
 * - Checks <img> and <a> for HTTP errors
 * - Heuristically flags low-contrast Tailwind classes (text-gray-6/7/8)
 *
 * Uses native fetch (Node 18+) — no deps.
 */

 
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

const { URL } = require('url');

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const MAX_PAGES = Number(process.env.QA_MAX_PAGES || 40);
const TIMEOUT_MS = Number(process.env.QA_TIMEOUT_MS || 10000);
const START_PATHS = ['/'];

function normalizeUrl(href, base) {
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

function sameOrigin(u1, u2) {
  try {
    const a = new URL(u1);
    const b = new URL(u2);
    return a.origin === b.origin;
  } catch {
    return false;
  }
}

function extractLinksAndImages(html, pageUrl) {
  const links = new Set();
  const images = new Set();

  // Basic href extraction
  const hrefRe = /<a[^>]+href=["']([^"'#\s>]+)["']/gi;
  let m;
  while ((m = hrefRe.exec(html))) {
    const url = normalizeUrl(m[1], pageUrl);
    if (!url) continue;
    // Ignore mailto/tel and files (pdf, images, etc.)
    if (/^mailto:|^tel:/i.test(url)) continue;
    if (/\.(pdf|jpg|jpeg|png|gif|svg|webp|mp4|zip)(\?.*)?$/i.test(url)) continue;
    if (sameOrigin(url, BASE_URL)) links.add(url);
  }

  // Basic img src extraction
  const imgRe = /<img[^>]+src=["']([^"'\s>]+)["']/gi;
  while ((m = imgRe.exec(html))) {
    const url = normalizeUrl(m[1], pageUrl);
    if (!url) continue;
    images.add(url);
  }

  // Heuristic: Tailwind low-contrast classes
  const lowContrastMatches = html.match(/text-gray-(600|700|800)/g) || [];

  return { links: Array.from(links), images: Array.from(images), lowContrastCount: lowContrastMatches.length };
}

async function headOrGet(url) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    let res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: ctrl.signal });
    if (res.status === 405 || res.status === 501) {
      res = await fetch(url, { method: 'GET', redirect: 'follow', signal: ctrl.signal });
    }
    return { ok: res.ok, status: res.status };
  } catch (e) {
    return { ok: false, status: 0, error: e.message };
  } finally {
    clearTimeout(id);
  }
}

async function crawl() {
  const queue = START_PATHS.map(p => normalizeUrl(p, BASE_URL));
  const seen = new Set();
  const brokenImages = [];
  const brokenLinks = [];
  const contrastFlags = [];

  while (queue.length && seen.size < MAX_PAGES) {
    const pageUrl = queue.shift();
    if (!pageUrl || seen.has(pageUrl)) continue;
    seen.add(pageUrl);

    console.log(`→ Fetch ${pageUrl}`);
    let html = '';
    try {
      const res = await fetch(pageUrl, { redirect: 'follow' });
      html = await res.text();
    } catch (e) {
      console.warn(`  ! Failed to fetch page: ${e.message}`);
      continue;
    }

    const { links, images, lowContrastCount } = extractLinksAndImages(html, pageUrl);
    if (lowContrastCount > 0) contrastFlags.push({ page: pageUrl, count: lowContrastCount });

    // enqueue internal links
    for (const l of links) {
      if (!seen.has(l) && queue.length + seen.size < MAX_PAGES && sameOrigin(l, BASE_URL)) queue.push(l);
    }

    // check images
    await Promise.all(images.map(async (img) => {
      const r = await headOrGet(img);
      if (!r.ok) brokenImages.push({ page: pageUrl, src: img, status: r.status, error: r.error });
    }));

    // sample a few links for HTTP status
    const sample = links.slice(0, 10);
    await Promise.all(sample.map(async (l) => {
      const r = await headOrGet(l);
      if (!r.ok) brokenLinks.push({ from: pageUrl, to: l, status: r.status, error: r.error });
    }));
  }

  return { scanned: Array.from(seen), brokenImages, brokenLinks, contrastFlags };
}

async function main() {
  const start = Date.now();
  console.log(`QA crawl starting at ${BASE_URL} (max ${MAX_PAGES} pages)`);
  const result = await crawl();
  const secs = ((Date.now() - start) / 1000).toFixed(1);

  const summary = {
    pagesScanned: result.scanned.length,
    brokenImages: result.brokenImages.length,
    brokenLinks: result.brokenLinks.length,
    lowContrastPages: result.contrastFlags.length,
    durationSeconds: Number(secs)
  };

  console.log('\nSummary:', summary);

  const out = {
    baseUrl: BASE_URL,
    ...summary,
    details: result
  };

  const fs = require('fs');
  const path = require('path');
  const reportDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
  const outPath = path.join(reportDir, `site-qa-${Date.now()}.json`);
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(`\nSaved report → ${outPath}`);

  if (summary.brokenImages || summary.lowContrastPages) {
    console.log('\nRecommended next steps:');
    if (summary.brokenImages) console.log('- Replace bad image URLs or ensure files exist in /public');
    if (summary.lowContrastPages) console.log('- Replace text-gray-6/7/8 with text-gray-900 for readability');
  }
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}

module.exports = { main };

