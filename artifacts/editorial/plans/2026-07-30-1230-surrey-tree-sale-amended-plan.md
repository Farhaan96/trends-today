# 2026-07-30 12:30 Surrey tree-sale amended publication plan

## Review reason, governing relationship, and cycle accounting

This plan extends the reconciled 10:30 plan at `artifacts/editorial/plans/2026-07-30-1030-surrey-tree-sale.md`. Every 10:30 constraint and acceptance test remains binding in full unless this plan is stricter.

The unfinished 10:30 lane completed one Opus plan cycle that returned blockers. Its raw runner output is unrecoverable and is recorded honestly at `artifacts/editorial/reviews/plans/2026-07-30-1030-surrey-tree-sale-plan-cycle-1.json`; no blocker text or model observation has been reconstructed. Commit `ea867eafc9f375916d090ec2b252d81c942fbf68` contains the preserved reconciliation diff.

The second and final Opus plan verdict is recorded at `artifacts/editorial/reviews/plans/2026-07-30-1230-surrey-tree-sale-plan-cycle-2-verdict.json` and is bound to `f095aa0c8fe57628239d911a075e5cc39a0ed9f5`. It returned five executable plan blockers. This revision reconciles all five. Per the two-cycle cap and the verdict itself, no third plan review is permitted without Farhaan's explicit approval plus a material scope reset, new evidence, or genuinely new risk.

## Evidence and unknowns

- Current clean issue worktree before this evidence commit: `C:\Users\farha\.codex\worktrees\trends-daily-2026-07-30-1232`, branch `codex/lm-daily-2026-07-30-1232`, Linear `COS-821`, base `e1acf7dc539575d12be7fd746865cf5511ca8a2c`.
- The dirty root must remain byte-unchanged at `8ffbb445c1d9521ba72cd12362bb2994b89df2a1`. The unfinished 10:30 worktree must remain byte-unchanged at `ea867eafc9f375916d090ec2b252d81c942fbf68`, including its untracked generated image.
- No pull, reset, clean, prune, switch, rebase, force-push, branch deletion, broad staging, raw worktree move, or destructive restore is authorized in either preserved worktree.
- Public analytics at 12:39 PDT returned HTTP 200 with 168 active articles and no July 30 publication. Protected reporting returned HTTP 401. Vercel, GA4, Search Console, advertising, sponsor, revenue, and cost data remain unavailable, never zero.
- The 12:30 enabled authoritative-source scan returned 56 opportunities, with zero URL additions, removals, or title changes from 10:30. The reproducible URL/title SHA-256 is `cf90b57803102c8087985b9e92b7e9ab2d006319585b4d2e15fd65980fd90904`, computed by sorting 56 UTF-8 lines lexicographically as `<sourceUrl>\t<title>` and joining them with `\n` and no trailing newline.
- The two Surrey pages returned HTTP 200 at 12:40 PDT. Their dynamic full-page hashes changed, but every fact itemized in both the 10:30 and 12:30 extracts matched.
- The program page's separate two-trees-per-household sentence is newly itemized at 12:30. It was present in the refreshed live page but was not itemized in the 10:30 artifact, so it is not described as verified unchanged against that artifact.
- The dated media release says two trees per sale. The program-page eligibility section says a maximum of two trees per Surrey address based on billing address. The program-page tree-list section says two trees per household. These are three distinct source phrasings, not one reconciled entitlement.
- No published Trends Today story covers the 2026 Surrey municipal tree sale.
- The exact tree-variety inventory may change. Broad categories must be re-captured from the dated release immediately before the candidate evidence commit if the article names them.
- Commercial fit was considered only after qualification. It is an `ad-fit` hypothesis with `sponsorshipStatus: editorial`; every audience and commercial measurement remains unavailable.

## Executable route

1. Preserve and validate the committed 10:30 and 12:30 metrics, queues, exact comparison, source extracts, qualification record, rejection summary, both plan-review artifacts, and this reconciled plan.
2. Treat the valid second-cycle `BLOCKERS` verdict as the final plan review. Verify every blocker below is reconciled by diff and deterministic checks. Do not start a third plan review.
3. Draft one 300-to-600-word bulletin at `artifacts/editorial/release-candidates/local-news/surrey-20-dollar-tree-sale-august-18.mdx`. Use the full frontmatter pattern in `artifacts/editorial/release-candidates/local-news/richmond-election-october-17-voter-dates.mdx`, set `storyType: bulletin`, and include all validator-required local-release fields.
4. Promise and deliver ordering guidance under these pinned H2s: `## When the two sales open`, `## Who can order and how the limit is stated`, `## Where and when to pick up your trees`, and `## Sources`.
5. Include Aug. 18 to Sept. 1 and Sept. 29 to Oct. 13 store windows, both pickup dates, Surrey Operations Centre at 6651 148 Street, checkout pickup-time selection, 3- or 5-gallon pots, 5-to-12-foot height, approximately 1,000 trees per sale, three to five unique highlights, at least three enumerable list items, short paragraphs, and zero authorial em dashes.
6. Carry all three limit phrasings as separate attributed statements: (a) the dated release's two trees per sale; (b) the program-page eligibility section's maximum two trees per Surrey address based on billing address; and (c) the program-page tree-list section's two trees per household. Do not reconcile, sum, average, or infer a four-tree or other combined cross-sale entitlement.
7. State in the program page's wording, with attribution, that items in a cart are not held until payment has been processed. Do not imply cart reservation or claim current availability of any variety.
8. Scan `title`, `subtitle`, `description`, every `highlight`, and the full body against all 23 substrings in `config/local-news-sources.json` `automaticPublishing.manualApprovalKeywords`, including `charged`. Any hit terminally stops the automated lane. `manualApprovalRequired`, `manualApprovalRecorded`, and `commercialApprovalRecorded` must remain `false`; `brandSafety` must remain `standard`; `sponsorshipStatus` must remain `editorial`; and `TRENDS_TODAY_SENSITIVE_APPROVAL_TOKEN` must not be set or supplied. Manual approval must never clear a keyword hit.
9. Generate a new original illustrative hero image in this run. Do not reuse the preserved 10:30 image because its original prompt and generation-model record are unrecoverable. Show generic potted young fruit and ornamental trees arranged for pickup, without City branding, readable labels, identifiable people, fake Surrey location claims, or text. Record the exact prompt, tool/model route as reported, path, attribution, byte hash, and byte/perceptual distinctness evidence. Leave the preserved source image untouched.
10. Re-fetch both City pages immediately before the release evidence commit. Record status, retrieval time, exact capture hash, source tier/publisher/page role, and a fact-level captured-versus-refreshed comparison for every load-bearing fact, including all three limit phrasings, cart holding, price, both sale windows, both pickup dates, address, pickup-time selection, pot sizes, height, approximate inventory, and any named broad variety categories. Stop or repair on any difference.
11. Commit the exact candidate, image, and refreshed evidence; record the candidate SHA-256 and image SHA-256.
12. Run the GPT editorial gate at that exact repository SHA and candidate hash. Require `gpt-5.6-sol`, PASS, all five named scores (`factualSupport`, `quality`, `readability`, `formatting`, `engagement`) present and at least 4, zero prose em dashes, an empty blocker list, and complete schema.
13. Run `C:/Users/farha/.codex/scripts/invoke-claude-review.ps1` in a clean detached worktree at the same exact release SHA with `-PrimaryModel claude-opus-5 -DisableFallback`. Require a non-empty structured `NO BLOCKERS` verdict covering fact support, all three limit statements, cart holding, article contract, image/provenance, SEO/structured data, authorization, and promotion.
14. Repair any candidate blocker and repeat both exact-artifact reviews, with at most two candidate-review cycles for the unchanged artifact scope. Any material plan-scope change stops for Farhaan's explicit approval before another plan review.
15. Promote only the unchanged exact-reviewed candidate while the evidence SHA remains at HEAD. Run the full Python suite, JSON parsing, scoped formatting, typecheck, quiet lint, production build, sensitive scan, release verifiers, and `git diff --check`.
16. Commit only scoped release and audit artifacts, push the issue branch, open a PR, add `codex` and `codex-automation`, require checks, merge without deleting the branch, and wait for the production deployment mapped to the exact merge SHA.
17. Browser-verify `https://www.trendstoday.ca/local-news/surrey-20-dollar-tree-sale-august-18`: exact canonical with no `/posts/` variant, rendered headline/body guidance, all three limit phrasings, cart-hold warning, both City sources, any internal links, date, hero load, truthful Article JSON-LD, sitemap entry, and zero console/page/non-analytics request errors.
18. Record the final audit with exact review artifacts, tests, PR, merge SHA, deployment, browser proof, rollback point, cost when available, metric source/window/freshness/status, and keep/repair/stop rule. Update `COS-821`; mark `COS-815` superseded only after its exact commits and the untouched image path are durably referenced.

## Acceptance tests

- Step 1: All committed JSON parses; the 10:30 and 12:30 queues each contain 56 topics; the canonical URL/title serialization reproduces SHA-256 `cf90b57803102c8087985b9e92b7e9ab2d006319585b4d2e15fd65980fd90904`.
- Step 2: The cycle-one artifact explicitly reports unrecoverable raw output without invented model observations or blocker text; the cycle-two artifact is a structured `BLOCKERS` verdict bound to `f095aa0c8fe57628239d911a075e5cc39a0ed9f5`; this plan contains executable reconciliations for B1 through B5.
- Step 3: Candidate frontmatter matches the referenced local-release pattern, sets `storyType: bulletin`, and satisfies the configured 300-to-600-word range.
- Step 4: All four pinned H2s are present exactly.
- Step 5: Both windows, both pickup dates, address, pickup-time selection, pot sizes, height, approximate inventory, three to five unique highlights, at least three real list items, short paragraphs, and zero prose em dashes are present.
- Step 6: The candidate contains all three source-specific limit phrasings as separate attributed statements; no sentence reconciles or performs arithmetic on them.
- Step 7: The candidate contains the attributed statement that items in a cart are not held until payment has been processed and makes no unsupported availability claim.
- Step 8: Committed evidence shows all five text surfaces scanned against all 23 keywords with zero hits; the four approval/brand fields have the required values; the sensitive-approval token is unset.
- Step 9: A new image exists in this worktree with a committed prompt/provenance record, truthful illustrative attribution, zero text/logos/identifiable people, and byte/perceptual distinction from existing editorial assets. The 10:30 image remains untouched.
- Step 10: Both City URLs return HTTP 200 and the refresh table lists every load-bearing fact with captured value, refreshed value, and `match` or `differ`; any `differ` stops promotion.
- Step 11: The candidate and image hashes in the evidence artifact reproduce from the committed files at the release SHA.
- Step 12: The GPT artifact binds to the exact release SHA and candidate hash, names `gpt-5.6-sol`, contains all five scores at least 4, zero prose em dashes, and no blockers.
- Step 13: The Opus runner artifact binds to the same exact release SHA and candidate hash, records `claude-opus-5` with fallback disabled, and returns `NO BLOCKERS`.
- Step 14: Any repair changes the candidate hash and produces fresh GPT and Opus artifacts; no unchanged-scope candidate exceeds two completed Opus review cycles.
- Step 15: Python tests, all JSON parsing, scoped Prettier, typecheck, quiet lint, production build, sensitive scan, release verifiers, and `git diff --check` all pass; generated files outside scope are not broadly staged.
- Step 16: The PR carries `codex` and `codex-automation`, required checks pass, the branch is retained, and the exact merge SHA maps to a successful production deployment.
- Step 17: Production passes canonical, headline/body, three-limit, cart-hold, source/internal-link, date, image, structured-data, sitemap, HTTP, console, page-error, and non-analytics request checks.
- Step 18: The dated audit and Linear updates separate qualified, implemented, GPT-reviewed, Opus-reviewed, merged, deployed, and browser-verified states and record rollback plus keep/repair/stop.
- Preservation: root `8ffbb445c1d9521ba72cd12362bb2994b89df2a1`, unfinished lane `ea867eafc9f375916d090ec2b252d81c942fbf68`, and every pre-existing worktree remain byte-unchanged.
- Daily ceiling: July 30 remains below six publications before promotion; this sweep publishes at most one candidate.

## Authorization and stop rule

Routine qualified editorial publication, merge, deployment, and live verification are authorized only after every gate above passes. No advertiser or sponsor reply, pricing, terms, guarantees, commitments, billing, provider change, inbox activation, production-data mutation, or private-data use is authorized.

Stop on a changed or conflicting City fact, unsupported eligibility or availability claim, sensitive-keyword hit, approval-token escape hatch, dirty review scope, candidate/repository hash mismatch, missing or malformed GPT/Opus evidence, reviewer model mismatch, failed checks, deployment ambiguity, or unverifiable live state. The rollback is a scoped revert of the eventual merge commit through a new reviewed PR.
