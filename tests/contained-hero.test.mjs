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
const { isContainedCivicHero } = await import(
  'data:text/javascript;base64,' + Buffer.from(compiled).toString('base64')
);

test('official and map heroes stay uncropped', () => {
  assert.equal(isContainedCivicHero('official-map'), true);
  assert.equal(isContainedCivicHero('official'), true);
  assert.equal(isContainedCivicHero('official-logo'), true);
  assert.equal(isContainedCivicHero('official-source'), true);
  assert.equal(
    isContainedCivicHero(
      undefined,
      '/images/editorial/2026/10/london-street-route-design-map.jpg'
    ),
    true
  );
});

test('generated and photo heroes keep a cover crop', () => {
  assert.equal(isContainedCivicHero('generated'), false);
  assert.equal(isContainedCivicHero('official-photo'), false);
  assert.equal(isContainedCivicHero('licensed-photo'), false);
  assert.equal(
    isContainedCivicHero('generated', '/images/editorial/park-map.webp'),
    false
  );
  assert.equal(
    isContainedCivicHero(undefined, '/images/editorial/park.webp'),
    false
  );
});
