/**
 * Tests for independent reviewer dispatcher.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import {
  generateReviewPrompt,
  validateReviewerSeparation,
  validateTargetModel,
  createDispatchRecord,
  validateDispatchAgainstReceipt,
  isDispatchTimedOut,
  getReviewArtifactPath,
} from '../../lib/release-coordinator/reviewer-dispatcher.js';
import { DEFAULT_CONFIG } from '../../lib/release-coordinator/config.js';

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
  ciEvidence: {
    allChecksPassed: true,
    checks: [],
    ciRunUrl: 'https://github.com/run/123',
    capturedAt: '2026-09-06T00:00:00Z',
  },
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
  gptEditorialEvidence: {
    passed: true,
    artifactPath: 'artifacts/reviews/gpt.json',
    artifactSha256: 'abc123',
    scores: { factualSupport: 5, quality: 4, readability: 5, formatting: 4, engagement: 4 },
    proseEmDashCount: 0,
  },
  candidateArtifacts: [
    { path: 'content/article.mdx', sha256: 'def456', size: 1000, capturedAt: '2026-09-06T00:00:00Z' },
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
  status: 'pending_review',
};

test('generateReviewPrompt includes all binding information', () => {
  const prompt = generateReviewPrompt(mockReceipt);

  assert.ok(prompt.includes(mockReceipt.prUrl));
  assert.ok(prompt.includes(mockReceipt.exactHeadSha));
  assert.ok(prompt.includes(mockReceipt.receiptId));
  assert.ok(prompt.includes(mockReceipt.repositoryFullName));
  assert.ok(prompt.includes('NO BLOCKERS'));
  assert.ok(prompt.includes('BLOCKERS'));
});

test('generateReviewPrompt includes artifact hashes', () => {
  const prompt = generateReviewPrompt(mockReceipt);

  assert.ok(prompt.includes('content/article.mdx'));
  assert.ok(prompt.includes('def456'));
});

test('validateReviewerSeparation accepts different agents', () => {
  const result = validateReviewerSeparation('agent-123', 'agent-456');

  assert.equal(result.valid, true);
  assert.equal(result.reason, null);
});

test('validateReviewerSeparation accepts null implementer', () => {
  const result = validateReviewerSeparation(null, 'agent-456');

  assert.equal(result.valid, true);
});

test('validateReviewerSeparation rejects self-review', () => {
  const result = validateReviewerSeparation('agent-123', 'agent-123');

  assert.equal(result.valid, false);
  assert.ok(result.reason?.includes('Self-review'));
});

test('validateTargetModel accepts valid Opus 5 models', () => {
  const result = validateTargetModel('claude-opus-5-thinking-medium');

  assert.equal(result.valid, true);
  assert.equal(result.reason, null);
});

test('validateTargetModel rejects invalid models', () => {
  const result = validateTargetModel('gpt-4');

  assert.equal(result.valid, false);
  assert.ok(result.reason?.includes('not an authorized Opus 5'));
});

test('createDispatchRecord creates valid record', () => {
  const { record, error } = createDispatchRecord({
    receipt: mockReceipt,
    config: DEFAULT_CONFIG,
    reviewerAgentId: 'reviewer-agent-789',
    reviewerSessionUrl: 'https://cursor.com/agents/session-789',
    dispatchedBy: 'coordinator',
  });

  assert.equal(error, null);
  assert.ok(record);
  assert.equal(record.receiptId, mockReceipt.receiptId);
  assert.equal(record.prNumber, mockReceipt.prNumber);
  assert.equal(record.exactHeadSha, mockReceipt.exactHeadSha);
  assert.equal(record.separationVerified, true);
  assert.equal(record.modelVerified, true);
});

test('createDispatchRecord rejects self-review', () => {
  const { record, error } = createDispatchRecord({
    receipt: mockReceipt,
    config: DEFAULT_CONFIG,
    reviewerAgentId: 'implementer-agent-123',
    reviewerSessionUrl: 'https://cursor.com/agents/session',
    dispatchedBy: 'coordinator',
  });

  assert.equal(record, null);
  assert.ok(error?.includes('Self-review'));
});

test('createDispatchRecord rejects non-pending receipt', () => {
  const failedReceipt = { ...mockReceipt, status: 'failed' };
  const { record, error } = createDispatchRecord({
    receipt: failedReceipt,
    config: DEFAULT_CONFIG,
    reviewerAgentId: 'reviewer-agent-789',
    reviewerSessionUrl: 'https://cursor.com/agents/session',
    dispatchedBy: 'coordinator',
  });

  assert.equal(record, null);
  assert.ok(error?.includes('status is failed'));
});

test('createDispatchRecord rejects failed eligibility', () => {
  const ineligibleReceipt = {
    ...mockReceipt,
    eligibilityChecks: { ...mockReceipt.eligibilityChecks, allPassed: false, failureReasons: ['CI failed'] },
  };
  const { record, error } = createDispatchRecord({
    receipt: ineligibleReceipt,
    config: DEFAULT_CONFIG,
    reviewerAgentId: 'reviewer-agent-789',
    reviewerSessionUrl: 'https://cursor.com/agents/session',
    dispatchedBy: 'coordinator',
  });

  assert.equal(record, null);
  assert.ok(error?.includes('CI failed'));
});

test('validateDispatchAgainstReceipt accepts matching dispatch', () => {
  const { record } = createDispatchRecord({
    receipt: mockReceipt,
    config: DEFAULT_CONFIG,
    reviewerAgentId: 'reviewer-agent-789',
    reviewerSessionUrl: 'https://cursor.com/agents/session',
    dispatchedBy: 'coordinator',
  });

  const result = validateDispatchAgainstReceipt(record, mockReceipt);

  assert.equal(result.valid, true);
  assert.deepEqual(result.reasons, []);
});

test('validateDispatchAgainstReceipt rejects receipt ID mismatch', () => {
  const { record } = createDispatchRecord({
    receipt: mockReceipt,
    config: DEFAULT_CONFIG,
    reviewerAgentId: 'reviewer-agent-789',
    reviewerSessionUrl: 'https://cursor.com/agents/session',
    dispatchedBy: 'coordinator',
  });

  const differentReceipt = { ...mockReceipt, receiptId: 'different-id' };
  const result = validateDispatchAgainstReceipt(record, differentReceipt);

  assert.equal(result.valid, false);
  assert.ok(result.reasons.some(r => r.includes('Receipt ID mismatch')));
});

test('isDispatchTimedOut returns false for recent dispatch', () => {
  const { record } = createDispatchRecord({
    receipt: mockReceipt,
    config: DEFAULT_CONFIG,
    reviewerAgentId: 'reviewer-agent-789',
    reviewerSessionUrl: 'https://cursor.com/agents/session',
    dispatchedBy: 'coordinator',
  });

  assert.equal(isDispatchTimedOut(record), false);
});

test('isDispatchTimedOut returns true for old dispatch', () => {
  const { record } = createDispatchRecord({
    receipt: mockReceipt,
    config: DEFAULT_CONFIG,
    reviewerAgentId: 'reviewer-agent-789',
    reviewerSessionUrl: 'https://cursor.com/agents/session',
    dispatchedBy: 'coordinator',
  });

  const oldDispatch = {
    ...record,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    timeoutMinutes: 30,
  };

  assert.equal(isDispatchTimedOut(oldDispatch), true);
});

test('getReviewArtifactPath returns correct path', () => {
  const path = getReviewArtifactPath('receipt-123');
  assert.equal(path, 'artifacts/editorial/reviews/release/receipt-123.json');
});
