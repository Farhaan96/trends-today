'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';

// Analytics types are defined in src/types/global.d.ts

interface AnalyticsProps {
  googleAnalyticsId?: string;
  microsoftClarityId?: string;
  facebookPixelId?: string;
}

// Custom event tracking
export const trackEvent = (
  eventName: string,
  parameters?: Record<string, any>
) => {
  // Google Analytics 4
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      event_category: 'engagement',
      event_label: eventName,
      ...parameters,
    });
  }

  // Microsoft Clarity custom events
  if (typeof window !== 'undefined' && window.clarity) {
    window.clarity('event', eventName);
  }

  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', eventName, parameters);
  }

  // Console log for development
  if (process.env.NODE_ENV === 'development') {
    console.log('Analytics Event:', eventName, parameters);
  }
};

// Page view tracking
export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID!, {
      page_title: title,
      page_location: url,
    });
  }
};

// Article interaction tracking
export const trackArticleInteraction = (
  action: string,
  articleTitle: string,
  category: string
) => {
  trackEvent('article_interaction', {
    action,
    article_title: articleTitle,
    category,
    timestamp: new Date().toISOString(),
  });
};

// Newsletter subscription tracking
export const trackNewsletterSignup = (source: string) => {
  trackEvent('newsletter_signup', {
    source,
    timestamp: new Date().toISOString(),
  });
};

// Social sharing tracking
export const trackSocialShare = (platform: string, articleTitle: string) => {
  trackEvent('social_share', {
    platform,
    article_title: articleTitle,
    timestamp: new Date().toISOString(),
  });
};

// Scroll depth tracking
export const trackScrollDepth = (depth: number, articleTitle: string) => {
  trackEvent('scroll_depth', {
    depth: Math.round(depth),
    article_title: articleTitle,
  });
};

export default function Analytics({
  googleAnalyticsId = process.env.NEXT_PUBLIC_GA_ID,
  microsoftClarityId = process.env.NEXT_PUBLIC_CLARITY_ID,
  facebookPixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID,
}: AnalyticsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track page views
  useEffect(() => {
    const url = `${pathname}${searchParams ? `?${searchParams}` : ''}`;
    trackPageView(url);
  }, [pathname, searchParams]);

  // Set up scroll depth tracking
  useEffect(() => {
    let maxScrollDepth = 0;
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      if (scrollPercent > maxScrollDepth) {
        maxScrollDepth = scrollPercent;

        // Track at 25%, 50%, 75%, and 100% scroll depths
        const milestones = [25, 50, 75, 100];
        for (const milestone of milestones) {
          if (scrollPercent >= milestone && maxScrollDepth < milestone + 5) {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
              trackScrollDepth(milestone, document.title);
            }, 1000);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Set up time on page tracking
  useEffect(() => {
    const startTime = Date.now();

    const handleBeforeUnload = () => {
      const timeOnPage = Math.round((Date.now() - startTime) / 1000);
      trackEvent('time_on_page', {
        seconds: timeOnPage,
        page: pathname,
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [pathname]);

  return (
    <>
      {/* Google Analytics 4 */}
      {googleAnalyticsId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleAnalyticsId}', {
                page_title: document.title,
                page_location: window.location.href,
                send_page_view: true,
                anonymize_ip: true,
              });
            `}
          </Script>
        </>
      )}

      {/* Microsoft Clarity */}
      {microsoftClarityId && (
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${microsoftClarityId}");
          `}
        </Script>
      )}

      {/* Facebook Pixel */}
      {facebookPixelId && (
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${facebookPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}

      {/* Hotjar */}
      <Script id="hotjar" strategy="afterInteractive">
        {`
          (function(h,o,t,j,a,r){
            h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
            h._hjSettings={hjid:${process.env.NEXT_PUBLIC_HOTJAR_ID || 0},hjsv:6};
            a=o.getElementsByTagName('head')[0];
            r=o.createElement('script');r.async=1;
            r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
            a.appendChild(r);
          })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
        `}
      </Script>

      {/* Custom performance monitoring */}
      <Script id="performance-monitoring" strategy="afterInteractive">
        {`
          // Core Web Vitals monitoring
          function getCLS(onPerfEntry) {
            new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) {
                  onPerfEntry(entry);
                }
              }
            }).observe({entryTypes: ['layout-shift']});
          }

          function getFID(onPerfEntry) {
            new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                onPerfEntry(entry);
              }
            }).observe({entryTypes: ['first-input']});
          }

          function getFCP(onPerfEntry) {
            new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                if (entry.name === 'first-contentful-paint') {
                  onPerfEntry(entry);
                }
              }
            }).observe({entryTypes: ['paint']});
          }

          // Track Core Web Vitals
          getCLS((entry) => {
            if (window.gtag) {
              window.gtag('event', 'CLS', {
                event_category: 'Web Vitals',
                value: Math.round(entry.value * 1000),
              });
            }
          });

          getFID((entry) => {
            if (window.gtag) {
              window.gtag('event', 'FID', {
                event_category: 'Web Vitals',
                value: Math.round(entry.processingStart - entry.startTime),
              });
            }
          });

          getFCP((entry) => {
            if (window.gtag) {
              window.gtag('event', 'FCP', {
                event_category: 'Web Vitals',
                value: Math.round(entry.startTime),
              });
            }
          });
        `}
      </Script>
    </>
  );
}
