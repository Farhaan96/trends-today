import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { CONTENT_CATEGORIES } from '@/lib/categories';

interface ArticleSummary {
  title: string;
  category: string;
  publishedAt: string | null;
  slug: string;
}

function configured(name: string): boolean {
  return Boolean(process.env[name]?.trim());
}

export async function GET() {
  try {
    const content = await getContentStats();
    return NextResponse.json({
      success: true,
      data: {
        content,
        measurement: {
          vercelWebAnalytics: {
            status: 'enabled-in-site',
            note: 'Page-view collection is embedded. Provider data is not exposed by this repository endpoint.',
          },
          googleAnalytics: {
            status: configured('NEXT_PUBLIC_GOOGLE_ANALYTICS_ID')
              ? 'configured'
              : 'unavailable',
          },
          googleSearchConsole: {
            propertyStatus: configured('GOOGLE_SEARCH_CONSOLE_SITE_URL')
              ? 'configured'
              : 'unavailable',
            dataExportStatus:
              configured('GOOGLE_SEARCH_CONSOLE_SITE_URL') &&
              configured('GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN')
                ? 'configured'
                : 'unavailable',
            status:
              configured('GOOGLE_SEARCH_CONSOLE_SITE_URL') &&
              configured('GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN')
                ? 'configured'
                : 'unavailable',
          },
          missingRule: 'Unavailable metrics are never represented as zero.',
        },
        growth: {
          status: 'unavailable',
          reason:
            'No verified article-level analytics source is connected to this endpoint.',
          projections: [],
        },
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Analytics inventory error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

async function getContentStats() {
  const contentDir = path.join(process.cwd(), 'content');
  const byCategory: Record<string, number> = {};
  const recentArticles: ArticleSummary[] = [];

  for (const category of CONTENT_CATEGORIES) {
    const categoryDir = path.join(contentDir, category);
    try {
      const files = (await fs.readdir(categoryDir)).filter(
        (file) => file.endsWith('.mdx') && !file.endsWith('.backup.mdx')
      );
      byCategory[category] = files.length;

      for (const file of files) {
        const source = await fs.readFile(path.join(categoryDir, file), 'utf-8');
        const frontmatter = parseFrontmatter(source);
        recentArticles.push({
          title: frontmatter.title || file.replace(/\.mdx$/, ''),
          category,
          publishedAt: frontmatter.publishedAt || null,
          slug: frontmatter.slug || file.replace(/\.mdx$/, ''),
        });
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      byCategory[category] = 0;
    }
  }

  recentArticles.sort((a, b) => {
    const aTime = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const bTime = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return bTime - aTime;
  });

  return {
    totalArticles: Object.values(byCategory).reduce(
      (sum, count) => sum + count,
      0
    ),
    byCategory,
    recentArticles: recentArticles.slice(0, 10),
  };
}

function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  const frontmatter: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const colonIndex = line.indexOf(':');
    if (colonIndex <= 0 || /^\s/.test(line)) continue;
    const key = line.slice(0, colonIndex).trim();
    const value = line
      .slice(colonIndex + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
    frontmatter[key] = value;
  }
  return frontmatter;
}

export const dynamic = 'force-dynamic';
