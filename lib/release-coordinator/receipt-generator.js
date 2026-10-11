/**
 * Release Candidate Receipt Generator
 *
 * Creates durable receipts when a PR reaches release-ready state:
 * - Exact HEAD SHA captured
 * - All required CI checks passing
 * - Visual/browser QA completed
 * - GPT editorial review passed
 * - Eligibility checks verified
 */

import { createHash, randomUUID } from 'crypto';
import { readFileSync, existsSync } from 'fs';

/**
 * Computes SHA-256 hash of a file.
 * @param {string} filePath
 * @returns {string}
 */
export function computeFileSha256(filePath) {
  const content = readFileSync(filePath);
  return createHash('sha256').update(content).digest('hex');
}

/**
 * Creates an artifact binding for exact-match verification.
 * @param {string} filePath
 * @returns {Object|null}
 */
export function createArtifactBinding(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }

  const content = readFileSync(filePath);
  return {
    path: filePath,
    sha256: createHash('sha256').update(content).digest('hex'),
    size: content.length,
    capturedAt: new Date().toISOString(),
  };
}

/**
 * Checks if all required CI checks have passed.
 * @param {Array} checks
 * @returns {Object}
 */
export function checkCIStatus(checks) {
  const failedChecks = [];
  const pendingChecks = [];

  for (const check of checks) {
    if (check.status !== 'completed') {
      pendingChecks.push(check.name);
    } else if (check.conclusion !== 'success' && check.conclusion !== 'skipped' && check.conclusion !== 'neutral') {
      failedChecks.push(check.name);
    }
  }

  return {
    allPassed: failedChecks.length === 0 && pendingChecks.length === 0,
    allComplete: pendingChecks.length === 0,
    failedChecks,
    pendingChecks,
  };
}

/**
 * Validates GPT editorial review meets requirements.
 * @param {Object|null} review
 * @param {string} candidateSha256
 * @param {string} repositorySha
 * @returns {Object}
 */
export function validateGptReview(review, candidateSha256, repositorySha) {
  const reasons = [];

  if (!review) {
    reasons.push('GPT editorial review not found');
    return { valid: false, reasons };
  }

  if (review.version !== 1) {
    reasons.push(`Invalid review version: ${review.version}`);
  }

  if (review.reviewer !== 'openai-gpt') {
    reasons.push(`Invalid reviewer: ${review.reviewer}`);
  }

  if (review.verdict !== 'PASS') {
    reasons.push(`Review verdict is ${review.verdict}, not PASS`);
  }

  if (review.candidateSha256 !== candidateSha256) {
    reasons.push(`Candidate SHA mismatch: review has ${review.candidateSha256}, expected ${candidateSha256}`);
  }

  if (review.repositorySha !== repositorySha) {
    reasons.push(`Repository SHA mismatch: review has ${review.repositorySha}, expected ${repositorySha}`);
  }

  const scoreFields = ['factualSupport', 'quality', 'readability', 'formatting', 'engagement'];
  for (const field of scoreFields) {
    const score = review.scores[field];
    if (typeof score !== 'number' || score < 4) {
      reasons.push(`${field} score ${score} is below minimum 4`);
    }
  }

  if (review.proseEmDashCount > 0) {
    reasons.push(`Prose em-dash count ${review.proseEmDashCount} exceeds maximum 0`);
  }

  if (review.blockers && review.blockers.length > 0) {
    reasons.push(`Review has ${review.blockers.length} blockers: ${review.blockers.join(', ')}`);
  }

  return { valid: reasons.length === 0, reasons };
}

/**
 * Checks for sensitive content keywords.
 * @param {string} title
 * @param {string} body
 * @param {string[]} keywords
 * @returns {Object}
 */
export function checkSensitiveContent(title, body, keywords) {
  const combined = `${title} ${body}`.toLowerCase();
  const matches = [];

  for (const keyword of keywords) {
    if (combined.includes(keyword.toLowerCase())) {
      matches.push(keyword);
    }
  }

  return { found: matches.length > 0, matches };
}

/**
 * Checks for owner-gated categories in PR content.
 * @param {string[]} labels
 * @param {string} body
 * @param {string[]} gatedCategories
 * @returns {Object}
 */
export function checkOwnerGatedCategories(labels, body, gatedCategories) {
  const matches = [];
  const combinedLabels = labels.join(' ').toLowerCase();
  const bodyLower = body.toLowerCase();

  for (const category of gatedCategories) {
    if (combinedLabels.includes(category.toLowerCase()) || bodyLower.includes(category.toLowerCase())) {
      matches.push(category);
    }
  }

  return { gated: matches.length > 0, matches };
}

/**
 * Generates a release candidate receipt.
 * @param {Object} input
 * @returns {Object}
 */
export function generateReceipt(input) {
  const {
    prSnapshot,
    implementerAgentId,
    implementerSessionId,
    ciRunUrl,
    visualQaEvidence,
    gptReview,
    gptReviewArtifactPath,
    candidateArtifactPaths,
    config,
    prBody,
  } = input;

  const receiptId = randomUUID();
  const createdAt = new Date().toISOString();

  const ciStatus = checkCIStatus(prSnapshot.checks);

  const candidateArtifacts = [];
  for (const path of candidateArtifactPaths) {
    const binding = createArtifactBinding(path);
    if (binding) {
      candidateArtifacts.push(binding);
    }
  }

  const sensitiveCheck = checkSensitiveContent(prSnapshot.title, prBody, config.sensitiveKeywords);
  const ownerGatedCheck = checkOwnerGatedCategories(prSnapshot.labels, prBody, config.ownerGatedCategories);

  let gptEditorialEvidence = null;
  if (gptReview && gptReviewArtifactPath && existsSync(gptReviewArtifactPath)) {
    gptEditorialEvidence = {
      passed: gptReview.verdict === 'PASS',
      artifactPath: gptReviewArtifactPath,
      artifactSha256: computeFileSha256(gptReviewArtifactPath),
      scores: gptReview.scores,
      proseEmDashCount: gptReview.proseEmDashCount,
    };
  }

  const gptValidation = validateGptReview(gptReview, gptReview?.candidateSha256 || '', prSnapshot.headSha);

  const failureReasons = [];

  const stableHead = !prSnapshot.isDraft && prSnapshot.state === 'open';
  if (!stableHead) {
    failureReasons.push('PR is not in stable open state (may be draft or closed)');
  }

  const ciPassed = ciStatus.allPassed;
  if (!ciPassed) {
    if (ciStatus.failedChecks.length > 0) {
      failureReasons.push(`CI checks failed: ${ciStatus.failedChecks.join(', ')}`);
    }
    if (ciStatus.pendingChecks.length > 0) {
      failureReasons.push(`CI checks pending: ${ciStatus.pendingChecks.join(', ')}`);
    }
  }

  const visualQaPassed = visualQaEvidence?.completed && visualQaEvidence.desktopPassed && visualQaEvidence.mobilePassed;
  if (!visualQaPassed) {
    failureReasons.push('Visual QA not completed or failed');
  }

  const gptEditorialPassed = gptValidation.valid;
  if (!gptEditorialPassed) {
    failureReasons.push(...gptValidation.reasons);
  }

  const notSensitive = !sensitiveCheck.found;
  if (!notSensitive) {
    failureReasons.push(`Sensitive keywords detected: ${sensitiveCheck.matches.join(', ')}`);
  }

  const notOwnerGated = !ownerGatedCheck.gated;
  if (!notOwnerGated) {
    failureReasons.push(`Owner-gated categories detected: ${ownerGatedCheck.matches.join(', ')}`);
  }

  const allPassed = stableHead && ciPassed && visualQaPassed && gptEditorialPassed && notSensitive && notOwnerGated;

  const receipt = {
    version: 1,
    receiptId,
    createdAt,
    prNumber: prSnapshot.prNumber,
    prUrl: prSnapshot.prUrl,
    repositoryFullName: extractRepoFromUrl(prSnapshot.prUrl),
    exactHeadSha: prSnapshot.headSha,
    baseBranch: prSnapshot.baseBranch,
    headBranch: prSnapshot.headBranch,
    implementerAgentId,
    implementerSessionId,
    ciEvidence: {
      allChecksPassed: ciStatus.allPassed,
      checks: prSnapshot.checks,
      ciRunUrl,
      capturedAt: prSnapshot.snapshotAt,
    },
    visualQaEvidence,
    gptEditorialEvidence,
    candidateArtifacts,
    eligibilityChecks: {
      stableHead,
      ciPassed,
      visualQaPassed,
      gptEditorialPassed,
      notSensitive,
      notOwnerGated,
      allPassed,
      failureReasons,
    },
    status: allPassed ? 'pending_review' : 'failed',
  };

  return receipt;
}

/**
 * Extracts repository full name from PR URL.
 * @param {string} prUrl
 * @returns {string}
 */
function extractRepoFromUrl(prUrl) {
  const match = prUrl.match(/github\.com\/([^/]+\/[^/]+)\/pull/);
  return match ? match[1] : '';
}

/**
 * Validates that a receipt is still valid against current PR state.
 * @param {Object} receipt
 * @param {Object} currentSnapshot
 * @returns {Object}
 */
export function validateReceiptAgainstCurrentState(receipt, currentSnapshot) {
  const reasons = [];

  if (receipt.exactHeadSha !== currentSnapshot.headSha) {
    reasons.push(`HEAD SHA changed: receipt has ${receipt.exactHeadSha}, current is ${currentSnapshot.headSha}`);
  }

  if (currentSnapshot.state !== 'open') {
    reasons.push(`PR state changed to ${currentSnapshot.state}`);
  }

  if (currentSnapshot.isDraft) {
    reasons.push('PR converted to draft');
  }

  const ciStatus = checkCIStatus(currentSnapshot.checks);
  if (!ciStatus.allPassed) {
    if (ciStatus.failedChecks.length > 0) {
      reasons.push(`CI checks now failing: ${ciStatus.failedChecks.join(', ')}`);
    }
  }

  return { valid: reasons.length === 0, reasons };
}

/**
 * Creates a receipt ID for tracking.
 * @returns {string}
 */
export function createReceiptId() {
  return randomUUID();
}
