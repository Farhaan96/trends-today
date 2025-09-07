'use client';

import React, { useState } from 'react';
import { ProductComparison as ProductComparisonType, AffiliateProvider } from '@/types/monetization';
import AffiliateButton from './AffiliateButton';
import { StarIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface ProductComparisonProps {
  products: ProductComparisonType[];
  title?: string;
  className?: string;
  maxVisible?: number;
}

export default function ProductComparison({
  products,
  title = "Alternative Products",
  className = '',
  maxVisible = 3
}: ProductComparisonProps) {
  const [showAll, setShowAll] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'deal'>('price');

  // Sort products based on selection
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.currentPrice - b.currentPrice;
      case 'rating':
        return b.rating - a.rating;
      case 'deal':
        return (b.dealScore || 0) - (a.dealScore || 0);
      default:
        return 0;
    }
  });

  const displayProducts = showAll ? sortedProducts : sortedProducts.slice(0, maxVisible);

  const formatCurrency = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const getSavings = (product: ProductComparisonType) => {
    if (!product.originalPrice || product.originalPrice <= product.currentPrice) return null;
    const savings = product.originalPrice - product.currentPrice;
    const percentage = Math.round((savings / product.originalPrice) * 100);
    return { amount: savings, percentage };
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <div className="flex items-center gap-2">
            <label htmlFor="comparison-sort" className="text-sm text-gray-600">Sort by:</label>
            <select
              id="comparison-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'price' | 'rating' | 'deal')}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="price">Price</option>
              <option value="rating">Rating</option>
              <option value="deal">Best Deal</option>
            </select>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {displayProducts.map((product, index) => {
          const savings = getSavings(product);
          const bestAffiliate = Object.entries(product.affiliateLinks)[0]; // Get first available affiliate link
          
          return (
            <div key={product.productId} className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Product Image */}
                <div className="flex-shrink-0">
                  <img
                    loading="lazy"
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg bg-gray-100"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMTVhMyAzIDAgMTAwLTYgMyAzIDAgMDAwIDZ6IiBmaWxsPSIjY2NjIi8+PHBhdGggZD0iTTEuNSA2YTIuNSAyLjUgMCAwMTIuNS0yLjVoMTZhMi41IDIuNSAwIDAxMi41IDIuNXYxMmEyLjUgMi41IDAgMDEtMi41IDIuNUg0YTIuNSAyLjUgMCAwMS0yLjUtMi41VjZ6TTQgNWExIDEgMCAwMC0xIDF2MTJhMSAxIDAgMDAxIDFoMTZhMSAxIDAgMDAxLTFWNmExIDEgMCAwMC0xLTFINHoiIGZpbGw9IiNjY2MiLz48L3N2Zz4=';
                    }}
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{product.name}</h4>
                        {product.isRecommended && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            Recommended
                          </span>
                        )}
                        {product.dealScore && product.dealScore > 8 && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                            Hot Deal
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-2">{product.brand}</p>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-3">
                        {renderStars(product.rating)}
                        <span className="text-sm text-gray-600 ml-1">
                          {product.rating.toFixed(1)}
                        </span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl font-bold text-gray-900">
                          {formatCurrency(product.currentPrice)}
                        </span>
                        {savings && (
                          <>
                            <span className="text-sm text-gray-500 line-through">
                              {formatCurrency(product.originalPrice!)}
                            </span>
                            <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">
                              {savings.percentage}% off
                            </span>
                          </>
                        )}
                      </div>

                      {/* Pros and Cons */}
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        {product.pros.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-green-800 mb-1">Pros</h5>
                            <ul className="space-y-1">
                              {product.pros.slice(0, 2).map((pro, proIndex) => (
                                <li key={proIndex} className="flex items-start gap-1 text-xs text-green-700">
                                  <CheckIcon className="w-3 h-3 mt-0.5 text-green-600" />
                                  <span>{pro}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {product.cons.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-red-800 mb-1">Cons</h5>
                            <ul className="space-y-1">
                              {product.cons.slice(0, 2).map((con, conIndex) => (
                                <li key={conIndex} className="flex items-start gap-1 text-xs text-red-700">
                                  <XMarkIcon className="w-3 h-3 mt-0.5 text-red-600" />
                                  <span>{con}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Buy Buttons */}
                    <div className="flex-shrink-0">
                      <div className="space-y-2 min-w-[140px]">
                        {Object.entries(product.affiliateLinks)
                          .slice(0, 2) // Show max 2 affiliate links
                          .map(([provider, url]) => (
                            <AffiliateButton
                              key={provider}
                              provider={provider as AffiliateProvider}
                              affiliateUrl={url}
                              productName={product.name}
                              price={product.currentPrice}
                              originalPrice={product.originalPrice}
                              size="sm"
                              variant={provider === bestAffiliate[0] ? 'primary' : 'secondary'}
                            />
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show More/Less Button */}
      {products.length > maxVisible && (
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            {showAll ? (
              <>
                Show Less <ChevronUpIcon className="w-4 h-4" />
              </>
            ) : (
              <>
                Show {products.length - maxVisible} More Products <ChevronDownIcon className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Affiliate Disclaimer */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          <span className="text-yellow-600">*</span> Trends Today earns commission from purchases made through our affiliate links. 
          Prices and availability are subject to change.
        </p>
      </div>
    </div>
  );
}
