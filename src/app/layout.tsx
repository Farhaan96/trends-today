import type { Metadata } from 'next';
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
    default:
      "Trends Today - Discover What's Trending in Science, Culture, Technology & More",
    template: '%s | Trends Today',
  },
  description:
    "Explore trending discoveries, breakthrough research, and fascinating insights across science, psychology, technology, culture, and more. Your daily source for what's new and noteworthy.",
  keywords: [
    'trending topics',
    'scientific discoveries',
    'psychology insights',
    'cultural phenomena',
    'technology breakthroughs',
    'health research',
    'environmental news',
    'future predictions',
    'mysteries explained',
    'lifestyle trends',
    "what's trending today",
  ],
  authors: [
    {
      name: 'Trends Today Editorial Team',
      url: 'https://www.trendstoday.ca/authors',
    },
  ],
  creator: 'Trends Today',
  publisher: 'Trends Today',
  category: 'Technology',
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
    title: "Trends Today - Discover What's Trending Across All Topics",
    description:
      "Daily discoveries and insights across science, culture, technology, psychology, and more. Explore what's trending and why it matters.",
    images: [
      {
        url: '/images/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Trends Today - Tech Reviews and Buying Guides',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Trends Today - What's Trending Now",
    description:
      'Discover breakthrough findings and trending topics across science, culture, tech, and more.',
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
    analyticsCandidate && !analyticsCandidate.toUpperCase().includes('XXXX')
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

        {analyticsId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${analyticsId}', {
              page_title: document.title,
              page_location: window.location.href,
              custom_map: {
                'custom_parameter_1': 'seo_score',
                'custom_parameter_2': 'content_type'
              }
            });
          `}
            </Script>
          </>
        )}

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
                Useful reporting for people who want to understand what is
                changing.
              </p>
            </div>
            <nav className="site-footer__links" aria-label="Footer navigation">
              <Link href="/about">About</Link>
              <Link href="/authors">Authors</Link>
              <Link href="/editorial-standards">Editorial standards</Link>
              <Link href="/how-we-test">How we test</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/contact">Contact</Link>
            </nav>
          </div>
          <div className="site-shell site-footer__legal">
            <span>&copy; {new Date().getFullYear()} Trends Today</span>
            <span>All rights reserved.</span>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
