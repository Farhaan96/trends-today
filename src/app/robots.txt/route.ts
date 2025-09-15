import { NextResponse } from 'next/server';

export function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://trendstoday.ca';

  const robotsTxt = `User-agent: *
Allow: /

# Block admin and API routes
Disallow: /api/
Disallow: /_next/
Disallow: /admin/

# Allow all crawlers access to sitemaps
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/news-sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Special rules for specific bots
User-agent: Googlebot
Allow: /

User-agent: Bingbot  
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
