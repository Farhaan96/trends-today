# 2026-07-28 18:30 Richmond election release takeover plan

## Reason for independent plan review

This run found that the 16:30 automation prepared a qualified Richmond election candidate but did not push a branch, open a PR, merge, deploy, or write a learning closeout. Its worktree is now dirty and must remain untouched. The 18:30 run needs a preservation-safe route that does not race or overwrite that state.

## Verified evidence

- Current remote base: `origin/main` at `7a31841172e1e99ac2d93d0274051e1697909a99`.
- Current run worktree: `C:\Users\farha\.codex\worktrees\trends-daily-2026-07-28-1832`, branch `codex/lm-daily-2026-07-28-1832`, created cleanly from that exact remote SHA.
- Root checkout remains dirty, 284 commits behind, and untouched except for a fetch without pruning.
- Public production analytics retrieved at `2026-07-28T18:35:48.1483612-07:00`: HTTP 200, 166 total articles, two July 28 publications, so the daily ceiling is not reached.
- Protected reporting returned HTTP 401. Vercel, GA4, Search Console, ad, sponsor, revenue, and cost metrics are unavailable, not zero.
- The 18:30 official-source scan found 58 opportunities. The queue is materially unchanged from 16:30.
- The 16:30 candidate commit is `676e81e5fef260b338c5ffbf0a44cb3c22ff5a4e`. Its SHA-256 `bf4991b89c7a524c17073338ed28c6e5fe05850a4e360a82cf31252f20e733f1` is historical only because the takeover must change `publishedAt` from the abandoned 16:30 sweep to `2026-07-28T18:45:00-07:00`.
- The candidate uses two City of Richmond primary sources:
  - `https://www.richmond.ca/city-hall/news/2026/rmdelection28jul2026.htm`
  - `https://www.richmond.ca/city-hall/elections.htm`
- The 16:30 candidate has a GPT PASS and an Opus 5 `NO BLOCKERS` result, but those uncommitted review artifacts remain owned by the dirty 16:30 worktree and will not be reused as release authority.
- There is no remote branch or GitHub PR for `codex/lm-daily-2026-07-28-1631`.
- No Claude/review process remains active for the 16:30 worktree.

## Proposed executable route

1. Import the committed 16:30 evidence commit into the clean 18:30 branch, then remove the four imported `artifacts/editorial/reviews/gpt/**` files so stale 16:30 PASS artifacts cannot become ambiguous release evidence. Do not mutate the 16:30 worktree.
2. Change only the candidate `publishedAt` to `2026-07-28T18:45:00-07:00`; recompute and record the new candidate SHA-256. Re-verify both source URLs, factual extracts, image provenance, duplicate status, current production inventory, and daily ceiling.
3. Use the already committed 58-topic `artifacts/editorial/research/2026-07-28-1830-source-queue.json` as the current sweep queue. Write a dated `2026-07-28-1830-qualified-candidates.json` and `2026-07-28-1830-rejection-summary.json`. Both must name run ID `run-trends-today-daily-publisher-2026-07-28-1830`; the rejection summary must link the exact queue path and record `sourceCandidates: 58`, `qualifiedForCandidateStaging: 1`, `rejectedOrHeld: 57`, `dailyCountBeforeSweep: 2`, and `dailyCeiling: 6`.
4. Commit the imported and repaired evidence. Record that commit as `EVIDENCE_SHA`.
5. Run the fresh GPT editorial gate in the 18:30 worktree at `EVIDENCE_SHA` and leave its artifact uncommitted. Use at most two attempts; stop fail-closed on repeated absent-candidate, malformed, unavailable, mismatched, or blocking output.
6. Copy the accepted uncommitted GPT artifact to a recoverable absolute path outside every worktree and compute its SHA-256. Add a new detached review worktree at `EVIDENCE_SHA` and keep it byte-clean. Build the Opus prompt as a saved, quote-free text artifact outside every worktree: include the external GPT path, its SHA-256, and a complete flattened `key: value` rendering of every GPT field with no JSON punctuation or double-quote characters. Assert the prompt is shorter than 30,000 characters and does not end in a backslash. Before the real review, create two probe files outside every worktree: a native Node argv dumper that writes `process.argv.slice(2)` as JSON and emits a valid runner envelope, and a PowerShell shim structurally matching the installed npm `claude.ps1` by invoking that native dumper with `$args`. Run the repository review runner with this shim via `-ClaudeCommand` at full production prompt size. Assert from the native dumper output that the prompt is exactly one element after `-p`, the total argv count is eleven, and the UTF-8 SHA-256 of that element equals the saved prompt file's raw UTF-8 SHA-256. Reassert the detached worktree is clean after the probe. Stop on absent/split/mismatched output. Then run `C:\Users\farha\.codex\scripts\invoke-claude-review.ps1` in the detached worktree with `-ExpectedSha EVIDENCE_SHA -PrimaryModel claude-opus-5 -DisableFallback`. The prompt must require independent candidate/source/image review, exact candidate hash, exact repository SHA, and explicit reconciliation with the GPT artifact SHA-256 and `gpt-5.6-sol`. No GPT file, Opus file, build output, probe file, or other mutation may land in the detached worktree before or during either runner call.
7. After the runner exits 0 with `status: success` and both its pre/post clean-scope checks pass, materialize the exact Claude release artifact in the 18:30 worktree from the runner stdout envelope. It must use the repository release-review schema (`version: 1`, `reviewer: claude`, `verdict: NO BLOCKERS`, exact candidate SHA-256, `repositorySha: EVIDENCE_SHA`, `modelUsed: claude-opus-5`, observed models, reviewed timestamp, and non-empty review). Also copy the external accepted GPT artifact into its canonical repository review path. Do not write either artifact into the detached worktree.
8. If either review finds a content blocker, repair the candidate, create a new evidence commit/hash, and repeat both gates. Material scope changes require another plan amendment review.
9. Promote only the exact reviewed candidate while `HEAD == EVIDENCE_SHA`, then run full Python pipeline tests, em-dash validation, `git diff --check`, `npm ci`, typecheck, quiet lint, and production build. Treat only the candidate, exact review artifacts, promoted article, image, qualification evidence, and generated sitemap/robots changes as in scope.
10. Commit the promoted article and both exact-candidate review artifacts together.
11. Push the branch, open a PR, add `codex` and `codex-automation` labels, wait for required checks, merge without deleting the branch, wait for the matching production deployment, and verify the live canonical page in a browser.
12. Verify HTTP 200, canonical, rendered headline/body, source/internal links, dates including JSON-LD `datePublished: 2026-07-28T18:45:00-07:00`, image load, Article structured-data truth, and zero console/page/non-analytics request errors.
13. Record the 14:30, 16:30, and 18:30 attempt history, learning entry, rollback point, release evidence, and final state. If the learning entry requires a post-merge closeout PR, use a new clean worktree from the new `origin/main`.

## Acceptance tests

- No mutation in the root or 16:30 worktree.
- The repaired candidate has `publishedAt: "2026-07-28T18:45:00-07:00"` and a recorded SHA-256 different from `bf4991b89c7a524c17073338ed28c6e5fe05850a4e360a82cf31252f20e733f1`.
- Dated 18:30 qualification and rejection records name the committed `2026-07-28-1830-source-queue.json` and record 58 source candidates, one qualified candidate, 57 rejected/held, daily count two, and daily ceiling six.
- Immediately before promotion, both review artifacts are non-empty and structured; both repository SHAs equal `EVIDENCE_SHA == HEAD`; both candidate hashes match the repaired candidate; GPT uses `gpt-5.6-sol`; Opus uses `claude-opus-5` with fallback disabled.
- The detached Opus worktree has an empty `git status --porcelain` both immediately before and after the runner; no review artifact exists inside it.
- The saved Opus prompt contains no double-quote character, is shorter than 30,000 characters, and does not end in a backslash. The two-hop PowerShell-to-native argv probe exits 0 with `status: success`; its native dump contains eleven arguments and proves the prompt arrives byte-identically as one `-p` value by matching UTF-8 SHA-256. The accepted Opus review text literally attests the independently recomputed repaired candidate SHA-256, the external GPT artifact SHA-256 as a transport receipt, and `gpt-5.6-sol`.
- Full Python tests, em-dash validation, `git diff --check`, `npm ci`, typecheck, quiet lint, and production build pass.
- PR checks pass; merge SHA and matching deployment are recorded.
- Production browser proof passes every canonical/content/link/date/image/structured-data/error assertion.
- A rollback commit is identifiable.

## Unknowns and stop rules

- The exact reason the 16:30 automation stopped after review is unknown. This plan avoids relying on its mutable state.
- Analytics credentials remain unavailable.
- Until the imported evidence has been pushed, do not run worktree prune, branch deletion, fetch with pruning, or garbage collection that could remove the sole 16:30 local commit.
- Stop before publication on changed source facts, source conflict, sensitive or partisan material, dirty-scope ambiguity, review mismatch, failed checks, deployment ambiguity, or unverifiable live state.
- Routine qualified editorial publication, merge, and deployment are authorized. No advertiser/sponsor reply, price, commercial term, provider change, production-data mutation, or inbox activation is authorized.
