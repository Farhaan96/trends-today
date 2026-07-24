# Trends Today monitored inbox activation

The application is ready for an approval-gated inbox at
`hello@trendstoday.ca`. It is intentionally disabled in public pages until the
live route passes an end-to-end test.

## What the agent is allowed to do

- Receive and classify publication email.
- Summarize the message and draft a proposed reply.
- Email the private owner alert address for every non-spam message.
- Send an optional text alert for high or urgent messages.
- Present the original message and editable draft on a private, expiring review
  page.

The agent cannot send a public reply until Moe confirms the exact text. It
cannot publish, promise coverage, quote advertising terms, accept money, admit a
correction, or make legal decisions.

## Provider setup

1. Create or select the Trends Today Resend account.
2. Add `trendstoday.ca` as the domain and enable receiving.
3. Copy the exact sending and receiving DNS records shown by Resend into the
   GoDaddy DNS zone. Do not guess record names or values.
4. Wait until Resend reports both sending and receiving as verified.
5. Add a Resend webhook for:
   `https://www.trendstoday.ca/api/inbox/resend`
6. Subscribe that webhook to `email.received`.
7. Copy its signing secret into the deployment environment.

The domain had no MX record when checked on July 23, 2026. Recheck DNS before
making changes in case another mail provider has since been added.

## Required private deployment settings

- `RESEND_API_KEY`
- `RESEND_WEBHOOK_SECRET`
- `TRENDS_INBOX_APPROVAL_SECRET`
- `TRENDS_OWNER_ALERT_EMAIL`
- `TRENDS_INBOX_FROM_EMAIL=Trends Today <hello@trendstoday.ca>`
- `OPENAI_API_KEY`
- `TRENDS_INBOX_MODEL=gpt-5.6-terra`

Generate `TRENDS_INBOX_APPROVAL_SECRET` as a long random value. Never place API
keys, the approval secret, the owner alert address, or a phone number in source
control.

For urgent text alerts, also configure:

- `TRENDS_OWNER_ALERT_PHONE`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_PHONE`

## Release test

Keep `NEXT_PUBLIC_INBOX_READY=false` until all of these pass:

1. Send a normal test email from an unrelated external address.
2. Confirm one owner email alert arrives and no reply is sent automatically.
3. Open the private review link, edit the draft, and approve it.
4. Confirm exactly one threaded reply reaches the original sender.
5. Click approve again and confirm it does not send a duplicate.
6. Replay the inbound webhook and confirm it does not create a duplicate alert.
7. Send a correction or advertising inquiry and confirm it is routed for owner
   review.
8. If SMS is enabled, send a high-urgency test and confirm the private text
   alert arrives.
9. Verify `hello@trendstoday.ca` receives mail in both Gmail and Outlook tests.

Only after the release test passes should the deployment set
`NEXT_PUBLIC_INBOX_READY=true` and rebuild the site.
