# 2026-07-25 urgent discovery breadth and structured-data repair

## Run

- Run ID: `urgent-trends-discovery-breadth-structured-data-2026-07-25`.
- Trigger: owner-confirmed urgent diagnosis after no July 25 article had posted by late afternoon.
- Worktree: `C:\Users\farha\.codex\worktrees\trends-discovery-breadth-20260725`.
- Branch: `issue/trends-discovery-breadth-20260725`.
- Base code SHA: `a65f2a87f8bf7a579e587e770d009130634b7435`.
- Root checkout: preserved dirty and untracked; no root mutation.

## Diagnosis

- Schedule: the July 25 artifacts show all seven configured sweeps ran or were represented: 06:30, 08:30, 10:30, 12:30, 14:30, 16:30, and 18:30 America/Vancouver.
- Daily ceiling: not the cause. July 25 production inventory stayed at `0` of `6` local-day publications before each recorded skip.
- Candidate quality: a 10:30 Whitecaps bulletin reached candidate review but failed GPT quality and engagement gates, so it was correctly not promoted.
- Source breadth: a material cause. The repeated official-source queue was capped at `30` candidates from `8` enabled sources and repeated the same city-news/sports pool through the day.
- Release truth gate: a separate blocker. Production homepage structured data still exposed unsupported legacy technology-publisher, Ontario region, placeholder phone, and placeholder email claims.

## Repair

- Expanded official-source discovery while preserving primary-source, locality, freshness, duplicate, source-count, brand-safety, and review gates.
- Added crawlable municipal event pages for Surrey, Richmond, New Westminster, Coquitlam, Langley City, and Port Coquitlam.
- Raised the configured official candidate limit from `30` to `60`.
- Added source-specific `storyType`, `category`, `topicGroup`, `maxCandidatesPerSweep`, title-length, title-exclusion, and URL-exclusion controls.
- Added durable source-yield reporting to research queue artifacts.
- Added `skipReasonIfUnqualified` to each research opportunity so candidate skips preserve the evidence required before publication.
- Corrected homepage Organization and WebSite structured data to factual Lower Mainland publisher descriptions and removed unsupported contact/social/address claims from the rendered base schema paths.

## Scoreboard

- Baseline July 25 repeated queue: `30` candidates from `8` enabled official sources.
- Repaired dry run artifact: `artifacts/editorial/research/2026-07-25-discovery-repair-source-queue.json`.
- Repaired dry run: `58` candidates from `14` source/topic groups.
- Source/topic yield:
  - City of Surrey news, local-news: `4`.
  - City of Burnaby events, things-to-do: `4`.
  - City of Richmond news, local-news: `4`.
  - City of Coquitlam news, local-news: `4`.
  - City of Delta news, local-news: `4`.
  - Vancouver Canucks news, sports: `4`.
  - Vancouver Whitecaps news, sports: `4`.
  - BC Lions news, sports: `4`.
  - City of Surrey events, civic/community things-to-do: `5`.
  - City of Richmond special events, cultural/community things-to-do: `5`.
  - City of New Westminster events, civic/community things-to-do: `8`.
  - City of Coquitlam calendar, civic/community things-to-do: `1`.
  - Langley City events, civic/community things-to-do: `1`.
  - Port Coquitlam events, civic/community things-to-do: `6`.

## Gate State

- Qualified candidates: not selected in this repair run; publication was not forced.
- Candidate hashes: none, because no article candidate was promoted.
- GPT editorial gate: not run; no exact article candidate was selected.
- Claude Opus 5 exact-SHA review: pending for this system-change artifact.
- Tests: targeted Python tests passed before final validation.
- PR: pending.
- Merge SHA: pending.
- Deployment: pending.
- Browser proof: pending.
- Rollback point: `a65f2a87f8bf7a579e587e770d009130634b7435`.
- Metrics: production `/api/analytics` from the 18:30 sweep showed `157` active articles and no July 25 story; protected reporting and provider article-level metrics remained unavailable/protected, not zero.
- Cost: unavailable.

## Keep / Repair / Stop

- Keep zero-publication behavior when candidates are duplicate, stale, approval-gated, low utility, or fail GPT/Claude/release checks.
- Repair discovery breadth and structured-data truth through this branch before the next publishing sweep relies on the old pool.
- Stop before publication if a widened-source candidate lacks fresh official evidence, primary-source support, locality, practical reader value, image provenance, structured-data truth, or exact-artifact review.
