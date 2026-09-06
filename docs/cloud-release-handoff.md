# Cloud release migration and redesign pilot

## Owner request and scope

On September 5, 2026 the owner approved the cinematic local redesign, requested
production release, and asked to use Cursor cloud agents as with CollisionOS.
The redesign is PR #184, branch `feat/cinematic-local-redesign`. Its initial
implementation is commit `129050ef491c9ea524a1a77bbc76f03ef721dff6`.
Resolve the latest head before every check and review; that initial SHA is not
a permanent approval target.

Cursor cloud is already connected to this repository: merged PR #182 came from
a Cursor agent. This task completes the delivery path, not a new provider setup.
Keep Vercel, the production domain, editorial publication rules, and existing
credential boundaries. No new recurring editorial scheduler is authorized by
this migration.

## Reference architecture

Read CollisionOS COS-962 / PR #653 for cloud evidence (run ID, exact worktree
SHA, artifact digests, independent reviewer), and COS-964 / PR #654 for hosted
CI and deploy/live receipts. Both were still draft/open when inspected. Adapt
their principles to this Next.js/Vercel repository; do not copy Firebase commands,
assume those PRs have landed, or edit either active CollisionOS branch.

## Implementation work for the cloud agent

1. Confirm the active Cursor environment and bootstrap this branch. Record the
   agent session URL, runtime, repository, and exact head. Add a committed
   dependency lockfile and a supported Node LTS pin so fresh installs can use
   `npm ci` consistently; inspect resolved dependency changes before accepting.
2. Add GitHub-hosted CI for pull requests with bounded timeouts, read-only token
   permissions, exact-head checkout, build, typecheck, lint, deterministic tests,
   and durable logs. Repair the existing formatting blocker with a narrow,
   reviewable change; preserve historical evidence rather than deleting it to
   make checks green. Do not use `pull_request_target` to run untrusted PR code.
3. Configure a focused cloud browser suite for desktop and mobile using the
   agent's authorized browser/runtime. Test navigation, search plus city filter,
   reset, load more, gallery controls, keyboard access, menu/Escape, event expiry,
   reduced motion, image loading, console errors and page overflow. Compare real
   implementation screenshots with `docs/design/approved-homepage.webp` and fix
   visible mismatches. Keep reporting/source content and existing article routes.
4. Move independent release review off the fixed Windows PowerShell path while
   preserving the repository's exact-SHA Opus 5 model and reviewer separation.
   Use an existing authorized cloud model runtime. Verify actual model and run
   metadata; never relabel a different model or manufacture a NO BLOCKERS receipt.
   If access or the required model is unavailable, record the precise blocker.
   Keep Windows as an optional fallback, not a dependency of the cloud path.
5. Bind cloud evidence to repository, PR head, clean tree SHA, CI run URL/ID,
   artifact SHA-256 hashes, reviewer identity/session/model and verdict. Reject
   stale heads, missing/failed checks, dirty source, missing review provenance,
   and self-review. Test these failure cases before relying on the gate.
6. Once independently approved, use the existing guarded merge and Vercel
   integration. Match deployment source SHA to the merged commit, then verify
   the live homepage, category and article, canonical/schema, images, main
   interactions and mobile. Save deployment URL, tested commit, screenshots,
   results and rollback reference. Do not mark release complete from a successful
   preview build alone.

## Current evidence and limitations

- Initial redesign: production build and typecheck passed; 244 generated pages.
- Six feed unit tests passed. Full lint passed with 133 existing warnings.
- Vercel status for the initial design SHA is successful (preview build).
- Repository-wide formatting failed on pre-existing archived JSON/MDX records.
- Work Mode visual QA was blocked by its browser URL policy. There are no
  implementation screenshots or interaction results from that session. This
  migration must respect security controls; do not access or proxy that blocked
  Work Mode endpoint. Cloud CI uses its own authorized checkout and services.
- The Windows-only Opus reviewer was unavailable. No independent review is
  claimed for this branch. Update `design-qa.md` only from real evidence.

## Completion and failure handoff

Success means one complete redesigned-site release proven with no home-PC step,
not merely an environment config or a cloud-generated PR. Until then report the
stage accurately: setup, implemented, tested, reviewed, merged, deployed, verified.
If blocked, leave the exact head, failed step, logs, owner action (if any), and
next runnable command in the PR. Do not retry indefinitely or start duplicate
writers. Keep the draft open while gates remain unresolved.

## Setup references

- [Cursor cloud environment setup](https://cursor.com/docs/cloud-agent/setup)
- [Cursor environment schema](https://cursor.com/schemas/environment.schema.json)
- [Cursor cloud agents and launch methods](https://cursor.com/docs/cloud-agent)

Cursor normally builds from the default branch. For this first feature-branch
run, explicitly run the install script; after merge refresh the saved Build.
The environment configuration inherits existing network and MCP policies.
