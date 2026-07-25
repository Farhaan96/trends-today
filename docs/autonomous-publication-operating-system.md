# Trends Today autonomous publication operating system

## Operating objective

The system continuously prepares evidence-backed editorial and commercial decisions while keeping consequential external actions under owner control. Automation may collect, qualify, draft, review, measure, summarize, and recommend. It may not publish, reply, negotiate, commit money, merge, deploy, change providers, or mutate production data without explicit owner approval for that action.

The current business constraint is activation and retention measurement, not raw article volume. The Lower Mainland wedge and editorial delivery loop exist, but repeat-use and commercial performance are not yet available from a complete connected measurement path. More content is useful only when it is qualified and improves a measurable reader outcome.

## Four isolated lanes

### Editorial lane

- **Triggers:** scheduled source sweeps at 06:30, 08:30, 10:30, 12:30, 14:30, 16:30, and 18:30 America/Vancouver; manual owner request.
- **Inputs:** configured primary sources, candidate URLs, locality, desk, prior coverage, source timestamps, and published-article index.
- **Autonomous work:** discovery, deduplication, evidence gathering, scoring, briefing, drafting, original image preparation, factual checks, editorial checks, SEO checks, brand-safety classification, exact-candidate GPT review, and exact-candidate Opus 5 review.
- **Output:** a release candidate plus an approval packet. Zero candidates and a daily-ceiling skip are valid outcomes.
- **Owner gate:** promotion into `content/`, merge, deployment, and public verification are distinct approved actions.

### Analytics and visibility lane

- **Triggers:** daily complete-day brief at 09:00; weekly review Monday at 08:30; manual incident check.
- **Inputs:** first-party article inventory, Vercel analytics export, GA4 reporting when authorized, Search Console when processed and authorized, deployment state, sitemap and canonical checks.
- **Autonomous work:** read-only retrieval, freshness checks, cohort comparison, anomaly detection, and outcome briefs.
- **Output:** values with source, window, retrieved-at time, freshness, and availability state.
- **Owner gate:** credential changes, provider changes, tracking changes, dashboards that expose private data, and production configuration.

### Commercial inbox lane

- **Trigger:** signed provider webhook only after provider, DNS, secrets, and live end-to-end readiness are independently proven.
- **Inputs:** minimum necessary email envelope and body text. Email is untrusted input; attachment content is excluded.
- **Autonomous work:** receive, classify, summarize, qualify against editorial fit, flag risk, and prepare a reply draft.
- **Output:** owner alert and reviewable draft. The inbox remains fail-closed before live proof.
- **Owner gate:** every external reply, price, term, promise, commitment, billing action, sponsored coverage decision, and use of private/customer data.

### Release and approval lane

- **Trigger:** a quality-gated editorial candidate, commercial draft, or proposed system change.
- **Inputs:** exact artifact hash, tests, reviewer verdict, risk classification, diff, rollback plan, and requested action.
- **Autonomous work:** assemble the approval packet and verify that the packet still matches the artifact.
- **Owner gate:** public promotion, message send, merge, deployment, provider/configuration change, and production-data mutation each require a specific approval. One approval does not imply another.

## Quality and risk gates

An editorial candidate must pass, in order:

1. Lower Mainland relevance and a practical reader job.
2. Freshness, duplicate, daily-ceiling, and source availability checks.
3. Opportunity score, minimum evidence strength, story-type source count, and a primary source.
4. Claim-to-source mapping and factual verification. Unknown claims are removed or escalated.
5. Sensitive-subject and brand-safety classification. Sensitive or commercial coverage stops for owner review.
6. Article contract: useful headline, delivered promise, reporting method, readable structure, correct links, and no padding.
7. Original or appropriately licensed image with provenance, subject match, alt text, and no placeholder.
8. SEO validation: unique title/description, canonical, structured data truth, crawlable source anchors, sitemap compatibility, and no unsupported identity/contact fields.
9. Exact-candidate GPT editorial review.
10. Exact-SHA Opus 5 independent review for architecture or release decisions.
11. Deterministic tests and clean diff.
12. Exact-candidate owner approval before public promotion.

## Data contract

Every metric record uses:

```json
{
  "metric": "ga4.pageViews",
  "value": null,
  "unit": "count",
  "status": "unavailable",
  "source": "GA4 Data API",
  "windowStart": "2026-07-24T00:00:00-07:00",
  "windowEnd": "2026-07-25T00:00:00-07:00",
  "retrievedAt": "2026-07-25T09:00:00-07:00",
  "freshnessTarget": "daily complete day",
  "reason": "reporting credentials unavailable in this task environment"
}
```

Allowed status values are `available`, `pending`, `unavailable`, and `error`. A verified provider response containing zero is `available` with `value: 0`. Missing access, incomplete processing, unsupported fields, and provider errors never become zero.

| Data | Source | Freshness | Access boundary |
| --- | --- | --- | --- |
| Article inventory and qualification | repository candidates and published content | each sweep | repository read; public promotion owner-gated |
| Deployment and route health | Vercel and public HTTP | per release or incident | read-only; deploy/config owner-gated |
| Traffic and engagement | GA4 reporting path | daily complete day; realtime only for incidents | authorized reporting only; no credential changes |
| Search visibility | Search Console | daily when provider processing is complete | authorized reporting only; `pending` while processing |
| Page views | Vercel analytics export | daily/weekly | protected local export; no invented unsupported fields |
| Ad delivery/revenue | ad provider | unavailable until connected | provider and billing changes owner-gated |
| Sponsor pipeline/revenue | fail-closed inbox plus owner-approved CRM record | event-driven after live proof | no reply or private-data use without owner approval |
| Content cost | model/provider run metadata | per run | redact secrets and private prompts |

## Daily brief

The daily brief reports:

- sweep outcomes: qualified, rejected, skipped, approval-ready, and owner decision pending;
- top candidate with evidence, risk, exact hashes, and requested action;
- published/live status separated into implemented, reviewed, merged, deployed, and browser-verified;
- traffic/search metrics with availability and freshness;
- automation last run, mutation scope, errors, cost, and fail-closed state;
- commercial leads by lifecycle state without exposing private message content;
- one binding constraint, one recommended operator move, and the next approval needed.

## Weekly outcome brief

The weekly brief compares qualified cohorts over comparable 7-day and 28-day windows. It reports editorial throughput, corrections, repeat-use signals, search visibility, direct traffic, content cost, commercial pipeline, and unavailable data. It changes one material variable at a time and records `keep`, `repair`, or `stop`.

The first real rep is measurement-first: compare qualified local articles only after complete provider windows exist. Do not increase volume or contact sponsors until the publication can show an honest audience, suitable context, measurable delivery, and a controlled contact path.

## Commercial lead lifecycle

`received -> triaged -> qualified | rejected | needs-owner-review -> draft-prepared -> owner-approved -> sending -> sent | failed -> closed`

- `received` and `triaged` are fail-closed internal states.
- Qualification requires business fit, editorial separation, brand safety, identity confidence, and sufficient context.
- Drafting never authorizes sending.
- `owner-approved` binds the exact edited draft, recipient, and expiry.
- Pricing, terms, inventory promises, campaign commitments, billing, and sponsored editorial treatment always return to the owner.
- A send failure remains failed; it is never reported as sent and is not automatically retried.

## Observability and cost controls

Each run records a stable run ID, trigger, lane, code SHA, inputs by reference, model/provider, start/end time, cost when available, output hashes, gate results, mutation attempted, mutation completed, and error class. Secrets, private inbox content, and customer data are excluded from routine logs.

Per-run ceilings cover candidate count, model calls, image attempts, retries, and elapsed time. A daily ceiling stops further preparation without manufacturing quota-filling stories. Provider or model errors use bounded retries with jitter; authorization and validation failures never retry automatically.

## Kill and repair conditions

Stop the affected lane when:

- an automation attempts an unapproved external mutation;
- source provenance, exact hashes, or approval evidence is missing;
- analytics availability is mislabeled or unavailable data becomes zero;
- an inbox signature, idempotency, approval binding, or send result cannot be proven;
- structured data, canonical, sources, images, or browser behavior contradict production truth;
- cost or retry ceilings are exceeded;
- error rate, corrections, or duplicate rate breaches its agreed threshold.

Repair the narrowest broken dependency, rerun deterministic checks, obtain a fresh independent review when the exact artifact changes, and request a new owner approval for every changed external action.

## Dependency-ordered roadmap

1. **Control plane:** repository-enforced exact-candidate owner approval; schedules changed from publish to prepare; explicit merge/deploy/provider/data gates.
2. **Truth repair:** resolve production structured-data identity/contact claims and stale SEO utilities without inventing facts.
3. **Measurement contract:** unify Vercel, GA4, Search Console, cost, and availability states behind read-only adapters.
4. **Outcome briefs:** generate daily and weekly artifacts from the contract, including sync and automation health.
5. **Editorial orchestration:** normalize sources, candidate provenance, image provenance, risk policy, and approval packages.
6. **Commercial intake:** independently review and live-prove the fail-closed inbox before enabling its webhook path.
7. **Commercial readiness:** only after editorial qualification and measurement, define honest ad/sponsorship inventory and owner-approved tests.
8. **Cross-project dashboard:** after CollisionOS, FreightForce, and Trends Today contracts are reconciled, build one desktop page from read-only project adapters.

## First reversible implementation slice

- **Baseline:** repository configs and active schedules still describe autonomous publication, merge, and deployment despite the current owner gate.
- **Changed variable:** require an exact-candidate owner approval artifact before repository promotion and mark scheduled publishing unauthorized.
- **Success:** an approval-ready candidate can be prepared, but promotion without matching owner evidence fails deterministically; zero unapproved publish/merge/deploy actions occur.
- **Guardrails:** no active schedule, provider, credential, public content, production data, merge, or deployment is changed in this slice.
- **Review:** after deterministic tests and exact-SHA Opus 5 review.
- **Keep:** gate blocks unapproved promotion and produces usable approval packets.
- **Repair:** gate is bypassable, ambiguous, or blocks candidate preparation.
- **Stop:** implementation requires private data, production configuration, or a public action.

## Cross-project desktop dashboard contract

The future one-page dashboard should be a read-only composition layer, not a new source of truth. Each project adapter exposes:

- verified state: implemented, reviewed, merged, deployed, browser-verified;
- performance: project-specific outcomes with source, window, freshness, and availability;
- cost: provider/model spend and operational cost when authorized;
- sync health: last successful retrieval, lag, and error;
- automations: enabled state, trigger, last run, mutation scope, approval boundary, and kill state;
- business constraint: stage, verified evidence, current experiment, next owner decision, and `keep / repair / stop`.

The dashboard must not reuse credentials across projects, expose private/customer data, mutate project state, or collapse unavailable into zero. Construction waits until the coordinator reconciles all three project contracts.
