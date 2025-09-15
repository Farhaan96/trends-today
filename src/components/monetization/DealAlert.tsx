'use client';

import React, { useState } from 'react';
import { BellIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface DealAlertProps {
  productName: string;
  currentPrice: number;
  currency?: string;
  className?: string;
  onSubscribe?: (email: string, targetPrice: number) => void;
}

export default function DealAlert({
  productName,
  currentPrice,
  currency = 'USD',
  className = '',
  onSubscribe,
}: DealAlertProps) {
  const [email, setEmail] = useState('');
  const [targetPrice, setTargetPrice] = useState(
    Math.round(currentPrice * 0.9)
  ); // Default to 10% off
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const formatCurrency = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Basic validation
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    if (targetPrice <= 0 || targetPrice >= currentPrice) {
      setError('Target price must be lower than current price');
      setIsLoading(false);
      return;
    }

    try {
      // Call the onSubscribe callback or API
      if (onSubscribe) {
        await onSubscribe(email, targetPrice);
      } else {
        // Default API call (implement based on your backend)
        const response = await fetch('/api/deal-alerts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            productName,
            targetPrice,
            currentPrice,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to set up price alert');
        }
      }

      setIsSubmitted(true);

      // Track conversion
      if (typeof window !== 'undefined') {
        (window as any).gtag?.('event', 'deal_alert_signup', {
          event_category: 'monetization',
          event_label: productName,
          value: targetPrice,
        });
      }
    } catch (err) {
      setError('Failed to set up alert. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedPrices = [
    { label: '5% off', value: Math.round(currentPrice * 0.95) },
    { label: '10% off', value: Math.round(currentPrice * 0.9) },
    { label: '15% off', value: Math.round(currentPrice * 0.85) },
    { label: '20% off', value: Math.round(currentPrice * 0.8) },
  ];

  if (isSubmitted) {
    return (
      <div
        className={`bg-green-50 border border-green-200 rounded-lg p-6 ${className}`}
      >
        <div className="flex items-center gap-3">
          <CheckCircleIcon className="w-8 h-8 text-green-600" />
          <div>
            <h3 className="text-lg font-semibold text-green-800">
              Price Alert Set! 🎉
            </h3>
            <p className="text-green-700 mt-1">
              We'll notify you when <strong>{productName}</strong> drops to{' '}
              <strong>{formatCurrency(targetPrice)}</strong> or lower.
            </p>
            <p className="text-green-600 text-sm mt-2">
              Check your email to confirm your subscription.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-blue-50 border border-blue-200 rounded-lg p-6 ${className}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <BellIcon className="w-6 h-6 text-blue-600" />
        <div>
          <h3 className="text-lg font-semibold text-blue-900">
            🔔 Get Price Drop Alerts
          </h3>
          <p className="text-blue-700 text-sm">
            Be the first to know when <strong>{productName}</strong> goes on
            sale!
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input */}
        <div>
          <label
            htmlFor="alert-email"
            className="block text-sm font-medium text-blue-900 mb-1"
          >
            Email Address
          </label>
          <input
            id="alert-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Target Price */}
        <div>
          <label
            htmlFor="target-price"
            className="block text-sm font-medium text-blue-900 mb-1"
          >
            Alert me when price drops to:
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2 text-gray-900">$</span>
              <input
                id="target-price"
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(Number(e.target.value))}
                min="1"
                max={currentPrice - 1}
                className="w-full pl-8 pr-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <span className="text-sm text-blue-700">
              (Current: {formatCurrency(currentPrice)})
            </span>
          </div>

          {/* Quick Price Suggestions */}
          <div className="flex flex-wrap gap-1 mt-2">
            {suggestedPrices.map((suggestion) => (
              <button
                key={suggestion.label}
                type="button"
                onClick={() => setTargetPrice(suggestion.value)}
                className={`
                  px-2 py-1 text-xs rounded-full border transition-colors
                  ${
                    targetPrice === suggestion.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'
                  }
                `}
              >
                {suggestion.label} (${suggestion.value})
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Setting up alert...
            </div>
          ) : (
            'Set Price Alert'
          )}
        </button>
      </form>

      {/* Privacy Notice */}
      <p className="text-xs text-blue-600 mt-4 text-center">
        We'll only email you about price drops for this product. You can
        unsubscribe anytime.
        <br />
        <span className="text-yellow-600">*</span> We may include related deals
        and product recommendations.
      </p>
    </div>
  );
}
