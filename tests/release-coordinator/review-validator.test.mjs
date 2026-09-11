/**
 * Tests for review validator.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

import {
  validateReviewStructure,
  validateShaBindings,
  validateModelProvenance,
  validateReviewerSeparation,
  validateArtifactHashes,
  validateVerdict,
  loadReviewArtifact,
  validateReview,
} from '../../lib/release-coordinator/review-validator.js';

const mockClaudeReview = {
  version: 1,
  reviewer: 'claude',
  verdict: 'NO BLOCKERS',
  candidateSha256: 'abc123def456789012345678901234567890abcdef1234567890123456789012',
  reviewedAt: '2026-09-06T00:00:00Z',
  repositorySha: 'abc123def456789012345678901234567890abcd',
  modelUsed: 'claude-opus-5',
  observedModels: ['claude-haiku-4-5-20251001', 'claude-opus-5'],
  fallbackDisabled: true,
  fallbackUsed: false,
  runnerStatus: 'success',
  runnerOutput: '/path/to/output.json',
  review: 'Independent exact-SHA review passed with no blockers.',
};

const mockDispatch = {
  version: 1,
  dispatchId: 'dispatch-123',
  createdAt: '2026-09-06T00:00:00Z',
  receiptId: 'receipt-123',
  prNumber: 184,
  exactHeadSha: 'abc123def456789012345678901234567890abcd',
  targetModel: 'claude-opus-5-thinking-medium',
  reviewerAgentId: 'reviewer-agent-789',
  reviewerSessionUrl: 'https://cursor.com/agents/session-789',
  implementerAgentId: 'implementer-agent-123',
  separationVerified: true,
  modelVerified: true,
  prompt: 'Review prompt',
  timeoutMinutes: 30,
  dispatchedBy: 'coordinator',
};

const mockReceipt = {
  version: 1,
  receiptId: 'receipt-123',
  createdAt: '2026-09-06T00:00:00Z',
  prNumber: 184,
  prUrl: 'https://github.com/Farhaan96/trends-today/pull/184',
  repositoryFullName: 'Farhaan96/trends-today',
  exactHeadSha: 'abc123def456789012345678901234567890abcd',
  baseBranch: 'main',
  headBranch: 'feat/cinematic-local-redesign',
  implementerAgentId: 'implementer-agent-123',
  implementerSessionId: 'session-456',
  ciEvidence: { allChecksPassed: true, checks: [], ciRunUrl: null, capturedAt: '2026-09-06T00:00:00Z' },
  visualQaEvidence: null,
  gptEditorialEvidence: null,
  candidateArtifacts: [
    {
      path: 'content/article.mdx',
      sha256: 'abc123def456789012345678901234567890abcdef1234567890123456789012',
      size: 1000,
      capturedAt: '2026-09-06T00:00:00Z',
    },
  ],
  eligibilityChecks: {
    stableHead: true,
    ciPassed: true,
    visualQaPassed: true,
    gptEditorialPassed: true,
    notSensitive: true,
    notOwnerGated: true,
    allPassed: true,
    failureReasons: [],
  },
  status: 'review_dispatched',
};

test('validateReviewStructure accepts valid review', () => {
  const result = validateReviewStructure(mockClaudeReview);

  assert.equal(result.valid, true);
  assert.deepEqual(result.reasons, []);
  assert.ok(result.parsed);
});

test('validateReviewStructure rejects null', () => {
  const result = validateReviewStructure(null);

  assert.equal(result.valid, false);
  assert.ok(result.reasons.some(r => r.includes('must be an object')));
});

test('validateReviewStructure rejects invalid version', () => {
  const review = { ...mockClaudeReview, version: 2 };
  const result = validateReviewStructure(review);

  assert.equal(result.valid, false);
  assert.ok(result.reasons.some(r => r.includes('Invalid version')));
});

test('validateReviewStructure rejects invalid reviewer', () => {
  const review = { ...mockClaudeReview, reviewer: 'openai' };
  const result = validateReviewStructure(review);

  assert.equal(result.valid, false);
  assert.ok(result.reasons.some(r => r.includes('Invalid reviewer')));
});

test('validateReviewStructure rejects invalid verdict', () => {
  const review = { ...mockClaudeReview, verdict: 'PASS' };
  const result = validateReviewStructure(review);

  assert.equal(result.valid, false);
  assert.ok(result.reasons.some(r => r.includes('Invalid verdict')));
});

test('validateReviewStructure rejects invalid candidateSha256', () => {
  const review = { ...mockClaudeReview, candidateSha256: 'short' };
  const result = validateReviewStructure(review);

  assert.equal(result.valid, false);
  assert.ok(result.reasons.some(r => r.includes('candidateSha256')));
});

test('validateReviewStructure rejects empty review text', () => {
  const review = { ...mockClaudeReview, review: '' };
  const result = validateReviewStructure(review);

  assert.equal(result.valid, false);
  assert.ok(result.reasons.some(r => r.includes('empty review')));
});

test('validateShaBindings accepts matching SHA', () => {
  const result = validateShaBindings(mockClaudeReview, mockDispatch);

  assert.equal(result.valid, true);
  assert.deepEqual(result.reasons, []);
});

test('validateShaBindings rejects mismatched SHA', () => {
  const review = { ...mockClaudeReview, repositorySha: 'different-sha-123456789012345678' };
  const result = validateShaBindings(review, mockDispatch);

  assert.equal(result.valid, false);
  assert.ok(result.reasons.some(r => r.includes('Repository SHA mismatch')));
});

test('validateModelProvenance accepts Opus 5', () => {
  const result = validateModelProvenance(mockClaudeReview, mockDispatch.targetModel);

  assert.equal(result.valid, true);
  assert.equal(result.modelMatches, true);
});

test('validateModelProvenance rejects non-Opus model', () => {
  const review = { ...mockClaudeReview, modelUsed: 'claude-sonnet-5', observedModels: ['claude-sonnet-5'] };
  const result = validateModelProvenance(review, mockDispatch.targetModel);

  assert.equal(result.valid, false);
  assert.ok(result.reasons.some(r => r.includes('not an Opus 5 variant')));
});

test('validateReviewerSeparation accepts different agents', () => {
  const result = validateReviewerSeparation(mockDispatch, 'reviewer-agent-789');

  assert.equal(result.valid, true);
  assert.equal(result.selfReview, false);
});

test('validateReviewerSeparation detects self-review', () => {
  const result = validateReviewerSeparation(mockDispatch, 'implementer-agent-123');

  assert.equal(result.valid, false);
  assert.equal(result.selfReview, true);
});

test('validateArtifactHashes accepts matching hashes', () => {
  const result = validateArtifactHashes(mockClaudeReview, mockReceipt);

  assert.equal(result.valid, true);
  assert.deepEqual(result.reasons, []);
});

test('validateArtifactHashes rejects mismatched hashes', () => {
  const review = { ...mockClaudeReview, candidateSha256: 'different123456789012345678901234567890123456789012345678901234' };
  const result = validateArtifactHashes(review, mockReceipt);

  assert.equal(result.valid, false);
  assert.ok(result.reasons.some(r => r.includes('hash mismatch')));
});

test('validateVerdict accepts NO BLOCKERS with success status', () => {
  const result = validateVerdict(mockClaudeReview);

  assert.equal(result.passed, true);
  assert.equal(result.verdict, 'NO BLOCKERS');
});

test('validateVerdict rejects BLOCKERS verdict', () => {
  const review = { ...mockClaudeReview, verdict: 'BLOCKERS' };
  const result = validateVerdict(review);

  assert.equal(result.passed, false);
  assert.ok(result.reasons.some(r => r.includes('BLOCKERS')));
});

test('validateVerdict rejects failure runner status', () => {
  const review = { ...mockClaudeReview, runnerStatus: 'failure' };
  const result = validateVerdict(review);

  assert.equal(result.passed, false);
  assert.ok(result.reasons.some(r => r.includes('failure')));
});

test('loadReviewArtifact returns error for missing file', () => {
  const result = loadReviewArtifact('/nonexistent/path.json');

  assert.equal(result.loaded, false);
  assert.equal(result.review, null);
  assert.ok(result.error?.includes('not found'));
});

test('loadReviewArtifact loads valid artifact', () => {
  const tempDir = mkdtempSync(join(tmpdir(), 'review-test-'));
  const artifactPath = join(tempDir, 'review.json');
  writeFileSync(artifactPath, JSON.stringify(mockClaudeReview));

  try {
    const result = loadReviewArtifact(artifactPath);

    assert.equal(result.loaded, true);
    assert.ok(result.review);
    assert.equal(result.review.verdict, 'NO BLOCKERS');
    assert.ok(result.sha256);
  } finally {
    rmSync(tempDir, { recursive: true });
  }
});

test('loadReviewArtifact rejects invalid JSON', () => {
  const tempDir = mkdtempSync(join(tmpdir(), 'review-test-'));
  const artifactPath = join(tempDir, 'review.json');
  writeFileSync(artifactPath, 'not valid json');

  try {
    const result = loadReviewArtifact(artifactPath);

    assert.equal(result.loaded, false);
    assert.ok(result.error?.includes('Failed to parse'));
  } finally {
    rmSync(tempDir, { recursive: true });
  }
});

test('validateReview returns passing completion for valid review', () => {
  const tempDir = mkdtempSync(join(tmpdir(), 'review-test-'));
  const artifactPath = join(tempDir, 'review.json');
  writeFileSync(artifactPath, JSON.stringify(mockClaudeReview));

  try {
    const completion = validateReview({
      dispatch: mockDispatch,
      receipt: mockReceipt,
      reviewArtifactPath: artifactPath,
      reviewerAgentId: 'reviewer-agent-789',
    });

    assert.equal(completion.passed, true);
    assert.equal(completion.verdict, 'NO BLOCKERS');
    assert.equal(completion.selfReviewDetected, false);
    assert.deepEqual(completion.failureReasons, []);
  } finally {
    rmSync(tempDir, { recursive: true });
  }
});

test('validateReview returns failing completion for self-review', () => {
  const tempDir = mkdtempSync(join(tmpdir(), 'review-test-'));
  const artifactPath = join(tempDir, 'review.json');
  writeFileSync(artifactPath, JSON.stringify(mockClaudeReview));

  try {
    const completion = validateReview({
      dispatch: mockDispatch,
      receipt: mockReceipt,
      reviewArtifactPath: artifactPath,
      reviewerAgentId: 'implementer-agent-123',
    });

    assert.equal(completion.passed, false);
    assert.equal(completion.selfReviewDetected, true);
    assert.ok(completion.failureReasons.some(r => r.includes('Self-review')));
  } finally {
    rmSync(tempDir, { recursive: true });
  }
});

test('validateReview returns failing completion for missing artifact', () => {
  const completion = validateReview({
    dispatch: mockDispatch,
    receipt: mockReceipt,
    reviewArtifactPath: '/nonexistent/review.json',
    reviewerAgentId: 'reviewer-agent-789',
  });

  assert.equal(completion.passed, false);
  assert.ok(completion.failureReasons.some(r => r.includes('not found')));
});
