import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    // Exact legacy paths preserve real article routes and the concrete comparison.
    return [
      ...[
        'best-smartphones',
        'best-laptops',
        'best-headphones',
        'best-smart-home',
        'best-gaming-gear',
        'best-cameras',
        'budget',
        'mid-range',
        'premium',
      ].map((slug) => ({
        source: `/best/${slug}`,
        destination: '/best',
        permanent: true,
      })),
      ...[
        'iphone-15-pro-vs-samsung-galaxy-s24-ultra',
        'macbook-air-m2-vs-dell-xps-13',
        'playstation-5-vs-xbox-series-x',
        'airpods-pro-vs-sony-wh-1000xm5',
        'ipad-pro-vs-microsoft-surface-pro',
        'google-pixel-8-pro-vs-iphone-15-pro',
        'nintendo-switch-vs-steam-deck',
        'macbook-pro-vs-thinkpad-x1-carbon',
      ].map((slug) => ({
        source: `/compare/${slug}`,
        destination: '/compare',
        permanent: true,
      })),
    ];
  },
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
