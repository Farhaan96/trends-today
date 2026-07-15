import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // The compare index reads MDX from content/ at build/runtime. Next's file
  // tracer otherwise treats process.cwd() as unconstrained and copies every
  // public image into this function, even though Vercel serves public/ as
  // static assets outside the function bundle.
  outputFileTracingExcludes: {
    '/compare': ['./public/**/*', './apps/web/public/**/*'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Allow remote images used by dynamic fallbacks (Unsplash/Pexels)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'source.unsplash.com' },
      // In case absolute self-URLs are ever used
      { protocol: 'https', hostname: 'trendstoday.ca' },
      { protocol: 'https', hostname: 'www.trendstoday.ca' },
    ],
  },
};

export default nextConfig;
