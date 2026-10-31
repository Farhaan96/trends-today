import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';
const compiled = ts.transpileModule(
  readFileSync(
    new URL('../src/lib/cinematic-feed.ts', import.meta.url),
    'utf8'
  ),
  { compilerOptions: { module: ts.ModuleKind.ESNext } }
).outputText;
const {
  activeEvents,
  filterStories,
  editorialPoster,
  rankedStoryCities,
  splitCityFilters,
  splitFeaturedStories,
  storyCity,
} = await import(
  'data:text/javascript;base64,' + Buffer.from(compiled).toString('base64')
);
const now = '2026-09-05T20:00:00Z';
const sample = [
  {
    href: '/things-to-do/surrey-crave-halal-fest-september-2026',
    category: 'things-to-do',
    title: 'Crave Halal Fest',
    locality: 'Surrey',
    eventEndDate: '2026-09-06T23:59:00-07:00',
  },
  {
    href: '/things-to-do/old',
    category: 'things-to-do',
    title: 'Past festival',
    locality: 'Burnaby',
    eventEndDate: '2026-09-04T20:00:00Z',
  },
  {
    href: '/transit/work',
    category: 'transit',
    title: 'Road work',
    locality: 'Surrey',
    eventEndDate: '2026-09-07T20:00:00Z',
  },
  {
    href: '/things-to-do/unknown',
    category: 'things-to-do',
    title: 'Unknown date',
    eventEndDate: 'invalid',
  },
];
test('only known, unexpired events enter the gallery', () =>
  assert.deepEqual(
    activeEvents(sample, now).map((s) => s.href),
    [sample[0].href]
  ));
test('an event retires after its Pacific end time', () =>
  assert.equal(activeEvents(sample, '2026-09-07T07:00:00Z').length, 0));
test('search and locality combine without losing original ordering', () =>
  assert.deepEqual(
    filterStories(sample, 'Surrey', '  HALAL ').map((s) => s.href),
    [sample[0].href]
  ));
test('empty searches and reset preserve every story', () =>
  assert.deepEqual(filterStories(sample, 'All cities', ''), sample));
test('no stale event poster is reused for a different edition', () => {
  assert.equal(editorialPoster(sample[0]), '/images/design/poster-crave.webp');
  assert.equal(
    editorialPoster({
      ...sample[0],
      href: '/things-to-do/surrey-crave-halal-fest-september-2027',
    }),
    undefined
  );
});
test('explicit city wins over locality with safe regional fallback', () => {
  assert.equal(storyCity({ ...sample[0], city: 'Langley' }), 'Langley');
  assert.equal(storyCity(sample[3]), 'Regional');
});
test('cities rank by story count with stable alphabetical ties', () => {
  assert.deepEqual(
    rankedStoryCities([
      ...sample,
      { ...sample[0], href: '/things-to-do/surrey-second' },
      { ...sample[1], href: '/things-to-do/burnaby-second' },
      { ...sample[3], href: '/things-to-do/regional-second' },
    ]),
    ['Surrey', 'Burnaby']
  );
});
test('the collapsed city row keeps the busiest cities', () => {
  assert.deepEqual(splitCityFilters(sample, 'All cities', 1), {
    visible: ['Surrey'],
    extra: ['Burnaby'],
  });
});
test('a selected city stays in the row even when it is in the hidden tail', () => {
  assert.deepEqual(splitCityFilters(sample, 'Burnaby', 1), {
    visible: ['Surrey', 'Burnaby'],
    extra: [],
  });
  assert.deepEqual(splitCityFilters(sample, 'Nanaimo', 1), {
    visible: ['Surrey'],
    extra: ['Burnaby'],
  });
});
test('the lead block and the grid never show the same story twice', () => {
  const split = splitFeaturedStories(sample, 1);
  assert.equal(split.lead, sample[0]);
  assert.deepEqual(split.secondaries, [sample[1], sample[2], sample[3]]);
  assert.deepEqual(split.grid, []);
  assert.equal(split.hasMore, false);
  const wide = splitFeaturedStories([...sample, ...sample], 2);
  assert.deepEqual(
    wide.grid,
    [sample[0], sample[1]],
    'the grid resumes after the featured stories'
  );
  assert.equal(wide.hasMore, true);
});
test('an empty result set yields no lead and nothing more to load', () => {
  assert.deepEqual(splitFeaturedStories([], 9), {
    lead: undefined,
    secondaries: [],
    grid: [],
    hasMore: false,
  });
});
