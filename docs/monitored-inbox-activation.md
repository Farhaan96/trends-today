# Trends Today monitored inbox activation

This release is fail-closed. Code review, a preview deployment, or green local
tests do not make `hello@trendstoday.ca` live. Public contact controls remain
disabled until the server confirms provider, DNS, persistence, secrets, and a
completed end-to-end release test.

## Allowed automation

- Receive a signed `email.received` event.
- Treat the email and all metadata as untrusted.
- Quarantine attachment metadata. Attachment contents are never downloaded,
  opened, or sent to the model.
- Ask the model to classify, summarize, and draft only.
- Alert the private owner address with an expiring review link.

The AI cannot reply, publish, browse, call tools, change data, make payments,
quote terms, promise coverage, accept a correction, or contact anyone. Moe must
edit or approve the exact draft through a single-use link. The system then
records one send attempt and its terminal `sent` or `failed` outcome. Failed or
ambiguous sends are never retried automatically.

## Persisted state contract

Upstash Redis stores each record for seven days:

`received -> triaged -> owner_alerted -> owner_approved -> sending -> sent|failed`

Every transition uses a compare-and-set check. Webhook event IDs are bound to
the signed payload hash, replayed events resume safely without duplicate owner
alerts, and a reused event ID with a different payload is rejected.

Approval links expire after 24 hours and are bound to the stored record,
original sender, immutable reply recipient, original message/thread ID, initial
draft hash, nonce, and expiry. Consuming the link atomically persists the
owner's exact edited draft before the single send attempt.

## Required private settings

- `RESEND_API_KEY`
- `RESEND_WEBHOOK_SECRET`
- `TRENDS_INBOX_APPROVAL_SECRET` (long random value)
- `TRENDS_INBOX_FROM_EMAIL`
- `TRENDS_OWNER_ALERT_EMAIL`
- `OPENAI_API_KEY`
- `TRENDS_INBOX_MODEL`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `NEXT_PUBLIC_SITE_URL`

Do not commit secret values, owner addresses, provider error text, or message
content to logs.

## Owner-controlled activation flags

Keep all flags false until their evidence exists:

- `TRENDS_INBOX_PROVIDER_READY=true` only after the provider confirms sending
  and receiving.
- `TRENDS_INBOX_DNS_READY=true` only after the exact provider DNS records are
  verified live.
- `TRENDS_INBOX_RELEASE_TEST_PASSED=true` only after the complete test below.
- `NEXT_PUBLIC_INBOX_READY=true` only after the other three are true.

The readiness route returns only `{ "ready": false }` until every secret and
flag is present. It never reveals which private value is missing.

## Provider and DNS owner gate

Provider and DNS work is not part of this draft. An owner must separately:

1. Select the receiving provider and review its current setup instructions.
2. Copy the exact sending and receiving DNS records shown by the provider into
   the domain's DNS zone. Never guess names or values.
3. Confirm provider verification and live MX resolution.
4. Register `https://www.trendstoday.ca/api/inbox/resend` for
   `email.received` and store its signing secret privately.
5. Provision the Upstash data store and confirm its retention/security settings.

## End-to-end release test

Keep public readiness disabled while testing:

1. Send one harmless message from an unrelated external address.
2. Confirm one persisted record progresses from `received` to
   `owner_alerted`.
3. Confirm exactly one private owner alert and no reply to the sender.
4. Confirm attachment metadata is quarantined and attachment contents never
   appear in model input or the review page.
5. Open the private link, edit the draft, verify the recipient is immutable,
   and approve the exact text.
6. Confirm one threaded reply and a persisted `sent` state.
7. Reuse the approval link and confirm rejection with no second provider call.
8. Replay the inbound webhook and confirm no duplicate owner alert.
9. Exercise invalid signature, stale timestamp, malformed payload,
   prompt-injection text, provider rejection, and disabled-readiness cases.
10. Record the deployment, timestamp, sender/recipient test accounts, event ID,
    provider IDs, and pass/fail evidence without copying message content.

Only after all steps pass may the owner set the release-test and public-ready
flags and rebuild the public site.
