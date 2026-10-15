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
  assert.equal(/[—–]/.test(JSON.stringify(brief)), false);
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
  const brief = page.indexOf('<TodayBrief />');
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
