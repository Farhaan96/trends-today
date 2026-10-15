import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

const compiled = ts.transpileModule(
  readFileSync(new URL('../src/lib/freshness.ts', import.meta.url), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.ESNext } }
).outputText;
const {
  contentUpdatedValue,
  formatEditionDate,
  formatFreshnessStamp,
  formatRelativeUpdate,
  isLivePostStatus,
  pickNewestUpdatedIso,
} = await import(
  'data:text/javascript;base64,' + Buffer.from(compiled).toString('base64')
);

test('stamp matches the Pacific example and avoids dashes', () => {
  const label = formatFreshnessStamp('2026-10-14T06:58:00-07:00');
  assert.equal(label, 'Updated 6:58 a.m. PT, Wed Oct 14');
  assert.equal(/[—–-]/.test(label), false);
});

test('afternoon and morning periods stay in Pacific time', () => {
  assert.equal(
    formatFreshnessStamp('2026-10-14T13:05:00-07:00'),
    'Updated 1:05 p.m. PT, Wed Oct 14'
  );
  assert.equal(
    formatFreshnessStamp('2026-10-14T00:00:00-07:00'),
    'Updated 12:00 a.m. PT, Wed Oct 14'
  );
});

test('updatedAt wins over publishedAt when it is present', () => {
  assert.equal(
    contentUpdatedValue({
      updatedAt: '2026-10-14T06:58:00-07:00',
      publishedAt: '2026-10-01T08:00:00-07:00',
    }),
    '2026-10-14T06:58:00-07:00'
  );
});

test('modifiedAt is used when updatedAt is absent', () => {
  assert.equal(
    contentUpdatedValue({
      modifiedAt: '2026-07-23T18:15:00-07:00',
      publishedAt: '2025-09-19T06:23:55.000Z',
    }),
    '2026-07-23T18:15:00-07:00'
  );
  assert.equal(
    contentUpdatedValue({
      updatedAt: '2026-10-14T06:58:00-07:00',
      modifiedAt: '2026-07-23T18:15:00-07:00',
      publishedAt: '2026-01-01T00:00:00Z',
    }),
    '2026-10-14T06:58:00-07:00'
  );
});

test('blank or invalid modifiedAt falls through to publishedAt', () => {
  assert.equal(
    contentUpdatedValue({
      modifiedAt: '   ',
      publishedAt: '2026-10-08T08:53:04-07:00',
    }),
    '2026-10-08T08:53:04-07:00'
  );
  assert.equal(
    contentUpdatedValue({
      modifiedAt: 'not-a-date',
      publishedAt: '2026-10-08T08:53:04-07:00',
    }),
    '2026-10-08T08:53:04-07:00'
  );
});

test('newest live timestamp can come from modifiedAt', () => {
  assert.equal(
    pickNewestUpdatedIso([
      { publishedAt: '2026-10-08T08:53:04-07:00' },
      {
        publishedAt: '2025-09-01T00:00:00Z',
        modifiedAt: '2026-10-14T06:58:00-07:00',
      },
    ]),
    '2026-10-14T06:58:00-07:00'
  );
});

test('publishedAt is used when updatedAt is missing or blank', () => {
  assert.equal(
    contentUpdatedValue({
      publishedAt: '2026-10-08T08:53:04-07:00',
    }),
    '2026-10-08T08:53:04-07:00'
  );
  assert.equal(
    contentUpdatedValue({
      updatedAt: '   ',
      publishedAt: '2026-10-08T08:53:04-07:00',
    }),
    '2026-10-08T08:53:04-07:00'
  );
});

test('invalid updatedAt falls through to publishedAt', () => {
  assert.equal(
    contentUpdatedValue({
      updatedAt: 'not-a-date',
      publishedAt: '2026-10-08T08:53:04-07:00',
    }),
    '2026-10-08T08:53:04-07:00'
  );
});

test('newest live timestamp uses updatedAt when that post is newer', () => {
  assert.equal(
    pickNewestUpdatedIso([
      { publishedAt: '2026-10-08T08:53:04-07:00' },
      {
        publishedAt: '2026-09-01T08:00:00-07:00',
        updatedAt: '2026-10-14T06:58:00-07:00',
      },
    ]),
    '2026-10-14T06:58:00-07:00'
  );
});

test('drafts and other unpublished statuses are not live', () => {
  assert.equal(isLivePostStatus('published'), true);
  assert.equal(isLivePostStatus(undefined), true);
  assert.equal(isLivePostStatus('draft'), false);
  assert.equal(isLivePostStatus('review'), false);
  assert.equal(isLivePostStatus('pending'), false);
});

test('relative wording follows the story age and avoids dashes', () => {
  assert.equal(
    formatRelativeUpdate('2026-10-15T13:52:29Z', '2026-10-15T15:52:29Z'),
    'Updated 2 h ago'
  );
  assert.equal(
    formatRelativeUpdate('2026-10-15T15:40:29Z', '2026-10-15T15:52:29Z'),
    'Updated 12 min ago'
  );
  assert.equal(
    formatRelativeUpdate('2026-10-11T15:52:29Z', '2026-10-15T15:52:29Z'),
    'Updated 4 d ago'
  );
  assert.equal(
    formatRelativeUpdate('2026-10-15T15:52:00Z', '2026-10-15T15:52:29Z'),
    'Updated just now'
  );
  for (const label of [
    'Updated 2 h ago',
    'Updated 12 min ago',
    'Updated 4 d ago',
    'Updated just now',
  ]) {
    assert.equal(/[—–]/.test(label), false);
  }
});

test('edition date is the story day, not a later clock day', () => {
  const story = '2026-10-11T08:52:29-07:00';
  assert.equal(formatEditionDate(story), 'Sun Oct 11');
  assert.notEqual(
    formatEditionDate(story),
    formatEditionDate('2026-10-14T12:00:00-07:00')
  );
});

test('home date color clears 4.5:1 on the cream background', () => {
  const css = readFileSync(
    new URL('../src/app/cinematic.css', import.meta.url),
    'utf8'
  );
  assert.equal(css.includes('#3c4640'), true);
  const linear = (channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  const luminance = ([red, green, blue]) =>
    0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue);
  const foreground = luminance([60, 70, 64]);
  const background = luminance([246, 241, 226]);
  const ratio =
    (Math.max(foreground, background) + 0.05) /
    (Math.min(foreground, background) + 0.05);
  assert.equal(ratio >= 4.5, true);
});

test('unparseable input does not invent a stamp', () => {
  assert.equal(formatFreshnessStamp('nope'), null);
  assert.equal(
    contentUpdatedValue({ updatedAt: '', publishedAt: '' }),
    undefined
  );
});
