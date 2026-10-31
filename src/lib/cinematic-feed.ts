import { isGeneratedIllustration } from './illustration-caption';

export interface LocalStory {
  href: string;
  title: string;
  description?: string;
  category: string;
  image?: string;
  imageAlt?: string;
  imageAttribution?: string;
  imageSourceType?: string;
  storyType?: string;
  publishedAt?: string;
  eventEndDate?: string;
  locality?: string;
  city?: string;
}

export type ImageFit = 'cover' | 'contain';

export interface HomepageImageResult {
  src?: string;
  illustration: boolean;
  fit: ImageFit;
}

// Official maps, data cards and logos carry readable detail at the edges, such
// as a map legend or a source line. Cropping them loses that detail, so they
// are always shown whole on a neutral panel. Photographs and illustrations
// have no edge detail to protect and keep filling their box.
const CONTAIN_SOURCE_TYPES = new Set([
  'official-map',
  'official-source',
  'official-logo',
  'official-document',
  'data-card',
  'chart',
  'diagram',
  'infographic',
  'map',
  'screenshot',
]);

export function imageFit(sourceType?: string): ImageFit {
  const source = String(sourceType || '')
    .trim()
    .toLowerCase();
  return CONTAIN_SOURCE_TYPES.has(source) ? 'contain' : 'cover';
}

export function homepageImage(
  story: Pick<
    LocalStory,
    'category' | 'image' | 'imageAttribution' | 'imageSourceType' | 'storyType'
  >
): HomepageImageResult {
  const image = story.image?.trim() || undefined;
  const fit = imageFit(story.imageSourceType);
  const generated = isGeneratedIllustration(
    story.imageAttribution,
    story.imageSourceType
  );
  if (!generated) return { src: image, illustration: false, fit };

  const allowsIllustration =
    story.category === 'things-to-do' ||
    story.storyType?.trim().toLowerCase().startsWith('evergreen') === true;
  if (allowsIllustration) {
    return { src: image, illustration: true, fit };
  }
  return { src: undefined, illustration: false, fit };
}

export function storyCity(story: LocalStory): string {
  return story.city || story.locality || 'Regional';
}

export function activeEvents(stories: LocalStory[], now: string): LocalStory[] {
  return stories.filter(
    (story) =>
      story.category === 'things-to-do' &&
      !!story.eventEndDate &&
      Number.isFinite(Date.parse(story.eventEndDate)) &&
      Date.parse(story.eventEndDate) >= Date.parse(now)
  );
}

export function filterStories(
  stories: LocalStory[],
  city: string,
  query: string
): LocalStory[] {
  const normalized = query.trim().toLocaleLowerCase('en-CA');
  return stories.filter(
    (story) =>
      (city === 'All cities' || storyCity(story) === city) &&
      `${story.title} ${story.description || ''} ${storyCity(story)}`
        .toLocaleLowerCase('en-CA')
        .includes(normalized)
  );
}

export function rankedStoryCities(stories: LocalStory[]): string[] {
  const counts = new Map<string, number>();
  for (const story of stories) {
    const city = storyCity(story);
    if (city === 'Regional') continue;
    counts.set(city, (counts.get(city) || 0) + 1);
  }
  return Array.from(counts.entries())
    .sort(
      ([cityA, countA], [cityB, countB]) =>
        countB - countA || cityA.localeCompare(cityB, 'en-CA')
    )
    .map(([city]) => city);
}

export const ALL_CITIES = 'All cities';

export interface CityFilterSplit {
  visible: string[];
  extra: string[];
}

// The filter row shows the busiest cities and hides the long tail behind a
// toggle. A city that is already selected stays visible even when it sits in
// the hidden tail, so the active filter never disappears from the row.
// Stories with no city or locality fall back to "Regional". That bucket never
// takes a top slot, but it stays reachable at the end of the hidden tail.
export function splitCityFilters(
  stories: LocalStory[],
  selected: string,
  limit = 6
): CityFilterSplit {
  const ranked = rankedStoryCities(stories);
  const all = stories.some((story) => storyCity(story) === 'Regional')
    ? [...ranked, 'Regional']
    : ranked;
  const top = ranked.slice(0, limit);
  const visible =
    selected !== ALL_CITIES && all.includes(selected) && !top.includes(selected)
      ? [...top, selected]
      : top;
  return { visible, extra: all.filter((city) => !visible.includes(city)) };
}

export interface FeaturedSplit {
  lead?: LocalStory;
  secondaries: LocalStory[];
  grid: LocalStory[];
  hasMore: boolean;
}

// The image led lead plus its secondaries come off the top of the filtered
// results and the grid picks up straight after them, so no story is shown
// twice in the same section.
export function splitFeaturedStories(
  results: LocalStory[],
  gridCount: number,
  excludeHrefs: ReadonlySet<string> = new Set(),
  featureSize = 4
): FeaturedSplit {
  const featured: LocalStory[] = [];
  const featuredHrefs = new Set<string>();
  for (const story of results) {
    if (excludeHrefs.has(story.href) || featuredHrefs.has(story.href)) continue;
    featured.push(story);
    featuredHrefs.add(story.href);
    if (featured.length === featureSize) break;
  }

  const remaining: LocalStory[] = [];
  const usedHrefs = new Set(featuredHrefs);
  for (const story of results) {
    if (usedHrefs.has(story.href)) continue;
    remaining.push(story);
    usedHrefs.add(story.href);
  }

  return {
    lead: featured[0],
    secondaries: featured.slice(1),
    grid: remaining.slice(0, gridCount),
    hasMore: gridCount < remaining.length,
  };
}

export function pickTravelStories(
  stories: LocalStory[],
  excludeHrefs: ReadonlySet<string>,
  limit = 2
): LocalStory[] {
  const picked: LocalStory[] = [];
  const seen = new Set<string>();
  const safeLimit = Math.max(0, Math.floor(limit));
  if (safeLimit === 0) return picked;
  for (const story of stories) {
    if (
      story.category !== 'transit' ||
      excludeHrefs.has(story.href) ||
      seen.has(story.href)
    ) {
      continue;
    }
    picked.push(story);
    seen.add(story.href);
    if (picked.length === safeLimit) break;
  }
  return picked;
}

// Navigation artwork is tied to these exact event editions. New stories use
// their own editable title and date; they never inherit an old event poster.
const posters: Record<string, string> = {
  '/things-to-do/surrey-crave-halal-fest-september-2026':
    '/images/design/poster-crave.webp',
  '/things-to-do/burnaby-nikkei-matsuri-september-2026':
    '/images/design/poster-nikkei.webp',
  '/things-to-do/surrey-folklore-festival-september-2026':
    '/images/design/poster-folklore.webp',
};

export function editorialPoster(story: LocalStory): string | undefined {
  return posters[story.href];
}
