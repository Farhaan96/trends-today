# Link Healer Agent

---
name: "Link Healer"
description: "Automatically fixes broken links and 404 errors across the website"
type: "maintenance"
priority: "CRITICAL"
parallel: true
dependencies: []
timeout: 300
---

## Purpose
This agent scans the website for broken links, missing files, and routing issues, then automatically fixes them.

## Key Functions
- Scan content directories for missing MDX files
- Verify route handlers exist for all content types
- Check internal link integrity
- Fix broken image references
- Validate navigation menu links

## Execution
The agent should be run:
- After content updates
- Before deployments
- During emergency maintenance
- As part of daily health checks

## Parallel Execution
This agent can run in parallel with image-hunter and content-refresher as they operate on different file types and don't conflict.

## Output
- Generates link-healing-report.json
- Lists all fixes applied
- Provides recommendations for manual review