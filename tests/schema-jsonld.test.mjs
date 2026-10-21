import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

const compiled = ts.transpileModule(
  readFileSync(new URL('../src/lib/schema-urls.ts', import.meta.url), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.ESNext } }
).outputText;
const { absolutizeSchemaUrls, isLayoutBaseSchemaGraph, serializeJsonLd } =
  await import(
    'data:text/javascript;base64,' + Buffer.from(compiled).toString('base64')
  );

test('relative schema urls become absolute and existing absolute urls stay', () => {
  const schema = absolutizeSchemaUrls({
    '@context': 'https://schema.org',
    '@type': 'Article',
    description: 'See /images/editorial/park.png in the body copy.',
    image: ['/images/editorial/2026/10/park.png'],
    author: {
      image: '/images/newsroom/moe.jpg',
      url: 'https://www.trendstoday.ca/author/moe',
    },
    publisher: {
      logo: { url: 'https://www.trendstoday.ca/images/logo.png' },
    },
    mainEntityOfPage: {
      '@id': 'https://www.trendstoday.ca/local-news/example',
    },
    potentialAction: { target: '/local-news/example' },
  });

  assert.equal(schema['@context'], 'https://schema.org');
  assert.equal(
    schema.description,
    'See /images/editorial/park.png in the body copy.'
  );
  assert.deepEqual(schema.image, [
    'https://www.trendstoday.ca/images/editorial/2026/10/park.png',
  ]);
  assert.equal(
    schema.author.image,
    'https://www.trendstoday.ca/images/newsroom/moe.jpg'
  );
  assert.equal(schema.author.url, 'https://www.trendstoday.ca/author/moe');
  assert.equal(
    schema.publisher.logo.url,
    'https://www.trendstoday.ca/images/logo.png'
  );
  assert.equal(
    schema.mainEntityOfPage['@id'],
    'https://www.trendstoday.ca/local-news/example'
  );
  assert.equal(
    schema.potentialAction.target,
    'https://www.trendstoday.ca/local-news/example'
  );
});

test('json-ld serialization escapes angle brackets', () => {
  assert.equal(
    serializeJsonLd({ description: 'a < b' }),
    '{"description":"a \\u003c b"}'
  );
});

test('layout organization and website graph is the duplicate to skip', () => {
  assert.equal(
    isLayoutBaseSchemaGraph({
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'Organization', name: 'Trends Today' },
        { '@type': 'WebSite', name: 'Trends Today' },
      ],
    }),
    true
  );
  assert.equal(
    isLayoutBaseSchemaGraph({
      '@context': 'https://schema.org',
      '@type': 'Article',
      image: ['/images/editorial/park.png'],
    }),
    false
  );
  assert.equal(
    isLayoutBaseSchemaGraph({
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'Organization' },
        { '@type': 'WebSite' },
        { '@type': 'Article' },
      ],
    }),
    false
  );
});

test('live json-ld components do not use next/script', () => {
  const files = [
    '../src/components/seo/ArticleJsonLd.tsx',
    '../src/components/seo/SchemaMarkup.tsx',
    '../src/components/seo/StructuredData.tsx',
    '../src/components/seo/JsonLdScript.tsx',
  ];

  for (const file of files) {
    const source = readFileSync(new URL(file, import.meta.url), 'utf8');
    assert.equal(source.includes('next/script'), false, file);
    assert.equal(source.includes('beforeInteractive'), false, file);
  }

  const script = readFileSync(
    new URL('../src/components/seo/JsonLdScript.tsx', import.meta.url),
    'utf8'
  );
  assert.match(script, /type="application\/ld\+json"/);
});
