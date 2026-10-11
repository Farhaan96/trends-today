/**
 * Tests for release candidate receipt generator.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

import {
  checkCIStatus,
  validateGptReview,
  checkSensitiveContent,
  checkOwnerGatedCategories,
  generateReceipt,
  validateReceiptAgainstCurrentState,
  computeFileSha256,
  createArtifactBinding,
} from '../../lib/release-coordinator/receipt-generator.js';
import { DEFAULT_CONFIG } from '../../lib/release-coordinator/config.js';

const mockPRSnapshot = {
  prNumber: 184,
  prUrl: 'https://github.com/Farhaan96/trends-today/pull/184',
  headSha: 'abc123def456789012345678901234567890abcd',
  baseBranch: 'main',
  headBranch: 'feat/cinematic-local-redesign',
  title: 'Cinematic redesign',
  state: 'open',
  isDraft: false,
  labels: ['ready-for-release'],
  checksComplete: true,
  checksAllPassing: true,
  checks: [
    { name: 'build', status: 'completed', conclusion: 'success', completedAt: '2026-09-06T00:00:00Z', detailsUrl: null },
    { name: 'test', status: 'completed', conclusion: 'success', completedAt: '2026-09-06T00:00:00Z', detailsUrl: null },
  ],
  updatedAt: '2026-09-06T00:00:00Z',
  snapshotAt: '2026-09-06T00:00:00Z',
};

const mockGptReview = {
  version: 1,
  reviewer: 'openai-gpt',
  verdict: 'PASS',
  candidateSha256: 'abc123def456789012345678901234567890abcdef1234567890123456789012',
  repositorySha: 'abc123def456789012345678901234567890abcd',
  reviewedAt: '2026-09-06T00:00:00Z',
  modelUsed: 'gpt-5.6-sol',
  reviewBackend: 'codex-cli-oauth',
  reviewRunId: 'test-run-id',
  scores: {
    factualSupport: 5,
    quality: 4,
    readability: 5,
    formatting: 4,
    engagement: 4,
  },
  proseEmDashCount: 0,
  blockers: [],
  summary: 'Test summary',
};

test('checkCIStatus returns all passed when all checks succeed', () => {
  const checks = [
    { name: 'build', status: 'completed', conclusion: 'success', completedAt: '2026-09-06T00:00:00Z', detailsUrl: null },
    { name: 'test', status: 'completed', conclusion: 'success', completedAt: '2026-09-06T00:00:00Z', detailsUrl: null },
  ];
  const result = checkCIStatus(checks);

  assert.equal(result.allPassed, true);
  assert.equal(result.allComplete, true);
  assert.deepEqual(result.failedChecks, []);
  assert.deepEqual(result.pendingChecks, []);
});

test('checkCIStatus detects failed checks', () => {
  const checks = [
    { name: 'build', status: 'completed', conclusion: 'success', completedAt: '2026-09-06T00:00:00Z', detailsUrl: null },
    { name: 'test', status: 'completed', conclusion: 'failure', completedAt: '2026-09-06T00:00:00Z', detailsUrl: null },
  ];
  const result = checkCIStatus(checks);

  assert.equal(result.allPassed, false);
  assert.equal(result.allComplete, true);
  assert.deepEqual(result.failedChecks, ['test']);
});

test('checkCIStatus detects pending checks', () => {
  const checks = [
    { name: 'build', status: 'completed', conclusion: 'success', completedAt: '2026-09-06T00:00:00Z', detailsUrl: null },
    { name: 'test', status: 'in_progress', conclusion: null, completedAt: null, detailsUrl: null },
  ];
  const result = checkCIStatus(checks);

  assert.equal(result.allPassed, false);
  assert.equal(result.allComplete, false);
  assert.deepEqual(result.pendingChecks, ['test']);
});

test('checkCIStatus treats skipped as passing', () => {
  const checks = [
    { name: 'build', status: 'completed', conclusion: 'skipped', completedAt: '2026-09-06T00:00:00Z', detailsUrl: null },
  ];
  const result = checkCIStatus(checks);

  assert.equal(result.allPassed, true);
});

test('validateGptReview accepts valid review', () => {
  const result = validateGptReview(
    mockGptReview,
    mockGptReview.candidateSha256,
    mockGptReview.repositorySha
  );

  assert.equal(result.valid, true);
  assert.deepEqual(result.reasons, []);
});

test('validateGptReview rejects null review', () => {
  const result = validateGptReview(null, 'sha256', 'repoSha');

  assert.equal(result.valid, false);
  assert.ok(result.reasons.some(r => r.includes('not found')));
});

test('validateGptReview rejects FAIL verdict', () => {
  const review = { ...mockGptReview, verdict: 'FAIL' };
  const result = validateGptReview(review, review.candidateSha256, review.repositorySha);

  assert.equal(result.valid, false);
  assert.ok(result.reasons.some(r => r.includes('FAIL')));
});

test('validateGptReview rejects low scores', () => {
  const review = { ...mockGptReview, scores: { ...mockGptReview.scores, quality: 3 } };
  const result = validateGptReview(review, review.candidateSha256, review.repositorySha);

  assert.equal(result.valid, false);
  assert.ok(result.reasons.some(r => r.includes('quality score 3')));
});

test('validateGptReview rejects em-dashes', () => {
  const review = { ...mockGptReview, proseEmDashCount: 2 };
  const result = validateGptReview(review, review.candidateSha256, review.repositorySha);

  assert.equal(result.valid, false);
  assert.ok(result.reasons.some(r => r.includes('em-dash')));
});

test('validateGptReview rejects blockers', () => {
  const review = { ...mockGptReview, blockers: ['Some blocker'] };
  const result = validateGptReview(review, review.candidateSha256, review.repositorySha);

  assert.equal(result.valid, false);
  assert.ok(result.reasons.some(r => r.includes('blockers')));
});

test('validateGptReview rejects SHA mismatch', () => {
  const result = validateGptReview(mockGptReview, 'wrong-sha', mockGptReview.repositorySha);

  assert.equal(result.valid, false);
  assert.ok(result.reasons.some(r => r.includes('Candidate SHA mismatch')));
});

test('checkSensitiveContent detects sensitive keywords', () => {
  const result = checkSensitiveContent('Crime report', 'A man was arrested', ['crime', 'arrest']);

  assert.equal(result.found, true);
  assert.ok(result.matches.includes('crime'));
  assert.ok(result.matches.includes('arrest'));
});

test('checkSensitiveContent returns empty when no matches', () => {
  const result = checkSensitiveContent('Weather update', 'Sunny tomorrow', ['crime', 'arrest']);

  assert.equal(result.found, false);
  assert.deepEqual(result.matches, []);
});

test('checkOwnerGatedCategories detects gated categories in labels', () => {
  const result = checkOwnerGatedCategories(['sponsored', 'ready'], '', ['sponsored', 'branded']);

  assert.equal(result.gated, true);
  assert.ok(result.matches.includes('sponsored'));
});

test('checkOwnerGatedCategories detects gated categories in body', () => {
  const result = checkOwnerGatedCategories([], 'This is sponsored content', ['sponsored']);

  assert.equal(result.gated, true);
  assert.ok(result.matches.includes('sponsored'));
});

test('generateReceipt creates valid receipt for passing PR', () => {
  const receipt = generateReceipt({
    prSnapshot: mockPRSnapshot,
    implementerAgentId: 'agent-123',
    implementerSessionId: 'session-456',
    ciRunUrl: 'https://github.com/run/123',
    visualQaEvidence: {
      completed: true,
      desktopPassed: true,
      mobilePassed: true,
      consolePassed: true,
      interactionPassed: true,
      screenshotPaths: [],
      reportPath: null,
      completedAt: '2026-09-06T00:00:00Z',
      agentId: 'qa-agent',
    },
    gptReview: mockGptReview,
    gptReviewArtifactPath: null,
    candidateArtifactPaths: [],
    config: DEFAULT_CONFIG,
    prBody: 'Normal PR body',
  });

  assert.equal(receipt.version, 1);
  assert.equal(receipt.prNumber, 184);
  assert.equal(receipt.exactHeadSha, mockPRSnapshot.headSha);
  assert.equal(receipt.eligibilityChecks.allPassed, true);
  assert.equal(receipt.status, 'pending_review');
});

test('generateReceipt fails for draft PR', () => {
  const draftSnapshot = { ...mockPRSnapshot, isDraft: true };
  const receipt = generateReceipt({
    prSnapshot: draftSnapshot,
    implementerAgentId: null,
    implementerSessionId: null,
    ciRunUrl: null,
    visualQaEvidence: null,
    gptReview: null,
    gptReviewArtifactPath: null,
    candidateArtifactPaths: [],
    config: DEFAULT_CONFIG,
    prBody: '',
  });

  assert.equal(receipt.eligibilityChecks.stableHead, false);
  assert.equal(receipt.status, 'failed');
});

test('generateReceipt fails for sensitive content', () => {
  const receipt = generateReceipt({
    prSnapshot: mockPRSnapshot,
    implementerAgentId: null,
    implementerSessionId: null,
    ciRunUrl: null,
    visualQaEvidence: {
      completed: true,
      desktopPassed: true,
      mobilePassed: true,
      consolePassed: true,
      interactionPassed: true,
      screenshotPaths: [],
      reportPath: null,
      completedAt: '2026-09-06T00:00:00Z',
      agentId: 'qa-agent',
    },
    gptReview: mockGptReview,
    gptReviewArtifactPath: null,
    candidateArtifactPaths: [],
    config: DEFAULT_CONFIG,
    prBody: 'This article discusses a crime investigation',
  });

  assert.equal(receipt.eligibilityChecks.notSensitive, false);
  assert.equal(receipt.status, 'failed');
});

test('validateReceiptAgainstCurrentState detects stale HEAD', () => {
  const receipt = generateReceipt({
    prSnapshot: mockPRSnapshot,
    implementerAgentId: null,
    implementerSessionId: null,
    ciRunUrl: null,
    visualQaEvidence: {
      completed: true,
      desktopPassed: true,
      mobilePassed: true,
      consolePassed: true,
      interactionPassed: true,
      screenshotPaths: [],
      reportPath: null,
      completedAt: '2026-09-06T00:00:00Z',
      agentId: 'qa-agent',
    },
    gptReview: mockGptReview,
    gptReviewArtifactPath: null,
    candidateArtifactPaths: [],
    config: DEFAULT_CONFIG,
    prBody: '',
  });

  const newSnapshot = { ...mockPRSnapshot, headSha: 'different-sha-123456789012345678901234' };
  const result = validateReceiptAgainstCurrentState(receipt, newSnapshot);

  assert.equal(result.valid, false);
  assert.ok(result.reasons.some(r => r.includes('HEAD SHA changed')));
});

test('computeFileSha256 computes correct hash', () => {
  const tempDir = mkdtempSync(join(tmpdir(), 'receipt-test-'));
  const testFile = join(tempDir, 'test.txt');
  writeFileSync(testFile, 'test content');

  try {
    const hash = computeFileSha256(testFile);
    assert.equal(typeof hash, 'string');
    assert.equal(hash.length, 64);
  } finally {
    rmSync(tempDir, { recursive: true });
  }
});

test('createArtifactBinding returns null for missing file', () => {
  const result = createArtifactBinding('/nonexistent/file.txt');
  assert.equal(result, null);
});

test('createArtifactBinding creates valid binding', () => {
  const tempDir = mkdtempSync(join(tmpdir(), 'binding-test-'));
  const testFile = join(tempDir, 'artifact.json');
  writeFileSync(testFile, '{"test": true}');

  try {
    const binding = createArtifactBinding(testFile);
    assert.ok(binding);
    assert.equal(binding.path, testFile);
    assert.equal(binding.sha256.length, 64);
    assert.equal(binding.size, 14);
  } finally {
    rmSync(tempDir, { recursive: true });
  }
});
