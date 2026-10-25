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
  articleLastmod,
  canonicalArticleUrl,
  isNoindexFrontmatter,
  needsSourceRefresh,
  selectNewsArticles,
} = require('../src/lib/article-policy.js');
const { buildNewsSitemap } = require('../src/lib/news-sitemap.js');
const { getSitemapArticles } = require('../scripts/sitemap-articles.js');
const contentDir = path.resolve('content');

function instant(value) {
  const parsed = value instanceof Date ? value.getTime() : Date.parse(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function expectedLastmod(data) {
  return instant(data.updatedAt) ?? instant(data.publishedAt);
}

function sitemapEntries() {
  const sitemap = fs.readFileSync('public/sitemap.xml', 'utf8');
  const blocks = [...sitemap.matchAll(/<url>(.*?)<\/url>/gs)];
  return {
    sitemap,
    entries: blocks.map(([, block]) => ({
      loc: block.match(/<loc>([^<]*)<\/loc>/)?.[1] || '',
      lastmod: block.match(/<lastmod>([^<]*)<\/lastmod>/)?.[1],
    })),
  };
}

function independentlyClassifiedArticles() {
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
        data.archiveReviewStatus === 'format-reviewed-needs-source-refresh' ||
        data.noindex === true ||
        data.index === false ||
        data.seo?.noindex === true ||
        robots?.index === false ||
        (typeof robots === 'string' && /noindex/i.test(robots));
      articles.push({
        category,
        slug: file.slice(0, -4),
        data,
        draft: Boolean(draft),
        noindex,
      });
    }
  }
  return articles;
}

function independentlyIndexablePublishedArticles() {
  return independentlyClassifiedArticles().filter(
    ({ draft, noindex }) => !draft && !noindex
  );
}

test('sitemap article entries exactly cover every published indexable article', () => {
  const inventory = independentlyClassifiedArticles();
  const expected = inventory.filter(({ draft, noindex }) => !draft && !noindex);
  const { sitemap, entries } = sitemapEntries();
  const locs = entries.map(({ loc }) => loc);
  assert.equal(locs.length, (sitemap.match(/<loc>/g) || []).length);
  assert.ok(locs.every((loc) => loc.trim()));
  const articleEntries = entries.filter(({ loc }) => {
    const [, category, slug, extra] = new URL(loc).pathname.split('/');
    return ARTICLE_CATEGORIES.includes(category) && slug && !extra;
  });
  const expectedUrls = new Set(
    expected.map(({ category, slug }) => canonicalArticleUrl(category, slug))
  );
  const actualUrls = new Set(articleEntries.map(({ loc }) => loc));
  const missing = [...expectedUrls].filter((url) => !actualUrls.has(url));
  const extra = [...actualUrls].filter((url) => !expectedUrls.has(url));
  const noindexUrls = new Set(
    inventory
      .filter(({ draft, noindex }) => !draft && noindex)
      .map(({ category, slug }) => canonicalArticleUrl(category, slug))
  );

  assert.equal(articleEntries.length, expected.length);
  assert.deepEqual(
    [...actualUrls].sort(),
    [...expectedUrls].sort(),
    `missing: ${missing.join(', ') || 'none'}; extra: ${extra.join(', ') || 'none'}`
  );
  assert.equal(
    [...actualUrls].filter((url) => noindexUrls.has(url)).length,
    0,
    'sitemap must not overlap published noindex articles'
  );
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
    const sourceInstant = expectedLastmod(article.data);
    if (sourceInstant === undefined) assert.equal(entry.lastmod, undefined);
    else assert.equal(Date.parse(entry.lastmod), sourceInstant);
  }
  for (const entry of entries.filter((entry) => !actualUrls.has(entry.loc))) {
    assert.equal(entry.lastmod, undefined, `${entry.loc} is not an article`);
  }
});

test('lastmod never uses the build clock or unsupported metadata fields', () => {
  const { entries } = sitemapEntries();
  const generatedSecond = Math.floor(
    fs.statSync('public/sitemap.xml').mtimeMs / 1000
  );
  const expected = independentlyIndexablePublishedArticles();
  const sourceCounts = new Map();
  for (const { data } of expected) {
    const value = expectedLastmod(data);
    if (value !== undefined)
      sourceCounts.set(value, (sourceCounts.get(value) || 0) + 1);
  }
  const sitemapCounts = new Map();
  for (const { lastmod } of entries) {
    if (!lastmod) continue;
    const value = Date.parse(lastmod);
    assert.notEqual(Math.floor(value / 1000), generatedSecond);
    sitemapCounts.set(value, (sitemapCounts.get(value) || 0) + 1);
  }
  for (const [value, count] of sitemapCounts) {
    if (count > 5) assert.equal(count, sourceCounts.get(value));
  }
  assert.equal(config.autoLastmod, false);
  assert.doesNotMatch(
    fs.readFileSync('next-sitemap.config.js', 'utf8'),
    /new Date\s*\(|Date\.now\s*\(/
  );
});

test('runtime code cannot import the build-only scanner', () => {
  const sourceFiles = ['src/app', 'src/lib'].flatMap((root) =>
    fs
      .readdirSync(root, { recursive: true })
      .filter((file) => /\.[cm]?[jt]sx?$/.test(file))
      .map((file) => path.join(root, file))
  );
  for (const file of sourceFiles) {
    assert.doesNotMatch(fs.readFileSync(file, 'utf8'), /sitemap-articles/);
  }
  const purePolicy = fs.readFileSync('src/lib/article-policy.js', 'utf8');
  assert.doesNotMatch(
    purePolicy,
    /(?:from\s+|require\()['"](?:node:)?(?:fs|path)['"]|gray-matter|process\.cwd|readdirSync/
  );
  const articlePage = fs.readFileSync(
    'src/app/[category]/[slug]/page.tsx',
    'utf8'
  );
  assert.match(
    articlePage,
    /articleNeedsSourceRefresh\(article\.frontmatter\)/
  );
  assert.doesNotMatch(
    articlePage,
    /archiveReviewStatus\s*===\s*['"]format-reviewed-needs-source-refresh/
  );
});

test('archive transparency banner matches main inside its shared-rule gate', () => {
  const page = fs.readFileSync('src/app/[category]/[slug]/page.tsx', 'utf8');
  const gated = page.match(
    /\{needsSourceRefresh && \(\s*<aside className="article-archive-notice">([\s\S]*?)<\/aside>\s*\)\}/
  );
  assert.ok(gated, 'archive notice must remain gated by needsSourceRefresh');
  const paragraphs = [...gated[1].matchAll(/<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/g)];
  const banner = paragraphs.at(-1)?.[1].replace(/\s+/g, ' ').trim();
  assert.equal(
    banner,
    'This article received a July 2026 readability and source-display pass, but its underlying claims have not yet received a fresh source review. It is temporarily excluded from search indexing. Check the linked sources for current information.'
  );
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
  write('old', {
    title: 'Old',
    publishedAt: '2026-10-20T12:00:00Z',
    modifiedAt: '2026-10-25T12:00:00Z',
  });
  write('undated', { title: 'Undated' });
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
  const needsReview = {
    title: 'Needs source refresh',
    archiveReviewStatus: 'format-reviewed-needs-source-refresh',
    publishedAt: '2026-10-25T12:00:00Z',
  };
  const sourceRefreshed = {
    title: 'Source refreshed',
    archiveReviewStatus: 'source-refreshed',
    publishedAt: '2026-10-25T12:00:00Z',
  };
  write('needs-source-refresh', needsReview);
  write('source-refreshed', sourceRefreshed);

  assert.equal(needsSourceRefresh(needsReview), true);
  assert.equal(!isNoindexFrontmatter(needsReview), false);
  assert.equal(needsSourceRefresh(sourceRefreshed), false);
  assert.equal(!isNoindexFrontmatter(sourceRefreshed), true);

  const published = getSitemapArticles(root);
  assert.deepEqual(
    published.map(({ slug }) => slug),
    ['old', 'recent', 'source-refreshed', 'undated']
  );
  assert.equal(published[0].lastmod, '2026-10-20T12:00:00.000Z');
  assert.equal(published[1].lastmod, '2026-10-25T12:00:00.000Z');
  assert.equal(published[2].lastmod, '2026-10-25T12:00:00.000Z');
  assert.equal(published[3].lastmod, undefined);
  assert.deepEqual(
    selectNewsArticles(published, Date.parse('2026-10-26T00:00:00Z')).map(
      ({ slug }) => slug
    ),
    ['recent', 'source-refreshed']
  );

  const newsXml = buildNewsSitemap(
    [
      {
        category: 'science',
        slug: 'needs-source-refresh',
        title: needsReview.title,
        frontmatter: needsReview,
      },
      {
        category: 'science',
        slug: 'source-refreshed',
        title: sourceRefreshed.title,
        frontmatter: sourceRefreshed,
      },
    ],
    Date.parse('2026-10-26T00:00:00Z')
  );
  assert.doesNotMatch(newsXml, /\/needs-source-refresh<\/loc>/);
  assert.match(newsXml, /\/source-refreshed<\/loc>/);
});

test('needs-source-refresh matches only the exact archive status', () => {
  for (const archiveReviewStatus of [
    'needs-source-refresh',
    'format-reviewed-needs-source-refresh ',
    'FORMAT-REVIEWED-NEEDS-SOURCE-REFRESH',
    'format-reviewed',
    undefined,
    'source-refreshed',
  ]) {
    const data = { archiveReviewStatus };
    assert.equal(needsSourceRefresh(data), false);
    assert.equal(isNoindexFrontmatter(data), false);
  }
});

test('news sitemap URL set exactly covers recent indexable articles', () => {
  const now = Date.now();
  const cutoff = now - 2 * 24 * 60 * 60 * 1000;
  const inventory = independentlyClassifiedArticles();
  const expected = inventory.filter(({ data, draft, noindex }) => {
    const published = instant(data.publishedAt);
    return (
      !draft &&
      !noindex &&
      published !== undefined &&
      published >= cutoff &&
      published <= now
    );
  });
  const xml = buildNewsSitemap(
    inventory.map(({ category, slug, data }) => ({
      category,
      slug,
      title: data.title,
      frontmatter: data,
    })),
    now
  );
  const expectedUrls = new Set(
    expected.map(({ category, slug }) => canonicalArticleUrl(category, slug))
  );
  const actualUrls = new Set(
    [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => loc)
  );
  const noindexUrls = new Set(
    inventory
      .filter(({ draft, noindex }) => !draft && noindex)
      .map(({ category, slug }) => canonicalArticleUrl(category, slug))
  );

  assert.deepEqual([...actualUrls].sort(), [...expectedUrls].sort());
  assert.equal(
    [...actualUrls].filter((url) => noindexUrls.has(url)).length,
    0,
    'news sitemap must not overlap published noindex articles'
  );
});

test('lastmod compares date offsets as instants', () => {
  assert.equal(
    Date.parse(articleLastmod({ publishedAt: '2026-07-24T06:45:00-07:00' })),
    Date.parse('2026-07-24T13:45:00Z')
  );
  assert.equal(
    articleLastmod({
      publishedAt: '2026-07-24T06:45:00-07:00',
      modifiedAt: '2026-10-25T00:00:00Z',
      dateModified: '2026-10-25T00:00:00Z',
    }),
    '2026-07-24T13:45:00.000Z'
  );
});
