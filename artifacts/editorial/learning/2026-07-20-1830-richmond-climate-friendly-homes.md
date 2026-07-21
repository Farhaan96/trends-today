# Daily publisher learning - 2026-07-20 18:30

## Outcome

- Decision: `published`.
- Candidate: `Richmond seeks climate-friendly homes for August tour`.
- Category: `local-news`.
- Municipality: Richmond.
- Sweep count: 1 of 2 allowed for this sweep; 4 of 6 known new stories for July 20.
- Release PR: [#30](https://github.com/Farhaan96/trends-today/pull/30), merged at `546f5cb480aff7f518588f363837833956ade1cf`.
- Production deployment: GitHub deployment `5531684701`, successful at 2026-07-20 7:10 p.m. Pacific for SHA `546f5cb480aff7f518588f363837833956ade1cf`, target URL `https://trends-today-eljgms81j-farhaans-projects-088cb374.vercel.app`.
- Live URL verified: `https://www.trendstoday.ca/local-news/richmond-climate-friendly-homes-tour`.

## Baseline and constraint

- Production `/api/analytics` after deployment reported 137 active articles, with local inventory at `local-news` 2, `transit` 3, `things-to-do` 3, `food-drink` 1, `housing` 2, and `sports` 2.
- Production `/api/analytics` reported Richmond as the newest article with `publishedAt: 2026-07-20T18:45:00-07:00`.
- Vercel Web Analytics is embedded, but the Vercel import wrote `artifacts/editorial/metrics/2026-07-20-1830-vercel-analytics.json` with status `unavailable` because `VERCEL_TOKEN` or `VERCEL_ANALYTICS_TOKEN` and `VERCEL_PROJECT_ID` were unavailable in the automation environment.
- Google Analytics, Google Search Console, page views, engaged sessions, returning sessions, scroll depth, measurable ad impressions, viewable ad impressions, Active View rate, ad revenue, page RPM, sponsor inquiries, qualified sponsor inquiries, sponsorship revenue, and content cost remain unavailable.
- Missing values were not converted to zero.
- Current constraint: measurement remains the business constraint; editorially, the Richmond homeowner deadline produced a concrete local action without needing sensitive or sponsored handling.

## Hypothesis

A short Richmond climate-friendly homes bulletin should serve homeowner and neighbourhood-planning readers because it answers who can register, what features qualify, where to register, and the July 31 deadline from an official municipal source.

## Single changed variable

This sweep added one Richmond homeowner-deadline local-news bulletin instead of another sports, retrospective event, or civic-dispute item.

## Length and links

- Richmond bulletin: about 345 words, with one contextual internal link to `/local-news/metro-vancouver-stage-2-water-restrictions-july-2026`.
- Length rationale: a bulletin was the shortest complete treatment because readers needed the July 31 registration deadline, August 22 and August 30 tour dates, eligibility examples, source contact path, and one relevant water-rules context link.

## Commercial research

- `commercialIntent` is `ad-and-sponsor-fit`; hypothesis is contextual home-energy, garden, renovation, and local-service reader intent around a homeowner action article.
- Sponsor demand, ad revenue, RPM, viewability, sponsor inquiries, and qualified sponsor inquiries are unavailable.
- The story is independent editorial coverage with `sponsorshipStatus: editorial`; no supported, branded, outreach, pricing, billing, customer-commitment, private-evidence, or materially new public-claim action was taken.

## Sources

- [City of Richmond climate-friendly homes notice](https://www.richmond.ca/city-hall/news/2026/climatefriendlyhomes08jul2026.htm)
- [Richmond Climate-Friendly Homes and Gardens Tour registration](https://bit.ly/ClimateFriendlyTour2026)

## Review and repairs

- First GPT review blocked one unsupported tax-credit savings sentence. The sentence was removed and the candidate was rerun.
- Prettier formatting changed the final candidate hash, so GPT and Claude release reviews were rerun against the exact final candidate SHA.
- Final exact-candidate GPT review returned `PASS` for candidate SHA `1e642bbdf7473192e4faa07b92ae48ce394b8ffd9a8be9e41754d44e4e62dc91`, with all scores at least 4/5 and zero authorial em dashes.
- The Fable meter was unavailable from direct `claude /usage`, so the release review was routed to Opus 4.8 with fallback disabled and no paid credits.
- Claude exact-candidate release review returned `NO BLOCKERS` at repository SHA `0a992adaea1467762289895bb793ffab1e6ed7d6`; the reviewed candidate SHA matched `1e642bbdf7473192e4faa07b92ae48ce394b8ffd9a8be9e41754d44e4e62dc91`.
- Local validation passed: `python -m unittest discover -s apps/pipeline/tests`, `npm run typecheck`, `npm run lint -- --quiet`, targeted `npx prettier --check`, `git diff --check`, and `npm run build`.
- Production browser verification passed for the canonical URL: status 200, expected H1, matching canonical tag, July 31 deadline, August 22 and August 30 dates, Richmond contact email, source/internal links, loaded hero image, and zero page console errors.
- Direct HTTP checks returned 200 for the canonical article URL, internal Metro Vancouver water-rules link, City of Richmond source notice, and Bitly registration link after redirect to Eventbrite.

## Checkpoints

- 7-day checkpoint: 2026-07-27. Record path-level Vercel page views if credentials are available, plus Search Console and GA fields if connected.
- 28-day checkpoint: 2026-08-17. Decide `keep`, `repair`, or `stop` for municipal homeowner-deadline bulletins.

## Keep, repair, stop

- Keep if the page publishes cleanly, source/internal links resolve, the hero image loads, and the 7-day checkpoint returns truthful path-level data or clearly records why it is unavailable.
- Repair if article-level measurement remains credential-blocked, if home-efficiency claims begin to imply unsupported savings, or if registration pages cannot be verified through official-source context.
- Stop this format if homeowner-call bulletins fail to provide a concrete reader action, become sponsor-shaped without approval, or start competing with stronger event, transit, housing, food, or urgent local-service items.
