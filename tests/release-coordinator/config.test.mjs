/**
 * Tests for release coordinator configuration module.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

import {
  isValidOpusModel,
  loadConfig,
  validateConfig,
  isCoordinatorActive,
  isAutoMergeEnabled,
  engageKillSwitch,
  disengageKillSwitch,
  VALID_OPUS_MODELS,
  DEFAULT_CONFIG,
} from '../../lib/release-coordinator/config.js';

test('isValidOpusModel accepts all valid Opus 5 models', () => {
  for (const model of VALID_OPUS_MODELS) {
    assert.equal(isValidOpusModel(model), true, `${model} should be valid`);
  }
});

test('isValidOpusModel rejects invalid models', () => {
  assert.equal(isValidOpusModel('claude-sonnet-5'), false);
  assert.equal(isValidOpusModel('gpt-4'), false);
  assert.equal(isValidOpusModel('claude-opus-4'), false);
  assert.equal(isValidOpusModel('random-model'), false);
  assert.equal(isValidOpusModel(''), false);
});

test('validateConfig accepts valid configuration', () => {
  const config = {
    version: 1,
    enabled: true,
    killSwitch: {
      disabled: false,
      disabledReason: null,
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
    eligiblePRLabels: ['ready-for-release'],
    excludedPRLabels: ['do-not-merge'],
    sensitiveKeywords: ['crime'],
    ownerGatedCategories: ['sponsored'],
  };

  const validated = validateConfig(config);
  assert.equal(validated.version, 1);
  assert.equal(validated.enabled, true);
});

test('validateConfig rejects invalid version', () => {
  const config = { ...DEFAULT_CONFIG, version: 2 };
  assert.throws(() => validateConfig(config), /version must be 1/);
});

test('validateConfig rejects invalid model', () => {
  const config = { ...DEFAULT_CONFIG, targetModel: 'invalid-model' };
  assert.throws(() => validateConfig(config), /targetModel must be a valid Opus 5 model/);
});

test('validateConfig rejects missing killSwitch', () => {
  const config = { ...DEFAULT_CONFIG };
  delete config.killSwitch;
  assert.throws(() => validateConfig(config), /killSwitch must be an object/);
});

test('isCoordinatorActive returns false when disabled', () => {
  const config = { ...DEFAULT_CONFIG, enabled: false };
  const result = isCoordinatorActive(config);
  assert.equal(result.active, false);
  assert.ok(result.reason?.includes('disabled'));
});

test('isCoordinatorActive returns false when kill switch engaged', () => {
  const config = {
    ...DEFAULT_CONFIG,
    enabled: true,
    killSwitch: {
      disabled: true,
      disabledReason: 'Manual kill switch',
      disabledAt: new Date().toISOString(),
      disabledBy: 'test',
    },
  };
  const result = isCoordinatorActive(config);
  assert.equal(result.active, false);
  assert.ok(result.reason?.includes('Manual kill switch'));
});

test('isCoordinatorActive returns true when enabled and no kill switch', () => {
  const config = {
    ...DEFAULT_CONFIG,
    enabled: true,
    killSwitch: {
      disabled: false,
      disabledReason: null,
      disabledAt: null,
      disabledBy: null,
    },
  };
  const result = isCoordinatorActive(config);
  assert.equal(result.active, true);
  assert.equal(result.reason, null);
});

test('isAutoMergeEnabled returns false when coordinator inactive', () => {
  const config = { ...DEFAULT_CONFIG, enabled: false, autoMergeEnabled: true };
  const result = isAutoMergeEnabled(config);
  assert.equal(result.enabled, false);
});

test('isAutoMergeEnabled returns false when auto-merge disabled', () => {
  const config = {
    ...DEFAULT_CONFIG,
    enabled: true,
    autoMergeEnabled: false,
    killSwitch: { disabled: false, disabledReason: null, disabledAt: null, disabledBy: null },
  };
  const result = isAutoMergeEnabled(config);
  assert.equal(result.enabled, false);
});

test('isAutoMergeEnabled returns true when all conditions met', () => {
  const config = {
    ...DEFAULT_CONFIG,
    enabled: true,
    autoMergeEnabled: true,
    killSwitch: { disabled: false, disabledReason: null, disabledAt: null, disabledBy: null },
  };
  const result = isAutoMergeEnabled(config);
  assert.equal(result.enabled, true);
});

test('engageKillSwitch sets all fields correctly', () => {
  const config = {
    ...DEFAULT_CONFIG,
    killSwitch: { disabled: false, disabledReason: null, disabledAt: null, disabledBy: null },
  };
  const updated = engageKillSwitch(config, 'Test reason', 'test-user');

  assert.equal(updated.killSwitch.disabled, true);
  assert.equal(updated.killSwitch.disabledReason, 'Test reason');
  assert.equal(updated.killSwitch.disabledBy, 'test-user');
  assert.ok(updated.killSwitch.disabledAt);
});

test('disengageKillSwitch clears all fields', () => {
  const config = {
    ...DEFAULT_CONFIG,
    killSwitch: {
      disabled: true,
      disabledReason: 'Test',
      disabledAt: new Date().toISOString(),
      disabledBy: 'test',
    },
  };
  const updated = disengageKillSwitch(config);

  assert.equal(updated.killSwitch.disabled, false);
  assert.equal(updated.killSwitch.disabledReason, null);
  assert.equal(updated.killSwitch.disabledAt, null);
  assert.equal(updated.killSwitch.disabledBy, null);
});

test('loadConfig returns defaults when file not found', () => {
  const config = loadConfig('/nonexistent/path/config.json');
  assert.equal(config.version, 1);
  assert.equal(config.enabled, false);
});

test('loadConfig loads valid config from file', () => {
  const tempDir = mkdtempSync(join(tmpdir(), 'release-coord-test-'));
  const configPath = join(tempDir, 'config.json');

  const testConfig = {
    ...DEFAULT_CONFIG,
    enabled: true,
    targetModel: 'claude-opus-5-thinking-high',
  };

  writeFileSync(configPath, JSON.stringify(testConfig));

  try {
    const loaded = loadConfig(configPath);
    assert.equal(loaded.enabled, true);
    assert.equal(loaded.targetModel, 'claude-opus-5-thinking-high');
  } finally {
    rmSync(tempDir, { recursive: true });
  }
});
