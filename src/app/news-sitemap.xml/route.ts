import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import matter from 'gray-matter';

export async function GET(request: NextRequest) {
  try {
    const newsDir = path.join(process.cwd(), 'content', 'news');

    let newsArticles: any[] = [];

    // Check if news directory exists
    if (fs.existsSync(newsDir)) {
      const files = fs
        .readdirSync(newsDir)
        .filter((file) => file.endsWith('.mdx'));

      newsArticles = files.map((file) => {
        const filePath = path.join(newsDir, file);
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const { data } = matter(fileContents);

        return {
          slug: file.replace('.mdx', ''),
          ...data,
        };
      });
    }

    // Filter to last 48 hours for news sitemap
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const recentNews = newsArticles.filter((article) => {
      const publishedDate = new Date(article.publishedAt);
      return publishedDate >= twoDaysAgo;
    });

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || 'https://trendstoday.ca';

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${recentNews
  .map(
    (article) => `  <url>
    <loc>${siteUrl}/news/${article.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>Trends Today</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${new Date(article.publishedAt).toISOString()}</news:publication_date>
      <news:title><![CDATA[${article.title}]]></news:title>
      <news:keywords>${article.category || 'technology'}</news:keywords>
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

    // Return minimal sitemap on error
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
