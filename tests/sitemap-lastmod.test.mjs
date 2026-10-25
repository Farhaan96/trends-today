import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const config = require('../next-sitemap.config.js');

test('sitemap lastmod ignores modifiedAt and uses publishedAt', async () => {
  const result = await config.transform(
    config,
    '/local-news/coquitlam-partington-creek-wildlife-corridor'
  );
  assert.ok(result);
  assert.equal(
    result.lastmod,
    new Date('2026-07-27T14:45:00-07:00').toISOString()
  );
});

test('sitemap leaves lastmod off non-article pages', async () => {
  const result = await config.transform(config, '/about');
  assert.ok(result);
  assert.equal(result.lastmod, undefined);
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
