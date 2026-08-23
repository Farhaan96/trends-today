# Trends operator daily runbook

The named local Trends operator runs this loop once per working day. It replaces
open-ended "check on the site" sessions with one deterministic contract.

The operator is an editor, not a scheduler. Automation researches and measures.
The operator emits exactly one action per day.

## Inputs

Both inputs are read-only artifacts. Neither is a commit.

| Input                     | Where it comes from                                                           | What it proves                                                                                               |
| ------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Research queue            | `Daily Content Opportunity Research` artifact `trends-today-research-queue`   | candidate topics that still need evidence. It proves nothing about publication.                              |
| Publishing health receipt | `Publishing Health Receipt` artifact `trends-today-publishing-health-receipt` | live article count, newest live article, measurement availability, draft state, and one bounded disposition. |

### When the receipt is built

`Publishing Health Receipt` has no schedule of its own. It runs once after each
completed `Daily Content Opportunity Research` run, plus manual dispatch. The
research workflow carries the single daily timer, so there is exactly one
receipt per research run and no second fixed-UTC schedule to drift against
America/Vancouver when daylight saving changes.

The receipt is built whether that research run succeeded or failed. A research
run that concluded anything other than `success` is recorded as the source
conclusion and becomes a `research-workflow` repair check. A missing conclusion
is recorded as `unknown` and also resolves to `repair`, never to success.

Build the receipt locally at any time:

```bash
python apps/pipeline/publishing_health.py \
  --output reports/editorial/publishing-health-receipt.json \
  --markdown-output reports/editorial/publishing-health-receipt.md
```

`ANALYTICS_REPORTING_TOKEN` is optional. When it is absent the receipt still
succeeds and records protected reporting as `unavailable`. It never records a
missing metric as zero.

## The single daily action

Read `disposition.action` in the receipt. It is always exactly one of three
values, and the operator performs only that one.

### 1. `repair`

The receipt found a failed check. Repair the narrowest failed check named in
`disposition.failedChecks[0]`, then rebuild the receipt. Do not start a new
story on a repair day.

- `publication-freshness`: the live site has not published inside the freshness
  window. Repair the blocked candidate that should already have shipped.
- `stale-drafts`: refresh or retire the listed **article drafts** through their
  existing pull request and Linear issue. Never open a replacement branch or a
  second pull request for the same story. Only article drafts appear here; see
  [Which pull requests are article drafts](#which-pull-requests-are-article-drafts).
- `research-workflow`: the research workflow last concluded something other than
  success. Fix the workflow, not the content.
- `analytics-provider-error`: a provider rejected the request. Fix credentials
  or configuration. Never substitute an estimate for the missing values.
- `candidate-eligibility`: review evidence was supplied but does not bind to the
  exact candidate file on disk or to the current repository HEAD. Repair the
  candidate and obtain fresh GPT and Claude reviews at the current SHA.

### 2. `qualify`

`qualify` appears only when the operator supplied a candidate evidence file and
every check passed. It is never inferred from the research queue, and a
successful research run is never publication proof.

Qualify means: take the one named candidate at `disposition.candidatePath`
through the existing release gates. It does not mean "publish".

### 3. `skip`

No eligible reviewed candidate exists. Record the reason in the day's learning
note and stop. Zero articles is a correct outcome. Do not manufacture a story to
fill the day.

## One of everything

- one owner per day;
- one candidate;
- one branch;
- one pull request;
- one learning note.

Do not open a timestamped issue per sweep. The receipt artifact is the run
record. A stale draft is refreshed or retired in place; it is never duplicated
into a fresh branch.

## Which pull requests are article drafts

The receipt reads every open pull request, but only an **article draft** can
raise a `stale-drafts` repair. The canonical convention is both of:

- `isDraft` is true; and
- `headRefName` begins `draft/` (for example `draft/cos-901-surrey-tree-sale`).

A missing head ref falls back to a title beginning `Draft COS-`. That fallback
exists only for metadata gaps and is not the convention to author against.

Everything else is counted and never gates an article: ordinary open pull
requests, growth-review evidence branches, infrastructure and workflow changes,
monitored-inbox branches, and any other non-article draft. An open
infrastructure pull request left idle for a month does not force an editorial
repair day.

Read this in the receipt as:

- `drafts.openCount`: every open pull request, for observability;
- `drafts.articleDraftCount` and `drafts.articleDrafts`: the subset that the
  stale and relevance-expiry rules apply to;
- `drafts.stale` and `drafts.relevanceExpired`: article drafts only;
- `drafts.pullRequests[].articleDraft`: the per-pull-request classification.

Name a new editorial branch `draft/<issue>-<slug>` so its draft pull request is
classified correctly.

## Gates the operator may not skip

The receipt reports state. It does not grant permission. Publication still
requires, in this order and unchanged:

1. deterministic validation (`apps/pipeline/validation.py`);
2. an exact-candidate GPT editorial review, every score at least 4 of 5, zero
   blockers, zero prose em dashes (`apps/pipeline/gpt_review.py`);
3. an exact-candidate Claude release review returning `NO BLOCKERS` on
   `claude-opus-5`, bound to the same SHA-256 and repository SHA
   (`apps/pipeline/claude_review.py`);
4. promotion through `promote_candidate`, which re-verifies both reviews;
5. clean checks, merge, deployment, and live browser verification.

The receipt's `candidate` block only reports whether the operator's supplied
evidence is complete and self-consistent. It never creates, signs, or stands in
for a review.

## Candidate evidence file

Supply this only when reviews already exist. The receipt does not take the
digest on trust. It resolves `candidatePath` inside
`artifacts/editorial/release-candidates/<category>/<slug>.mdx`, requires an
existing regular file there, recomputes the SHA-256 from the exact bytes on
disk, and requires the declared digest and both review digests to equal that
recomputed value. A path outside that root, a missing file, or a single changed
byte makes the candidate ineligible.

Both reviews must also carry `repositorySha`, and both must equal the current
repository HEAD. If HEAD cannot be read, the candidate is ineligible; an
unverifiable repository state never qualifies.

```json
{
  "candidatePath": "artifacts/editorial/release-candidates/local-news/<slug>.mdx",
  "candidateSha256": "<64 hex characters, equal to sha256 of the file>",
  "validation": { "passed": true, "errors": [] },
  "gptReview": {
    "verdict": "PASS",
    "candidateSha256": "<same digest>",
    "repositorySha": "<current git rev-parse HEAD>",
    "scores": {
      "factualSupport": 5,
      "quality": 4,
      "readability": 4,
      "formatting": 5,
      "engagement": 4
    },
    "blockers": [],
    "proseEmDashCount": 0
  },
  "claudeReview": {
    "verdict": "NO BLOCKERS",
    "candidateSha256": "<same digest>",
    "repositorySha": "<same HEAD>",
    "modelUsed": "claude-opus-5"
  }
}
```

Because both reviews bind to HEAD, any new commit invalidates the evidence.
Repair the candidate and obtain fresh GPT and Claude reviews at the new SHA.

## Reading the measurement block

- `analytics.providers.*.status` is `available`, `partial`, `unavailable`, or
  `error`. A verified provider response of zero is `available` with value `0`.
  Missing access is `unavailable` with `totals: null`.
- `articleDecisions.day7` and `articleDecisions.day28` carry per-article
  `keep`, `repair`, or `stop` decisions when the protected reporting snapshot
  exposes that window. When it does not, the window states an explicit
  `unavailable` reason and an empty article list.
- Each window is judged under its own maturity, reported as `maturityDays` and
  `period`. The day-7 window matures at 7 days and says so in every reason; the
  day-28 window matures at 28. A seven-day row is never given a `keep` or a
  `stop` under 28-day semantics, and an article younger than its window's
  maturity is `observe`, not a verdict.
- Page-level click-through rate is carried through from Search Console when the
  provider reports it. When it is not reported and cannot be derived from clicks
  and impressions, it stays `null`, never `0`.
- An article absent from a reported window has `null` metrics, not zero, and
  resolves to `repair-measurement`.

## Remaining activation step

The receipt's protected reporting path is implemented and tested but is not yet
live in GitHub Actions. The repository currently has no Actions secrets, so
`ANALYTICS_REPORTING_TOKEN` resolves to an empty string and both the daily
receipt and the weekly scorecard correctly report protected reporting as
unavailable.

The one owner-gated action that activates article-level day-7 and day-28
decisions:

> Add `ANALYTICS_REPORTING_TOKEN` as a GitHub Actions repository secret with the
> same value already configured in Vercel production.

No other change is required. Google Analytics and Search Console service
account credentials stay in Vercel; the workflow reads them only through the
protected endpoint. Until that secret exists, this system is honest and useful
at the reliability layer and explicitly unavailable at the traffic layer.
