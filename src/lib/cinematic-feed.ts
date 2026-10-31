export interface LocalStory {
  href: string;
  title: string;
  description?: string;
  category: string;
  image?: string;
  imageAlt?: string;
  imageAttribution?: string;
  publishedAt?: string;
  eventEndDate?: string;
  locality?: string;
  city?: string;
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
export function splitCityFilters(
  stories: LocalStory[],
  selected: string,
  limit = 7
): CityFilterSplit {
  const ranked = rankedStoryCities(stories);
  const top = ranked.slice(0, limit);
  const visible =
    selected !== ALL_CITIES &&
    ranked.includes(selected) &&
    !top.includes(selected)
      ? [...top, selected]
      : top;
  return { visible, extra: ranked.filter((city) => !visible.includes(city)) };
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
  featureSize = 4
): FeaturedSplit {
  const featured = results.slice(0, featureSize);
  return {
    lead: featured[0],
    secondaries: featured.slice(1),
    grid: results.slice(featured.length, featured.length + gridCount),
    hasMore: featured.length + gridCount < results.length,
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
