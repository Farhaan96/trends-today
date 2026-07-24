import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  createResendClient,
  loadReceivedEmail,
  requireInboxConfig,
  verifyApprovalToken,
} from '@/lib/inbox-agent';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    emailId?: string;
    expires?: number;
    token?: string;
    reply?: string;
  };
  const emailId = body.emailId || '';
  const expires = Number(body.expires);
  const token = body.token || '';
  const reply = body.reply?.trim() || '';

  if (!verifyApprovalToken(emailId, expires, token)) {
    return NextResponse.json(
      { error: 'This approval link is invalid or has expired.' },
      { status: 403 }
    );
  }
  if (!reply || reply.length > 10_000) {
    return NextResponse.json(
      { error: 'Reply text is required and must be under 10,000 characters.' },
      { status: 400 }
    );
  }

  const email = await loadReceivedEmail(emailId);
  const config = requireInboxConfig();
  const recipient = email.reply_to?.[0] || email.from;
  const subject = /^re:/i.test(email.subject)
    ? email.subject
    : `Re: ${email.subject || '(no subject)'}`;
  const { error } = await createResendClient().emails.send(
    {
      from: config.fromEmail,
      to: recipient,
      subject,
      text: reply,
      headers: {
        'In-Reply-To': email.message_id,
        References: email.message_id,
      },
    },
    {
      // One approved public reply per inbound message during the token window.
      idempotencyKey: `inbox-reply/${crypto.createHash('sha256').update(emailId).digest('hex')}`,
    }
  );

  if (error) {
    return NextResponse.json(
      { error: `The reply was not sent: ${error.message}` },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
