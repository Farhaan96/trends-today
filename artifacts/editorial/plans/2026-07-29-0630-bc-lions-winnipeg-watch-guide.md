# 2026-07-29 06:30 BC Lions Winnipeg watch-guide plan

## Reason for independent plan review

The sweep found one fresh candidate that clears the initial editorial threshold. It also found a material-but-bounded official-source discrepancy: the BC Lions where-to-watch page labels the July 30 opponent as Saskatchewan, while the fresh BC Lions podcast, BC Lions schedule, CFL broadcast schedule, BC Lions media guide, and Winnipeg Blue Bombers listing identify Winnipeg. The plan must resolve that conflict without laundering uncertainty into copy.

## Verified evidence and unknowns

- Remote base and worktree HEAD before evidence commit: `88c480a9ffa4f92013ceade80183cde687603b01`.
- Clean issue worktree: `C:\Users\farha\.codex\worktrees\trends-daily-2026-07-29-0633`, branch `codex/lm-daily-2026-07-29-0633`.
- Dirty root checkout and every existing worktree remain preserved; no pull, reset, clean, prune, switch, rebase, or force-push is authorized.
- Production inventory returned HTTP 200 with 167 active articles and zero July 29 publications. The daily ceiling is 6 and the sweep ceiling is 2.
- Protected reporting returned HTTP 401. Vercel, GA4, Search Console, ad, sponsor, revenue, and cost data are unavailable, not zero.
- The configured primary-source scan found 58 opportunities. Only the July 29 BC Lions podcast URL is new since the July 28 18:30 sweep.
- Four official sources agree on BC at Winnipeg on Thursday, July 30 at 5:30 p.m. Pacific. The CFL broadcast schedule lists TSN and RDS in Canada and CFL+ outside Canada. The host club lists Princess Auto Stadium.
- One BC Lions where-to-watch page agrees on date, time, and broadcast route but says Saskatchewan. That opponent field is treated as erroneous, disclosed in the reporting method, and not used as opponent evidence.
- The podcast describes a Kaidon Salter start as expected and lineup news as possible. No lineup claim will be published without later official confirmation.
- No published Trends Today BC Lions guide exists.
- Commercial fit was considered only after qualification and remains `none`; sponsorship status remains `editorial`.

## Proposed executable route

1. Commit the metrics, 58-item source queue, source extracts, qualification, rejection summary, and this plan as a clean evidence checkpoint.
2. Run the required Opus 5 plan review against that exact clean SHA with fallback disabled. Stop on a missing, malformed, blocking, or SHA-mismatched verdict.
3. If the plan passes, draft one 300-to-600-word sports bulletin at `artifacts/editorial/release-candidates/sports/bc-lions-winnipeg-july-30-watch-guide.mdx`.
4. Give readers the confirmed opponent, venue, Thursday date, 5:30 p.m. Pacific kickoff, TSN/RDS Canadian broadcast, and CFL+ outside-Canada route. Include three to five highlights, at least three descriptive H2s, two genuinely enumerable lists, source links, and a reporting-method note that names the opponent discrepancy.
5. Exclude predicted lineups, betting, injury speculation, promotional attendance claims, and any unsupported performance or audience claim.
6. Generate one original editorial image without real logos, text, identifiable players, or a claim that the scene depicts the actual stadium. Record AI provenance and a precise alt description.
7. Run frontmatter, article-contract, source, image, SEO, canonical, structured-data, duplicate, brand-safety, and zero-em-dash checks.
8. Commit the exact candidate, image, and research evidence as the release evidence SHA. Run the GPT editorial gate at that exact SHA. Require `gpt-5.6-sol`, all five scores at least 4, zero prose em dashes, empty blockers, and exact candidate/repository hashes.
9. Run `C:\Users\farha\.codex\scripts\invoke-claude-review.ps1` in a clean detached worktree at the same release evidence SHA with `-PrimaryModel claude-opus-5 -DisableFallback`. Require an independently recomputed candidate hash, full source-conflict review, image/provenance review, promotion-contract review, and a non-empty structured `NO BLOCKERS` verdict.
10. Repair any blocker, create a new evidence SHA, and repeat both exact-artifact reviews. Material scope changes require another plan review.
11. Promote only the unchanged exact-reviewed candidate with the repository promotion command. Run full Python pipeline tests, em-dash validation, `git diff --check`, `npm ci`, typecheck, quiet lint, and production build.
12. Commit only scoped candidate, review, promoted article, image, research, generated sitemap/robots, and learning evidence. Push the issue branch, open a PR, add `codex` and `codex-automation`, require checks, merge without deleting the branch, and wait for the matching deployment.
13. Browser-verify the canonical URL, headline, body, date, kickoff, opponent, source/internal links, image, Article JSON-LD truth, and zero console/page/non-analytics request errors. Record the merge SHA, deployment, browser proof, and rollback point in the dated learning entry.

## Acceptance tests

- The root and all pre-existing worktrees are unchanged.
- Source artifacts preserve all five URLs, retrieval times, HTTP status, content hashes, the opponent discrepancy, and the excluded uncertain lineup claim.
- The exact candidate SHA-256 is recorded and matches both GPT and Claude artifacts.
- GPT uses `gpt-5.6-sol`; Claude uses `claude-opus-5` with fallback disabled; both artifacts bind to the same release evidence SHA.
- The article does not claim Saskatchewan is the opponent, does not silently omit the official-page discrepancy, and does not publish the expected quarterback start as fact.
- The image contains no team logos, real-player likeness claim, scoreboard text, watermark, or fabricated stadium/location claim.
- Python tests, em-dash validation, diff check, install, typecheck, quiet lint, and production build pass.
- PR checks pass; the exact merge SHA has a successful matching deployment.
- Production returns HTTP 200 and passes canonical, content, source-link, date/time, image, structured-data, and zero-error browser checks.

## Authorization boundaries and stop rules

- Routine qualified editorial publication, merge, deployment, and live verification are authorized.
- No advertiser or sponsor reply, price, term, guarantee, commitment, billing action, provider change, inbox activation, production-data mutation, or private-data use is authorized.
- Stop on unresolved source conflict, changed game facts, uncertain material claim, candidate/repository hash mismatch, dirty review scope, missing or malformed GPT/Opus evidence, failed checks, deployment ambiguity, or unverifiable live state.
- Rollback is a scoped revert of the eventual merge commit or removal of the article, exact review artifacts, image, and generated sitemap entry in a new reviewed PR.
