'use client';

import { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

interface RatingSystemProps {
  articleId: string;
  initialRating?: number;
  totalRatings?: number;
  allowRating?: boolean;
}

export default function RatingSystem({ 
  articleId, 
  initialRating = 0, 
  totalRatings = 0,
  allowRating = true 
}: RatingSystemProps) {
  const [currentRating, setCurrentRating] = useState(initialRating);
  const [userRating, setUserRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRating = async (rating: number) => {
    if (hasRated || !allowRating || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update ratings (simplified calculation)
      const newTotal = totalRatings + 1;
      const newAverage = ((currentRating * totalRatings) + rating) / newTotal;
      
      setCurrentRating(newAverage);
      setUserRating(rating);
      setHasRated(true);

      // Track rating
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'article_rating', {
          event_category: 'engagement',
          event_label: articleId,
          value: rating
        });
      }
      
      console.log(`Rated article ${articleId} with ${rating} stars`);
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRating = hoveredRating || userRating || currentRating;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 border border-blue-100 dark:border-gray-600">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {hasRated ? 'Thanks for rating!' : 'Rate this article'}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {hasRated 
            ? `You rated this article ${userRating} star${userRating !== 1 ? 's' : ''}`
            : 'How helpful did you find this article?'
          }
        </p>

        {/* Star Rating Display */}
        <div className="flex items-center justify-center space-x-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRating(star)}
              onMouseEnter={() => !hasRated && setHoveredRating(star)}
              onMouseLeave={() => !hasRated && setHoveredRating(0)}
              disabled={hasRated || !allowRating || isSubmitting}
              className={`transition-all duration-200 ${
                hasRated || !allowRating 
                  ? 'cursor-default' 
                  : 'cursor-pointer hover:scale-110'
              }`}
            >
              {star <= displayRating ? (
                <StarSolid className="w-8 h-8 text-yellow-400" />
              ) : (
                <StarIcon className="w-8 h-8 text-gray-300 dark:text-gray-600" />
              )}
            </button>
          ))}
        </div>

        {/* Rating Summary */}
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <StarSolid className="w-4 h-4 text-yellow-400" />
            <span className="font-medium">
              {currentRating > 0 ? currentRating.toFixed(1) : '0.0'}
            </span>
          </div>
          
          <span className="text-gray-400">•</span>
          
          <span>
            {totalRatings + (hasRated ? 1 : 0)} rating{(totalRatings + (hasRated ? 1 : 0)) !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Rating Breakdown */}
        {totalRatings > 0 && (
          <div className="mt-4 space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              // Mock distribution - in real app, get from API
              const count = Math.floor(Math.random() * (totalRatings / 3));
              const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
              
              return (
                <div key={stars} className="flex items-center text-xs space-x-2">
                  <span className="w-3 text-gray-600 dark:text-gray-400">{stars}</span>
                  <StarSolid className="w-3 h-3 text-yellow-400" />
                  <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-gray-500 dark:text-gray-400 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Helpful Feedback */}
        {hasRated && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-center space-x-4">
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full hover:bg-green-200 dark:hover:bg-green-800 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                </svg>
                <span className="text-sm font-medium">Helpful</span>
              </button>
              
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 113 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.057 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                </svg>
                <span className="text-sm font-medium">Not helpful</span>
              </button>
            </div>
          </div>
        )}

        {isSubmitting && (
          <div className="mt-4">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
              <span>Submitting rating...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}