# Daily publisher learning - 2026-07-17 night fill-in

## Outcome

- Decision: `fill-in-candidates-built`
- Publication target: up to two articles, pending exact-SHA review, promotion, PR, deployment, and live browser verification.
- Candidate 1: `Free Vancouver Opera concert takes over Deer Lake Park`
- Candidate 2: `Whitecaps say 30,000 tickets sold for BC Place return`
- Categories: `things-to-do` and `sports`
- Municipalities: Burnaby and Vancouver

## Baseline and constraint

- Local active inventory before this fill-in run: `things-to-do` had one article; `local-news`, `transit`, `food-drink`, `housing`, and `sports` had zero active articles.
- Vercel Web Analytics: embedded in production, but article-level export unavailable through the repository endpoint.
- Google Analytics: unavailable.
- Google Search Console: unavailable.
- Missing values were not converted to zero.
- Current constraint: category depth and repeat-use local utility. Article count remains only an operating measure.

## Hypothesis

Adding one immediate free-event planner and one high-interest Vancouver sports planner should increase the chance a Lower Mainland reader finds a reason to return, because both articles answer a dated decision with official source links.

## Single changed variable

This fill-in run seeded local category depth by adding a second `things-to-do` story and the first `sports` story, instead of filling with generic national technology or entertainment coverage.

## Sources

- [City of Burnaby Opera in the Park event page](https://www.burnaby.ca/recreation-and-arts/events/opera-park-featuring-vancouver-opera)
- [Vancouver Opera event page](https://www.vancouveropera.ca/opera-in-the-park/)
- [Whitecaps announcement](https://www.whitecapsfc.com/news/30000-bc-place-return)
- [Whitecaps schedule](https://www.whitecapsfc.com/schedule/matches)
- [BC Place event page](https://www.bcplace.com/?event=vancouver-whitecaps-fc-vs-lafc)

## Known cost

- Cash/API cost: no project API key was used for built-in image generation.
- Human approval: not required because both candidates are low-risk public event or sports planning items and no configured sensitive gate triggered.

## Checkpoints

- 7-day checkpoint: 2026-07-24. Record local search impressions/clicks, article page traffic if export becomes available, engaged sessions, returning sessions, and event-guide engagement.
- 28-day checkpoint: 2026-08-14. Decide `keep`, `repair`, or `stop` for local event/sports planners based on evidence.

## Next test

Keep the two-story sweep cap. Fill empty categories only when there is a real reader job, and prioritize food/drink openings or transit/service impacts next over more Burnaby park-event depth.
