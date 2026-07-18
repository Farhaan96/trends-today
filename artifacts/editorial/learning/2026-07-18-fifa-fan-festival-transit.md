# Daily publisher learning - 2026-07-18 morning

## Outcome

- Decision: `release-candidate-built`
- Candidate: `How to take transit to Fan Festival final weekend`
- Category: `transit`
- Municipality: Vancouver

## Baseline and constraint

- Production `/api/analytics` reports Vercel Web Analytics embedded, but provider article-level export is unavailable.
- Google Analytics: unavailable.
- Google Search Console: unavailable.
- Article-level search impressions, clicks, engaged sessions, returning sessions, event-guide engagement, app CTA clicks, and revenue remain unavailable.
- Missing values were not converted to zero.
- Production local inventory before this candidate: `things-to-do` 2, `sports` 1, `local-news` 0, `transit` 0, `food-drink` 0, `housing` 0.
- Current constraint: measurement remains the business constraint; local category depth is the editorial constraint for repeat-use Lower Mainland habit.

## Hypothesis

Adding a final-weekend Fan Festival transit planner should be more useful than another general event recap because it gives a dated transportation decision for Vancouver readers while filling the empty transit shelf.

## Single changed variable

This run filled the first `transit` article with a current official-source planner instead of publishing another Burnaby park event or generic sports item.

## Sources

- [FIFA Fan Festival Vancouver overview](https://vancouverfwc26.ca/fifa-fan-festival)
- [FIFA Fan Festival Vancouver schedule](https://vancouverfwc26.ca/fifa-fan-festival/schedule)
- [Host City getting to FIFA Fan Festival guide](https://vancouverfwc26.ca/know-before-you-go/getting-to-fifa-fan-festival)
- [TransLink service changes](https://www.translink.ca/schedules-and-maps/service-changes)

## Known cost

- Cash/API cost: no project API key was used for built-in image generation.
- Human approval: not required because this is a public transit and event-planning update from official sources and no configured sensitive gate triggered.

## Checkpoints

- 7-day checkpoint: 2026-07-25. Record local search impressions/clicks, article page traffic if export becomes available, engaged sessions, returning sessions, and transit/event-guide engagement.
- 28-day checkpoint: 2026-08-15. Decide `keep`, `repair`, or `stop` for FIFA/event transit planners based on evidence.

## Next test

Keep prioritizing empty local shelves only when the reader job is concrete. The next best shelves remain `food-drink`, `local-news`, and `housing`, with food/drink openings or service impacts preferred over filler.
