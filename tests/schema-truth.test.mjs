import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  organizationSchema,
  websiteSchema,
} from '../src/lib/site-schema.mjs';

test('base schemas describe the current Lower Mainland publication', () => {
  assert.equal(organizationSchema['@type'], 'Organization');
  assert.equal(organizationSchema.name, 'Trends Today');
  assert.match(organizationSchema.description, /Lower Mainland/);
  assert.equal(websiteSchema['@type'], 'WebSite');
  assert.equal(websiteSchema.publisher, organizationSchema);
  assert.match(websiteSchema.description, /local reporting/i);
});

test('base schemas omit unsupported identity and contact claims', () => {
  for (const field of [
    'alternateName',
    'foundingDate',
    'founder',
    'contactPoint',
    'sameAs',
    'address',
  ]) {
    assert.equal(field in organizationSchema, false);
  }

  const serialized = JSON.stringify({ organizationSchema, websiteSchema });
  for (const unsupportedClaim of [
    '+1-800-TRENDS',
    'contact@trendstoday.ca',
    'Tech Blog',
    'Tech Reviews',
    '"addressRegion":"ON"',
  ]) {
    assert.equal(serialized.includes(unsupportedClaim), false);
  }
});

test('website schema omits a URL-backed SearchAction until it is verified', () => {
  assert.equal('potentialAction' in websiteSchema, false);
});

test('article schemas reuse the same fail-closed publisher identity', async () => {
  const source = await readFile(
    new URL('../src/components/seo/ArticleJsonLd.tsx', import.meta.url),
    'utf8'
  );

  assert.equal(
    [...source.matchAll(/publisher: organizationSchema/g)].length,
    3
  );
  assert.equal(source.includes('sameAs:'), false);
  assert.equal(source.includes('twitter.com/trendstoday'), false);
});
