import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import test from 'node:test';
import matter from 'gray-matter';

const require = createRequire(import.meta.url);
const config = require('../next-sitemap.config.js');
const {
  ARTICLE_CATEGORIES,
  canonicalArticleUrl,
  getSitemapArticles,
  selectNewsArticles,
} = require('../src/lib/article-policy.js');
const contentDir = path.resolve('content');

function independentlyPublishedArticles() {
  const articles = [];
  for (const category of ARTICLE_CATEGORIES) {
    const dir = path.join(contentDir, category);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.mdx') || /\.backup\.mdx$/i.test(file)) continue;
      const { data } = matter(fs.readFileSync(path.join(dir, file), 'utf8'));
      const status = String(data.status || '')
        .trim()
        .toLowerCase();
      const robots = data.robots ?? data.seo?.robots;
      const draft =
        data.draft === true ||
        (status && status !== 'published') ||
        /draft\s*\(do not merge\)/i.test(String(data.title || ''));
      const noindex =
        data.noindex === true ||
        data.index === false ||
        data.seo?.noindex === true ||
        robots?.index === false ||
        (typeof robots === 'string' && /noindex/i.test(robots));
      if (!draft && !noindex) {
        articles.push({
          category,
          slug: file.slice(0, -4),
          data,
        });
      }
    }
  }
  return articles;
}

test('sitemap article entries exactly cover every published indexable article', () => {
  const expected = independentlyPublishedArticles();
  const sitemap = fs.readFileSync('public/sitemap.xml', 'utf8');
  const locs = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map(
    ([, loc]) => loc
  );
  assert.equal(locs.length, (sitemap.match(/<loc>/g) || []).length);
  assert.ok(locs.every((loc) => loc.trim()));
  const entries = [
    ...sitemap.matchAll(/<url><loc>([^<]*)<\/loc><lastmod>([^<]*)/g),
  ].map(([, loc, lastmod]) => ({ loc, lastmod }));
  const articleEntries = entries.filter(({ loc }) => {
    const [, category, slug, extra] = new URL(loc).pathname.split('/');
    return ARTICLE_CATEGORIES.includes(category) && slug && !extra;
  });
  const expectedUrls = new Set(
    expected.map(({ category, slug }) => canonicalArticleUrl(category, slug))
  );
  const actualUrls = new Set(articleEntries.map(({ loc }) => loc));

  assert.equal(articleEntries.length, expected.length);
  assert.deepEqual(actualUrls, expectedUrls);
  for (const loc of locs) {
    assert.match(loc, /^https:\/\/www\.trendstoday\.ca(?:\/|$)/);
    assert.ok(
      !/(?:\/search|robots\.txt|rss\.xml|\/feed|\/assets?\/)/.test(loc)
    );
  }
  for (const entry of articleEntries) {
    assert.match(entry.loc, /^https:\/\/www\.trendstoday\.ca\/[^/]+\/[^/]+$/);
    const article = expected.find(
      ({ category, slug }) => canonicalArticleUrl(category, slug) === entry.loc
    );
    assert.ok(article);
    const expectedLastmod = new Date(
      article.data.updatedAt ||
        article.data.modifiedAt ||
        article.data.publishedAt ||
        article.data.datePublished
    ).toISOString();
    assert.equal(entry.lastmod, expectedLastmod);
  }
});

test('sitemap excludes non-pages and covers every supported news category', () => {
  for (const route of [
    '/search',
    '/robots.txt',
    '/rss.xml',
    '/feed',
    '/assets/*',
    '/images/*',
  ]) {
    assert.ok(config.exclude.includes(route), `${route} must be excluded`);
  }
  for (const category of [
    'science',
    'culture',
    'psychology',
    'technology',
    'tech',
    'health',
    'space',
    'money',
    'facts',
    'local-news',
  ]) {
    assert.ok(ARTICLE_CATEGORIES.includes(category));
  }
});

test('drafts and noindex fixtures never enter either sitemap', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tt-sitemap-'));
  const dir = path.join(root, 'science');
  fs.mkdirSync(dir, { recursive: true });
  const write = (slug, frontmatter) =>
    fs.writeFileSync(
      path.join(dir, `${slug}.mdx`),
      matter.stringify('Fixture body', frontmatter)
    );
  write('recent', {
    title: 'Recent',
    publishedAt: '2026-10-24T12:00:00Z',
    updatedAt: '2026-10-25T12:00:00Z',
  });
  write('old', { title: 'Old', publishedAt: '2026-10-20T12:00:00Z' });
  write('status-draft', {
    title: 'Status draft',
    status: 'draft',
    publishedAt: '2026-10-25T12:00:00Z',
  });
  write('draft-flag', {
    title: 'Draft flag',
    draft: true,
    publishedAt: '2026-10-25T12:00:00Z',
  });
  write('do-not-merge', {
    title: 'DRAFT (do not merge): fixture',
    publishedAt: '2026-10-25T12:00:00Z',
  });
  write('noindex', {
    title: 'Noindex',
    robots: { index: false },
    publishedAt: '2026-10-25T12:00:00Z',
  });

  const published = getSitemapArticles(root);
  assert.deepEqual(
    published.map(({ slug }) => slug),
    ['old', 'recent']
  );
  assert.equal(published[1].lastmod, '2026-10-25T12:00:00.000Z');
  assert.deepEqual(
    selectNewsArticles(published, Date.parse('2026-10-26T00:00:00Z')).map(
      ({ slug }) => slug
    ),
    ['recent']
  );
});
