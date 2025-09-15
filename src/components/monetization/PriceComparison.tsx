'use client';

import React, { useState } from 'react';
import { PriceData, AffiliateProvider } from '@/types/monetization';
import AffiliateButton from './AffiliateButton';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface PriceComparisonProps {
  productName: string;
  prices: PriceData[];
  className?: string;
}

export default function PriceComparison({
  productName,
  prices,
  className = '',
}: PriceComparisonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'provider'>('price');

  // Sort prices
  const sortedPrices = [...prices].sort((a, b) => {
    if (sortBy === 'price') {
      return a.currentPrice - b.currentPrice;
    }
    return a.provider.localeCompare(b.provider);
  });

  // Get best price
  const bestPrice = Math.min(
    ...prices.filter((p) => p.inStock).map((p) => p.currentPrice)
  );
  const bestDeal = prices.find(
    (p) => p.currentPrice === bestPrice && p.inStock
  );

  // Display up to 3 prices initially, show all when expanded
  const displayPrices = isExpanded ? sortedPrices : sortedPrices.slice(0, 3);

  const formatCurrency = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const getSavings = (price: PriceData) => {
    if (!price.originalPrice || price.originalPrice <= price.currentPrice)
      return null;
    const savings = price.originalPrice - price.currentPrice;
    const percentage = Math.round((savings / price.originalPrice) * 100);
    return { amount: savings, percentage };
  };

  if (prices.length === 0) {
    return null;
  }

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          💰 Price Comparison
        </h3>
        <div className="flex items-center gap-2">
          <label htmlFor="sort-select" className="text-sm text-gray-800">
            Sort by:
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'price' | 'provider')}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="price">Price</option>
            <option value="provider">Store</option>
          </select>
        </div>
      </div>

      {/* Best Deal Highlight */}
      {bestDeal && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-green-800 font-medium text-sm">
                🏆 Best Price
              </span>
              <p className="text-green-700 font-semibold text-lg">
                {formatCurrency(bestDeal.currentPrice, bestDeal.currency)}
              </p>
              <p className="text-green-600 text-sm capitalize">
                at {bestDeal.provider.replace('_', ' ')}
              </p>
            </div>
            <AffiliateButton
              provider={bestDeal.provider}
              affiliateUrl={bestDeal.affiliateUrl}
              productName={productName}
              price={bestDeal.currentPrice}
              originalPrice={bestDeal.originalPrice}
              currency={bestDeal.currency}
              inStock={bestDeal.inStock}
              size="sm"
              className="ml-4"
            />
          </div>
        </div>
      )}

      {/* Price List */}
      <div className="space-y-3">
        {displayPrices.map((price, index) => {
          const savings = getSavings(price);
          const isBestPrice = price.currentPrice === bestPrice && price.inStock;

          return (
            <div
              key={`${price.provider}-${index}`}
              className={`
                flex items-center justify-between p-4 rounded-lg border
                ${isBestPrice ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}
              `}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 capitalize">
                    {price.provider.replace('_', ' & ')}
                  </span>
                  {isBestPrice && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Best Price
                    </span>
                  )}
                  {!price.inStock && (
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                      Out of Stock
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-semibold text-gray-900">
                    {formatCurrency(price.currentPrice, price.currency)}
                  </span>

                  {savings && (
                    <>
                      <span className="text-sm text-gray-900 line-through">
                        {formatCurrency(price.originalPrice!, price.currency)}
                      </span>
                      <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">
                        Save {savings.percentage}%
                      </span>
                    </>
                  )}
                </div>

                {price.shipping && (
                  <p className="text-xs text-gray-800 mt-1">
                    🚚 {price.shipping}
                  </p>
                )}

                {price.availability && (
                  <p className="text-xs text-gray-800 mt-1">
                    📦 {price.availability}
                  </p>
                )}

                <p className="text-xs text-gray-900 mt-1">
                  Updated: {new Date(price.lastUpdated).toLocaleDateString()}
                </p>
              </div>

              <div className="ml-4 flex-shrink-0">
                <AffiliateButton
                  provider={price.provider}
                  affiliateUrl={price.affiliateUrl}
                  productName={productName}
                  price={price.currentPrice}
                  originalPrice={price.originalPrice}
                  currency={price.currency}
                  inStock={price.inStock}
                  size="sm"
                  variant={isBestPrice ? 'primary' : 'secondary'}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Show More/Less Button */}
      {prices.length > 3 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-4 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 rounded-lg flex items-center justify-center gap-1 transition-colors"
        >
          {isExpanded ? (
            <>
              Show Less <ChevronUpIcon className="w-4 h-4" />
            </>
          ) : (
            <>
              Show More ({prices.length - 3} more stores){' '}
              <ChevronDownIcon className="w-4 h-4" />
            </>
          )}
        </button>
      )}

      {/* Affiliate Disclaimer */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-900 text-center">
          <span className="text-yellow-600">*</span> Trends Today may earn a
          commission from purchases made through our affiliate links. This helps
          support our independent testing and reviews at no extra cost to you.
        </p>
      </div>
    </div>
  );
}
