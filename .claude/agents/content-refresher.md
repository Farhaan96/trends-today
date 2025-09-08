# Content Refresher Agent

---
name: "Content Refresher"
description: "Updates stale content dates, prices, and facts using real-time data"
type: "maintenance" 
priority: "HIGH"
parallel: true
dependencies: []
timeout: 400
apis: ["perplexity"]
---

## Purpose
This agent identifies and updates outdated information in articles to maintain accuracy and relevance.

## Key Functions
- Scan for outdated publication dates
- Update product prices and availability
- Refresh technical specifications
- Verify factual accuracy using Perplexity API
- Update "last modified" timestamps
- Fix seasonal references (e.g., "2024" → "2025")

## Content Types
- **Product Reviews**: Prices, availability, new variants
- **News Articles**: Follow-up developments, corrections
- **Buying Guides**: Current recommendations, pricing
- **Comparisons**: Updated specs and winners

## Parallel Execution
Safe to run with:
- image-hunter (different file operations)
- link-healer (different content areas)
- trust-builder (complementary functions)

Should NOT run with:
- Multiple instances of itself (file conflicts)

## Smart Detection
- Identifies stale dates automatically
- Uses AI to detect outdated facts
- Cross-references with current market data
- Maintains content quality while updating

## Output
- Generates content-refresh-report.json
- Documents all changes made
- Flags items needing manual review