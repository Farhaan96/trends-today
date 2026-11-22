import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';
const compiled = ts.transpileModule(
  readFileSync(
    new URL('../src/lib/illustration-caption.ts', import.meta.url),
    'utf8'
  ),
  { compilerOptions: { module: ts.ModuleKind.ESNext } }
).outputText;
const { illustrationImageAlt } = await import(
  'data:text/javascript;base64,' + Buffer.from(compiled).toString('base64')
);
const gen = (alt) =>
  illustrationImageAlt(alt, 'T', 'AI-generated illustration', 'generated');

test('prefixes a plain subject once', () => {
  assert.equal(
    gen('An empty chair'),
    'Generated illustration of an empty chair'
  );
});

test('never doubles an author-written label', () => {
  for (const alt of [
    'AI-generated illustration of an empty chair',
    'Generated illustration of an empty chair',
    'Generated editorial illustration of an empty chair',
    'An illustration of an empty chair',
    'Illustration of an empty chair',
  ]) {
    assert.equal(gen(alt), 'Generated illustration of an empty chair', alt);
  }
});

test('leaves official images alone', () => {
  assert.equal(
    illustrationImageAlt('A map of the closure', 'T', 'AI', 'official-map'),
    'A map of the closure'
  );
});

test('keeps proper nouns capitalized', () => {
  assert.equal(
    gen('Generated editorial illustration of Trout Lake in John Hendry Park'),
    'Generated illustration of Trout Lake in John Hendry Park'
  );
});

test('lowercases a common-noun opener and strips watercolor labels', () => {
  assert.equal(
    gen('Moving boxes outside a building'),
    'Generated illustration of moving boxes outside a building'
  );
  assert.equal(
    gen('Japanese festival scene'),
    'Generated illustration of japanese festival scene'
  );
  assert.equal(
    gen('Labeled editorial watercolor of Lynn Canyon suspension bridge'),
    'Generated illustration of Lynn Canyon suspension bridge'
  );
});
