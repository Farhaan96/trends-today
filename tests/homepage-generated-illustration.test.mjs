import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import matter from 'gray-matter';
import ts from 'typescript';

const helperSource = readFileSync(
  new URL('../src/lib/illustration-caption.ts', import.meta.url),
  'utf8'
);
const compiledHelper = ts.transpileModule(helperSource, {
  compilerOptions: { module: ts.ModuleKind.ESNext },
}).outputText;
const {
  GENERATED_ILLUSTRATION_CAPTION,
  generatedImageCaption,
  illustrationImageAlt,
} = await import(
  'data:text/javascript;base64,' +
    Buffer.from(compiledHelper).toString('base64')
);

const guideSlugs = [
  'minnekhada-regional-park-day-trip-guide-2026',
  'iona-beach-regional-park-day-trip-guide-2026',
  'burnaby-mountain-conservation-area-day-trip-guide-2026',
  'central-park-burnaby-day-trip-guide-2026',
];

test('the four photoreal guides opt in and store exactly one disclosure prefix', () => {
  for (const slug of guideSlugs) {
    const article = matter(
      readFileSync(
        new URL(`../content/things-to-do/${slug}.mdx`, import.meta.url),
        'utf8'
      )
    ).data;

    assert.equal(article.heroStyle, 'photoreal');
    assert.match(article.imageAlt, /^AI-generated image of\s+\S/);
    assert.equal(
      (article.imageAlt.match(/AI-generated image of/gi) || []).length,
      1,
      `${slug} frontmatter`
    );

    const alt = illustrationImageAlt(
      article.imageAlt,
      article.title,
      article.imageAttribution,
      article.imageSourceType,
      article.heroStyle
    );

    assert.match(alt, /^AI-generated image of\s+\S/);
    assert.equal(
      (alt.match(/AI-generated image of/gi) || []).length,
      1,
      `${slug} rendered alt`
    );
  }
});

test('the alt helper does not double-prefix an already disclosed illustration', () => {
  const alt = illustrationImageAlt(
    'Generated illustration of a marsh at sunrise',
    'Marsh guide',
    'Generated editorial image for Trends Today',
    'generated'
  );
  assert.equal(alt, 'Generated illustration of a marsh at sunrise');
});

test('the alt helper switches prefixes without double-prefixing photoreal alts', () => {
  assert.equal(
    illustrationImageAlt(
      'Generated illustration of a marsh at sunrise',
      'Marsh guide',
      'Generated editorial image for Trends Today',
      'generated',
      'photoreal'
    ),
    'AI-generated image of a marsh at sunrise'
  );
  assert.equal(
    illustrationImageAlt(
      'AI-generated image of a marsh at sunrise',
      'Marsh guide',
      'Generated editorial image for Trends Today',
      'generated',
      'photoreal'
    ),
    'AI-generated image of a marsh at sunrise'
  );
});

test('caption text branches on heroStyle and uses the place name', () => {
  assert.equal(
    generatedImageCaption('photoreal', 'Coquitlam'),
    'AI-generated image, not a photo of Coquitlam.'
  );
  assert.equal(
    generatedImageCaption(undefined, 'Coquitlam'),
    'Generated illustration by Trends Today, not a photo.'
  );
});

test('homepage cover and brief thumbnails use the shared alt helper', () => {
  const cover = readFileSync(
    new URL('../src/components/editorial/CinematicHome.tsx', import.meta.url),
    'utf8'
  );
  const brief = readFileSync(
    new URL('../src/components/editorial/TodayBrief.tsx', import.meta.url),
    'utf8'
  );

  assert.match(cover, /alt=\{illustrationImageAlt\(/);
  assert.match(brief, /imageAlt:\s*illustrationImageAlt\(/);
});

test('the generated homepage cover has the exact visible HTML caption', () => {
  const cover = readFileSync(
    new URL('../src/components/editorial/CinematicHome.tsx', import.meta.url),
    'utf8'
  );
  const frame = cover.indexOf('className="cover__frame"');
  const frameClose = cover.indexOf('</Link>', frame);
  const caption = cover.indexOf('className="cover__generated-caption"');

  assert.ok(frame !== -1 && frameClose > frame && caption > frameClose);
  assert.match(cover.slice(caption, caption + 180), /generatedImageCaption/);
  assert.equal(
    GENERATED_ILLUSTRATION_CAPTION,
    'Generated illustration by Trends Today, not a photo.'
  );
});
