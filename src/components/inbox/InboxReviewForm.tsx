'use client';

import { useState } from 'react';

interface InboxReviewFormProps {
  emailId: string;
  expires: number;
  token: string;
  sender: string;
  subject: string;
  originalMessage: string;
  initialReply: string;
  category: string;
  urgency: string;
  summary: string;
}

export default function InboxReviewForm({
  emailId,
  expires,
  token,
  sender,
  subject,
  originalMessage,
  initialReply,
  category,
  urgency,
  summary,
}: InboxReviewFormProps) {
  const [reply, setReply] = useState(initialReply);
  const [state, setState] = useState<'editing' | 'sending' | 'sent' | 'error'>(
    'editing'
  );
  const [error, setError] = useState('');

  const sendReply = async () => {
    if (
      !window.confirm(
        'Send this exact reply to the original sender as hello@trendstoday.ca?'
      )
    ) {
      return;
    }
    setState('sending');
    setError('');
    const response = await fetch('/api/inbox/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailId, expires, token, reply }),
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
    <main className="inbox-review">
      <div className="inbox-review__masthead">
        <p className="section-kicker">Private owner review</p>
        <h1>Approve a Trends Today reply</h1>
        <p>
          The sender has not received an automated response. Edit the draft,
          then approve the exact text only when it is ready.
        </p>
      </div>

      <section className="inbox-review__summary">
        <div>
          <span>Category</span>
          <strong>{category}</strong>
        </div>
        <div>
          <span>Urgency</span>
          <strong>{urgency}</strong>
        </div>
        <div>
          <span>From</span>
          <strong>{sender}</strong>
        </div>
      </section>

      <section className="inbox-review__panel">
        <p className="section-kicker">Agent summary</p>
        <h2>{subject || '(No subject)'}</h2>
        <p>{summary}</p>
        <details>
          <summary>Read the original message</summary>
          <pre>{originalMessage}</pre>
        </details>
      </section>

      <section className="inbox-review__panel">
        <label htmlFor="approved-reply">Reply from Moe</label>
        <textarea
          id="approved-reply"
          value={reply}
          onChange={(event) => {
            setReply(event.target.value);
            setState('editing');
          }}
          rows={14}
          disabled={state === 'sending' || state === 'sent'}
        />
        {error && <p className="inbox-review__error">{error}</p>}
        {state === 'sent' ? (
          <p className="inbox-review__success">
            Sent. Duplicate clicks cannot send this message again.
          </p>
        ) : (
          <button
            type="button"
            onClick={sendReply}
            disabled={state === 'sending' || !reply.trim()}
          >
            {state === 'sending' ? 'Sending…' : 'Approve and send reply'}
          </button>
        )}
      </section>
    </main>
  );
}
