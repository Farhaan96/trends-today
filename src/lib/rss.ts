const CANONICAL_ORIGIN = 'https://www.trendstoday.ca';
export const RSS_ITEM_LIMIT = 50;

export interface RssSource {
  title?: unknown;
  description?: unknown;
  category?: unknown;
  slug?: unknown;
  status?: unknown;
  updatedAt?: unknown;
  modifiedAt?: unknown;
  publishedAt?: unknown;
  datePublished?: unknown;
}

export interface RssItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  category: string;
}

function cleanText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function timestamp(value: unknown): string | undefined {
  const trimmed = cleanText(value);
  if (!trimmed || !Number.isFinite(Date.parse(trimmed))) return undefined;
  return trimmed;
}

export function isLiveRssStatus(status: unknown): boolean {
  const value = String(status ?? '')
    .trim()
    .toLowerCase();
  return value === '' || value === 'published';
}

/** First parseable value wins: updatedAt, modifiedAt, publishedAt, datePublished. */
export function rssFreshnessValue(source: RssSource): string | undefined {
  return (
    timestamp(source.updatedAt) ||
    timestamp(source.modifiedAt) ||
    timestamp(source.publishedAt) ||
    timestamp(source.datePublished)
  );
}

/** Item pubDate stays the publish date, not a later revision. */
export function rssPublishValue(source: RssSource): string | undefined {
  return timestamp(source.publishedAt) || timestamp(source.datePublished);
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function canonicalPostUrl(category: string, slug: string): string {
  const path = `${category}/${slug}`
    .split('/')
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join('/');
  return `${CANONICAL_ORIGIN}/${path}`;
}

interface RankedRssItem extends RssItem {
  sortTime: number;
}

export function rankRssItems(sources: RssSource[]): RankedRssItem[] {
  return sources
    .flatMap((source) => {
      if (!isLiveRssStatus(source.status)) return [];
      const title = cleanText(source.title);
      const category = cleanText(source.category);
      const slug = cleanText(source.slug);
      const freshness = rssFreshnessValue(source);
      const published = rssPublishValue(source);
      if (!title || !category || !slug || !freshness || !published) return [];
      return [
        {
          title,
          link: canonicalPostUrl(category, slug),
          pubDate: new Date(published).toUTCString(),
          description: cleanText(source.description),
          category,
          sortTime: Date.parse(freshness),
        },
      ];
    })
    .sort((a, b) => b.sortTime - a.sortTime);
}

export function selectRssItems(
  sources: RssSource[],
  limit = RSS_ITEM_LIMIT
): RssItem[] {
  return rankRssItems(sources)
    .slice(0, limit)
    .map((item) => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      description: item.description,
      category: item.category,
    }));
}

export function renderRss(items: RssItem[], lastBuildDate?: string): string {
  const itemXml = items
    .map(
      (item) => `    <item>
      <title>${xmlEscape(item.title)}</title>
      <link>${xmlEscape(item.link)}</link>
      <guid isPermaLink="true">${xmlEscape(item.link)}</guid>
      <pubDate>${xmlEscape(item.pubDate)}</pubDate>
      <description>${xmlEscape(item.description)}</description>
      <category>${xmlEscape(item.category)}</category>
    </item>`
    )
    .join('\n');
  const lastBuild = lastBuildDate
    ? `    <lastBuildDate>${xmlEscape(lastBuildDate)}</lastBuildDate>\n`
    : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Trends Today</title>
    <link>${CANONICAL_ORIGIN}</link>
    <atom:link rel="self" href="${CANONICAL_ORIGIN}/rss.xml" type="application/rss+xml" />
    <description>Local news, transit, events, food, housing, and sports from Vancouver and the Lower Mainland.</description>
${lastBuild}${itemXml}
  </channel>
</rss>
`;
}

export function buildRssFeed(
  sources: RssSource[],
  limit = RSS_ITEM_LIMIT
): string {
  const ranked = rankRssItems(sources).slice(0, limit);
  const lastBuildDate = ranked[0]
    ? new Date(ranked[0].sortTime).toUTCString()
    : undefined;
  return renderRss(
    ranked.map((item) => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      description: item.description,
      category: item.category,
    })),
    lastBuildDate
  );
}
