import { NextRequest, NextResponse } from 'next/server';
import type { EmailReceivedEvent } from 'resend';
import {
  createResendClient,
  createReviewUrl,
  emailToPlainText,
  escapeHtml,
  loadReceivedEmail,
  requireInboxConfig,
  sendOwnerSms,
  triageEmail,
} from '@/lib/inbox-agent';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const signingSecret = process.env.RESEND_WEBHOOK_SECRET;
  if (!signingSecret) {
    return NextResponse.json(
      { error: 'Inbox webhook is not configured.' },
      { status: 503 }
    );
  }

  const payload = await request.text();
  const id = request.headers.get('svix-id');
  const timestamp = request.headers.get('svix-timestamp');
  const signature = request.headers.get('svix-signature');
  if (!id || !timestamp || !signature) {
    return NextResponse.json(
      { error: 'Missing webhook signature.' },
      { status: 400 }
    );
  }

  let event;
  try {
    event = createResendClient().webhooks.verify({
      payload,
      headers: { id, timestamp, signature },
      webhookSecret: signingSecret,
    });
  } catch {
    return NextResponse.json(
      { error: 'Invalid webhook signature.' },
      { status: 400 }
    );
  }

  if (event.type !== 'email.received') {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const receivedEvent = event as EmailReceivedEvent;
  const email = await loadReceivedEmail(receivedEvent.data.email_id);
  const from = email.from.toLowerCase();
  const autoSubmitted = email.headers?.['auto-submitted']?.toLowerCase();
  if (
    from.includes('hello@trendstoday.ca') ||
    (autoSubmitted && autoSubmitted !== 'no')
  ) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const triage = await triageEmail(email);
  if (triage.category === 'spam') {
    return NextResponse.json({ ok: true, spam: true });
  }

  const reviewUrl = createReviewUrl(email.id);
  const config = requireInboxConfig();
  const plainBody = emailToPlainText(email);
  const alertText = [
    `Category: ${triage.category}`,
    `Urgency: ${triage.urgency}`,
    `Owner needed: ${triage.ownerNeeded ? 'yes' : 'no'}`,
    `From: ${email.from}`,
    `Subject: ${email.subject || '(no subject)'}`,
    `Attachments: ${email.attachments.length}`,
    '',
    triage.summary,
    '',
    `Why it was routed this way: ${triage.reason}`,
    '',
    'Suggested reply (not sent):',
    triage.suggestedReply || '(No draft. Write a reply during review.)',
    '',
    `Review and approve: ${reviewUrl}`,
    '',
    'The sender has not received an automated reply.',
  ].join('\n');

  const { error } = await createResendClient().emails.send(
    {
      from: config.fromEmail,
      to: config.ownerEmail,
      subject: `[Trends Today ${triage.urgency}] ${triage.category}: ${email.subject || '(no subject)'}`,
      text: alertText,
      html: [
        `<h1>Trends Today inbox: ${escapeHtml(triage.category)}</h1>`,
        `<p><strong>Urgency:</strong> ${escapeHtml(triage.urgency)}<br>`,
        `<strong>Owner needed:</strong> ${triage.ownerNeeded ? 'yes' : 'no'}<br>`,
        `<strong>From:</strong> ${escapeHtml(email.from)}<br>`,
        `<strong>Subject:</strong> ${escapeHtml(email.subject || '(no subject)')}<br>`,
        `<strong>Attachments:</strong> ${email.attachments.length}</p>`,
        `<p>${escapeHtml(triage.summary)}</p>`,
        `<p><strong>Why:</strong> ${escapeHtml(triage.reason)}</p>`,
        '<h2>Suggested reply (not sent)</h2>',
        `<pre style="white-space:pre-wrap">${escapeHtml(triage.suggestedReply || '(No draft. Write a reply during review.)')}</pre>`,
        `<p><a href="${escapeHtml(reviewUrl)}">Review and approve the exact reply</a></p>`,
        '<p>The sender has not received an automated reply.</p>',
        '<hr>',
        `<pre style="white-space:pre-wrap">${escapeHtml(plainBody.slice(0, 4000))}</pre>`,
      ].join(''),
    },
    { idempotencyKey: `inbox-alert/${id}` }
  );
  if (error) {
    throw new Error(`Owner alert failed: ${error.message}`);
  }

  try {
    await sendOwnerSms(triage, reviewUrl, email.from);
  } catch (smsError) {
    console.error('Inbox SMS alert failed:', smsError);
  }

  return NextResponse.json({ ok: true, alerted: true });
}
