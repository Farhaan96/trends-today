import { cache } from 'react';
import { getAllArticles } from '@/lib/article-utils';
import {
  formatEditionDate,
  formatRelativeUpdate,
  isLivePostStatus,
  pickNewestUpdatedIso,
  type FreshnessFields,
} from '@/lib/freshness';

export interface SiteFreshness {
  iso: string;
  label: string;
  editionDate: string;
}

export const getSiteFreshness = cache(
  async (): Promise<SiteFreshness | null> => {
    const articles = await getAllArticles();
    const posts: FreshnessFields[] = [];

    for (const article of articles) {
      const frontmatter = article.frontmatter || {};
      if (!isLivePostStatus(frontmatter.status)) continue;
      posts.push({
        updatedAt: frontmatter.updatedAt,
        modifiedAt: frontmatter.modifiedAt,
        publishedAt: frontmatter.publishedAt,
        datePublished: frontmatter.datePublished,
      });
    }

    const iso = pickNewestUpdatedIso(posts);

    if (!iso) return null;
    const label = formatRelativeUpdate(iso, new Date());
    const editionDate = formatEditionDate(iso);
    if (!label || !editionDate) return null;
    if (/[—–]/.test(`${label} ${editionDate}`)) return null;
    return { iso, label, editionDate };
  }
);
