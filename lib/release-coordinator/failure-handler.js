/**
 * Failure Handler
 *
 * Creates actionable handoff messages for PR when release fails.
 */

import { randomUUID } from 'crypto';

/**
 * Maps outcome to human-readable action required.
 * @param {string} outcome
 * @returns {string}
 */
export function getActionRequired(outcome) {
  const actions = {
    success: 'No action required - release completed successfully',
    blocked_stale_head: 'Push new commits to update HEAD, then re-trigger release',
    blocked_ci_failure: 'Fix failing CI checks and ensure all pass',
    blocked_missing_checks: 'Wait for all required checks to complete',
    blocked_self_review: 'Request independent review from a different agent session',
    blocked_model_unavailable: 'Wait for Opus 5 model availability or use fallback',
    blocked_model_unverified: 'Verify reviewer used authorized Opus 5 model',
    blocked_review_blockers: 'Address review blockers and request new review',
    blocked_sensitive_content: 'Request manual owner approval for sensitive content',
    blocked_owner_gate: 'Request manual owner approval for gated category',
    blocked_dirty_artifacts: 'Regenerate artifacts and ensure hashes match',
    blocked_hash_mismatch: 'Verify artifacts match review bindings',
    blocked_deploy_failure: 'Investigate Vercel deployment failure',
    blocked_verification_failure: 'Investigate live site verification failures',
    blocked_timeout: 'Re-trigger the timed-out operation',
    blocked_missing_evidence: 'Ensure all required evidence is present',
    error_system: 'Investigate system error and retry',
  };

  return actions[outcome] || 'Unknown failure - investigate logs';
}

/**
 * Maps outcome to the stage where it occurred.
 * @param {string} outcome
 * @returns {string}
 */
export function getStageFromOutcome(outcome) {
  const stageMap = {
    success: 'verify',
    blocked_stale_head: 'eligibility',
    blocked_ci_failure: 'eligibility',
    blocked_missing_checks: 'eligibility',
    blocked_self_review: 'dispatch',
    blocked_model_unavailable: 'dispatch',
    blocked_model_unverified: 'review',
    blocked_review_blockers: 'review',
    blocked_sensitive_content: 'eligibility',
    blocked_owner_gate: 'eligibility',
    blocked_dirty_artifacts: 'review',
    blocked_hash_mismatch: 'review',
    blocked_deploy_failure: 'deploy',
    blocked_verification_failure: 'verify',
    blocked_timeout: 'review',
    blocked_missing_evidence: 'eligibility',
    error_system: 'close',
  };

  return stageMap[outcome] || 'eligibility';
}

/**
 * Creates detailed failure explanation.
 * @param {string} outcome
 * @param {string[]} failureReasons
 * @returns {string}
 */
export function createFailureDetails(outcome, failureReasons) {
  const header = `## Release Coordinator Failure\n\n**Outcome:** ${outcome}\n\n`;

  const reasonsList = failureReasons.length > 0
    ? `### Failure Reasons\n\n${failureReasons.map(r => `- ${r}`).join('\n')}\n\n`
    : '';

  return `${header}${reasonsList}### Resolution Steps\n\nRefer to documentation for detailed resolution steps.`;
}

/**
 * Creates a failure handoff from a receipt failure.
 * @param {Object} input
 * @returns {Object}
 */
export function createHandoffFromReceipt(input) {
  const { receipt, outcome } = input;

  return {
    version: 1,
    handoffId: randomUUID(),
    createdAt: new Date().toISOString(),
    receiptId: receipt.receiptId,
    prNumber: receipt.prNumber,
    prUrl: receipt.prUrl,
    stage: getStageFromOutcome(outcome),
    outcome,
    actionRequired: getActionRequired(outcome),
    details: createFailureDetails(outcome, receipt.eligibilityChecks.failureReasons),
    evidence: {
      headSha: receipt.exactHeadSha,
      ciRunUrl: receipt.ciEvidence.ciRunUrl || undefined,
    },
    postedTopr: false,
    postedAt: null,
  };
}

/**
 * Creates a failure handoff from a dispatch failure.
 * @param {Object} input
 * @returns {Object}
 */
export function createHandoffFromDispatch(input) {
  const { dispatch, receipt, outcome, failureReasons } = input;

  return {
    version: 1,
    handoffId: randomUUID(),
    createdAt: new Date().toISOString(),
    receiptId: receipt.receiptId,
    prNumber: receipt.prNumber,
    prUrl: receipt.prUrl,
    stage: 'dispatch',
    outcome,
    actionRequired: getActionRequired(outcome),
    details: createFailureDetails(outcome, failureReasons),
    evidence: {
      headSha: dispatch.exactHeadSha,
    },
    postedTopr: false,
    postedAt: null,
  };
}

/**
 * Creates a failure handoff from a review failure.
 * @param {Object} input
 * @returns {Object}
 */
export function createHandoffFromReview(input) {
  const { completion, receipt, outcome } = input;

  return {
    version: 1,
    handoffId: randomUUID(),
    createdAt: new Date().toISOString(),
    receiptId: receipt.receiptId,
    prNumber: receipt.prNumber,
    prUrl: receipt.prUrl,
    stage: 'review',
    outcome,
    actionRequired: getActionRequired(outcome),
    details: createFailureDetails(outcome, completion.failureReasons),
    evidence: {
      headSha: completion.exactHeadSha,
      reviewArtifactPath: completion.reviewArtifactPath,
    },
    postedTopr: false,
    postedAt: null,
  };
}

/**
 * Creates a failure handoff from a close failure.
 * @param {Object} input
 * @returns {Object}
 */
export function createHandoffFromClose(input) {
  const { closeRecord, receipt } = input;

  const failureReasons = [
    ...closeRecord.preCloseChecks.failureReasons,
    closeRecord.mergeEvidence.failureReason,
    closeRecord.deploymentEvidence.failureReason,
    ...(closeRecord.liveVerification?.failureReasons || []),
  ].filter(r => r !== null && r !== undefined);

  return {
    version: 1,
    handoffId: randomUUID(),
    createdAt: new Date().toISOString(),
    receiptId: receipt.receiptId,
    prNumber: receipt.prNumber,
    prUrl: receipt.prUrl,
    stage: getStageFromOutcome(closeRecord.outcome),
    outcome: closeRecord.outcome,
    actionRequired: getActionRequired(closeRecord.outcome),
    details: createFailureDetails(closeRecord.outcome, failureReasons),
    evidence: {
      headSha: receipt.exactHeadSha,
      ciRunUrl: receipt.ciEvidence.ciRunUrl || undefined,
      deploymentUrl: closeRecord.deploymentEvidence.deployment?.url,
      screenshotPaths: closeRecord.liveVerification?.screenshotPaths,
    },
    postedTopr: false,
    postedAt: null,
  };
}

/**
 * Formats a handoff as a PR comment.
 * @param {Object} handoff
 * @returns {string}
 */
export function formatHandoffAsComment(handoff) {
  return `## 🚨 Release Coordinator: Action Required

${handoff.details}

---

**Action Required:** ${handoff.actionRequired}

<details>
<summary>Technical Details</summary>

- Handoff ID: \`${handoff.handoffId}\`
- Receipt ID: \`${handoff.receiptId}\`
- Stage: ${handoff.stage}
- Outcome: \`${handoff.outcome}\`
- HEAD SHA: \`${handoff.evidence.headSha}\`
- Created: ${handoff.createdAt}

</details>

---
*This is an automated message from the Cloud Release Coordinator.*`;
}

/**
 * Marks a handoff as posted.
 * @param {Object} handoff
 * @returns {Object}
 */
export function markHandoffPosted(handoff) {
  return {
    ...handoff,
    postedTopr: true,
    postedAt: new Date().toISOString(),
  };
}

/**
 * Checks if a handoff should be posted.
 * @param {Object} handoff
 * @returns {boolean}
 */
export function shouldPostHandoff(handoff) {
  if (handoff.postedTopr) {
    return false;
  }

  if (handoff.outcome === 'success') {
    return false;
  }

  return true;
}

/**
 * Creates a handoff ID for tracking.
 * @returns {string}
 */
export function createHandoffId() {
  return randomUUID();
}
