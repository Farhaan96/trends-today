/**
 * Independent Reviewer Dispatcher
 *
 * Dispatches a new cloud session for independent release review.
 */

import { randomUUID } from 'crypto';
import { isValidOpusModel } from './config.js';

/**
 * Review prompt template for independent release review.
 * @param {Object} receipt
 * @returns {string}
 */
export function generateReviewPrompt(receipt) {
  const artifactList = receipt.candidateArtifacts
    .map(a => `  - ${a.path} (SHA-256: ${a.sha256})`)
    .join('\n');

  return `# Independent Release Review Request

## Binding Information
- **PR**: ${receipt.prUrl}
- **Exact HEAD SHA**: ${receipt.exactHeadSha}
- **Receipt ID**: ${receipt.receiptId}
- **Repository**: ${receipt.repositoryFullName}

## Candidate Artifacts
${artifactList || '(No artifacts bound)'}

## Review Requirements
1. Verify exact SHA binding: Confirm HEAD is exactly \`${receipt.exactHeadSha}\`
2. Verify artifact hashes
3. Verify CI status
4. Check for sensitive content
5. Review content quality

## Verdict: Return "NO BLOCKERS" or "BLOCKERS"`;
}

/**
 * Validates that reviewer separation is maintained.
 * @param {string|null} implementerAgentId
 * @param {string} reviewerAgentId
 * @returns {Object}
 */
export function validateReviewerSeparation(implementerAgentId, reviewerAgentId) {
  if (!implementerAgentId) {
    return { valid: true, reason: null };
  }

  if (implementerAgentId === reviewerAgentId) {
    return {
      valid: false,
      reason: `Self-review detected: implementer ${implementerAgentId} cannot review their own work`,
    };
  }

  return { valid: true, reason: null };
}

/**
 * Validates that the target model is an authorized Opus 5 variant.
 * @param {string} model
 * @returns {Object}
 */
export function validateTargetModel(model) {
  if (!isValidOpusModel(model)) {
    return {
      valid: false,
      reason: `Model ${model} is not an authorized Opus 5 reviewer model`,
    };
  }

  return { valid: true, reason: null };
}

/**
 * Creates a review dispatch record.
 * @param {Object} input
 * @returns {Object}
 */
export function createDispatchRecord(input) {
  const { receipt, config, reviewerAgentId, reviewerSessionUrl, dispatchedBy } = input;

  if (receipt.status !== 'pending_review') {
    return {
      record: null,
      error: `Receipt status is ${receipt.status}, expected pending_review`,
    };
  }

  if (!receipt.eligibilityChecks.allPassed) {
    return {
      record: null,
      error: `Receipt eligibility checks failed: ${receipt.eligibilityChecks.failureReasons.join(', ')}`,
    };
  }

  const separationCheck = validateReviewerSeparation(receipt.implementerAgentId, reviewerAgentId);
  if (!separationCheck.valid) {
    return { record: null, error: separationCheck.reason };
  }

  const modelCheck = validateTargetModel(config.targetModel);
  if (!modelCheck.valid) {
    return { record: null, error: modelCheck.reason };
  }

  const prompt = generateReviewPrompt(receipt);

  const record = {
    version: 1,
    dispatchId: randomUUID(),
    createdAt: new Date().toISOString(),
    receiptId: receipt.receiptId,
    prNumber: receipt.prNumber,
    exactHeadSha: receipt.exactHeadSha,
    targetModel: config.targetModel,
    reviewerAgentId,
    reviewerSessionUrl,
    implementerAgentId: receipt.implementerAgentId,
    separationVerified: true,
    modelVerified: true,
    prompt,
    timeoutMinutes: config.timeoutMinutes.reviewCompletion,
    dispatchedBy,
  };

  return { record, error: null };
}

/**
 * Validates that a dispatch record matches the current receipt state.
 * @param {Object} dispatch
 * @param {Object} receipt
 * @returns {Object}
 */
export function validateDispatchAgainstReceipt(dispatch, receipt) {
  const reasons = [];

  if (dispatch.receiptId !== receipt.receiptId) {
    reasons.push(`Receipt ID mismatch: dispatch has ${dispatch.receiptId}, receipt has ${receipt.receiptId}`);
  }

  if (dispatch.exactHeadSha !== receipt.exactHeadSha) {
    reasons.push(`HEAD SHA mismatch: dispatch has ${dispatch.exactHeadSha}, receipt has ${receipt.exactHeadSha}`);
  }

  if (receipt.status === 'failed') {
    reasons.push('Receipt is in failed status');
  }

  return { valid: reasons.length === 0, reasons };
}

/**
 * Checks if a dispatch has timed out.
 * @param {Object} dispatch
 * @returns {boolean}
 */
export function isDispatchTimedOut(dispatch) {
  const dispatchTime = new Date(dispatch.createdAt).getTime();
  const timeoutMs = dispatch.timeoutMinutes * 60 * 1000;
  const now = Date.now();

  return now - dispatchTime > timeoutMs;
}

/**
 * Gets the review artifact path for a receipt.
 * @param {string} receiptId
 * @returns {string}
 */
export function getReviewArtifactPath(receiptId) {
  return `artifacts/editorial/reviews/release/${receiptId}.json`;
}

/**
 * Creates a dispatcher ID for tracking.
 * @returns {string}
 */
export function createDispatchId() {
  return randomUUID();
}
