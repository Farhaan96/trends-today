/**
 * Cloud Release Coordinator Type Definitions (JSDoc)
 *
 * This file contains JSDoc type definitions for the release coordinator.
 * Types are documented here for reference but not enforced at runtime.
 */

/**
 * Supported model slugs for independent review.
 * @typedef {'claude-opus-5-thinking-high'|'claude-opus-5-thinking-high-fast'|'claude-opus-5-thinking-low'|'claude-opus-5-thinking-low-fast'|'claude-opus-5-thinking-max'|'claude-opus-5-thinking-max-fast'|'claude-opus-5-thinking-medium'|'claude-opus-5-thinking-medium-fast'|'claude-opus-5-thinking-xhigh'|'claude-opus-5-thinking-xhigh-fast'} OpusReviewerModel
 */

/**
 * Review verdict from Claude release review.
 * @typedef {'NO BLOCKERS'|'BLOCKERS'} ReviewVerdict
 */

/**
 * GPT editorial review verdict.
 * @typedef {'PASS'|'FAIL'} GptVerdict
 */

/**
 * Terminal states for release coordination.
 * @typedef {'success'|'blocked_stale_head'|'blocked_ci_failure'|'blocked_missing_checks'|'blocked_self_review'|'blocked_model_unavailable'|'blocked_model_unverified'|'blocked_review_blockers'|'blocked_sensitive_content'|'blocked_owner_gate'|'blocked_dirty_artifacts'|'blocked_hash_mismatch'|'blocked_deploy_failure'|'blocked_verification_failure'|'blocked_timeout'|'blocked_missing_evidence'|'error_system'} ReleaseOutcome
 */

/**
 * @typedef {Object} CICheckStatus
 * @property {string} name
 * @property {'queued'|'in_progress'|'completed'} status
 * @property {'success'|'failure'|'neutral'|'cancelled'|'skipped'|'timed_out'|'action_required'|null} conclusion
 * @property {string|null} completedAt
 * @property {string|null} detailsUrl
 */

/**
 * @typedef {Object} PRStateSnapshot
 * @property {number} prNumber
 * @property {string} prUrl
 * @property {string} headSha
 * @property {string} baseBranch
 * @property {string} headBranch
 * @property {string} title
 * @property {'open'|'closed'|'merged'} state
 * @property {boolean} isDraft
 * @property {string[]} labels
 * @property {boolean} checksComplete
 * @property {boolean} checksAllPassing
 * @property {CICheckStatus[]} checks
 * @property {string} updatedAt
 * @property {string} snapshotAt
 */

/**
 * @typedef {Object} ArtifactBinding
 * @property {string} path
 * @property {string} sha256
 * @property {number} size
 * @property {string} capturedAt
 */

/**
 * @typedef {Object} VisualQAEvidence
 * @property {boolean} completed
 * @property {boolean} desktopPassed
 * @property {boolean} mobilePassed
 * @property {boolean} consolePassed
 * @property {boolean} interactionPassed
 * @property {string[]} screenshotPaths
 * @property {string|null} reportPath
 * @property {string|null} completedAt
 * @property {string|null} agentId
 */

/**
 * @typedef {Object} GptEditorialReviewScores
 * @property {number} factualSupport
 * @property {number} quality
 * @property {number} readability
 * @property {number} formatting
 * @property {number} engagement
 */

/**
 * @typedef {Object} GptEditorialReview
 * @property {1} version
 * @property {'openai-gpt'} reviewer
 * @property {GptVerdict} verdict
 * @property {string} candidateSha256
 * @property {string} repositorySha
 * @property {string} reviewedAt
 * @property {string} modelUsed
 * @property {string} reviewBackend
 * @property {string} reviewRunId
 * @property {GptEditorialReviewScores} scores
 * @property {number} proseEmDashCount
 * @property {string[]} blockers
 * @property {string} summary
 */

/**
 * @typedef {Object} ClaudeReleaseReview
 * @property {1} version
 * @property {'claude'} reviewer
 * @property {ReviewVerdict} verdict
 * @property {string} candidateSha256
 * @property {string} reviewedAt
 * @property {string} repositorySha
 * @property {string} modelUsed
 * @property {string[]} observedModels
 * @property {boolean} [fallbackDisabled]
 * @property {boolean} [fallbackUsed]
 * @property {'success'|'failure'|'timeout'} runnerStatus
 * @property {string} [runnerOutput]
 * @property {string} review
 */

/**
 * @typedef {Object} ReleaseCandidateReceipt
 * @property {1} version
 * @property {string} receiptId
 * @property {string} createdAt
 * @property {number} prNumber
 * @property {string} prUrl
 * @property {string} repositoryFullName
 * @property {string} exactHeadSha
 * @property {string} baseBranch
 * @property {string} headBranch
 * @property {string|null} implementerAgentId
 * @property {string|null} implementerSessionId
 * @property {Object} ciEvidence
 * @property {VisualQAEvidence|null} visualQaEvidence
 * @property {Object|null} gptEditorialEvidence
 * @property {ArtifactBinding[]} candidateArtifacts
 * @property {Object} eligibilityChecks
 * @property {'pending_review'|'review_dispatched'|'review_complete'|'closing'|'closed'|'failed'} status
 */

/**
 * @typedef {Object} ReviewDispatchRecord
 * @property {1} version
 * @property {string} dispatchId
 * @property {string} createdAt
 * @property {string} receiptId
 * @property {number} prNumber
 * @property {string} exactHeadSha
 * @property {OpusReviewerModel} targetModel
 * @property {string} reviewerAgentId
 * @property {string} reviewerSessionUrl
 * @property {string|null} implementerAgentId
 * @property {boolean} separationVerified
 * @property {boolean} modelVerified
 * @property {string} prompt
 * @property {number} timeoutMinutes
 * @property {string} dispatchedBy
 */

/**
 * @typedef {Object} ReviewCompletionRecord
 * @property {1} version
 * @property {string} completionId
 * @property {string} createdAt
 * @property {string} dispatchId
 * @property {string} receiptId
 * @property {number} prNumber
 * @property {string} exactHeadSha
 * @property {string} reviewerAgentId
 * @property {string} actualModelUsed
 * @property {boolean} modelMatchesTarget
 * @property {boolean} selfReviewDetected
 * @property {string} reviewArtifactPath
 * @property {string} reviewArtifactSha256
 * @property {ReviewVerdict} verdict
 * @property {boolean} headShaMatches
 * @property {boolean} artifactHashesMatch
 * @property {boolean} passed
 * @property {string[]} failureReasons
 */

/**
 * @typedef {Object} VercelDeployment
 * @property {string} id
 * @property {string} url
 * @property {'BUILDING'|'ERROR'|'INITIALIZING'|'QUEUED'|'READY'|'CANCELED'} state
 * @property {string} createdAt
 * @property {string|null} readyAt
 * @property {string|null} buildingAt
 * @property {Object} meta
 * @property {'production'|'preview'|null} target
 */

/**
 * @typedef {Object} LiveVerificationEvidence
 * @property {boolean} verified
 * @property {string} canonicalUrl
 * @property {boolean} desktopVerified
 * @property {boolean} mobileVerified
 * @property {boolean} headlineMatches
 * @property {boolean} dateMatches
 * @property {boolean} imagesLoad
 * @property {boolean} noConsoleErrors
 * @property {boolean} jsonLdValid
 * @property {boolean} sitemapPresent
 * @property {string[]} screenshotPaths
 * @property {string} verifiedAt
 * @property {string|null} verifierAgentId
 * @property {string[]} failureReasons
 */

/**
 * @typedef {Object} GuardedCloseRecord
 * @property {1} version
 * @property {string} closeId
 * @property {string} createdAt
 * @property {string} receiptId
 * @property {string} reviewCompletionId
 * @property {number} prNumber
 * @property {string} prUrl
 * @property {Object} preCloseChecks
 * @property {Object} mergeEvidence
 * @property {Object} deploymentEvidence
 * @property {LiveVerificationEvidence|null} liveVerification
 * @property {Object} rollbackEvidence
 * @property {ReleaseOutcome} outcome
 * @property {string|null} closedAt
 */

/**
 * @typedef {Object} FailureHandoff
 * @property {1} version
 * @property {string} handoffId
 * @property {string} createdAt
 * @property {string} receiptId
 * @property {number} prNumber
 * @property {string} prUrl
 * @property {'eligibility'|'dispatch'|'review'|'close'|'deploy'|'verify'} stage
 * @property {ReleaseOutcome} outcome
 * @property {string} actionRequired
 * @property {string} details
 * @property {Object} evidence
 * @property {boolean} postedTopr
 * @property {string|null} postedAt
 */

/**
 * @typedef {Object} CoordinatorConfig
 * @property {1} version
 * @property {boolean} enabled
 * @property {Object} killSwitch
 * @property {boolean} autoMergeEnabled
 * @property {OpusReviewerModel} targetModel
 * @property {Object} timeoutMinutes
 * @property {Object} retryPolicy
 * @property {Object} costCeilings
 * @property {string[]} eligiblePRLabels
 * @property {string[]} excludedPRLabels
 * @property {string[]} sensitiveKeywords
 * @property {string[]} ownerGatedCategories
 */

export {};
