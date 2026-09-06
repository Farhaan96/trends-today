# Trends Today

Read `CLAUDE.md`, `docs/content-business-operating-system.md`, and
`docs/autonomous-publication-operating-system.md` before work. The 2026 Lower
Mainland operating contract overrides the legacy national-tech instructions.

## Cursor Cloud specific instructions

- Work in this repository, `Farhaan96/trends-today`. CollisionOS is a reference
  for cloud delivery architecture, not a second write target.
- `.cursor/environment.json` installs dependencies and starts Next.js on port 3000. Installation needs Node >=20.9 and the environment's permitted package
  network access. Run `bash scripts/cloud/install.sh` after checking out this
  branch if the active Cursor Build predates the configuration.
- The app build does not require editorial-provider, analytics-reporting, or
  production deployment secrets. Use existing managed integrations when needed;
  never copy Windows credentials or embed secrets into snapshots or source.
- Use `npm run build`, `npm run typecheck`, `npm run lint`, and
  `node --test tests/*.test.mjs`. The existing Playwright specs predate the
  redesign and have no checked-in configuration; do not report them as passing
  without setting up and running the relevant suite.
- `npm run format:check` currently fails on archived records. Preserve this
  evidence; repair the actual issues or propose a narrowly justified formatting
  scope for independent review. Never silently skip a required check.
- Follow `docs/cloud-release-handoff.md` for the initial migration and PR #184
  pilot. Keep one implementation writer per branch. An implementation agent is
  not its own independent reviewer.
- A machine location is not a review credential. Moving execution to cloud does
  not remove exact-SHA Opus 5 independent review, truthful model/run provenance,
  deterministic checks, or live verification. Unavailable gates remain blocked.
- Respect each environment's browser, network, and approval policies. Do not
  proxy a blocked browser endpoint or weaken access controls to obtain evidence.
