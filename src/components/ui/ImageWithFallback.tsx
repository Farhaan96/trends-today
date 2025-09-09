"use client";

import Image, { ImageProps } from "next/image";
import React from "react";

type Props = Omit<ImageProps, "src"> & {
  src: string;
  fallbackSrc?: string;
};

export default function ImageWithFallback({ src, fallbackSrc = "/file.svg", alt, className = "", ...rest }: Props) {
  const [imgSrc, setImgSrc] = React.useState(src);
  const [hasError, setHasError] = React.useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      if (imgSrc !== fallbackSrc) {
        setImgSrc(fallbackSrc);
      }
    }
  };

  // Create intelligent fallback based on alt text or src
  const createSmartPlaceholder = () => {
    const deviceName = alt?.toLowerCase() || src?.toLowerCase() || '';
    
    let icon = '📱';
    let bgGradient = 'from-blue-100 to-blue-200';
    let textColor = 'text-blue-600';
    
    if (deviceName.includes('iphone')) {
      icon = '📱';
      bgGradient = 'from-gray-100 to-gray-300';
      textColor = 'text-gray-700';
    } else if (deviceName.includes('samsung') || deviceName.includes('galaxy')) {
      icon = '📱';
      bgGradient = 'from-blue-100 to-blue-200';
      textColor = 'text-blue-600';
    } else if (deviceName.includes('google') || deviceName.includes('pixel')) {
      icon = '📱';
      bgGradient = 'from-green-100 to-green-200';
      textColor = 'text-green-600';
    } else if (deviceName.includes('macbook') || deviceName.includes('laptop')) {
      icon = '💻';
      bgGradient = 'from-gray-100 to-gray-200';
      textColor = 'text-gray-600';
    } else if (deviceName.includes('headphone') || deviceName.includes('audio')) {
      icon = '🎧';
      bgGradient = 'from-purple-100 to-purple-200';
      textColor = 'text-purple-600';
    }

    return (
      <div className={`bg-gradient-to-br ${bgGradient} flex items-center justify-center relative overflow-hidden ${className}`} aria-label="Image not available">
        <div className="text-center p-8 select-none z-10">
          <div className="text-4xl mb-3" aria-hidden>{icon}</div>
          <p className={`${textColor} text-sm font-semibold`}>Product Image</p>
          <p className="text-gray-500 text-xs mt-1">Coming Soon</p>
        </div>
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='0.1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
    );
  };

  // If we have an error and no fallback, show smart placeholder
  if (hasError && imgSrc === fallbackSrc) {
    return createSmartPlaceholder();
  }

  return (
    <Image
      {...rest}
      alt={alt}
      src={imgSrc}
      className={className}
      onError={handleError}
    />
  );
}

