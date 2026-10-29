import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const page = readFileSync(
  new URL('../src/app/[category]/[slug]/page.tsx', import.meta.url),
  'utf8'
);
const article = readFileSync(
  new URL(
    '../content/local-news/bc-no-fall-back-november-1-2026.mdx',
    import.meta.url
  ),
  'utf8'
);

test('headsUp renders after the dek and before the hero image', () => {
  const deck = page.indexOf('className="article-deck"');
  const headsUp = page.indexOf('className="article-heads-up"');
  const hero = page.indexOf('article-hero');
  assert.ok(deck > -1 && headsUp > -1 && hero > -1);
  assert.ok(deck < headsUp, 'heads-up follows the dek');
  assert.ok(headsUp < hero, 'heads-up comes before the hero image');
  assert.match(page, /\{headsUp \? <p className="article-heads-up">/);
});

test('the no-fall-back article sets headsUp once, not in the body', () => {
  const [, frontmatter, ...rest] = article.split(/^---$/m);
  const body = rest.join('---');
  assert.match(frontmatter, /^headsUp: "Heads up, BC: .+"$/m);
  assert.doesNotMatch(body, /Heads up, BC/);
  assert.doesNotMatch(article, /[\u2013\u2014]/);
});
