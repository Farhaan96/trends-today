import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';
const illustrationCompiled = ts.transpileModule(
  readFileSync(
    new URL('../src/lib/illustration-caption.ts', import.meta.url),
    'utf8'
  ),
  { compilerOptions: { module: ts.ModuleKind.ESNext } }
).outputText;
const illustrationUrl =
  'data:text/javascript;base64,' +
  Buffer.from(illustrationCompiled).toString('base64');
let compiled = ts.transpileModule(
  readFileSync(
    new URL('../src/lib/cinematic-feed.ts', import.meta.url),
    'utf8'
  ),
  { compilerOptions: { module: ts.ModuleKind.ESNext } }
).outputText;
compiled = compiled.replace(
  /(['"])\.\/illustration-caption\1/,
  JSON.stringify(illustrationUrl)
);
const {
  activeEvents,
  filterStories,
  editorialPoster,
  homepageImage,
  planHomepage,
  pickTravelStories,
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
    extra: ['Burnaby', 'Regional'],
  });
});
test('the regional bucket stays reachable behind the More toggle', () => {
  const withoutRegional = sample.filter((story) => story !== sample[3]);
  assert.deepEqual(splitCityFilters(withoutRegional, 'All cities', 1), {
    visible: ['Surrey'],
    extra: ['Burnaby'],
  });
  assert.deepEqual(splitCityFilters(sample, 'Regional', 1), {
    visible: ['Surrey', 'Regional'],
    extra: ['Burnaby'],
  });
});
test('the default city row contains exactly the top six cities', () => {
  const cities = [
    'Vancouver',
    'Surrey',
    'Burnaby',
    'Richmond',
    'Coquitlam',
    'Delta',
    'Langley',
    'New Westminster',
  ].map((locality, index) => ({
    href: `/local-news/city-${index}`,
    category: 'local-news',
    title: locality,
    locality,
  }));
  const split = splitCityFilters(cities, 'All cities');
  assert.equal(split.visible.length, 6);
  assert.deepEqual(split.visible, [
    'Burnaby',
    'Coquitlam',
    'Delta',
    'Langley',
    'New Westminster',
    'Richmond',
  ]);
  assert.deepEqual(split.extra, ['Surrey', 'Vancouver']);
});
test('a selected city stays in the row even when it is in the hidden tail', () => {
  assert.deepEqual(splitCityFilters(sample, 'Burnaby', 1), {
    visible: ['Surrey', 'Burnaby'],
    extra: ['Regional'],
  });
  assert.deepEqual(splitCityFilters(sample, 'Nanaimo', 1), {
    visible: ['Surrey'],
    extra: ['Burnaby', 'Regional'],
  });
});
test('the lead block and the grid never show the same story twice', () => {
  const split = splitFeaturedStories(sample, 1);
  assert.equal(split.lead, sample[0]);
  assert.deepEqual(split.secondaries, [sample[1], sample[2], sample[3]]);
  assert.deepEqual(split.grid, []);
  assert.equal(split.hasMore, false);
  const additional = [
    { ...sample[0], href: '/things-to-do/fifth', title: 'Fifth' },
    { ...sample[0], href: '/things-to-do/sixth', title: 'Sixth' },
  ];
  const wide = splitFeaturedStories([...sample, ...additional], 2);
  assert.deepEqual(wide.grid, additional);
  assert.equal(wide.hasMore, false);
});
test('featured exclusions do not remove stories from the grid', () => {
  const split = splitFeaturedStories(sample, 2, new Set([sample[0].href]));
  assert.equal(split.lead, sample[1]);
  assert.deepEqual(split.secondaries, [sample[2], sample[3]]);
  assert.deepEqual(split.grid, [sample[0]]);
});
test('an empty result set yields no lead and nothing more to load', () => {
  assert.deepEqual(splitFeaturedStories([], 9), {
    lead: undefined,
    secondaries: [],
    grid: [],
    hasMore: false,
  });
});

test('homepage image policy hides generated news art', () => {
  assert.deepEqual(
    homepageImage({
      category: 'local-news',
      image: '/generated-news.jpg',
      imageAttribution: 'AI generated illustration for Trends Today',
    }),
    { src: undefined, illustration: false, fit: 'cover' }
  );
});

test('homepage image policy labels generated things to do art', () => {
  assert.deepEqual(
    homepageImage({
      category: 'things-to-do',
      image: '/generated-event.jpg',
      imageAttribution: 'Generated editorial image for Trends Today',
    }),
    { src: '/generated-event.jpg', illustration: true, fit: 'cover' }
  );
});

test('homepage image policy labels generated evergreen art', () => {
  assert.deepEqual(
    homepageImage({
      category: 'local-news',
      image: '/generated-guide.jpg',
      imageAttribution: 'Generative image for Trends Today',
      storyType: 'evergreen-planner',
    }),
    { src: '/generated-guide.jpg', illustration: true, fit: 'cover' }
  );
});

test('official maps stay real images when attribution says generated', () => {
  assert.deepEqual(
    homepageImage({
      category: 'transit',
      image: '/official-map.jpg',
      imageAttribution: 'Generated from an official city map',
      imageSourceType: 'official-map',
    }),
    { src: '/official-map.jpg', illustration: false, fit: 'contain' }
  );
});

test('homepage image policy returns no source when there is no image', () => {
  assert.deepEqual(homepageImage({ category: 'local-news' }), {
    src: undefined,
    illustration: false,
    fit: 'cover',
  });
});

test('official maps, data cards and logos are never cropped', () => {
  for (const imageSourceType of [
    'official-map',
    'Official-Source',
    'data-card',
    'official-logo',
  ]) {
    assert.equal(
      homepageImage({
        category: 'local-news',
        image: '/official.jpg',
        imageSourceType,
      }).fit,
      'contain',
      `${imageSourceType} must be shown whole`
    );
  }
});

test('photographs and labelled illustrations keep filling their box', () => {
  for (const imageSourceType of [
    'official-photo',
    'licensed-photo',
    'generated',
    undefined,
  ]) {
    assert.equal(
      homepageImage({
        category: 'things-to-do',
        image: '/photo.jpg',
        imageSourceType,
      }).fit,
      'cover',
      `${imageSourceType} may be cropped to its box`
    );
  }
});

test('travel stories skip exclusions and fall through in source order', () => {
  const travel = [
    { href: '/transit/one', category: 'transit', title: 'One' },
    { href: '/local-news/not-travel', category: 'local-news', title: 'News' },
    { href: '/transit/two', category: 'transit', title: 'Two' },
    { href: '/transit/three', category: 'transit', title: 'Three' },
  ];
  assert.deepEqual(
    pickTravelStories(travel, new Set(['/transit/one']), 2).map(
      (story) => story.href
    ),
    ['/transit/two', '/transit/three']
  );
});

test('travel stories return fewer when needed and never repeat', () => {
  const repeated = {
    href: '/transit/repeated',
    category: 'transit',
    title: 'Repeated',
  };
  assert.deepEqual(
    pickTravelStories(
      [repeated, repeated, { ...repeated }, sample[0]],
      new Set(),
      3
    ).map((story) => story.href),
    ['/transit/repeated']
  );
});

const homepageStories = [
  {
    href: '/local-news/hero',
    category: 'local-news',
    title: 'Claimed match hero',
    locality: 'Surrey',
  },
  {
    href: '/housing/latest-one',
    category: 'housing',
    title: 'Claimed match latest',
    locality: 'Surrey',
  },
  {
    href: '/food-drink/latest-two',
    category: 'food-drink',
    title: 'Latest two',
    locality: 'Vancouver',
  },
  {
    href: '/local-news/feature-one',
    category: 'local-news',
    title: 'Filtered match feature one',
    locality: 'Surrey',
  },
  {
    href: '/transit/feature-two',
    category: 'transit',
    title: 'Filtered match feature two',
    locality: 'Surrey',
  },
  {
    href: '/local-news/feature-three',
    category: 'local-news',
    title: 'Feature three',
    locality: 'Burnaby',
  },
  {
    href: '/local-news/feature-four',
    category: 'local-news',
    title: 'Feature four',
    locality: 'Burnaby',
  },
  {
    href: '/transit/travel-one',
    category: 'transit',
    title: 'Claimed match travel one',
    locality: 'Surrey',
  },
  {
    href: '/transit/travel-two',
    category: 'transit',
    title: 'Travel two',
    locality: 'Vancouver',
  },
  {
    href: '/things-to-do/event-one',
    category: 'things-to-do',
    title: 'Claimed match event',
    locality: 'Surrey',
    eventEndDate: '2026-09-10T23:59:00-07:00',
  },
  {
    href: '/things-to-do/event-two',
    category: 'things-to-do',
    title: 'Event two',
    locality: 'Vancouver',
    eventEndDate: '2026-09-10T23:59:00-07:00',
  },
  ...Array.from({ length: 4 }, (_, index) => ({
    href: `/local-news/grid-${index + 1}`,
    category: 'local-news',
    title: `Filtered match grid ${index + 1}`,
    locality: 'Surrey',
  })),
];

function homepagePlan(overrides = {}) {
  return planHomepage({
    stories: homepageStories,
    latestHrefs: ['/housing/latest-one', '/food-drink/latest-two'],
    now,
    city: 'All cities',
    query: '',
    count: 2,
    ...overrides,
  });
}

function storyHrefs(stories) {
  return stories.map((story) => story.href);
}

test('the default homepage plan claims each story exactly once', () => {
  const first = homepagePlan();
  const sections = [
    first.hero.href,
    ...first.latestHrefs,
    ...storyHrefs(first.travel),
    ...storyHrefs(first.events),
    first.featuredLead.href,
    ...storyHrefs(first.secondaryStories),
    ...storyHrefs(first.gridStories),
  ];
  assert.equal(new Set(sections).size, sections.length);
  assert.equal(
    first.gridStories.some((story) => first.shownAboveHrefs.has(story.href)),
    false
  );

  const loaded = homepagePlan({ count: 4 });
  const firstPage = storyHrefs(first.gridStories);
  const secondPage = storyHrefs(loaded.gridStories.slice(firstPage.length));
  assert.equal(new Set([...firstPage, ...secondPage]).size, 4);

  const complete = homepagePlan({ count: 100 });
  const completeSections = [
    complete.hero.href,
    ...complete.latestHrefs,
    ...storyHrefs(complete.travel),
    ...storyHrefs(complete.events),
    complete.featuredLead.href,
    ...storyHrefs(complete.secondaryStories),
    ...storyHrefs(complete.gridStories),
  ];
  assert.deepEqual(
    new Set(completeSections),
    new Set(storyHrefs(homepageStories))
  );
  assert.equal(completeSections.length, homepageStories.length);
});

test('city and query filters keep matching stories unique', () => {
  const filtered = homepagePlan({ city: 'Surrey', query: 'match', count: 9 });
  const matching = new Set(storyHrefs(filtered.results));
  const matchingSections = [
    filtered.hero,
    ...filtered.travel,
    ...filtered.events,
    filtered.featuredLead,
    ...filtered.secondaryStories,
    ...filtered.gridStories,
  ]
    .filter(Boolean)
    .map((story) => story.href)
    .filter((href) => matching.has(href));
  matchingSections.push(
    ...filtered.latestHrefs.filter((href) => matching.has(href))
  );

  assert.equal(new Set(matchingSections).size, matchingSections.length);
  assert.deepEqual(new Set(matchingSections), matching);
  assert.equal(filtered.allMatchingShownAbove, false);
  assert.equal(filtered.hasMore, false);
});

test('a filter fully claimed above returns the status flag', () => {
  const filtered = homepagePlan({
    city: 'Surrey',
    query: 'claimed',
    count: 9,
  });
  assert.equal(filtered.resultCount, 4);
  assert.equal(filtered.allMatchingShownAbove, true);
  assert.equal(filtered.featuredLead, undefined);
  assert.deepEqual(filtered.gridStories, []);
});
