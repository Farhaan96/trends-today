import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Trends Today',
  description:
    'Privacy Policy for Trends Today - Learn how we collect, use, and protect your personal information.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Privacy Policy
        </h1>

        <p className="text-gray-600 mb-8">Last updated: July 23, 2026</p>

        <div className="prose prose-lg max-w-none text-gray-900">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">
              1. Information We Collect
            </h2>
            <p className="text-gray-700 mb-4">
              Trends Today collects information to provide better services to
              our users. The types of information we collect include:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>
                <strong>Information you provide:</strong> Your name, email
                address, message, and any attachments when you contact us, plus
                your email address if you subscribe
              </li>
              <li>
                <strong>Automatically collected information:</strong> IP
                addresses, browser types, device information, and pages visited
              </li>
              <li>
                <strong>Cookies and similar technologies:</strong> To improve
                user experience and analyze site traffic
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">
              2. How We Use Your Information
            </h2>
            <p className="text-gray-700 mb-4">
              We use the collected information to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Send newsletters and updates (only if you've subscribed)</li>
              <li>Improve our website and content</li>
              <li>Analyze usage patterns and trends</li>
              <li>Detect and prevent fraud or abuse</li>
              <li>
                Triage publication email, draft a proposed response, and alert
                the publisher when a message needs review
              </li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">3. Information Sharing</h2>
            <p className="text-gray-700 mb-4">
              We do not sell, trade, or rent your personal information to third
              parties. We may share information only in the following
              circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>With your explicit consent</li>
              <li>To comply with legal obligations or court orders</li>
              <li>To protect our rights, property, or safety</li>
              <li>
                With service providers who assist in operating our website and
                publication inbox
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">4. Cookies and Tracking</h2>
            <p className="text-gray-700 mb-4">
              We use cookies and similar tracking technologies to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Remember your preferences</li>
              <li>Understand how you use our site</li>
              <li>Provide personalized content</li>
              <li>Measure advertising effectiveness</li>
            </ul>
            <p className="text-gray-700 mt-4">
              You can control cookies through your browser settings. Note that
              disabling cookies may affect the functionality of our website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">5. Third-Party Services</h2>
            <p className="text-gray-700 mb-4">
              Our website may contain links to third-party websites and
              services. We use the following third-party services:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>
                <strong>Vercel:</strong> Website hosting and site analytics
              </li>
              <li>
                <strong>Resend:</strong> Sending, receiving, and routing
                publication email
              </li>
              <li>
                <strong>OpenAI:</strong> Classifying incoming messages and
                drafting proposed replies for human review
              </li>
              <li>
                <strong>Twilio:</strong> Optional urgent text-message alerts to
                the publisher
              </li>
            </ul>
            <p className="text-gray-700 mt-4">
              These services have their own privacy policies, and we encourage
              you to review them.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">
              6. AI-Assisted Inbox Review
            </h2>
            <p className="text-gray-700 mb-4">
              When you email Trends Today, the message may be processed by an AI
              service to identify its topic and urgency, summarize it, and
              prepare a proposed reply. The system is configured not to store
              model responses for later retrieval through the model API.
            </p>
            <p className="text-gray-700">
              AI does not make publication, correction, advertising, legal, or
              financial decisions for Trends Today. Moe reviews messages that
              need judgment and must approve the exact wording before a reply is
              sent.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">7. Data Security</h2>
            <p className="text-gray-700">
              We implement appropriate technical and organizational measures to
              protect your personal information against unauthorized access,
              alteration, disclosure, or destruction. However, no method of
              transmission over the internet is 100% secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">8. Your Rights</h2>
            <p className="text-gray-700 mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Object to processing of your information</li>
              <li>Withdraw consent at any time</li>
              <li>Unsubscribe from marketing communications</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">
              9. Children&apos;s Privacy
            </h2>
            <p className="text-gray-700">
              Our website is not intended for children under 13 years of age. We
              do not knowingly collect personal information from children under
              13. If you believe we have collected information from a child
              under 13, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">
              10. Changes to This Policy
            </h2>
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new Privacy Policy on
              this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">11. Contact Us</h2>
            <p className="text-gray-700">
              If you have questions about this Privacy Policy or our data
              practices, please contact us at:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <p className="text-gray-700">
                <strong>Website:</strong>{' '}
                <a
                  href="/contact"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Contact Form
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
