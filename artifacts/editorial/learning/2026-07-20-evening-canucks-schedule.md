# Daily publisher learning - 2026-07-20 evening

## Outcome

- Decision: `published`.
- Candidate: `Canucks set 2026 home opener and ticket sale dates`.
- Category: `sports`.
- Municipality: Vancouver.
- Sweep count: 1 of 2 allowed for this sweep; 3 of 6 known new stories for July 20.
- Release PR: pending.
- Production deployment: pending.
- Live URL to verify after deploy: `https://www.trendstoday.ca/sports/canucks-2026-home-opener-ticket-dates`.

## Baseline and constraint

- Production `/api/analytics` before the run reported 135 active articles, with local inventory at `local-news` 1, `transit` 3, `things-to-do` 3, `food-drink` 1, `housing` 2, and `sports` 1.
- The latest production deployment before this sweep was deployment `5528804290` for SHA `f30e7c9c934240046b077bf5624bea4418250c66`, and browser verification found the homepage plus the two midday articles live with matching canonicals, loaded hero images, and zero page console errors.
- Vercel Web Analytics is embedded, but the Vercel import could not run because `VERCEL_TOKEN` or `VERCEL_ANALYTICS_TOKEN` and `VERCEL_PROJECT_ID` were unavailable in the automation environment.
- Google Analytics, Google Search Console, page views, engaged sessions, returning sessions, scroll depth, measurable ad impressions, viewable ad impressions, Active View rate, ad revenue, page RPM, sponsor inquiries, qualified sponsor inquiries, sponsorship revenue, and content cost remain unavailable.
- Missing values were not converted to zero.
- Current constraint: measurement remains the business constraint; sports category depth is still thin, so only a source-grounded sports utility bulletin qualified.

## Hypothesis

A concise Canucks schedule and ticket-window bulletin should add useful local sports depth because it gives Vancouver readers specific Rogers Arena dates and an August ticket-action window without relying on another publisher.

## Single changed variable

This sweep added one Vancouver sports schedule bulletin instead of filling the second slot with weaker retrospective, civic-dispute, or duplicate event items.

## Length and links

- Canucks schedule bulletin: 260 words, no contextual internal article link after GPT review found the original cross-link distracting.
- Length rationale: a bulletin was the shortest complete treatment because readers needed the first confirmed dates, ticket windows, and official verification path.

## Commercial research

- `commercialIntent` is `ad-fit`; hypothesis is contextual event, hospitality, and fan-experience ad fit around a local sports planning article.
- Sponsor demand, ad revenue, RPM, and viewability are unavailable.
- The story is independent editorial coverage with `sponsorshipStatus: editorial`; no supported, branded, outreach, pricing, billing, or customer-commitment action was taken.

## Sources

- [Canucks schedule announcement](https://www.nhl.com/canucks/news/canucks-announce-2026-27-regular-season-schedule)
- [Canucks schedule page](https://www.nhl.com/canucks/schedule)

## Review and repairs

- First GPT review blocked one manufactured-urgency sentence and one forced Whitecaps internal-link transition. Both were removed.
- Final exact-candidate GPT review returned `PASS` for candidate SHA `dcace1ca3c0bad6941098611b269b02d1f9eb80c50ad5475366c2d34439870bb`, with all scores at least 4/5 and zero authorial em dashes.
- The Fable meter was unavailable from direct `claude /usage`, so the release review was routed to Opus 4.8 with fallback disabled and no paid credits.
- Claude exact-candidate release review returned `NO BLOCKERS` at repository SHA `e427f1fa4643e3fc853f2efc73cb5129809a3d8a`.

## Checkpoints

- 7-day checkpoint: 2026-07-27. Record path-level Vercel page views if credentials are available, plus Search Console and GA fields if connected.
- 28-day checkpoint: 2026-08-17. Decide `keep`, `repair`, or `stop` for sports schedule bulletins.

## Keep, repair, stop

- Keep if the page publishes cleanly, official source links resolve, the hero image loads, and the 7-day checkpoint returns truthful path-level data or clearly records why it is unavailable.
- Repair if article-level measurement remains credential-blocked, if sports bulletins become too promotional, or if source pages cannot be snapshotted into research artifacts.
- Stop this format if schedule bulletins fail to produce local reader utility or become a substitute for stronger service, event, food, housing, or civic updates.
