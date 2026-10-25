import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const globalsCss = readFileSync(
  new URL('../src/app/globals.css', import.meta.url),
  'utf8'
);
const cinematicCss = readFileSync(
  new URL('../src/app/cinematic.css', import.meta.url),
  'utf8'
);
const articlePage = readFileSync(
  new URL('../src/app/[category]/[slug]/page.tsx', import.meta.url),
  'utf8'
);
const browserQa = readFileSync(
  new URL('../scripts/qa/pr-check.mjs', import.meta.url),
  'utf8'
);

function rootTokenBlocks(css) {
  const blocks = [...css.matchAll(/(?:^|\n)\s*:root\s*\{([\s\S]*?)\n\s*\}/g)];
  assert.ok(blocks.length > 0, 'expected at least one :root token block');

  return blocks.map((block) =>
    Object.fromEntries(
      [...block[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(
        ([, name, value]) => [name, value.trim()]
      )
    )
  );
}

function resolveToken(tokens, name, seen = new Set()) {
  assert.equal(seen.has(name), false, `circular custom property: ${name}`);
  const value = tokens[name];
  assert.ok(value, `missing custom property: ${name}`);

  const reference = value.match(/^var\((--[\w-]+)\)$/);
  if (!reference) return value;

  return resolveToken(tokens, reference[1], new Set([...seen, name]));
}

function hexToRgb(hex) {
  const value = hex.replace('#', '');
  assert.match(
    value,
    /^[\da-f]{6}$/i,
    `expected a six-digit hex color: ${hex}`
  );
  return [0, 2, 4].map((offset) =>
    Number.parseInt(value.slice(offset, offset + 2), 16)
  );
}

function relativeLuminance(hex) {
  const channels = hexToRgb(hex).map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(foreground, background) {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  return (
    (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
    (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
  );
}

test('cinematic author button resolves to a WCAG AA accent', () => {
  const [globalLightTokens, globalDarkTokens] = rootTokenBlocks(globalsCss);
  const [cinematicTokens] = rootTokenBlocks(cinematicCss);
  const themes = {
    light: { ...globalLightTokens, ...cinematicTokens },
    'dark preference': {
      ...globalLightTokens,
      ...globalDarkTokens,
      ...cinematicTokens,
    },
  };

  assert.match(
    globalsCss,
    /\.primary-button\s*\{[\s\S]*?background:\s*var\(--color-accent\);[\s\S]*?color:\s*var\(--color-on-accent\);/
  );
  for (const [theme, tokens] of Object.entries(themes)) {
    const foreground = resolveToken(tokens, '--color-on-accent');
    const accent = resolveToken(tokens, '--color-accent');
    const accentStrong = resolveToken(tokens, '--color-accent-strong');

    assert.ok(
      contrastRatio(foreground, accent) >= 4.5,
      `${theme}: ${foreground} on ${accent} must have at least 4.5:1 contrast`
    );
    assert.ok(
      contrastRatio(foreground, accentStrong) >= 4.5,
      `${theme}: ${foreground} on ${accentStrong} must have at least 4.5:1 hover contrast`
    );
  }
});

test('cinematic accent text keeps AA contrast on its light surfaces', () => {
  const tokens = {
    ...rootTokenBlocks(globalsCss)[0],
    ...rootTokenBlocks(cinematicCss)[0],
  };
  const foregrounds = [
    resolveToken(tokens, '--color-accent'),
    resolveToken(tokens, '--color-accent-strong'),
  ];
  const backgrounds = [
    resolveToken(tokens, '--color-bg'),
    resolveToken(tokens, '--color-surface'),
    resolveToken(tokens, '--color-surface-strong'),
    resolveToken(tokens, '--tt-paper'),
  ];

  for (const foreground of foregrounds) {
    for (const background of backgrounds) {
      assert.ok(
        contrastRatio(foreground, background) >= 4.5,
        `${foreground} on ${background} must have at least 4.5:1 contrast`
      );
    }
  }
});

test('desktop photo/generated article hero is capped below the 720px QA flag', () => {
  const desktop = cinematicCss.match(
    /@media \(min-width: 1025px\) \{\s*\.article-hero:not\(\.article-hero--map\),[\s\S]*?max-width:\s*(\d+)px;/
  );
  assert.ok(desktop, 'expected a desktop max-width rule for cover heroes');
  const maxWidth = Number(desktop[1]);
  // 16:9 cover heroes: height = width * 9 / 16.
  assert.ok((maxWidth * 9) / 16 <= 540, `hero height ${(maxWidth * 9) / 16}px`);
});

test('phone article text and controls meet the browser QA floors', () => {
  assert.match(
    cinematicCss,
    /\.site-body:has\(\.article-page\) \.tt-wordmark\s*\{[\s\S]*?min-height:\s*44px;[\s\S]*?animation:\s*none;/
  );
  assert.match(
    cinematicCss,
    /\.article-page \.article-category,[\s\S]*?\.article-page \.article-content-shell \.prose li > a\s*\{[\s\S]*?min-height:\s*44px;/
  );
  assert.match(
    cinematicCss,
    /\.article-page \.article-highlights__eyebrow,[\s\S]*?\.article-page \.author-more \.story-card__category\s*\{[\s\S]*?font-size:\s*12px;/
  );
  assert.match(
    cinematicCss,
    /\.site-main:has\(> \.article-page\) \+ \.site-footer \.site-footer__legal\s*\{[\s\S]*?font-size:\s*12px;/
  );
  assert.match(
    cinematicCss,
    /\.site-main:has\(> \.article-page\) \+ \.site-footer \.site-footer__links a\s*\{[\s\S]*?min-height:\s*44px;/
  );
  assert.match(
    cinematicCss,
    /\.article-meta\s*\{[\s\S]*?display:\s*flex;[\s\S]*?font-size:\s*13px;/
  );
  assert.match(
    cinematicCss,
    /\.article-meta__author\s*\{[\s\S]*?min-height:\s*44px;/
  );
  assert.match(
    cinematicCss,
    /\.article-meta__author \.article-author-link\s*\{[\s\S]*?color:\s*var\(--color-text\);/
  );
});

test('article meta stays unclipped and inset with a spaced separator', () => {
  const phoneMeta = cinematicCss.match(/\.article-meta\s*\{([\s\S]*?)\n\s*\}/);
  const phoneAuthorLink = cinematicCss.match(
    /\.article-meta__author \.article-author-link\s*\{([\s\S]*?)\n\s*\}/
  );

  assert.ok(phoneMeta, 'expected the phone article meta rule');
  assert.doesNotMatch(phoneMeta[1], /max-height\s*:/);
  assert.ok(phoneAuthorLink, 'expected the phone author-link rule');
  assert.doesNotMatch(phoneAuthorLink[1], /margin-inline\s*:\s*-/);
  assert.ok(articlePage.includes("? '\\u00a0·\\u00a0' : null"));
  assert.ok(browserQa.includes('articleMeta.scrollHeight'));
  assert.ok(browserQa.includes('authorTapBox?.left >= 10'));
  assert.ok(browserQa.includes('/\\S\\s+·\\s+\\S/'));
});
