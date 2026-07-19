# Daily publisher learning - 2026-07-19 morning

## Outcome

- Decision: `published`
- Candidate: `What Metro Vancouver Stage 2 water rules allow now`
- Live URL: `https://www.trendstoday.ca/local-news/metro-vancouver-stage-2-water-restrictions-july-2026`
- Category: `local-news`
- Municipality: Metro Vancouver region

## Baseline and constraint

- Production `/api/analytics` reports Vercel Web Analytics embedded, but provider article-level export is unavailable.
- Google Analytics: unavailable.
- Google Search Console: unavailable.
- Article-level search impressions, clicks, engaged sessions, returning sessions, event-guide engagement, repeat visits, app CTA clicks, and revenue remain unavailable.
- Missing values were not converted to zero.
- Production local inventory before this candidate: `things-to-do` 2, `sports` 1, `transit` 1, `local-news` 0, `food-drink` 0, `housing` 0.
- Current constraint: measurement remains the business constraint; local-news category depth and repeat-use service utility are the editorial constraints.

## Hypothesis

A region-wide water-restriction service bulletin should be more useful than another event item because it affects many Lower Mainland households and gives readers a concrete decision about lawns, gardens, vehicles, pools, and local enforcement.

## Single changed variable

This run filled the first `local-news` shelf slot with a current public-service bulletin instead of chasing weaker food/drink openings from secondary sources.

## Sources

- [Metro Vancouver water restrictions](https://metrovancouver.org/services/water/water-restrictions)
- [City of Vancouver water restrictions explained](https://vancouver.ca/home-property-development/understanding-watering-restrictions.aspx)
- [City of Richmond lawn watering information](https://www.richmond.ca/services/water-sewer-flood/water-services/savewater/lawn.htm)
- [City of Delta Stage 2 notice](https://www.delta.ca/community-culture/happening-delta/news/stage-2-water-restrictions-activated-metro-vancouver-0)

## Known cost

- Cash/API cost: no project API key was used for built-in image generation.
- Human approval: not required because this is a public-service update from official sources and no configured sensitive gate triggered.
- Review: Claude Fable exact-SHA review returned `NO BLOCKERS` for candidate SHA `bf2fd69737a3bc3c9547488151f56bd801e8004927fcc891607c204106c40f11`.
- QA: deterministic candidate validation passed; Python suite passed 48 tests; typecheck passed; lint passed with existing warnings only; targeted Prettier passed; production build passed. `npm ci` reported the existing 22 audit vulnerabilities.

## Checkpoints

- 7-day checkpoint: 2026-07-26. Record local search impressions/clicks, article page traffic if export becomes available, engaged sessions, returning sessions, and direct-session activity.
- 28-day checkpoint: 2026-08-16. Decide `keep`, `repair`, or `stop` for regional service bulletins based on evidence.

## Next test

Keep looking for primary-source food/drink openings or housing utility items, but do not use secondary publisher lists or social snippets without a clean official source.
