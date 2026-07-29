# 2026-07-29 06:30 BC Lions Winnipeg watch-guide plan

## Reason for independent plan review

The sweep found one fresh candidate that clears the initial editorial threshold. It also found a material-but-bounded official-source discrepancy: the BC Lions where-to-watch page labels the July 30 opponent as Saskatchewan, while the fresh BC Lions podcast, BC Lions schedule, CFL broadcast schedule, and Winnipeg Blue Bombers listing identify Winnipeg. The plan must resolve that conflict without laundering uncertainty into copy.

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
3. If the plan passes, draft one 300-to-600-word sports bulletin at `artifacts/editorial/release-candidates/sports/bc-lions-winnipeg-july-30-watch-guide.mdx`. Match the frontmatter contract of `artifacts/editorial/release-candidates/sports/whitecaps-minnesota-watch-info.mdx`, naming every required local field before drafting: `title`, `subtitle`, `description`, `publishedAt`, `image`, `imageAlt`, `imageAttribution`, `tags`, `category: sports`, `author`, `editor`, `readingTime`, `slug`, `locality`, `storyType: bulletin`, `readerImpact`, `lengthRationale`, three to five unique `highlights`, non-empty `reportingMethod`, `commercialIntent: none` with a non-empty `commercialFitReason`, `brandSafety: standard`, `sponsorshipStatus: editorial`, `commercialApprovalRecorded: false`, `manualApprovalRequired: false`, `manualApprovalRecorded: false`, and `status: release-candidate`. `storyType: bulletin` is required for the 300-to-600-word contract; omitting it defaults a local article to `reported-update` at 550 to 950 words.
4. Give readers the confirmed opponent, venue, Thursday date, 5:30 p.m. Pacific kickoff, TSN/RDS Canadian broadcast, and CFL+ United States/international route. Include three to five highlights, at least three descriptive H2s, two genuinely enumerable lists, and a `## Where to watch in Canada and outside it` section so any location-promise validator is satisfied. Cite all five source URLs as labelled Markdown links in a `## Sources` section. Cite `https://www.bclions.com/wheretowatch/` directly in the discrepancy sentence as the page carrying the mismatched opponent field, while attributing the opponent to the other four sources and the broadcast route to the CFL schedule.
5. Exclude predicted lineups, betting, injury speculation, promotional attendance claims, and any unsupported performance or audience claim.
6. Generate one original editorial image without real logos, text, identifiable players, or a claim that the scene depicts the actual stadium. Record AI provenance and a precise alt description in frontmatter. The current `/[category]/[slug]` route renders the headline as image alt text and does not render `imageAttribution`; that pre-existing site-wide limitation is out of scope for this editorial release and must be recorded rather than falsely claimed as live provenance or alt-text proof.
7. Run frontmatter, article-contract, source, image, SEO, canonical, structured-data, duplicate, brand-safety, and zero-em-dash checks.
8. Immediately before the release evidence commit, re-retrieve the BC Lions where-to-watch page, BC Lions schedule, CFL broadcast schedule, fresh podcast, and host-club listing. Record fresh status, timestamps, and hashes. If the discrepancy has resolved, inverted, or spread, update or stop the candidate before review. Commit the exact candidate, image, and refreshed research evidence as the release evidence SHA.
9. Run the GPT editorial gate at that exact SHA and materialize `artifacts/editorial/reviews/gpt/sports/bc-lions-winnipeg-july-30-watch-guide.<short-candidate-hash>.json`. Require `version: 1`, `reviewer: openai-gpt`, `verdict: PASS`, `modelUsed: gpt-5.6-sol`, non-empty `reviewedAt` and `reviewRunId`, `reviewBackend` in `responses-api` or `codex-cli-oauth`, the exact candidate and repository hashes, exactly five integer scores in the range 4 to 5, zero prose em dashes, and `blockers: []`.
10. Run `C:\Users\farha\.codex\scripts\invoke-claude-review.ps1` in a clean detached worktree at the same release evidence SHA with the full invocation arguments `-Prompt <short path-referencing prompt> -WorkingDirectory <detached worktree> -ExpectedSha <release evidence SHA> -PrimaryModel claude-opus-5 -DisableFallback`. The prompt must reference repository-relative files and let Opus read them; it must not inline candidate or source-extract bodies across the Windows command-line boundary. Require exit code 0, `status: success`, `fallbackUsed: false`, `fallbackDisabled: true`, `reviewedSha` equal to the release evidence SHA, `observedModels` containing `claude-opus-5`, an independently recomputed candidate hash, full source-conflict review, image/provenance review, promotion-contract review, and a non-empty structured `NO BLOCKERS` verdict.
11. Convert the accepted runner result into `artifacts/editorial/reviews/sports/bc-lions-winnipeg-july-30-watch-guide.<short-candidate-hash>.json` with `version: 1`, `reviewer: claude`, `verdict: NO BLOCKERS`, exact `candidateSha256`, non-empty `reviewedAt`, `repositorySha` equal to the release evidence SHA, `modelUsed: claude-opus-5`, observed models, and the non-empty review text.
12. Repair any blocker, create a new evidence SHA, and repeat both exact-artifact reviews. Material scope changes require another plan review.
13. Before promotion, scan the entire candidate file, including frontmatter, for every `manualApprovalKeywords` substring from `config/local-news-sources.json`. Rewrite any accidental non-sensitive hit or stop and escalate; this run may not set `manualApprovalRecorded: true`. Re-fetch `https://www.bclions.com/wheretowatch/`, `https://www.bclions.com/schedule/2026/`, and `https://www.cfl.ca/2026-cfl-broadcast-schedule/` again without changing repository files, and record that observation in the post-promotion learning entry. Stop and fully refresh evidence/reviews if the discrepancy has resolved, inverted, or spread. No commit may land between the release evidence SHA and the promotion command; any commit invalidates both review artifacts and forces a full re-review at the new SHA.
14. Promote only the unchanged exact-reviewed candidate while `HEAD` remains the release evidence SHA with `python -m apps.pipeline.runner promote --release-candidate <candidate> --review-file <claude artifact> --gpt-review-file <gpt artifact>`. Run full Python pipeline tests with `python -m unittest discover apps/pipeline/tests`, em-dash validation, `git diff --check`, `npm ci`, typecheck, quiet lint, and production build.
15. Commit only scoped candidate, review, promoted article, image, research, generated sitemap/robots, and learning evidence. Push the issue branch, open a PR, add `codex` and `codex-automation`, require checks, merge without deleting the branch, and wait for the deployment whose commit matches the merge SHA one-to-one.
16. Browser-verify the canonical URL, headline, body, date, kickoff, opponent, discrepancy disclosure, all source/internal links, image loading, Article JSON-LD truth, sitemap presence, and zero console/page/non-analytics request errors. Record that the frontmatter alt description and AI attribution are not rendered by the current route. Record the merge SHA, matching deployment ID and commit, browser proof, and rollback point in the dated learning entry.

## Acceptance tests

- The root and all pre-existing worktrees are unchanged.
- Every source named in plan prose, the conflict field, and the published reporting method has a matching source entry with URL, retrieval time, HTTP status, and content hash. Corroborator counts agree throughout.
- `validate_release_candidate` reports zero uncited source URLs, and the BC Lions where-to-watch URL appears in the body as a labelled link to the mismatched page.
- If title, subtitle, or reader impact contains `where`, `location`, `locations`, `places`, `centres`, or `centers`, the body contains an H2 matching `where`, `find`, `location`, `locations`, or `places`, and the body contains at least three list items in total.
- A full-file scan against every manual-approval keyword returns zero hits.
- The exact candidate SHA-256 is recorded and matches both GPT and Claude artifacts.
- GPT uses `gpt-5.6-sol` and the complete required schema; Claude uses `claude-opus-5` with fallback disabled and the complete required schema; both artifacts bind to the same candidate hash and release evidence SHA.
- The article does not claim Saskatchewan is the opponent, does not silently omit the official-page discrepancy, and does not publish the expected quarterback start as fact.
- The image contains no team logos, real-player likeness claim, scoreboard text, watermark, or fabricated stadium/location claim.
- Python tests, em-dash validation, diff check, install, typecheck, quiet lint, and production build pass.
- The release evidence SHA stays at HEAD from both reviews through promotion.
- PR checks pass; the exact merge SHA has a successful one-to-one matching deployment.
- Production returns HTTP 200 and passes canonical, content, source-link, date/time, discrepancy, image-load, sitemap, structured-data, and zero-error browser checks. Recorded alt text and AI attribution are not misreported as rendered.

## Authorization boundaries and stop rules

- Routine qualified editorial publication, merge, deployment, and live verification are authorized.
- No advertiser or sponsor reply, price, term, guarantee, commitment, billing action, provider change, inbox activation, production-data mutation, or private-data use is authorized.
- Stop on an unrecorded named source, unresolved or changed source conflict, changed game facts, uncertain material claim, manual-approval keyword hit, candidate/repository hash mismatch, dirty review scope, Windows prompt transport failure, missing or malformed GPT/Opus evidence, failed checks, deployment ambiguity, or unverifiable live state.
- Rollback is a scoped revert of the eventual merge commit or removal of the article, exact review artifacts, image, and generated sitemap entry in a new reviewed PR.
