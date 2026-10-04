import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import matter from 'gray-matter';
import { compileMDX } from 'next-mdx-remote/rsc';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');

function loadSource(path) {
  const { outputText } = ts.transpileModule(read(path), {
    fileName: fileURLToPath(new URL(path, root)),
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  });
  const sourceModule = { exports: {} };
  const sourceRequire = (name) => {
    if (name === 'next/script') {
      return function ScriptStub() {
        return null;
      };
    }
    if (name === 'next/link') {
      return function LinkStub({ children, ...props }) {
        return React.createElement('a', props, children);
      };
    }
    return require(name);
  };
  new Function('require', 'module', 'exports', outputText)(
    sourceRequire,
    sourceModule,
    sourceModule.exports
  );
  return sourceModule.exports;
}

test('legacy redirects preserve their hubs without capturing real article paths', async () => {
  const redirects = await loadSource('next.config.ts').default.redirects();
  assert.equal(redirects.length, 17);
  for (const redirect of redirects) {
    assert.equal(redirect.permanent, true);
    assert.match(redirect.source, /^\/(best|compare)\/[a-z0-9-]+$/);
    assert.equal(redirect.destination, `/${redirect.source.split('/')[1]}`);
  }
  assert.equal(
    redirects.find((item) => item.source === '/best/best-smartphones')
      .destination,
    '/best'
  );
  assert.equal(
    redirects.find(
      (item) => item.source === '/compare/macbook-air-m2-vs-dell-xps-13'
    ).destination,
    '/compare'
  );
  for (const path of [
    '/compare/iphone-15-pro-vs-samsung-galaxy-s24',
    '/best/another-published-guide',
    '/things-to-do/whytecliff-park-west-vancouver-day-trip-guide-2026',
  ]) {
    assert.ok(!redirects.some((item) => item.source === path));
  }
});

test('rendered hubs do not advertise known missing destinations', async () => {
  const redirects = await loadSource('next.config.ts').default.redirects();
  const deadPaths = new Set(redirects.map((item) => item.source));
  for (const path of ['src/app/best/page.tsx', 'src/app/compare/page.tsx']) {
    const page = await loadSource(path).default();
    const html = renderToStaticMarkup(page);
    for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
      assert.ok(!deadPaths.has(href), `Dead hub destination: ${href}`);
    }
  }
});

test('all dimensional publisher logos match the actual PNG', () => {
  const png = readFileSync(new URL('public/images/logo.png', root));
  const expected = {
    url: 'https://www.trendstoday.ca/images/logo.png',
    width: png.readUInt32BE(16),
    height: png.readUInt32BE(20),
  };
  const schemas = [
    loadSource('src/lib/schema.ts').organizationSchema,
    loadSource('src/components/seo/SchemaMarkup.tsx').OrganizationSchema().props
      .schema,
  ];
  const article = loadSource('src/components/seo/ArticleJsonLd.tsx');
  const fixture = {
    headline: 'Synthetic rendering fixture',
    description: 'Offline schema check',
    author: 'Fixture author',
    publishedAt: '2026-10-02T15:00:00Z',
    category: 'things-to-do',
    url: 'https://www.trendstoday.ca/things-to-do/fixture',
  };
  for (const component of [
    article.default,
    article.NewsArticleJsonLd,
    article.BlogPostingJsonLd,
  ]) {
    schemas.push(
      JSON.parse(component(fixture).props.dangerouslySetInnerHTML.__html)
        .publisher
    );
  }
  assert.equal(schemas.length, 5);
  for (const { logo } of schemas) {
    assert.deepEqual(
      { url: logo.url, width: logo.width, height: logo.height },
      expected
    );
  }
});

test('Whytecliff Snapshot renders five labeled facts without Markdown pipes', async () => {
  const { content } = matter(
    read(
      'content/things-to-do/whytecliff-park-west-vancouver-day-trip-guide-2026.mdx'
    )
  );
  const snapshot = content.split('## Snapshot\n')[1].split('\n## ')[0];
  const rendered = await compileMDX({ source: snapshot });
  const html = renderToStaticMarkup(rendered.content);
  assert.equal((html.match(/<li>/g) || []).length, 5);
  const labels = [...html.matchAll(/<li><strong>([^<]+)<\/strong>/g)].map(
    ([, label]) => label
  );
  assert.deepEqual(labels, [
    'Best transit:',
    'Park location:',
    'Easy plan:',
    'Hours honesty:',
    'Parking (if driving):',
  ]);
  for (const fact of ['60885', '54559', '2 km', '15+ hectares', '$5.08/hr']) {
    assert.ok(html.includes(fact), `Missing Snapshot fact: ${fact}`);
  }
  assert.ok(!html.includes('|'));
  assert.ok(!html.includes('---'));
  await compileMDX({ source: content });
});
