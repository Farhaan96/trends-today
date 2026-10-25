import { NextResponse } from 'next/server';
import { getAllArticles } from '@/lib/article-utils';
import { buildNewsSitemap } from '@/lib/news-sitemap';

export async function GET() {
  try {
    const articles = await getAllArticles();
    const sitemap = buildNewsSitemap(articles);

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating news sitemap:', error);

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  }
}

export const dynamic = 'force-dynamic';
