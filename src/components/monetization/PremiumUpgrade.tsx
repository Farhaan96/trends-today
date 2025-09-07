'use client';

import React from 'react';
import { StarIcon, CheckIcon } from '@heroicons/react/24/solid';
import { SparklesIcon as CrownIcon } from '@heroicons/react/24/outline';

interface PremiumFeature {
  name: string;
  included: boolean;
  highlight?: boolean;
}

interface PremiumTierData {
  name: string;
  price: number;
  duration: 'monthly' | 'yearly';
  features: PremiumFeature[];
  isPopular?: boolean;
  savings?: string;
}

interface PremiumUpgradeProps {
  compact?: boolean;
  className?: string;
  onUpgrade?: (tier: string) => void;
}

const premiumTiers: PremiumTierData[] = [
  {
    name: 'Trends Today Pro Monthly',
    price: 4.99,
    duration: 'monthly',
    features: [
      { name: 'Ad-free reading experience', included: true, highlight: true },
      { name: 'Early access to reviews', included: true },
      { name: 'Exclusive buyer\'s guides', included: true },
      { name: 'Premium comparison tools', included: true },
      { name: 'Deal alerts & notifications', included: true },
      { name: 'Expert Q&A sessions', included: true },
      { name: 'Download articles as PDF', included: true }
    ]
  },
  {
    name: 'Trends Today Pro Yearly',
    price: 39.99,
    duration: 'yearly',
    features: [
      { name: 'Everything in Monthly', included: true },
      { name: 'Ad-free reading experience', included: true, highlight: true },
      { name: 'Early access to reviews', included: true },
      { name: 'Exclusive buyer\'s guides', included: true },
      { name: 'Premium comparison tools', included: true },
      { name: 'Deal alerts & notifications', included: true },
      { name: 'Expert Q&A sessions', included: true },
      { name: 'Download articles as PDF', included: true },
      { name: 'Priority customer support', included: true, highlight: true }
    ],
    isPopular: true,
    savings: 'Save 33%'
  }
];

export default function PremiumUpgrade({
  compact = false,
  className = '',
  onUpgrade
}: PremiumUpgradeProps) {
  const handleUpgrade = (tierName: string) => {
    // Track premium conversion attempt
    if (typeof window !== 'undefined') {
      (window as any).gtag?.('event', 'premium_upgrade_click', {
        event_category: 'monetization',
        event_label: tierName,
        value: tierName.includes('Yearly') ? 39.99 : 4.99
      });
    }

    if (onUpgrade) {
      onUpgrade(tierName);
    } else {
      // Redirect to subscription page
      window.location.href = `/subscribe?tier=${encodeURIComponent(tierName)}`;
    }
  };

  if (compact) {
    return (
      <div className={`bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-4 text-white ${className}`}>
        <div className="flex items-center gap-3">
          <CrownIcon className="w-8 h-8 text-yellow-300" />
          <div className="flex-1">
            <h3 className="font-semibold">Upgrade to Trends Today Pro</h3>
            <p className="text-sm text-purple-100">
              Ad-free reading, early access, and exclusive content
            </p>
          </div>
          <button
            onClick={() => handleUpgrade('Trends Today Pro Monthly')}
            className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors whitespace-nowrap"
          >
            Try Free
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-6 ${className}`}>
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <CrownIcon className="w-8 h-8 text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-900">
            Unlock Premium Content
          </h2>
        </div>
        <p className="text-gray-800">
          Get the complete Trends Today experience with exclusive features and ad-free reading
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {premiumTiers.map((tier) => (
          <div
            key={tier.name}
            className={`
              relative rounded-lg border-2 p-6 transition-all hover:shadow-lg
              ${tier.isPopular 
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-200 bg-white'
              }
            `}
          >
            {tier.isPopular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <StarIcon className="w-4 h-4" />
                  Most Popular
                </span>
              </div>
            )}

            {tier.savings && (
              <div className="absolute -top-2 -right-2">
                <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  {tier.savings}
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {tier.duration === 'yearly' ? 'Pro Yearly' : 'Pro Monthly'}
              </h3>
              <div className="mb-2">
                <span className="text-4xl font-bold text-gray-900">
                  ${tier.price}
                </span>
                <span className="text-gray-800">
                  /{tier.duration === 'yearly' ? 'year' : 'month'}
                </span>
              </div>
              {tier.duration === 'yearly' && (
                <p className="text-sm text-green-600 font-medium">
                  Just $3.33/month when paid annually
                </p>
              )}
            </div>

            <ul className="space-y-3 mb-6">
              {tier.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckIcon className={`
                    w-5 h-5 mt-0.5 flex-shrink-0
                    ${feature.highlight 
                      ? 'text-purple-600' 
                      : feature.included 
                        ? 'text-green-600' 
                        : 'text-gray-300'
                    }
                  `} />
                  <span className={`
                    text-sm
                    ${feature.highlight 
                      ? 'text-purple-900 font-medium' 
                      : feature.included 
                        ? 'text-gray-700' 
                        : 'text-gray-700 line-through'
                    }
                  `}>
                    {feature.name}
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleUpgrade(tier.name)}
              className={`
                w-full py-3 px-4 rounded-lg font-medium transition-all
                ${tier.isPopular
                  ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
                }
              `}
            >
              {tier.duration === 'yearly' ? 'Start Annual Plan' : 'Start Monthly Plan'}
            </button>

            <p className="text-xs text-gray-700 text-center mt-3">
              7-day free trial • Cancel anytime
            </p>
          </div>
        ))}
      </div>

      {/* Feature Comparison */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          What You Get With Pro
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-2">🚫</div>
            <h4 className="font-medium text-gray-900">Ad-Free Experience</h4>
            <p className="text-sm text-gray-800 mt-1">
              Enjoy distraction-free reading with no ads or pop-ups
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-2">⚡</div>
            <h4 className="font-medium text-gray-900">Early Access</h4>
            <p className="text-sm text-gray-800 mt-1">
              Get reviews and comparisons 24-48 hours before everyone else
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-2">🎯</div>
            <h4 className="font-medium text-gray-900">Premium Tools</h4>
            <p className="text-sm text-gray-800 mt-1">
              Advanced comparison tools and personalized recommendations
            </p>
          </div>
        </div>
      </div>

      {/* Trust Signals */}
      <div className="mt-6 pt-4 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-700">
          Join 10,000+ tech enthusiasts who trust Trends Today Pro for their buying decisions
        </p>
        <div className="flex justify-center items-center gap-4 mt-2 text-xs text-gray-700">
          <span>🔒 Secure Payment</span>
          <span>•</span>
          <span>💳 No Hidden Fees</span>
          <span>•</span>
          <span>📧 Email Support</span>
        </div>
      </div>
    </div>
  );
}
