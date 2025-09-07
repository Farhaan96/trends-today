# Master Orchestrator Agent

---
name: "Master Orchestrator"
description: "Coordinates and manages parallel execution of all maintenance agents"
type: "coordinator"
priority: "MASTER"
parallel: false
dependencies: ["link-healer", "image-hunter", "content-refresher", "trust-builder"]
timeout: 1200
---

## Purpose
This is the master coordinator that manages parallel execution of specialized agents for maximum efficiency.

## Execution Pipelines

### Emergency Pipeline (Parallel)
Run simultaneously for fastest fixes:
- **link-healer** - Fix broken links (Critical)
- **image-hunter** - Replace placeholder images (High) 
- **content-refresher** - Update stale dates (High)

### Enhancement Pipeline (Sequential after Emergency)
- **trust-builder** - Add credibility signals
- **quality-check** - Validate final state

### Discovery Pipeline (Background)
- **news-scanner** - Find trending topics
- **seo-finder** - Discover opportunities
- **product-tracker** - Monitor launches

## Parallel Execution Rules

### Safe to Run Together:
- link-healer + image-hunter + content-refresher + trust-builder
- All operate on different aspects without file conflicts

### Must Run Sequentially:
- Multiple instances of same agent
- quality-check (needs clean state to validate)

## Coordination Strategy
1. **Pre-flight**: Check system state and dependencies
2. **Parallel Launch**: Start compatible agents simultaneously
3. **Monitor**: Track progress and handle failures gracefully
4. **Report**: Aggregate results from all agents
5. **Cleanup**: Ensure clean final state

## Performance Targets
- **Emergency Pipeline**: Complete in under 2 minutes
- **Full Automation**: Complete in under 5 minutes
- **Success Rate**: 95%+ agent completion rate
- **Parallel Efficiency**: 4x faster than sequential execution

## Error Handling
- Continue execution if non-critical agents fail
- Retry failed agents once with exponential backoff
- Generate comprehensive failure reports
- Ensure no agent leaves system in broken state