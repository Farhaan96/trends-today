# Weekly growth review - 2026-07-27

## Run identity

- Run ID: `run-trends-today-weekly-growth-review-2026-07-27`.
- Automation ID: `run-trends-today-weekly-growth-review`.
- Trigger: recurring weekly growth review, Monday 08:30 America/Vancouver.
- Current run time recorded: `2026-07-27T08:43:00-07:00`.
- Root checkout: `C:\Users\farha\Projects\Trends Today`; branch `main`; HEAD `8ffbb445c1d9521ba72cd12362bb2994b89df2a1`; dirty and untracked editorial artifacts were inventoried and preserved. The root was not cleaned or reset. One accidental audit entry was created there before scope correction and preserved at `artifacts/editorial/learning/2026-07-27-weekly-growth-review.md`.
- Review worktree: `C:\Users\farha\.codex\worktrees\trends-weekly-growth-2026-07-27`.
- Review branch: `codex/weekly-growth-review-2026-07-27`.
- Base and rollback SHA: `9da4bcb697447f0d714f2053a16633e10a90317a`.
- Required operating files read: prompt-provided AGENTS instructions because no repo `AGENTS.md` exists; `CLAUDE.md`; `docs/autonomous-publication-operating-system.md`; `docs/content-business-operating-system.md`; `config/content-business.json`; `config/daily-operator.json`; all current Trends Today automation TOMLs found under `C:\Users\farha\.codex\automations`; and dated learning entries from the prior weekly review through `artifacts/editorial/learning/2026-07-27-0630-surrey-sounds-line-dancing.md`.
- Skills loaded: autonomous work safety, Hormozi business operator with content/distribution and constraint lenses, GitHub, and Playwright/browser verification.

## Verified facts

- Canonical `origin/main` is `9da4bcb697447f0d714f2053a16633e10a90317a`, audit-only closeout for the 06:30 Surrey Sounds publication.
- Production deployment `5623976144` for SHA `9da4bcb697447f0d714f2053a16633e10a90317a` has status `success`, target `https://trends-today-c98v0hu2v-farhaans-projects-088cb374.vercel.app`.
- Production `/api/analytics?codex=weekly-20260727` returned HTTP 200 at `2026-07-27T15:37:17.442Z` with `totalArticles: 160`; current category inventory is local-news 10, transit 7, things-to-do 14, food-drink 1, housing 2, sports 2, science 30, culture 12, psychology 21, technology 25, health 22, space 14.
- Live article check for `https://www.trendstoday.ca/things-to-do/surrey-sounds-summer-line-dancing` returned HTTP 200 with H1 `Free Surrey line-dancing concert runs Wednesday`, matching canonical, July 29 facts, `13450 104 Avenue`, City of Surrey source link, Article JSON-LD, and hero-image markup.
- Playwright screenshot proof was captured at `artifacts/editorial/browser/2026-07-27-weekly-surrey-sounds.png`; the rendered first viewport showed the expected H1, article metadata, active Things to Do nav, and loaded hero image.
- `/ads.txt?codex=weekly-20260727` returned HTTP 404, so ad-system readiness is incomplete.
- Protected `/api/analytics/reporting?codex=weekly-20260727` returned HTTP 401 because no bearer token was present in this run. Process environment also lacked `ANALYTICS_REPORTING_TOKEN`, `TRENDS_ANALYTICS_REPORTING_TOKEN`, `GOOGLE_ANALYTICS_PROPERTY_ID`, `GOOGLE_SEARCH_CONSOLE_SITE_URL`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, and `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`.
- The public analytics endpoint reports GA4 and Search Console as configured in production, but this run could not retrieve provider GA4 or Search Console reports. Configured instrumentation is not verified retrieval.

## Hypotheses

- The Lower Mainland wedge is producing enough qualified public pages to test a habit loop, but Vercel pageviews alone cannot prove repeat use, organic search quality, advertiser value, or cash.
- Thin one-primary-source event bulletins remain a quality risk when they lack a distinct reader decision. Recent GPT-blocked skips show the gate is catching that risk.
- Local business-change discovery in draft PR #94 may improve beat diversity, but it is unmerged, behind current main, not deployed, and not measured.

## Editorial funnel

- Weekly baseline from `2026-07-20-weekly-growth-review.md`: production had 133 active articles and 9 local articles across active Lower Mainland categories.
- Current production inventory: 160 active articles and 36 local-category articles, an increase of 27 active articles and 27 local-category articles during the week.
- Successful live-verified editorial releases in the learning ledger included transit, housing, local-news, sports, and things-to-do bulletins and updates, including the July 27 Surrey Sounds publication.
- Correct fail-closed outcomes included daily-ceiling skips, zero-qualified-candidate skips, GPT-blocked Whitecaps, Park Play, Port Coquitlam, and Surrey fence-art candidates, plus the July 26 Surrey Sounds Opus timeout before the July 27 repaired release.
- Implemented, reviewed, merged, deployed, browser-verified state for current canonical release: Surrey Sounds is implemented, GPT-reviewed, Opus-reviewed, merged in PR #106, deployed, and browser-verified. This weekly audit entry is evidence-only in draft PR #108, with Vercel and Vercel Preview Comments checks successful. It is not merged or deployed to production.

## Metrics

All windows are complete America/Vancouver local-day windows. A verified provider zero may be zero; missing access, unsupported fields, and processing lag remain unavailable.

| Metric | Source | Window | Retrieved at | Freshness | Status | Value |
| --- | --- | --- | --- | --- | --- | --- |
| Article pageviews | Vercel Web Analytics `visits/aggregate` via DPAPI wrapper | `2026-07-20T07:00:00Z` to `2026-07-27T07:00:00Z` | `2026-07-27T15:36:42.146428Z` | complete 7 local days | available | 391 pageviews, 160 joined articles, 85 measured articles, 0 errors |
| Local-category pageviews | Derived from the same Vercel export | `2026-07-20T07:00:00Z` to `2026-07-27T07:00:00Z` | `2026-07-27T15:36:42.146428Z` | complete 7 local days | available | 169 pageviews, 36 local articles, 35 measured local articles |
| Article pageviews | Vercel Web Analytics `visits/aggregate` via DPAPI wrapper | `2026-06-29T07:00:00Z` to `2026-07-27T07:00:00Z` | `2026-07-27T15:36:55.528597Z` | complete 28 local days | available | 926 pageviews, 160 joined articles, 151 measured articles, 0 errors |
| Local-category pageviews | Derived from the same Vercel export | `2026-06-29T07:00:00Z` to `2026-07-27T07:00:00Z` | `2026-07-27T15:36:55.528597Z` | complete 28 local days | available | 190 pageviews, 36 local articles, 35 measured local articles |
| GA4 active users, sessions, pageviews, engaged sessions, returning readers | Protected Google reporting path | GA4 code targets latest 28 complete local days | `2026-07-27T15:37:00Z` | complete provider window when authorized | unavailable | Reporting token and service-account env unavailable in this run |
| Search Console clicks, impressions, CTR, position | Protected Google reporting path | Search Console code targets latest 28 complete local days ending 3 days back | `2026-07-27T15:37:00Z` | final-data lag adjusted when authorized | unavailable | Reporting token and service-account env unavailable in this run |
| Ad impressions, viewable impressions, Active View, RPM, ad revenue | Ad provider | none connected | `2026-07-27T15:37:00Z` | unavailable | unavailable | `/ads.txt` is 404 and no ad-provider export is connected |
| Sponsor inquiries, qualified sponsor inquiries, sponsorship revenue | Fail-closed inbox or owner-approved CRM | none connected | `2026-07-27T15:37:00Z` | unavailable | unavailable | Inbox is not live-proven and no sponsor ledger is connected |
| Content and model cost | Local run/provider metadata | current review | `2026-07-27T15:37:00Z` | per run when available | unavailable | No reliable model/provider cost export was available |

Top complete 7-day local pageview signals:

- `/things-to-do/summer-lights-english-bay-fireworks`: 17.
- `/transit/translink-july-fare-increase-what-riders-pay`: 17.
- `/things-to-do/free-burnaby-park-events-this-week`: 16.
- `/food-drink/ramen-danbo-main-st-opening-vancouver`: 9.
- `/sports/canucks-2026-home-opener-ticket-dates`: 8.
- `/local-news/surrey-capital-projects-2031-buildout`: 7.

These are pageviews only. They are not engagement, retention, search, ad, sponsor, revenue, profit, or cash proof.

## Automation and sync health

- `run-trends-today-daily-publisher`: ACTIVE; daily 06:30, 08:30, 10:30, 12:30, 14:30, 16:30, 18:30 America/Vancouver; model `gpt-5.5`; local execution; mutation scope includes qualified editorial release after exact GPT, Opus 5, checks, PR, deployment, and browser gates; latest learning shows July 27 06:30 published, merged, deployed, and browser-verified.
- `run-trends-today-operator-pulse`: ACTIVE; hourly at minute 35; model `gpt-5.6-terra`; read-only by prompt; latest durable state at `2026-07-27T14:40:34Z` correctly distinguishes PR #94 draft state, Surrey Sounds live state, reporting access, and public count regression.
- `run-trends-today-weekly-growth-review`: ACTIVE; weekly Monday 08:30 America/Vancouver; model `gpt-5.5`; local execution; this run used a fresh clean worktree and did not mutate the stale root.
- `show-trends-today-daily-analytics`: ACTIVE; daily 09:00; model `gpt-5.5`; read-only; latest snapshot generated `2026-07-26T16:03:14Z`, status available, July 25 site pageviews 90 versus July 24 site pageviews 108.
- Four Trends Today automation TOMLs were found, not three. No duplicate job was created. The daily analytics job overlaps the measurement lane but is read-only and distinct from the publisher, hourly pulse, and weekly review.
- Repository GitHub Actions are separate read-only research/scorecard jobs. Latest `Weekly Content Business Scorecard` run succeeded on `2026-07-27T13:38:12Z` for SHA `8b7a22fa348817808d9296dd261a776bf920d01a`; latest `Daily Content Opportunity Research` run succeeded on `2026-07-26T14:56:25Z` for SHA `f89727efa805065c7572ac9c720f66ebf20c6b67`.
- Root sync health: root checkout remains 232 commits behind `origin/main` with user-owned untracked artifacts. It was not cleaned or reset; the accidental root audit entry from this run was preserved.
- Active draft PRs: #94 local-change discovery is draft, clean, Vercel checks passed, but unmerged, not deployed, and behind current main; #62 monitored inbox is draft and intentionally does not configure provider, DNS, secrets, or live sending.

## Commercial readiness

- Commercial fit continues to follow editorial qualification only. All recent local candidates remain `sponsorshipStatus: editorial` unless owner approval exists.
- Inbox lifecycle counts are unavailable because the inbox is not live-proven and no provider/CRM store is connected. Do not report unavailable sponsor lead counts as zero.
- PR #62 contains a hardened fail-closed inbox design with signed webhook, idempotency, owner approval links, and single-send controls, but it explicitly does not configure Resend, DNS, OpenAI, Upstash, production secrets, deployment, or live end-to-end proof.
- Intake and all sending must remain fail-closed. Leads may be collected, triaged, qualified, and drafted internally only after the intake path is proven; no advertiser/sponsor replies, pricing, terms, guarantees, commitments, billing, public audience claims, supported coverage, provider changes, or production data mutation are authorized from this review.

## Binding constraint

- Decision: `repair-measurement`.
- Constraint stage: attention to repeat use and commercial proof.
- Mechanism: the editorial supply chain can publish local utility stories, but the business cannot yet see organic engaged sessions, returning readers, Search Console demand, CTA actions, ad viewability, sponsor inquiry quality, revenue, cost, or contribution. Vercel pageviews are now retrievable, but they are an intermediate attention signal.
- Secondary quality blocker: public `/api/analytics` exposes raw inventory count again and lacks `countType: surfaced-live-articles` plus `internalInventory.status: not-exposed`. A prior local fix exists at `3255031f61861aae65872d5ede0def2365c653f4` in `codex/trends-published-count-reporting`, but it is not in current main and would need current-base tests and exact review before release.

## One operator move

- Changed variable: keep editorial volume unchanged and repair reporting access, not story volume or sponsor activity.
- Baseline: Vercel path-level pageviews are available for 7-day and 28-day complete windows, but GA4, Search Console, returning-reader, engagement, CTA, ad, sponsor, revenue, and cost retrieval are unavailable in this run.
- Success metric: by the 2026-08-03 weekly review, one authorized read-only reporting path returns a provider-statused GA4 and Search Console snapshot, or records a specific provider error, for complete 7-day and 28-day article cohorts without exposing credentials.
- Guardrails: no credential printing; no provider changes; no production-data mutation; no missing metric coerced to zero; no public audience, ad, sponsor, revenue, or pricing claim; no sponsor outreach.
- Review date: 2026-08-03 for reporting-access repair; 2026-08-17 for first 28-day local cohort content decision.
- Keep: Vercel wrapper remains available and GA/Search Console snapshots become available or specifically provider-error classified.
- Repair: bearer token, service-account env, property access, or endpoint auth remains missing; public count semantics remain raw inventory.
- Stop: any credential exposure, private-data exposure, unsupported public claim, provider mutation without owner approval, or metric coercion to zero.

## Action log

- Read required skills, durable automation memory, Trends Today memory pointers, operating docs/config, automation TOMLs, and weekly learning entries.
- Inventoried git status, worktrees, root dirty state, remote head, open PRs, deployment status, production endpoints, analytics wrappers, and reporting environment presence.
- Created clean review worktree from `origin/main` at `9da4bcb697447f0d714f2053a16633e10a90317a`.
- Corrected one accidental root-scope audit write by copying the audit entry into the clean review worktree and preserving the root copy instead of deleting it.
- Ran `C:\Users\farha\.codex\automations\run-trends-today-weekly-growth-review\run-vercel-analytics.ps1` for complete 7-day and 28-day local windows without exposing the decrypted token.
- Checked protected reporting path with no bearer token present and recorded HTTP 401.
- Captured Playwright screenshot proof of the live Surrey Sounds article.
- Checked live article HTML/source facts, public analytics JSON, `/ads.txt`, GitHub deployments, and open PR state.
- No Fable call was started. No Opus review was run because this audit did not change production code, publish an article, merge, deploy, or request a release decision.

## Tests and checks

- Vercel wrapper 7-day export: passed, status available, 0 errors.
- Vercel wrapper 28-day export: passed, status available, 0 errors.
- Production public analytics HTTP check: passed, HTTP 200.
- Production protected reporting check: failed closed, HTTP 401 without token.
- Production article HTTP/source check: passed, HTTP 200 with expected H1, canonical, source link, hero markup, and Article JSON-LD.
- Playwright screenshot render: passed, screenshot captured.
- `/ads.txt` check: failed readiness, HTTP 404.
- Draft audit PR: #108, branch `codex/weekly-growth-review-2026-07-27`, commit `c55693517678420f87244e760527d84d20706d61`, merge state clean, Vercel and Vercel Preview Comments successful at closeout.

## Rollback

- No public code, content, provider, inbox, pricing, outreach, production data, or deployment mutation was performed by this weekly review.
- Rollback point for any future audit-entry PR: revert the evidence-only commit created from this review branch.
- Production rollback point for current site state remains SHA `9da4bcb697447f0d714f2053a16633e10a90317a`; for the latest article release, revert merge commit `bc81930bb038831ebb84b223293507c3e6e0e55d` if the Surrey Sounds publication needs rollback.
