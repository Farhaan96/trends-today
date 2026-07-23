export type NewsroomProfile = {
  id: string;
  name: string;
  role: string;
  entityType: 'Person' | 'Organization';
  shortBio: string;
  longBio: string[];
  responsibilities: string[];
  email: string;
  location: string;
  avatar?: string;
};

export const newsroomProfiles: Record<string, NewsroomProfile> = {
  farhaan: {
    id: 'farhaan',
    name: 'Farhaan',
    role: 'Publisher',
    entityType: 'Person',
    shortBio:
      'Farhaan sets editorial priorities, reviews sensitive coverage, and handles advertising and partnership inquiries for Trends Today.',
    longBio: [
      'Farhaan is the publisher of Trends Today, an independent publication focused on useful reporting for people across Vancouver, the Lower Mainland, and the Fraser Valley.',
      'He is responsible for editorial direction, final publication decisions, corrections, advertising relationships, and keeping commercial work separate from newsroom judgments.',
    ],
    responsibilities: [
      'Editorial direction and final publication decisions',
      'Corrections, reader feedback, and accountability',
      'Advertising and partnership inquiries',
    ],
    email: 'hello@trendstoday.ca',
    location: 'Lower Mainland, British Columbia',
  },
  'trends-today-newsroom': {
    id: 'trends-today-newsroom',
    name: 'Trends Today Newsroom',
    role: 'Local reporting desk',
    entityType: 'Organization',
    shortBio:
      'The Trends Today Newsroom reports practical local updates using primary sources, documented checks, and editor review.',
    longBio: [
      'The Trends Today Newsroom is the shared byline for reporting produced through the publication’s documented research and review process rather than by a single staff reporter.',
      'Research and drafting may be assisted by software, including AI tools. Sources, locality, utility, sensitive claims, and release readiness are checked before publication. The reporting method and source list on each article explain what was used.',
    ],
    responsibilities: [
      'Primary-source research and local fact checking',
      'Practical guides, public-service updates, and explainers',
      'Source disclosure and post-publication corrections',
    ],
    email: 'hello@trendstoday.ca',
    location: 'Lower Mainland, British Columbia',
  },
};

const legacyNewsroomNames = new Set([
  'Trends Today',
  'Trends Today Team',
  'Trends Today Editorial Team',
]);

export function normalizeAuthorName(name?: string): string {
  if (!name || legacyNewsroomNames.has(name)) {
    return newsroomProfiles['trends-today-newsroom'].name;
  }

  return name;
}

export function getNewsroomProfileByName(
  name?: string
): NewsroomProfile | undefined {
  const normalized = normalizeAuthorName(name);
  return Object.values(newsroomProfiles).find(
    (profile) => profile.name === normalized
  );
}

export function getNewsroomProfileId(name?: string): string | undefined {
  return getNewsroomProfileByName(name)?.id;
}
