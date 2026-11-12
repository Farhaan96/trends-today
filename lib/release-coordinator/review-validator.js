/**
 * Review Validator
 *
 * Validates completed reviews against strict requirements.
 */

import { createHash, randomUUID } from 'crypto';
import { readFileSync, existsSync } from 'fs';

/**
 * Validates the structure of a Claude release review artifact.
 * @param {unknown} review
 * @returns {Object}
 */
export function validateReviewStructure(review) {
  const reasons = [];

  if (!review || typeof review !== 'object') {
    reasons.push('Review must be an object');
    return { valid: false, reasons, parsed: null };
  }

  const r = review;

  if (r.version !== 1) {
    reasons.push(`Invalid version: expected 1, got ${r.version}`);
  }

  if (r.reviewer !== 'claude') {
    reasons.push(`Invalid reviewer: expected "claude", got "${r.reviewer}"`);
  }

  if (r.verdict !== 'NO BLOCKERS' && r.verdict !== 'BLOCKERS') {
    reasons.push(`Invalid verdict: expected "NO BLOCKERS" or "BLOCKERS", got "${r.verdict}"`);
  }

  if (typeof r.candidateSha256 !== 'string' || r.candidateSha256.length !== 64) {
    reasons.push(`Invalid candidateSha256: must be 64-character hex string`);
  }

  if (typeof r.repositorySha !== 'string' || r.repositorySha.length < 7) {
    reasons.push(`Invalid repositorySha: must be valid git SHA`);
  }

  if (typeof r.reviewedAt !== 'string') {
    reasons.push('Missing reviewedAt timestamp');
  }

  if (typeof r.modelUsed !== 'string') {
    reasons.push('Missing modelUsed');
  }

  if (!Array.isArray(r.observedModels)) {
    reasons.push('Missing observedModels array');
  }

  if (typeof r.runnerStatus !== 'string') {
    reasons.push('Missing runnerStatus');
  }

  if (typeof r.review !== 'string' || r.review.length === 0) {
    reasons.push('Missing or empty review text');
  }

  if (reasons.length > 0) {
    return { valid: false, reasons, parsed: null };
  }

  return { valid: true, reasons: [], parsed: review };
}

/**
 * Validates that the review SHA bindings match the dispatch.
 * @param {Object} review
 * @param {Object} dispatch
 * @returns {Object}
 */
export function validateShaBindings(review, dispatch) {
  const reasons = [];

  if (review.repositorySha !== dispatch.exactHeadSha) {
    reasons.push(
      `Repository SHA mismatch: review has ${review.repositorySha}, dispatch expected ${dispatch.exactHeadSha}`
    );
  }

  return { valid: reasons.length === 0, reasons };
}

/**
 * Validates that the reviewer model is an authorized Opus 5 variant.
 * @param {Object} review
 * @param {string} targetModel
 * @returns {Object}
 */
export function validateModelProvenance(review, targetModel) {
  const reasons = [];

  const observedOpusModels = review.observedModels.filter(m => m.includes('opus'));
  if (observedOpusModels.length === 0) {
    reasons.push('No Opus model observed in review');
  }

  const modelUsedValid = review.modelUsed.includes('opus-5') || review.modelUsed.includes('claude-opus-5');
  if (!modelUsedValid) {
    reasons.push(`Model used ${review.modelUsed} is not an Opus 5 variant`);
  }

  const modelMatches = review.modelUsed === targetModel ||
    review.modelUsed.includes('opus-5') ||
    review.observedModels.some(m => m.includes('opus-5') || m.includes('claude-opus-5'));

  return { valid: reasons.length === 0, modelMatches, reasons };
}

/**
 * Validates that the reviewer is different from the implementer.
 * @param {Object} dispatch
 * @param {string} reviewerAgentId
 * @returns {Object}
 */
export function validateReviewerSeparation(dispatch, reviewerAgentId) {
  if (!dispatch.implementerAgentId) {
    return { valid: true, selfReview: false, reason: null };
  }

  if (dispatch.implementerAgentId === reviewerAgentId) {
    return {
      valid: false,
      selfReview: true,
      reason: `Self-review detected: implementer ${dispatch.implementerAgentId} cannot review their own work`,
    };
  }

  if (dispatch.implementerAgentId === dispatch.reviewerAgentId) {
    return {
      valid: false,
      selfReview: true,
      reason: `Dispatch was to implementer session - separation not maintained`,
    };
  }

  return { valid: true, selfReview: false, reason: null };
}

/**
 * Validates that artifact hashes in the review match the receipt.
 * @param {Object} review
 * @param {Object} receipt
 * @returns {Object}
 */
export function validateArtifactHashes(review, receipt) {
  const reasons = [];

  const primaryArtifact = receipt.candidateArtifacts[0];
  if (primaryArtifact) {
    if (review.candidateSha256 !== primaryArtifact.sha256) {
      reasons.push(
        `Primary artifact hash mismatch: review has ${review.candidateSha256}, receipt has ${primaryArtifact.sha256}`
      );
    }
  }

  return { valid: reasons.length === 0, reasons };
}

/**
 * Validates the review verdict.
 * @param {Object} review
 * @returns {Object}
 */
export function validateVerdict(review) {
  const reasons = [];

  if (review.verdict !== 'NO BLOCKERS') {
    reasons.push(`Review verdict is ${review.verdict}`);
  }

  if (review.runnerStatus !== 'success') {
    reasons.push(`Runner status is ${review.runnerStatus}`);
  }

  return {
    passed: review.verdict === 'NO BLOCKERS' && review.runnerStatus === 'success',
    verdict: review.verdict,
    reasons,
  };
}

/**
 * Loads and parses a review artifact from disk.
 * @param {string} artifactPath
 * @returns {Object}
 */
export function loadReviewArtifact(artifactPath) {
  if (!existsSync(artifactPath)) {
    return { loaded: false, review: null, sha256: null, error: `Artifact not found: ${artifactPath}` };
  }

  try {
    const content = readFileSync(artifactPath, 'utf-8');
    const sha256 = createHash('sha256').update(content).digest('hex');
    const parsed = JSON.parse(content);

    const validation = validateReviewStructure(parsed);
    if (!validation.valid) {
      return {
        loaded: true,
        review: null,
        sha256,
        error: `Invalid review structure: ${validation.reasons.join(', ')}`,
      };
    }

    return { loaded: true, review: validation.parsed, sha256, error: null };
  } catch (error) {
    return {
      loaded: false,
      review: null,
      sha256: null,
      error: `Failed to parse artifact: ${error instanceof Error ? error.message : 'unknown error'}`,
    };
  }
}

/**
 * Performs complete review validation.
 * @param {Object} input
 * @returns {Object}
 */
export function validateReview(input) {
  const { dispatch, receipt, reviewArtifactPath, reviewerAgentId } = input;

  const completionId = randomUUID();
  const createdAt = new Date().toISOString();
  const failureReasons = [];

  const loadResult = loadReviewArtifact(reviewArtifactPath);
  if (!loadResult.loaded || !loadResult.review) {
    failureReasons.push(loadResult.error || 'Failed to load review artifact');

    return {
      version: 1,
      completionId,
      createdAt,
      dispatchId: dispatch.dispatchId,
      receiptId: receipt.receiptId,
      prNumber: receipt.prNumber,
      exactHeadSha: receipt.exactHeadSha,
      reviewerAgentId,
      actualModelUsed: 'unknown',
      modelMatchesTarget: false,
      selfReviewDetected: false,
      reviewArtifactPath,
      reviewArtifactSha256: loadResult.sha256 || '',
      verdict: 'BLOCKERS',
      headShaMatches: false,
      artifactHashesMatch: false,
      passed: false,
      failureReasons,
    };
  }

  const review = loadResult.review;

  const shaValidation = validateShaBindings(review, dispatch);
  if (!shaValidation.valid) {
    failureReasons.push(...shaValidation.reasons);
  }

  const modelValidation = validateModelProvenance(review, dispatch.targetModel);
  if (!modelValidation.valid) {
    failureReasons.push(...modelValidation.reasons);
  }

  const separationValidation = validateReviewerSeparation(dispatch, reviewerAgentId);
  if (!separationValidation.valid) {
    failureReasons.push(separationValidation.reason || 'Reviewer separation validation failed');
  }

  const artifactValidation = validateArtifactHashes(review, receipt);
  if (!artifactValidation.valid) {
    failureReasons.push(...artifactValidation.reasons);
  }

  const verdictValidation = validateVerdict(review);
  if (!verdictValidation.passed) {
    failureReasons.push(...verdictValidation.reasons);
  }

  const passed = failureReasons.length === 0 && verdictValidation.passed;

  return {
    version: 1,
    completionId,
    createdAt,
    dispatchId: dispatch.dispatchId,
    receiptId: receipt.receiptId,
    prNumber: receipt.prNumber,
    exactHeadSha: receipt.exactHeadSha,
    reviewerAgentId,
    actualModelUsed: review.modelUsed,
    modelMatchesTarget: modelValidation.modelMatches,
    selfReviewDetected: separationValidation.selfReview,
    reviewArtifactPath,
    reviewArtifactSha256: loadResult.sha256 || '',
    verdict: review.verdict,
    headShaMatches: shaValidation.valid,
    artifactHashesMatch: artifactValidation.valid,
    passed,
    failureReasons,
  };
}

/**
 * Quick check if a review artifact exists and has valid structure.
 * @param {string} artifactPath
 * @returns {boolean}
 */
export function hasValidReviewArtifact(artifactPath) {
  const result = loadReviewArtifact(artifactPath);
  return result.loaded && result.review !== null;
}

/**
 * Creates a completion ID for tracking.
 * @returns {string}
 */
export function createCompletionId() {
  return randomUUID();
}
