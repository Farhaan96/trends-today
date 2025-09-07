# Parallel Agent Execution

---
name: "run-parallel"  
description: "Execute multiple compatible agents simultaneously for maximum efficiency"
type: "pipeline"
---

## Command
`/project:run-parallel`

## Description
Runs all compatible maintenance agents in parallel using Claude's Task tool with multiple concurrent agents:

### Phase 1: Critical Maintenance (Parallel)
- **link-healer** - Fix broken links and routing
- **image-hunter** - Source professional images
- **content-refresher** - Update stale content  
- **trust-builder** - Add credibility signals

### Phase 2: Quality Assurance (Sequential)
- **quality-check** - Validate all changes

## Parallel Execution Strategy
Uses Claude's multi-agent coordination:
```typescript
// Spawn 4 agents simultaneously
const tasks = [
  Task("link-healer", "Fix all broken links"),
  Task("image-hunter", "Replace all placeholder images"),
  Task("content-refresher", "Update stale dates and content"),
  Task("trust-builder", "Add author info and sources")
];

await Promise.all(tasks);
```

## Performance Benefits
- **4x Speed Increase**: Parallel vs sequential execution
- **Resource Efficiency**: Each agent uses different file types
- **No Conflicts**: Agents operate independently
- **Fault Tolerance**: Failure of one doesn't stop others

## Usage Examples
```bash
# Run full parallel pipeline
npm run agents:all

# Emergency parallel fixes only  
npm run agents:emergency

# Content-focused parallel run
npm run agents:content
```

## Expected Results
- **Execution Time**: 2-5 minutes (vs 15-20 sequential)
- **Success Rate**: 95%+ completion
- **Website Status**: Fully operational with no placeholders
- **Content Quality**: Professional-grade across all pages