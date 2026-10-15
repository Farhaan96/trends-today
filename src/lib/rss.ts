const CANONICAL_ORIGIN = 'https://trendstoday.ca';
export const RSS_ITEM_LIMIT = 50;

export interface RssSource {
  title?: unknown;
  description?: unknown;
  category?: unknown;
  slug?: unknown;
  status?: unknown;
  updatedAt?: unknown;
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

/** updatedAt when present, otherwise publishedAt, then datePublished. */
export function rssUpdatedValue(source: RssSource): string | undefined {
  return (
    timestamp(source.updatedAt) ||
    timestamp(source.publishedAt) ||
    timestamp(source.datePublished)
  );
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

export function selectRssItems(
  sources: RssSource[],
  limit = RSS_ITEM_LIMIT
): RssItem[] {
  return sources
    .flatMap((source) => {
      if (!isLiveRssStatus(source.status)) return [];
      const title = cleanText(source.title);
      const category = cleanText(source.category);
      const slug = cleanText(source.slug);
      const updated = rssUpdatedValue(source);
      if (!title || !category || !slug || !updated) return [];
      return [
        {
          title,
          link: canonicalPostUrl(category, slug),
          pubDate: new Date(updated).toUTCString(),
          description: cleanText(source.description),
          category,
          sortTime: Date.parse(updated),
        },
      ];
    })
    .sort((a, b) => b.sortTime - a.sortTime)
    .slice(0, limit)
    .map((item) => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      description: item.description,
      category: item.category,
    }));
}

export function renderRss(items: RssItem[]): string {
  const itemXml = items
    .map(
      (item) => `    <item>
      <title>${xmlEscape(item.title)}</title>
      <link>${xmlEscape(item.link)}</link>
      <pubDate>${xmlEscape(item.pubDate)}</pubDate>
      <description>${xmlEscape(item.description)}</description>
      <category>${xmlEscape(item.category)}</category>
    </item>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Trends Today</title>
    <link>${CANONICAL_ORIGIN}</link>
    <description>Local news, transit, events, food, housing, and sports from Vancouver and the Lower Mainland.</description>
${itemXml}
  </channel>
</rss>
`;
}

export function buildRssFeed(
  sources: RssSource[],
  limit = RSS_ITEM_LIMIT
): string {
  return renderRss(selectRssItems(sources, limit));
}
