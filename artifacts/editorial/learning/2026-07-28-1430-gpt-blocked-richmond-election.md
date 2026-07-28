# 2026-07-28 14:30 Lower Mainland publisher run

- Run ID: `run-trends-today-daily-publisher-2026-07-28-1430`.
- Trigger: recurring automation `run-trends-today-daily-publisher`, every two hours.
- Current run time recorded: `2026-07-28T14:52:00-07:00`.
- Root checkout: `C:\Users\farha\Projects\Trends Today`, dirty/stale and preserved. `apply_patch` accidentally wrote the Richmond research/candidate artifacts into the root checkout first; they were copied into this clean issue worktree and the root artifacts were not cleaned, reset, or deleted.
- Issue worktree: `C:\Users\farha\.codex\worktrees\trends-daily-2026-07-28-1433` on `codex/lm-daily-2026-07-28-1433`.
- Base SHA: `7a31841172e1e99ac2d93d0274051e1697909a99`.
- Evidence commit: `b55079c7028555625ad0e89f5281151d6f7f1186`.
- Repair commits: `5a245080fd8600b87a59190bd6920f1142e51274`, `847a3cf2ca1fda563ad81730c2debf4c6b80509b`.
- Current evidence SHA before this learning entry: `847a3cf2ca1fda563ad81730c2debf4c6b80509b`.
- Rollback point: no public article was promoted. Revert or supersede the evidence branch if the preserved release candidate should be discarded.

## Metrics

- Public analytics before candidate selection: `artifacts/editorial/metrics/2026-07-28-1430-public-analytics.json`, HTTP 200, 166 total articles, newest story `Delta lists BC Day holiday hours for Monday, Aug. 3`, and two July 28 stories before this sweep.
- Protected reporting before candidate selection: `artifacts/editorial/metrics/2026-07-28-1430-protected-reporting.json`, HTTP 401, unavailable.
- Vercel analytics before candidate selection: `artifacts/editorial/metrics/2026-07-28-1430-vercel-analytics.json`, unavailable because `VERCEL_TOKEN` or `VERCEL_ANALYTICS_TOKEN` and `VERCEL_PROJECT_ID` were unavailable.
- GA4, Search Console, protected pageviews, ad, sponsor, revenue, and cost metrics: unavailable in this environment; missing values stayed unavailable, not zero.
- Daily ceiling: not reached. The sweep started at 2 of 6 July 28 publications and published 0 articles, leaving the day at 2 of 6.
- Cost: unavailable from local tooling.

## Discovery And Qualification

- Source queue: `artifacts/editorial/research/2026-07-28-1430-source-queue.json`.
- Targeted source extracts: `artifacts/editorial/research/2026-07-28-1430-targeted-source-extracts.json`.
- Researched candidates: `artifacts/editorial/research/2026-07-28-1430-researched-candidates.json`.
- Qualified candidates: `artifacts/editorial/research/2026-07-28-1430-qualified-candidates.json`.
- Rejection summary: `artifacts/editorial/research/2026-07-28-1430-rejection-summary.json`.
- Discovery found 58 primary-source candidates. Perplexity and Google discovery were skipped because API keys were unavailable.
- New URL versus the 12:30 source queue: City of Richmond `Richmond Election - October 17`.
- Qualified candidate: `Richmond voters can register early until Aug. 18`.
- Category: `local-news`.
- Candidate hash after final repair: `a0afa1867c4a60d4932f610ce172fd503cc481c07f6a067f09c7be3314f8f62d`.
- Primary source URLs:
  - `https://www.richmond.ca/city-hall/news/2026/rmdelection28jul2026.htm`
  - `https://www.richmond.ca/city-hall/elections.htm`
- Qualification reason: fresh official Richmond civic-service notice with clear voter utility around early registration, voting-place tools, advance-voting dates, accessible voting, mail-ballot application timing, and General Voting Day.
- Rejection/skip reason for other candidates: duplicates or recently reviewed source queue items, thin event listings, approval-gated legal/audit/governance items, and sports notes below the local practical-utility bar.
- Commercial fit: considered only after editorial qualification and recorded as none. Status remained `sponsorshipStatus: editorial`; no audience, rate, sponsor, pricing, guarantee, or revenue claims were made.
- Image: original AI-generated Trends Today editorial image at `public/images/editorial/2026/07/richmond-election-oct-17.png`; no claim that it depicts actual Richmond City Hall.

## Reviews

- GPT model: `gpt-5.6-sol` through Codex CLI OAuth.
- GPT blocker 1: artifact `artifacts/editorial/reviews/gpt/local-news/richmond-election-voter-registration-aug-18.b18438a78ea5.json`; blocked because the first title/description framed Aug. 18 as the voter-registration closing date and the lead manufactured a new-date claim.
- Repair 1: clarified Aug. 18 as early registration, added register-when-voting ID guidance, non-resident property-elector guidance, and a stronger action close.
- GPT blocker 2: artifact `artifacts/editorial/reviews/gpt/local-news/richmond-election-voter-registration-aug-18.8a828897da86.json`; blocked because the article repeated the early-registration point and told readers to wait for information already present on the Richmond elections page.
- Repair 2: removed repeated early-registration phrasing and replaced the close with current tools: voters-list check, advance-voting places, Where Do I Vote, required ID, curb-side voting contact, and Sept. 15 mail-ballot application timing.
- GPT blocker 3 and retry: artifact `artifacts/editorial/reviews/gpt/local-news/richmond-election-voter-registration-aug-18.a0afa1867c4a.json`; content scores were factualSupport 5, quality 4, readability 5, formatting 5, engagement 4, proseEmDashCount 0, but the reviewer returned BLOCKERS by claiming the candidate file was absent from the worktree. Local verification showed the file exists at the exact path and SHA-256 `a0afa1867c4a60d4932f610ce172fd503cc481c07f6a067f09c7be3314f8f62d`; a no-change retry repeated the same blocker.
- Final GPT verdict: BLOCKERS due repeated exact-artifact observation failure. The release failed closed.
- Claude Opus 5 release review: not run because GPT did not pass.
- Fable: not started.

## Tests And Release

- Deterministic local candidate validation: passed after repairs, 391 words, required H2/list/source/image contract satisfied, zero prose em dashes.
- Full validation commands will be recorded below after this learning entry is committed and checks finish.
- PR: not opened yet at the time of this entry.
- Merge: none.
- Deployment: none.
- Browser proof: none, because no article was promoted or deployed.

## Keep / Repair / Stop

- Keep: Richmond election voter-service coverage is a valid local utility lane when it states early registration, register-at-vote, voting tools, accessibility, and mail-ballot timing accurately.
- Repair: diagnose why Codex CLI GPT review repeatedly reported an absent candidate despite a tracked file and matching local SHA. Do not proceed to Opus or promotion until the GPT exact-artifact gate returns a valid PASS.
- Stop: no public promotion, merge, deployment, or browser-verification attempt after GPT remained BLOCKERS.
