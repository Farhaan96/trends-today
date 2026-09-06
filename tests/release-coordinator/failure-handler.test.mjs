/**
 * Tests for failure handler.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getActionRequired,
  getStageFromOutcome,
  createFailureDetails,
  createHandoffFromReceipt,
  createHandoffFromDispatch,
  createHandoffFromReview,
  createHandoffFromClose,
  formatHandoffAsComment,
  markHandoffPosted,
  shouldPostHandoff,
} from '../../lib/release-coordinator/failure-handler.js';

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
  ciEvidence: { allChecksPassed: true, checks: [], ciRunUrl: 'https://github.com/run/123', capturedAt: '2026-09-06T00:00:00Z' },
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
  status: 'failed',
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

const mockCompletion = {
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
  verdict: 'BLOCKERS',
  headShaMatches: true,
  artifactHashesMatch: true,
  passed: false,
  failureReasons: ['Review found blockers'],
};

const mockCloseRecord = {
  version: 1,
  closeId: 'close-123',
  createdAt: '2026-09-06T00:00:00Z',
  receiptId: 'receipt-123',
  reviewCompletionId: 'completion-123',
  prNumber: 184,
  prUrl: 'https://github.com/Farhaan96/trends-today/pull/184',
  preCloseChecks: {
    headStillCurrent: true,
    reviewStillValid: true,
    ciStillPassing: true,
    notSensitive: true,
    notOwnerGated: true,
    allPassed: true,
    failureReasons: [],
  },
  mergeEvidence: { merged: true, mergeSha: 'merge-123', mergedAt: '2026-09-06T00:05:00Z', mergedBy: 'bot', failureReason: null },
  deploymentEvidence: { found: false, deployment: null, matchesSourceSha: false, waitedMs: 60000, failureReason: 'Deployment not found' },
  liveVerification: null,
  rollbackEvidence: { rollbackSha: 'previous-sha', rollbackInstructions: 'git revert...' },
  outcome: 'blocked_deploy_failure',
  closedAt: null,
};

test('getActionRequired returns appropriate action for each outcome', () => {
  assert.ok(getActionRequired('blocked_stale_head').includes('Push new commits'));
  assert.ok(getActionRequired('blocked_ci_failure').includes('Fix failing CI'));
  assert.ok(getActionRequired('blocked_self_review').includes('independent review'));
  assert.ok(getActionRequired('blocked_sensitive_content').includes('manual owner approval'));
  assert.ok(getActionRequired('blocked_deploy_failure').includes('Investigate Vercel'));
  assert.ok(getActionRequired('success').includes('No action required'));
});

test('getStageFromOutcome returns correct stage', () => {
  assert.equal(getStageFromOutcome('blocked_stale_head'), 'eligibility');
  assert.equal(getStageFromOutcome('blocked_ci_failure'), 'eligibility');
  assert.equal(getStageFromOutcome('blocked_self_review'), 'dispatch');
  assert.equal(getStageFromOutcome('blocked_model_unverified'), 'review');
  assert.equal(getStageFromOutcome('blocked_deploy_failure'), 'deploy');
  assert.equal(getStageFromOutcome('blocked_verification_failure'), 'verify');
});

test('createFailureDetails includes outcome and reasons', () => {
  const details = createFailureDetails('blocked_ci_failure', ['Build failed', 'Tests failed']);

  assert.ok(details.includes('blocked_ci_failure'));
  assert.ok(details.includes('Build failed'));
  assert.ok(details.includes('Tests failed'));
  assert.ok(details.includes('Resolution Steps'));
});

test('createFailureDetails handles empty reasons', () => {
  const details = createFailureDetails('blocked_timeout', []);

  assert.ok(details.includes('blocked_timeout'));
  assert.ok(!details.includes('Failure Reasons'));
});

test('createHandoffFromReceipt creates valid handoff', () => {
  const failedReceipt = {
    ...mockReceipt,
    eligibilityChecks: {
      ...mockReceipt.eligibilityChecks,
      allPassed: false,
      ciPassed: false,
      failureReasons: ['CI checks failed: build'],
    },
  };

  const handoff = createHandoffFromReceipt({
    receipt: failedReceipt,
    outcome: 'blocked_ci_failure',
  });

  assert.equal(handoff.version, 1);
  assert.equal(handoff.receiptId, failedReceipt.receiptId);
  assert.equal(handoff.prNumber, 184);
  assert.equal(handoff.stage, 'eligibility');
  assert.equal(handoff.outcome, 'blocked_ci_failure');
  assert.ok(handoff.details.includes('CI checks failed'));
  assert.equal(handoff.postedTopr, false);
});

test('createHandoffFromDispatch creates valid handoff', () => {
  const handoff = createHandoffFromDispatch({
    dispatch: mockDispatch,
    receipt: mockReceipt,
    outcome: 'blocked_self_review',
    failureReasons: ['Self-review detected'],
  });

  assert.equal(handoff.stage, 'dispatch');
  assert.equal(handoff.outcome, 'blocked_self_review');
  assert.ok(handoff.details.includes('Self-review'));
});

test('createHandoffFromReview creates valid handoff', () => {
  const handoff = createHandoffFromReview({
    completion: mockCompletion,
    receipt: mockReceipt,
    outcome: 'blocked_review_blockers',
  });

  assert.equal(handoff.stage, 'review');
  assert.equal(handoff.outcome, 'blocked_review_blockers');
  assert.ok(handoff.details.includes('blockers'));
  assert.equal(handoff.evidence.reviewArtifactPath, 'artifacts/review.json');
});

test('createHandoffFromClose creates valid handoff', () => {
  const handoff = createHandoffFromClose({
    closeRecord: mockCloseRecord,
    receipt: mockReceipt,
  });

  assert.equal(handoff.stage, 'deploy');
  assert.equal(handoff.outcome, 'blocked_deploy_failure');
  assert.ok(handoff.details.includes('Deployment not found'));
});

test('formatHandoffAsComment produces valid markdown', () => {
  const handoff = createHandoffFromReceipt({
    receipt: mockReceipt,
    outcome: 'blocked_ci_failure',
  });

  const comment = formatHandoffAsComment(handoff);

  assert.ok(comment.includes('Release Coordinator'));
  assert.ok(comment.includes('Action Required'));
  assert.ok(comment.includes(handoff.receiptId));
  assert.ok(comment.includes(handoff.evidence.headSha));
  assert.ok(comment.includes('Technical Details'));
  assert.ok(comment.includes('automated message'));
});

test('markHandoffPosted updates fields', () => {
  const handoff = createHandoffFromReceipt({
    receipt: mockReceipt,
    outcome: 'blocked_ci_failure',
  });

  assert.equal(handoff.postedTopr, false);
  assert.equal(handoff.postedAt, null);

  const posted = markHandoffPosted(handoff);

  assert.equal(posted.postedTopr, true);
  assert.ok(posted.postedAt);
});

test('shouldPostHandoff returns true for unposted failures', () => {
  const handoff = createHandoffFromReceipt({
    receipt: mockReceipt,
    outcome: 'blocked_ci_failure',
  });

  assert.equal(shouldPostHandoff(handoff), true);
});

test('shouldPostHandoff returns false for already posted', () => {
  const handoff = createHandoffFromReceipt({
    receipt: mockReceipt,
    outcome: 'blocked_ci_failure',
  });
  const posted = markHandoffPosted(handoff);

  assert.equal(shouldPostHandoff(posted), false);
});

test('shouldPostHandoff returns false for success outcome', () => {
  const handoff = createHandoffFromReceipt({
    receipt: mockReceipt,
    outcome: 'success',
  });

  assert.equal(shouldPostHandoff(handoff), false);
});
