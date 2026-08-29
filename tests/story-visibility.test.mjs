import assert from 'node:assert/strict';
import test from 'node:test';

import {
  isStillOn,
  selectRelatedStories,
  selectCategoryFallbackStories,
  selectAuthorStories,
  isNoindexCategoryHub,
} from '../src/lib/story-visibility.mjs';

// Fixed clock: the Kimchi festival weekend (Aug 28, 2026, noon Pacific).
const NOW = new Date('2026-08-28T12:00:00-07:00');

const newsroomAuthor = { name: 'Trends Today Newsroom' };

function makeArticle({
  slug,
  category,
  title,
  locality,
  publishedAt,
  frontmatter = {},
}) {
  return {
    slug,
    category,
    title,
    publishedAt,
    author: newsroomAuthor,
    frontmatter: {
      title,
      category,
      locality,
      author: 'Trends Today Newsroom',
      publishedAt,
      ...frontmatter,
    },
  };
}

// Fixtures modeled on the live content set.
const kimchi = makeArticle({
  slug: 'kimchi-k-food-festival-coquitlam-august-2026',
  category: 'things-to-do',
  title: 'Kimchi and K-Food Festival returns to Coquitlam this weekend',
  locality: 'Coquitlam',
  publishedAt: '2026-08-28T08:00:00-07:00',
  frontmatter: {
    eventEndDate: '2026-08-29T23:59:00-07:00',
    tags: ['coquitlam', 'korean food', 'food festival', 'free events'],
  },
});

const vsoEnded = makeArticle({
  slug: 'free-vso-concert-burnaby-deer-lake-park',
  category: 'things-to-do',
  title: "Free VSO concert returns to Burnaby's Deer Lake Park",
  locality: 'Burnaby',
  publishedAt: '2026-07-17T16:45:00-07:00',
  frontmatter: { eventEnded: true, tags: ['free events'] },
});

const halalClosed = makeArticle({
  slug: 'bc-halal-food-fest-cloverdale-final-day',
  category: 'things-to-do',
  title: 'BC Halal Food Fest wraps Sunday in Cloverdale',
  locality: 'Surrey',
  publishedAt: '2026-07-26T08:15:00-07:00',
  frontmatter: {
    eventEndDate: '2026-07-26T23:59:00-07:00',
    tags: ['halal food', 'free events'],
  },
});

const parkEventsEnded = makeArticle({
  slug: 'free-burnaby-park-events-this-week',
  category: 'things-to-do',
  title: 'Free Burnaby park events to plan this week',
  locality: 'Burnaby',
  publishedAt: '2026-07-19T17:15:00-07:00',
  frontmatter: { eventEnded: true, tags: ['free events'] },
});

const dartsClosed = makeArticle({
  slug: 'darts-hill-scavenger-hunt-surrey',
  category: 'things-to-do',
  title: 'Free Darts Hill scavenger hunt runs Sunday in Surrey',
  locality: 'Surrey',
  publishedAt: '2026-07-26T08:40:00-07:00',
  frontmatter: {
    eventEndDate: '2026-07-26T23:59:00-07:00',
    tags: ['free events'],
  },
});

const farmTourStillOn = makeArticle({
  slug: 'burnaby-farm-tour-big-bend',
  category: 'things-to-do',
  title: 'Burnaby Farm Tour map runs through Sept. 7',
  locality: 'Burnaby',
  publishedAt: '2026-08-26T07:35:00-07:00',
  frontmatter: {
    eventEndDate: '2026-09-07T23:59:00-07:00',
    tags: ['free events', 'family activities'],
  },
});

const coquitlamStillOn = makeArticle({
  slug: 'coquitlam-clarke-glenayre-intersection-august-2026',
  category: 'transit',
  title: 'Clarke Road and Glenayre Drive intersection work, Coquitlam',
  locality: 'Coquitlam',
  publishedAt: '2026-08-27T12:10:00-07:00',
  frontmatter: { tags: ['coquitlam'] },
});

const treeSaleStillOn = makeArticle({
  slug: 'surrey-20-dollar-tree-sale-august-18',
  category: 'local-news',
  title: 'Surrey $20 tree sales open Aug. 18 and Sept. 29',
  locality: 'Surrey',
  publishedAt: '2026-07-30T12:45:00-07:00',
  frontmatter: {
    eventEndDate: '2026-10-25T23:59:00-07:00',
    tags: ['free events'],
  },
});

const ALL = [
  kimchi,
  vsoEnded,
  halalClosed,
  parkEventsEnded,
  dartsClosed,
  farmTourStillOn,
  coquitlamStillOn,
  treeSaleStillOn,
];

test('isStillOn: stories without a window stay on', () => {
  assert.equal(isStillOn({}, NOW), true);
  assert.equal(isStillOn(undefined, NOW), true);
});

test('isStillOn: future end dates stay on', () => {
  assert.equal(
    isStillOn({ eventEndDate: '2026-09-07T23:59:00-07:00' }, NOW),
    true
  );
});

test('isStillOn: end date on the current day stays on', () => {
  assert.equal(
    isStillOn({ eventEndDate: '2026-08-28T23:59:00-07:00' }, NOW),
    true
  );
});

test('isStillOn: past end dates are closed', () => {
  assert.equal(
    isStillOn({ eventEndDate: '2026-07-26T23:59:00-07:00' }, NOW),
    false
  );
});

test('isStillOn: eventEnded flag closes a story even without an end date', () => {
  assert.equal(isStillOn({ eventEnded: true }, NOW), false);
});

test('isStillOn: unparseable end dates do not hide a story', () => {
  assert.equal(isStillOn({ eventEndDate: 'not-a-date' }, NOW), true);
});

test('related rail for Kimchi excludes the closed July cards', () => {
  const picks = selectRelatedStories(kimchi, ALL, 3, NOW);
  const slugs = picks.map((a) => a.slug);
  assert.equal(
    slugs.includes('free-vso-concert-burnaby-deer-lake-park'),
    false
  );
  assert.equal(
    slugs.includes('bc-halal-food-fest-cloverdale-final-day'),
    false
  );
  assert.equal(slugs.includes('free-burnaby-park-events-this-week'), false);
  assert.equal(slugs.includes('darts-hill-scavenger-hunt-surrey'), false);
});

test('related rail never includes the current story and only still-on stories', () => {
  const picks = selectRelatedStories(kimchi, ALL, 3, NOW);
  assert.ok(picks.length > 0);
  for (const pick of picks) {
    assert.notEqual(pick.slug, kimchi.slug);
    assert.equal(isStillOn(pick.frontmatter, NOW), true);
  }
});

test('related rail prefers same city over an otherwise identical story', () => {
  const sameCity = makeArticle({
    slug: 'coquitlam-food-truck-weekend',
    category: 'things-to-do',
    title: 'Coquitlam food trucks gather this weekend',
    locality: 'Coquitlam',
    publishedAt: '2026-08-27T08:00:00-07:00',
    frontmatter: { tags: ['free events'] },
  });
  const otherCity = makeArticle({
    slug: 'richmond-food-truck-weekend',
    category: 'things-to-do',
    title: 'Richmond food trucks gather this weekend',
    locality: 'Richmond',
    publishedAt: '2026-08-27T08:00:00-07:00',
    frontmatter: { tags: ['free events'] },
  });
  const picks = selectRelatedStories(
    kimchi,
    [kimchi, otherCity, sameCity],
    1,
    NOW
  );
  assert.equal(picks[0].slug, 'coquitlam-food-truck-weekend');
});

test('related rail fallback also excludes closed-window stories', () => {
  const unrelatedCurrent = makeArticle({
    slug: 'zzz-no-overlap',
    category: 'things-to-do',
    title: 'Zzzz',
    locality: 'Delta',
    publishedAt: '2026-08-28T09:00:00-07:00',
  });
  // Only closed things-to-do stories available: rail must be empty, not stale.
  const closedOnly = selectCategoryFallbackStories(
    unrelatedCurrent,
    [unrelatedCurrent, vsoEnded, parkEventsEnded],
    3,
    NOW
  );
  assert.deepEqual(closedOnly, []);

  const withStillOn = selectCategoryFallbackStories(
    unrelatedCurrent,
    [unrelatedCurrent, vsoEnded, parkEventsEnded, farmTourStillOn],
    3,
    NOW
  );
  assert.deepEqual(
    withStillOn.map((a) => a.slug),
    ['burnaby-farm-tour-big-bend']
  );
});

test('author rail selects only still-on stories by the same author', () => {
  const picks = selectAuthorStories(
    kimchi,
    ALL,
    'Trends Today Newsroom',
    3,
    NOW
  );
  assert.ok(picks.length > 0);
  for (const pick of picks) {
    assert.notEqual(pick.slug, kimchi.slug);
    assert.equal(isStillOn(pick.frontmatter, NOW), true);
  }
  const slugs = picks.map((a) => a.slug);
  assert.equal(
    slugs.includes('free-vso-concert-burnaby-deer-lake-park'),
    false
  );
  assert.equal(
    slugs.includes('bc-halal-food-fest-cloverdale-final-day'),
    false
  );
});

test('author rail prefers same city or same beat before recency', () => {
  const picks = selectAuthorStories(
    kimchi,
    ALL,
    'Trends Today Newsroom',
    3,
    NOW
  );
  // Every same-city or same-beat pick should rank ahead of stories that share neither.
  const matchesPreference = (a) =>
    a.frontmatter?.locality === 'Coquitlam' || a.category === 'things-to-do';
  const firstNonPreferred = picks.findIndex((a) => !matchesPreference(a));
  if (firstNonPreferred !== -1) {
    for (const later of picks.slice(firstNonPreferred)) {
      assert.equal(matchesPreference(later), false);
    }
  }
  assert.equal(matchesPreference(picks[0]), true);
});

test('only the science hub is marked noindex', () => {
  assert.equal(isNoindexCategoryHub('science'), true);
  assert.equal(isNoindexCategoryHub('Science'), true);
  assert.equal(isNoindexCategoryHub('health'), false);
  assert.equal(isNoindexCategoryHub('things-to-do'), false);
  assert.equal(isNoindexCategoryHub('local-news'), false);
  assert.equal(isNoindexCategoryHub(undefined), false);
});
