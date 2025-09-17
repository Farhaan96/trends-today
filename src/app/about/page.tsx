import { Metadata } from 'next';
import Link from 'next/link';
import {
  CheckBadgeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ClockIcon,
  AcademicCapIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import authorsData from '../../../data/authors.json';

export const metadata: Metadata = {
  title: 'About Trends Today | Independent Tech Reviews & Analysis',
  description:
    'Learn about Trends Today - your trusted source for independent tech reviews, in-depth analysis, and comprehensive buying guides backed by expert journalists and real-world testing.',
};

export default function AboutPage() {
  const authors = Object.values(authorsData);
  const totalExperience = authors.reduce((sum, author: any) => {
    const yearsMatch = author.bio.match(/(\d+)\s*years?/i);
    return sum + (yearsMatch ? parseInt(yearsMatch[1]) : 0);
  }, 0);
  const totalReviews = authors.reduce(
    (sum, author: any) => sum + (author.reviewCount || 0),
    0
  );

  return (
    <main className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              About Trends Today
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Where cutting-edge technology meets rigorous journalism. We're the
              independent voice in tech, delivering insights that matter to real
              people making real decisions.
            </p>
          </div>

          {/* Statistics */}
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {totalExperience}+
              </div>
              <div className="text-sm text-gray-600">
                Years Combined Experience
              </div>
            </div>
            <div className="text-center bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {totalReviews}+
              </div>
              <div className="text-sm text-gray-600">Products Tested</div>
            </div>
            <div className="text-center bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {authors.length}
              </div>
              <div className="text-sm text-gray-600">Expert Authors</div>
            </div>
            <div className="text-center bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-3xl font-bold text-orange-600 mb-2">6</div>
              <div className="text-sm text-gray-600">Tech Categories</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Our Story */}
        <section className="mb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Founded in 2023, Trends Today emerged from a simple
                  frustration: too much tech coverage felt like marketing
                  disguised as journalism. We decided to do something different.
                </p>
                <p>
                  Our team of former engineers, industry veterans, and
                  passionate technologists came together with one mission:
                  deliver the truth about technology, no matter how inconvenient
                  it might be for manufacturers.
                </p>
                <p>
                  Today, we're proud to be one of the fastest-growing
                  independent tech publications, trusted by millions of readers
                  who value honesty over hype.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <ShieldCheckIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Independent & Unbiased
                    </h3>
                    <p className="text-sm text-gray-600">
                      No corporate influence, just honest reviews
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                    <AcademicCapIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Expert-Led</h3>
                    <p className="text-sm text-gray-600">
                      Real engineers and industry professionals
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                    <GlobeAltIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Reader-First
                    </h3>
                    <p className="text-sm text-gray-600">
                      Your interests always come first
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What Makes Us Different */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            What Makes Us Different
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClockIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Real-World Testing
              </h3>
              <p className="text-gray-600 leading-relaxed">
                We don't just unbox products—we live with them for weeks,
                testing every feature in actual usage scenarios that mirror your
                daily life.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChartBarIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Data-Driven Insights
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Our reviews are backed by comprehensive benchmarks, battery
                tests, camera comparisons, and performance analysis using
                professional-grade equipment.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DocumentTextIcon className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Honest Opinions
              </h3>
              <p className="text-gray-600 leading-relaxed">
                We'll tell you when expensive products aren't worth it, when
                budget options surprise us, and when the marketing doesn't match
                reality.
              </p>
            </div>
          </div>
        </section>

        {/* Editorial Standards */}
        <section className="mb-16 bg-gray-50 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Our Editorial Standards
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckBadgeIcon className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Independent Purchasing
                  </h4>
                  <p className="text-gray-600 text-sm">
                    We buy our review units with our own money to ensure
                    unbiased testing
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckBadgeIcon className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Minimum Testing Period
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Every product gets at least 2 weeks of real-world usage
                    before review
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckBadgeIcon className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Multiple Perspectives
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Products are tested by multiple team members with different
                    use cases
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckBadgeIcon className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Professional Equipment
                  </h4>
                  <p className="text-gray-600 text-sm">
                    We use industry-standard testing tools and measurement
                    devices
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckBadgeIcon className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Fact-Checking Process
                  </h4>
                  <p className="text-gray-600 text-sm">
                    All technical claims are verified and cross-referenced with
                    official specs
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckBadgeIcon className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Update Commitment
                  </h4>
                  <p className="text-gray-600 text-sm">
                    We revisit reviews when significant updates or issues emerge
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Meet the Team */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Meet Our Expert Team
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our diverse team brings together engineers, journalists, and tech
              enthusiasts with decades of combined experience in the industry.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {authors.slice(0, 4).map((author: any) => (
              <div
                key={author.id}
                className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserGroupIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {author.name}
                </h3>
                <p className="text-blue-600 text-sm font-medium mb-2">
                  {author.title}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-3">
                  {author.bio}
                </p>
                <Link
                  href={`/author/${author.id}`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Profile →
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/authors"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Meet the Full Team
            </Link>
          </div>
        </section>

        {/* Transparency */}
        <section className="mb-16 bg-yellow-50 border border-yellow-200 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Transparency & Ethics
          </h2>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                How We Make Money
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Trends Today is supported through affiliate commissions and
                display advertising. When you purchase products through our
                links, we may earn a commission at no additional cost to you.
                This helps us maintain our independence and continue providing
                free, high-quality content.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Editorial Independence
              </h3>
              <p className="text-gray-700 leading-relaxed">
                <strong>
                  Our editorial content is never influenced by commercial
                  relationships.
                </strong>
                Products are reviewed based solely on their merits, and negative
                reviews are published regardless of potential revenue impact. We
                maintain a strict separation between our editorial and business
                operations.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Review Policy
              </h3>
              <p className="text-gray-700 leading-relaxed">
                We purchase most products with our own funds. When manufacturers
                provide review units, we clearly disclose this, and it doesn't
                influence our assessment. All review units are returned or
                donated to ensure no conflicts of interest.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Ready to cut through the tech marketing noise? Join thousands of
            readers who trust Trends Today for honest, expert advice.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Get in Touch
            </Link>
            <Link
              href="/subscribe"
              className="inline-flex items-center px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-medium"
            >
              Subscribe to Updates
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
