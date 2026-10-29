#!/usr/bin/env node
// Ping IndexNow (Bing and other IndexNow engines) about changed articles
// after a production deploy.
// Usage: node scripts/indexnow-ping.mjs content/<category>/<slug>.mdx ...
// Never exits non-zero: every failure is a warning only.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import matter from 'gray-matter';

const require = createRequire(import.meta.url);
const {
  ARTICLE_CATEGORIES,
  SITE_URL,
  articlePublishedAt,
  canonicalArticleUrl,
  isNoindexFrontmatter,
  isPublishedFrontmatter,
} = require('../src/lib/article-policy.js');

const HOST = new URL(SITE_URL).host; // www.trendstoday.ca
const KEY = process.env.INDEXNOW_KEY || '';
const KEY_LOCATION = `${SITE_URL}/${KEY}.txt`;
const ENDPOINT =
  process.env.INDEXNOW_ENDPOINT || 'https://api.indexnow.org/indexnow';
const WAIT_MS = Number(process.env.INDEXNOW_WAIT_MS || 10 * 60 * 1000);
const POLL_MS = Number(process.env.INDEXNOW_POLL_MS || 20 * 1000);
const DRY_RUN = process.env.INDEXNOW_DRY_RUN === '1';

function warn(message) {
  console.log(`::warning::${message}`);
}

// Same rules the site uses: /<category>/<slug>, published, not noindex,
// publishedAt present and not in the future.
export function articleUrlForFile(file, now = Date.now()) {
  const match = /^content\/([^/]+)\/([^/]+)\.mdx$/.exec(file);
  if (!match) return null;
  const [, category, slug] = match;
  if (!ARTICLE_CATEGORIES.includes(category)) return null;
  if (/\.backup$/i.test(slug)) return null;
  if (!fs.existsSync(file)) return null;
  const { data } = matter(fs.readFileSync(file, 'utf-8'));
  if (!isPublishedFrontmatter(data)) return skip(file, 'not published');
  if (isNoindexFrontmatter(data)) return skip(file, 'noindex');
  const publishedAt = Date.parse(articlePublishedAt(data));
  if (!Number.isFinite(publishedAt)) return skip(file, 'no publishedAt');
  if (publishedAt > now) return skip(file, 'publishedAt in the future');
  return canonicalArticleUrl(category, slug);
}

function skip(file, reason) {
  console.log(`skip ${file}: ${reason}`);
  return null;
}

function isWwwUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.host === HOST;
  } catch {
    return false;
  }
}

async function get(url) {
  try {
    const res = await fetch(url, {
      redirect: 'manual',
      headers: { 'cache-control': 'no-cache' },
    });
    return { status: res.status, headers: res.headers, text: await res.text() };
  } catch {
    return { status: 0, headers: new Headers(), text: '' };
  }
}

function servedNoindex({ headers, text }) {
  if (/noindex/i.test(headers.get('x-robots-tag') || '')) return true;
  const metas = text.match(/<meta[^>]+name=["']robots["'][^>]*>/gi) || [];
  return metas.some((tag) => /noindex/i.test(tag));
}

async function waitUntilLive(urls) {
  const pending = new Set(urls);
  const live = [];
  const deadline = Date.now() + WAIT_MS;
  while (pending.size > 0) {
    for (const url of [...pending]) {
      const res = await get(url);
      if (res.status !== 200) continue;
      pending.delete(url);
      if (servedNoindex(res)) {
        console.log(`skip ${url}: served as noindex`);
      } else {
        console.log(`live (200): ${url}`);
        live.push(url);
      }
    }
    if (pending.size === 0 || Date.now() >= deadline) break;
    console.log(`waiting for ${pending.size} URL(s) to return 200...`);
    await new Promise((resolve) => setTimeout(resolve, POLL_MS));
  }
  for (const url of pending) warn(`not 200 after wait, skipping: ${url}`);
  return live;
}

async function main() {
  const files = process.argv.slice(2).filter(Boolean);
  const candidates = [
    ...new Set(files.map((file) => articleUrlForFile(file)).filter(Boolean)),
  ].filter(isWwwUrl);
  console.log(
    `changed files: ${files.length}; candidate article URLs: ${candidates.length}`
  );
  if (candidates.length === 0) {
    console.log('No eligible article URLs changed; nothing to ping.');
    return;
  }
  if (!/^[0-9a-f]{32}$/.test(KEY)) {
    warn('INDEXNOW_KEY missing or malformed; skipping ping.');
    return;
  }

  const live = await waitUntilLive(candidates);
  if (live.length === 0) {
    warn('No changed article URL is live and indexable; skipping ping.');
    return;
  }

  const keyFile = await get(KEY_LOCATION);
  if (keyFile.status !== 200 || keyFile.text.trim() !== KEY) {
    warn(
      `Key file ${KEY_LOCATION} not served or mismatched (HTTP ${keyFile.status}); skipping ping.`
    );
    return;
  }

  const body = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: live,
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
    console.log(`IndexNow response: ${res.status}`);
    if (res.status !== 200 && res.status !== 202) {
      const text = await res.text().catch(() => '');
      warn(`IndexNow did not accept the ping: ${res.status} ${text}`.trim());
    }
  } catch (error) {
    console.log('IndexNow response: request failed');
    warn(`IndexNow request failed: ${error.message}`);
  }
}

main().catch((error) => {
  warn(`indexnow-ping failed: ${error.message}`);
});
