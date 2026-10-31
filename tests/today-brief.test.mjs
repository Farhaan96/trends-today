import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

const compiled = ts.transpileModule(
  readFileSync(new URL('../src/lib/today-brief.ts', import.meta.url), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.ESNext } }
).outputText;
const { buildTodayBrief, vancouverDateKey } = await import(
  'data:text/javascript;base64,' + Buffer.from(compiled).toString('base64')
);

const now = '2026-10-15T04:00:00Z';
const posts = [
  {
    href: '/transit/skytrain',
    title: 'SkyTrain overnight testing hours',
    category: 'transit',
    status: 'published',
    publishedAt: '2026-10-08T15:53:04Z',
  },
  {
    href: '/housing/surrey-targets',
    title: 'Surrey housing targets',
    category: 'housing',
    status: 'published',
    publishedAt: '2026-10-07T15:00:00Z',
  },
  {
    href: '/food-drink/ramen',
    title: 'Ramen Danbo opening',
    category: 'food-drink',
    status: 'published',
    publishedAt: '2026-10-06T15:00:00Z',
  },
  {
    href: '/local-news/draft-story',
    title: 'Unpublished council note',
    category: 'local-news',
    status: 'draft',
    publishedAt: '2026-10-14T20:00:00Z',
  },
  {
    href: '/health/old-national',
    title: 'National health item',
    category: 'health',
    status: 'published',
    publishedAt: '2026-10-12T15:00:00Z',
  },
];

test('Pacific calendar date is used for today', () => {
  assert.equal(vancouverDateKey(now), '2026-10-14');
});

test('a file dated today renders 3 to 5 live links and a dated heading', () => {
  const brief = buildTodayBrief({
    file: {
      date: '2026-10-14',
      items: [
        {
          label: 'Transit',
          text: 'Overnight SkyTrain testing',
          href: '/transit/skytrain',
        },
        {
          label: 'Housing',
          text: 'Surrey unit targets',
          href: '/housing/surrey-targets',
        },
        {
          label: 'Food',
          text: 'Ramen Danbo on Main Street',
          href: '/food-drink/ramen',
        },
        {
          label: 'News',
          text: 'Draft must not appear',
          href: '/local-news/draft-story',
        },
        { label: 'Roads', text: 'Missing story', href: '/transit/missing' },
      ],
    },
    posts,
    now,
  });
  assert.equal(brief.mode, 'today');
  assert.equal(brief.heading, 'Today in the Lower Mainland');
  assert.equal(brief.dateTime, '2026-10-14');
  assert.equal(brief.dateLabel, 'Wed Oct 14');
  assert.deepEqual(
    brief.items.map((item) => item.href),
    ['/transit/skytrain', '/housing/surrey-targets', '/food-drink/ramen']
  );
  assert.equal(/[\u2013\u2014]/.test(JSON.stringify(brief)), false);
});

test('curated mode excludes the hero and backfills to the same cap', () => {
  const curatedPosts = Array.from({ length: 6 }, (_, index) => ({
    href: `/local-news/curated-${index + 1}`,
    title: `Curated story ${index + 1}`,
    category: 'local-news',
    status: 'published',
    publishedAt: `2026-10-${String(14 - index).padStart(2, '0')}T15:00:00Z`,
  }));
  const file = {
    date: '2026-10-14',
    items: curatedPosts.map((post, index) => ({
      label: 'News',
      text: `Curated summary ${index + 1}`,
      href: post.href,
    })),
  };
  const original = buildTodayBrief({ file, posts: curatedPosts, now });
  const excluded = buildTodayBrief({
    file,
    posts: curatedPosts,
    now,
    excludeHrefs: [curatedPosts[0].href],
  });

  assert.equal(original.mode, 'today');
  assert.equal(excluded.mode, 'today');
  assert.equal(excluded.items.length, original.items.length);
  assert.equal(
    excluded.items.some((item) => item.href === curatedPosts[0].href),
    false
  );
  assert.equal(excluded.items.at(-1).href, curatedPosts[5].href);
});

test('latest mode excludes the hero and backfills to four items', () => {
  const latestPosts = Array.from({ length: 5 }, (_, index) => ({
    href: `/local-news/latest-${index + 1}`,
    title: `Latest story ${index + 1}`,
    category: 'local-news',
    status: 'published',
    publishedAt: `2026-10-${String(14 - index).padStart(2, '0')}T15:00:00Z`,
  }));
  const original = buildTodayBrief({ file: null, posts: latestPosts, now });
  const excluded = buildTodayBrief({
    file: null,
    posts: latestPosts,
    now,
    excludeHrefs: [latestPosts[0].href],
  });

  assert.equal(original.mode, 'latest');
  assert.equal(excluded.mode, 'latest');
  assert.equal(original.items.length, 4);
  assert.equal(excluded.items.length, original.items.length);
  assert.deepEqual(
    excluded.items.map((item) => item.href),
    latestPosts.slice(1).map((post) => post.href)
  );
});

test('a stale file falls back to dated live posts instead of today copy', () => {
  const brief = buildTodayBrief({
    file: {
      date: '2026-01-01',
      items: [
        {
          label: 'Weather',
          text: 'Invented sunshine',
          href: '/transit/skytrain',
        },
      ],
    },
    posts,
    now,
  });
  assert.equal(brief.mode, 'latest');
  assert.equal(brief.heading, 'Latest in the Lower Mainland');
  assert.equal(brief.dateTime, undefined);
  assert.equal(JSON.stringify(brief).includes('Invented sunshine'), false);
  assert.equal(JSON.stringify(brief).includes('Weather'), false);
  assert.equal(JSON.stringify(brief).includes('Today'), false);
  assert.equal(brief.items.length >= 3 && brief.items.length <= 5, true);
  assert.equal(
    brief.items.some((item) => item.href === '/local-news/draft-story'),
    false
  );
  assert.equal(
    brief.items.some((item) => item.href === '/health/old-national'),
    false
  );
  assert.ok(brief.items.every((item) => item.dateTime && item.dateLabel));
  assert.equal(brief.items[0].href, '/transit/skytrain');
  assert.equal(brief.items[0].dateLabel, 'Oct 8');
});

test('fallback order uses modifiedAt ahead of publishedAt', () => {
  const brief = buildTodayBrief({
    file: { date: '2026-01-01', items: [] },
    posts: [
      ...posts,
      {
        href: '/transit/older-revised',
        title: 'Revised road notice',
        category: 'transit',
        status: 'published',
        publishedAt: '2026-01-02T15:00:00Z',
        modifiedAt: '2026-10-14T13:58:00Z',
      },
    ],
    now,
  });
  assert.equal(brief.mode, 'latest');
  assert.equal(brief.items[0].href, '/transit/older-revised');
  assert.equal(brief.items[0].dateTime, '2026-10-14T13:58:00Z');
  assert.equal(brief.items[0].dateLabel, 'Oct 14');
});

test('updatedAt still outranks modifiedAt in the fallback', () => {
  const brief = buildTodayBrief({
    file: null,
    posts: [
      {
        href: '/transit/revised',
        title: 'Revised notice',
        category: 'transit',
        status: 'published',
        publishedAt: '2026-01-02T15:00:00Z',
        modifiedAt: '2026-10-10T13:58:00Z',
        updatedAt: '2026-10-14T13:58:00Z',
      },
      {
        href: '/housing/one',
        title: 'Housing one',
        category: 'housing',
        status: 'published',
        publishedAt: '2026-10-01T15:00:00Z',
      },
      {
        href: '/sports/two',
        title: 'Sports two',
        category: 'sports',
        status: 'published',
        publishedAt: '2026-09-01T15:00:00Z',
      },
    ],
    now,
  });
  assert.equal(brief.items[0].href, '/transit/revised');
  assert.equal(brief.items[0].dateTime, '2026-10-14T13:58:00Z');
});

test('the shipped file has no placeholder bullets', () => {
  const file = JSON.parse(
    readFileSync(new URL('../content/today.json', import.meta.url), 'utf8')
  );
  assert.deepEqual(file.items, []);
  const brief = buildTodayBrief({ file, posts, now });
  assert.equal(brief.mode, 'latest');
});

test('fallback labels match the section chips', () => {
  const brief = buildTodayBrief({
    file: null,
    posts: [
      {
        href: '/local-news/a',
        title: 'Civic note',
        category: 'local-news',
        status: 'published',
        publishedAt: '2026-10-10T15:00:00Z',
      },
      {
        href: '/things-to-do/b',
        title: 'Park walk',
        category: 'things-to-do',
        status: 'published',
        publishedAt: '2026-10-09T15:00:00Z',
      },
      {
        href: '/food-drink/c',
        title: 'Ramen',
        category: 'food-drink',
        status: 'published',
        publishedAt: '2026-10-08T15:00:00Z',
      },
    ],
    now,
  });
  assert.deepEqual(
    brief.items.map((item) => item.label),
    ['Local news', 'Things to do', 'Food & drink']
  );
});

test('category chips use the six live section routes', () => {
  const header = readFileSync(
    new URL('../src/components/editorial/EditorialHeader.tsx', import.meta.url),
    'utf8'
  );
  const chips = [
    ['Local news', '/local-news'],
    ['Things to do', '/things-to-do'],
    ['Food & drink', '/food-drink'],
    ['Transit', '/transit'],
    ['Housing', '/housing'],
    ['Sports', '/sports'],
  ];
  for (const [label, href] of chips) {
    assert.equal(header.includes(`name: '${label}'`), true);
    assert.equal(header.includes(`href: '${href}'`), true);
  }
});

test('the Today block renders after the homepage cover heading', () => {
  const page = readFileSync(
    new URL('../src/app/page.tsx', import.meta.url),
    'utf8'
  );
  const home = readFileSync(
    new URL('../src/components/editorial/CinematicHome.tsx', import.meta.url),
    'utf8'
  );
  const open = page.indexOf('<CinematicHome');
  const brief = page.indexOf('<TodayBrief brief={brief} />');
  const close = page.indexOf('</CinematicHome>');
  assert.ok(open !== -1 && brief > open && close > brief);
  const cover = home.indexOf('id="cover-heading"');
  const slot = home.indexOf('{children}');
  const nextSection = home.indexOf('travel-brief');
  assert.ok(cover !== -1 && slot > cover && nextSection > slot);
});

test('homepage metadata is limited to the existing canonical path', () => {
  const source = readFileSync(
    new URL('../src/app/page.tsx', import.meta.url),
    'utf8'
  );
  const metadata = source.slice(
    source.indexOf('export const metadata'),
    source.indexOf('export default')
  );
  assert.match(metadata, /canonical:\s*'\//);
  assert.equal(metadata.includes('title:'), false);
  assert.equal(metadata.includes('description:'), false);
});
