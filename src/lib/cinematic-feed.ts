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
  straight: boolean;
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

function normalizedSourceType(sourceType?: string): string {
  return String(sourceType || '')
    .trim()
    .toLowerCase();
}

export function imageFit(sourceType?: string): ImageFit {
  return CONTAIN_SOURCE_TYPES.has(normalizedSourceType(sourceType))
    ? 'contain'
    : 'cover';
}

// An official source visual is a document, not a print on a wall: a ministry
// map, a civic photo, a logo, a data card. It sits straight, with no tilt,
// rotation or 3D nudge, so a legend or a source line stays square and legible.
// Only generated or evergreen art keeps the tilted look.
const STRAIGHT_SOURCE_TYPES = new Set([
  'data-card',
  'chart',
  'diagram',
  'infographic',
  'screenshot',
  'licensed-photo',
  'photo',
]);

export function isStraightSource(sourceType?: string): boolean {
  const source = normalizedSourceType(sourceType);
  if (!source) return false;
  if (source.startsWith('official')) return true;
  if (source.includes('map')) return true;
  return STRAIGHT_SOURCE_TYPES.has(source);
}

const CREDIT_DOMAIN = /^[a-z0-9][a-z0-9-]*(?:\.[a-z0-9-]+)*\.[a-z]{2,6}$/i;

// The hero credit has to fit one readable line on a phone. It is built only
// from the fields the story already carries: a prefix for the kind of visual,
// the source name up to the first comma, and the domain the source published
// it on when the attribution names one. Nothing is invented, and the full
// credit stays on wider screens and on the article page.
export function shortImageCredit(
  attribution?: string,
  sourceType?: string
): string {
  const text = String(attribution || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return '';
  const source = normalizedSourceType(sourceType);
  const prefix = source.includes('map')
    ? 'Map:'
    : source.includes('photo')
      ? 'Photo:'
      : 'Image:';
  const name =
    (text.split(',')[0] || text)
      .replace(/\([^)]*\)?/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() || text;
  let domain = '';
  for (const group of text.match(/\(([^)]*)\)/g) || []) {
    const token = group
      .slice(1, -1)
      .split(/[\s,;"']+/)
      .find((candidate) => CREDIT_DOMAIN.test(candidate));
    if (token) {
      domain = token;
      break;
    }
  }
  return domain ? `${prefix} ${name} (${domain})` : `${prefix} ${name}`;
}

export function homepageImage(
  story: Pick<
    LocalStory,
    'category' | 'image' | 'imageAttribution' | 'imageSourceType' | 'storyType'
  >
): HomepageImageResult {
  const image = story.image?.trim() || undefined;
  const fit = imageFit(story.imageSourceType);
  const official = isStraightSource(story.imageSourceType);
  const generated = isGeneratedIllustration(
    story.imageAttribution,
    story.imageSourceType
  );
  if (!generated) {
    return {
      src: image,
      illustration: false,
      fit,
      straight: official || !!image,
    };
  }

  const allowsIllustration =
    story.category === 'things-to-do' ||
    story.storyType?.trim().toLowerCase().startsWith('evergreen') === true;
  if (allowsIllustration) {
    return { src: image, illustration: true, fit, straight: official };
  }
  return { src: undefined, illustration: false, fit, straight: official };
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

export interface HomepagePlanInput {
  stories: LocalStory[];
  latestHrefs: Iterable<string>;
  now: string;
  city: string;
  query: string;
  count: number;
}

export interface HomepagePlan {
  hero?: LocalStory;
  latestHrefs: string[];
  travel: LocalStory[];
  events: LocalStory[];
  results: LocalStory[];
  resultCount: number;
  allMatchingShownAbove: boolean;
  featuredLead?: LocalStory;
  secondaryStories: LocalStory[];
  gridStories: LocalStory[];
  grid: LocalStory[];
  hasMore: boolean;
  shownAboveHrefs: Set<string>;
}

function uniqueStories(stories: LocalStory[]): LocalStory[] {
  const seen = new Set<string>();
  return stories.filter((story) => {
    if (!story.href || seen.has(story.href)) return false;
    seen.add(story.href);
    return true;
  });
}

export function planHomepage(input: HomepagePlanInput): HomepagePlan {
  const stories = uniqueStories(input.stories);
  const hero = stories[0];
  const shownAboveHrefs = new Set<string>();
  if (hero) shownAboveHrefs.add(hero.href);

  const latestHrefs: string[] = [];
  for (const href of input.latestHrefs) {
    if (!href || shownAboveHrefs.has(href)) continue;
    latestHrefs.push(href);
    shownAboveHrefs.add(href);
  }

  const reservedFeatured = splitFeaturedStories(stories, 0, shownAboveHrefs);
  const travelExclusions = new Set(shownAboveHrefs);
  if (reservedFeatured.lead) {
    travelExclusions.add(reservedFeatured.lead.href);
  }
  for (const story of reservedFeatured.secondaries) {
    travelExclusions.add(story.href);
  }

  const travel = pickTravelStories(stories, travelExclusions);
  for (const story of travel) shownAboveHrefs.add(story.href);

  const events = activeEvents(stories, input.now)
    .filter((story) => !shownAboveHrefs.has(story.href))
    .slice(0, 6);
  for (const story of events) shownAboveHrefs.add(story.href);

  const results = filterStories(stories, input.city, input.query);
  const availableResults = results.filter(
    (story) => !shownAboveHrefs.has(story.href)
  );
  const allMatchingShownAbove =
    results.length > 0 && availableResults.length === 0;
  const featured = availableResults.slice(0, 4);
  for (const story of featured) shownAboveHrefs.add(story.href);

  const grid = results.filter((story) => !shownAboveHrefs.has(story.href));
  const count = Math.max(0, Math.floor(input.count));

  return {
    hero,
    latestHrefs,
    travel,
    events,
    results,
    resultCount: results.length,
    allMatchingShownAbove,
    featuredLead: featured[0],
    secondaryStories: featured.slice(1),
    gridStories: grid.slice(0, count),
    grid,
    hasMore: count < grid.length,
    shownAboveHrefs,
  };
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
