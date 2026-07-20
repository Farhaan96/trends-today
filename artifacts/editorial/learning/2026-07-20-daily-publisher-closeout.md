# Daily publisher learning - 2026-07-20 carried-failure closeout

## Outcome

- Decision: `repair`; no new story was promoted before the carried production failures were closed.
- Starting `origin/main`: `52293d4b157f6401073a53ba84ed75acfd70451d`.
- Exact reviewed implementation SHA: `d16f84bc188b4e6f297629e6b51b21e1d274794e`.
- Reviewer: approved exact-SHA runner, Fable route, `NO BLOCKERS`; fallback and paid credits were not used.
- Pull request, merge SHA, deployment, and production checks will be appended after the guarded release completes.

## Root cause and repair

- `RelatedArticles` constructed every card URL from the current page category instead of the target article category. It now uses the related article's category, with frontmatter and current-category fallbacks.
- The complete carried-page link audit also found that `MoreFromAuthor` rendered `/author/trends-today-team` even though no matching author profile existed. It now renders the profile link only for a known author record.
- The Burnaby reported update now has one resolving, contextual transit-fare link. Generic or padded anchors were not added.
- Both carried articles now declare `commercialIntent`, `commercialFitReason`, `brandSafety`, and `sponsorshipStatus`. The reasons explicitly say that article-level advertiser demand, sponsor demand, RPM, or revenue is not verified.

## Measurement constraint

- Vercel Web Analytics is embedded, but a provider article-level export remains unavailable.
- Google Analytics, Search Console, article page views, engaged sessions, returning sessions, search impressions and clicks, advertising revenue, RPM, sponsor inquiries, and sponsor revenue remain unavailable. Missing values are not zero.
- Exactly one measurement repair: configure a provider-authenticated GA4 article export into the provider-neutral `artifacts/editorial/metrics/latest.json` input before the July 26 checkpoint, with article path, page views, engaged sessions, and returning sessions.

## Verification completed before release

- Both deterministic article validators passed: transit `384` words; Burnaby `483` words and `1` contextual internal link.
- Python suite: `59 passed`.
- TypeScript, targeted ESLint, and targeted Prettier: passed.
- Repository lint: `0` errors and `146` pre-existing warnings.
- Production build: passed with all `182` static pages and sitemap generation.
- Repository-wide Prettier retains its existing baseline debt (`381` files); every file changed by this repair passed targeted Prettier.
- Local production rendering: both carried articles loaded with the expected title, hero image, source links, and zero console errors.
- Local complete internal-link set: both carried pages plus Ramen Danbo, Burnaby tenant protection, FIFA transit, Metro Vancouver water restrictions, Windows 11 controls, the VSO concert, and Vancouver Opera returned `200`. The invalid author-profile link is no longer rendered.

## Checkpoints and rule

- 7-day checkpoint: `2026-07-26`.
- 28-day checkpoint: `2026-08-16`.
- `keep`: all repaired internal links remain live, both article pages remain console-clean, and comparable engagement data becomes available.
- `repair`: any carried internal or source link regresses, either page emits a console error, or the single GA4 export repair is still incomplete at the 7-day checkpoint.
- `stop`: do not add another topic or format variable to this experiment while comparable engagement remains unavailable.
