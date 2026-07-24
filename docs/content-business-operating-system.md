# Trends Today content business operating system

## Uncomfortable truth

Trends Today has plenty of old broad-interest content, but it does not give a specific reader a reason to come back tomorrow. The new focus is the Lower Mainland: useful local updates with enough frequency to become a daily habit.

The operating goal is not to imitate another publisher's brand or rewrite its stories. It is to build an original local source network and turn verified regional changes into concise, useful reporting throughout the day.

## Business mechanism

The provisional audience is people who live, work, commute, eat, and make plans in Metro Vancouver and the Fraser Valley. They want one fast place to learn what changed nearby and what it means for their day.

The value chain is:

`local signal -> verified update -> practical reader value -> return visit -> direct habit -> local audience revenue`

Views are a leading asset signal. They are not the whole business. Articles must eventually influence at least one of returning readership, email audience, app discovery, ad revenue, affiliate revenue, or sponsorship demand.

## Monetization reality and editorial contract

Trends Today cannot honestly optimize for the "highest-paying" article yet because article-level ad revenue, RPM, Active View, sponsor inquiries, and sponsorship revenue are unavailable. Missing measurements remain unavailable, never zero. Until the measurement path is connected, commercial fit is a documented hypothesis and may only break a tie between stories that already clear reader-utility, locality, evidence, source, freshness, brand-safety, and quality gates.

The v5 contract in `config/content-business.json` applies to every future candidate:

- Select length from the reader job and story type. Bulletin, reported-update, and guide/explainer ranges are tunable priors, not targets to fill. Use the shortest complete treatment and never pad copy to create more ad slots.
- Every local candidate includes three to five concrete highlights and a reporting-method note. Keep paragraphs under 80 words, use descriptive H2 sections, and turn enumerable locations, prices, schedules, dates, eligibility rules, or steps into scannable lists.
- A utility promise must be delivered. If the headline or introduction promises where to go, what it costs, when it happens, who qualifies, or what to do, the body must provide that information in a clearly named section.
- Add contextual internal links only when they help. Links must resolve to already published Trends Today articles, use concise descriptive anchors, and never point back to the current article. Zero links is correct when no published story adds value.
- Record `commercialIntent`, `commercialFitReason`, `brandSafety`, and `sponsorshipStatus` on every local candidate. The automation default is independent editorial coverage. Supported or branded coverage remains owner-approved.
- Never select a weak story because it looks commercially attractive. Sponsor and ad fit come after editorial qualification.

This contract follows current publisher guidance rather than copied SEO folklore: Google says it has no preferred word count and asks whether a reader leaves feeling satisfied without another search. Google News expects clear dates, bylines, publisher information, contact information, and sponsorship labels. The Trust Project similarly emphasizes journalist identity, methods, references, local sourcing, and actionable feedback.

Advertisers are not buying word count. They need a clear audience, suitable context, measurable delivery, useful attention, brand safety, and a reachable commercial contact. Google defines a display impression as viewable when at least 50% of its pixels remain on screen for at least one second, and notes that advertisers use viewability when deciding how to bid. That makes a restrained, responsive, readable article more valuable than a cluttered page engineered for extra ad slots. Better Ads Standards rule out intrusive formats such as pop-ups, autoplay video with sound, prestitial countdowns, high ad density, and large sticky ads.

The first advertiser offer remains deliberately honest: Lower Mainland context, a defined placement and campaign period, available measurements, clear paid labels, and direct publisher contact through `hello@trendstoday.ca`. Audience size, RPM, viewability, conversion, and sponsor demand remain unavailable until verified.

Research references:

- https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- https://support.google.com/news/publisher-center/answer/6204050
- https://support.google.com/news/publisher-center/answer/9607104
- https://support.google.com/adsense/answer/4510652
- https://support.google.com/adsense/answer/1282097
- https://www.betterads.org/standards/
- https://thetrustproject.org/
- https://journalismtrustinitiative.org/frequently-asked-questions/
- https://www.iab.com/wp-content/uploads/2025/01/IAB_Outlook_-Study_January_16_2025_v2.pdf

## Editorial wedge

The first 28-day positioning test is **the useful Lower Mainland daily briefing**. The newsroom scans primary regional sources throughout the day and publishes only updates with clear local relevance and reader utility.

The initial beat mix is:

- 30% local news and civic changes.
- 20% transit, roads, weather, and travel impacts.
- 20% things to do and time-sensitive planning guides.
- 15% food, drink, openings, and closures.
- 10% housing and development.
- 5% local sports.

This mix is a test, not a brand promise. Compare the beats after comparable 7-day and 28-day windows. Change one material variable at a time.

## Portfolio

The rolling 28-day target mix is configured in `config/content-business.json`:

- 50% daily local utility.
- 20% weekend and planning coverage.
- 20% local explainers.
- 10% evergreen local search.

The mix is a starting hypothesis, not a quota. Weak lanes lose share when results say they should.

## Autonomous operating loop

The agent owns the work from research through repair:

1. Discover demand signals and record where each signal came from.
2. Research the intended reader, pain, existing coverage, sources, unique angle, and CTA hypothesis. After the story qualifies, record its ad/sponsor-fit hypothesis; commercial fit may only break a tie between equally qualified candidates.
3. Score the opportunity with `apps/pipeline/strategy.py`. Missing evidence remains missing; it is never replaced with a neutral invented score.
4. Brief only candidates that clear the current score and evidence thresholds.
5. Draft against primary or authoritative sources and preserve citations.
6. Fact-check claims, validate the article contract, create the image, and run SEO/build checks.
7. Stage a release candidate outside the live `content/` tree.
8. Send the exact release candidate through the GPT editorial gate. Every factual-support, quality, readability, formatting, and engagement score must be at least 4/5, authorial prose must contain zero em dashes, and blockers must be empty. Repair valid findings and run a fresh GPT review.
9. Send the same exact candidate and its SHA-256 through the approved independent Claude release-review runner. A structured `NO BLOCKERS` verdict, together with the passing GPT artifact, promotes it to public `content/`; blockers return it to repair and require fresh GPT and Claude reviews.
10. Run sweeps every two hours from 06:30 through 18:30 America/Vancouver. Publish no more than two qualifying articles per sweep and six per day. Skipping is correct when no opportunity clears the gates.
11. Record outcomes at 7 and 28 days, then choose `keep`, `repair`, or `stop`.

This is a dual-review boundary, not a human approval queue. The engine records the candidate hash, each reviewer, model, verdict, scorecard, and review artifact in the promoted article.

## First real experiment

- Baseline: capture the last 28 days of article-level search impressions, clicks, organic engaged sessions, returning readers, and app CTA clicks. If a metric is unavailable, record it as unavailable instead of zero.
- Changed variable: publish future local stories with the v5 completeness and readability contract while preserving source and qualification thresholds.
- First rep: repair the Surrey cooling-location guide at its existing URL, then apply the contract to the next eligible local candidate.
- Primary success metric: engaged-session rate for v5 local articles compared with the prior local cohort when analytics are available.
- Leading metrics: scroll depth, articles per returning session, direct sessions, local search impressions, advertising inquiries, and viewable ad impressions when available.
- Guardrails: named locality, practical reader impact, three to five highlights, reporting method, delivered utility promise, story-type source threshold, at least one primary source, no unsupported claim, no placeholder image, passing exact-candidate GPT editorial and Claude release reviews, passing build/QA and deployment checks, and live post-deploy verification.
- Review: first 8 comparable v5 local articles or 28 days, whichever takes longer.
- Decision: keep if engagement improves without more corrections or production time beyond the agreed ceiling; repair one layout or contract variable if results are mixed; stop the added element if it adds work without measurable reader value.

## Scoreboard

Track these by article and by content lane:

- Published date and release SHA.
- Opportunity score and evidence links.
- Search impressions and clicks at day 7 and day 28.
- Organic engaged sessions and engaged-session rate.
- Returning-reader sessions.
- Newsletter or follow action, when implemented.
- App CTA impressions, clicks, and downstream activation where available.
- Ad, affiliate, or sponsorship revenue attributed to the article.
- Page views, measurable ad impressions, viewable ad impressions, Active View rate, and page RPM when connected.
- Sponsor inquiries, qualified sponsor inquiries, and sponsorship revenue when connected.
- Research, drafting, editing, and image cost.
- Final `keep`, `repair`, or `stop` decision and reason.

Do not blend unavailable metrics into zeroes. Do not call revenue “profit.” Record content cost separately so contribution can be calculated honestly.

Until commercial measurement exists, the weekly review must choose one measurement repair instead of changing article strategy blindly. After comparable data exists, change only one material variable at a time: one story type's length band, one internal-link range, one formatting rule, or one beat mix. Every experiment needs a baseline, success metric, guardrails, review date, and `keep / repair / stop` decision.

## Stop conditions

- Stop publishing a format when it repeatedly misses the evidence threshold or produces no qualified signal after comparable 28-day windows.
- Stop increasing volume when quality failures, indexing problems, or measurement gaps rise.
- Stop app promotion when the topic-to-app connection is forced or unmeasurable.
- Stop automation at any step that cannot meet its quality bar or produce an auditable outcome.

## Daily decision tree

1. Read the latest scorecard and learning ledger before researching.
2. Prefer the beat furthest below its target share only when it also has current demand and strong sources.
3. Pick the highest-scoring non-duplicate local opportunities; do not fill a quota.
4. Publish at most two articles per sweep and six per day through the candidate, exact-review, validation, PR, deployment, and live-verification gates.
5. Log a skipped run with its reason when no candidate qualifies.
6. At the weekly review, keep the wedge, repair one weak input, or stop a beat only from comparable measured cohorts. Missing metrics trigger measurement repair, not a content verdict.

## Approval boundary

Research, scoring, briefs, drafts, images, QA, GPT editorial review, Claude release review, repairs, low-risk content promotion, and measurement are autonomous. Crime allegations, active emergencies, deaths or serious injuries, missing-person cases, claims about private people, leaked material, and sponsored coverage require manual approval. Pricing, commercial terms, billing, guarantees, and use of private evidence also remain owner decisions.
