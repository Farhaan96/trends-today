import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

const compiled = ts.transpileModule(
  readFileSync(new URL('../src/lib/rss.ts', import.meta.url), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.ESNext } }
).outputText;
const { buildRssFeed, canonicalPostUrl, selectRssItems } = await import(
  'data:text/javascript;base64,' + Buffer.from(compiled).toString('base64')
);

const live = (index, extra = {}) => ({
  title: `Story ${index}`,
  description: `Details ${index}`,
  category: 'transit',
  slug: `story-${index}`,
  status: 'published',
  publishedAt: `2026-10-${String(index).padStart(2, '0')}T15:00:00Z`,
  ...extra,
});

test('canonical links use the www.trendstoday.ca host', () => {
  assert.equal(
    canonicalPostUrl('local-news', 'delta-thanksgiving-hours-2026'),
    'https://www.trendstoday.ca/local-news/delta-thanksgiving-hours-2026'
  );
  assert.equal(
    canonicalPostUrl('food-drink', 'a&b').startsWith(
      'https://www.trendstoday.ca/'
    ),
    true
  );
});

test('feed keeps the newest 50 live posts and drops drafts', () => {
  const sources = [
    live(90, {
      slug: 'draft-story',
      status: 'draft',
      publishedAt: '2026-12-01T00:00:00Z',
    }),
    live(91, {
      slug: 'review-story',
      status: 'review',
      publishedAt: '2026-12-02T00:00:00Z',
    }),
    ...Array.from({ length: 55 }, (_, index) =>
      live(index + 1, {
        publishedAt: new Date(Date.UTC(2026, 0, index + 1, 15)).toISOString(),
      })
    ),
  ];
  const items = selectRssItems(sources);
  assert.equal(items.length, 50);
  assert.equal(items[0].link, 'https://www.trendstoday.ca/transit/story-55');
  assert.equal(items.at(-1).link, 'https://www.trendstoday.ca/transit/story-6');
  assert.equal(
    items.some((item) => item.link.includes('draft-story')),
    false
  );
  assert.equal(
    items.some((item) => item.link.includes('review-story')),
    false
  );
});

test('updatedAt and modifiedAt change order while pubDate stays the publish date', () => {
  const items = selectRssItems([
    live(3, { publishedAt: '2026-01-01T00:00:00Z' }),
    live(4, {
      publishedAt: '2026-02-01T00:00:00Z',
      modifiedAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-10-14T13:58:00Z',
    }),
    live(5, {
      publishedAt: '2026-03-01T00:00:00Z',
      modifiedAt: '2026-08-01T00:00:00Z',
    }),
  ]);
  assert.deepEqual(
    items.map((item) => item.link),
    [
      'https://www.trendstoday.ca/transit/story-4',
      'https://www.trendstoday.ca/transit/story-5',
      'https://www.trendstoday.ca/transit/story-3',
    ]
  );
  assert.equal(
    items[0].pubDate,
    new Date('2026-02-01T00:00:00Z').toUTCString()
  );
  assert.equal(
    items[1].pubDate,
    new Date('2026-03-01T00:00:00Z').toUTCString()
  );
  const xml = buildRssFeed([
    live(3, { publishedAt: '2026-01-01T00:00:00Z' }),
    live(5, {
      publishedAt: '2026-03-01T00:00:00Z',
      modifiedAt: '2026-10-14T13:58:00Z',
    }),
  ]);
  assert.match(
    xml,
    new RegExp(
      `<lastBuildDate>${new Date('2026-10-14T13:58:00Z').toUTCString()}</lastBuildDate>`
    )
  );
  assert.match(
    xml,
    new RegExp(
      `<pubDate>${new Date('2026-03-01T00:00:00Z').toUTCString()}</pubDate>`
    )
  );
  assert.equal(
    xml.includes(
      `<pubDate>${new Date('2026-10-14T13:58:00Z').toUTCString()}</pubDate>`
    ),
    false
  );
});

test('RSS 2.0 document includes title, link, pubDate, description, and category', () => {
  const xml = buildRssFeed([
    {
      title: 'SkyTrain & Expo',
      description: 'Hours <confirmed> for "riders"',
      category: 'transit',
      slug: 'skytrain',
      status: 'published',
      publishedAt: '2026-10-08T15:53:04Z',
    },
  ]);
  assert.match(
    xml,
    /<rss version="2.0" xmlns:atom="http:\/\/www.w3.org\/2005\/Atom">/
  );
  assert.match(
    xml,
    /<atom:link rel="self" href="https:\/\/www\.trendstoday\.ca\/rss\.xml" type="application\/rss\+xml" \/>/
  );
  assert.match(xml, /<title>SkyTrain &amp; Expo<\/title>/);
  assert.match(
    xml,
    /<link>https:\/\/www\.trendstoday\.ca\/transit\/skytrain<\/link>/
  );
  assert.match(
    xml,
    /<guid isPermaLink="true">https:\/\/www\.trendstoday\.ca\/transit\/skytrain<\/guid>/
  );
  assert.match(xml, /<link>https:\/\/www\.trendstoday\.ca<\/link>/);
  assert.match(xml, /<pubDate>.+<\/pubDate>/);
  assert.match(
    xml,
    /<description>Hours &lt;confirmed&gt; for &quot;riders&quot;<\/description>/
  );
  assert.match(xml, /<category>transit<\/category>/);
  assert.equal(xml.includes('https://trendstoday.ca/'), false);
  assert.equal(xml.includes('newsletter'), false);
});
