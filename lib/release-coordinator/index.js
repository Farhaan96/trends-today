/**
 * Cloud Release Coordinator
 *
 * Main orchestrator for automated release workflow.
 */

export * from './config.js';
export * from './receipt-generator.js';
export * from './reviewer-dispatcher.js';
export * from './review-validator.js';
export * from './guarded-closer.js';
export * from './failure-handler.js';

import { loadConfig, isCoordinatorActive, isAutoMergeEnabled, getConfigWithEnvOverrides } from './config.js';
import { generateReceipt, validateReceiptAgainstCurrentState } from './receipt-generator.js';
import { createDispatchRecord, validateDispatchAgainstReceipt, isDispatchTimedOut, getReviewArtifactPath } from './reviewer-dispatcher.js';
import { validateReview, hasValidReviewArtifact } from './review-validator.js';
import {
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
} from './guarded-closer.js';
import {
  createHandoffFromReceipt,
  createHandoffFromDispatch,
  createHandoffFromReview,
  createHandoffFromClose,
  formatHandoffAsComment,
  markHandoffPosted,
  shouldPostHandoff,
} from './failure-handler.js';

/**
 * Main coordinator class that orchestrates the release workflow.
 */
export class ReleaseCoordinator {
  constructor(config) {
    this.config = config || getConfigWithEnvOverrides();
  }

  isActive() {
    return isCoordinatorActive(this.config);
  }

  canAutoMerge() {
    return isAutoMergeEnabled(this.config);
  }

  getConfig() {
    return this.config;
  }

  reloadConfig() {
    this.config = getConfigWithEnvOverrides();
  }

  generateReceipt(input) {
    return generateReceipt({ ...input, config: this.config });
  }

  validateReceipt(receipt, currentSnapshot) {
    return validateReceiptAgainstCurrentState(receipt, currentSnapshot);
  }

  createDispatch(input) {
    return createDispatchRecord({ ...input, config: this.config });
  }

  validateDispatch(dispatch, receipt) {
    return validateDispatchAgainstReceipt(dispatch, receipt);
  }

  isDispatchTimedOut(dispatch) {
    return isDispatchTimedOut(dispatch);
  }

  validateReview(input) {
    return validateReview(input);
  }

  hasReviewArtifact(receiptId) {
    return hasValidReviewArtifact(getReviewArtifactPath(receiptId));
  }

  createCloseRecord(input) {
    return createCloseRecord({ ...input, config: this.config });
  }

  recordMergeSuccess(closeRecord, mergeSha, mergedBy) {
    return updateCloseRecordAfterMerge(closeRecord, mergeSha, mergedBy);
  }

  recordMergeFailure(closeRecord, reason) {
    return updateCloseRecordMergeFailed(closeRecord, reason);
  }

  recordDeploymentSuccess(closeRecord, deployment, waitedMs) {
    return updateCloseRecordAfterDeployment(closeRecord, deployment, waitedMs);
  }

  recordDeploymentFailure(closeRecord, reason, waitedMs) {
    return updateCloseRecordDeploymentFailed(closeRecord, reason, waitedMs);
  }

  recordVerification(closeRecord, verification) {
    return updateCloseRecordAfterVerification(closeRecord, verification);
  }

  canProceedWithClose(closeRecord) {
    return canProceedWithClose(closeRecord);
  }

  wasMergeSuccessful(closeRecord) {
    return wasMergeSuccessful(closeRecord);
  }

  wasDeploymentSuccessful(closeRecord) {
    return wasDeploymentSuccessful(closeRecord);
  }

  wasVerificationSuccessful(closeRecord) {
    return wasVerificationSuccessful(closeRecord);
  }

  createHandoff(stage, data) {
    switch (stage) {
      case 'receipt':
        return createHandoffFromReceipt({
          receipt: data.receipt,
          outcome: data.outcome || 'blocked_missing_checks',
        });

      case 'dispatch':
        if (!data.dispatch) {
          throw new Error('dispatch required for dispatch stage handoff');
        }
        return createHandoffFromDispatch({
          dispatch: data.dispatch,
          receipt: data.receipt,
          outcome: data.outcome || 'blocked_self_review',
          failureReasons: data.failureReasons || [],
        });

      case 'review':
        if (!data.completion) {
          throw new Error('completion required for review stage handoff');
        }
        return createHandoffFromReview({
          completion: data.completion,
          receipt: data.receipt,
          outcome: data.outcome || 'blocked_review_blockers',
        });

      case 'close':
        if (!data.closeRecord) {
          throw new Error('closeRecord required for close stage handoff');
        }
        return createHandoffFromClose({
          closeRecord: data.closeRecord,
          receipt: data.receipt,
        });

      default:
        throw new Error(`Unknown stage: ${stage}`);
    }
  }

  formatHandoffComment(handoff) {
    return formatHandoffAsComment(handoff);
  }

  markHandoffPosted(handoff) {
    return markHandoffPosted(handoff);
  }

  shouldPostHandoff(handoff) {
    return shouldPostHandoff(handoff);
  }
}

/**
 * Creates a new coordinator instance.
 * @param {Object} [config]
 * @returns {ReleaseCoordinator}
 */
export function createCoordinator(config) {
  return new ReleaseCoordinator(config);
}

export default ReleaseCoordinator;
