# Daily publisher learning - 2026-07-20 manual repair run

## Outcome

- Decision: `repair-only`; zero new stories were researched or published.
- Reason: the prior run left three live related-article links pointing at false category routes, one reported update below the contextual-link contract, and two carried-over local articles without the v4 commercial metadata.
- Base production SHA: `52293d4b157f6401073a53ba84ed75acfd70451d`.
- Repair commit: `4d10da0ffa42f30b44c92403bc4d9e3fdb261fe9`.
- Independent exact-SHA verdict: `NO BLOCKERS` from `claude-fable-5`; no fallback or paid credits were used.
- Primary release: PR #19 merged as `bbdb49070b52ce228b425c4b38720bf26f8af57f`; production deployment `5524226075` completed successfully.

## Verified baseline and constraint

- Live `/api/analytics` reports 133 articles and confirms Vercel Web Analytics collection is embedded.
- Vercel provider export: unavailable because no authenticated CLI/project context is present in the run environment.
- Google Analytics and Google Search Console: unavailable.
- Page views, engaged sessions, returning sessions, scroll depth, measurable ad impressions, viewable ad impressions, Active View rate, ad revenue, page RPM, sponsor inquiries, qualified sponsor inquiries, sponsorship revenue, and content cost: unavailable.
- Missing values were not converted to zero.
- Current business constraint: article-level commercial and engagement measurement is unavailable, so editorial strategy cannot be changed from performance evidence yet.

## Root-cause and editorial repairs

- Root cause: `RelatedArticles` built every related-card URL with the current page category instead of the related article's category.
- Reproduced live 404 routes:
  - `/transit/metro-vancouver-stage-2-water-restrictions-july-2026`
  - `/transit/windows-11-july-update-pause-restore-controls`
  - `/things-to-do/burnaby-tenant-protection-bylaw-now-in-effect`
- Verified live canonicals before repair:
  - `/local-news/metro-vancouver-stage-2-water-restrictions-july-2026`
  - `/technology/windows-11-july-update-pause-restore-controls`
  - `/housing/burnaby-tenant-protection-bylaw-now-in-effect`
- The renderer now uses each related article's category, with the current category only as a fail-safe fallback.
- The same comprehensive audit found the shared `More from Trends Today Team` profile link returned 404 because no matching author profile exists. The component now renders a profile link only when that author exists in the profile registry.
- `free-burnaby-park-events-this-week` now includes one resolving contextual link to the current TransLink fare bulletin. The link helps Gilmore Station visitors plan payment and is not padding.
- The TransLink bulletin and Burnaby events update now carry truthful `commercialIntent`, `commercialFitReason`, `brandSafety`, and `sponsorshipStatus` fields. Both remain independent editorial coverage. No sponsor demand, revenue, RPM, or advertiser evidence is claimed.
- The TransLink bulletin's existing four-sentence paragraph was split without changing any words after deterministic validation identified the current three-sentence maximum.

## Commercial hypotheses

- TransLink fare bulletin: `ad-fit`. Official fare details serve recurring commuter price-planning intent and may support contextual local-service ads. Advertiser demand and revenue remain unavailable.
- Burnaby events update: `ad-and-sponsor-fit`. Official free family-event listings may fit events-entertainment or local-retail contexts. Sponsor demand and revenue remain unavailable.
- Brand safety: `standard` for both.
- Sponsorship status: `editorial` for both.

## Single measurement repair

- Add a read-only Vercel Web Analytics API import keyed by canonical `requestPath`, using the production project ID and a scoped Vercel access token supplied outside the repository. Acceptance: the 7-day scorecard can retrieve non-invented `pageViews` for both carried-over article paths while every unsupported engagement, ad, and sponsor field remains `unavailable`.

This is the only measurement repair selected for this run. No length band, topic mix, or commercial topic-selection rule changed.

## Hydration regression check

- PR #18 merge SHA `23ff96ac26b20d45d7ada5c85a37655c5073e2df` remains in production history.
- Before this repair, live browser checks on the TransLink fare article and Burnaby events article showed the correct canonical, headline, body, and loaded hero image with zero console errors.
- The hydration implementation was not changed because no regression was observed.

## Validation and release evidence

- Python suite: 59 tests passed.
- TypeScript typecheck: passed.
- Targeted ESLint: passed.
- Targeted Prettier: passed after formatting the related-article component.
- Deterministic v4 article validation: passed for both carried-over articles, including word range, paragraph structure, source threshold, metadata, and contextual-link resolution.
- Production build: passed; Next.js generated all 182 static pages and next-sitemap completed.
- Local browser verification: both carried-over article canonicals rendered with the correct headlines and loaded hero images, all three related cards now use their real categories, the new contextual link rendered, and both pages had zero console errors.
- Local comprehensive link audit: all 11 unique internal links rendered in the two affected article bodies/supporting sections returned 200; the false author-profile link is no longer rendered.
- Independent exact-SHA review: `NO BLOCKERS` for `4d10da0ffa42f30b44c92403bc4d9e3fdb261fe9`; requested model `fable`, observed models `claude-fable-5` and `claude-haiku-4-5-20251001`, fallback false, paid credits false.
- Pull request: #19 passed the configured Vercel and Vercel Preview Comments checks, was marked ready, and merged without deleting `issue/daily-publisher-repair-2026-07-20`.
- Merge SHA: `bbdb49070b52ce228b425c4b38720bf26f8af57f`.
- Production: deployment `5524226075` completed successfully for the merge SHA.
- Final hydration verification: both affected live article pages retained the correct canonical, headline, date, body, and loaded 819 by 546 hero image; each page had zero browser console errors.
- Final link verification: all 15 unique rendered links across the two live articles were navigated in the browser. Every internal category, contextual, author-supporting, and related link resolved to a non-404 page; all four official source links resolved. The three repaired canonicals resolved under `/local-news`, `/technology`, and `/housing`.
- Run result: repair completed; zero new stories published.

## Checkpoints and decision rule

- 7-day checkpoint: 2026-07-27. Attempt the single Vercel `requestPath` import for both carried-over articles; record page views if authenticated data is available and keep every other missing metric unavailable.
- 28-day checkpoint: 2026-08-17. Compare only verified article-level results; do not infer commercial performance from topic labels.
- `keep`: all related and contextual links resolve on production, both hydration pages remain console-clean, and the measurement import returns truthful path-level data.
- `repair`: any related-card route, contextual link, source link, canonical, hero image, or console check fails, or the Vercel import cannot join by canonical path.
- `stop`: pause new automated stories if link-generation regression returns or release/live-verification gates cannot be satisfied.
