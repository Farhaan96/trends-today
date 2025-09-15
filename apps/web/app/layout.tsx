import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Trends Today - Tech News & Reviews',
  description: 'Discover the latest in technology, gadgets, AI, and innovation',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://trends-today.vercel.app'
  ),
  openGraph: {
    title: 'Trends Today',
    description: 'Discover the latest in technology',
    url: '/',
    siteName: 'Trends Today',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trends Today',
    description: 'Discover the latest in technology',
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
