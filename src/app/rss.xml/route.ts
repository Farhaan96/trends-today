import { NextResponse } from 'next/server';
import { getAllArticles } from '@/lib/article-utils';
import { buildRssFeed, type RssSource } from '@/lib/rss';

export const revalidate = 900;

export async function GET() {
  const articles = await getAllArticles();
  const sources: RssSource[] = articles.map((article) => ({
    title: article.frontmatter?.title || article.title,
    description: article.frontmatter?.description || article.description,
    category: article.category,
    slug: article.slug,
    status: article.frontmatter?.status,
    updatedAt: article.frontmatter?.updatedAt,
    modifiedAt: article.frontmatter?.modifiedAt,
    publishedAt: article.frontmatter?.publishedAt,
    datePublished: article.frontmatter?.datePublished,
  }));

  return new NextResponse(buildRssFeed(sources), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=900, stale-while-revalidate=86400',
    },
  });
}
