import type { InboxTriage } from './inbox-core';

export const inboxStates = [
  'received',
  'triaged',
  'owner_alerted',
  'owner_approved',
  'sending',
  'sent',
  'failed',
] as const;

export type InboxState = (typeof inboxStates)[number];

export interface QuarantinedAttachment {
  id: string;
  filename: string;
  contentType: string;
  size: number | null;
  status: 'quarantined';
}

export interface InboxRecord {
  id: string;
  emailId: string;
  webhookEventId: string;
  state: InboxState;
  createdAt: string;
  updatedAt: string;
  sender: string;
  recipient: string;
  subject: string;
  messageId: string;
  originalText: string;
  attachments: QuarantinedAttachment[];
  triage?: InboxTriage;
  initialDraft?: string;
  initialDraftHash?: string;
  approvalNonce?: string;
  approvalExpires?: number;
  approvalUsedAt?: string;
  approvedDraft?: string;
  approvedDraftHash?: string;
  sendAttemptedAt?: string;
  providerMessageId?: string;
  failureCode?: string;
  alertProviderMessageId?: string;
}

export type InboxRecordPatch = Partial<
  Omit<InboxRecord, 'id' | 'emailId' | 'createdAt' | 'state'>
>;

export interface InboxStore {
  get(recordId: string): Promise<InboxRecord | null>;
  create(record: InboxRecord): Promise<InboxRecord>;
  claimWebhookEvent(
    eventId: string,
    payloadHash: string,
    recordId: string
  ): Promise<'new' | 'replay'>;
  transition(
    recordId: string,
    expected: InboxState,
    next: InboxState,
    patch?: InboxRecordPatch
  ): Promise<InboxRecord | null>;
}

const RECORD_TTL_SECONDS = 7 * 24 * 60 * 60;

function assertRedisResult(result: unknown) {
  if (
    !result ||
    typeof result !== 'object' ||
    !('result' in result) ||
    'error' in result
  ) {
    throw new Error('inbox_store_unavailable');
  }
  return (result as { result: unknown }).result;
}

export class UpstashInboxStore implements InboxStore {
  constructor(
    private readonly url: string,
    private readonly token: string
  ) {}

  private async command(command: Array<string | number>) {
    const response = await fetch(this.url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
      cache: 'no-store',
    });
    if (!response.ok) throw new Error('inbox_store_unavailable');
    return assertRedisResult(await response.json());
  }

  private recordKey(recordId: string) {
    return `trends:inbox:record:${recordId}`;
  }

  async get(recordId: string) {
    const value = await this.command(['GET', this.recordKey(recordId)]);
    if (typeof value !== 'string') return null;
    return JSON.parse(value) as InboxRecord;
  }

  async create(record: InboxRecord) {
    const result = await this.command([
      'SET',
      this.recordKey(record.id),
      JSON.stringify(record),
      'NX',
      'EX',
      RECORD_TTL_SECONDS,
    ]);
    if (result === 'OK') return record;
    const existing = await this.get(record.id);
    if (!existing) throw new Error('inbox_store_create_failed');
    return existing;
  }

  async claimWebhookEvent(
    eventId: string,
    payloadHash: string,
    recordId: string
  ) {
    const key = `trends:inbox:event:${eventId}`;
    const value = `${payloadHash}:${recordId}`;
    const result = await this.command([
      'SET',
      key,
      value,
      'NX',
      'EX',
      RECORD_TTL_SECONDS,
    ]);
    if (result === 'OK') return 'new';
    const existing = await this.command(['GET', key]);
    if (existing !== value) throw new Error('webhook_replay_mismatch');
    return 'replay';
  }

  async transition(
    recordId: string,
    expected: InboxState,
    next: InboxState,
    patch: InboxRecordPatch = {}
  ) {
    const key = this.recordKey(recordId);
    const script = [
      "local raw = redis.call('GET', KEYS[1])",
      'if not raw then return nil end',
      'local current = cjson.decode(raw)',
      'if current.state ~= ARGV[1] then return nil end',
      'local patch = cjson.decode(ARGV[3])',
      'for key,value in pairs(patch) do current[key] = value end',
      'current.state = ARGV[2]',
      'current.updatedAt = ARGV[4]',
      'local updated = cjson.encode(current)',
      "redis.call('SET', KEYS[1], updated, 'EX', ARGV[5])",
      'return updated',
    ].join('\n');
    const now = new Date().toISOString();
    const result = await this.command([
      'EVAL',
      script,
      1,
      key,
      expected,
      next,
      JSON.stringify(patch),
      now,
      RECORD_TTL_SECONDS,
    ]);
    if (typeof result !== 'string') return null;
    return JSON.parse(result) as InboxRecord;
  }
}

export class MemoryInboxStore implements InboxStore {
  private readonly records = new Map<string, InboxRecord>();
  private readonly events = new Map<string, string>();

  async get(recordId: string) {
    return this.records.get(recordId) || null;
  }

  async create(record: InboxRecord) {
    const existing = this.records.get(record.id);
    if (existing) return existing;
    this.records.set(record.id, structuredClone(record));
    return structuredClone(record);
  }

  async claimWebhookEvent(
    eventId: string,
    payloadHash: string,
    recordId: string
  ) {
    const value = `${payloadHash}:${recordId}`;
    const existing = this.events.get(eventId);
    if (!existing) {
      this.events.set(eventId, value);
      return 'new' as const;
    }
    if (existing !== value) throw new Error('webhook_replay_mismatch');
    return 'replay' as const;
  }

  async transition(
    recordId: string,
    expected: InboxState,
    next: InboxState,
    patch: InboxRecordPatch = {}
  ) {
    const current = this.records.get(recordId);
    if (!current) return null;
    if (current.state !== expected) return null;
    const updated: InboxRecord = {
      ...current,
      ...structuredClone(patch),
      state: next,
      updatedAt: new Date().toISOString(),
    };
    this.records.set(recordId, updated);
    return structuredClone(updated);
  }
}
