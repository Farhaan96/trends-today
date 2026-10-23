/**
 * Configuration loader for the Cloud Release Coordinator.
 *
 * Handles:
 * - Loading configuration from JSON file
 * - Kill switch enforcement
 * - Runtime configuration validation
 * - Environment variable overrides
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const CONFIG_PATH = join(process.cwd(), 'config', 'release-coordinator.json');

/** @type {import('./types.js').CoordinatorConfig} */
const DEFAULT_CONFIG = {
  version: 1,
  enabled: false,
  killSwitch: {
    disabled: true,
    disabledReason: 'Default kill switch - must be explicitly enabled',
    disabledAt: null,
    disabledBy: null,
  },
  autoMergeEnabled: false,
  targetModel: 'claude-opus-5-thinking-medium',
  timeoutMinutes: {
    reviewDispatch: 5,
    reviewCompletion: 30,
    deploymentWait: 10,
    liveVerification: 15,
  },
  retryPolicy: {
    maxRetries: 2,
    retryDelayMs: 5000,
    exponentialBackoff: true,
  },
  costCeilings: {
    maxDailyReviews: 10,
    maxDailyMerges: 6,
    warningThresholdPercent: 80,
  },
  eligiblePRLabels: ['ready-for-release', 'codex-automation'],
  excludedPRLabels: ['do-not-merge', 'wip', 'blocked', 'needs-review'],
  sensitiveKeywords: [
    'crime',
    'death',
    'injury',
    'emergency',
    'missing person',
    'allegation',
    'leaked',
    'sponsored',
    'private person',
    'police',
    'arrest',
    'victim',
    'deceased',
    'fatality',
  ],
  ownerGatedCategories: ['sponsored', 'branded', 'supported', 'commercial'],
};

/** @type {string[]} */
const VALID_OPUS_MODELS = [
  'claude-opus-5-thinking-high',
  'claude-opus-5-thinking-high-fast',
  'claude-opus-5-thinking-low',
  'claude-opus-5-thinking-low-fast',
  'claude-opus-5-thinking-max',
  'claude-opus-5-thinking-max-fast',
  'claude-opus-5-thinking-medium',
  'claude-opus-5-thinking-medium-fast',
  'claude-opus-5-thinking-xhigh',
  'claude-opus-5-thinking-xhigh-fast',
];

/**
 * Validates that a model slug is an authorized Opus 5 reviewer model.
 * @param {string} model
 * @returns {boolean}
 */
export function isValidOpusModel(model) {
  return VALID_OPUS_MODELS.includes(model);
}

/**
 * Loads the coordinator configuration from disk.
 * Falls back to defaults if file doesn't exist.
 * @param {string} [configPath]
 * @returns {import('./types.js').CoordinatorConfig}
 */
export function loadConfig(configPath = CONFIG_PATH) {
  if (!existsSync(configPath)) {
    console.warn(`Config file not found at ${configPath}, using defaults`);
    return DEFAULT_CONFIG;
  }

  try {
    const rawConfig = JSON.parse(readFileSync(configPath, 'utf-8'));
    return validateConfig(rawConfig);
  } catch (error) {
    console.error(`Failed to load config from ${configPath}:`, error);
    throw new Error(`Invalid configuration: ${error instanceof Error ? error.message : 'unknown error'}`);
  }
}

/**
 * Validates configuration structure and values.
 * @param {unknown} config
 * @returns {import('./types.js').CoordinatorConfig}
 */
export function validateConfig(config) {
  if (!config || typeof config !== 'object') {
    throw new Error('Configuration must be an object');
  }

  const c = /** @type {Record<string, unknown>} */ (config);

  if (c.version !== 1) {
    throw new Error('Configuration version must be 1');
  }

  if (typeof c.enabled !== 'boolean') {
    throw new Error('enabled must be a boolean');
  }

  if (!c.killSwitch || typeof c.killSwitch !== 'object') {
    throw new Error('killSwitch must be an object');
  }

  const ks = /** @type {Record<string, unknown>} */ (c.killSwitch);
  if (typeof ks.disabled !== 'boolean') {
    throw new Error('killSwitch.disabled must be a boolean');
  }

  if (typeof c.autoMergeEnabled !== 'boolean') {
    throw new Error('autoMergeEnabled must be a boolean');
  }

  if (!isValidOpusModel(/** @type {string} */ (c.targetModel))) {
    throw new Error(`targetModel must be a valid Opus 5 model: ${VALID_OPUS_MODELS.join(', ')}`);
  }

  if (!c.timeoutMinutes || typeof c.timeoutMinutes !== 'object') {
    throw new Error('timeoutMinutes must be an object');
  }

  if (!c.retryPolicy || typeof c.retryPolicy !== 'object') {
    throw new Error('retryPolicy must be an object');
  }

  if (!c.costCeilings || typeof c.costCeilings !== 'object') {
    throw new Error('costCeilings must be an object');
  }

  if (!Array.isArray(c.eligiblePRLabels)) {
    throw new Error('eligiblePRLabels must be an array');
  }

  if (!Array.isArray(c.excludedPRLabels)) {
    throw new Error('excludedPRLabels must be an array');
  }

  if (!Array.isArray(c.sensitiveKeywords)) {
    throw new Error('sensitiveKeywords must be an array');
  }

  if (!Array.isArray(c.ownerGatedCategories)) {
    throw new Error('ownerGatedCategories must be an array');
  }

  return /** @type {import('./types.js').CoordinatorConfig} */ (config);
}

/**
 * Checks if the coordinator is enabled and kill switch is not engaged.
 * @param {import('./types.js').CoordinatorConfig} config
 * @returns {{ active: boolean; reason: string | null }}
 */
export function isCoordinatorActive(config) {
  if (!config.enabled) {
    return { active: false, reason: 'Coordinator is disabled in configuration' };
  }

  if (config.killSwitch.disabled) {
    return {
      active: false,
      reason: config.killSwitch.disabledReason || 'Kill switch is engaged',
    };
  }

  return { active: true, reason: null };
}

/**
 * Checks if auto-merge is enabled (requires coordinator to be active).
 * @param {import('./types.js').CoordinatorConfig} config
 * @returns {{ enabled: boolean; reason: string | null }}
 */
export function isAutoMergeEnabled(config) {
  const { active, reason } = isCoordinatorActive(config);

  if (!active) {
    return { enabled: false, reason };
  }

  if (!config.autoMergeEnabled) {
    return { enabled: false, reason: 'Auto-merge is disabled in configuration' };
  }

  return { enabled: true, reason: null };
}

/**
 * Engages the kill switch with a reason.
 * @param {import('./types.js').CoordinatorConfig} config
 * @param {string} reason
 * @param {string} disabledBy
 * @returns {import('./types.js').CoordinatorConfig}
 */
export function engageKillSwitch(config, reason, disabledBy) {
  return {
    ...config,
    killSwitch: {
      disabled: true,
      disabledReason: reason,
      disabledAt: new Date().toISOString(),
      disabledBy,
    },
  };
}

/**
 * Disengages the kill switch.
 * @param {import('./types.js').CoordinatorConfig} config
 * @returns {import('./types.js').CoordinatorConfig}
 */
export function disengageKillSwitch(config) {
  return {
    ...config,
    killSwitch: {
      disabled: false,
      disabledReason: null,
      disabledAt: null,
      disabledBy: null,
    },
  };
}

/**
 * Saves the configuration to disk.
 * @param {import('./types.js').CoordinatorConfig} config
 * @param {string} [configPath]
 */
export function saveConfig(config, configPath = CONFIG_PATH) {
  const validated = validateConfig(config);
  writeFileSync(configPath, JSON.stringify(validated, null, 2) + '\n', 'utf-8');
}

/**
 * Gets configuration with environment variable overrides.
 * @param {import('./types.js').CoordinatorConfig} [baseConfig]
 * @returns {import('./types.js').CoordinatorConfig}
 */
export function getConfigWithEnvOverrides(baseConfig) {
  const config = baseConfig || loadConfig();

  /** @type {Partial<import('./types.js').CoordinatorConfig>} */
  const envOverrides = {};

  if (process.env.RELEASE_COORDINATOR_ENABLED === 'true') {
    envOverrides.enabled = true;
  } else if (process.env.RELEASE_COORDINATOR_ENABLED === 'false') {
    envOverrides.enabled = false;
  }

  if (process.env.RELEASE_COORDINATOR_KILL_SWITCH === 'true') {
    envOverrides.killSwitch = {
      disabled: true,
      disabledReason: 'Kill switch engaged via environment variable',
      disabledAt: new Date().toISOString(),
      disabledBy: 'environment',
    };
  }

  if (process.env.RELEASE_COORDINATOR_AUTO_MERGE === 'true') {
    envOverrides.autoMergeEnabled = true;
  } else if (process.env.RELEASE_COORDINATOR_AUTO_MERGE === 'false') {
    envOverrides.autoMergeEnabled = false;
  }

  if (process.env.RELEASE_COORDINATOR_MODEL && isValidOpusModel(process.env.RELEASE_COORDINATOR_MODEL)) {
    envOverrides.targetModel = /** @type {import('./types.js').OpusReviewerModel} */ (process.env.RELEASE_COORDINATOR_MODEL);
  }

  return { ...config, ...envOverrides };
}

export { CONFIG_PATH, DEFAULT_CONFIG, VALID_OPUS_MODELS };
