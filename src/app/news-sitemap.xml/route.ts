import { NextResponse } from 'next/server';
import { getAllArticles } from '@/lib/article-utils';

function safeCdata(value: string): string {
  return value.replace(/]]>/g, ']]]]><![CDATA[>');
}

export async function GET() {
  try {
    const articles = await getAllArticles();
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const recentNews = articles.filter((article) => {
      const publishedAt = article.frontmatter?.publishedAt;
      if (!publishedAt) return false;
      const publishedDate = new Date(publishedAt);
      return (
        !Number.isNaN(publishedDate.getTime()) && publishedDate >= twoDaysAgo
      );
    });

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || 'https://www.trendstoday.ca';

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${recentNews
  .map(
    (article) => `  <url>
    <loc>${siteUrl}/${article.category}/${article.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>Trends Today</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${new Date(article.publishedAt).toISOString()}</news:publication_date>
      <news:title><![CDATA[${safeCdata(article.title)}]]></news:title>
      <news:keywords>${article.category}</news:keywords>
    </news:news>
  </url>`
  )
  .join('\n')}
</urlset>`;

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
