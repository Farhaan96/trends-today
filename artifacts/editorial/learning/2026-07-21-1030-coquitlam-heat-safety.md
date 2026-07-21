# Daily publisher learning - 2026-07-21 10:30

## Outcome

- Decision: `published-pending-pr-deploy`.
- Candidate: `Coquitlam posts heat-safety resources as temperatures climb`.
- Category: `local-news`.
- Municipality: Coquitlam.
- Sweep count: 1 of 2 allowed for this sweep; 2 of 6 known new stories for July 21 if merged and deployed.
- Release worktree: `C:\Users\farha\.codex\worktrees\trends-daily-2026-07-21-1030-final`.
- Release branch: `issue/lm-daily-2026-07-21-1030-final`.

## Baseline and constraint

- Production `/api/analytics` before this sweep reported 138 active articles, with local inventory at `local-news` 2, `transit` 3, `things-to-do` 4, `food-drink` 1, `housing` 2, and `sports` 2.
- Only one July 21 story was live before this sweep: `Burnaby park stewardship dates need registration`.
- The Vercel importer wrote `artifacts/editorial/metrics/2026-07-21-1030-vercel-analytics.json` with status `unavailable` because `VERCEL_TOKEN` or `VERCEL_ANALYTICS_TOKEN` and `VERCEL_PROJECT_ID` were not available in the automation environment.
- Google Analytics, Google Search Console, page views, engaged sessions, returning sessions, scroll depth, measurable ad impressions, viewable ad impressions, Active View rate, ad revenue, page RPM, sponsor inquiries, qualified sponsor inquiries, sponsorship revenue, and content cost remain unavailable.
- Missing values were not converted to zero.
- Current constraint: measurement remains the business constraint; editorially, the live opportunity was a same-day Coquitlam public-service weather bulletin.

## Hypothesis

A same-day heat-safety bulletin should serve Lower Mainland readers because it combines a fresh official city notice, Environment Canada conditions, no-alert context, and Fraser Health indoor-temperature guidance into one practical check-before-the-afternoon item.

## Single changed variable

This sweep added one same-day public-service weather bulletin instead of filling a second slot with duplicate Burnaby/Coquitlam items, retrospective attendance posts, weak sports filler, or civic/legal disputes needing more evidence.

## Length and links

- Coquitlam bulletin: 373 words, with no contextual internal link.
- Length rationale: a bulletin was the shortest complete treatment because readers needed the city resource notice, current weather context, no-alert status, indoor-temperature threshold, and immediate actions.
- Internal-link rationale: no existing article added direct reader value without forcing an unrelated transition, so the bulletin stayed at zero internal links under the 0 to 1 bulletin allowance.

## Commercial research

- `commercialIntent` is `ad-fit`; hypothesis is contextual cooling, home comfort, hydration, local recreation, and community-service reader intent.
- Sponsor demand, ad revenue, RPM, viewability, sponsor inquiries, and qualified sponsor inquiries are unavailable.
- The story is independent editorial coverage with `sponsorshipStatus: editorial`; no supported, branded, outreach, pricing, billing, customer-commitment, private-evidence, or materially new public-claim action was taken.

## Sources

- [City of Coquitlam heat-safety resources](https://www.coquitlam.ca/m/newsflash/Home/Detail/2004)
- [Environment Canada Coquitlam forecast](https://weather.gc.ca/en/location/index.html?coords=49.2838%2C-122.7932)
- [Environment Canada alerts for Metro Vancouver northeast](https://www.weather.gc.ca/warnings/report_e.html?bcrm1517=)
- [Fraser Health guidance during a heat event](https://www.fraserhealth.ca/health-topics-a-to-z/sun-safety/during-a-heat-event)

## Review and repairs

- First GPT review in the discarded unformatted worktree blocked three factual-support overreaches: forecast-range wording, an errands suggestion, and an unsupported warmest-room suggestion.
- Repaired and formatted copy passed deterministic validation at 373 words, zero authorial em dashes, all source URLs present, and no manual-approval trigger.
- Final exact-candidate GPT review returned `PASS` for candidate SHA `b8ead82013de307d37b6e051d24575db41d379b4ef0f2aee29a0eb3a7362d7e4`, repository SHA `7f9850537170f20e69ae688ad7610a8a484ba6d4`, all scores at least 4/5, no blockers, and zero authorial em dashes.
- Fable usage was inspected and logged before Claude review.
- Claude exact-SHA release review used Fable with no fallback and returned `NO BLOCKERS` at repository SHA `7f9850537170f20e69ae688ad7610a8a484ba6d4` for the same candidate SHA.

## Checkpoints

- 7-day checkpoint: 2026-07-28. Record path-level Vercel page views if credentials are available, plus Search Console and GA fields if connected.
- 28-day checkpoint: 2026-08-18. Decide `keep`, `repair`, or `stop` for same-day public-service weather bulletins.

## Keep, repair, stop

- Keep if the page publishes cleanly, source links resolve, the hero image loads, and the 7-day checkpoint returns truthful path-level data or clearly records why it is unavailable.
- Repair if article-level measurement remains credential-blocked, if the weather-source wording changes materially before publication, or if the item begins to imply unverified sponsor demand.
- Stop this format if there is no concrete official forecast/resource change, if the story becomes an emergency/alert item requiring human approval, or if same-day public-service bulletins fail to produce useful 7-day/28-day signals after comparable reps.
