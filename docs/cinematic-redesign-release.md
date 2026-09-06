# Cinematic local edition — release packet

Owner approved the combined dark/cream visual direction and asked to ship it on September 5, 2026. This branch implements that design in the existing Next.js publication.

## Changes

- Cinematic evergreen homepage with reactive cover depth, cream travel briefing, curved interactive event gallery, and searchable city-filtered local feed.
- Coordinated shared navigation, footer, category headers, and more compact article headings.
- All articles, sources, routes, canonical/schema and analytics integrations retained.
- Dynamic event expiry and slug-specific navigation artwork; no hardcoded permanent weekend edition.
- Self-hosted existing DM Sans/Newsreader fonts eliminate build-time Google Fonts network dependency; licenses included.
- Next.js dev wrapper accepts Sites preview host/port flags without changing runtime.

## Verification

Production build passes with 244 generated pages. Changed TS/TSX files pass ESLint and TypeScript. Six deterministic feed tests pass (expiry, timezone boundary, combined city/search, reset, artwork edition isolation, city fallback).

Visual/browser QA is blocked by browser URL security policy. The configured independent release reviewer is a Windows-only Opus 5 runner unavailable here. See design-qa.md. This is a ready-to-review implementation, not a production verification claim.

## Asset provenance

The hero uses each story's existing image and attribution. New decorative foliage and editorial navigation posters were generated in the approved visual design workflow and optimized to WebP. They are not official event posters. Poster mapping is restricted to the exact September 2026 event article URLs. New/other events use their own title and end date in an editable typographic card.

The fonts were retrieved unchanged from the site's existing deployed assets, identified through its deployed stylesheet, and are distributed with the upstream SIL Open Font Licenses.

## Release and rollback

Use the existing GitHub → Vercel deployment. Do not change domain/DNS/provider configuration. Complete browser QA and the repository's exact-SHA Opus 5 release gate, then merge. After deployment, verify homepage, one category, one article, search/filter/gallery, mobile menu, imagery, console and canonical.

Rollback by reverting the redesign merge; no content or database migration is required. Baseline commit is recorded in the PR parent.

## Repository-wide gates

`npm run lint` exits successfully with 133 existing warnings and no errors. `npm run typecheck` passes. The repository-wide `format:check` fails on existing archived artifacts/content, including `artifacts/editorial/metrics/2026-07-26-1430-public-analytics.json` with a trailing `HTTP_STATUS:200` line. These unchanged historical records are outside this redesign. Changed source and documentation are formatted separately; no blanket cleanup or gate suppression is included.
