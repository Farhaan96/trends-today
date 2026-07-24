import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import InboxReviewForm from '@/components/inbox/InboxReviewForm';
import { verifyApprovalToken } from '@/lib/inbox-core';
import {
  approvalBinding,
  createInboxStore,
  requireInboxConfig,
} from '@/lib/inbox-service';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Private inbox review | Trends Today',
  robots: { index: false, follow: false },
};

export default async function InboxReviewPage({
  searchParams,
}: {
  searchParams: Promise<{
    record?: string;
    expires?: string;
    token?: string;
  }>;
}) {
  const values = await searchParams;
  const recordId = values.record || '';
  const expires = Number(values.expires);
  const token = values.token || '';

  let config;
  try {
    config = requireInboxConfig();
  } catch {
    notFound();
  }

  const record = await createInboxStore(config).get(recordId);
  if (
    !record ||
    record.state !== 'owner_alerted' ||
    record.approvalExpires !== expires ||
    !verifyApprovalToken({
      binding: approvalBinding(record),
      approvalSecret: config.approvalSecret,
      token,
      nowSeconds: Math.floor(Date.now() / 1000),
    })
  ) {
    notFound();
  }

  return (
    <InboxReviewForm
      recordId={record.id}
      expires={expires}
      token={token}
      sender={record.sender}
      recipient={record.recipient}
      subject={record.subject}
      originalMessage={record.originalText}
      initialReply={record.initialDraft || ''}
      category={record.triage?.category || 'other'}
      urgency={record.triage?.urgency || 'normal'}
      summary={record.triage?.summary || ''}
      quarantinedAttachmentCount={record.attachments.length}
    />
  );
}
