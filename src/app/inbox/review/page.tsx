import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import InboxReviewForm from '@/components/inbox/InboxReviewForm';
import {
  emailToPlainText,
  loadReceivedEmail,
  triageEmail,
  verifyApprovalToken,
} from '@/lib/inbox-agent';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Private inbox review | Trends Today',
  robots: { index: false, follow: false },
};

export default async function InboxReviewPage({
  searchParams,
}: {
  searchParams: Promise<{
    email?: string;
    expires?: string;
    token?: string;
  }>;
}) {
  const values = await searchParams;
  const emailId = values.email || '';
  const expires = Number(values.expires);
  const token = values.token || '';
  if (!verifyApprovalToken(emailId, expires, token)) {
    notFound();
  }

  const email = await loadReceivedEmail(emailId);
  const triage = await triageEmail(email);

  return (
    <InboxReviewForm
      emailId={emailId}
      expires={expires}
      token={token}
      sender={email.from}
      subject={email.subject}
      originalMessage={emailToPlainText(email)}
      initialReply={triage.suggestedReply}
      category={triage.category}
      urgency={triage.urgency}
      summary={triage.summary}
    />
  );
}
