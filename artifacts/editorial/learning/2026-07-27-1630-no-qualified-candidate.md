# 2026-07-27 16:30 Lower Mainland publisher audit

- Run ID: `2026-07-27-1630-lm-publisher`
- Trigger: scheduled `run-trends-today-daily-publisher` automation, every two hours
- Operator worktree: `C:\Users\farha\.codex\worktrees\trends-daily-2026-07-27-1632`
- Branch: `codex/lm-daily-2026-07-27-1632`
- Base code SHA: `577b96eb0c254dc608d62c844b0f4dfdeb68466c`
- Rollback point: no article promotion was prepared; revert this audit-only run after merge if the ledger itself needs removal.

## Metrics first

- Public analytics: `https://www.trendstoday.ca/api/analytics?codex=publisher-20260727-1630`
- Retrieved: `2026-07-27T23:33:24.297Z`
- Status: available, HTTP 200
- Freshness/window: live public content inventory at run time
- Count before this sweep: 163 total articles, with four July 27 Lower Mainland articles already surfaced
- Daily ceiling status: 4 of 6 before the sweep; publication capacity remained available
- Protected reporting endpoint: unavailable, HTTP 401 without authorized bearer token
- Vercel Analytics export: `artifacts/editorial/metrics/2026-07-27-1630-vercel-analytics.json`, status unavailable because `VERCEL_TOKEN` or `VERCEL_ANALYTICS_TOKEN` and `VERCEL_PROJECT_ID` were not present
- GA4, Search Console, ad, sponsor, revenue, and cost metrics: unavailable in this task environment, not zero

## Sources and qualification

- Discovery command: `python apps\pipeline\runner.py research --limit 60 --output artifacts\editorial\research\2026-07-27-1630-source-queue.json`
- Discovery result: 58 primary-source candidates, 57 unique research opportunities
- Perplexity and Google discovery: skipped because API keys were absent
- Qualified candidates: none
- Candidate hashes: none, because no candidate reached exact release-candidate staging
- New source URLs since the 14:30 sweep:
  - `https://www.bclions.com/2026/07/27/post-practice-july-27-justin-mcinnis/`
  - `https://www.bclions.com/2026/07/27/post-practice-july-27-chase-brice/`
- Rejection reason: both new BC Lions pages were official team media clips, but neither supplied a distinct Lower Mainland reader decision, schedule change, result, roster impact, or practical utility strong enough for a local sports article.
- Held/rejected classes: duplicate or already-covered July 27 local items, stale municipal event pages, approval-gated Richmond property-title/audit items, and thin sports/team-content posts.
- Commercial status: not considered. Commercial fit follows editorial qualification, and no candidate qualified.

## Reviews

- GPT editorial gate: not run because no exact candidate qualified
- Claude Opus 5 exact-SHA release review: not run because no exact candidate qualified
- Fable: not used

## Tests and checks

- JSON parse passed for source queue, researched candidates, qualified candidates, rejection summary, and Vercel metrics artifact.
- `git diff --check`: passed before build-generated public sitemap timestamp changes.
- `python -m unittest discover -s apps\pipeline\tests`: passed, 87 tests.
- `npm ci`: passed; existing audit output still reported 22 vulnerabilities, unrelated to this audit-only change.
- `npm run typecheck`: passed.
- `npm run lint`: passed with zero errors and 133 existing warnings.
- `npm run build`: passed; generated 215 static pages and kept the latest live article route `/local-news/coquitlam-partington-creek-wildlife-corridor`.
- Build side effects: `public/sitemap.xml` timestamp/order churn and `public/robots.txt` line-ending touch were left unstaged because no public content changed.

## PR, merge, deployment, and browser proof

- Pending at initial audit commit.

## Operational learning

- Keep: fail closed on official team-media clips when the item lacks a practical local reader job beyond watching an interview.
- Repair: source discovery still surfaces stale/repetitive sports and event pages; the next useful improvement is stronger freshness and standalone-utility filtering before candidate scoring.
- Stop rule: no exact candidate means no GPT review, no Claude release review, no promotion, and no publication.
- Local safety note: three audit files were accidentally created in the dirty root checkout before being recreated in this issue worktree; the root files were preserved and not cleaned.
