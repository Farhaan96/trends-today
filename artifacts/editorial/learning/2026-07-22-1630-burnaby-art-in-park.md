# 2026-07-22 16:30 Lower Mainland publisher learning

## Result

- Published: `Free Burnaby Art in the Park dates start Monday`.
- Category and municipality: `things-to-do`, Burnaby.
- Publication time: 2026-07-22 16:45 America/Vancouver.
- Canonical URL: https://www.trendstoday.ca/things-to-do/burnaby-art-in-park-making-together
- Release PR: https://github.com/Farhaan96/trends-today/pull/52
- Merge SHA: `87cf86d00736db470859a05575cf3c4e6b8d8968`.
- Production deployment: GitHub deployment `5564728674`, status `success`.
- Live verification: 2026-07-22 after deployment, browser verification returned the canonical page with HTTP 200, matching H1 and canonical URL, July 27/30/31 date details, all five Burnaby park locations, the July 31 videographer notice, source links, the contextual Burnaby stewardship internal link, loaded hero image, and zero console or page errors. The production analytics endpoint reported 148 total articles and `things-to-do` at 6.
- Daily ceiling state: 5 of 6 stories used before this sweep, 6 of 6 after publication. No second story was published because the daily ceiling was reached and the remaining candidates were duplicate, sensitive, weak, or stale.

## Reader Job

Help Burnaby families pick a free drop-in Art in the Park session before leaving home.

## Editorial Qualification

- Locality: Burnaby, within the Lower Mainland.
- Freshness: City of Burnaby lists free Art in the Park sessions for July 27, 30, and 31, 2026.
- Evidence: City of Burnaby event page for Art in the Park: Making Together.
- Uniqueness: Trends Today had nearby Burnaby event and stewardship coverage, but no bulletin for this specific free drop-in art program.
- Brand safety: standard free municipal arts and family activity coverage.
- Sensitive-story review: no crime, death, serious injury, active emergency, missing-person, private-person, leaked-material, sponsored, supported, or branded trigger.

## Commercial Hypothesis

- commercialIntent: `ad-fit`
- sponsorshipStatus: `editorial`
- commercialFitReason: free family activity intent may fit contextual local ads around family recreation, arts supplies, nearby food, public programs, and weekend planning. This remains a sourced hypothesis because Trends Today has no verified article-level page views, viewability, RPM, ad revenue, or sponsor demand for this format.
- Approval boundary: no sponsor outreach, pricing, rates, terms, guarantees, supported placement, or customer commitment was made.

## Length And Links

- Story type: bulletin.
- Length rationale: the reader needed dates, parks, times, registration status, what to expect, materials, and the July 31 filming note. The article stayed short and was not padded for ad inventory.
- Internal links: one contextual link to the existing Burnaby park stewardship bulletin.

## Single Changed Variable

Added a free family arts bulletin to test practical things-to-do utility after several public-service and transit updates earlier in the day.

## Sources

- https://www.burnaby.ca/recreation-and-arts/events/art-park-making-together

## Costs And Measurement

- Direct content cost: unavailable.
- Page views, engaged sessions, returning sessions, scroll depth, measurable ad impressions, viewable ad impressions, Active View rate, ad revenue, page RPM, sponsor inquiries, qualified sponsor inquiries, sponsorship revenue, and content cost remain unavailable from configured article-level sources and were not recorded as zero.
- Measurement repair: connect `VERCEL_TOKEN` or `VERCEL_ANALYTICS_TOKEN` plus `VERCEL_PROJECT_ID`, then add configured Search Console, GA, ad, and sponsor inquiry exports.

## Review And QA

- Final exact-candidate GPT review: PASS, candidate SHA `2cad5ab427a70e94dd118496f713ba0b4253846ab160fd6134aa7e5bd09b17e2`, repository SHA `4514aec787994d6d39e417143fa6041c8ca7422a`, scores factual support 5, quality 4, readability 5, formatting 5, engagement 4, no blockers, zero authorial em dashes.
- Fable usage was inspected and logged, but non-interactive `/usage` returned no usable Fable percentage. Per policy, the mandatory release review used Opus with `-DisableFallback`.
- Final exact-SHA Claude release review: `NO BLOCKERS` for the same candidate SHA and repository SHA.
- Validation passed: Python unittest suite, em-dash validator on candidate and promoted content, `npm ci`, `npm run typecheck`, `npm run lint -- --quiet`, targeted Prettier, `git diff --check`, and `npm run build`. `npm ci` reported existing vulnerabilities: 5 moderate, 16 high, 1 critical.

## Checkpoints

- 7-day checkpoint: 2026-07-29.
- 28-day checkpoint: 2026-08-19.
- Keep: if verified article-level engagement, local search impressions, returning sessions, or direct traffic show free municipal activity bulletins create useful Lower Mainland attention.
- Repair: if engagement is low, tighten future event bulletins toward better timing, clearer neighbourhood utility, or grouped weekend planning when source evidence supports it.
- Stop: if free event stories become generic calendar rewrites, lack timely official-source evidence, or commercial assumptions steer publication without comparable data.
