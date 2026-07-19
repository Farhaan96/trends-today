# Daily publisher learning - 2026-07-19 midday

## Outcome

- Decision: `release-candidate-built`
- Candidates:
  - `Ramen Danbo sets Main Street opening dates`
  - `Burnaby tenant protection bylaw is now in effect`
- Categories: `food-drink`, `housing`
- Municipalities: Vancouver, Burnaby

## Baseline and constraint

- Production `/api/analytics` reports Vercel Web Analytics embedded, but provider article-level export remains unavailable.
- Google Analytics: unavailable.
- Google Search Console: unavailable.
- Article-level search impressions, clicks, engaged sessions, returning sessions, event-guide engagement, repeat visits, app CTA clicks, and revenue remain unavailable.
- Missing values were not converted to zero.
- Production local inventory before this run: `things-to-do` 2, `sports` 1, `transit` 1, `local-news` 1, `food-drink` 0, `housing` 0.
- Current constraint: measurement remains the business constraint; empty `food-drink` and `housing` shelves are the editorial constraint for category-depth direction.

## Hypothesis

Business-confirmed openings and official renter-service explainers should earn more repeat local utility than another broad event item because both answer near-term Lower Mainland decisions.

## Single changed variable

This run used two zero-shelf utility categories in one sweep: one confirmed restaurant-opening bulletin and one official-source housing explainer.

## Sources

- [Ramen Danbo Main St opening announcement](https://ramendanbo.com/ramen-danbo-main-st-soft-grand-opening-schedule-officially-announced/)
- [Ramen Danbo locations page](https://ramendanbo.com/locations/)
- [City of Burnaby tenant protection page](https://www.burnaby.ca/our-city/programs-and-policies/housing/tenant-protection)
- [City of Burnaby housing page](https://www.burnaby.ca/our-city/programs-and-policies/housing)
- [City of Burnaby May 28 announcement](https://www.burnaby.ca/our-city/news/2026-05-28/city-burnaby-strengthens-tenant-protections-new-tenant-protection-bylaw)
- [Burnaby Tenant Protection Bylaw 2026 PDF](https://bylaws.burnaby.ca/media/14000/14821.pdf)

## Known cost

- Cash/API cost: no project API key was used for built-in image generation.
- Human approval: not required because both stories are low-risk public updates from primary or official business sources and no configured sensitive gate triggered.

## Checkpoints

- 7-day checkpoint: 2026-07-26. Record local search impressions/clicks, article page traffic if export becomes available, engaged sessions, returning sessions, and direct-session activity.
- 28-day checkpoint: 2026-08-16. Decide `keep`, `repair`, or `stop` for business-confirmed openings and housing explainers based on evidence.

## Next test

If these clear review and publish, the next sweep should prefer either a stronger transit/service update or a food/housing follow-up only if it adds a new practical reader decision.
