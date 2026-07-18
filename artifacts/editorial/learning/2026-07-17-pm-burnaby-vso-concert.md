# Daily publisher learning - 2026-07-17 PM

## Outcome

- Decision: `published-candidate-promoted`
- Beat: `things-to-do`
- Lane: `weekend-and-planning`
- Article: `Free VSO concert returns to Burnaby's Deer Lake Park`
- Slug: `/things-to-do/free-vso-concert-burnaby-deer-lake-park`
- Candidate SHA-256: `caf66ce86b3cad27db3f022130708ae72639dcb1784437992f194c9d8a99c973`
- Review: `NO BLOCKERS` from Claude via `fable` at repository SHA `b16ee89f7f7995b973172848b0847cd89c74e6ca`.
- Promotion: content file written to `content/things-to-do/free-vso-concert-burnaby-deer-lake-park.mdx`; PR, deployment, and live verification still pending.

## Baseline and constraint

- Vercel Web Analytics: embedded in production, provider export unavailable to the repository endpoint.
- Google Analytics: unavailable.
- Google Search Console: unavailable.
- Article-level impressions, clicks, engaged sessions, returning sessions, app CTA clicks, and revenue: unavailable.
- Missing values were not converted to zero.
- Current constraint: market and repeat-use positioning for a new Lower Mainland daily habit, with measurement still unavailable.

## Hypothesis

A concise, source-linked free-event planning bulletin should be a stronger first local-news rep than a generic civic update because it helps readers make an immediate weekend decision.

## Single changed variable

The sweep prioritized a time-sensitive, free Lower Mainland event with confirmed logistics over broad technology or evergreen curiosity coverage.

## Sources

- [City of Burnaby event page](https://www.burnaby.ca/recreation-and-arts/events/symphony-park-featuring-vso)
- [Vancouver Symphony Orchestra event page](https://www.vancouversymphony.ca/event/symphony-in-the-park/)

## Known cost

- Cash/API cost: no project API key was used for the built-in image generation path.
- Human approval: not required because this is a low-risk public event bulletin.

## Checkpoints

- 7-day checkpoint: 2026-07-24. Record local search impressions/clicks, page traffic if export is available, engaged sessions, and returning sessions.
- 28-day checkpoint: 2026-08-14. Decide `keep`, `repair`, or `stop` for things-to-do bulletins based on local reader evidence.

## Next test

Repair measurement while continuing bounded local sweeps; compare free-event planning bulletins against service-change bulletins once comparable cohorts exist.

## 2026-07-17 source-link hotfix

- Live browser verification found the two source URLs rendered as plain text, not clickable anchors.
- Repair: converted the City of Burnaby and Vancouver Symphony Orchestra source bullets to Markdown links in the release candidate and promoted article.
- Changed variable: source discoverability and reader trust, without changing factual claims, headline, event details, or image.
