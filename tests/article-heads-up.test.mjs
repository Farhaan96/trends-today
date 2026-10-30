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
  assert.match(
    page,
    /<p className="article-heads-up">\s*<strong>\{headsUp\}<\/strong>/
  );
  assert.match(page, /\{headsUpNote \? <> \{headsUpNote\}<\/> : null\}/);
});

test('the no-fall-back article sets headsUp once, not in the body', () => {
  const [, frontmatter, ...rest] = article.split(/^---$/m);
  const body = rest.join('---');
  assert.match(frontmatter, /^headsUp: "Heads up, BC: .+"$/m);
  assert.match(
    frontmatter,
    /^headsUpNote: "Golden and the East Kootenay .+"$/m
  );
  assert.doesNotMatch(body, /Heads up, BC:/);
  assert.doesNotMatch(body, /Heads up, most of BC/);
  assert.doesNotMatch(body, /Golden falls back one last time on Nov\. 1\./);
  assert.doesNotMatch(article, /[\u2013\u2014]/);
});
