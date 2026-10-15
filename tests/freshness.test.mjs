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
  formatFreshnessStamp,
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

test('unparseable input does not invent a stamp', () => {
  assert.equal(formatFreshnessStamp('nope'), null);
  assert.equal(
    contentUpdatedValue({ updatedAt: '', publishedAt: '' }),
    undefined
  );
});
