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
- The 16:30 candidate commit is `676e81e5fef260b338c5ffbf0a44cb3c22ff5a4e`, with candidate SHA-256 `bf4991b89c7a524c17073338ed28c6e5fe05850a4e360a82cf31252f20e733f1`.
- The candidate uses two City of Richmond primary sources:
  - `https://www.richmond.ca/city-hall/news/2026/rmdelection28jul2026.htm`
  - `https://www.richmond.ca/city-hall/elections.htm`
- The 16:30 candidate has a GPT PASS and an Opus 5 `NO BLOCKERS` result, but those uncommitted review artifacts remain owned by the dirty 16:30 worktree and will not be reused as release authority.
- There is no remote branch or GitHub PR for `codex/lm-daily-2026-07-28-1631`.
- No Claude/review process remains active for the 16:30 worktree.

## Proposed executable route

1. Import only the committed 16:30 evidence commit into the clean 18:30 branch. Do not read from or mutate the 16:30 worktree during mutation.
2. Re-verify source URLs, candidate bytes/hash, image provenance, duplicate status, current production inventory, and daily ceiling.
3. Treat the 16:30 GPT and Opus outputs as historical evidence only. Run a fresh GPT editorial gate bound to the candidate SHA and current repository SHA.
4. Commit the fresh GPT artifact, then run `C:\Users\farha\.codex\scripts\invoke-claude-review.ps1` with `-PrimaryModel claude-opus-5 -DisableFallback` against the exact clean SHA.
5. If either review finds a blocker, repair the candidate in this worktree, create a new hash, and repeat both reviews. Stop on malformed, unavailable, mismatched, or incomplete review output.
6. Run full Python pipeline tests, em-dash validation, `git diff --check`, `npm ci`, typecheck, quiet lint, and production build.
7. Promote only the exact reviewed candidate through the repository promotion command. Commit the promoted article and exact review artifact on the 18:30 branch.
8. Push the branch, open a PR, add `codex` and `codex-automation` labels, wait for required checks, merge without deleting the branch, wait for the matching production deployment, and verify the live canonical page in a browser.
9. Verify HTTP 200, canonical, rendered headline/body, source/internal links, dates, image load, Article structured-data truth, and zero console/page/non-analytics request errors.
10. Record the 18:30 learning entry, rollback point, release evidence, and final state. If the learning entry requires a post-merge closeout PR, use a new clean worktree from the new `origin/main`.

## Acceptance tests

- No mutation in the root or 16:30 worktree.
- Candidate SHA-256 is recorded and matches both fresh GPT and Opus artifacts.
- Both reviews are non-empty, structured, exact-SHA, and use `gpt-5.6-sol` plus `claude-opus-5` with fallback disabled.
- All deterministic checks pass.
- PR checks pass; merge SHA and matching deployment are recorded.
- Production browser proof passes every canonical/content/link/date/image/structured-data/error assertion.
- A rollback commit is identifiable.

## Unknowns and stop rules

- The exact reason the 16:30 automation stopped after review is unknown. This plan avoids relying on its mutable state.
- Analytics credentials remain unavailable.
- Stop before publication on changed source facts, source conflict, sensitive or partisan material, dirty-scope ambiguity, review mismatch, failed checks, deployment ambiguity, or unverifiable live state.
- Routine qualified editorial publication, merge, and deployment are authorized. No advertiser/sponsor reply, price, commercial term, provider change, production-data mutation, or inbox activation is authorized.
