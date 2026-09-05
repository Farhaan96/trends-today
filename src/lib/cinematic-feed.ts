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
