# Trends Today content business operating system

## Uncomfortable truth

Trends Today does not have an article-volume problem. It has an evidence and feedback-loop problem. The repository contains multiple competing pipelines, fixed output targets, and publishing automation, but no trustworthy connection between a topic decision and qualified traffic, returning readers, app interest, or revenue.

The operating goal is therefore not “publish 15 per day.” It is to build an owned distribution asset that repeatedly turns good topic choices into measurable audience and commercial outcomes.

## Business mechanism

The provisional audience is busy, tech-curious professionals and operators who want important technology, science, health, psychology, space, and culture changes explained clearly. This remains a hypothesis until analytics show which readers return and which topics create attributable actions.

The value chain is:

`demand signal -> researched opportunity -> useful article -> qualified attention -> returning reader -> attributable app action -> audience revenue`

Views are a leading asset signal. They are not the whole business. Articles must eventually influence at least one of returning readership, email audience, app discovery, ad revenue, affiliate revenue, or sponsorship demand.

## Editorial wedge

The first 28-day positioning test is **useful update intelligence**, not a general-interest news feed. The model is a narrow reason to return: track a changing surface, explain the delta, identify who is affected, and give the reader a useful next action.

The initial beat mix is:

- 60% software-update utility: release notes, feature rollouts, compatibility, hidden changes, and practical consequences.
- 25% Vancouver now: local changes that affect plans, costs, mobility, openings, closures, or services.
- 15% remarkable explained: a small discovery lane for unusually strong science, culture, or technology stories.

This mix is a test, not a brand promise. Compare the beats after comparable 7-day and 28-day windows. Change one material variable at a time.

## Portfolio

The rolling 28-day target mix is configured in `config/content-business.json`:

- 45% compounding search: durable questions and topic clusters.
- 30% timely opportunity: current demand with a specific supported angle.
- 15% authority and proof: original analysis, experiments, and evidence.
- 10% app distribution: genuinely useful topics adjacent to one app, with an attributable CTA.

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
10. Publish no more than one qualifying article in a daily run. Skipping is correct when no opportunity clears the gates.
11. Record outcomes at 7 and 28 days, then choose `keep`, `repair`, or `stop`.

This is an independent-review boundary, not a human approval queue. The engine records the candidate hash, reviewer, model, verdict, and review artifact in the promoted article.

## First real experiment

- Baseline: capture the last 28 days of article-level search impressions, clicks, organic engaged sessions, returning readers, and app CTA clicks. If a metric is unavailable, record it as unavailable instead of zero.
- Changed variable: favor repeatable utility beats over a broad stream of interesting stories while retaining the evidence score.
- Rep: publish the highest-scoring eligible release candidate.
- Primary success metric: organic engaged sessions per article after 28 days.
- Leading metrics: 7-day search impressions, organic CTR, engaged-session rate, and attributable app CTA clicks.
- Guardrails: three usable sources, no unsupported claim, no placeholder image, exact-candidate independent review, passing build/QA and deployment checks, and live post-deploy verification.
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
3. Pick the highest-scoring non-duplicate opportunity; do not fill a quota.
4. Publish at most one article through the candidate, exact-review, validation, PR, deployment, and live-verification gates.
5. Log a skipped run with its reason when no candidate qualifies.
6. At the weekly review, keep the wedge, repair one weak input, or stop a beat only from comparable measured cohorts. Missing metrics trigger measurement repair, not a content verdict.

## Approval boundary

Research, scoring, briefs, drafts, images, QA, Claude review, repairs, content promotion, and measurement are autonomous. Pricing or commercial terms, billing, guarantees, customer commitments, and use of private customer evidence remain owner decisions because they change the business promise rather than editorial execution.
