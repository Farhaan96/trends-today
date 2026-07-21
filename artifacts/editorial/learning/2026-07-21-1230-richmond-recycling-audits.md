# Daily publisher learning - 2026-07-21 12:30

## Outcome

- Decision: `published-live-verified`.
- Candidate: `Richmond recycling audits start after contamination rises`.
- Category: `local-news`.
- Municipality: Richmond.
- Sweep count: 1 of 2 allowed for this sweep; 3 of 6 known new stories for July 21 after merge and deployment.
- Release worktree: `C:\Users\farha\.codex\worktrees\trends-daily-2026-07-21-1230`.
- Release branch: `issue/lm-daily-2026-07-21-1230`.
- Pull request: [#37](https://github.com/Farhaan96/trends-today/pull/37).
- Merge commit: `772f9ca2e5f6589ba32f378403b0abc54d2fbf2a`.
- Production deployment: `5544866560`, successful at `2026-07-21T20:00:06Z`.
- Canonical URL: [https://www.trendstoday.ca/local-news/richmond-recycling-contamination-audits](https://www.trendstoday.ca/local-news/richmond-recycling-contamination-audits).

## Baseline and constraint

- Production `/api/analytics` before this sweep reported 139 active articles, with local inventory at `local-news` 3, `transit` 3, `things-to-do` 4, `food-drink` 1, `housing` 2, and `sports` 2.
- Production `/api/analytics` after deployment reported 140 active articles, with `local-news` at 4 and the Richmond recycling bulletin first in recent articles.
- Two July 21 stories were live before this sweep: `Burnaby park stewardship dates need registration` and `Coquitlam posts heat-safety resources as temperatures climb`.
- The Vercel importer wrote `artifacts/editorial/metrics/2026-07-21-1230-vercel-analytics.json` with status `unavailable` because `VERCEL_TOKEN` or `VERCEL_ANALYTICS_TOKEN` and `VERCEL_PROJECT_ID` were not available in the automation environment.
- Google Analytics, Google Search Console, page views, engaged sessions, returning sessions, scroll depth, measurable ad impressions, viewable ad impressions, Active View rate, ad revenue, page RPM, sponsor inquiries, qualified sponsor inquiries, sponsorship revenue, and content cost remain unavailable.
- Missing values were not converted to zero.
- Current constraint: measurement remains the business constraint; editorially, the live opportunity was a Richmond household-service bulletin with current July audit utility.

## Hypothesis

Richmond recycling-audit coverage should serve Lower Mainland readers because it turns a municipal waste notice into a practical pre-collection check: contamination rates, sticker feedback, common sorting mistakes, and the city lookup tool.

## Single changed variable

This sweep added one Richmond household-service bulletin instead of filling a second slot with retrospective attendance posts, duplicated Burnaby/Coquitlam items, away-match sports viewing, or civic/legal disputes needing broader evidence and approval.

## Length and links

- Richmond bulletin: 354 body words, with no contextual internal link inside the article body.
- Length rationale: a bulletin was the shortest complete treatment because readers needed the audit timing, contamination rates, common sorting mistakes, and the city lookup tool.
- Internal-link rationale: no existing published article added direct reader value inside the body without forcing an unrelated transition, so the bulletin stayed at zero body links under the 0 to 1 bulletin allowance. The rendered page also surfaced an existing Richmond local-news related card.

## Commercial research

- `commercialIntent` is `ad-fit`; hypothesis is household utility intent around waste service, home organization, local services, and municipal reminders.
- Sponsor demand, ad revenue, RPM, viewability, sponsor inquiries, and qualified sponsor inquiries are unavailable.
- The story is independent editorial coverage with `sponsorshipStatus: editorial`; no supported, branded, outreach, pricing, billing, customer-commitment, private-evidence, or materially new public-claim action was taken.

## Sources

- [City of Richmond recycling contamination notice](https://www.richmond.ca/city-hall/news/2026/reducerecyclingcontamination07jul2026.htm)
- [Richmond Recycling Wizard](https://www.richmond.ca/services/recycling-garbage/search.htm)
- [Recycle BC what-can-I-recycle guide](https://recyclebc.ca/what-can-i-recycle/)

## Review and repairs

- First GPT review blocked the headline `Richmond recycling audits start as bins miss targets` because the city notice supports citywide contamination rates above the threshold, not individual bins missing targets.
- Repaired headline: `Richmond recycling audits start after contamination rises`.
- Final exact-candidate GPT review returned `PASS` for candidate SHA `2915deed4ef21a1ae29edd5c2bfe1315662d4f6e44d8aeb6b50f350873db2a9b`, repository SHA `738f66325d97f0038edc92ac026cf2fbf411cfc0`, all scores at least 4/5, no blockers, and zero authorial em dashes.
- Fable usage was inspected and logged before Claude review. The direct CLI usage command returned no usable percentage, so the ledger used the last successful Fable meter of 85 per cent and treated this as a reserve-constrained mandatory release review.
- First Claude run returned `NO BLOCKERS` but failed runner formatting because the verdict was bolded. The formatted rerun used Fable with no fallback and returned `NO BLOCKERS` at repository SHA `738f66325d97f0038edc92ac026cf2fbf411cfc0` for the same candidate SHA.
- PR #37 checks passed before merge: Vercel and Vercel Preview Comments both succeeded.
- Local validation passed before merge: `python -m unittest discover -s apps/pipeline/tests`, `npm ci`, `npm run typecheck`, `npm run lint -- --quiet`, targeted Prettier check, `git diff --check`, and `npm run build`.

## Live verification

- Production deployment `5544866560` succeeded for merge SHA `772f9ca2e5f6589ba32f378403b0abc54d2fbf2a`.
- Browser verification returned HTTP 200 for the canonical URL.
- H1 matched `Richmond recycling audits start after contamination rises`.
- Canonical tag matched the live article URL.
- Body contained the July audit timing, gold-star and Oops sticker details, the 3 per cent threshold, the 7.3 per cent curbside rate, the 11.3 per cent multi-family rate, and the 25 per cent reduction target.
- Hero image loaded through Next Image with natural dimensions `891x501`; rendered alt text was the article headline.
- Source links resolved with HTTP 200 for the City of Richmond notice, Richmond Recycling Wizard, Recycle BC guide, and the rendered Richmond related article.
- Browser console error logs were clean during verification.

## Checkpoints

- 7-day checkpoint: 2026-07-28. Record path-level Vercel page views if credentials are available, plus Search Console and GA fields if connected.
- 28-day checkpoint: 2026-08-18. Decide `keep`, `repair`, or `stop` for municipal household-service bulletins.

## Keep, repair, stop

- Keep if the page publishes cleanly, source links resolve, the hero image loads, and the 7-day checkpoint returns truthful path-level data or clearly records why it is unavailable.
- Repair if article-level measurement remains credential-blocked, if similar household-service items lack concrete current action, or if commercial fit starts steering topic choice without comparable reader data.
- Stop this format if the item is not current, if it lacks an official resident action, if it becomes enforcement or private-property coverage needing approval, or if municipal household-service bulletins fail to produce useful 7-day/28-day signals after comparable reps.
