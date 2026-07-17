# Daily publisher learning - 2026-07-17

## Outcome

- Decision: `published-candidate`
- Beat: `software-update-utility`
- Lane: `timely-opportunity`
- Article: `Windows 11 July Update: What to Check Before You Pause`
- Slug: `/technology/windows-11-july-update-pause-restore-controls`
- Candidate SHA-256: `390abf8fb7b61ffb6a1e495a1df0985ae770d3f19a979cc4bffccdb0f66eedaf`
- Review: `NO BLOCKERS` from Claude via `fable`

## Baseline and constraint

- Vercel Web Analytics: embedded in the site, provider data unavailable to the repository endpoint.
- Google Analytics: unavailable.
- Google Search Console: unavailable.
- Article-level impressions, clicks, engaged sessions, returning sessions, app CTA clicks, and revenue: unavailable.
- Missing values were not converted to zero.
- Current constraint: measurement remains the binding editorial constraint, but the release path was available for one guarded utility-beat rep.

## Hypothesis

Publishing one practical software-update utility article should create more repeat-qualified intent than another broad curiosity article because it answers a current reader decision: install, pause, or wait.

## Single changed variable

One `software-update-utility` article was selected over the prior broad remarkable-story mix.

## Sources

- Microsoft Support KB5101650 release notes: https://support.microsoft.com/en-us/servicing/os/windows-11/2026/07/july-14-2026-kb5101650-os-builds-26200-8875-and-26100-8875
- Microsoft Support pause updates guidance: https://support.microsoft.com/en-us/windows/deployment/updates-lifecycle/pause-updates-in-windows
- Microsoft Learn point-in-time restore documentation: https://learn.microsoft.com/en-us/windows/configuration/point-in-time-restore
- Microsoft Learn Windows message center: https://learn.microsoft.com/en-us/windows/release-health/windows-message-center

## Known cost

- Cash/API cost: no project API key was used for the built-in image generation path.
- Human approval: not required under the guarded editorial publishing authorization.

## Checkpoints

- 7-day checkpoint: 2026-07-24. Record Search Console impressions/clicks, Vercel page traffic if export is available, and any available engaged or returning sessions.
- 28-day checkpoint: 2026-08-14. Decide `keep`, `repair`, or `stop` for software-update utility based on article-level traffic and returning-reader evidence.

## Next test

Repair measurement first: connect or export article-level Search Console, GA4/engagement, and Vercel Web Analytics data without coercing missing fields to zero.
