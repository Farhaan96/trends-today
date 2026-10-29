#!/usr/bin/env node
// Ping IndexNow (Bing, Yandex, etc.) about changed article URLs.
// Usage: node scripts/indexnow-ping.mjs content/<category>/<slug>.mdx ...
// Never exits non-zero on IndexNow/network failures: warn only.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import matter from 'gray-matter';

const require = createRequire(import.meta.url);
const {
  ARTICLE_CATEGORIES,
  SITE_URL,
  canonicalArticleUrl,
  isNoindexFrontmatter,
  isPublishedFrontmatter,
} = require('../src/lib/article-policy.js');

const HOST = new URL(SITE_URL).host;
const KEY = process.env.INDEXNOW_KEY;
const ENDPOINT =
  process.env.INDEXNOW_ENDPOINT || 'https://api.indexnow.org/indexnow';
const WAIT_MS = Number(process.env.INDEXNOW_WAIT_MS || 10 * 60 * 1000);
const POLL_MS = Number(process.env.INDEXNOW_POLL_MS || 20 * 1000);
const DRY_RUN = process.env.INDEXNOW_DRY_RUN === '1';

function warn(message) {
  // GitHub Actions annotation; plain text elsewhere.
  console.log(`::warning::${message}`);
}

export function articleUrlForFile(file) {
  const match = /^content\/([^/]+)\/([^/]+)\.mdx$/.exec(
    file.split(path.sep).join('/')
  );
  if (!match) return null;
  const [, category, slug] = match;
  if (!ARTICLE_CATEGORIES.includes(category)) return null;
  if (/\.backup$/i.test(slug)) return null;
  if (!fs.existsSync(file)) return null;
  const { data } = matter(fs.readFileSync(file, 'utf-8'));
  if (!isPublishedFrontmatter(data) || isNoindexFrontmatter(data)) return null;
  return canonicalArticleUrl(category, slug);
}

async function status(url) {
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'manual',
      headers: { 'cache-control': 'no-cache' },
    });
    return res.status;
  } catch {
    return 0;
  }
}

async function waitUntilLive(urls) {
  const pending = new Set(urls);
  const live = [];
  const deadline = Date.now() + WAIT_MS;
  while (pending.size > 0) {
    for (const url of [...pending]) {
      const code = await status(url);
      if (code === 200) {
        console.log(`live (200): ${url}`);
        live.push(url);
        pending.delete(url);
      }
    }
    if (pending.size === 0 || Date.now() >= deadline) break;
    console.log(`waiting for ${pending.size} URL(s) to return 200...`);
    await new Promise((resolve) => setTimeout(resolve, POLL_MS));
  }
  for (const url of pending) warn(`not live after wait, skipping: ${url}`);
  return live;
}

async function main() {
  const files = process.argv.slice(2).filter(Boolean);
  const candidates = [...new Set(files.map(articleUrlForFile).filter(Boolean))];
  console.log(
    `changed files: ${files.length}; article URLs: ${candidates.length}`
  );
  if (candidates.length === 0) {
    console.log('No published article URLs changed; nothing to ping.');
    return;
  }
  if (!KEY) {
    warn('INDEXNOW_KEY is not set; skipping ping.');
    return;
  }

  const live = await waitUntilLive(candidates);
  if (live.length === 0) {
    warn('No changed article URL went live; skipping ping.');
    return;
  }

  const body = {
    host: HOST,
    key: KEY,
    keyLocation: `${SITE_URL}/${KEY}.txt`,
    urlList: [...live, `${SITE_URL}/sitemap.xml`],
  };
  console.log(`IndexNow payload:\n${JSON.stringify(body, null, 2)}`);
  if (DRY_RUN) {
    console.log('INDEXNOW_DRY_RUN=1; not sending.');
    return;
  }

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
    });
    const text = await res.text().catch(() => '');
    console.log(`IndexNow response: HTTP ${res.status} ${text}`.trim());
    if (!res.ok) warn(`IndexNow returned non-2xx: HTTP ${res.status}`);
  } catch (error) {
    warn(`IndexNow request failed: ${error.message}`);
  }
}

main().catch((error) => {
  warn(`indexnow-ping failed: ${error.message}`);
});
