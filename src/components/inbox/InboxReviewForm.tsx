'use client';

import { useState } from 'react';

interface InboxReviewFormProps {
  recordId: string;
  expires: number;
  token: string;
  sender: string;
  recipient: string;
  subject: string;
  originalMessage: string;
  initialReply: string;
  category: string;
  urgency: string;
  summary: string;
  quarantinedAttachmentCount: number;
}

export default function InboxReviewForm({
  recordId,
  expires,
  token,
  sender,
  recipient,
  subject,
  originalMessage,
  initialReply,
  category,
  urgency,
  summary,
  quarantinedAttachmentCount,
}: InboxReviewFormProps) {
  const [reply, setReply] = useState(initialReply);
  const [state, setState] = useState<'editing' | 'sending' | 'sent' | 'error'>(
    'editing'
  );
  const [error, setError] = useState('');

  const sendReply = async () => {
    if (
      !window.confirm(
        `Send this exact reply to the immutable recipient ${recipient}? This approval link is single-use and there are no automatic retries.`
      )
    ) {
      return;
    }
    setState('sending');
    setError('');
    const response = await fetch('/api/inbox/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recordId, expires, token, reply }),
    });
    const result = (await response.json()) as { ok?: boolean; error?: string };
    if (!response.ok || !result.ok) {
      setError(result.error || 'The reply could not be sent.');
      setState('error');
      return;
    }
    setState('sent');
  };

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-12">
      <header className="border-b border-gray-300 pb-8">
        <p className="text-sm font-bold uppercase tracking-widest text-blue-700">
          Private owner review
        </p>
        <h1 className="mt-3 text-4xl font-bold">Approve a reply</h1>
        <p className="mt-4 text-gray-700">
          AI classified and drafted only. The sender has received no automatic
          reply. Edit the text, then approve this exact draft once.
        </p>
      </header>

      <section className="my-8 grid gap-4 border border-gray-300 p-5 md:grid-cols-2">
        <p>
          <strong>Category:</strong> {category}
        </p>
        <p>
          <strong>Urgency:</strong> {urgency}
        </p>
        <p>
          <strong>Original sender:</strong> {sender}
        </p>
        <p>
          <strong>Immutable recipient:</strong> {recipient}
        </p>
        <p className="md:col-span-2">
          <strong>Quarantined attachments:</strong> {quarantinedAttachmentCount}
          . Attachment contents are unavailable to the AI and cannot direct an
          action.
        </p>
      </section>

      <section className="my-8 border border-gray-300 p-5">
        <h2 className="text-2xl font-bold">{subject}</h2>
        <p className="mt-3 text-gray-700">{summary}</p>
        <details className="mt-5">
          <summary className="cursor-pointer font-semibold">
            Read sanitized original message
          </summary>
          <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap bg-gray-50 p-4 font-sans">
            {originalMessage}
          </pre>
        </details>
      </section>

      <section className="my-8 border border-gray-300 p-5">
        <label className="block font-bold" htmlFor="approved-reply">
          Exact reply from Moe
        </label>
        <textarea
          id="approved-reply"
          className="mt-3 w-full border border-gray-400 p-4"
          value={reply}
          onChange={(event) => {
            setReply(event.target.value);
            setState('editing');
          }}
          rows={14}
          maxLength={10_000}
          disabled={state === 'sending' || state === 'sent'}
        />
        {error && (
          <p className="mt-3 font-semibold text-red-700" role="alert">
            {error}
          </p>
        )}
        {state === 'sent' ? (
          <p className="mt-3 font-bold text-green-700">
            Sent and recorded. This link cannot be reused.
          </p>
        ) : (
          <button
            className="mt-4 bg-blue-700 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-500"
            type="button"
            onClick={sendReply}
            disabled={state === 'sending' || !reply.trim()}
          >
            {state === 'sending'
              ? 'Recording approval and sending once...'
              : 'Approve exact draft and send once'}
          </button>
        )}
      </section>
    </main>
  );
}
