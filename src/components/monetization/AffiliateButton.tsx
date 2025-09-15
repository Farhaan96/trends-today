'use client';

import React from 'react';
import { AffiliateProvider } from '@/types/monetization';
import {
  ShoppingCartIcon,
  ArrowTopRightOnSquareIcon as ExternalLinkIcon,
} from '@heroicons/react/24/outline';

interface AffiliateButtonProps {
  provider: AffiliateProvider;
  affiliateUrl: string;
  productName: string;
  price?: number;
  originalPrice?: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'minimal';
  inStock?: boolean;
  className?: string;
  onClick?: () => void;
}

const providerInfo = {
  [AffiliateProvider.AMAZON]: {
    name: 'Amazon',
    color: 'bg-orange-500 hover:bg-orange-600',
    textColor: 'text-white',
    icon: '📦',
  },
  [AffiliateProvider.BESTBUY]: {
    name: 'Best Buy',
    color: 'bg-blue-600 hover:bg-blue-700',
    textColor: 'text-white',
    icon: '🏪',
  },
  [AffiliateProvider.COMMISSION_JUNCTION]: {
    name: 'Shop Now',
    color: 'bg-purple-600 hover:bg-purple-700',
    textColor: 'text-white',
    icon: '🛒',
  },
  [AffiliateProvider.TARGET]: {
    name: 'Target',
    color: 'bg-red-600 hover:bg-red-700',
    textColor: 'text-white',
    icon: '🎯',
  },
  [AffiliateProvider.NEWEGG]: {
    name: 'Newegg',
    color: 'bg-yellow-500 hover:bg-yellow-600',
    textColor: 'text-white',
    icon: '🥚',
  },
  [AffiliateProvider.B_AND_H]: {
    name: 'B&H Photo',
    color: 'bg-gray-800 hover:bg-gray-900',
    textColor: 'text-white',
    icon: '📷',
  },
};

export default function AffiliateButton({
  provider,
  affiliateUrl,
  productName,
  price,
  originalPrice,
  currency = 'USD',
  size = 'md',
  variant = 'primary',
  inStock = true,
  className = '',
  onClick,
}: AffiliateButtonProps) {
  const info = providerInfo[provider];

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  };

  const variantClasses = {
    primary: `${info.color} ${info.textColor} shadow-lg transform hover:scale-105 transition-all duration-200`,
    secondary: 'bg-white border border-gray-300 text-gray-900 hover:bg-gray-50',
    minimal:
      'bg-transparent border border-gray-300 text-gray-900 hover:border-gray-400',
  };

  const handleClick = () => {
    // Track affiliate click
    if (typeof window !== 'undefined') {
      // Send tracking event
      (window as any).gtag?.('event', 'affiliate_click', {
        event_category: 'monetization',
        event_label: `${provider}_${productName}`,
        value: price || 0,
      });
    }

    if (onClick) onClick();

    // Open affiliate link in new tab
    window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
  };

  if (!inStock) {
    return (
      <button
        disabled
        className={`
          ${sizeClasses[size]}
          bg-gray-300 text-gray-900 cursor-not-allowed rounded-lg font-medium
          flex items-center justify-center gap-2 w-full
          ${className}
        `}
      >
        <ShoppingCartIcon className="w-5 h-5" />
        Out of Stock
      </button>
    );
  }

  return (
    <div className={className}>
      <button
        onClick={handleClick}
        className={`
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          rounded-lg font-medium flex items-center justify-center gap-2 w-full
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        `}
        aria-label={`Buy ${productName} on ${info.name}`}
      >
        <ShoppingCartIcon className="w-5 h-5" />
        <span>Buy on {info.name}</span>
        {price && (
          <span className="ml-1">
            {originalPrice && originalPrice > price && (
              <span className="line-through text-sm opacity-75 mr-1">
                ${originalPrice}
              </span>
            )}
            ${price}
          </span>
        )}
        <ExternalLinkIcon className="w-4 h-4" />
      </button>

      {/* Affiliate disclosure */}
      <p className="text-xs text-gray-900 mt-1 text-center">
        <span className="text-yellow-600">*</span> We earn a commission if you
        make a purchase
      </p>
    </div>
  );
}
