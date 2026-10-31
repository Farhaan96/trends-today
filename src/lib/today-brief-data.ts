import fs from 'fs';
import path from 'path';
import { getAllArticles } from './article-utils';
import {
  buildTodayBrief,
  type TodayBriefModel,
  type TodayFile,
  type TodayPost,
} from './today-brief';

export function readTodayFile(): TodayFile | null {
  try {
    const filePath = path.join(process.cwd(), 'content', 'today.json');
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as TodayFile;
  } catch {
    return null;
  }
}

export async function getTodayBriefData(
  now: string | Date = new Date()
): Promise<TodayBriefModel> {
  const articles = await getAllArticles();
  const posts: TodayPost[] = articles.map((article) => ({
    href: `/${article.category}/${article.slug}`,
    title: article.frontmatter?.title || article.title,
    category: article.category,
    image: article.frontmatter?.image || article.frontmatter?.images?.featured,
    imageAlt: article.frontmatter?.imageAlt,
    imageAttribution: article.frontmatter?.imageAttribution,
    imageSourceType: article.frontmatter?.imageSourceType,
    storyType: article.frontmatter?.storyType,
    updatedAt: article.frontmatter?.updatedAt,
    modifiedAt: article.frontmatter?.modifiedAt,
    publishedAt: article.frontmatter?.publishedAt,
    datePublished: article.frontmatter?.datePublished,
    status: article.frontmatter?.status,
  }));

  return buildTodayBrief({
    file: readTodayFile(),
    posts,
    now,
  });
}
