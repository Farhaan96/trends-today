"use client";

import Image, { ImageProps } from "next/image";
import React from "react";

interface ImageSource {
  url: string;
  priority: number;
  source: 'primary' | 'fallback' | 'dynamic' | 'placeholder';
  description?: string;
}

type Props = Omit<ImageProps, "src"> & {
  src: string;
  fallbackSrc?: string;
  enableDynamicSourcing?: boolean;
  productHint?: string;
  imageType?: 'hero' | 'feature' | 'comparison' | 'author' | 'news' | 'general';
  quality?: 'premium' | 'high' | 'standard';
};

export default function ImageWithFallback(props: Props) {
  const { 
    src, 
    fallbackSrc = "/file.svg", 
    alt, 
    className = "", 
    enableDynamicSourcing = true,
    productHint,
    imageType = 'general',
    quality = 'high',
    ...rest 
  } = props;
  const [imgSrc, setImgSrc] = React.useState(src);
  const [hasError, setHasError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [imageSource, setImageSource] = React.useState<ImageSource>({ 
    url: src, 
    priority: 10, 
    source: 'primary' 
  });
  const [attemptedSources, setAttemptedSources] = React.useState<string[]>([]);

  // Dynamic image sourcing hook
  const { getDynamicImageUrl, isSourceAvailable } = useDynamicImageSourcing();

  const handleError = async () => {
    if (hasError) return;
    
    setHasError(true);
    const currentSrc = imgSrc;
    
    // Add current source to attempted list
    setAttemptedSources(prev => [...prev, currentSrc]);
    
    // Try to get a better image source
    if (enableDynamicSourcing && !attemptedSources.includes(currentSrc)) {
      const dynamicSource = await tryGetDynamicSource();
      if (dynamicSource && dynamicSource.url !== currentSrc) {
        setImageSource(dynamicSource);
        setImgSrc(dynamicSource.url);
        setHasError(false);
        return;
      }
    }
    
    // Fall back to provided fallback
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
      setImageSource({ url: fallbackSrc, priority: 1, source: 'fallback' });
    }
  };

  const tryGetDynamicSource = async (): Promise<ImageSource | null> => {
    try {
      const filename = extractFilename(src);
      const searchQuery = generateSearchQuery(filename, productHint, alt);
      
      const dynamicUrl = await getDynamicImageUrl(filename, {
        searchQuery,
        imageType,
        quality,
        dimensions: { 
          width: rest.width as number || 1200, 
          height: rest.height as number || 800 
        }
      });
      
      if (dynamicUrl && !attemptedSources.includes(dynamicUrl)) {
        return {
          url: dynamicUrl,
          priority: 8,
          source: 'dynamic',
          description: `Dynamic source for ${filename}`
        };
      }
    } catch (error) {
      console.warn('Dynamic sourcing failed:', error);
    }
    
    return null;
  };

  // Enhanced intelligent placeholder with loading state
  const createSmartPlaceholder = () => {
    const deviceName = alt?.toLowerCase() || src?.toLowerCase() || productHint?.toLowerCase() || '';
    
    let icon = '📱';
    let bgGradient = 'from-blue-100 to-blue-200';
    let textColor = 'text-blue-600';
    let deviceType = 'Product';
    
    // Enhanced device detection
    if (deviceName.includes('iphone')) {
      icon = '📱';
      bgGradient = 'from-gray-100 to-gray-300';
      textColor = 'text-gray-700';
      deviceType = 'iPhone';
    } else if (deviceName.includes('samsung') || deviceName.includes('galaxy')) {
      icon = '📱';
      bgGradient = 'from-blue-100 to-blue-200';
      textColor = 'text-blue-600';
      deviceType = 'Galaxy';
    } else if (deviceName.includes('google') || deviceName.includes('pixel')) {
      icon = '📱';
      bgGradient = 'from-green-100 to-green-200';
      textColor = 'text-green-600';
      deviceType = 'Pixel';
    } else if (deviceName.includes('macbook') || deviceName.includes('laptop')) {
      icon = '💻';
      bgGradient = 'from-gray-100 to-gray-200';
      textColor = 'text-gray-600';
      deviceType = 'MacBook';
    } else if (deviceName.includes('headphone') || deviceName.includes('audio')) {
      icon = '🎧';
      bgGradient = 'from-purple-100 to-purple-200';
      textColor = 'text-purple-600';
      deviceType = 'Audio';
    } else if (deviceName.includes('author') || imageType === 'author') {
      icon = '👤';
      bgGradient = 'from-indigo-100 to-indigo-200';
      textColor = 'text-indigo-600';
      deviceType = 'Author';
    }

    const statusText = isLoading && enableDynamicSourcing ? 'Loading...' : 'Coming Soon';
    const showSourceInfo = imageSource.source !== 'primary' && process.env.NODE_ENV === 'development';

    return (
      <div 
        className={`bg-gradient-to-br ${bgGradient} flex items-center justify-center relative overflow-hidden ${className} transition-all duration-300`} 
        aria-label={`${deviceType} image ${isLoading ? 'loading' : 'not available'}`}
        title={`Source: ${imageSource.source} (${imageSource.priority})`}
      >
        <div className="text-center p-8 select-none z-10">
          <div className={`text-4xl mb-3 ${isLoading ? 'animate-pulse' : ''}`} aria-hidden>{icon}</div>
          <p className={`${textColor} text-sm font-semibold`}>{deviceType} Image</p>
          <p className="text-gray-500 text-xs mt-1">{statusText}</p>
          {showSourceInfo && (
            <p className="text-gray-400 text-xs mt-1 font-mono">
              {imageSource.source} • {imageSource.priority}
            </p>
          )}
          {enableDynamicSourcing && isLoading && (
            <div className="mt-2">
              <div className="w-16 h-1 bg-gray-300 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          )}
        </div>
        {/* Enhanced pattern overlay */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='0.1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        {/* Loading shimmer effect */}
        {isLoading && enableDynamicSourcing && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
        )}
      </div>
    );
  };

  // Handle successful image load
  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  // Effect to try dynamic sourcing on mount if original fails quickly
  React.useEffect(() => {
    if (enableDynamicSourcing && !hasError) {
      const timeout = setTimeout(async () => {
        // If image hasn't loaded within 2 seconds, try dynamic source
        if (isLoading) {
          const dynamicSource = await tryGetDynamicSource();
          if (dynamicSource) {
            setImageSource(dynamicSource);
            setImgSrc(dynamicSource.url);
          }
        }
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [src, enableDynamicSourcing]);

  // If we have an error and no fallback, show smart placeholder
  if (hasError && imgSrc === fallbackSrc) {
    return createSmartPlaceholder();
  }

  return (
    <div className="relative">
      <Image
        {...rest}
        alt={alt}
        src={imgSrc}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
        priority={imageType === 'hero' || (quality as string) === 'premium'}
      />
      
      {/* Loading placeholder */}
      {isLoading && (
        <div className="absolute inset-0">
          {createSmartPlaceholder()}
        </div>
      )}
      
      {/* Development info overlay */}
      {process.env.NODE_ENV === 'development' && imageSource.source !== 'primary' && (
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {imageSource.source}
        </div>
      )}
    </div>
  );
}

// Hook for dynamic image sourcing
function useDynamicImageSourcing() {
  const [cache] = React.useState(() => new Map<string, string>());
  
  const getDynamicImageUrl = React.useCallback(async (filename: string, options: {
    searchQuery?: string;
    imageType?: string;
    quality?: string;
    dimensions?: { width: number; height: number };
  } = {}) => {
    const cacheKey = `${filename}-${JSON.stringify(options)}`;
    
    // Check cache first
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)!;
    }
    
    try {
      // This would integrate with your ImageSourceManager
      // For now, we'll use intelligent fallbacks
      const fallbackUrl = getIntelligentFallback(filename, options);
      
      // Cache the result
      cache.set(cacheKey, fallbackUrl);
      
      return fallbackUrl;
    } catch (error) {
      console.error('Dynamic image sourcing failed:', error);
      return null;
    }
  }, [cache]);
  
  const isSourceAvailable = React.useCallback((source: string) => {
    // Check if image source is available
    return true; // Simplified for now
  }, []);
  
  return { getDynamicImageUrl, isSourceAvailable };
}

// Helper functions
function extractFilename(src: string): string {
  return src.split('/').pop() || src;
}

function generateSearchQuery(filename: string, productHint?: string, alt?: string): string {
  const fn = filename.toLowerCase();
  const hint = productHint?.toLowerCase() || '';
  const altText = alt?.toLowerCase() || '';
  
  // Generate intelligent search query based on filename and hints
  let query = '';
  
  if (fn.includes('iphone') || hint.includes('iphone') || altText.includes('iphone')) {
    query += 'iPhone premium smartphone ';
    if (fn.includes('16')) query += '16 Pro ';
    if (fn.includes('15')) query += '15 Pro ';
  } else if (fn.includes('samsung') || fn.includes('galaxy') || hint.includes('samsung')) {
    query += 'Samsung Galaxy smartphone ';
  } else if (fn.includes('pixel') || hint.includes('pixel') || hint.includes('google')) {
    query += 'Google Pixel smartphone ';
  }
  
  // Add feature keywords
  if (fn.includes('camera')) query += 'camera lens system ';
  if (fn.includes('battery')) query += 'battery charging power ';
  if (fn.includes('display')) query += 'display screen technology ';
  if (fn.includes('hero')) query += 'hero product shot ';
  if (fn.includes('titanium')) query += 'titanium premium design ';
  
  return query.trim() || 'premium technology product';
}

function getIntelligentFallback(filename: string, options: any): string {
  const fn = filename.toLowerCase();
  const { dimensions = { width: 1200, height: 800 } } = options;
  
  // High-quality fallback images based on content
  if (fn.includes('iphone')) {
    return `https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=${dimensions.width}&h=${dimensions.height}&fit=crop&q=85`;
  } else if (fn.includes('samsung') || fn.includes('galaxy')) {
    return `https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=${dimensions.width}&h=${dimensions.height}&fit=crop&q=85`;
  } else if (fn.includes('pixel') || fn.includes('google')) {
    return `https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=${dimensions.width}&h=${dimensions.height}&fit=crop&q=85`;
  } else if (fn.includes('camera')) {
    return `https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=${dimensions.width}&h=${dimensions.height}&fit=crop&q=85`;
  } else if (fn.includes('ai') || fn.includes('intelligence')) {
    return `https://images.unsplash.com/photo-1677442136019-21780ecad995?w=${dimensions.width}&h=${dimensions.height}&fit=crop&q=85`;
  }
  
  // Default tech fallback
  return `https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=${dimensions.width}&h=${dimensions.height}&fit=crop&q=85`;
}