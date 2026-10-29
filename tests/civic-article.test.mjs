import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';
import matter from 'gray-matter';

const compiled = ts.transpileModule(
  readFileSync(new URL('../src/lib/civic-article.ts', import.meta.url), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.ESNext } }
).outputText;
const {
  closureStatus,
  extractNextSection,
  formatPacificDay,
  isCivicCategory,
  isOngoingUndated,
  ongoingFlagProblems,
  pacificEndOfDay,
  splitCivicRelated,
  trimRepeatedWhatToKnow,
} = await import(
  'data:text/javascript;base64,' + Buffer.from(compiled).toString('base64')
);

const body = [
  '**Crews have shut 68 Avenue at Fraser Highway.** Fraser Highway keeps a single lane in each direction, and access to businesses and homes is maintained.',
  '',
  '---',
  '',
  '## What to know',
  '',
  '**When:** October 29 and 30, 2026. Crews work Monday to Saturday from 7 a.m. to 10 p.m.',
  '',
  '**Use instead:** 188 Street.',
  '',
  '**What stays open:** Fraser Highway keeps a single lane of traffic in each direction. Access to businesses and homes is maintained.',
  '',
  '**Walking and cycling:** The path may have short stops.',
  '',
  '## What closes next',
  '',
  '- **November 2 to 4:** no access to or from **188 Street**.',
  '',
  'The information line is 1-844-815-6111.',
  '',
  '---',
  '',
  '## Sources',
  '',
  '- [Source](https://example.com)',
].join('\n');

test('only Local News and Transit are civic', () => {
  assert.equal(isCivicCategory('transit'), true);
  assert.equal(isCivicCategory('local-news'), true);
  assert.equal(isCivicCategory('science'), false);
  assert.equal(isCivicCategory(undefined), false);
});

test('the next section is lifted whole and removed from the body', () => {
  const { section, rest } = extractNextSection(body);
  assert.ok(section.startsWith('## What closes next'));
  assert.ok(section.includes('November 2 to 4'));
  assert.ok(section.includes('1-844-815-6111'));
  assert.equal(section.includes('## Sources'), false);
  assert.equal(rest.includes('What closes next'), false);
  assert.ok(rest.includes('## Sources'));
  // The opening paragraph is untouched and still first.
  assert.ok(rest.startsWith('**Crews have shut 68 Avenue'));
});

test('bodies without a next heading are returned unchanged', () => {
  const plain = '## What to watch\n\nText.';
  assert.deepEqual(extractNextSection(plain), { section: null, rest: plain });
});

test('only fully repeated What to know lines are left out', () => {
  const { rest } = extractNextSection(body);
  const { mdx, removed } = trimRepeatedWhatToKnow(rest, [
    'Is 68 Avenue closed at Fraser Highway in Surrey?',
    'Yes, 68 Ave. at Fraser Highway is closed Oct. 29 and 30, 2026. Use 188 Street.',
  ]);
  assert.deepEqual(removed, [
    '**Use instead:** 188 Street.',
    '**What stays open:** Fraser Highway keeps a single lane of traffic in each direction. Access to businesses and homes is maintained.',
  ]);
  assert.ok(mdx.includes('**When:**'));
  assert.ok(mdx.includes('**Walking and cycling:**'));
  assert.ok(mdx.startsWith('**Crews have shut 68 Avenue'));
  assert.equal(/\n\n\n/.test(mdx), false);
});

test('a line with a number not said above is kept', () => {
  const mdx =
    '## What to know\n\n**Hours:** 7 a.m. to 11 p.m.\n\n**Other:** New fact.';
  const { removed } = trimRepeatedWhatToKnow(mdx, [
    'Hours are 7 a.m. to 10 p.m.',
  ]);
  assert.deepEqual(removed, []);
});

test('the section is left as written if every line repeats', () => {
  const mdx = '## What to know\n\n**Use instead:** 188 Street.';
  const result = trimRepeatedWhatToKnow(mdx, ['Use 188 Street.']);
  assert.equal(result.mdx, mdx);
  assert.deepEqual(result.removed, []);
});

test('current vs ended uses eventEndDate', () => {
  const now = Date.parse('2026-10-29T09:00:00-07:00');
  assert.equal(closureStatus('2026-11-10T22:00:00-07:00', now), 'current');
  assert.equal(closureStatus('2026-10-29', now), 'current');
  assert.equal(closureStatus('2026-10-15T22:00:00-07:00', now), 'ended');
  assert.equal(closureStatus(undefined, now), 'undated');
  assert.equal(closureStatus('soon', now), 'undated');
});

test('current closures lead, ended ones are kept for the list below', () => {
  const now = Date.parse('2026-10-29T09:00:00-07:00');
  const { cards, ended } = splitCivicRelated(
    [
      { slug: 'sept', score: 30, eventEndDate: '2026-09-25T18:00:00-07:00' },
      { slug: 'oct', score: 20, eventEndDate: '2026-10-15T22:00:00-07:00' },
      { slug: 'nov', score: 10, eventEndDate: '2026-11-08' },
      { slug: 'undated', score: 5 },
      { slug: 'dec', score: 12, eventEndDate: '2026-12-20' },
    ],
    now,
    3
  );
  assert.deepEqual(
    cards.map((item) => item.slug),
    ['dec', 'nov', 'undated']
  );
  assert.deepEqual(
    ended.map((item) => item.slug),
    ['oct', 'sept']
  );
});

test('ongoing undated stories sort after dated current, before undated filler', () => {
  const now = Date.parse('2026-10-29T09:00:00-07:00');
  const { cards, ended } = splitCivicRelated(
    [
      { slug: 'filler', score: 50 },
      {
        slug: 'ongoing',
        score: 40,
        ongoing: true,
        ongoingReviewBy: '2026-11-30',
      },
      { slug: 'nov', score: 10, eventEndDate: '2026-11-08' },
      { slug: 'oct', score: 20, eventEndDate: '2026-10-15T22:00:00-07:00' },
    ],
    now,
    3
  );
  assert.deepEqual(
    cards.map((item) => item.slug),
    ['nov', 'ongoing', 'filler']
  );
  assert.deepEqual(
    ended.map((item) => item.slug),
    ['oct']
  );
});

test('ongoing stories stay within the max of 3 current cards', () => {
  const now = Date.parse('2026-10-29T09:00:00-07:00');
  const { cards } = splitCivicRelated(
    [
      { slug: 'a', score: 1, eventEndDate: '2026-11-01' },
      { slug: 'b', score: 2, eventEndDate: '2026-11-02' },
      { slug: 'c', score: 3, eventEndDate: '2026-11-03' },
      {
        slug: 'ongoing',
        score: 99,
        ongoing: true,
        ongoingReviewBy: '2026-11-30',
      },
    ],
    now,
    3
  );
  assert.deepEqual(
    cards.map((item) => item.slug),
    ['c', 'b', 'a']
  );
});

test('undated stories without the flag are unchanged', () => {
  const now = Date.parse('2026-10-29T09:00:00-07:00');
  const { cards } = splitCivicRelated(
    [
      { slug: 'u1', score: 9 },
      { slug: 'u2', score: 7, ongoing: false },
      { slug: 'nov', score: 1, eventEndDate: '2026-11-08' },
    ],
    now,
    3
  );
  assert.deepEqual(
    cards.map((item) => item.slug),
    ['nov', 'u1', 'u2']
  );
  assert.equal(isOngoingUndated({ ongoing: false }, now), false);
  assert.equal(isOngoingUndated({}, now), false);
  assert.equal(
    isOngoingUndated({ ongoing: true, ongoingReviewBy: '2026-11-30' }, now),
    true
  );
});

test('a past eventEndDate wins over ongoing: true', () => {
  const now = Date.parse('2026-10-29T09:00:00-07:00');
  const { cards, ended } = splitCivicRelated(
    [
      {
        slug: 'flagged-ended',
        score: 50,
        ongoing: true,
        ongoingReviewBy: '2026-11-30',
        eventEndDate: '2026-10-15T22:00:00-07:00',
      },
      { slug: 'nov', score: 1, eventEndDate: '2026-11-08' },
    ],
    now,
    3
  );
  assert.deepEqual(
    cards.map((item) => item.slug),
    ['nov']
  );
  assert.deepEqual(
    ended.map((item) => item.slug),
    ['flagged-ended']
  );
  assert.equal(
    isOngoingUndated(
      {
        ongoing: true,
        ongoingReviewBy: '2026-11-30',
        eventEndDate: '2026-10-15T22:00:00-07:00',
      },
      now
    ),
    false
  );
});

test('ongoing needs a review date that has not passed (Vancouver end of day)', () => {
  const base = { ongoing: true };
  const at = (iso) => Date.parse(iso);
  // Future review date: ongoing.
  assert.equal(
    isOngoingUndated(
      { ...base, ongoingReviewBy: '2026-11-30' },
      at('2026-10-29T09:00:00-07:00')
    ),
    true
  );
  // Last second of the review day still counts; the next second does not.
  // (Offset comes from the runtime's tz data, as in the end-of-day test.)
  const reviewEnd = pacificEndOfDay('2026-11-30');
  assert.equal(
    isOngoingUndated({ ...base, ongoingReviewBy: '2026-11-30' }, reviewEnd),
    true
  );
  assert.equal(
    isOngoingUndated(
      { ...base, ongoingReviewBy: '2026-11-30' },
      reviewEnd + 1000
    ),
    false
  );
  // Past, missing or invalid review date: plain undated.
  const now = at('2026-10-29T09:00:00-07:00');
  assert.equal(
    isOngoingUndated({ ...base, ongoingReviewBy: '2026-10-01' }, now),
    false
  );
  assert.equal(isOngoingUndated(base, now), false);
  assert.equal(
    isOngoingUndated({ ...base, ongoingReviewBy: '2026-13-40' }, now),
    false
  );
  assert.equal(
    isOngoingUndated({ ...base, ongoingReviewBy: 'fall 2026' }, now),
    false
  );
  // An unquoted YAML date parses to a Date and still works.
  assert.equal(
    isOngoingUndated(
      { ...base, ongoingReviewBy: new Date('2026-11-30T00:00:00Z') },
      now
    ),
    true
  );
});

test('flagged stories with a missing or past review date sort as undated filler', () => {
  const now = Date.parse('2026-10-29T09:00:00-07:00');
  const { cards } = splitCivicRelated(
    [
      { slug: 'missing', score: 40, ongoing: true },
      { slug: 'past', score: 30, ongoing: true, ongoingReviewBy: '2026-10-01' },
      { slug: 'filler', score: 50 },
      { slug: 'nov', score: 10, eventEndDate: '2026-11-08' },
    ],
    now,
    3
  );
  assert.deepEqual(
    cards.map((item) => item.slug),
    ['nov', 'filler', 'missing']
  );
});

test('ongoing flag check rejects an article without a valid ongoingReviewBy', () => {
  const read = (name) =>
    matter(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8'))
      .data;
  assert.deepEqual(ongoingFlagProblems(read('ongoing-with-review.mdx')), []);
  assert.deepEqual(ongoingFlagProblems(read('ongoing-missing-review.mdx')), [
    'ongoing: true needs ongoingReviewBy (YYYY-MM-DD)',
  ]);
  assert.deepEqual(
    ongoingFlagProblems({ ongoing: true, ongoingReviewBy: 'fall 2026' }),
    ['ongoingReviewBy must be a valid YYYY-MM-DD date']
  );
  assert.deepEqual(ongoingFlagProblems({ status: 'published' }), []);
});

test('every content article with ongoing: true has a valid ongoingReviewBy', () => {
  const root = new URL('../content/', import.meta.url);
  const problems = [];
  let flagged = 0;
  for (const category of readdirSync(root, { withFileTypes: true })) {
    if (!category.isDirectory()) continue;
    const dir = new URL(`${category.name}/`, root);
    for (const file of readdirSync(dir)) {
      if (!file.endsWith('.mdx')) continue;
      const { data } = matter(readFileSync(new URL(file, dir), 'utf8'));
      if (data.ongoing === true) flagged += 1;
      for (const problem of ongoingFlagProblems(data)) {
        problems.push(`content/${category.name}/${file}: ${problem}`);
      }
    }
  }
  assert.deepEqual(problems, []);
  assert.ok(flagged >= 1, 'expected at least the Holdom article to be flagged');
});

test('Pacific dates do not roll over to the next UTC day', () => {
  assert.equal(formatPacificDay('2026-11-10T22:00:00-07:00'), 'Nov 10, 2026');
  assert.equal(formatPacificDay('2026-12-20'), 'Dec 20, 2026');
  assert.equal(/[—–]/.test(formatPacificDay('2026-12-20')), false);
});

test('a bare end date runs through 23:59:59 Vancouver time, DST-correct', () => {
  // Summer 2025: PDT, -07:00. Winter 2025: PST, -08:00.
  assert.equal(
    pacificEndOfDay('2025-07-15'),
    Date.parse('2025-07-15T23:59:59-07:00')
  );
  assert.equal(
    pacificEndOfDay('2025-12-20'),
    Date.parse('2025-12-20T23:59:59-08:00')
  );
  // Clock change days end in the new offset.
  assert.equal(
    pacificEndOfDay('2025-03-09'),
    Date.parse('2025-03-09T23:59:59-07:00')
  );
  assert.equal(
    pacificEndOfDay('2025-11-02'),
    Date.parse('2025-11-02T23:59:59-08:00')
  );
  // Whatever the runtime's tz data says for later dates (BC stays on -07:00
  // after March 8, 2026 in tzdata 2026e), the end is 23:59:59 local.
  const local = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Vancouver',
    dateStyle: 'short',
    timeStyle: 'medium',
    hourCycle: 'h23',
  });
  for (const day of ['2026-07-15', '2026-11-08', '2026-12-20']) {
    assert.equal(
      local.format(new Date(pacificEndOfDay(day))),
      `${day}, 23:59:59`
    );
  }
  // Still current at 11:30 p.m. PDT on a summer end date, ended just after.
  assert.equal(
    closureStatus('2025-07-15', Date.parse('2025-07-15T23:30:00-07:00')),
    'current'
  );
  assert.equal(
    closureStatus('2025-07-15', Date.parse('2025-07-16T00:00:30-07:00')),
    'ended'
  );
  assert.ok(Number.isNaN(pacificEndOfDay('2026-13-40')));
});

test('Holdom fixture flips from current to ended at 3 p.m. PT on Oct 31, 2026', () => {
  const mdx = readFileSync(
    new URL('./fixtures/holdom-fixed-end.mdx', import.meta.url),
    'utf8'
  );
  const end = /^eventEndDate:\s*'([^']+)'/m.exec(mdx)?.[1];
  assert.equal(end, '2026-10-31T15:00:00-07:00');
  assert.equal(
    closureStatus(end, Date.parse('2026-10-31T14:59:00-07:00')),
    'current'
  );
  assert.equal(
    closureStatus(end, Date.parse('2026-10-31T15:01:00-07:00')),
    'ended'
  );
  assert.equal(formatPacificDay(end), 'Oct 31, 2026');
});
