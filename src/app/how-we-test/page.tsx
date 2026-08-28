import { Metadata } from 'next';
import Link from 'next/link';
import {
  DocumentTextIcon,
  CheckBadgeIcon,
  LinkIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'How We Report - Our Editorial Approach | Trends Today',
  description:
    'Learn how Trends Today researches and verifies local news, transit updates, and civic information for the Lower Mainland.',
  openGraph: {
    title: 'How We Report - Trends Today Editorial Approach',
    description:
      'Learn how we research and verify local news for the Lower Mainland.',
    type: 'article',
  },
  alternates: { canonical: '/how-we-test' },
};

export default function HowWeReportPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          How We Report
        </h1>
        <p className="text-xl text-gray-800 max-w-3xl mx-auto mb-8">
          Trends Today covers local news, transit updates, and civic information
          for the Lower Mainland. Here is how we approach our reporting.
        </p>

        <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <DocumentTextIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-blue-600">Official</div>
            <div className="text-sm text-gray-800">Primary Sources</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <LinkIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-green-600">Direct</div>
            <div className="text-sm text-gray-800">Source Links</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <CheckBadgeIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-purple-600">Verified</div>
            <div className="text-sm text-gray-800">Before Publishing</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <ClockIcon className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-orange-600">Timely</div>
            <div className="text-sm text-gray-800">Local Updates</div>
          </div>
        </div>
      </header>

      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Our Reporting Approach
        </h2>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Primary Sources
            </h3>
            <p className="text-gray-800 text-sm">
              We cite official sources including municipal governments,
              TransLink, Metro Vancouver, BC Hydro, and provincial agencies. We
              link directly to source material where available.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Local Focus
            </h3>
            <p className="text-gray-800 text-sm">
              Our coverage focuses on the Lower Mainland, including Burnaby,
              Coquitlam, Surrey, Richmond, Delta, Vancouver, and surrounding
              communities. We prioritize information that helps residents make
              decisions.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Practical Information
            </h3>
            <p className="text-gray-800 text-sm">
              We report on transit changes, road work, civic deadlines, event
              dates, and municipal services. Our goal is to provide useful
              details, not just headlines.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">What We Cover</h2>

        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Transit Updates
            </h3>
            <p className="text-gray-800 mb-4">
              Service changes, road work, detours, and commute-affecting
              construction across TransLink, municipal roads, and provincial
              highways.
            </p>
            <ul className="space-y-2 text-sm text-gray-900">
              <li className="flex items-start">
                <CheckBadgeIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                SkyTrain and bus service changes
              </li>
              <li className="flex items-start">
                <CheckBadgeIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                Road closures and traffic signal work
              </li>
              <li className="flex items-start">
                <CheckBadgeIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                Fare changes and schedule updates
              </li>
            </ul>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Local News</h3>
            <p className="text-gray-800 mb-4">
              Municipal announcements, civic deadlines, election information,
              and community updates from official city sources.
            </p>
            <ul className="space-y-2 text-sm text-gray-900">
              <li className="flex items-start">
                <CheckBadgeIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                Registration deadlines and public programs
              </li>
              <li className="flex items-start">
                <CheckBadgeIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                Municipal election dates and voter information
              </li>
              <li className="flex items-start">
                <CheckBadgeIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                Water restrictions and public safety notices
              </li>
            </ul>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Things to Do
            </h3>
            <p className="text-gray-800 mb-4">
              Free community events, festivals, park programs, and family
              activities from official municipal event listings.
            </p>
            <ul className="space-y-2 text-sm text-gray-900">
              <li className="flex items-start">
                <CheckBadgeIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                Free concerts and festivals at public parks
              </li>
              <li className="flex items-start">
                <CheckBadgeIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                City-run recreation programs and volunteer opportunities
              </li>
              <li className="flex items-start">
                <CheckBadgeIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                Community tours and seasonal events
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Editorial Standards
        </h2>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <ul className="space-y-3 text-gray-900">
            <li className="flex items-start">
              <CheckBadgeIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span>
                Articles link to official source pages where readers can verify
                information
              </span>
            </li>
            <li className="flex items-start">
              <CheckBadgeIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span>
                We distinguish between confirmed details and planned or
                estimated dates
              </span>
            </li>
            <li className="flex items-start">
              <CheckBadgeIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span>
                Each article includes the date we checked the source material
              </span>
            </li>
            <li className="flex items-start">
              <CheckBadgeIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span>
                We update or flag articles when source information changes
              </span>
            </li>
            <li className="flex items-start">
              <CheckBadgeIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span>
                We do not operate affiliate programs or accept sponsored content
              </span>
            </li>
          </ul>
        </div>
      </section>

      <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Questions About Our Coverage?
        </h2>
        <p className="text-gray-800 mb-6 max-w-2xl mx-auto">
          If you have questions about our reporting or want to suggest a local
          topic for coverage, we would like to hear from you.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/editorial-standards"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Editorial Standards
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center px-6 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            About Trends Today
          </Link>
        </div>
      </section>
    </div>
  );
}
