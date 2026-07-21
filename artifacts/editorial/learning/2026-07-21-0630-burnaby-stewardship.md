# Daily publisher learning - 2026-07-21 06:30

## Outcome

- Decision: `published-pending-release`.
- Candidate: `Burnaby park stewardship dates need registration`.
- Category: `things-to-do`.
- Municipality: Burnaby.
- Sweep count: 1 of 2 allowed for this sweep; 1 of 6 known new stories for July 21 if release and live verification complete.
- Release worktree: `C:\Users\farha\.codex\worktrees\trends-daily-2026-07-21-operator`.
- Release branch: `issue/lm-daily-2026-07-21-operator`.
- Canonical URL to verify after deploy: `https://www.trendstoday.ca/things-to-do/burnaby-park-stewardship-volunteer-dates`.

## Baseline and constraint

- Production `/api/analytics` before publication reported 137 active articles, with local inventory at `local-news` 2, `transit` 3, `things-to-do` 3, `food-drink` 1, `housing` 2, and `sports` 2.
- The Vercel importer wrote `artifacts/editorial/metrics/2026-07-21-0630-vercel-analytics.json` with status `unavailable` because `VERCEL_TOKEN` or `VERCEL_ANALYTICS_TOKEN` and `VERCEL_PROJECT_ID` were not available in the automation environment.
- Google Analytics, Google Search Console, page views, engaged sessions, returning sessions, scroll depth, measurable ad impressions, viewable ad impressions, Active View rate, ad revenue, page RPM, sponsor inquiries, qualified sponsor inquiries, sponsorship revenue, and content cost remain unavailable.
- Missing values were not converted to zero.
- Current constraint: measurement remains the business constraint; editorially, the Burnaby stewardship item created a concrete local action without sensitive or sponsored handling.

## Hypothesis

A short Burnaby stewardship bulletin should serve residents who want a nearby outdoor volunteer activity because it answers the next dates, parks, times, registration requirement, and what volunteers should expect from official source material.

## Single changed variable

This sweep added one practical Burnaby volunteer bulletin instead of filling a second slot with duplicate park-event, civic-dispute, away-sports, or low-utility municipal items.

## Length and links

- Burnaby bulletin: 274 words, with no contextual internal link.
- Length rationale: a bulletin was the shortest complete treatment because readers needed the next two dates, locations, registration requirement, activity type, and later-date fallback, not a guide or explainer.
- Internal-link rationale: no existing published Trends Today article added clear reader value without forcing an unrelated transition, so the bulletin stayed at zero internal links under the 0 to 1 bulletin allowance.

## Commercial research

- `commercialIntent` is `ad-and-sponsor-fit`; hypothesis is contextual local recreation, garden, environmental-service, and community-retail intent around an outdoor volunteer action article.
- Sponsor demand, ad revenue, RPM, viewability, sponsor inquiries, and qualified sponsor inquiries are unavailable.
- The story is independent editorial coverage with `sponsorshipStatus: editorial`; no supported, branded, outreach, pricing, billing, customer-commitment, private-evidence, or materially new public-claim action was taken.

## Sources

- [City of Burnaby Environmental Stewardship Events](https://www.burnaby.ca/recreation-and-arts/events/environmental-stewardship-events)
- [Burnaby stewardship event registration](https://docs.google.com/forms/d/e/1FAIpQLSdDmBcedvJdnniwV6aeHcJRfVExluzpkCUPC3GqVbcAU_xpCg/viewform)
- [Invasive Species Council of Metro Vancouver](https://iscmv.ca/)

## Review and repairs

- A first generated image described storm-drain marking and was not used.
- GPT blocked stale image-alt and commercial-fit wording in an earlier draft. The image and wording were repaired before final review.
- Final exact-candidate GPT review returned `PASS` for candidate SHA `bd683b0af481a9946c5c7f774de3856d312ae3bb1bc3db11735c2f1df5df50dd`, repository SHA `da8bffb01f59e338a37807632acee12202f93e43`, all scores at least 4/5, no blockers, and zero authorial em dashes.
- Fable usage was inspected and logged before release review.
- Claude exact-SHA release review used Fable with no fallback and returned `NO BLOCKERS` at repository SHA `da8bffb01f59e338a37807632acee12202f93e43` for the same candidate SHA.
- Live source-link verification after PR #32 found the original Google Forms registration URL returned 404. The official City of Burnaby page linked to the current form URL ending `SdDmBcedvJdnniwV6aeHcJRfVExluzpkCUPC3GqVbcAU_xpCg`, so the article, release candidate, research metadata, scorecard, and this learning entry were repaired before final closeout.

## Checkpoints

- 7-day checkpoint: 2026-07-28. Record path-level Vercel page views if credentials are available, plus Search Console and GA fields if connected.
- 28-day checkpoint: 2026-08-18. Decide `keep`, `repair`, or `stop` for practical park-stewardship bulletins.

## Keep, repair, stop

- Keep if the page publishes cleanly, source links resolve, the hero image loads, and the 7-day checkpoint returns truthful path-level data or clearly records why it is unavailable.
- Repair if article-level measurement remains credential-blocked, if the registration source changes, or if the article begins to imply unverified sponsor demand from a single event item.
- Stop this format if volunteer bulletins lack near-term dates, official registration utility, or a concrete Lower Mainland reader action.
