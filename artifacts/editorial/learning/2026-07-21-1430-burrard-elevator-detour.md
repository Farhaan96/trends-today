# Daily publisher learning - 2026-07-21 14:30

## Outcome

- Decision: `published-live-verified`.
- Candidate: `Burrard Station elevator closes for replacement`.
- Category: `transit`.
- Municipality: Vancouver.
- Sweep count: 1 of 2 allowed for this sweep; 4 of 6 known new stories for July 21 after merge and deployment.
- Release worktree: `C:\Users\farha\.codex\worktrees\trends-daily-2026-07-21-1430-final`.
- Release branch: `issue/lm-daily-2026-07-21-1430-final`.
- Pull request: [#39](https://github.com/Farhaan96/trends-today/pull/39).
- Merge commit: `43496e23496f182e9f5e2a425134334d885d6f0d`.
- Production deployment: `5546532172`, successful at `2026-07-21T22:09:58Z`.
- Canonical URL: [https://www.trendstoday.ca/transit/burrard-station-elevator-replacement-detour](https://www.trendstoday.ca/transit/burrard-station-elevator-replacement-detour).

## Baseline and constraint

- Production `/api/analytics` before this sweep reported 140 active articles, with local inventory at `local-news` 4, `transit` 3, `things-to-do` 4, `food-drink` 1, `housing` 2, and `sports` 2.
- Production `/api/analytics` after deployment reported 141 active articles, with `transit` at 4 and the Burrard bulletin first in recent articles.
- Three July 21 stories were live before this sweep: `Burnaby park stewardship dates need registration`, `Coquitlam posts heat-safety resources as temperatures climb`, and `Richmond recycling audits start after contamination rises`.
- The Vercel importer wrote `artifacts/editorial/metrics/2026-07-21-1430-vercel-analytics.json` with status `unavailable` because `VERCEL_TOKEN` or `VERCEL_ANALYTICS_TOKEN` and `VERCEL_PROJECT_ID` were not available in the automation environment.
- Google Analytics, Google Search Console, page views, engaged sessions, returning sessions, scroll depth, measurable ad impressions, viewable ad impressions, Active View rate, ad revenue, page RPM, sponsor inquiries, qualified sponsor inquiries, sponsorship revenue, and content cost remain unavailable.
- Missing values were not converted to zero.
- Current constraint: measurement remains the business constraint; editorially, the live opportunity was a same-day transit-accessibility bulletin with concrete rider detours.

## Hypothesis

Burrard Station elevator closure coverage should serve Lower Mainland readers because it turns a long accessibility closure into a practical downtown trip-planning note: the start date, expected duration, detour choices, and extra travel time.

## Single changed variable

This sweep added one transit-accessibility service bulletin from official TransLink sources instead of filling a second slot with retrospective Surrey attendance posts or enforcement/private-property coverage that needed broader balance and approval posture.

## Length and links

- Burrard bulletin: 291 body words, with no contextual internal link inside the article body.
- Length rationale: a bulletin was the shortest complete treatment because riders needed the closure date, expected duration, detour choices, and added travel-time estimate.
- Internal-link rationale: no existing published article added direct reader value inside the body without forcing an unrelated transition, so the bulletin stayed at zero body links under the 0 to 1 bulletin allowance. The rendered page also surfaced related transit cards.

## Commercial research

- `commercialIntent` is `ad-fit`; hypothesis is recurring commuter, accessibility, and downtown trip-planning intent around local services and mobility.
- Sponsor demand, ad revenue, RPM, viewability, sponsor inquiries, and qualified sponsor inquiries are unavailable.
- The story is independent editorial coverage with `sponsorshipStatus: editorial`; no sponsored, supported, branded, outreach, pricing, billing, customer-commitment, private-evidence, or materially new public-claim action was taken.

## Sources

- [TransLink station accessibility upgrade notice](https://www.translink.ca/news/2026/july/station%20upgrades%20continue%20to%20improve%20customer%20accessibility%20on%20skytrain)
- [TransLink elevator and escalator replacement project](https://www.translink.ca/plans-and-projects/projects/maintenance-and-upgrade-program/rail-projects/elevator-and-escalator-replacement)
- [TransLink alerts](https://www.translink.ca/alerts)

## Review and repairs

- Duplicate scan found no existing Burrard Station elevator, Granville Station detour, or accessible-detour coverage in content or learning artifacts.
- Legacy `node utils/topic-validator.js check` reported the topic unique, then hit its known Windows `find` failure.
- First GPT and Fable reviews became stale after targeted Prettier changed the release-candidate hash; the candidate was re-reviewed after formatting.
- Final exact-candidate GPT review returned `PASS` for candidate SHA `73fcd22e07964241b341641571ee0aebe68daa4f31cf91804d5e07b9517f66fe`, repository SHA `59f4f5dc869b363f8354dacabb3d780241ba6585`, all scores 5/5, no blockers, and zero authorial em dashes.
- Fable usage was inspected and logged before review. The direct CLI usage command returned no usable percentage, so the ledger used the last successful Fable meter of 85 per cent and treated this as a reserve-constrained mandatory release review.
- Claude/Fable exact-candidate release review returned `NO BLOCKERS` at repository SHA `59f4f5dc869b363f8354dacabb3d780241ba6585`; no fallback was used.
- PR #39 checks passed before merge: Vercel and Vercel Preview Comments both succeeded.
- Local validation passed before merge: `python -m unittest discover -s apps/pipeline/tests`, `npm ci`, `npm run typecheck`, `npm run lint -- --quiet`, targeted Prettier check, `git diff --check`, and `npm run build`. `npm ci` still reported the existing 22 audit vulnerabilities.

## Live verification

- Production deployment `5546532172` succeeded for merge SHA `43496e23496f182e9f5e2a425134334d885d6f0d`.
- Chrome browser verification returned HTTP 200 for the canonical URL.
- H1 matched `Burrard Station elevator closes for replacement`.
- Canonical tag matched the live article URL.
- Body contained the July 21 closure date, spring 2027 duration, Granville Station detour, #5 Downtown/Robson detour, Royal Oak follow-up, and 30-minute Royal Oak travel-time note.
- Hero image loaded through Next Image with natural dimensions `891x501`; rendered alt text was the article headline.
- Source links resolved with HTTP 200 for the TransLink news notice, elevator/escalator replacement project page, and alerts page.
- Browser console error logs were clean during verification.

## Checkpoints

- 7-day checkpoint: 2026-07-28. Record path-level Vercel page views if credentials are available, plus Search Console and GA fields if connected.
- 28-day checkpoint: 2026-08-18. Decide `keep`, `repair`, or `stop` for transit-accessibility closure bulletins.

## Keep, repair, stop

- Keep if the page publishes cleanly, source links resolve, the hero image loads, and the 7-day checkpoint returns truthful path-level data or clearly records why it is unavailable.
- Repair if article-level measurement remains credential-blocked, if similar station-accessibility items lack concrete detours, or if commercial fit starts steering topic choice without comparable reader data.
- Stop this format if the item is not current, if it lacks an official rider action, if the source links cannot be verified, or if transit-accessibility bulletins fail to produce useful 7-day/28-day signals after comparable reps.
