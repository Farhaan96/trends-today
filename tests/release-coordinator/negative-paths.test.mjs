/**
 * Negative path tests for the release coordinator.
 *
 * Tests all failure scenarios explicitly required by the acceptance criteria:
 * - Stale SHA detection
 * - Same-session review rejection
 * - Wrong/unverified model rejection
 * - Missing evidence handling
 * - BLOCKERS verdict handling
 * - Failed deployment handling
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

import { ReleaseCoordinator } from '../../lib/release-coordinator/index.js';
import { DEFAULT_CONFIG } from '../../lib/release-coordinator/config.js';

const enabledConfig = {
  ...DEFAULT_CONFIG,
  enabled: true,
  killSwitch: { disabled: false, disabledReason: null, disabledAt: null, disabledBy: null },
};

const mockPRSnapshot = {
  prNumber: 184,
  prUrl: 'https://github.com/Farhaan96/trends-today/pull/184',
  headSha: 'abc123def456789012345678901234567890abcd',
  baseBranch: 'main',
  headBranch: 'feat/test',
  title: 'Test PR',
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
  scores: { factualSupport: 5, quality: 4, readability: 5, formatting: 4, engagement: 4 },
  proseEmDashCount: 0,
  blockers: [],
  summary: 'Test summary',
};

const mockVisualQa = {
  completed: true,
  desktopPassed: true,
  mobilePassed: true,
  consolePassed: true,
  interactionPassed: true,
  screenshotPaths: [],
  reportPath: null,
  completedAt: '2026-09-06T00:00:00Z',
  agentId: 'qa-agent',
};

test('NEGATIVE: Coordinator rejects stale SHA on receipt validation', () => {
  const coordinator = new ReleaseCoordinator(enabledConfig);

  const receipt = coordinator.generateReceipt({
    prSnapshot: mockPRSnapshot,
    implementerAgentId: 'agent-1',
    implementerSessionId: 'session-1',
    ciRunUrl: null,
    visualQaEvidence: mockVisualQa,
    gptReview: mockGptReview,
    gptReviewArtifactPath: null,
    candidateArtifactPaths: [],
    prBody: '',
  });

  const newSnapshot = { ...mockPRSnapshot, headSha: 'new-sha-different12345678901234567890' };
  const validation = coordinator.validateReceipt(receipt, newSnapshot);

  assert.equal(validation.valid, false);
  assert.ok(validation.reasons.some(r => r.includes('HEAD SHA changed')));
});

test('NEGATIVE: Coordinator rejects stale SHA on pre-close validation', () => {
  const coordinator = new ReleaseCoordinator(enabledConfig);

  const receipt = coordinator.generateReceipt({
    prSnapshot: mockPRSnapshot,
    implementerAgentId: 'agent-1',
    implementerSessionId: 'session-1',
    ciRunUrl: null,
    visualQaEvidence: mockVisualQa,
    gptReview: mockGptReview,
    gptReviewArtifactPath: null,
    candidateArtifactPaths: [],
    prBody: '',
  });

  const reviewCompletion = {
    version: 1,
    completionId: 'completion-1',
    createdAt: '2026-09-06T00:00:00Z',
    dispatchId: 'dispatch-1',
    receiptId: receipt.receiptId,
    prNumber: 184,
    exactHeadSha: receipt.exactHeadSha,
    reviewerAgentId: 'reviewer-1',
    actualModelUsed: 'claude-opus-5',
    modelMatchesTarget: true,
    selfReviewDetected: false,
    reviewArtifactPath: 'artifacts/review.json',
    reviewArtifactSha256: 'hash',
    verdict: 'NO BLOCKERS',
    headShaMatches: true,
    artifactHashesMatch: true,
    passed: true,
    failureReasons: [],
  };

  const staleSnapshot = { ...mockPRSnapshot, headSha: 'stale-sha-abcdef1234567890123456789012' };
  const closeRecord = coordinator.createCloseRecord({
    receipt,
    reviewCompletion,
    currentPrSnapshot: staleSnapshot,
    previousMainSha: 'prev-sha',
  });

  assert.equal(coordinator.canProceedWithClose(closeRecord), false);
  assert.equal(closeRecord.outcome, 'blocked_stale_head');
});

test('NEGATIVE: Coordinator rejects same-session (self) review', () => {
  const coordinator = new ReleaseCoordinator(enabledConfig);

  const receipt = coordinator.generateReceipt({
    prSnapshot: mockPRSnapshot,
    implementerAgentId: 'same-agent-123',
    implementerSessionId: 'session-1',
    ciRunUrl: null,
    visualQaEvidence: mockVisualQa,
    gptReview: mockGptReview,
    gptReviewArtifactPath: null,
    candidateArtifactPaths: [],
    prBody: '',
  });

  const { record, error } = coordinator.createDispatch({
    receipt,
    reviewerAgentId: 'same-agent-123',
    reviewerSessionUrl: 'https://cursor.com/agents/same-agent',
    dispatchedBy: 'test',
  });

  assert.equal(record, null);
  assert.ok(error?.includes('Self-review'));
});

test('NEGATIVE: Coordinator rejects wrong/unverified model in review', () => {
  const coordinator = new ReleaseCoordinator(enabledConfig);
  const tempDir = mkdtempSync(join(tmpdir(), 'model-test-'));
  const reviewPath = join(tempDir, 'review.json');

  const wrongModelReview = {
    version: 1,
    reviewer: 'claude',
    verdict: 'NO BLOCKERS',
    candidateSha256: 'abc123def456789012345678901234567890abcdef1234567890123456789012',
    reviewedAt: '2026-09-06T00:00:00Z',
    repositorySha: 'abc123def456789012345678901234567890abcd',
    modelUsed: 'claude-sonnet-5',
    observedModels: ['claude-sonnet-5'],
    runnerStatus: 'success',
    review: 'Review text here',
  };

  writeFileSync(reviewPath, JSON.stringify(wrongModelReview));

  try {
    const receipt = coordinator.generateReceipt({
      prSnapshot: mockPRSnapshot,
      implementerAgentId: 'agent-1',
      implementerSessionId: 'session-1',
      ciRunUrl: null,
      visualQaEvidence: mockVisualQa,
      gptReview: mockGptReview,
      gptReviewArtifactPath: null,
      candidateArtifactPaths: [],
      prBody: '',
    });

    const dispatch = {
      version: 1,
      dispatchId: 'dispatch-1',
      createdAt: '2026-09-06T00:00:00Z',
      receiptId: receipt.receiptId,
      prNumber: 184,
      exactHeadSha: receipt.exactHeadSha,
      targetModel: 'claude-opus-5-thinking-medium',
      reviewerAgentId: 'reviewer-1',
      reviewerSessionUrl: 'https://cursor.com/agents/reviewer',
      implementerAgentId: 'agent-1',
      separationVerified: true,
      modelVerified: true,
      prompt: 'prompt',
      timeoutMinutes: 30,
      dispatchedBy: 'test',
    };

    const completion = coordinator.validateReview({
      dispatch,
      receipt,
      reviewArtifactPath: reviewPath,
      reviewerAgentId: 'reviewer-1',
    });

    assert.equal(completion.passed, false);
    assert.ok(completion.failureReasons.some(r => r.includes('not an Opus 5 variant')));
  } finally {
    rmSync(tempDir, { recursive: true });
  }
});

test('NEGATIVE: Coordinator rejects missing evidence (no review artifact)', () => {
  const coordinator = new ReleaseCoordinator(enabledConfig);

  const receipt = coordinator.generateReceipt({
    prSnapshot: mockPRSnapshot,
    implementerAgentId: 'agent-1',
    implementerSessionId: 'session-1',
    ciRunUrl: null,
    visualQaEvidence: mockVisualQa,
    gptReview: mockGptReview,
    gptReviewArtifactPath: null,
    candidateArtifactPaths: [],
    prBody: '',
  });

  const dispatch = {
    version: 1,
    dispatchId: 'dispatch-1',
    createdAt: '2026-09-06T00:00:00Z',
    receiptId: receipt.receiptId,
    prNumber: 184,
    exactHeadSha: receipt.exactHeadSha,
    targetModel: 'claude-opus-5-thinking-medium',
    reviewerAgentId: 'reviewer-1',
    reviewerSessionUrl: 'https://cursor.com/agents/reviewer',
    implementerAgentId: 'agent-1',
    separationVerified: true,
    modelVerified: true,
    prompt: 'prompt',
    timeoutMinutes: 30,
    dispatchedBy: 'test',
  };

  const completion = coordinator.validateReview({
    dispatch,
    receipt,
    reviewArtifactPath: '/nonexistent/review.json',
    reviewerAgentId: 'reviewer-1',
  });

  assert.equal(completion.passed, false);
  assert.ok(completion.failureReasons.some(r => r.includes('not found')));
});

test('NEGATIVE: Coordinator rejects BLOCKERS verdict', () => {
  const coordinator = new ReleaseCoordinator(enabledConfig);
  const tempDir = mkdtempSync(join(tmpdir(), 'blockers-test-'));
  const reviewPath = join(tempDir, 'review.json');

  const blockerReview = {
    version: 1,
    reviewer: 'claude',
    verdict: 'BLOCKERS',
    candidateSha256: 'abc123def456789012345678901234567890abcdef1234567890123456789012',
    reviewedAt: '2026-09-06T00:00:00Z',
    repositorySha: 'abc123def456789012345678901234567890abcd',
    modelUsed: 'claude-opus-5',
    observedModels: ['claude-opus-5'],
    runnerStatus: 'success',
    review: 'Found blockers: missing source citation',
  };

  writeFileSync(reviewPath, JSON.stringify(blockerReview));

  try {
    const receipt = coordinator.generateReceipt({
      prSnapshot: mockPRSnapshot,
      implementerAgentId: 'agent-1',
      implementerSessionId: 'session-1',
      ciRunUrl: null,
      visualQaEvidence: mockVisualQa,
      gptReview: mockGptReview,
      gptReviewArtifactPath: null,
      candidateArtifactPaths: [],
      prBody: '',
    });

    const dispatch = {
      version: 1,
      dispatchId: 'dispatch-1',
      createdAt: '2026-09-06T00:00:00Z',
      receiptId: receipt.receiptId,
      prNumber: 184,
      exactHeadSha: receipt.exactHeadSha,
      targetModel: 'claude-opus-5-thinking-medium',
      reviewerAgentId: 'reviewer-1',
      reviewerSessionUrl: 'https://cursor.com/agents/reviewer',
      implementerAgentId: 'agent-1',
      separationVerified: true,
      modelVerified: true,
      prompt: 'prompt',
      timeoutMinutes: 30,
      dispatchedBy: 'test',
    };

    const completion = coordinator.validateReview({
      dispatch,
      receipt,
      reviewArtifactPath: reviewPath,
      reviewerAgentId: 'reviewer-1',
    });

    assert.equal(completion.passed, false);
    assert.equal(completion.verdict, 'BLOCKERS');
    assert.ok(completion.failureReasons.some(r => r.includes('BLOCKERS')));
  } finally {
    rmSync(tempDir, { recursive: true });
  }
});

test('NEGATIVE: Coordinator rejects failed deployment', () => {
  const coordinator = new ReleaseCoordinator(enabledConfig);

  const receipt = coordinator.generateReceipt({
    prSnapshot: mockPRSnapshot,
    implementerAgentId: 'agent-1',
    implementerSessionId: 'session-1',
    ciRunUrl: null,
    visualQaEvidence: mockVisualQa,
    gptReview: mockGptReview,
    gptReviewArtifactPath: null,
    candidateArtifactPaths: [],
    prBody: '',
  });

  const reviewCompletion = {
    version: 1,
    completionId: 'completion-1',
    createdAt: '2026-09-06T00:00:00Z',
    dispatchId: 'dispatch-1',
    receiptId: receipt.receiptId,
    prNumber: 184,
    exactHeadSha: receipt.exactHeadSha,
    reviewerAgentId: 'reviewer-1',
    actualModelUsed: 'claude-opus-5',
    modelMatchesTarget: true,
    selfReviewDetected: false,
    reviewArtifactPath: 'artifacts/review.json',
    reviewArtifactSha256: 'hash',
    verdict: 'NO BLOCKERS',
    headShaMatches: true,
    artifactHashesMatch: true,
    passed: true,
    failureReasons: [],
  };

  let closeRecord = coordinator.createCloseRecord({
    receipt,
    reviewCompletion,
    currentPrSnapshot: mockPRSnapshot,
    previousMainSha: 'prev-sha',
  });

  closeRecord = coordinator.recordMergeSuccess(closeRecord, 'merge-sha', 'bot');
  assert.equal(coordinator.wasMergeSuccessful(closeRecord), true);

  closeRecord = coordinator.recordDeploymentFailure(closeRecord, 'Deployment timed out', 600000);

  assert.equal(coordinator.wasDeploymentSuccessful(closeRecord), false);
  assert.equal(closeRecord.outcome, 'blocked_deploy_failure');
});

test('NEGATIVE: Coordinator rejects sensitive content', () => {
  const coordinator = new ReleaseCoordinator(enabledConfig);

  const receipt = coordinator.generateReceipt({
    prSnapshot: mockPRSnapshot,
    implementerAgentId: 'agent-1',
    implementerSessionId: 'session-1',
    ciRunUrl: null,
    visualQaEvidence: mockVisualQa,
    gptReview: mockGptReview,
    gptReviewArtifactPath: null,
    candidateArtifactPaths: [],
    prBody: 'This article discusses a crime and an arrest',
  });

  assert.equal(receipt.eligibilityChecks.notSensitive, false);
  assert.equal(receipt.eligibilityChecks.allPassed, false);
  assert.equal(receipt.status, 'failed');
  assert.ok(receipt.eligibilityChecks.failureReasons.some(r => r.includes('Sensitive')));
});

test('NEGATIVE: Coordinator rejects owner-gated categories', () => {
  const coordinator = new ReleaseCoordinator(enabledConfig);

  const sponsoredSnapshot = { ...mockPRSnapshot, labels: ['ready-for-release', 'sponsored'] };
  const receipt = coordinator.generateReceipt({
    prSnapshot: sponsoredSnapshot,
    implementerAgentId: 'agent-1',
    implementerSessionId: 'session-1',
    ciRunUrl: null,
    visualQaEvidence: mockVisualQa,
    gptReview: mockGptReview,
    gptReviewArtifactPath: null,
    candidateArtifactPaths: [],
    prBody: '',
  });

  assert.equal(receipt.eligibilityChecks.notOwnerGated, false);
  assert.equal(receipt.eligibilityChecks.allPassed, false);
  assert.ok(receipt.eligibilityChecks.failureReasons.some(r => r.includes('Owner-gated')));
});

test('NEGATIVE: Coordinator rejects failing CI checks', () => {
  const coordinator = new ReleaseCoordinator(enabledConfig);

  const failingCiSnapshot = {
    ...mockPRSnapshot,
    checks: [
      { name: 'build', status: 'completed', conclusion: 'failure', completedAt: '2026-09-06T00:00:00Z', detailsUrl: null },
    ],
  };

  const receipt = coordinator.generateReceipt({
    prSnapshot: failingCiSnapshot,
    implementerAgentId: 'agent-1',
    implementerSessionId: 'session-1',
    ciRunUrl: null,
    visualQaEvidence: mockVisualQa,
    gptReview: mockGptReview,
    gptReviewArtifactPath: null,
    candidateArtifactPaths: [],
    prBody: '',
  });

  assert.equal(receipt.eligibilityChecks.ciPassed, false);
  assert.equal(receipt.eligibilityChecks.allPassed, false);
  assert.ok(receipt.eligibilityChecks.failureReasons.some(r => r.includes('CI checks failed')));
});

test('NEGATIVE: Coordinator creates actionable handoff on failure', () => {
  const coordinator = new ReleaseCoordinator(enabledConfig);

  const failingCiSnapshot = {
    ...mockPRSnapshot,
    checks: [
      { name: 'build', status: 'completed', conclusion: 'failure', completedAt: '2026-09-06T00:00:00Z', detailsUrl: null },
    ],
  };

  const receipt = coordinator.generateReceipt({
    prSnapshot: failingCiSnapshot,
    implementerAgentId: 'agent-1',
    implementerSessionId: 'session-1',
    ciRunUrl: 'https://github.com/run/123',
    visualQaEvidence: mockVisualQa,
    gptReview: mockGptReview,
    gptReviewArtifactPath: null,
    candidateArtifactPaths: [],
    prBody: '',
  });

  const handoff = coordinator.createHandoff('receipt', {
    receipt,
    outcome: 'blocked_ci_failure',
  });

  assert.ok(handoff.handoffId);
  assert.equal(handoff.stage, 'eligibility');
  assert.equal(handoff.outcome, 'blocked_ci_failure');
  assert.ok(handoff.actionRequired.includes('Fix failing CI'));
  assert.ok(handoff.details.includes('Resolution Steps'));
  assert.equal(coordinator.shouldPostHandoff(handoff), true);

  const comment = coordinator.formatHandoffComment(handoff);
  assert.ok(comment.includes('Release Coordinator'));
  assert.ok(comment.includes('Action Required'));
});

test('NEGATIVE: Kill switch prevents all operations', () => {
  const killedConfig = {
    ...enabledConfig,
    killSwitch: {
      disabled: true,
      disabledReason: 'Emergency stop',
      disabledAt: new Date().toISOString(),
      disabledBy: 'admin',
    },
  };

  const coordinator = new ReleaseCoordinator(killedConfig);
  const { active, reason } = coordinator.isActive();

  assert.equal(active, false);
  assert.ok(reason?.includes('Emergency stop'));
});

test('NEGATIVE: Auto-merge disabled prevents merge', () => {
  const noMergeConfig = {
    ...enabledConfig,
    autoMergeEnabled: false,
  };

  const coordinator = new ReleaseCoordinator(noMergeConfig);
  const { enabled, reason } = coordinator.canAutoMerge();

  assert.equal(enabled, false);
  assert.ok(reason?.includes('Auto-merge is disabled'));
});
