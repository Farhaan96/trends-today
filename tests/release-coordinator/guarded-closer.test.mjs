/**
 * Tests for guarded closer.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import {
  validatePreCloseConditions,
  validateDeploymentMatch,
  createRollbackInstructions,
  createCloseRecord,
  updateCloseRecordAfterMerge,
  updateCloseRecordMergeFailed,
  updateCloseRecordAfterDeployment,
  updateCloseRecordDeploymentFailed,
  updateCloseRecordAfterVerification,
  canProceedWithClose,
  wasMergeSuccessful,
  wasDeploymentSuccessful,
  wasVerificationSuccessful,
  determineOutcome,
} from '../../lib/release-coordinator/guarded-closer.js';
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
  ciEvidence: { allChecksPassed: true, checks: [], ciRunUrl: null, capturedAt: '2026-09-06T00:00:00Z' },
  visualQaEvidence: null,
  gptEditorialEvidence: null,
  candidateArtifacts: [],
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
  status: 'review_complete',
};

const mockReviewCompletion = {
  version: 1,
  completionId: 'completion-123',
  createdAt: '2026-09-06T00:00:00Z',
  dispatchId: 'dispatch-123',
  receiptId: 'receipt-123',
  prNumber: 184,
  exactHeadSha: 'abc123def456789012345678901234567890abcd',
  reviewerAgentId: 'reviewer-agent-789',
  actualModelUsed: 'claude-opus-5',
  modelMatchesTarget: true,
  selfReviewDetected: false,
  reviewArtifactPath: 'artifacts/review.json',
  reviewArtifactSha256: 'reviewhash123',
  verdict: 'NO BLOCKERS',
  headShaMatches: true,
  artifactHashesMatch: true,
  passed: true,
  failureReasons: [],
};

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
  ],
  updatedAt: '2026-09-06T00:00:00Z',
  snapshotAt: '2026-09-06T00:00:00Z',
};

test('validatePreCloseConditions passes when all conditions met', () => {
  const result = validatePreCloseConditions(
    mockReceipt,
    mockReviewCompletion,
    mockPRSnapshot,
    DEFAULT_CONFIG
  );

  assert.equal(result.allPassed, true);
  assert.equal(result.headStillCurrent, true);
  assert.equal(result.reviewStillValid, true);
  assert.equal(result.ciStillPassing, true);
  assert.deepEqual(result.failureReasons, []);
});

test('validatePreCloseConditions detects stale HEAD', () => {
  const staleSnapshot = { ...mockPRSnapshot, headSha: 'different-sha-123456789012345678901234' };
  const result = validatePreCloseConditions(
    mockReceipt,
    mockReviewCompletion,
    staleSnapshot,
    DEFAULT_CONFIG
  );

  assert.equal(result.allPassed, false);
  assert.equal(result.headStillCurrent, false);
  assert.ok(result.failureReasons.some(r => r.includes('HEAD SHA changed')));
});

test('validatePreCloseConditions detects failing CI', () => {
  const failingSnapshot = {
    ...mockPRSnapshot,
    checks: [{ name: 'build', status: 'completed', conclusion: 'failure', completedAt: '2026-09-06T00:00:00Z', detailsUrl: null }],
  };
  const result = validatePreCloseConditions(
    mockReceipt,
    mockReviewCompletion,
    failingSnapshot,
    DEFAULT_CONFIG
  );

  assert.equal(result.allPassed, false);
  assert.equal(result.ciStillPassing, false);
  assert.ok(result.failureReasons.some(r => r.includes('CI checks now failing')));
});

test('validatePreCloseConditions detects failed review', () => {
  const failedReview = { ...mockReviewCompletion, passed: false, failureReasons: ['Review failed'] };
  const result = validatePreCloseConditions(
    mockReceipt,
    failedReview,
    mockPRSnapshot,
    DEFAULT_CONFIG
  );

  assert.equal(result.allPassed, false);
  assert.equal(result.reviewStillValid, false);
});

test('validateDeploymentMatch accepts matching deployment', () => {
  const deployment = {
    id: 'deploy-123',
    url: 'https://trendstoday.ca',
    state: 'READY',
    createdAt: '2026-09-06T00:00:00Z',
    readyAt: '2026-09-06T00:05:00Z',
    buildingAt: '2026-09-06T00:01:00Z',
    meta: { githubCommitSha: 'abc123def456789012345678901234567890abcd' },
    target: 'production',
  };
  const result = validateDeploymentMatch(deployment, 'abc123def456789012345678901234567890abcd');

  assert.equal(result.matches, true);
  assert.equal(result.reason, null);
});

test('validateDeploymentMatch rejects missing SHA', () => {
  const deployment = {
    id: 'deploy-123',
    url: 'https://trendstoday.ca',
    state: 'READY',
    createdAt: '2026-09-06T00:00:00Z',
    readyAt: '2026-09-06T00:05:00Z',
    buildingAt: '2026-09-06T00:01:00Z',
    meta: {},
    target: 'production',
  };
  const result = validateDeploymentMatch(deployment, 'abc123def456789012345678901234567890abcd');

  assert.equal(result.matches, false);
  assert.ok(result.reason?.includes('no GitHub commit SHA'));
});

test('validateDeploymentMatch rejects wrong SHA', () => {
  const deployment = {
    id: 'deploy-123',
    url: 'https://trendstoday.ca',
    state: 'READY',
    createdAt: '2026-09-06T00:00:00Z',
    readyAt: '2026-09-06T00:05:00Z',
    buildingAt: '2026-09-06T00:01:00Z',
    meta: { githubCommitSha: 'different123456789012345678901234567890' },
    target: 'production',
  };
  const result = validateDeploymentMatch(deployment, 'abc123def456789012345678901234567890abcd');

  assert.equal(result.matches, false);
  assert.ok(result.reason?.includes('does not match'));
});

test('validateDeploymentMatch rejects non-READY state', () => {
  const deployment = {
    id: 'deploy-123',
    url: 'https://trendstoday.ca',
    state: 'BUILDING',
    createdAt: '2026-09-06T00:00:00Z',
    readyAt: null,
    buildingAt: '2026-09-06T00:01:00Z',
    meta: { githubCommitSha: 'abc123def456789012345678901234567890abcd' },
    target: 'production',
  };
  const result = validateDeploymentMatch(deployment, 'abc123def456789012345678901234567890abcd');

  assert.equal(result.matches, false);
  assert.ok(result.reason?.includes('BUILDING'));
});

test('createRollbackInstructions includes all required info', () => {
  const instructions = createRollbackInstructions(184, 'merge123', 'previous456');

  assert.ok(instructions.includes('184'));
  assert.ok(instructions.includes('merge123'));
  assert.ok(instructions.includes('previous456'));
  assert.ok(instructions.includes('git revert'));
});

test('createCloseRecord creates valid record', () => {
  const closeRecord = createCloseRecord({
    receipt: mockReceipt,
    reviewCompletion: mockReviewCompletion,
    currentPrSnapshot: mockPRSnapshot,
    config: DEFAULT_CONFIG,
    previousMainSha: 'previous-main-sha',
  });

  assert.equal(closeRecord.version, 1);
  assert.equal(closeRecord.receiptId, mockReceipt.receiptId);
  assert.equal(closeRecord.prNumber, mockReceipt.prNumber);
  assert.equal(closeRecord.preCloseChecks.allPassed, true);
  assert.equal(closeRecord.mergeEvidence.merged, false);
});

test('updateCloseRecordAfterMerge updates merge evidence', () => {
  const closeRecord = createCloseRecord({
    receipt: mockReceipt,
    reviewCompletion: mockReviewCompletion,
    currentPrSnapshot: mockPRSnapshot,
    config: DEFAULT_CONFIG,
    previousMainSha: 'previous-main-sha',
  });

  const updated = updateCloseRecordAfterMerge(closeRecord, 'merge-sha-123', 'github-actions[bot]');

  assert.equal(updated.mergeEvidence.merged, true);
  assert.equal(updated.mergeEvidence.mergeSha, 'merge-sha-123');
  assert.equal(updated.mergeEvidence.mergedBy, 'github-actions[bot]');
  assert.ok(updated.rollbackEvidence.rollbackInstructions.includes('merge-sha-123'));
});

test('updateCloseRecordMergeFailed updates with failure reason', () => {
  const closeRecord = createCloseRecord({
    receipt: mockReceipt,
    reviewCompletion: mockReviewCompletion,
    currentPrSnapshot: mockPRSnapshot,
    config: DEFAULT_CONFIG,
    previousMainSha: 'previous-main-sha',
  });

  const updated = updateCloseRecordMergeFailed(closeRecord, 'Merge conflict');

  assert.equal(updated.mergeEvidence.merged, false);
  assert.equal(updated.mergeEvidence.failureReason, 'Merge conflict');
});

test('updateCloseRecordAfterDeployment updates deployment evidence', () => {
  const closeRecord = createCloseRecord({
    receipt: mockReceipt,
    reviewCompletion: mockReviewCompletion,
    currentPrSnapshot: mockPRSnapshot,
    config: DEFAULT_CONFIG,
    previousMainSha: 'previous-main-sha',
  });

  const merged = updateCloseRecordAfterMerge(closeRecord, 'merge-sha-123', 'bot');
  const deployment = {
    id: 'deploy-123',
    url: 'https://trendstoday.ca',
    state: 'READY',
    createdAt: '2026-09-06T00:00:00Z',
    readyAt: '2026-09-06T00:05:00Z',
    buildingAt: '2026-09-06T00:01:00Z',
    meta: { githubCommitSha: 'merge-sha-123' },
    target: 'production',
  };

  const updated = updateCloseRecordAfterDeployment(merged, deployment, 5000);

  assert.equal(updated.deploymentEvidence.found, true);
  assert.equal(updated.deploymentEvidence.matchesSourceSha, true);
  assert.equal(updated.deploymentEvidence.waitedMs, 5000);
});

test('canProceedWithClose returns true when pre-checks pass', () => {
  const closeRecord = createCloseRecord({
    receipt: mockReceipt,
    reviewCompletion: mockReviewCompletion,
    currentPrSnapshot: mockPRSnapshot,
    config: DEFAULT_CONFIG,
    previousMainSha: 'previous-main-sha',
  });

  assert.equal(canProceedWithClose(closeRecord), true);
});

test('canProceedWithClose returns false when pre-checks fail', () => {
  const staleSnapshot = { ...mockPRSnapshot, headSha: 'different-sha' };
  const closeRecord = createCloseRecord({
    receipt: mockReceipt,
    reviewCompletion: mockReviewCompletion,
    currentPrSnapshot: staleSnapshot,
    config: DEFAULT_CONFIG,
    previousMainSha: 'previous-main-sha',
  });

  assert.equal(canProceedWithClose(closeRecord), false);
});

test('determineOutcome returns correct outcomes for different states', () => {
  assert.equal(
    determineOutcome({ preCloseChecks: { allPassed: false, failureReasons: ['HEAD SHA changed'] } }),
    'blocked_stale_head'
  );

  assert.equal(
    determineOutcome({ preCloseChecks: { allPassed: false, failureReasons: ['CI checks now failing'] } }),
    'blocked_ci_failure'
  );

  assert.equal(
    determineOutcome({ preCloseChecks: { allPassed: false, failureReasons: ['Sensitive keywords'] } }),
    'blocked_sensitive_content'
  );

  assert.equal(
    determineOutcome({
      preCloseChecks: { allPassed: true, failureReasons: [] },
      mergeEvidence: { merged: false, failureReason: 'Merge conflict' },
    }),
    'blocked_stale_head'
  );

  assert.equal(
    determineOutcome({
      preCloseChecks: { allPassed: true, failureReasons: [] },
      mergeEvidence: { merged: true, mergeSha: 'sha' },
      deploymentEvidence: { found: false, matchesSourceSha: false },
    }),
    'blocked_deploy_failure'
  );
});

test('full close workflow progression', () => {
  let closeRecord = createCloseRecord({
    receipt: mockReceipt,
    reviewCompletion: mockReviewCompletion,
    currentPrSnapshot: mockPRSnapshot,
    config: DEFAULT_CONFIG,
    previousMainSha: 'previous-main-sha',
  });

  assert.equal(canProceedWithClose(closeRecord), true);
  assert.equal(wasMergeSuccessful(closeRecord), false);

  closeRecord = updateCloseRecordAfterMerge(closeRecord, 'merge-sha-123', 'bot');
  assert.equal(wasMergeSuccessful(closeRecord), true);
  assert.equal(wasDeploymentSuccessful(closeRecord), false);

  const deployment = {
    id: 'deploy-123',
    url: 'https://trendstoday.ca',
    state: 'READY',
    createdAt: '2026-09-06T00:00:00Z',
    readyAt: '2026-09-06T00:05:00Z',
    buildingAt: '2026-09-06T00:01:00Z',
    meta: { githubCommitSha: 'merge-sha-123' },
    target: 'production',
  };

  closeRecord = updateCloseRecordAfterDeployment(closeRecord, deployment, 5000);
  assert.equal(wasDeploymentSuccessful(closeRecord), true);
  assert.equal(wasVerificationSuccessful(closeRecord), false);

  const verification = {
    verified: true,
    canonicalUrl: 'https://trendstoday.ca',
    desktopVerified: true,
    mobileVerified: true,
    headlineMatches: true,
    dateMatches: true,
    imagesLoad: true,
    noConsoleErrors: true,
    jsonLdValid: true,
    sitemapPresent: true,
    screenshotPaths: [],
    verifiedAt: '2026-09-06T00:10:00Z',
    verifierAgentId: 'verifier-agent',
    failureReasons: [],
  };

  closeRecord = updateCloseRecordAfterVerification(closeRecord, verification);
  assert.equal(wasVerificationSuccessful(closeRecord), true);
  assert.equal(closeRecord.outcome, 'success');
  assert.ok(closeRecord.closedAt);
});
