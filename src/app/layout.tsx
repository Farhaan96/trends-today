import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DM_Sans, Newsreader } from 'next/font/google';
import Link from 'next/link';
import './globals.css';
import EditorialHeader from '@/components/editorial/EditorialHeader';
import {
  OrganizationSchema,
  WebsiteSchema,
} from '@/components/seo/SchemaMarkup';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';

const sans = DM_Sans({
  variable: '--font-ui',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  weight: ['400', '500', '600', '700'],
  fallback: ['system-ui', '-apple-system', 'sans-serif'],
});

const display = Newsreader({
  variable: '--font-editorial',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  weight: ['400', '500', '600', '700'],
  fallback: ['Georgia', 'serif'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.trendstoday.ca'),
  title: {
    default: 'Trends Today | Lower Mainland News and Events',
    template: '%s | Trends Today',
  },
  description:
    'Local news, transit, events, food, housing, and sports from Vancouver and the Lower Mainland.',
  keywords: [
    'Lower Mainland news',
    'Vancouver news',
    'Metro Vancouver events',
    'TransLink updates',
    'Vancouver restaurants',
    'Lower Mainland housing',
    'Surrey news',
    'Burnaby news',
    'Richmond news',
  ],
  authors: [
    {
      name: 'Trends Today Editorial Team',
      url: 'https://www.trendstoday.ca/authors',
    },
  ],
  creator: 'Trends Today',
  publisher: 'Trends Today',
  category: 'Local News',
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
    type: 'website',
    locale: 'en_US',
    url: 'https://www.trendstoday.ca',
    siteName: 'Trends Today',
    title: 'Trends Today | Lower Mainland News and Events',
    description:
      'Useful local updates from Vancouver, Metro Vancouver, and the Fraser Valley.',
    images: [
      {
        url: '/images/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Trends Today Lower Mainland news',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trends Today | Lower Mainland News',
    description:
      'Local news, transit, events, food, housing, and sports from the Lower Mainland.',
    site: '@trendstoday',
    creator: '@trendstoday',
    images: ['/images/twitter-card.jpg'],
  },
  alternates: {
    types: {
      'application/rss+xml': [
        { url: '/feed.xml', title: 'Trends Today RSS Feed' },
      ],
    },
  },
  other: {
    'apple-mobile-web-app-title': 'Trends Today',
    'application-name': 'Trends Today',
    'msapplication-TileColor': '#e5483e',
    'theme-color': '#f5f2eb',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const analyticsCandidate = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
  const adsenseCandidate = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT;
  const analyticsId =
    analyticsCandidate && /^G-[A-Z0-9]+$/i.test(analyticsCandidate)
      ? analyticsCandidate
      : undefined;
  const adsenseClient =
    adsenseCandidate && /^ca-pub-\d{16}$/.test(adsenseCandidate)
      ? adsenseCandidate
      : undefined;

  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <head>
        {/* SEO Schema Markup */}
        <OrganizationSchema />
        <WebsiteSchema />

        {adsenseClient && (
          <Script
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}

        {adsenseClient && (
          <meta name="google-adsense-account" content={adsenseClient} />
        )}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />

        {/* Preconnect to improve loading performance */}
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />

        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="//www.google-analytics.com" />

        {/* Favicon and PWA Icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>

      <body className="site-body">
        <EditorialHeader />
        <main id="main-content" className="site-main">
          {children}
        </main>
        <footer className="site-footer">
          <div className="site-shell site-footer__inner">
            <div>
              <Link
                href="/"
                className="site-wordmark"
                aria-label="Trends Today home"
              >
                <span className="site-wordmark__mark" aria-hidden="true">
                  T
                </span>
                <span>Trends Today</span>
              </Link>
              <p className="site-footer__statement">
                Useful local reporting from Vancouver to the Fraser Valley.
              </p>
            </div>
            <nav className="site-footer__links" aria-label="Footer navigation">
              <Link href="/about">About</Link>
              <Link href="/authors">Authors</Link>
              <Link href="/editorial-standards">Editorial standards</Link>
              <Link href="/how-we-test">How we test</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/advertise">Advertise</Link>
              <Link href="/contact">Contact</Link>
            </nav>
          </div>
          <div className="site-shell site-footer__legal">
            <span>&copy; {new Date().getFullYear()} Trends Today</span>
            <span>All rights reserved.</span>
          </div>
        </footer>
        {analyticsId && (
          <Suspense fallback={null}>
            <GoogleAnalytics measurementId={analyticsId} />
          </Suspense>
        )}
        <Analytics />
      </body>
    </html>
  );
}
