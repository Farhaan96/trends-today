# 2026-07-24 06:30 sweep: Expo Line weekend service bulletin

- Outcome: selected and promoted one qualified Lower Mainland transit bulletin for release. No second story qualified above duplicate, approval-gated, stale, thin, or low-utility alternatives in this sweep.
- Article: `Expo Line weekend service drops downtown Saturday`, canonical path `/transit/expo-line-weekend-service-downtown-maintenance`.
- Category and municipality: transit / Vancouver.
- Reader job: tell Expo Line riders when downtown weekend service is reduced and what to check before travelling.
- Editorial fit: TransLink's rail project page says service between Waterfront and Commercial-Broadway stations is affected from July 25 until fall 2026 during Saturday start-of-service to 10 a.m., Sunday start-of-service to 10 a.m., and Sunday 9:30 p.m. to end-of-service windows. It tells downtown riders to allow 20 minutes extra trip time and check station screens. The alerts page is the official last check for service notices.
- Commercial hypothesis: `commercialIntent` is `ad-fit` for commuter, trip-planning, local-service, and events-ad context. This is a sourced hypothesis only; `sponsorshipStatus` remains `editorial`.
- Length rationale: bulletin, 389 body words before final promotion metadata, because the reader needs start date, service windows, affected span, 20-minute guidance, and alert path. Copy was not padded for ad slots.
- Internal links: none. The optional Burrard cross-link was removed during review because it added support risk without direct reader utility.
- Single changed variable: tested a next-day downtown transit-disruption bulletin at the start of the July 24 local-day sweep.
- Sources: TransLink rail projects and LIM Rail Replacement Program; TransLink Transit Alerts. The earlier TransLink news-release URL was removed from the public article because the source's encoded-space canonical path created reviewer/link-safety friction even though live GET returned 200.
- Costs and metrics: editorial labour cost unavailable. Vercel article-level export, Search Console, GA, scroll depth, measurable and viewable ad impressions, Active View rate, ad revenue/RPM, sponsor inquiries, qualified sponsor inquiries, sponsorship revenue, and content cost remain unavailable, never zero.
- Measurement repair: connect `VERCEL_TOKEN` or `VERCEL_ANALYTICS_TOKEN` plus `VERCEL_PROJECT_ID`, then add configured GA/Search Console/ad/sponsor exports so article-level views, engagement, viewable inventory, revenue, and sponsor demand can be compared.
- Review: GPT exact-candidate PASS for candidate SHA `afde1949a555170333251ff4926df73e02e2adfdeb880206e5822a57048b12d8`, scores factual support 5, quality 4, readability 4, formatting 5, engagement 4, no blockers, zero authorial em dashes. Independent Claude Opus review remains pending on the formatted release snapshot.
- 7-day checkpoint: 2026-07-31.
- 28-day checkpoint: 2026-08-21.
- Keep/repair/stop rule: keep weekend transit-disruption bulletins when they have official-source service windows, concrete trip-planning action, verified links/images, and truthful metric availability; repair discovery when stale source items consume sweep time; stop if the item is generic infrastructure filler or commercial assumptions steer publication.
