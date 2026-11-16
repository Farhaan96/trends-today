# Independent Codex release review

The independent release gate uses an authenticated Codex CLI session with reviewer
`codex` and model `gpt-5.6-sol`. It is separate from the exact-candidate GPT
editorial scorecard; both gates must pass.

## Required identity and provenance

The structured release-review artifact must contain:

- `version: 1`;
- `reviewer: "codex"`;
- `verdict: "NO BLOCKERS"`;
- `candidateSha256`, recomputed from the exact candidate bytes;
- `repositorySha`, equal to the current `git rev-parse HEAD`;
- `modelUsed: "gpt-5.6-sol"`;
- `reviewBackend: "codex-cli-oauth"`;
- a non-empty `reviewRunId` from the Codex session;
- `blockers: []`, `reviewedAt`, and a concise summary.

A machine location is not a review credential. The implementation writer must not
manufacture or relabel a review receipt. Missing authentication, stale hashes,
missing run provenance, another model, or any blocker leaves the candidate blocked.

## Run the gate

After deterministic validation and the GPT editorial gate have passed, commit the
candidate and run:

```bash
python apps/pipeline/codex_review.py \
  artifacts/editorial/release-candidates/<category>/<slug>.mdx
```

The runner invokes `codex exec` in an ephemeral read-only sandbox with a strict JSON
schema. It supplies the candidate path, exact candidate SHA-256, repository SHA, and
candidate text. The reviewer checks factual support and source use, unsupported
claims, title/meta fit, structure, reader usefulness, image/frontmatter integrity,
and reputational or legal risk.

The runner writes the accepted artifact under
`artifacts/editorial/reviews/<category>/`. `promote_candidate` recomputes both
identities and verifies the authenticated backend, run ID, reviewer, model, and
verdict before promotion.

## Stale evidence

Any candidate-byte change requires fresh GPT editorial and Codex release reviews.
Any commit changes the repository SHA and also requires both reviews again. A review
that cannot be bound to the current candidate and repository HEAD must not be used.
