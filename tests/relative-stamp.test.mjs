import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');

function load(sourcePath, overrides = {}) {
  const outputText = ts.transpileModule(read(sourcePath), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  const sourceModule = { exports: {} };
  const sourceRequire = (name) => {
    if (Object.hasOwn(overrides, name)) return overrides[name];
    if (name === 'react') return React;
    return require(name);
  };
  new Function('require', 'module', 'exports', outputText)(
    sourceRequire,
    sourceModule,
    sourceModule.exports
  );
  return sourceModule.exports;
}

const freshness = load('src/lib/freshness.ts');
const RelativeStamp = load('src/components/editorial/RelativeStamp.tsx', {
  '@/lib/freshness': freshness,
  react: React,
}).default;

const story = '2026-10-11T08:52:29-07:00';
const later = '2026-10-15T15:52:29Z';

test('server markup keeps the absolute stamp for crawlers and no-JS readers', () => {
  const absolute = freshness.formatAbsoluteStamp(story);
  assert.equal(absolute, 'Updated Sun Oct 11');
  const html = renderToStaticMarkup(
    React.createElement(RelativeStamp, { iso: story, absolute })
  );
  assert.match(html, /<time dateTime="2026-10-11T08:52:29-07:00">/);
  assert.match(html, />Updated Sun Oct 11</);
  assert.equal(html.includes('ago'), false);
  const header = read('src/lib/site-freshness.ts');
  assert.equal(header.includes('formatAbsoluteStamp(iso)'), true);
  assert.equal(header.includes('formatRelativeUpdate'), false);
  assert.equal(header.includes('formatEditionDate(iso)'), true);
});

test('the browser wording is computed from the same instant after hydration', () => {
  assert.equal(
    freshness.formatRelativeUpdate(story, later),
    'Updated 4 days ago'
  );
  const source = read('src/components/editorial/RelativeStamp.tsx');
  assert.equal(source.includes('useState(absolute)'), true);
  assert.equal(source.includes('formatRelativeUpdate(iso, new Date())'), true);
});
