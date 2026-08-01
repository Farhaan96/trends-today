import { NextRequest, NextResponse } from 'next/server';
import {
  InboxRequestError,
  MAX_WEBHOOK_BODY_BYTES,
  byteLength,
  escapeHtml,
  sha256,
  verifyWebhookEnvelope,
} from '@/lib/inbox-core';
import {
  ReceivedEmailInput,
  createInboxStore,
  createResendClient,
  createReviewUrl,
  moveToTriaged,
  normalizeReceivedEmail,
  requireInboxConfig,
  triageRecord,
} from '@/lib/inbox-service';

export const runtime = 'nodejs';

function responseError(code: string, status: number) {
  return NextResponse.json({ error: code }, { status });
}

function mapReceivedEmail(data: Record<string, unknown>): ReceivedEmailInput {
  const attachments = Array.isArray(data.attachments)
    ? data.attachments.map((item) => {
        const attachment =
          item && typeof item === 'object'
            ? (item as Record<string, unknown>)
            : {};
        return {
          id: typeof attachment.id === 'string' ? attachment.id : undefined,
          filename:
            typeof attachment.filename === 'string'
              ? attachment.filename
              : undefined,
          contentType:
            typeof attachment.content_type === 'string'
              ? attachment.content_type
              : undefined,
          size:
            typeof attachment.size === 'number' ? attachment.size : undefined,
        };
      })
    : [];
  return {
    id: String(data.id || ''),
    from: String(data.from || ''),
    replyTo: Array.isArray(data.reply_to)
      ? data.reply_to.filter(
          (value): value is string => typeof value === 'string'
        )
      : [],
    to: Array.isArray(data.to)
      ? data.to.filter((value): value is string => typeof value === 'string')
      : [],
    subject: typeof data.subject === 'string' ? data.subject : null,
    messageId: typeof data.message_id === 'string' ? data.message_id : null,
    text: typeof data.text === 'string' ? data.text : null,
    html: typeof data.html === 'string' ? data.html : null,
    headers:
      data.headers && typeof data.headers === 'object'
        ? (data.headers as Record<string, string>)
        : null,
    attachments,
  };
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (
    !Number.isFinite(contentLength) ||
    contentLength < 0 ||
    contentLength > MAX_WEBHOOK_BODY_BYTES
  ) {
    return responseError('webhook_body_too_large', 413);
  }

  let config;
  try {
    config = requireInboxConfig();
  } catch {
    return responseError('inbox_not_configured', 503);
  }

  const payload = await request.text();
  if (byteLength(payload) > MAX_WEBHOOK_BODY_BYTES) {
    return responseError('webhook_body_too_large', 413);
  }

  const resend = createResendClient(config);
  let verified;
  try {
    verified = verifyWebhookEnvelope({
      payload,
      headers: {
        id: request.headers.get('svix-id'),
        timestamp: request.headers.get('svix-timestamp'),
        signature: request.headers.get('svix-signature'),
      },
      nowSeconds: Math.floor(Date.now() / 1000),
      verifySignature: ({ payload: signedPayload, headers }) =>
        resend.webhooks.verify({
          payload: signedPayload,
          headers,
          webhookSecret: config.webhookSecret,
        }),
    });
  } catch (error) {
    if (error instanceof InboxRequestError) {
      return responseError(error.code, error.status);
    }
    return responseError('webhook_rejected', 401);
  }

  const emailId = verified.event.data.email_id;
  const recordId = sha256(emailId);
  const store = createInboxStore(config);

  try {
    const replay = await store.claimWebhookEvent(
      verified.eventId,
      verified.payloadHash,
      recordId
    );
    let record = await store.get(recordId);
    if (
      replay === 'replay' &&
      record &&
      !['received', 'triaged'].includes(record.state)
    ) {
      return NextResponse.json({
        ok: true,
        replay: true,
        state: record.state,
      });
    }

    if (!record) {
      const received = await resend.emails.receiving.get(emailId, {
        html_format: 'cid',
      });
      if (received.error || !received.data) {
        return responseError('received_email_unavailable', 502);
      }
      const email = mapReceivedEmail(
        received.data as unknown as Record<string, unknown>
      );
      const autoSubmitted =
        email.headers?.['auto-submitted']?.toLowerCase() || '';
      if (
        email.from.toLowerCase().includes('hello@trendstoday.ca') ||
        (autoSubmitted && autoSubmitted !== 'no')
      ) {
        return NextResponse.json({ ok: true, ignored: true });
      }
      record = await store.create(
        normalizeReceivedEmail(email, verified.eventId)
      );
    }

    if (record.state === 'received') {
      const triage = await triageRecord(record, config);
      const moved = await moveToTriaged({ record, store, triage });
      if (!moved) return responseError('triage_persistence_failed', 503);
      record = moved;
    }

    if (record.state === 'triaged') {
      if (!record.triage) return responseError('triage_missing', 503);
      const reviewUrl = createReviewUrl(record, config);
      const alert = await resend.emails.send(
        {
          from: config.fromEmail,
          to: config.ownerEmail,
          subject: `[Trends Today ${record.triage.urgency}] ${record.triage.category}: ${record.subject}`,
          text: [
            `Category: ${record.triage.category}`,
            `Urgency: ${record.triage.urgency}`,
            `Owner needed: ${record.triage.ownerNeeded ? 'yes' : 'no'}`,
            `From: ${record.sender}`,
            `Subject: ${record.subject}`,
            `Quarantined attachments: ${record.attachments.length}`,
            '',
            record.triage.summary,
            '',
            `Why: ${record.triage.reason}`,
            '',
            'Draft only. Nothing has been sent to the sender:',
            record.initialDraft || '(No draft. Write one during review.)',
            '',
            `Review and approve: ${reviewUrl}`,
          ].join('\n'),
          html: [
            `<h1>Trends Today inbox: ${escapeHtml(record.triage.category)}</h1>`,
            `<p><strong>Urgency:</strong> ${escapeHtml(record.triage.urgency)}<br>`,
            `<strong>From:</strong> ${escapeHtml(record.sender)}<br>`,
            `<strong>Subject:</strong> ${escapeHtml(record.subject)}<br>`,
            `<strong>Quarantined attachments:</strong> ${record.attachments.length}</p>`,
            `<p>${escapeHtml(record.triage.summary)}</p>`,
            '<h2>Draft only</h2>',
            `<pre style="white-space:pre-wrap">${escapeHtml(record.initialDraft || '(No draft. Write one during review.)')}</pre>`,
            `<p><a href="${escapeHtml(reviewUrl)}">Review and approve the exact reply</a></p>`,
            '<p>Attachments remain quarantined. The sender has received no automatic reply.</p>',
          ].join(''),
        },
        { idempotencyKey: `inbox-alert/${record.id}` }
      );
      if (alert.error || !alert.data?.id) {
        return responseError('owner_alert_failed', 502);
      }
      const alerted = await store.transition(
        record.id,
        'triaged',
        'owner_alerted',
        { alertProviderMessageId: alert.data.id }
      );
      if (!alerted || alerted.state !== 'owner_alerted') {
        return responseError('owner_alert_persistence_failed', 503);
      }
      record = alerted;
    }

    return NextResponse.json({ ok: true, state: record.state });
  } catch (error) {
    if (error instanceof Error && error.message === 'webhook_replay_mismatch') {
      return responseError('webhook_replay_mismatch', 409);
    }
    return responseError('inbox_processing_failed', 503);
  }
}
