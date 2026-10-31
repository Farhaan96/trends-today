import crypto from 'node:crypto';
import OpenAI from 'openai';
import { Resend } from 'resend';
import {
  APPROVAL_TTL_SECONDS,
  ApprovalBinding,
  InboxRequestError,
  TRIAGE_INSTRUCTIONS,
  approvalRequestSchema,
  buildTriageInput,
  createApprovalToken,
  emailToPlainText,
  extractAddress,
  inboxTriageSchema,
  sanitizeHeader,
  sha256,
  verifyApprovalToken,
} from './inbox-core';
import {
  InboxRecord,
  InboxStore,
  QuarantinedAttachment,
  UpstashInboxStore,
} from './inbox-store';

export interface InboxConfig {
  resendApiKey: string;
  webhookSecret: string;
  approvalSecret: string;
  ownerEmail: string;
  fromEmail: string;
  siteUrl: string;
  openAiApiKey: string;
  model: string;
  redisUrl: string;
  redisToken: string;
}

const requiredConfig = [
  'RESEND_API_KEY',
  'RESEND_WEBHOOK_SECRET',
  'TRENDS_INBOX_APPROVAL_SECRET',
  'TRENDS_OWNER_ALERT_EMAIL',
  'TRENDS_INBOX_FROM_EMAIL',
  'NEXT_PUBLIC_SITE_URL',
  'OPENAI_API_KEY',
  'TRENDS_INBOX_MODEL',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
] as const;

export function inboxReadiness(env: NodeJS.ProcessEnv = process.env) {
  const missing = requiredConfig.filter((key) => !env[key]?.trim());
  return {
    ready:
      missing.length === 0 &&
      env.TRENDS_INBOX_PROVIDER_READY === 'true' &&
      env.TRENDS_INBOX_DNS_READY === 'true' &&
      env.TRENDS_INBOX_RELEASE_TEST_PASSED === 'true' &&
      env.NEXT_PUBLIC_INBOX_READY === 'true',
    configured: missing.length === 0,
    providerReady: env.TRENDS_INBOX_PROVIDER_READY === 'true',
    dnsReady: env.TRENDS_INBOX_DNS_READY === 'true',
    releaseTestPassed: env.TRENDS_INBOX_RELEASE_TEST_PASSED === 'true',
    publicRequested: env.NEXT_PUBLIC_INBOX_READY === 'true',
  };
}

export function requireInboxConfig(
  env: NodeJS.ProcessEnv = process.env
): InboxConfig {
  const missing = requiredConfig.filter((key) => !env[key]?.trim());
  if (
    missing.length ||
    env.TRENDS_INBOX_PROVIDER_READY !== 'true' ||
    env.TRENDS_INBOX_DNS_READY !== 'true'
  ) {
    throw new Error('inbox_not_configured');
  }
  return {
    resendApiKey: env.RESEND_API_KEY!,
    webhookSecret: env.RESEND_WEBHOOK_SECRET!,
    approvalSecret: env.TRENDS_INBOX_APPROVAL_SECRET!,
    ownerEmail: extractAddress(env.TRENDS_OWNER_ALERT_EMAIL!),
    fromEmail: sanitizeHeader(env.TRENDS_INBOX_FROM_EMAIL!, 500),
    siteUrl: new URL(env.NEXT_PUBLIC_SITE_URL!).origin,
    openAiApiKey: env.OPENAI_API_KEY!,
    model: env.TRENDS_INBOX_MODEL!,
    redisUrl: env.UPSTASH_REDIS_REST_URL!,
    redisToken: env.UPSTASH_REDIS_REST_TOKEN!,
  };
}

export function createInboxStore(config = requireInboxConfig()) {
  return new UpstashInboxStore(config.redisUrl, config.redisToken);
}

export function createResendClient(config = requireInboxConfig()) {
  return new Resend(config.resendApiKey);
}

export interface ReceivedEmailInput {
  id: string;
  from: string;
  replyTo?: string[];
  to: string[];
  subject?: string | null;
  messageId?: string | null;
  text?: string | null;
  html?: string | null;
  headers?: Record<string, string> | null;
  attachments?: Array<{
    id?: string | null;
    filename?: string | null;
    contentType?: string | null;
    size?: number | null;
  }>;
}

export function normalizeReceivedEmail(
  email: ReceivedEmailInput,
  eventId: string
): InboxRecord {
  const sender = extractAddress(email.from);
  const recipient = extractAddress(email.replyTo?.[0] || email.from);
  const messageId =
    sanitizeHeader(email.messageId, 500) || `resend-email-${email.id}`;
  const now = new Date().toISOString();
  const id = sha256(email.id);
  const attachments: QuarantinedAttachment[] = (email.attachments || []).map(
    (attachment, index) => ({
      id: sanitizeHeader(attachment.id, 200) || `attachment-${index + 1}`,
      filename:
        sanitizeHeader(attachment.filename, 200) || `attachment-${index + 1}`,
      contentType:
        sanitizeHeader(attachment.contentType, 100) ||
        'application/octet-stream',
      size:
        typeof attachment.size === 'number' && attachment.size >= 0
          ? attachment.size
          : null,
      status: 'quarantined',
    })
  );

  return {
    id,
    emailId: sanitizeHeader(email.id, 200),
    webhookEventId: sanitizeHeader(eventId, 200),
    state: 'received',
    createdAt: now,
    updatedAt: now,
    sender,
    recipient,
    subject: sanitizeHeader(email.subject, 500) || '(no subject)',
    messageId,
    originalText: emailToPlainText(email),
    attachments,
  };
}

export function approvalBinding(record: InboxRecord): ApprovalBinding {
  if (
    !record.initialDraftHash ||
    !record.approvalNonce ||
    !record.approvalExpires
  ) {
    throw new Error('approval_binding_missing');
  }
  return {
    recordId: record.id,
    sender: record.sender,
    recipient: record.recipient,
    messageId: record.messageId,
    initialDraftHash: record.initialDraftHash,
    nonce: record.approvalNonce,
    expires: record.approvalExpires,
  };
}

export function createReviewUrl(record: InboxRecord, config: InboxConfig) {
  const binding = approvalBinding(record);
  const url = new URL('/inbox/review', config.siteUrl);
  url.searchParams.set('record', record.id);
  url.searchParams.set('expires', String(binding.expires));
  url.searchParams.set(
    'token',
    createApprovalToken(binding, config.approvalSecret)
  );
  return url.toString();
}

export async function triageRecord(
  record: InboxRecord,
  config: InboxConfig,
  client = new OpenAI({ apiKey: config.openAiApiKey })
) {
  const response = await client.responses.create({
    model: config.model,
    store: false,
    reasoning: { effort: 'low' },
    max_output_tokens: 900,
    instructions: TRIAGE_INSTRUCTIONS,
    input: buildTriageInput({
      sender: record.sender,
      recipient: record.recipient,
      subject: record.subject,
      attachmentCount: record.attachments.length,
      plainText: record.originalText,
    }),
    text: {
      format: {
        type: 'json_schema',
        name: 'trends_today_inbox_triage',
        strict: true,
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            category: {
              type: 'string',
              enum: [
                'advertising',
                'correction',
                'reader',
                'source-or-tip',
                'press',
                'legal-or-safety',
                'technical',
                'spam',
                'other',
              ],
            },
            urgency: {
              type: 'string',
              enum: ['low', 'normal', 'high', 'urgent'],
            },
            ownerNeeded: { type: 'boolean' },
            reason: { type: 'string' },
            summary: { type: 'string' },
            suggestedReply: { type: 'string' },
          },
          required: [
            'category',
            'urgency',
            'ownerNeeded',
            'reason',
            'summary',
            'suggestedReply',
          ],
        },
      },
    },
  });
  return inboxTriageSchema.parse(JSON.parse(response.output_text));
}

export async function moveToTriaged({
  record,
  store,
  triage,
  nowSeconds = Math.floor(Date.now() / 1000),
}: {
  record: InboxRecord;
  store: InboxStore;
  triage: Awaited<ReturnType<typeof triageRecord>>;
  nowSeconds?: number;
}) {
  const initialDraft = triage.suggestedReply;
  return store.transition(record.id, 'received', 'triaged', {
    triage,
    initialDraft,
    initialDraftHash: sha256(initialDraft),
    approvalNonce: crypto.randomBytes(24).toString('base64url'),
    approvalExpires: nowSeconds + APPROVAL_TTL_SECONDS,
  });
}

export async function approveAndSend({
  rawInput,
  store,
  config,
  send,
  nowSeconds = Math.floor(Date.now() / 1000),
}: {
  rawInput: unknown;
  store: InboxStore;
  config: Pick<InboxConfig, 'approvalSecret' | 'fromEmail'>;
  send: (input: {
    from: string;
    to: string;
    subject: string;
    text: string;
    headers: Record<string, string>;
    idempotencyKey: string;
  }) => Promise<{ data?: { id?: string } | null; error?: unknown }>;
  nowSeconds?: number;
}) {
  const input = approvalRequestSchema.parse(rawInput);
  let record = await store.get(input.recordId);
  if (!record || record.state !== 'owner_alerted') {
    throw new InboxRequestError('approval_already_used_or_unavailable', 409);
  }
  if (input.expires !== record.approvalExpires) {
    throw new InboxRequestError('approval_invalid_or_expired', 403);
  }
  if (
    !verifyApprovalToken({
      binding: approvalBinding(record),
      approvalSecret: config.approvalSecret,
      token: input.token,
      nowSeconds,
    })
  ) {
    throw new InboxRequestError('approval_invalid_or_expired', 403);
  }

  const approvedDraftHash = sha256(input.reply);
  record = await store.transition(
    record.id,
    'owner_alerted',
    'owner_approved',
    {
      approvalUsedAt: new Date(nowSeconds * 1000).toISOString(),
      approvedDraft: input.reply,
      approvedDraftHash,
    }
  );
  if (!record || record.state !== 'owner_approved') {
    throw new InboxRequestError('approval_already_used_or_unavailable', 409);
  }

  record = await store.transition(record.id, 'owner_approved', 'sending', {
    sendAttemptedAt: new Date(nowSeconds * 1000).toISOString(),
  });
  if (!record || record.state !== 'sending') {
    throw new InboxRequestError('send_attempt_already_consumed', 409);
  }

  const subject = /^re:/i.test(record.subject)
    ? record.subject
    : `Re: ${record.subject}`;
  const idempotencyKey = `inbox-reply/${sha256(`${record.id}.${approvedDraftHash}`)}`;

  let result;
  try {
    result = await send({
      from: config.fromEmail,
      to: record.recipient,
      subject,
      text: input.reply,
      headers: {
        'In-Reply-To': record.messageId,
        References: record.messageId,
      },
      idempotencyKey,
    });
  } catch {
    await store.transition(record.id, 'sending', 'failed', {
      failureCode: 'provider_exception',
    });
    throw new InboxRequestError('reply_send_failed', 502);
  }

  if (result.error || !result.data?.id) {
    await store.transition(record.id, 'sending', 'failed', {
      failureCode: 'provider_rejected',
    });
    throw new InboxRequestError('reply_send_failed', 502);
  }

  let sent;
  try {
    sent = await store.transition(record.id, 'sending', 'sent', {
      providerMessageId: sanitizeHeader(result.data.id, 200),
    });
  } catch {
    throw new InboxRequestError('reply_outcome_persistence_failed', 503);
  }
  if (!sent || sent.state !== 'sent') {
    throw new InboxRequestError('reply_outcome_persistence_failed', 503);
  }
  return sent;
}
