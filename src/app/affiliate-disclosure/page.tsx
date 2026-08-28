import { Metadata } from 'next';
import AffiliateDisclosure from '@/components/monetization/AffiliateDisclosure';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'About Our Reporting - Trends Today',
  description:
    'Learn about how Trends Today covers local news, transit updates, and civic information for the Lower Mainland.',
  alternates: { canonical: '/affiliate-disclosure' },
};

export default function AffiliateDisclosurePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <InformationCircleIcon className="w-16 h-16 text-blue-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          About Our Reporting
        </h1>
        <p className="text-xl text-gray-800 max-w-3xl mx-auto">
          Trends Today is an independent local news publication covering the
          Lower Mainland. Here is how we approach our coverage.
        </p>
      </div>

      {/* Main Disclosure */}
      <AffiliateDisclosure variant="full" className="mb-12" />

      {/* Detailed Sections */}
      <div className="space-y-12">
        {/* Our Focus */}
        <section className="bg-white border border-gray-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <InformationCircleIcon className="w-6 h-6 text-blue-600 mr-2" />
            What We Cover
          </h2>
          <div className="prose prose-slate max-w-none">
            <p className="text-gray-900 leading-relaxed mb-4">
              Trends Today publishes local news, transit updates, civic
              bulletins, event listings, and community information for residents
              of Burnaby, Coquitlam, Surrey, Richmond, Delta, Vancouver, and
              other Lower Mainland communities.
            </p>
            <p className="text-gray-900 leading-relaxed mb-4">
              Our articles cite official sources including municipal
              governments, TransLink, Metro Vancouver, BC Hydro, provincial
              agencies, and other public records. We include direct links to
              primary sources where available.
            </p>
          </div>
        </section>

        {/* Editorial Note */}
        <section className="bg-gray-50 border border-gray-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Editorial Note
          </h2>
          <div className="text-gray-800">
            <p className="mb-4">
              Trends Today does not currently operate affiliate marketing
              programs, sponsored content arrangements, or product review
              services. This page exists for transparency about our operations.
            </p>
            <p className="mb-4">
              If our business model changes in the future, we will update this
              page accordingly.
            </p>
          </div>
        </section>

        {/* Contact & Questions */}
        <section className="bg-blue-50 border border-blue-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">
            Questions or Feedback
          </h2>
          <div className="text-blue-800">
            <p className="mb-4">
              We welcome questions about our editorial approach and feedback on
              our coverage.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Editorial Questions</h3>
                <p className="text-sm mb-2">
                  Questions about our coverage or sources:
                </p>
                <a
                  href="mailto:editorial@trendstoday.ca"
                  className="text-blue-600 hover:text-blue-700 underline font-medium"
                >
                  editorial@trendstoday.ca
                </a>
              </div>
              <div>
                <h3 className="font-semibold mb-2">General Inquiries</h3>
                <p className="text-sm mb-2">Other questions or feedback:</p>
                <a
                  href="mailto:contact@trendstoday.ca"
                  className="text-blue-600 hover:text-blue-700 underline font-medium"
                >
                  contact@trendstoday.ca
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Last Updated */}
      <div className="mt-12 text-center text-sm text-gray-900">
        <p>This page was last updated on August 28, 2026.</p>
      </div>
    </div>
  );
}
