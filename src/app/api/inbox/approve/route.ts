import { NextRequest, NextResponse } from 'next/server';
import {
  InboxRequestError,
  MAX_APPROVAL_BODY_BYTES,
  byteLength,
} from '@/lib/inbox-core';
import {
  approveAndSend,
  createInboxStore,
  createResendClient,
  requireInboxConfig,
} from '@/lib/inbox-service';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (
    !Number.isFinite(contentLength) ||
    contentLength < 0 ||
    contentLength > MAX_APPROVAL_BODY_BYTES
  ) {
    return NextResponse.json(
      { error: 'approval_body_too_large' },
      { status: 413 }
    );
  }

  let config;
  try {
    config = requireInboxConfig();
  } catch {
    return NextResponse.json(
      { error: 'inbox_not_configured' },
      { status: 503 }
    );
  }

  const rawBody = await request.text();
  if (byteLength(rawBody) > MAX_APPROVAL_BODY_BYTES) {
    return NextResponse.json(
      { error: 'approval_body_too_large' },
      { status: 413 }
    );
  }

  let input: unknown;
  try {
    input = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { error: 'approval_payload_malformed' },
      { status: 400 }
    );
  }

  const resend = createResendClient(config);
  try {
    await approveAndSend({
      rawInput: input,
      store: createInboxStore(config),
      config,
      send: async ({ idempotencyKey, ...message }) =>
        resend.emails.send(message, { idempotencyKey }),
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof InboxRequestError) {
      return NextResponse.json({ error: error.code }, { status: error.status });
    }
    return NextResponse.json(
      { error: 'approval_processing_failed' },
      { status: 503 }
    );
  }
}
