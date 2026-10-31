export interface TodayFileItem {
  label?: unknown;
  text?: unknown;
  href?: unknown;
}

export interface TodayFile {
  date?: unknown;
  items?: unknown;
}

export interface TodayPost {
  href: string;
  title: string;
  category: string;
  image?: string;
  imageAlt?: string;
  imageAttribution?: string;
  imageSourceType?: string;
  storyType?: string;
  updatedAt?: unknown;
  modifiedAt?: unknown;
  publishedAt?: unknown;
  datePublished?: unknown;
  status?: unknown;
}

export interface TodayBullet {
  label: string;
  text: string;
  href: string;
  category: string;
  image?: string;
  imageAlt?: string;
  imageAttribution?: string;
  imageSourceType?: string;
  storyType?: string;
  dateTime?: string;
  dateLabel?: string;
}

export interface TodayBriefModel {
  mode: 'today' | 'latest';
  heading: string;
  dateTime?: string;
  dateLabel?: string;
  items: TodayBullet[];
}

const LOCAL_CATEGORIES = new Set([
  'local-news',
  'transit',
  'things-to-do',
  'food-drink',
  'housing',
  'sports',
]);

const CATEGORY_LABELS: Record<string, string> = {
  transit: 'Transit',
  'local-news': 'Local news',
  'things-to-do': 'Things to do',
  'food-drink': 'Food & drink',
  housing: 'Housing',
  sports: 'Sports',
};

function clean(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function timestamp(value: unknown): string | undefined {
  const trimmed = clean(value);
  if (!trimmed || !Number.isFinite(Date.parse(trimmed))) return undefined;
  return trimmed;
}

export function isLiveBriefStatus(status: unknown): boolean {
  const value = String(status ?? '')
    .trim()
    .toLowerCase();
  return value === '' || value === 'published';
}

export function briefUpdatedValue(post: TodayPost): string | undefined {
  return (
    timestamp(post.updatedAt) ||
    timestamp(post.modifiedAt) ||
    timestamp(post.publishedAt) ||
    timestamp(post.datePublished)
  );
}

export function vancouverDateKey(now: string | Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Vancouver',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(now));
}

function formatCalendarDay(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  if (!year || !month || !day) return dateKey;
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';
  return `${read('weekday').replace(/\./g, '')} ${read('month').replace(/\./g, '')} ${read('day')}`;
}

function formatStoryDay(iso: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Vancouver',
    month: 'short',
    day: 'numeric',
  }).formatToParts(new Date(iso));
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';
  return `${read('month').replace(/\./g, '')} ${read('day')}`;
}

function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] || 'Local news';
}

function livePosts(posts: TodayPost[]): TodayPost[] {
  return posts
    .filter(
      (post) =>
        isLiveBriefStatus(post.status) &&
        clean(post.href).startsWith('/') &&
        clean(post.title) &&
        briefUpdatedValue(post)
    )
    .sort(
      (a, b) =>
        Date.parse(briefUpdatedValue(b) || '') -
        Date.parse(briefUpdatedValue(a) || '')
    );
}

function latestBullets(posts: TodayPost[]): TodayBullet[] {
  const live = livePosts(posts);
  const local = live.filter((post) => LOCAL_CATEGORIES.has(post.category));
  const chosen = (local.length >= 3 ? local : live).slice(0, 4);
  return chosen.map((post) => {
    const iso = briefUpdatedValue(post) || '';
    return {
      label: categoryLabel(post.category),
      text: clean(post.title),
      href: clean(post.href),
      category: post.category,
      image: clean(post.image) || undefined,
      imageAlt: clean(post.imageAlt) || undefined,
      imageAttribution: clean(post.imageAttribution) || undefined,
      imageSourceType: clean(post.imageSourceType) || undefined,
      storyType: clean(post.storyType) || undefined,
      dateTime: iso,
      dateLabel: formatStoryDay(iso),
    };
  });
}

function fileItems(file: TodayFile, posts: TodayPost[]): TodayBullet[] {
  if (!Array.isArray(file.items)) return [];
  const live = new Map(livePosts(posts).map((post) => [post.href, post]));
  const items: TodayBullet[] = [];
  for (const raw of file.items) {
    if (!raw || typeof raw !== 'object') continue;
    const item = raw as TodayFileItem;
    const label = clean(item.label);
    const text = clean(item.text);
    const href = clean(item.href);
    const post = live.get(href);
    if (!label || !text || !post) continue;
    const iso = briefUpdatedValue(post);
    items.push({
      label,
      text,
      href,
      category: post.category,
      image: clean(post.image) || undefined,
      imageAlt: clean(post.imageAlt) || undefined,
      imageAttribution: clean(post.imageAttribution) || undefined,
      imageSourceType: clean(post.imageSourceType) || undefined,
      storyType: clean(post.storyType) || undefined,
      dateTime: iso,
      dateLabel: iso ? formatStoryDay(iso) : undefined,
    });
    if (items.length === 5) break;
  }
  return items;
}

export function buildTodayBrief(input: {
  file: TodayFile | null;
  posts: TodayPost[];
  now: string | Date;
}): TodayBriefModel {
  const today = vancouverDateKey(input.now);
  const fileDate = clean(input.file?.date);
  const curated =
    input.file && fileDate === today ? fileItems(input.file, input.posts) : [];

  if (curated.length >= 3) {
    return {
      mode: 'today',
      heading: 'Today in the Lower Mainland',
      dateTime: today,
      dateLabel: formatCalendarDay(today),
      items: curated,
    };
  }

  return {
    mode: 'latest',
    heading: 'Latest in the Lower Mainland',
    items: latestBullets(input.posts),
  };
}
