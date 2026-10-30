import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

const source = readFileSync(
  new URL('../src/lib/editorial.ts', import.meta.url),
  'utf8'
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
});
const editorial = { exports: {} };
new Function('module', 'exports', outputText)(editorial, editorial.exports);
const { formatArticleDate } = editorial.exports;

test('formatArticleDate uses the Vancouver day, not the UTC day', () => {
  // 6:45 PM PDT on Oct 31 is 01:45 UTC on Nov 1.
  assert.equal(formatArticleDate('2026-10-31T18:45:00-07:00'), 'Oct 31, 2026');
  assert.equal(formatArticleDate('2026-11-01T01:45:00Z'), 'Oct 31, 2026');
  // 06:30 UTC on Jan 1 is still Dec 31 in Vancouver (UTC-7 or UTC-8).
  assert.equal(formatArticleDate('2027-01-01T06:30:00Z'), 'Dec 31, 2026');
  assert.equal(formatArticleDate('2026-10-31T08:10:00-07:00'), 'Oct 31, 2026');
});

test('formatArticleDate returns an empty string for missing or bad input', () => {
  assert.equal(formatArticleDate(undefined), '');
  assert.equal(formatArticleDate(''), '');
  assert.equal(formatArticleDate('not a date'), '');
});
