# 2026-07-26 06:30 Lower Mainland Publisher Run

- Run ID: `2026-07-26-0630-lm-publisher`
- Trigger: recurring automation `run-trends-today-daily-publisher`
- Operator worktree: `C:\Users\farha\.codex\worktrees\trends-daily-2026-07-26-0633`
- Branch: `issue/lm-daily-2026-07-26-0633`
- Base SHA: `f89727efa805065c7572ac9c720f66ebf20c6b67`
- Candidate SHA: `e51abd27cc0bf3a73684b02165ad91ff3bd38f4d`
- Candidate artifact: `artifacts/editorial/release-candidates/things-to-do/surrey-darts-hill-scavenger-hunt-july-26.mdx`
- Candidate content hash: `3c0961dea58d01828afcf4f6c45bf269a0f4c4b4c1d8895383f01d3118d448ef`

## Metrics

- Public analytics endpoint: available, HTTP 200, retrieved `2026-07-26T13:35:21Z`; reported 157 total articles and no July 26 publication in recent articles.
- Protected reporting endpoint: unavailable, HTTP 401, retrieved `2026-07-26T13:35:21Z`; bearer token not available to this run.
- Vercel analytics: unavailable because `VERCEL_TOKEN` or `VERCEL_ANALYTICS_TOKEN` and `VERCEL_PROJECT_ID` were missing.
- Commercial metrics: engaged sessions, returning sessions, scroll depth, measurable/viewable ad impressions, Active View, ad revenue, RPM, sponsor inquiries, sponsorship revenue, and content cost stayed unavailable, not zero.

## Discovery

- Discovery command: `python apps\pipeline\runner.py research --limit 60 --output artifacts\editorial\research\2026-07-26-0630-source-queue.json`
- Discovery result: 58 primary-source candidates across enabled official local source groups. Perplexity and Google API discovery stayed unavailable because keys were absent.
- Qualified candidate: Surrey Darts Hill Garden Park family scavenger hunt on July 26, 2026.
- Source URLs:
  - `https://www.surrey.ca/news-events/events/family-scavenger-hunt-darts-hill`
  - `https://www.surrey.ca/parks-recreation/parks/park-features-amenities/display-feature-gardens/darts-hill-garden-park`
  - `https://dartshill.ca/visit-the-garden/`
- Qualified reason: same-day official Surrey event with named locality, date, time, address, donation-based admission disclosure, primary-source support, reader utility, standard brand safety, editorial sponsorship status, original generated image provenance, and no sensitive-story signals.
- Rejected or held: duplicate/recently published items, approval-gated legal/audit/enforcement items, stale or thin calendar listings, and sports items below utility threshold.

## Reviews

- Deterministic article contract: passed after admission-fact repair; 364 words, four H2 sections, nine list items, zero em dashes.
- GPT editorial gate: PASS.
  - Artifact: `artifacts/editorial/reviews/gpt/things-to-do/surrey-darts-hill-scavenger-hunt-july-26.3c0961dea58d.json`
  - Model: `gpt-5.6-sol`
  - Review run ID: `019f9ebe-2256-7113-a37f-8cbdf2c7738b`
  - Reviewed repo SHA: `e51abd27cc0bf3a73684b02165ad91ff3bd38f4d`
- Independent Opus 5 release review: not completed.
  - Required runner: `C:\Users\farha\.codex\scripts\invoke-claude-review.ps1 -PrimaryModel claude-opus-5 -DisableFallback`
  - Clean review worktree: `C:\Users\farha\.codex\worktrees\trends-review-surrey-darts-e51abd2`
  - First attempt: timed out after roughly three minutes without a structured verdict and left runner children active.
  - Second direct runner attempt: timed out after roughly five minutes without a structured verdict.
  - Cleanup: only the launched Claude review process tree for this candidate was stopped.

## Release

- Implemented: yes, as a release candidate only.
- Reviewed: GPT accepted; Opus 5 did not return a verdict.
- Promoted: no.
- Tests: deterministic candidate validation only; full pipeline tests, typecheck, lint, and build were not run because mandatory independent review failed first.
- PR: none.
- Merge SHA: none.
- Deployment: none.
- Browser proof: none.
- Rollback point: no production change; branch can be abandoned or resumed from `e51abd27cc0bf3a73684b02165ad91ff3bd38f4d`.
- Cost: unavailable.

## Keep / Repair / Stop

- Keep: the repaired Darts Hill admission framing and the hash-led review sequence; GPT found the current candidate supportable.
- Repair: the Opus review runner needs a bounded, reliable completion path or diagnostics before the next same-day publication candidate can proceed.
- Stop: do not promote or publish this article unless the exact candidate hash `3c0961dea58d01828afcf4f6c45bf269a0f4c4b4c1d8895383f01d3118d448ef` receives a successful Opus 5 structured review at repo SHA `e51abd27cc0bf3a73684b02165ad91ff3bd38f4d`, followed by full checks, PR, deployment, and browser verification.
