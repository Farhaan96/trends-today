# 2026-07-29 06:30 BC Lions Winnipeg watch guide

## Run identity

- Run ID: `run-trends-today-daily-publisher-2026-07-29-0630`
- Trigger: scheduled two-hour Lower Mainland publisher
- Starting base: `88c480a9ffa4f92013ceade80183cde687603b01`
- Release evidence SHA: `8b7c89f0025d55ee08428a0d766a63f5feac18ba`
- Candidate SHA-256: `bfd8fe90866978d9ff030f74b138738f7bfb5fc21c6bf03a086632dfbdcca792`
- Published branch head: `6dd4a9e5c5a0722a2e38088cf3ca93cc6629f612`
- Merge SHA: `5020679ef8afcbb8653c63b4193b54d89aeb84e8`
- Root checkout: preserved with all dirty and untracked artifacts untouched
- Mutation worktree: `C:\Users\farha\.codex\worktrees\trends-daily-2026-07-29-0633`
- Independent review worktree: `C:\Users\farha\.codex\worktrees\trends-review-bc-lions-bfd8fe90`

## Seven-sweep result

1. Metrics: public analytics returned HTTP 200 with 167 active articles and zero July 29 publications at 06:37 Pacific. Protected reporting returned HTTP 401. Vercel Analytics, GA4, Search Console, advertising, sponsor, revenue, and cost exports were unavailable, not zero.
2. Discovery: the enabled primary-source scan produced 58 opportunities.
3. Deduplication: the fresh July 29 BC Lions podcast URL was the only new URL since the July 28 18:30 sweep.
4. Qualification: one sports bulletin scored 89.0 and cleared the editorial threshold. The other 57 opportunities remained already covered, duplicate, recurring, stale, retrospective, sensitive, thin, or below the standalone utility and evidence thresholds.
5. Verification: five official sources returned HTTP 200. Four sources identified Winnipeg; one BC Lions viewing page labelled Saskatchewan. The conflict was disclosed and the mismatched page was not used as opponent evidence. The expected quarterback-start item remained excluded as uncertain.
6. Exact reviews: GPT passed the exact candidate, then Claude Opus 5 passed an independent exact-SHA release review with fallback disabled. No Fable call was started.
7. Release and learning: one article was promoted, merged, deployed, and browser-verified. The daily count moved from 0 to 1 of 6; the sweep count was 1 of 2.

## Source evidence

- BC Lions podcast: `https://www.bclions.com/2026/07/29/1st-and-now-solomon-elimimian-stops-by-plus-we-talk-salkter-bomber-battle/`, HTTP 200, SHA-256 `960a8fa679d94208f21dd191a41c4e53ef295153d39e05640244ae6c0a985551`
- BC Lions schedule: `https://www.bclions.com/schedule/2026/`, HTTP 200, SHA-256 `448370c865ef24a90375adea29dc1780671d870a592216143d6e3e81befd678f`
- CFL broadcast schedule: `https://www.cfl.ca/2026-cfl-broadcast-schedule/`, HTTP 200, SHA-256 `d50e8d80ee1449eca5b9d5bce3b797ac52eb5cae9cab0c6cd623698726d51db2`
- Winnipeg Blue Bombers listing: `https://www.bluebombers.com/individual-game-day-tickets/`, HTTP 200, SHA-256 `4644be3b54c7b71e5a884c263872f06b0b19993b11db3f072979a8258b02405f`
- BC Lions where-to-watch page: `https://www.bclions.com/wheretowatch/`, HTTP 200, SHA-256 `44e4b03ac8e2590361d3f1963cffb2556670e4a048e2195079ba29e483ac4133`
- All five hashes were unchanged at the 07:21 pre-release evidence recheck.
- The three load-bearing pages were unchanged again at 07:44 immediately before promotion.

## Review evidence

- Material plan review used `claude-opus-5` with `-DisableFallback`. The first gate found B1/B2 and D1-D8; the next two gates repaired the self-contained audit record and exact frontmatter contract. Final plan gate: `NO BLOCKERS` at `5605a0d15c4129e4a530494c377354420ab2cb77`.
- GPT editorial gate: `gpt-5.6-sol`, Codex CLI OAuth backend, run `019fae43-1bf9-7591-b4ba-6fd8599a29ce`, `PASS`, scores engagement 4, factual support 5, formatting 5, quality 4, readability 5, zero blockers, zero prose em dashes.
- GPT artifact: `artifacts/editorial/reviews/gpt/sports/bc-lions-winnipeg-july-30-watch-guide.bfd8fe908669.json`
- Claude release gate: `claude-opus-5`, fallback disabled, exact SHA `8b7c89f0025d55ee08428a0d766a63f5feac18ba`, exact candidate hash `bfd8fe90866978d9ff030f74b138738f7bfb5fc21c6bf03a086632dfbdcca792`, `NO BLOCKERS`.
- Claude artifact: `artifacts/editorial/reviews/sports/bc-lions-winnipeg-july-30-watch-guide.bfd8fe908669.json`
- Image: AI-generated original PNG, visually checked and independently verified by Opus through its embedded OpenAI C2PA manifest. No legible logo, text, watermark, identifiable player, or real-venue claim was found.

## Checks

- `validate_release_candidate`: passed, 362 body words, five H2 sections, 15 list items, four unique highlights, all five sources cited, zero internal article links, zero sensitive-keyword hits.
- Python pipeline: 87 tests passed.
- Em-dash validator: passed on candidate and promoted article.
- Published content tree: passed.
- `npm ci`: passed.
- Typecheck: passed.
- Quiet lint: passed with the repository's existing warning baseline and no errors.
- Production build: passed; sitemap generation included the new canonical.
- `git diff --check`: passed.
- Repository-wide Prettier remains a pre-existing failing baseline across many untouched files. The three new release files were formatted, but the reviewed candidate bytes were preserved. The final scoped publication commit used `HUSKY=0` rather than reformatting the exact-reviewed evidence and invalidating both gates.

## PR, deployment, and browser proof

- PR: `https://github.com/Farhaan96/trends-today/pull/129`
- Labels: `codex`, `codex-automation`
- PR checks: Vercel and Vercel Preview Comments passed.
- Merge method: merge commit; source branch retained.
- Vercel production status: success attached directly to merge SHA `5020679ef8afcbb8653c63b4193b54d89aeb84e8`
- Vercel target: `https://vercel.com/farhaans-projects-088cb374/trends-today/4KQoSL4NcYu2YCZq4NsCFLTdEBka`
- Live URL: `https://www.trendstoday.ca/sports/bc-lions-winnipeg-july-30-watch-guide`
- HTTP: article 200, original image 200, sitemap 200 with canonical present.
- Browser: canonical, headline, body, opponent, date, kickoff, venue, TSN/RDS/CFL+, mismatch disclosure, all source links, reporting method, hero load, and Article JSON-LD passed.
- Diagnostics: zero console errors, zero page exceptions, zero HTTP responses at or above 400, and zero non-analytics request failures. One canceled Google Analytics request was excluded. The browser repeated one non-failing hero-image preload warning.
- Structured data: Article headline and canonical match; author is an Organization; dates are truthful; unavailable word count and keywords are omitted.
- Route limitation: the rendered hero alt is the article headline and `imageAttribution` is not rendered. Do not claim the frontmatter alt description or AI attribution is visible live.
- Proof: `artifacts/editorial/browser-proof/2026-07-29-0630-bc-lions-winnipeg-live.json` and matching full-page PNG.
- Rollback point: revert merge commit `5020679ef8afcbb8653c63b4193b54d89aeb84e8` in a new reviewed PR.

## Metric source, window, freshness, and status

| Metric                                 | Source                            | Window / freshness                 | Status                |
| -------------------------------------- | --------------------------------- | ---------------------------------- | --------------------- |
| Active article inventory               | `/api/analytics`                  | Retrieved 2026-07-29 06:37 Pacific | 167                   |
| July 29 publication count before sweep | `/api/analytics`                  | Retrieved 2026-07-29 06:37 Pacific | 0                     |
| July 29 publication count after run    | Release ledger and merged article | Current run                        | 1 of 6                |
| Protected reporting                    | `/api/analytics/reporting`        | Current run                        | Unavailable, HTTP 401 |
| Vercel Analytics                       | Environment/export                | Current run                        | Unavailable           |
| GA4                                    | Environment/export                | Current run                        | Unavailable           |
| Search Console                         | Environment/export                | Current run                        | Unavailable           |
| Advertising / sponsor / revenue        | Approved sources                  | Current run                        | Unavailable           |
| Cost                                   | Provider usage evidence           | Current run                        | Unavailable           |

## Keep, repair, stop

- Keep: exact candidate hashes, primary-source retrieval records, explicit conflict disclosure, whole-file sensitive-keyword scans, independent exact-SHA reviews, and merge-SHA production verification.
- Repair: narrow or retire the repository-wide Prettier hook so scoped releases do not inherit unrelated formatting debt. Separately repair the category article route to render `imageAlt` and `imageAttribution`, with its own reviewed product change.
- Stop: any future run must fail closed if the opponent conflict changes, a material fact loses support, either exact review is missing or mismatched, checks fail, deployment identity is ambiguous, or the live page cannot be verified.
- Inbox: remains fail-closed. No provider, DNS, secret, signature, idempotency, or live end-to-end activation proof was established, and no advertiser or sponsor message was sent.
