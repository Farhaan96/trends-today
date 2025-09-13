import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Trends Today',
  description: 'Privacy Policy for Trends Today - Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

        <p className="text-gray-600 mb-8">Last updated: January 2025</p>

        <div className="prose prose-lg max-w-none text-gray-900">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
            <p className="text-gray-700 mb-4">
              Trends Today collects information to provide better services to our users. The types
              of information we collect include:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Information you provide:</strong> Email addresses when you subscribe to our newsletter</li>
              <li><strong>Automatically collected information:</strong> IP addresses, browser types, device information, and pages visited</li>
              <li><strong>Cookies and similar technologies:</strong> To improve user experience and analyze site traffic</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">We use the collected information to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Send newsletters and updates (only if you've subscribed)</li>
              <li>Improve our website and content</li>
              <li>Analyze usage patterns and trends</li>
              <li>Detect and prevent fraud or abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">3. Information Sharing</h2>
            <p className="text-gray-700 mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may
              share information only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>With your explicit consent</li>
              <li>To comply with legal obligations or court orders</li>
              <li>To protect our rights, property, or safety</li>
              <li>With service providers who assist in operating our website (under strict confidentiality agreements)</li>
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
              You can control cookies through your browser settings. Note that disabling cookies
              may affect the functionality of our website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">5. Third-Party Services</h2>
            <p className="text-gray-700 mb-4">
              Our website may contain links to third-party websites and services. We use the
              following third-party services:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Google Analytics:</strong> For website traffic analysis</li>
              <li><strong>Affiliate Networks:</strong> Amazon Associates and others for product links</li>
              <li><strong>Content Delivery Networks:</strong> For faster content delivery</li>
            </ul>
            <p className="text-gray-700 mt-4">
              These services have their own privacy policies, and we encourage you to review them.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">6. Data Security</h2>
            <p className="text-gray-700">
              We implement appropriate technical and organizational measures to protect your
              personal information against unauthorized access, alteration, disclosure, or
              destruction. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">7. Your Rights</h2>
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
            <h2 className="text-2xl font-bold mb-4">8. Children's Privacy</h2>
            <p className="text-gray-700">
              Our website is not intended for children under 13 years of age. We do not knowingly
              collect personal information from children under 13. If you believe we have collected
              information from a child under 13, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">9. Changes to This Policy</h2>
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time. We will notify you of any
              changes by posting the new Privacy Policy on this page and updating the "Last updated"
              date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">10. Contact Us</h2>
            <p className="text-gray-700">
              If you have questions about this Privacy Policy or our data practices, please contact
              us at:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <p className="text-gray-700">
                <strong>Email:</strong> privacy@trendstoday.ca<br />
                <strong>Website:</strong> <a href="/contact" className="text-blue-600 hover:text-blue-800 underline">Contact Form</a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}