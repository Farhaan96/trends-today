import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const page = fs.readFileSync('src/app/[category]/[slug]/page.tsx', 'utf8');
const candidate = fs.readFileSync(
  'artifacts/editorial/release-candidates/things-to-do/delta-christmas-tree-lightings-2026.mdx',
  'utf8'
);
const config = JSON.parse(
  fs.readFileSync('config/content-business.json', 'utf8')
);
const validationWorkflow = fs.readFileSync(
  '.github/workflows/pr-validation.yml',
  'utf8'
);

test('licensed hero credit renders linked source and licence near the hero', () => {
  const heroCredit = page.match(
    /\{!generatedIllustration && imageAttribution[\s\S]*?<p className="article-hero-caption">[\s\S]*?<\/p>[\s\S]*?\) : null\}/
  );
  assert.ok(
    heroCredit,
    'licensed photo credit must render immediately after the hero'
  );
  assert.match(
    heroCredit[0],
    /<a href=\{imageSourceUrl\}>\{imageAttribution\}<\/a>/
  );
  assert.match(
    heroCredit[0],
    /<a href=\{imageLicenseUrl\}>\{imageLicense\}<\/a>/
  );
});

test('Delta candidate carries complete licensed-photo link metadata', () => {
  assert.match(candidate, /^imageSourceType: 'licensed-photo'$/m);
  assert.match(candidate, /^imageAttribution: '.+'$/m);
  assert.match(candidate, /^imageSourceUrl: 'https:\/\/.+'$/m);
  assert.match(candidate, /^imageLicense: 'CC BY 2\.0'$/m);
  assert.match(candidate, /^imageLicenseUrl: 'https:\/\/.+'$/m);
});

test('release config keeps GPT editorial review and authorizes one Codex-reviewed article daily', () => {
  assert.equal(config.release.gptEditorialReviewRequired, true);
  assert.equal(config.release.gptEditorialReviewer, 'openai-gpt');
  assert.equal(config.release.reviewer, 'codex');
  assert.equal(config.release.reviewModel, 'gpt-5.6-sol');
  assert.equal(config.release.reviewBackend, 'codex-cli-oauth');
  assert.equal(config.release.maximumArticlesPerDailyRun, 1);
});

test('PR validation blocks public content without exact-head attestation', () => {
  assert.match(validationWorkflow, /release-head-gate:/);
  assert.match(validationWorkflow, /release-head-attestation/);
  assert.match(validationWorkflow, /changesPublicContent/);
  assert.match(validationWorkflow, /core\.setFailed/);
});
