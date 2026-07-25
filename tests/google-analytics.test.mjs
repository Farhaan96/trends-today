import assert from 'node:assert/strict';
import test from 'node:test';

import { createGoogleTagCommandQueue } from '../src/lib/google-analytics.mjs';

test('queues Google tag commands as arguments objects', () => {
  const dataLayer = [];
  const gtag = createGoogleTagCommandQueue(dataLayer);
  const event = {
    page_path: '/things-to-do',
    page_title: 'Things to Do | Trends Today',
  };

  gtag('event', 'page_view', event);

  assert.equal(dataLayer.length, 1);
  assert.equal(Array.isArray(dataLayer[0]), false);
  assert.deepEqual(Array.from(dataLayer[0]), ['event', 'page_view', event]);
});
