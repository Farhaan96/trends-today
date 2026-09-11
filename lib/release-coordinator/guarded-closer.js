/**
 * Guarded Closer
 *
 * Handles the final release stages after review passes.
 */

import { randomUUID } from 'crypto';
import { checkCIStatus, checkSensitiveContent, checkOwnerGatedCategories } from './receipt-generator.js';

/**
 * Validates pre-close conditions before attempting merge.
 * @param {Object} receipt
 * @param {Object} reviewCompletion
 * @param {Object} currentPrSnapshot
 * @param {Object} config
 * @returns {Object}
 */
export function validatePreCloseConditions(receipt, reviewCompletion, currentPrSnapshot, config) {
  const failureReasons = [];

  const headStillCurrent = currentPrSnapshot.headSha === receipt.exactHeadSha;
  if (!headStillCurrent) {
    failureReasons.push(
      `HEAD SHA changed: receipt has ${receipt.exactHeadSha}, current is ${currentPrSnapshot.headSha}`
    );
  }

  const reviewStillValid = reviewCompletion.passed && reviewCompletion.exactHeadSha === receipt.exactHeadSha;
  if (!reviewStillValid) {
    if (!reviewCompletion.passed) {
      failureReasons.push(`Review did not pass: ${reviewCompletion.failureReasons.join(', ')}`);
    } else {
      failureReasons.push(
        `Review SHA mismatch: review has ${reviewCompletion.exactHeadSha}, receipt has ${receipt.exactHeadSha}`
      );
    }
  }

  const ciStatus = checkCIStatus(currentPrSnapshot.checks);
  const ciStillPassing = ciStatus.allPassed;
  if (!ciStillPassing) {
    if (ciStatus.failedChecks.length > 0) {
      failureReasons.push(`CI checks now failing: ${ciStatus.failedChecks.join(', ')}`);
    }
    if (ciStatus.pendingChecks.length > 0) {
      failureReasons.push(`CI checks pending: ${ciStatus.pendingChecks.join(', ')}`);
    }
  }

  const sensitiveCheck = checkSensitiveContent(currentPrSnapshot.title, '', config.sensitiveKeywords);
  const notSensitive = !sensitiveCheck.found;
  if (!notSensitive) {
    failureReasons.push(`Sensitive keywords detected: ${sensitiveCheck.matches.join(', ')}`);
  }

  const ownerGatedCheck = checkOwnerGatedCategories(currentPrSnapshot.labels, '', config.ownerGatedCategories);
  const notOwnerGated = !ownerGatedCheck.gated;
  if (!notOwnerGated) {
    failureReasons.push(`Owner-gated categories detected: ${ownerGatedCheck.matches.join(', ')}`);
  }

  return {
    allPassed: failureReasons.length === 0,
    headStillCurrent,
    reviewStillValid,
    ciStillPassing,
    notSensitive,
    notOwnerGated,
    failureReasons,
  };
}

/**
 * Validates that a Vercel deployment matches the source SHA.
 * @param {Object} deployment
 * @param {string} expectedSha
 * @returns {Object}
 */
export function validateDeploymentMatch(deployment, expectedSha) {
  if (!deployment.meta.githubCommitSha) {
    return { matches: false, reason: 'Deployment has no GitHub commit SHA in metadata' };
  }

  if (!deployment.meta.githubCommitSha.startsWith(expectedSha.slice(0, 7))) {
    return {
      matches: false,
      reason: `Deployment SHA ${deployment.meta.githubCommitSha} does not match expected ${expectedSha}`,
    };
  }

  if (deployment.state !== 'READY') {
    return { matches: false, reason: `Deployment state is ${deployment.state}, not READY` };
  }

  if (deployment.target !== 'production') {
    return { matches: false, reason: `Deployment target is ${deployment.target}, not production` };
  }

  return { matches: true, reason: null };
}

/**
 * Creates rollback instructions for this release.
 * @param {number} prNumber
 * @param {string} mergeSha
 * @param {string} previousSha
 * @returns {string}
 */
export function createRollbackInstructions(prNumber, mergeSha, previousSha) {
  return `To rollback this release:

1. Create a revert PR:
   git checkout main
   git pull origin main
   git checkout -b revert/pr-${prNumber}
   git revert ${mergeSha}
   git push -u origin revert/pr-${prNumber}

2. Open a PR from revert/pr-${prNumber} to main

3. After merge, verify rollback:
   - Previous HEAD: ${previousSha}
   - Merged SHA: ${mergeSha}`;
}

/**
 * Determines the outcome based on the close record state.
 * @param {Object} closeRecord
 * @returns {string}
 */
export function determineOutcome(closeRecord) {
  if (!closeRecord.preCloseChecks?.allPassed) {
    const reasons = closeRecord.preCloseChecks?.failureReasons || [];

    if (reasons.some(r => r.includes('HEAD SHA changed'))) {
      return 'blocked_stale_head';
    }
    if (reasons.some(r => r.includes('CI checks'))) {
      return 'blocked_ci_failure';
    }
    if (reasons.some(r => r.includes('Sensitive'))) {
      return 'blocked_sensitive_content';
    }
    if (reasons.some(r => r.includes('Owner-gated'))) {
      return 'blocked_owner_gate';
    }
    if (reasons.some(r => r.includes('Review'))) {
      return 'blocked_review_blockers';
    }

    return 'blocked_missing_checks';
  }

  if (!closeRecord.mergeEvidence?.merged) {
    const reason = closeRecord.mergeEvidence?.failureReason || '';
    if (reason.includes('conflict')) {
      return 'blocked_stale_head';
    }
    return 'error_system';
  }

  if (!closeRecord.deploymentEvidence?.found || !closeRecord.deploymentEvidence?.matchesSourceSha) {
    return 'blocked_deploy_failure';
  }

  if (!closeRecord.liveVerification?.verified) {
    return 'blocked_verification_failure';
  }

  return 'success';
}

/**
 * Creates an initial guarded close record.
 * @param {Object} input
 * @returns {Object}
 */
export function createCloseRecord(input) {
  const { receipt, reviewCompletion, currentPrSnapshot, config, previousMainSha } = input;

  const preCloseChecks = validatePreCloseConditions(receipt, reviewCompletion, currentPrSnapshot, config);

  const closeRecord = {
    version: 1,
    closeId: randomUUID(),
    createdAt: new Date().toISOString(),
    receiptId: receipt.receiptId,
    reviewCompletionId: reviewCompletion.completionId,
    prNumber: receipt.prNumber,
    prUrl: receipt.prUrl,
    preCloseChecks,
    mergeEvidence: {
      merged: false,
      mergeSha: null,
      mergedAt: null,
      mergedBy: null,
      failureReason: null,
    },
    deploymentEvidence: {
      found: false,
      deployment: null,
      matchesSourceSha: false,
      waitedMs: 0,
      failureReason: null,
    },
    liveVerification: null,
    rollbackEvidence: {
      rollbackSha: previousMainSha,
      rollbackInstructions: '',
    },
    outcome: 'blocked_missing_checks',
    closedAt: null,
  };

  closeRecord.outcome = determineOutcome(closeRecord);

  return closeRecord;
}

/**
 * Updates close record after merge.
 * @param {Object} closeRecord
 * @param {string} mergeSha
 * @param {string} mergedBy
 * @returns {Object}
 */
export function updateCloseRecordAfterMerge(closeRecord, mergeSha, mergedBy) {
  const updated = { ...closeRecord };

  updated.mergeEvidence = {
    merged: true,
    mergeSha,
    mergedAt: new Date().toISOString(),
    mergedBy,
    failureReason: null,
  };

  updated.rollbackEvidence = {
    rollbackSha: closeRecord.rollbackEvidence.rollbackSha,
    rollbackInstructions: createRollbackInstructions(
      closeRecord.prNumber,
      mergeSha,
      closeRecord.rollbackEvidence.rollbackSha
    ),
  };

  updated.outcome = determineOutcome(updated);

  return updated;
}

/**
 * Updates close record after merge failure.
 * @param {Object} closeRecord
 * @param {string} failureReason
 * @returns {Object}
 */
export function updateCloseRecordMergeFailed(closeRecord, failureReason) {
  const updated = { ...closeRecord };

  updated.mergeEvidence = {
    merged: false,
    mergeSha: null,
    mergedAt: null,
    mergedBy: null,
    failureReason,
  };

  updated.outcome = determineOutcome(updated);

  return updated;
}

/**
 * Updates close record after deployment found.
 * @param {Object} closeRecord
 * @param {Object} deployment
 * @param {number} waitedMs
 * @returns {Object}
 */
export function updateCloseRecordAfterDeployment(closeRecord, deployment, waitedMs) {
  const updated = { ...closeRecord };

  const matchResult = validateDeploymentMatch(deployment, closeRecord.mergeEvidence.mergeSha || '');

  updated.deploymentEvidence = {
    found: true,
    deployment,
    matchesSourceSha: matchResult.matches,
    waitedMs,
    failureReason: matchResult.reason,
  };

  updated.outcome = determineOutcome(updated);

  return updated;
}

/**
 * Updates close record after deployment not found or timeout.
 * @param {Object} closeRecord
 * @param {string} failureReason
 * @param {number} waitedMs
 * @returns {Object}
 */
export function updateCloseRecordDeploymentFailed(closeRecord, failureReason, waitedMs) {
  const updated = { ...closeRecord };

  updated.deploymentEvidence = {
    found: false,
    deployment: null,
    matchesSourceSha: false,
    waitedMs,
    failureReason,
  };

  updated.outcome = determineOutcome(updated);

  return updated;
}

/**
 * Updates close record after live verification.
 * @param {Object} closeRecord
 * @param {Object} verification
 * @returns {Object}
 */
export function updateCloseRecordAfterVerification(closeRecord, verification) {
  const updated = { ...closeRecord };

  updated.liveVerification = verification;
  updated.outcome = determineOutcome(updated);

  if (updated.outcome === 'success') {
    updated.closedAt = new Date().toISOString();
  }

  return updated;
}

/**
 * Checks if close can proceed based on pre-close checks.
 * @param {Object} closeRecord
 * @returns {boolean}
 */
export function canProceedWithClose(closeRecord) {
  return closeRecord.preCloseChecks.allPassed;
}

/**
 * Checks if merge was successful.
 * @param {Object} closeRecord
 * @returns {boolean}
 */
export function wasMergeSuccessful(closeRecord) {
  return closeRecord.mergeEvidence.merged && closeRecord.mergeEvidence.mergeSha !== null;
}

/**
 * Checks if deployment was found and matches.
 * @param {Object} closeRecord
 * @returns {boolean}
 */
export function wasDeploymentSuccessful(closeRecord) {
  return (
    closeRecord.deploymentEvidence.found &&
    closeRecord.deploymentEvidence.matchesSourceSha &&
    closeRecord.deploymentEvidence.deployment?.state === 'READY'
  );
}

/**
 * Checks if live verification passed.
 * @param {Object} closeRecord
 * @returns {boolean}
 */
export function wasVerificationSuccessful(closeRecord) {
  return closeRecord.liveVerification?.verified === true;
}

/**
 * Creates a close ID for tracking.
 * @returns {string}
 */
export function createCloseId() {
  return randomUUID();
}
