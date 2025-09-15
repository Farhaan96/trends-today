import Link from 'next/link';
import {
  UserIcon,
  CheckBadgeIcon,
  AcademicCapIcon,
  ClockIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

interface Author {
  id?: string;
  name: string;
  title?: string;
  bio?: string;
  expertise?: string[];
  credentials?: string[];
  twitter?: string;
  socialMedia?: {
    twitter?: string;
    linkedin?: string;
    email?: string;
  };
  avatar?: string;
}

interface ReviewMetrics {
  testingPeriod?: string;
  testingHours?: number;
  batteryTests?: number;
  benchmarkRuns?: number;
  photosSampled?: number;
  verificationTests?: number;
}

interface TrustSignals {
  independentPurchase?: boolean;
  noManufacturerInfluence?: boolean;
  professionalEquipment?: boolean;
  peerReviewed?: boolean;
  transparentMethodology?: boolean;
}

interface AuthorBoxProps {
  author: Author;
  publishedAt: string;
  lastUpdated?: string;
  reviewMetrics?: ReviewMetrics;
  trustSignals?: TrustSignals;
}

export default function AuthorBox({
  author,
  publishedAt,
  lastUpdated,
  reviewMetrics,
  trustSignals,
}: AuthorBoxProps) {
  const twitterHandle = author.socialMedia?.twitter || author.twitter;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg overflow-hidden my-8">
      {/* Trust Signals Header */}
      {trustSignals && (
        <div className="bg-white border-b border-blue-200 px-6 py-3">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="font-semibold text-gray-900">
              Trust Indicators:
            </span>
            {trustSignals.independentPurchase && (
              <div className="flex items-center text-green-700">
                <CheckBadgeIcon className="w-3 h-3 mr-1" />
                Independently purchased
              </div>
            )}
            {trustSignals.professionalEquipment && (
              <div className="flex items-center text-blue-700">
                <CheckBadgeIcon className="w-3 h-3 mr-1" />
                Professional testing equipment
              </div>
            )}
            {trustSignals.peerReviewed && (
              <div className="flex items-center text-purple-700">
                <CheckBadgeIcon className="w-3 h-3 mr-1" />
                Editorial review process
              </div>
            )}
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 relative">
            <div className="w-16 h-16 bg-white border-2 border-blue-200 rounded-full flex items-center justify-center overflow-hidden">
              <UserIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full flex items-center justify-center">
              <CheckBadgeIcon className="w-3 h-3 text-white" />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-bold text-gray-900">
                    {author.name}
                  </h3>
                  {author.id && (
                    <Link
                      href={`/author/${author.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Profile →
                    </Link>
                  )}
                </div>
                {author.title && (
                  <p className="text-blue-700 font-semibold text-sm">
                    {author.title}
                  </p>
                )}
              </div>

              {twitterHandle && (
                <a
                  href={`https://twitter.com/${twitterHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  @{twitterHandle}
                </a>
              )}
            </div>

            {author.bio && (
              <p className="text-gray-900 text-sm mt-2 leading-relaxed">
                {typeof author.bio === 'string'
                  ? author.bio
                  : String(author.bio)}
              </p>
            )}

            {/* Credentials */}
            {author.credentials && author.credentials.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center text-xs text-gray-800 mb-1">
                  <AcademicCapIcon className="w-3 h-3 mr-1" />
                  <span className="font-semibold">Credentials:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {author.credentials.slice(0, 2).map((credential, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {credential}
                    </span>
                  ))}
                  {author.credentials.length > 2 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      +{author.credentials.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Expertise */}
            {author.expertise && author.expertise.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {author.expertise.slice(0, 4).map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white text-gray-900 border border-gray-200"
                  >
                    {skill}
                  </span>
                ))}
                {author.expertise.length > 4 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-900">
                    +{author.expertise.length - 4} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Review Metrics & Dates */}
        <div className="grid md:grid-cols-2 gap-6 mt-6 pt-4 border-t border-blue-200">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
              <ClockIcon className="w-4 h-4 mr-1" />
              Testing Metrics
            </h4>
            {reviewMetrics ? (
              <div className="space-y-1 text-xs text-gray-800">
                {reviewMetrics.testingPeriod && (
                  <div>
                    Testing period:{' '}
                    <span className="font-medium">
                      {reviewMetrics.testingPeriod}
                    </span>
                  </div>
                )}
                {reviewMetrics.testingHours && (
                  <div>
                    Total testing hours:{' '}
                    <span className="font-medium">
                      {reviewMetrics.testingHours}
                    </span>
                  </div>
                )}
                {reviewMetrics.benchmarkRuns && (
                  <div>
                    Benchmark runs:{' '}
                    <span className="font-medium">
                      {reviewMetrics.benchmarkRuns}
                    </span>
                  </div>
                )}
                {reviewMetrics.verificationTests && (
                  <div>
                    Verification tests:{' '}
                    <span className="font-medium">
                      {reviewMetrics.verificationTests}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-800">
                Comprehensive real-world testing performed
              </p>
            )}
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
              <CalendarIcon className="w-4 h-4 mr-1" />
              Publication Info
            </h4>
            <div className="space-y-1 text-xs text-gray-800">
              <div>
                Published:{' '}
                <span className="font-medium">
                  {new Date(publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              {lastUpdated && lastUpdated !== publishedAt && (
                <div>
                  Last updated:{' '}
                  <span className="font-medium">
                    {new Date(lastUpdated).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
