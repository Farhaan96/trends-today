# 2026-07-24 16:30 PDT sweep - Burnaby mayor walk

## Outcome

- Published: `Burnaby mayor walk returns Sunday morning`
- Canonical URL: `https://www.trendstoday.ca/things-to-do/burnaby-mayor-walk-chat-sunday`
- Category and municipality: things-to-do, Burnaby
- Publication time: `2026-07-24T16:45:00-07:00`
- Release PR: `#72`
- Merge SHA: `915ce9dadf78668279356de9bfe29e8202620b50`
- Production deployment: `5596852101`
- Live verification: production URL returned 200; canonical, H1, July 24 date context, July 26 event details, Christine Sinclair Community Centre address, $2 pancake breakfast, Aug. 30 next-date detail, source link, Burnaby Art in the Park internal link, 1024 x 576 optimized hero image, zero missing required body facts, and zero browser console/page errors verified.

## Reader Job

Help Burnaby residents decide whether the July 26 Walk and Chat with the Mayor is a worthwhile low-cost Sunday morning plan, and give them the time, meeting point, address, breakfast note, and next-date cue without padding.

## Sources

- City of Burnaby Walk and Chat with the Mayor event page
- Trends Today Burnaby Art in the Park bulletin for the contextual internal link

## Commercial Hypothesis

- `commercialIntent`: `ad-fit`
- `sponsorshipStatus`: `editorial`
- `brandSafety`: `standard`
- Hypothesis: a confirmed Burnaby weekend community-walk bulletin may fit contextual local recreation, wellness, family outing, neighbourhood, and coffee/breakfast ad inventory because reader intent is practical and location-specific. This is a post-qualification hypothesis only, not proof of RPM, sponsor demand, or advertiser value.

## Length And Format Rationale

Published as a 271-word bulletin because the reader job needed one current date, a one-hour window, one meeting point, one address, the breakfast detail, and a page-confirmation reminder. Longer copy would have padded the event rather than helping the reader.

## Internal Links

- Linked once to `Burnaby Art in the Park dates` because it gives nearby free Burnaby activity context for readers building a longer local week.

## Single Changed Variable

Tested a short late-afternoon Burnaby community-outing bulletin after the earlier event and civic-update mix. The changed variable is ultra-practical neighbourhood event utility, not article length or commercial-first selection.

## Measurement State

- Verified available: `/api/analytics` showed `156` active articles, `10` things-to-do articles, and the Burnaby mayor walk bulletin first in recent articles after deployment.
- Unavailable: article-level page views, engaged sessions, returning sessions, scroll depth, measurable ad impressions, viewable ad impressions, Active View rate, ad revenue, page RPM, sponsor inquiries, qualified sponsor inquiries, sponsorship revenue, and content cost.
- Constraint: provider-level Vercel analytics, GA, Search Console, ad, and sponsor exports are not connected to the repository endpoint.
- Repair: connect `VERCEL_TOKEN` or `VERCEL_ANALYTICS_TOKEN` plus `VERCEL_PROJECT_ID`, then add configured GA/Search Console/ad/sponsor exports so future sweeps can compare actual viewable inventory and inbound sponsor demand.

## Costs

- Direct cash cost: unavailable.
- Human approval cost: none required because coverage stayed editorial and no sponsored, supported, branded, sensitive, outreach, pricing, billing, or customer-commitment action was taken.

## Checkpoints

- 7-day checkpoint: `2026-07-31`
- 28-day checkpoint: `2026-08-21`

## Keep / Repair / Stop Rule

- Keep: if connected metrics show the bulletin earns useful things-to-do engagement or repeat local-reader signals without brand-safety issues.
- Repair: if impressions appear but engagement is weak, make future community bulletins even more decision-oriented by leading with who should go, transit/parking notes, or nearby add-on plans when supported.
- Stop: if two comparable official-source neighbourhood event bulletins show weak engagement and no credible sponsor signal after metrics are connected.
