# 2026-07-27 10:30 Lower Mainland Publisher Run

- **Run ID**: `run-trends-today-daily-publisher/2026-07-27T10:31:57.5832417-07:00`
- **Trigger**: scheduled autonomous Lower Mainland publisher, every two hours
- **Worktree**: `C:\Users\farha\.codex\worktrees\trends-daily-2026-07-27-1032`
- **Branch**: `codex/lm-daily-2026-07-27-1032`
- **Base SHA**: `4abd51e86f79856def49fbe6414762dbd4a00213`
- **Root checkout**: preserved dirty and behind; no intentional root mutation performed

## Metrics

- **Public analytics source**: `https://www.trendstoday.ca/api/analytics`
- **Metric artifact**: `artifacts/editorial/metrics/2026-07-27-1030-public-analytics.json`
- **Window/freshness**: checked 2026-07-27T17:34:09Z before qualification
- **Status**: available for public article/category counts; public count showed 161 articles and two 2026-07-27 stories before this sweep
- **Protected reporting artifact**: `artifacts/editorial/metrics/2026-07-27-1030-reporting-endpoint.json`
- **Protected reporting status**: unavailable, HTTP 401; not treated as zero
- **Vercel analytics artifact**: `artifacts/editorial/metrics/2026-07-27-1030-vercel-analytics.json`
- **Vercel analytics status**: unavailable because `VERCEL_TOKEN` or `VERCEL_ANALYTICS_TOKEN` and `VERCEL_PROJECT_ID` were missing; audience, RPM, sponsor, ad, engagement, and cost metrics remain unavailable, not zero

## Discovery

- **Research queue**: `artifacts/editorial/research/2026-07-27-1030-source-queue.json`
- **Qualified-candidate artifact**: `artifacts/editorial/research/2026-07-27-1030-qualified-candidates.json`
- **Source summary**: 58 opportunities from enabled official local sources. Perplexity and Google Custom Search were unavailable, so discovery used configured primary local sources.
- **Daily count before sweep**: 2 of 6 for 2026-07-27
- **Qualified**: 0
- **Outcome**: skipped publication because no candidate cleared all editorial gates

## Rejections And Holds

- Duplicate or already covered: Richmond Climate-Friendly Homes, Surrey Youth Stewardship Squad, Surrey Sounds line dancing, Burnaby Blues + Roots Festival, Art in the Park, Coquitlam road safety, Coquitlam election-worker, Surrey heat, Delta air-quality, and Delta water-restriction items.
- Stale or retrospective: New Westminster foosball, Royal City Concert Band, hand embroidery, Canadian Injury Prevention Day illumination, and a Downtown Front Yard lawn-games listing whose official page exposed July 7 details.
- Thin or repetitive event pages: Port Coquitlam movie/music/summer listings, Langley Village Cafe, and Surrey Park Play items did not create a distinct reader decision beyond dates, times, and locations.
- Sensitive, legal, audit, or one-sided civic items: Surrey mayor governance statement, Richmond property-title court decision, and Richmond Olympic Oval audit were held for stronger support or owner review.
- Low-utility sports: BC Lions Lorenzo Mauldin signing, Canucks podcast/role-change items, Whitecaps roster/all-star notes, and stale BC Lions listings did not clear the standalone sports utility bar.

## Reviews

- **Candidate SHA256**: none
- **GPT editorial review**: not run because no exact qualified candidate existed
- **Claude exact release review**: not run because no exact qualified candidate existed
- **Image generation**: not run because no article candidate qualified

## Tests

- JSON parse passed for public analytics, protected reporting, Vercel analytics, source queue, and qualified-candidate artifacts.
- `git diff --check` passed.
- `python -m unittest discover -s apps\pipeline\tests` passed, 87 tests.
- `npm ci` passed and reported the existing audit state: 4 moderate, 17 high, 1 critical vulnerabilities.
- `npm run typecheck` passed.
- `npm run lint` passed with 0 errors and 133 existing warnings.
- `npm run build` passed and generated 213 static pages.

## Release

- **Implemented**: audit and qualification artifacts only
- **Reviewed**: no editorial candidate reviewed
- **Merged**: pending PR
- **Deployed**: pending PR
- **Browser-verified**: pending deployment
- **Published article**: none
- **Rollback point**: `4abd51e86f79856def49fbe6414762dbd4a00213`
- **Cost**: unavailable from local tooling
- **Inbox lane**: fail-closed; no advertiser replies, pricing, sponsor claims, provider changes, production-data changes, or customer/private-data use
- **Local note**: `npm run build` touched generated `public/robots.txt` and `public/sitemap.xml`; those build side effects are intentionally not staged for the evidence PR.

## Keep / Repair / Stop

- **Keep**: zero-publication sweeps when the queue is duplicate, stale, thin, sensitive, one-sided, or below the reader-utility bar.
- **Repair**: measurement remains the binding operational constraint; protected reporting and Vercel analytics credentials are still needed before audience, RPM, sponsor, and engagement claims can be used.
- **Stop**: fail closed before GPT/Opus/release when no exact qualified candidate hash exists.
