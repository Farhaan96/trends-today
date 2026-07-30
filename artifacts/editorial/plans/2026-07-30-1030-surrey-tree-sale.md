# 2026-07-30 10:30 Surrey tree-sale publication plan

## Reason for independent plan review

The authoritative source queue produced one fresh, practical municipal purchase bulletin. The implementation is bounded, but it publishes eligibility, ordering, inventory, timing, and pickup instructions. Those claims must survive a plan gate before candidate drafting.

## Evidence and unknowns

- Exact base and current worktree HEAD before the evidence commit: `e1acf7dc539575d12be7fd746865cf5511ca8a2c`.
- Clean issue worktree: `C:\Users\farha\.codex\worktrees\trends-daily-2026-07-30-1034`, branch `codex/lm-daily-2026-07-30-1034`, Linear `COS-815`.
- The dirty root remains preserved at `8ffbb445c1d9521ba72cd12362bb2994b89df2a1`; no pull, reset, clean, prune, switch, rebase, force-push, branch deletion, or broad staging is authorized.
- Public analytics returned HTTP 200 with 168 active articles and zero July 30 publications. Protected reporting returned HTTP 401. Vercel, GA4, Search Console, ad, sponsor, revenue, and cost data remain unavailable, never zero.
- The enabled authoritative-source scan found 56 opportunities. Compared with 08:30, three URLs were added, three removed, and zero titles changed.
- The new July 30 City of Surrey release and the linked City program page agree on an Aug. 18 9 a.m. online opening, Sept. 13 pickup, a later Sept. 29 sale with Oct. 25 pickup, approximately 1,000 trees per sale, a two-tree limit, and a $20 price.
- The program page adds load-bearing eligibility: private Surrey properties, Surrey residents, a Surrey billing name and address, and two trees per Surrey billing address. It also says carts do not hold inventory until payment is processed.
- Raw Surrey HTML contains dynamic bytes. The research artifact records the exact capture digests used for this run, but those whole-page digests may change without a factual edit. The release gate therefore also requires a fresh fact-level comparison immediately before the evidence commit.
- No published Trends Today story covers Surrey's 2026 municipal tree sale.
- The exact August tree list is long and may change. The bulletin may name only broad categories confirmed by the dated release, link to the live City list, and tell readers to confirm their selected variety and mature size on the official page.
- Commercial fit was considered only after qualification. It is a local-retail `ad-fit` hypothesis with `sponsorshipStatus: editorial`; all audience, RPM, sponsor, and revenue measurements remain unavailable.

## Executable route

1. Commit the metrics, 56-item queue, exact source evidence, qualification record, rejection summary, and this plan as a clean evidence checkpoint.
2. Run the approved Opus runner at that exact SHA with `-PrimaryModel claude-opus-5 -DisableFallback`. Require a non-empty structured verdict bound to the exact SHA. Stop on blockers, malformed output, model mismatch, or transport uncertainty.
3. After a plan pass, draft one 300-to-600-word bulletin at `artifacts/editorial/release-candidates/local-news/surrey-20-dollar-tree-sale-august-18.mdx`.
4. Use a precise headline and introduction that promise ordering guidance, then deliver sections for the two sale windows, eligibility/order rules, pickup preparation, and sources. Include three to five unique highlights, at least three descriptive H2s, at least two genuinely enumerable lists, short paragraphs, and zero authorial em dashes.
5. Attribute all eligibility, payment, quantity, sale-window, pickup, pot-size, and inventory-hold claims to the two City pages. Do not imply that adding a tree to a cart reserves it. Do not claim a specific variety remains available.
6. Generate one original editorial hero image showing generic potted young fruit and ornamental trees arranged for a municipal pickup, without City branding, readable labels, people, a fake Surrey location, or text. Record AI provenance and accurate alt text. Treat the image as illustrative, not a photograph of the actual sale.
7. Run duplicate, frontmatter, article-contract, source-link, image, sensitive-keyword, SEO/canonical/structured-data, and zero-em-dash checks.
8. Re-fetch both City pages immediately before the release evidence commit. Record retrieval time, status, exact capture hash, and a fact-level comparison for every load-bearing claim. Stop or repair if price, dates, limit, eligibility, inventory, or pickup details differ.
9. Commit the exact candidate, image, and refreshed evidence. Record the candidate SHA-256.
10. Run the GPT editorial gate against that exact repository SHA and candidate hash. Require `gpt-5.6-sol`, PASS, all five configured scores at least 4, zero prose em dashes, empty blockers, and complete schema.
11. Run the approved Opus runner in a clean detached worktree at the same exact release SHA with `claude-opus-5` and fallback disabled. Require independent fact, contract, image/provenance, SEO/structured-data, authorization, and promotion review plus a structured `NO BLOCKERS` verdict.
12. Repair any blocker, create a new evidence SHA, and repeat both artifact reviews. A material scope change requires a new plan review. Do not exceed two Opus cycles for unchanged scope.
13. Promote only the unchanged exact-reviewed candidate while the release evidence SHA remains at HEAD. Run the full Python pipeline suite, JSON parsing, scoped formatting, typecheck, quiet lint, production build, and `git diff --check`.
14. Commit only scoped release and audit artifacts, push the issue branch, open a PR, add `codex` and `codex-automation`, require checks, merge without deleting the branch, and wait for the deployment that maps to the exact merge SHA.
15. Browser-verify the production canonical, headline, rendered ordering guidance, both City source links, internal links if any, date, image loading, truthful Article JSON-LD, sitemap entry, and zero console/page/non-analytics request errors. Record merge SHA, deployment identity, browser proof, rollback point, cost when available, and the keep/repair/stop rule.

## Acceptance tests

- Root and all pre-existing worktrees remain unchanged.
- Daily count stays below six and this sweep publishes at most one candidate.
- Both City URLs are recorded with retrieval time, HTTP status, exact capture digest, and a fact-level extract.
- Article contains no unsupported availability claim and clearly says inventory is not held until payment is processed.
- Article names the Surrey-resident/private-property and Surrey-billing-address eligibility rules without broadening them.
- Article is 300 to 600 words with at least three H2s, two real lists, three to five unique highlights, short paragraphs, and zero prose em dashes.
- Full-file sensitive-keyword scan is clear; brand safety remains standard and sponsorship remains editorial.
- Image is original, illustrative, non-placeholder, free of readable text/logos/identifiable people, and does not claim to show the actual Surrey sale.
- GPT and Opus artifacts bind to the same exact candidate hash and release evidence SHA; GPT is a complete PASS and Opus is a complete `NO BLOCKERS` verdict using `claude-opus-5` with fallback disabled.
- Full Python tests, scoped formatting, typecheck, quiet lint, build, JSON parsing, and diff checks pass.
- PR checks pass; the exact merge SHA has a successful production deployment.
- Production passes canonical, content, link, date, image, structured-data, sitemap, and zero-error browser checks.

## Authorization and stop boundaries

Routine qualified editorial publication, merge, deployment, and live verification are authorized. No advertiser or sponsor reply, pricing, term, guarantee, commitment, billing, provider change, inbox activation, production-data mutation, or private-data use is authorized.

Stop on a changed or conflicting City fact, unsupported eligibility or availability claim, sensitive-keyword hit, dirty review scope, candidate/repository hash mismatch, missing or malformed GPT/Opus evidence, reviewer model mismatch, failed checks, deployment ambiguity, or unverifiable live state. Rollback is a scoped revert of the eventual merge commit through a new reviewed PR.
