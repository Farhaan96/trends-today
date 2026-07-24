'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const inboxReady = process.env.NEXT_PUBLIC_INBOX_READY === 'true';
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    partnershipInterest: '',
    message: '',
  });

  const [draftOpened, setDraftOpened] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inboxReady) return;
    const subjectLabels: Record<string, string> = {
      general: 'General inquiry',
      feedback: 'Reader feedback',
      partnership: 'Advertising or sponsorship inquiry',
      press: 'Press or PR inquiry',
      technical: 'Technical issue',
      other: 'Other inquiry',
    };
    const emailSubject = `[Trends Today] ${subjectLabels[formData.subject] || 'Inquiry'}`;
    const emailBody = [
      `Name: ${formData.name}`,
      `Reply email: ${formData.email}`,
      formData.partnershipInterest
        ? `Partnership interest: ${formData.partnershipInterest}`
        : null,
      '',
      formData.message,
    ]
      .filter((line): line is string => line !== null)
      .join('\n');

    window.location.href = `mailto:hello@trendstoday.ca?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    setDraftOpened(true);
  };

  if (draftOpened) {
    return (
      <div className="contact-page min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center py-12">
            <div className="text-6xl mb-4" aria-hidden="true">
              ✓
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Your email draft is ready
            </h1>
            <p className="text-gray-700 text-lg mb-8">
              Nothing has been sent yet. Review the draft in your email app,
              then send it when you are ready.
            </p>
            <button
              onClick={() => {
                setDraftOpened(false);
                setFormData({
                  name: '',
                  email: '',
                  subject: '',
                  partnershipInterest: '',
                  message: '',
                });
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to the form
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-page min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Contact Us</h1>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
            <p className="text-gray-700 mb-6">
              Have a question, correction, story tip, or advertising inquiry?
              Write to our monitored publication inbox. An inbox agent organizes
              messages and drafts replies, while Moe approves anything sent in
              our name.
            </p>

            <div className="space-y-4">
              <div className="flex items-start">
                <span className="text-sm font-bold mr-4" aria-hidden="true">
                  EMAIL
                </span>
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <p className="text-gray-600">
                    {inboxReady
                      ? 'hello@trendstoday.ca'
                      : 'Inbox activation in progress'}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <span className="text-sm font-bold mr-4" aria-hidden="true">
                  REVIEW
                </span>
                <div>
                  <h3 className="font-semibold">Human approval</h3>
                  <p className="text-gray-600">
                    AI helps triage and draft. Moe approves public replies.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">
                Advertising, sponsorships, and PR
              </h3>
              <p className="text-gray-700 text-sm">
                Tell us the audience or Lower Mainland topic you want to reach.
                We keep editorial coverage separate from paid partnerships and
                clearly label commercial work.
              </p>
              {inboxReady ? (
                <a
                  href="mailto:hello@trendstoday.ca?subject=%5BTrends%20Today%5D%20Advertising%20or%20sponsorship%20inquiry"
                  className="mt-3 inline-block text-sm font-semibold text-blue-700 underline"
                >
                  Email hello@trendstoday.ca
                </a>
              ) : (
                <p className="mt-3 text-sm font-semibold text-amber-800">
                  We will publish the address after delivery and owner alerts
                  pass a live test.
                </p>
              )}
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="feedback">Feedback</option>
                  <option value="partnership">
                    Advertising or Sponsorship
                  </option>
                  <option value="press">Press/PR</option>
                  <option value="technical">Technical Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {formData.subject === 'partnership' && (
                <div>
                  <label
                    htmlFor="partnershipInterest"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Partnership interest
                  </label>
                  <select
                    id="partnershipInterest"
                    name="partnershipInterest"
                    value={formData.partnershipInterest}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select an area</option>
                    <option value="Supported editorial series">
                      Supported editorial series
                    </option>
                    <option value="Clearly labelled branded content">
                      Clearly labelled branded content
                    </option>
                    <option value="Display advertising">
                      Display advertising
                    </option>
                    <option value="Local event or guide sponsorship">
                      Local event or guide sponsorship
                    </option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              )}

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us what's on your mind..."
                />
              </div>

              <button
                type="submit"
                disabled={!inboxReady}
                className="w-full bg-gradient-to-r from-blue-500 via-purple-600 to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-[1.02]"
              >
                {inboxReady
                  ? 'Open Email Draft'
                  : 'Inbox activation in progress'}
              </button>
            </form>

            <p className="text-xs text-gray-500 mt-4">
              * Required fields. When the inbox is active, this form opens your
              email app and does not transmit or store your message on this
              website. See our{' '}
              <Link
                href="/privacy"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
