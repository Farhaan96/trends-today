'use client';

import { useEffect } from 'react';
import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';

// Web Vitals tracking for Core Web Vitals optimization
export default function WebVitals() {
  useEffect(() => {
    // Track Core Web Vitals
    onCLS((metric) => {
      trackWebVital(metric);
    });

    onINP((metric) => {
      trackWebVital(metric);
    });

    onFCP((metric) => {
      trackWebVital(metric);
    });

    onLCP((metric) => {
      trackWebVital(metric);
    });

    onTTFB((metric) => {
      trackWebVital(metric);
    });
  }, []);

  return null; // This component doesn't render anything
}

function trackWebVital(metric: any) {
  // Send to Google Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(
        metric.name === 'CLS' ? metric.value * 1000 : metric.value
      ),
      non_interaction: true,
    });
  }

  // Send to custom analytics endpoint
  if (typeof window !== 'undefined') {
    fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'web-vital',
        name: metric.name,
        value: metric.value,
        id: metric.id,
        delta: metric.delta,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      }),
    }).catch(console.error);
  }

  // Log for development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: metric.value,
      rating: getVitalRating(metric.name, metric.value),
      delta: metric.delta,
      id: metric.id,
    });
  }
}

function getVitalRating(
  name: string,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = {
    CLS: [0.1, 0.25],
    FID: [100, 300],
    FCP: [1800, 3000],
    LCP: [2500, 4000],
    TTFB: [800, 1800],
  };

  const threshold = thresholds[name as keyof typeof thresholds];
  if (!threshold) return 'good';

  if (value <= threshold[0]) return 'good';
  if (value <= threshold[1]) return 'needs-improvement';
  return 'poor';
}

// Performance observer for additional metrics
export function PerformanceObserver() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Observe resource loading performance
    if ('PerformanceObserver' in window) {
      try {
        // Navigation timing
        const navigationObserver = new window.PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;

              // Track key navigation metrics
              const metrics = {
                dns: navEntry.domainLookupEnd - navEntry.domainLookupStart,
                connection: navEntry.connectEnd - navEntry.connectStart,
                ssl:
                  navEntry.secureConnectionStart > 0
                    ? navEntry.connectEnd - navEntry.secureConnectionStart
                    : 0,
                ttfb: navEntry.responseStart - navEntry.requestStart,
                download: navEntry.responseEnd - navEntry.responseStart,
                domInteractive: navEntry.domInteractive - navEntry.fetchStart,
                domComplete: navEntry.domComplete - navEntry.fetchStart,
                loadComplete: navEntry.loadEventEnd - navEntry.fetchStart,
              };

              // Send to analytics
              fetch('/api/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'navigation-timing',
                  metrics,
                  url: window.location.href,
                  timestamp: Date.now(),
                }),
              }).catch(console.error);
            }
          }
        });

        navigationObserver.observe({ entryTypes: ['navigation'] });

        // Resource timing
        const resourceObserver = new window.PerformanceObserver((list) => {
          const slowResources = list
            .getEntries()
            .filter((entry) => entry.duration > 1000) // Resources taking more than 1s
            .map((entry) => {
              const res = entry as PerformanceResourceTiming;
              return {
                name: res.name,
                duration: res.duration,
                size: (res as any).transferSize ?? 0,
                type: getResourceType(res.name),
              };
            });

          if (slowResources.length > 0) {
            fetch('/api/analytics', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'slow-resources',
                resources: slowResources,
                url: window.location.href,
                timestamp: Date.now(),
              }),
            }).catch(console.error);
          }
        });

        resourceObserver.observe({ entryTypes: ['resource'] });

        return () => {
          navigationObserver.disconnect();
          resourceObserver.disconnect();
        };
      } catch (error) {
        console.error('Performance observer error:', error);
      }
    }
  }, []);

  return null;
}

function getResourceType(url: string): string {
  if (url.match(/\.(js|mjs)$/)) return 'script';
  if (url.match(/\.(css)$/)) return 'stylesheet';
  if (url.match(/\.(jpg|jpeg|png|gif|svg|webp|avif)$/)) return 'image';
  if (url.match(/\.(woff|woff2|ttf|otf)$/)) return 'font';
  if (url.match(/\.(mp4|webm|ogg)$/)) return 'video';
  if (url.match(/\.(mp3|wav|ogg)$/)) return 'audio';
  return 'other';
}

// Component to optimize images for better LCP
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
}: OptimizedImageProps) {
  // Generate responsive image sources
  const generateSrcSet = (baseSrc: string) => {
    const sizes = [480, 768, 1024, 1280, 1920];
    return sizes.map((size) => `${baseSrc}?w=${size}&q=75 ${size}w`).join(', ');
  };

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;

    // Track image loading performance
    if (typeof window !== 'undefined' && 'performance' in window) {
      const entries = performance.getEntriesByName(img.src, 'resource');
      const entry = entries[entries.length - 1] as PerformanceResourceTiming;

      if (entry && entry.duration > 2000) {
        // Slow loading image
        fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'slow-image',
            src: img.src,
            duration: entry.duration,
            size: entry.transferSize || 0,
            timestamp: Date.now(),
          }),
        }).catch(console.error);
      }
    }
  };

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
      srcSet={generateSrcSet(src)}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onLoad={handleImageLoad}
      style={{
        maxWidth: '100%',
        height: 'auto',
        aspectRatio: width && height ? `${width}/${height}` : undefined,
      }}
    />
  );
}

// Critical resource preloader
export function ResourcePreloader() {
  useEffect(() => {
    // Preload critical resources
    const criticalResources = [
      {
        href: '/fonts/inter-var.woff2',
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous',
      },
      { href: '/images/logo.png', as: 'image' },
      { href: '/api/featured-content', as: 'fetch', crossOrigin: 'anonymous' },
    ];

    criticalResources.forEach((resource) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      if (resource.type) link.type = resource.type;
      if (resource.crossOrigin) link.crossOrigin = resource.crossOrigin;
      document.head.appendChild(link);
    });

    // Preconnect to external domains
    const preconnectDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://www.google-analytics.com',
      'https://www.googletagmanager.com',
    ];

    preconnectDomains.forEach((domain) => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      document.head.appendChild(link);
    });
  }, []);

  return null;
}

// Layout shift prevention
export function LayoutStabilizer() {
  useEffect(() => {
    // Add CSS to prevent common layout shifts
    const style = document.createElement('style');
    style.textContent = `
      /* Prevent layout shift from images */
      img[width][height] {
        aspect-ratio: attr(width) / attr(height);
      }
      
      /* Prevent layout shift from fonts */
      @font-face {
        font-family: 'Inter';
        font-display: swap;
        src: url('/fonts/inter-var.woff2') format('woff2');
      }
      
      /* Prevent layout shift from ads */
      .ad-container {
        min-height: 250px;
        background: #f5f5f5;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      /* Prevent layout shift from loading states */
      .skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
      }
      
      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      
      /* Reserve space for dynamic content */
      .content-placeholder {
        min-height: 200px;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null;
}

// Intersection Observer for lazy loading optimization
export function useLazyLoading(
  ref: React.RefObject<HTMLElement>,
  callback: () => void
) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback();
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, callback]);
}
