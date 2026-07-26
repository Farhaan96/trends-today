import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Trends Today | Lower Mainland News and Events',
  description:
    'Local news, transit, events, food, housing, and sports from Vancouver and the Lower Mainland.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://www.trendstoday.ca'
  ),
  openGraph: {
    title: 'Trends Today',
    description:
      'Useful local updates from Vancouver, Metro Vancouver, and the Fraser Valley.',
    url: '/',
    siteName: 'Trends Today',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trends Today',
    description:
      'Local news, transit, events, food, housing, and sports from the Lower Mainland.',
  },
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
