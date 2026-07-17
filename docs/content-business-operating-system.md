# Trends Today content business operating system

## Uncomfortable truth

Trends Today has plenty of old broad-interest content, but it does not give a specific reader a reason to come back tomorrow. The new focus is the Lower Mainland: useful local updates with enough frequency to become a daily habit.

The operating goal is not to imitate another publisher's brand or rewrite its stories. It is to build an original local source network and turn verified regional changes into concise, useful reporting throughout the day.

## Business mechanism

The provisional audience is people who live, work, commute, eat, and make plans in Metro Vancouver and the Fraser Valley. They want one fast place to learn what changed nearby and what it means for their day.

The value chain is:

`local signal -> verified update -> practical reader value -> return visit -> direct habit -> local audience revenue`

Views are a leading asset signal. They are not the whole business. Articles must eventually influence at least one of returning readership, email audience, app discovery, ad revenue, affiliate revenue, or sponsorship demand.

## Editorial wedge

The first 28-day positioning test is **the useful Lower Mainland daily briefing**. The newsroom scans primary regional sources three times each weekday and publishes only updates with clear local relevance and reader utility.

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
2. Research the intended reader, pain, existing coverage, sources, unique angle, and CTA hypothesis.
3. Score the opportunity with `apps/pipeline/strategy.py`. Missing evidence remains missing; it is never replaced with a neutral invented score.
4. Brief only candidates that clear the current score and evidence thresholds.
5. Draft against primary or authoritative sources and preserve citations.
6. Fact-check claims, validate the article contract, create the image, and run SEO/build checks.
7. Stage a release candidate outside the live `content/` tree.
8. Ask Claude CLI for an independent exact-SHA review and repair valid findings.
9. Send the exact release candidate and its SHA-256 through the approved Claude review runner. A structured `NO BLOCKERS` verdict promotes it to public `content/`; blockers return it to repair and require a fresh review.
10. Run morning, midday, and evening sweeps. Publish no more than two qualifying articles per sweep and six per day. Skipping is correct when no opportunity clears the gates.
11. Record outcomes at 7 and 28 days, then choose `keep`, `repair`, or `stop`.

This is an independent-review boundary, not a human approval queue. The engine records the candidate hash, reviewer, model, verdict, and review artifact in the promoted article.

## First real experiment

- Baseline: capture the last 28 days of article-level search impressions, clicks, organic engaged sessions, returning readers, and app CTA clicks. If a metric is unavailable, record it as unavailable instead of zero.
- Changed variable: favor repeatable utility beats over a broad stream of interesting stories while retaining the evidence score.
- Rep: publish the highest-scoring eligible release candidate.
- Primary success metric: weekly returning Lower Mainland readers.
- Leading metrics: direct sessions, local search impressions, engaged-session rate, pages per returning session, and newsletter actions when available.
- Guardrails: named locality, practical reader impact, story-type source threshold, at least one primary source, no unsupported claim, no placeholder image, exact-candidate independent review, passing build/QA and deployment checks, and live post-deploy verification.
- Review: weekly operational review and a 28-day article decision.
- Decision: keep the scoring rule if it improves qualified results; repair one weak input if results are mixed; stop the topic/format if evidence stays weak after enough comparable reps.

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
- Research, drafting, editing, and image cost.
- Final `keep`, `repair`, or `stop` decision and reason.

Do not blend unavailable metrics into zeroes. Do not call revenue “profit.” Record content cost separately so contribution can be calculated honestly.

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

Research, scoring, briefs, drafts, images, QA, Claude review, repairs, low-risk content promotion, and measurement are autonomous. Crime allegations, active emergencies, deaths or serious injuries, missing-person cases, claims about private people, leaked material, and sponsored coverage require manual approval. Pricing, commercial terms, billing, guarantees, and use of private evidence also remain owner decisions.
