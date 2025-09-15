'use client';

import React, { useEffect, useRef } from 'react';

interface AdPlaceholderProps {
  adSlot: string;
  format?:
    | 'banner'
    | 'rectangle'
    | 'leaderboard'
    | 'skyscraper'
    | 'mobile-banner';
  className?: string;
  label?: string;
}

const adFormats = {
  banner: { width: 728, height: 90 },
  rectangle: { width: 300, height: 250 },
  leaderboard: { width: 970, height: 250 },
  skyscraper: { width: 160, height: 600 },
  'mobile-banner': { width: 320, height: 100 },
};

export default function AdPlaceholder({
  adSlot,
  format = 'rectangle',
  className = '',
  label,
}: AdPlaceholderProps) {
  const adRef = useRef<HTMLDivElement>(null);

  const { width, height } = adFormats[format];

  useEffect(() => {
    // Initialize Google AdSense when ready
    if (
      typeof window !== 'undefined' &&
      (window as any).adsbygoogle &&
      adRef.current
    ) {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push(
          {}
        );
      } catch (error) {
        console.error('AdSense error:', error);
      }
    }
  }, []);

  return (
    <div className={`ad-container ${className}`}>
      {label && (
        <p className="text-xs text-gray-900 text-center mb-2 uppercase tracking-wide">
          {label}
        </p>
      )}

      {/* AdSense placeholder - will be activated when AdSense is approved */}
      <div
        ref={adRef}
        className="flex items-center justify-center border border-gray-200 rounded bg-gray-50 text-gray-900 text-sm"
        style={{ width: `${width}px`, height: `${height}px`, maxWidth: '100%' }}
      >
        {/* Development placeholder */}
        <div className="text-center p-4">
          <div className="text-xl mb-2">📺</div>
          <div>Advertisement</div>
          <div className="text-xs mt-1">
            {width} x {height}
          </div>
        </div>
      </div>

      {/* Hidden AdSense code - will be activated later */}
      <ins
        className="adsbygoogle hidden"
        style={{ display: 'block', width: `${width}px`, height: `${height}px` }}
        data-ad-client="ca-pub-xxxxxxxxxxxxxxxx" // Replace with actual client ID
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />

      <p className="text-xs text-gray-900 text-center mt-1">
        <span className="text-yellow-600">*</span> Advertisement
      </p>
    </div>
  );
}
