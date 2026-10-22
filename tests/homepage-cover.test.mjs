import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

const component = readFileSync(
  new URL('../src/components/editorial/CinematicHome.tsx', import.meta.url),
  'utf8'
);
const css = readFileSync(
  new URL('../src/app/cinematic.css', import.meta.url),
  'utf8'
);
const compiled = ts.transpileModule(
  readFileSync(
    new URL('../src/lib/cinematic-feed.ts', import.meta.url),
    'utf8'
  ),
  { compilerOptions: { module: ts.ModuleKind.ESNext } }
).outputText;
const { coverImageFit } = await import(
  'data:text/javascript;base64,' + Buffer.from(compiled).toString('base64')
);

test('the cover does not repeat the lead title in its caption', () => {
  assert.match(component, /<h1 id="cover-heading">\{lead\.title\}<\/h1>/);
  assert.doesNotMatch(component, /<h2>\{lead\.title\}<\/h2>/);
  assert.match(
    component,
    /const supplementalStories = stories\.filter\([\s\S]*story\.href !== lead\?\.href[\s\S]*\)/
  );
  assert.match(component, /filterStories\(supplementalStories, city, query\)/);
});

test('the phone cover stage has a definite full width and 16:9 media', () => {
  const phoneCss = css.slice(css.indexOf('@media (max-width: 640px)'));
  assert.match(phoneCss, /\.cover__stage\s*{[^}]*width:\s*100%/s);
  assert.match(phoneCss, /\.cover__media\s*{[^}]*aspect-ratio:\s*16\s*\/\s*9/s);
});

test('cover images contain official maps and crop other artwork', () => {
  assert.equal(coverImageFit({ imageSourceType: 'official-map' }), 'contain');
  assert.equal(coverImageFit({ imageSourceType: 'generated' }), 'cover');
  assert.equal(coverImageFit({ imageSourceType: 'official-photo' }), 'cover');
  assert.match(css, /\.cover__image--contain\s*{[^}]*object-fit:\s*contain/s);
});

test('phone homepage controls and type meet the mobile QA floors', () => {
  const phoneCss = css.slice(css.indexOf('@media (max-width: 640px)'));
  assert.match(
    phoneCss,
    /\.cinematic-home a,[\s\S]*\.cinematic-home input\s*{[^}]*min-width:\s*44px[^}]*min-height:\s*44px/s
  );
  assert.match(
    phoneCss,
    /\.cinematic-home \.crawler-pagination a\s*{[^}]*min-width:\s*44px[^}]*min-height:\s*44px/s
  );
  assert.match(
    phoneCss,
    /\.cinematic-home \.neighbourhood-card__body > p:not\(\.eyebrow\)\s*{[^}]*font-size:\s*16px/s
  );
  assert.match(
    phoneCss,
    /body:has\(\.cinematic-home\) \.site-footer__legal\s*{[^}]*font-size:\s*12px/s
  );
  assert.match(component, /aria-label="Search local stories"/);
  assert.doesNotMatch(component, /className="sr-only">Search local stories/);
});

test('phone story rows preserve a useful text column beside 96px thumbnails', () => {
  const phoneCss = css.slice(css.indexOf('@media (max-width: 640px)'));
  assert.match(component, /className="travel-brief__body"/);
  assert.match(component, /className="neighbourhood-card__body"/);
  assert.match(
    phoneCss,
    /\.neighbourhood-grid article,[\s\S]*\.travel-brief article\s*{[^}]*grid-template-columns:\s*96px minmax\(0, 1fr\)/s
  );
  assert.match(
    phoneCss,
    /\.travel-brief__inner,[\s\S]*\.neighbourhood-grid\s*{[^}]*grid-template-columns:\s*1fr/s
  );
  assert.match(phoneCss, /-webkit-line-clamp:\s*4/);
});

test('Latest and city filters use the required responsive dimensions', () => {
  assert.match(
    css,
    /\.today-brief__link\s*{[^}]*grid-template-columns:\s*96px minmax\(0, 1fr\)/s
  );
  assert.match(
    css,
    /\.city-filters button\s*{[^}]*width:\s*auto[^}]*min-width:\s*44px[^}]*min-height:\s*44px/s
  );
  assert.doesNotMatch(css, /\.city-filters button\s*{[^}]*\n\s*width:\s*44px/s);
});
