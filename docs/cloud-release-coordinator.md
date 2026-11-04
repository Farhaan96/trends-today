# Cloud Release Coordinator

Automated cloud release workflow for Trends Today that advances PRs through independent review, guarded merge, Vercel deployment, and live verification without requiring home PC intervention.

## Overview

The coordinator automates the release pipeline:

1. **Receipt Generation** - Creates durable receipt when PR is ready
2. **Review Dispatch** - Launches independent Opus 5 reviewer session
3. **Review Validation** - Verifies review meets all requirements
4. **Guarded Close** - Merges, waits for deployment, verifies live site
5. **Failure Handling** - Posts actionable handoffs on any failure

## Requirements

### Preserved Safety Gates

The coordinator preserves all existing safety requirements:

- **Exact-SHA binding** - All reviews bound to exact HEAD SHA
- **Reviewer separation** - Implementer cannot review own work
- **Owner approval gates** - Sensitive/sponsored content requires manual approval
- **Independent review** - Opus 5 reviewer in separate session
- **Artifact hash matching** - All artifacts verified by hash

### Fail-Closed Conditions

The coordinator fails closed on:

- Stale HEAD (commits pushed after receipt)
- Failed or missing CI checks
- Self-review attempt (same agent session)
- Missing or unavailable Opus 5 model
- Unverified model provenance
- BLOCKERS verdict from review
- Sensitive content keywords detected
- Owner-gated category detected
- Dirty or unmatched artifacts
- Failed Vercel deployment
- Failed live verification

## Configuration

Configuration lives in `config/release-coordinator.json`:

```json
{
  "version": 1,
  "enabled": false,
  "killSwitch": {
    "disabled": true,
    "disabledReason": "Initial deployment",
    "disabledAt": null,
    "disabledBy": null
  },
  "autoMergeEnabled": false,
  "targetModel": "claude-opus-5-thinking-medium",
  "timeoutMinutes": {
    "reviewDispatch": 5,
    "reviewCompletion": 30,
    "deploymentWait": 10,
    "liveVerification": 15
  },
  "retryPolicy": {
    "maxRetries": 2,
    "retryDelayMs": 5000,
    "exponentialBackoff": true
  },
  "costCeilings": {
    "maxDailyReviews": 10,
    "maxDailyMerges": 6,
    "warningThresholdPercent": 80
  }
}
```

### Environment Variable Overrides

- `RELEASE_COORDINATOR_ENABLED` - Override enabled state (`true`/`false`)
- `RELEASE_COORDINATOR_KILL_SWITCH` - Engage kill switch (`true`)
- `RELEASE_COORDINATOR_AUTO_MERGE` - Override auto-merge (`true`/`false`)
- `RELEASE_COORDINATOR_MODEL` - Override target model

## Kill Switch

### Emergency Stop

To immediately stop all coordinator operations:

1. **Via Configuration**:
   ```json
   {
     "killSwitch": {
       "disabled": true,
       "disabledReason": "Emergency stop - investigating issue",
       "disabledAt": "2026-09-06T00:00:00Z",
       "disabledBy": "your-name"
     }
   }
   ```

2. **Via Environment**:
   ```bash
   export RELEASE_COORDINATOR_KILL_SWITCH=true
   ```

3. **Via Code**:
   ```typescript
   import { loadConfig, saveConfig, engageKillSwitch } from './lib/release-coordinator';
   
   const config = loadConfig();
   const updated = engageKillSwitch(config, 'Reason for stop', 'your-name');
   saveConfig(updated);
   ```

### Re-enabling

To re-enable after investigation:

```typescript
import { loadConfig, saveConfig, disengageKillSwitch } from './lib/release-coordinator';

const config = loadConfig();
const updated = disengageKillSwitch(config);
saveConfig(updated);
```

## Triggers

### Automatic Triggers

The coordinator activates when:

1. PR has all required CI checks passing
2. Visual/browser QA completed
3. GPT editorial review passed (all scores >= 4/5, 0 em-dashes)
4. PR is not draft
5. PR has no excluded labels (`do-not-merge`, `wip`, `blocked`)
6. No sensitive content detected
7. No owner-gated categories

### Manual Trigger

To manually trigger coordinator for a PR:

```typescript
import { ReleaseCoordinator } from './lib/release-coordinator';

const coordinator = new ReleaseCoordinator();
const receipt = coordinator.generateReceipt({
  prSnapshot,
  implementerAgentId,
  ciRunUrl,
  visualQaEvidence,
  gptReview,
  candidateArtifactPaths,
  prBody,
});
```

## Cost Ceilings

### Daily Limits

- **Max reviews per day**: 10 (configurable)
- **Max merges per day**: 6 (matches editorial sweep limit)
- **Warning threshold**: 80% of daily limit

### Monitoring

The coordinator tracks daily statistics:

- Reviews dispatched
- Reviews completed
- Merges completed
- Failures recorded

## Timeout Behavior

### Timeouts

| Operation | Default | Configurable |
|-----------|---------|--------------|
| Review dispatch | 5 min | Yes |
| Review completion | 30 min | Yes |
| Deployment wait | 10 min | Yes |
| Live verification | 15 min | Yes |

### Retry Policy

- Max retries: 2
- Initial delay: 5000ms
- Exponential backoff: Enabled

## Credentials Required

### GitHub

- Read access to PR status
- Write access to post comments
- Merge permissions (when auto-merge enabled)

### Cursor Cloud

- Ability to dispatch Task subagents
- Access to Opus 5 model variants

### Vercel

- Read access to deployment status
- (No write access needed)

## Rollout Plan

### Phase 1: Disabled (Current)

- All code deployed but disabled
- Kill switch engaged
- Auto-merge disabled
- Tests passing

### Phase 2: PR #184 Pilot

Prerequisites:
- PR #184 independent review completed manually
- All negative-path tests passing
- Kill switch disengaged but auto-merge still disabled

Actions:
1. Enable coordinator (`enabled: true`)
2. Keep kill switch disengaged (`disabled: false`)
3. Keep auto-merge disabled (`autoMergeEnabled: false`)
4. Monitor PR #184 through manual merge

### Phase 3: Limited Auto-Merge

Prerequisites:
- 2-3 successful manual releases with coordinator
- No false positives or negatives in review validation
- Deployment verification reliable

Actions:
1. Enable auto-merge for specific labels only
2. Monitor first 3 auto-merged releases
3. Keep Windows fallback available

### Phase 4: Full Production

Prerequisites:
- 5+ successful auto-merged releases
- No incidents requiring rollback
- Windows fallback tested but unused

Actions:
1. Remove Windows fallback dependency
2. Enable full auto-merge
3. Set up alerting for failures

## Monitoring and Alerts

### Success Indicators

- Receipt generated successfully
- Review dispatched within timeout
- Review completed with NO BLOCKERS
- Deployment found and matches SHA
- Live verification passes

### Failure Alerts

The coordinator posts PR comments for:

- Any eligibility failure
- Review dispatch failure
- Review validation failure
- Merge failure
- Deployment failure
- Verification failure

### Log Locations

- Receipt artifacts: `artifacts/editorial/receipts/`
- Review artifacts: `artifacts/editorial/reviews/release/`
- Close records: `artifacts/editorial/closes/`
- Handoff records: `artifacts/editorial/handoffs/`

## Testing

### Run All Tests

```bash
# Run all coordinator tests
node --test tests/release-coordinator/*.test.mjs
```

### Specific Test Suites

```bash
# Configuration tests
node --test tests/release-coordinator/config.test.mjs

# Receipt generator tests
node --test tests/release-coordinator/receipt-generator.test.mjs

# Reviewer dispatcher tests
node --test tests/release-coordinator/reviewer-dispatcher.test.mjs

# Review validator tests
node --test tests/release-coordinator/review-validator.test.mjs

# Guarded closer tests
node --test tests/release-coordinator/guarded-closer.test.mjs

# Failure handler tests
node --test tests/release-coordinator/failure-handler.test.mjs

# Negative path tests
node --test tests/release-coordinator/negative-paths.test.mjs
```

## Architecture

### Module Structure

```
lib/release-coordinator/
├── types.ts              # TypeScript interfaces
├── config.ts             # Configuration and kill switch
├── receipt-generator.ts  # Release candidate receipts
├── reviewer-dispatcher.ts # Independent review dispatch
├── review-validator.ts   # Review validation logic
├── guarded-closer.ts     # Merge, deploy, verify
├── failure-handler.ts    # PR failure handoffs
└── index.ts              # Main coordinator class
```

### Data Flow

```
PR Ready → Receipt → Dispatch → Review → Validate → Close → Verify
    ↓          ↓         ↓         ↓          ↓         ↓
 Handoff   Handoff   Handoff   Handoff    Handoff   Success
```

## Troubleshooting

### Common Issues

**Receipt fails with "CI checks pending"**
- Wait for all checks to complete
- Check GitHub Actions for stuck jobs

**Dispatch fails with "Self-review detected"**
- A different cloud session must perform review
- Check implementerAgentId matches reviewerAgentId

**Review fails with "not an Opus 5 variant"**
- Verify the model used in review artifact
- Check available Opus 5 models in Cursor

**Deployment fails with "not found"**
- Check Vercel dashboard for deployment status
- Verify merge SHA matches deployment commit

### Recovery Steps

1. **Kill switch engaged accidentally**
   - Check `config/release-coordinator.json`
   - Verify `killSwitch.disabled` is `false`

2. **Stuck in review state**
   - Check if review session completed
   - Verify review artifact exists

3. **Deployment mismatch**
   - Verify merge commit SHA
   - Check Vercel deployment commit SHA
   - May need to re-trigger deployment

## Support

For issues with the coordinator:

1. Check PR comments for failure handoff
2. Review logs in artifact directories
3. Check configuration state
4. Engage kill switch if needed for investigation
