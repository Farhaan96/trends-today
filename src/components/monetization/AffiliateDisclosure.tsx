import React from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface AffiliateDisclosureProps {
  variant?: 'full' | 'compact' | 'inline';
  className?: string;
}

export default function AffiliateDisclosure({
  variant = 'full',
  className = '',
}: AffiliateDisclosureProps) {
  if (variant === 'inline') {
    return (
      <span className={`text-xs text-gray-900 ${className}`}>
        <span className="text-blue-600">*</span> Some links may support our
        operations
      </span>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={`bg-blue-50 border border-blue-200 rounded-lg p-3 ${className}`}
      >
        <div className="flex items-start gap-2">
          <InformationCircleIcon className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-700">
            <strong>Note:</strong> Trends Today is an independent local news
            publication. We do not currently operate affiliate programs or
            sponsored content.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-blue-50 border border-blue-200 rounded-lg p-6 ${className}`}
    >
      <div className="flex items-start gap-3">
        <InformationCircleIcon className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
        <div>
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            About Trends Today
          </h3>
          <div className="text-sm text-blue-700 space-y-3">
            <div>
              <strong>What We Publish:</strong>
              <p className="mt-1">
                Trends Today covers local news, transit updates, civic
                bulletins, and community events across the Lower Mainland. Our
                content focuses on practical information for residents.
              </p>
            </div>

            <div>
              <strong>Editorial Independence:</strong>
              <p className="mt-1">
                We do not currently operate affiliate marketing programs,
                sponsored content arrangements, or product review services. Our
                editorial decisions are made independently.
              </p>
            </div>

            <div>
              <strong>Sources:</strong>
              <p className="mt-1">
                Our articles cite official municipal sources, TransLink, Metro
                Vancouver, provincial agencies, and other public records. We
                link to primary sources where available.
              </p>
            </div>

            <div className="bg-blue-100 border border-blue-300 rounded p-3 mt-4">
              <p className="font-medium text-blue-800">
                Questions about our editorial approach?{' '}
                <a
                  href="mailto:editorial@trendstoday.ca"
                  className="underline hover:no-underline"
                >
                  Contact our editorial team
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
