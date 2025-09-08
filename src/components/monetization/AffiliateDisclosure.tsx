import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface AffiliateDisclosureProps {
  variant?: 'full' | 'compact' | 'inline';
  className?: string;
}

export default function AffiliateDisclosure({ 
  variant = 'full', 
  className = '' 
}: AffiliateDisclosureProps) {
  if (variant === 'inline') {
    return (
      <span className={`text-xs text-gray-900 ${className}`}>
        <span className="text-yellow-600">*</span> We earn a commission if you make a purchase
      </span>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-3 ${className}`}>
        <div className="flex items-start gap-2">
          <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-yellow-700">
            <strong>Affiliate Disclosure:</strong> We earn commission from purchases made through our affiliate links at no extra cost to you.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-start gap-3">
        <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" />
        <div>
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">
            🔍 Transparency & Affiliate Disclosure
          </h3>
          <div className="text-sm text-yellow-700 space-y-3">
            <div>
              <strong>Independent Testing & Reviews:</strong>
              <p className="mt-1">
                We purchase products with our own funds for completely independent testing. 
                Manufacturers do not provide review units, and our opinions are never influenced 
                by affiliate partnerships or sponsorship opportunities.
              </p>
            </div>
            
            <div>
              <strong>Affiliate Partnerships:</strong>
              <p className="mt-1">
                This page contains affiliate links to retailers including Amazon, Best Buy, Target, 
                and others. When you purchase through these links, Trends Today earns a small 
                commission at no additional cost to you. These commissions help support our 
                independent testing, detailed reviews, and free content.
              </p>
            </div>
            
            <div>
              <strong>Editorial Independence:</strong>
              <p className="mt-1">
                Our affiliate partnerships never influence our editorial opinions, product 
                recommendations, or review scores. We only recommend products we would purchase 
                ourselves and that we believe provide genuine value to our readers.
              </p>
            </div>
            
            <div className="bg-yellow-100 border border-yellow-300 rounded p-3 mt-4">
              <p className="font-medium text-yellow-800">
                Questions about our monetization or editorial policies? 
                <a href="mailto:editorial@trendstoday.ca" className="underline hover:no-underline">
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