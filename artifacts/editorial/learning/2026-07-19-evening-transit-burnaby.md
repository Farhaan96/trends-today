# Daily publisher learning - 2026-07-19 evening

## Outcome

- Decision: `release-candidate-built`
- Candidates:
  - `What TransLink fares cost after the July increase`
  - `Free Burnaby park events to plan this week`
- Categories: `transit`, `things-to-do`
- Municipalities: Lower Mainland, Burnaby

## Baseline and constraint

- Production `/api/analytics` reports Vercel Web Analytics embedded, but provider article-level export remains unavailable.
- Google Analytics: unavailable.
- Google Search Console: unavailable.
- Article-level search impressions, clicks, engaged sessions, returning sessions, event-guide engagement, repeat visits, app CTA clicks, and revenue remain unavailable.
- Missing values were not converted to zero.
- Production local inventory before this run: `local-news` 1, `transit` 1, `things-to-do` 2, `sports` 1, `food-drink` 1, `housing` 1.
- Current constraint: measurement remains the business constraint; this sweep changes local utility coverage with one region-wide transit price bulletin and one practical Burnaby family-events bulletin.

## Hypothesis

Readers are more likely to return for concise source-linked planning facts than for broad event aggregation: exact fares, pass amounts, dates, locations, weather caveats, and parking or transit constraints.

## Single changed variable

This run adds immediate utility across two planning jobs: "what does my transit trip cost now" and "what free Burnaby family outing can I choose this week."

## Sources

- [TransLink pricing and fare zones](https://www.translink.ca/transit-fares/pricing-and-fare-zones)
- [City of Burnaby events calendar](https://www.burnaby.ca/recreation-and-arts/events)
- [City of Burnaby Summer Stages](https://www.burnaby.ca/recreation-and-arts/events/summer-stages)
- [City of Burnaby Jim Lorimer Park Re-opening Celebration](https://www.burnaby.ca/recreation-and-arts/events/jim-lorimer-park-re-opening-celebration)

TransLink source capture on 2026-07-19 recorded current adult cash/contactless fares, adult Stored Value fares, concession fares, monthly passes, DayPasses, the $6.50 YVR Airport AddFare, and the 90-minute fare-validity note from the live pricing page.

## Known cost

- Cash/API cost: no project API key was used for built-in image generation.
- Human approval: not required because both stories are low-risk public utility updates from primary sources and no configured sensitive gate triggered.

## Checkpoints

- 7-day checkpoint: 2026-07-26. Record local search impressions/clicks, article page traffic if export becomes available, engaged sessions, returning sessions, event-guide engagement, and direct-session activity.
- 28-day checkpoint: 2026-08-16. Decide `keep`, `repair`, or `stop` for transit fare utility and Burnaby family-event bulletins based on evidence.

## Next test

If these clear review and publish, the next sweep should prefer a new municipality or a true service impact before adding another Burnaby event item.
