# Emergency Agent Pipeline

---
name: "run-emergency"
description: "Run critical maintenance agents in parallel for immediate fixes"
type: "pipeline"
---

## Command
`/project:run-emergency`

## Description
Executes the emergency maintenance pipeline with maximum parallel efficiency:

1. **link-healer** - Fixes broken links and 404 errors (CRITICAL)
2. **image-hunter** - Replaces placeholder images (HIGH)
3. **content-refresher** - Updates stale dates and content (HIGH)

All three agents run simultaneously for fastest execution.

## When to Use
- After major content updates
- Before production deployments
- During website outages or issues
- When users report broken functionality

## Expected Execution Time
- **Target**: Under 2 minutes
- **Parallel**: All 3 agents run simultaneously
- **Efficiency**: 3x faster than sequential execution

## Usage
```bash
npm run agents:emergency
# or directly:
node agents/orchestrator.js emergency
```

## Success Criteria
- All broken links fixed
- No placeholder images remaining
- All content dates current
- Zero build errors
- Clean deployment ready