# Weekly growth review - 2026-07-20

## Constraint

- Decision: `repair-measurement`.
- Current constraint: article-level commercial and engagement measurement is still unavailable from this automation environment, so the publication cannot honestly tune story length, link density, formatting, or beat mix from performance.
- Local publishing baseline: production `/api/analytics` reports 133 active articles, with local inventory at `local-news` 1, `transit` 2, `things-to-do` 3, `food-drink` 1, `housing` 1, and `sports` 1.
- Comparable cohort status: unavailable. The active Lower Mainland cohort was published July 17-19, so the first 7-day checkpoints start July 24-26 and 28-day checkpoints start August 14-16.

## Evidence

- Production `/api/analytics` confirms Vercel Web Analytics is embedded, but provider article-level export is not exposed by the repository endpoint.
- Vercel CLI is installed, but this run has no Vercel credentials or token. `vercel ls` and `vercel inspect` both stopped at missing credentials.
- Google Analytics and Google Search Console are unavailable in the run environment.
- Page views, engaged sessions, returning sessions, scroll depth, measurable ad impressions, viewable ad impressions, Active View rate, ad revenue, page RPM, sponsor inquiries, qualified sponsor inquiries, sponsorship revenue, and content cost remain unavailable. They were not converted to zero.
- `/contact` returned HTTP 200 and exposes an advertising or sponsorship inquiry path through `hello@trendstoday.ca`.
- `/affiliate-disclosure` returned HTTP 200 and exposes `business@trendstoday.ca` for business questions, but no verified sponsor-inquiry store, qualified-inquiry ledger, or revenue source is connected.
- Open GitHub state: PR #21 is a draft evidence-only follow-up for the daily repair run; Vercel preview checks are green.
- Recent production state from repo/GitHub evidence: PR #19 merged at `bbdb49070b52ce228b425c4b38720bf26f8af57f` after repairing related-card routes, article metadata, and contextual-link validation.

## Article and Contract Read

- Bulletins remain within 250-450 words where checked: `Ramen Danbo sets Main Street opening dates` is 283 words and `What TransLink fares cost after the July increase` is 409 words.
- Reported updates checked remain within 450-800 words: FIFA transit, Metro Vancouver water restrictions, Burnaby events, VSO, Vancouver Opera, and Whitecaps are 503-626 words.
- The checked guide/explainer remains within 700-1200 words: Burnaby tenant protection is 819 words.
- Internal links stayed in range where checked. The Burnaby events update has one resolving contextual link to the TransLink fare bulletin; the checked bulletins have zero links; the rest of the young cohort has no comparable performance data yet.
- Commercial metadata is present on the two articles repaired in PR #19; older carried-over local articles still represent a metadata backfill opportunity, but this weekly review changed only measurement.

## Hypothesis

If the weekly operator can import Vercel Web Analytics by canonical `requestPath`, the next weekly review can at least compare verified article-level page views while keeping unsupported engagement, ad, and sponsor metrics unavailable.

## Single Change

- Added `apps/pipeline/vercel_analytics.py`, a read-only importer for Vercel Web Analytics `visits/aggregate`.
- The importer requires `VERCEL_TOKEN` or `VERCEL_ANALYTICS_TOKEN` plus `VERCEL_PROJECT_ID`; optional `VERCEL_TEAM_ID` or `VERCEL_TEAM_SLUG` scopes team projects.
- It joins page views to published article metadata by canonical path and outputs the provider-neutral analytics shape consumed by `apps/pipeline/scorecard.py`.
- Unsupported fields remain `null` or listed as missing: engaged sessions, returning sessions, scroll depth, ad viewability, ad revenue, RPM, sponsor inquiries, sponsorship revenue, and content cost.

## Baseline

- Baseline scorecard: `analytics.status = unavailable`; missing includes article-level search impressions/clicks, organic engaged sessions, returning sessions, app CTA clicks, page views and ad revenue, measurable/viewable ad impressions, and qualified sponsor inquiries.
- Production health baseline: `/api/analytics`, `/contact`, and `/affiliate-disclosure` all returned HTTP 200 during this review.
- Publication-rate guardrail baseline: current Lower Mainland production inventory is 9 local articles across six active local categories, with no performance-based reason to increase volume.

## Success Metric

- By the 2026-07-27 weekly review, the importer returns non-invented `pageViews` for at least the July 19 TransLink fare bulletin and Burnaby events update when valid Vercel credentials are present.

## Guardrails

- Do not use imported page views as engagement, retention, ad viewability, revenue, or sponsor proof.
- Do not tune word ranges, internal-link ranges, formatting, or beat mix until comparable 7-day and 28-day cohorts exist.
- Do not change sponsor rates, terms, outreach, supported coverage, public audience claims, or commercial promises without Farhaan approval.
- Stop or repair the importer if it cannot join by canonical path, leaks credentials, coerces missing fields to zero, or blocks daily publication validation.

## Next Review

- 7-day import check: 2026-07-27.
- 28-day content decision check for the first local cohort: 2026-08-17.
- Decision rule: `keep` if path-level Vercel page views import cleanly and the scorecard consumes the export; `repair` if credentials or request filters fail; `stop` if two consecutive measurement repairs still cannot produce verified article-level data.
