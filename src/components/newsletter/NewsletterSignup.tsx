'use client';

import { useState } from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

interface NewsletterSignupProps {
  variant?: 'inline' | 'modal' | 'sidebar' | 'footer';
  showLeadMagnet?: boolean;
  leadMagnetTitle?: string;
  leadMagnetDescription?: string;
}

export default function NewsletterSignup({
  variant = 'inline',
  showLeadMagnet = false,
  leadMagnetTitle = 'Free Tech Buying Guide 2025',
  leadMagnetDescription = 'Get our exclusive 50-page guide with expert recommendations for every budget',
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: variant,
          leadMagnet: showLeadMagnet ? leadMagnetTitle : null,
        }),
      });

      if (response.ok) {
        setStatus('success');
        setEmail('');
        // Track conversion
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'newsletter_signup', {
            event_category: 'engagement',
            event_label: variant,
            value: 1,
          });
        }
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'modal':
        return 'bg-white p-8 rounded-lg shadow-2xl max-w-md mx-auto';
      case 'sidebar':
        return 'bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg border';
      case 'footer':
        return 'bg-slate-800 text-white p-6 rounded-lg';
      default:
        return 'bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg';
    }
  };

  const isFooterVariant = variant === 'footer';

  if (status === 'success') {
    return (
      <div className={`${getVariantStyles()} text-center`}>
        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-4">
          <svg
            className="w-6 h-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>
        <h3
          className={`text-xl font-bold mb-2 ${isFooterVariant ? 'text-white' : 'text-slate-900'}`}
        >
          Welcome to Trends Today!
        </h3>
        <p
          className={`text-sm ${isFooterVariant ? 'text-gray-300' : 'text-gray-800'}`}
        >
          Check your email for confirmation and{' '}
          {showLeadMagnet ? 'your free guide!' : 'your first newsletter!'}
        </p>
      </div>
    );
  }

  return (
    <div className={getVariantStyles()}>
      <div className="text-center mb-6">
        <h3
          className={`text-xl font-bold mb-2 ${isFooterVariant ? 'text-white' : 'text-white'}`}
        >
          {showLeadMagnet ? leadMagnetTitle : 'Stay Updated with Tech Trends'}
        </h3>
        <p
          className={`text-sm ${isFooterVariant ? 'text-gray-300' : 'text-white/90'}`}
        >
          {showLeadMagnet
            ? leadMagnetDescription
            : 'Get weekly insights on the latest tech reviews, deals, and buying guides'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            className={`flex-1 px-4 py-3 rounded-md border text-slate-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              status === 'error' ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-3 rounded-md font-semibold transition-all flex items-center justify-center gap-2 ${
              isFooterVariant
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-white text-blue-600 hover:bg-gray-50'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {showLeadMagnet ? 'Get Free Guide' : 'Subscribe'}
                <ChevronRightIcon className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {status === 'error' && (
          <p className="text-red-300 text-sm">
            Something went wrong. Please try again.
          </p>
        )}

        <p
          className={`text-xs ${isFooterVariant ? 'text-gray-900' : 'text-white/70'}`}
        >
          No spam, unsubscribe at any time. By subscribing, you agree to our
          privacy policy.
        </p>
      </form>

      {showLeadMagnet && (
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center gap-3 text-sm text-white/80">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              50+ Pages
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Expert Tested
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              2025 Updated
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
