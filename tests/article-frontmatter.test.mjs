import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

const source = readFileSync(
  new URL('../src/lib/article-frontmatter.ts', import.meta.url),
  'utf8'
);
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext },
}).outputText;
const { validateArticleFrontmatter } = await import(
  'data:text/javascript;base64,' + Buffer.from(compiled).toString('base64')
);

test('heroStyle accepts photoreal or an absent value', () => {
  assert.equal(
    validateArticleFrontmatter({ title: 'Default' }).heroStyle,
    undefined
  );
  assert.equal(
    validateArticleFrontmatter({ title: 'Photo', heroStyle: 'photoreal' })
      .heroStyle,
    'photoreal'
  );
});

test('heroStyle rejects unsupported values', () => {
  assert.throws(
    () =>
      validateArticleFrontmatter({ heroStyle: 'illustration' }, 'fixture.mdx'),
    /Invalid heroStyle in fixture\.mdx/
  );
});
