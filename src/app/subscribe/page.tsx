import { Metadata } from 'next';
import { Suspense } from 'react';
import PremiumUpgrade from '@/components/monetization/PremiumUpgrade';
import { CheckIcon, StarIcon } from '@heroicons/react/24/solid';
import { SparklesIcon as CrownIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Subscribe to Trends Today Pro - Premium Tech Content',
  description: 'Unlock ad-free reading, early access to reviews, exclusive buyer\'s guides, and premium comparison tools. Join thousands of tech enthusiasts.',
  keywords: ['trends today pro', 'tech subscription', 'premium content', 'ad-free reading', 'exclusive reviews'],
};

export default function SubscribePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <CrownIcon className="w-16 h-16 text-yellow-300" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Upgrade to Trends Today Pro
            </h1>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Get the complete tech experience with ad-free reading, early access to reviews, 
              and exclusive content that helps you make smarter buying decisions.
            </p>
            
            {/* Social Proof */}
            <div className="flex items-center justify-center gap-2 text-purple-200">
              <div className="flex">
                {Array.from({ length: 5 }, (_, i) => (
                  <StarIcon key={i} className="w-5 h-5 text-yellow-300" />
                ))}
              </div>
              <span className="ml-2">Trusted by 10,000+ tech enthusiasts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Premium Upgrade Component */}
        <Suspense fallback={<div className="text-center py-8">Loading subscription options...</div>}>
          <PremiumUpgrade />
        </Suspense>

        {/* Final CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">
              Ready to Upgrade Your Tech Experience?
            </h2>
            <p className="text-purple-100 mb-6">
              Join thousands of tech enthusiasts who trust Trends Today Pro for their buying decisions.
            </p>
            <a 
              href="#pricing" 
              className="inline-block bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Your Free Trial
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}