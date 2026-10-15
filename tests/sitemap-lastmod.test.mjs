import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const config = require('../next-sitemap.config.js');

test('sitemap lastmod prefers modifiedAt over an earlier publishedAt', async () => {
  const result = await config.transform(
    config,
    '/local-news/coquitlam-partington-creek-wildlife-corridor'
  );
  assert.ok(result);
  assert.equal(
    result.lastmod,
    new Date('2026-08-28T08:00:00-07:00').toISOString()
  );
});

test('sitemap lastmod uses publishedAt when modifiedAt is absent', async () => {
  const result = await config.transform(
    config,
    '/transit/skytrain-overnight-testing-october-2026'
  );
  assert.equal(
    result.lastmod,
    new Date('2026-10-08T08:53:04-07:00').toISOString()
  );
});
