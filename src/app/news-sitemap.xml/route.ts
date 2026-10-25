import { NextResponse } from 'next/server';
import { getAllArticles, type Article } from '@/lib/article-utils';
import {
  articlePublishedAt,
  canonicalArticleUrl,
  selectNewsArticles,
} from '@/lib/article-policy';

function safeCdata(value: string): string {
  return value.replace(/]]>/g, ']]]]><![CDATA[>');
}

export async function GET() {
  try {
    const articles = await getAllArticles();
    const recentNews = selectNewsArticles(articles) as Article[];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${recentNews
  .map(
    (article) => `  <url>
    <loc>${canonicalArticleUrl(article.category, article.slug)}</loc>
    <news:news>
      <news:publication>
        <news:name>Trends Today</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${articlePublishedAt(article.frontmatter)}</news:publication_date>
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
