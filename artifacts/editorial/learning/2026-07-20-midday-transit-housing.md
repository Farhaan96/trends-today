# Daily publisher learning - 2026-07-20 midday

## Outcome

- Decision: `published`.
- Candidates:
  - `Coquitlam road work is affecting Parkway and Panorama`
  - `Surrey says it passed 13,800 housing units`
- Categories: `transit`, `housing`.
- Municipalities: Coquitlam, Surrey.
- Sweep count: 2 of 2 allowed for this sweep; 2 of 6 known new stories for July 20.
- Release PR: [#24](https://github.com/Farhaan96/trends-today/pull/24), merged at `fc3bbf6e28c53bd6d7eb9c4119b8987011ca8a99`.
- Production deployment: `5527340348`, successful at 2026-07-20 12:13 p.m. Pacific, target URL `https://trends-today-43x4h9gni-farhaans-projects-088cb374.vercel.app`.
- Live URLs verified:
  - `https://www.trendstoday.ca/transit/coquitlam-parkway-panorama-road-work`
  - `https://www.trendstoday.ca/housing/surrey-housing-targets-13800-units`

## Baseline and constraint

- Production `/api/analytics` before the run reported 133 active articles, with local inventory at `local-news` 1, `transit` 2, `things-to-do` 3, `food-drink` 1, `housing` 1, and `sports` 1.
- Production `/api/analytics` after deployment reported 135 active articles, with `transit` 3 and `housing` 2.
- Vercel Web Analytics is embedded, but the new Vercel import could not run because `VERCEL_TOKEN` or `VERCEL_ANALYTICS_TOKEN` and `VERCEL_PROJECT_ID` were unavailable in the automation environment.
- Google Analytics, Google Search Console, page views, engaged sessions, returning sessions, scroll depth, measurable ad impressions, viewable ad impressions, Active View rate, ad revenue, page RPM, sponsor inquiries, qualified sponsor inquiries, sponsorship revenue, and content cost remain unavailable.
- Missing values were not converted to zero.
- Current constraint: measurement remains the business constraint; category depth still favours qualified transit, housing, local-news, food-drink, and sports utility before more things-to-do volume.

## Hypothesis

Road-work bulletins and housing-supply updates should support repeat Lower Mainland utility because they answer practical route, neighbourhood, and civic-planning questions without relying on another publisher's reporting.

## Single changed variable

This sweep added one Coquitlam route-planning bulletin and one Surrey housing-supply reported update instead of another Burnaby events item.

## Length and links

- Coquitlam road-work bulletin: 260 words, no internal link, shortest complete treatment for location, timing, and driver action.
- Surrey housing update: 456 words, one contextual internal link to `/housing/burnaby-tenant-protection-bylaw-now-in-effect`, reported-update length because the story needed the milestone, context, deadline, and caveat.

## Commercial research

- Coquitlam: `commercialIntent` is `ad-fit`; hypothesis is recurring commuter and local-service planning intent. Sponsor demand, ad revenue, RPM, and viewability are unavailable.
- Surrey: `commercialIntent` is `ad-fit`; hypothesis is local real-estate, home-service, and civic-planning reader intent. Sponsor demand, ad revenue, RPM, and viewability are unavailable.
- Both stories are independent editorial coverage with `sponsorshipStatus: editorial`; no supported, branded, outreach, pricing, billing, or customer-commitment action was taken.

## Sources

- [Coquitlam road work notice for Parkway Boulevard and Panorama Drive](https://www.coquitlam.ca/m/newsflash/Home/Detail/2003)
- [Coquitlam Traffic Hotspots](https://www.coquitlam.ca/198/Traffic-Hotspots)
- [City of Surrey July 15 housing target update](https://www.surrey.ca/news-events/news/surrey-exceeds-housing-targets-ahead-of-schedule-over-13800-units-issued)
- [City of Surrey Housing Accelerator Fund page](https://www.surrey.ca/renovating-building-development/housing-accelerator-fund)
- [City of Surrey development incentive programs](https://www.surrey.ca/renovating-building-development/housing-accelerator-fund/development-incentive-programs)

## Review and repairs

- Coquitlam first review found blockers on the image path and unsupported `northeast Coquitlam` descriptor. The image was copied to root `public/images`, the descriptor was removed, and the source URL was normalized.
- Surrey first review found internal monetization-test language in reader-facing copy. The sentence was removed and replaced with a resident-useful transit-area watch point.
- Final exact-SHA Fable reviews returned `NO BLOCKERS` for both candidates at repository SHA `ea10284f9654f97019efb0361a4eedba44faa0ba`. Fallback and paid credits were not used.
- Local validation passed: `python -m unittest discover -s apps/pipeline/tests`, `npm run typecheck`, `npm run lint -- --quiet`, `git diff --check`, and `npm run build`.
- Production browser verification passed for both canonical URLs: status 200, expected H1, canonical tag, required body facts, article image load, source links, and no page console errors.

## Checkpoints

- 7-day checkpoint: 2026-07-27. Record path-level Vercel page views if credentials are available, plus Search Console/GA fields if connected.
- 28-day checkpoint: 2026-08-17. Decide `keep`, `repair`, or `stop` for Coquitlam road-work bulletins and Surrey housing-supply reported updates.

## Keep, repair, stop

- Keep if both pages publish cleanly, source/internal links resolve, hero images load, and the 7-day checkpoint returns truthful path-level data or clearly records why it is unavailable.
- Repair if article-level measurement remains credential-blocked, if road-work claims are not snapshotted in research artifacts, or if local housing updates overclaim supply outcomes.
- Stop this format if route/work notices or housing target updates fail source, locality, or reader-decision utility gates in two comparable sweeps.
