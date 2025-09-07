import { Metadata } from 'next';
import AffiliateDisclosure from '@/components/monetization/AffiliateDisclosure';
import { ExclamationTriangleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Affiliate Disclosure - Trends Today Transparency Policy',
  description: 'Complete transparency about our affiliate partnerships, monetization methods, and editorial independence. Learn how we maintain unbiased reviews.',
  keywords: ['affiliate disclosure', 'transparency', 'editorial independence', 'monetization policy'],
};

export default function AffiliateDisclosurePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <ShieldCheckIcon className="w-16 h-16 text-blue-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Affiliate Disclosure & Transparency Policy
        </h1>
        <p className="text-xl text-gray-800 max-w-3xl mx-auto">
          At Trends Today, we believe in complete transparency about how we fund our independent 
          reviews and maintain editorial integrity. Here's everything you need to know about our 
          monetization and affiliate partnerships.
        </p>
      </div>

      {/* Main Disclosure */}
      <AffiliateDisclosure variant="full" className="mb-12" />

      {/* Detailed Sections */}
      <div className="space-y-12">
        {/* Our Commitment */}
        <section className="bg-white border border-gray-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <ShieldCheckIcon className="w-6 h-6 text-blue-600 mr-2" />
            Our Commitment to Editorial Independence
          </h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed mb-4">
              Editorial independence is the foundation of everything we do at Trends Today. 
              Our review process, recommendations, and editorial decisions are never influenced 
              by affiliate partnerships, advertising relationships, or manufacturer incentives.
            </p>
          </div>
        </section>

        {/* Contact & Questions */}
        <section className="bg-blue-50 border border-blue-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">
            📧 Questions or Concerns?
          </h2>
          <div className="text-blue-800">
            <p className="mb-4">
              We're committed to transparency and welcome any questions about our 
              affiliate partnerships, monetization methods, or editorial processes.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Editorial Questions</h3>
                <p className="text-sm mb-2">
                  Questions about our reviews, testing methodology, or editorial decisions:
                </p>
                <a href="mailto:editorial@trendstoday.ca" 
                   className="text-blue-600 hover:text-blue-700 underline font-medium">
                  editorial@trendstoday.ca
                </a>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Business Questions</h3>
                <p className="text-sm mb-2">
                  Questions about affiliate partnerships, advertising, or business matters:
                </p>
                <a href="mailto:business@trendstoday.ca" 
                   className="text-blue-600 hover:text-blue-700 underline font-medium">
                  business@trendstoday.ca
                </a>
              </div>
            </div>
            <p className="text-sm mt-4 text-blue-700">
              We typically respond to all inquiries within 48 hours.
            </p>
          </div>
        </section>
      </div>

      {/* Last Updated */}
      <div className="mt-12 text-center text-sm text-gray-700">
        <p>
          This disclosure policy was last updated on {new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long', 
            day: 'numeric'
          })}.
        </p>
      </div>
    </div>
  );
}