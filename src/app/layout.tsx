import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import StickyNavigation from '@/components/ui/StickyNavigation';
import BackToTop from '@/components/ui/BackToTop';
import ReadingProgressBar from '@/components/ui/ReadingProgressBar';
import { OrganizationSchema, WebsiteSchema } from '@/components/seo/SchemaMarkup';
import Script from 'next/script';
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://trendstoday.ca'),
  title: {
    default: "Trends Today - Tech Reviews, Comparisons & Buying Guides",
    template: "%s | Trends Today"
  },
  description: "Your trusted source for in-depth tech reviews, product comparisons, and comprehensive buying guides. Expert analysis from tech professionals with 25+ years experience.",
  keywords: ["tech reviews", "product comparisons", "buying guides", "technology news", "tech trends", "gadget reviews", "smartphone reviews", "laptop reviews", "best tech 2025"],
  authors: [{ name: "Trends Today Editorial Team", url: "https://trendstoday.ca/authors" }],
  creator: "Trends Today",
  publisher: "Trends Today",
  category: "Technology",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://trendstoday.ca",
    siteName: "Trends Today",
    title: "Trends Today - Expert Tech Reviews & Buying Guides",
    description: "Expert tech reviews from professionals with 25+ years experience. Unbiased analysis of smartphones, laptops, headphones and more.",
    images: [
      {
        url: "/images/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Trends Today - Tech Reviews and Buying Guides",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trends Today - Expert Tech Reviews",
    description: "Expert tech reviews from professionals with 25+ years experience.",
    site: "@trendstoday",
    creator: "@trendstoday",
    images: ["/images/twitter-card.jpg"],
  },
  alternates: {
    canonical: "https://trendstoday.ca",
    types: {
      'application/rss+xml': [
        { url: '/feed.xml', title: 'Trends Today RSS Feed' },
      ],
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  other: {
    'google-adsense-account': 'ca-pub-xxxxxxxxxxxxxxxx',
    'monetization': '$ilp.uphold.com/your-payment-pointer',
    'apple-mobile-web-app-title': 'Trends Today',
    'application-name': 'Trends Today',
    'msapplication-TileColor': '#0070f3',
    'theme-color': '#0070f3',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* SEO Schema Markup */}
        <OrganizationSchema />
        <WebsiteSchema />
        
        
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX', {
              page_title: document.title,
              page_location: window.location.href,
              custom_map: {
                'custom_parameter_1': 'seo_score',
                'custom_parameter_2': 'content_type'
              }
            });
          `}
        </Script>

        {/* Google AdSense - Will be activated when approved */}
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-xxxxxxxxxxxxxxxx"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />


        {/* Additional SEO Meta Tags */}
        <meta name="google-adsense-account" content="ca-pub-xxxxxxxxxxxxxxxx" />
        <meta name="monetization" content="$ilp.uphold.com/your-payment-pointer" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* Preconnect to improve loading performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        
        {/* Favicon and PWA Icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col bg-white text-gray-900`}
      >
        <ReadingProgressBar />
        <Header />
        <StickyNavigation />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <BackToTop />
        {/* Vercel Web Analytics */}
        <Analytics />
      </body>
    </html>
  );
}
