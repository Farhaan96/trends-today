export type CategoryKey =
  | 'local-news'
  | 'transit'
  | 'things-to-do'
  | 'food-drink'
  | 'housing'
  | 'sports'
  | 'science'
  | 'culture'
  | 'psychology'
  | 'technology'
  | 'health'
  | 'space'
  | 'lifestyle';

export const LOCAL_NEWS_CATEGORIES: CategoryKey[] = [
  'local-news',
  'transit',
  'things-to-do',
  'food-drink',
  'housing',
  'sports',
];

export const LEGACY_CATEGORIES: CategoryKey[] = [
  'science',
  'culture',
  'psychology',
  'technology',
  'health',
  'space',
];

export const CONTENT_CATEGORIES: CategoryKey[] = [
  ...LOCAL_NEWS_CATEGORIES,
  ...LEGACY_CATEGORIES,
];

export function isLocalNewsCategory(input?: string): boolean {
  return LOCAL_NEWS_CATEGORIES.includes(input as CategoryKey);
}

const categoryLabels: Record<CategoryKey, string> = {
  'local-news': 'Local News',
  transit: 'Transit',
  'things-to-do': 'Things to Do',
  'food-drink': 'Food & Drink',
  housing: 'Housing',
  sports: 'Sports',
  science: 'Science',
  culture: 'Culture',
  psychology: 'Psychology',
  technology: 'Technology',
  health: 'Health',
  space: 'Space',
  lifestyle: 'Lifestyle',
};

export function getCategoryLabel(input?: string): string {
  return categoryLabels[getCategoryKey(input)];
}

type Style = {
  badge: string; // pill background + text
  text: string; // text accent color
  headerBg: string; // header/background accent gradient
};

const styles: Record<CategoryKey, Style> = {
  'local-news': {
    badge: 'bg-red-600 text-white',
    text: 'text-red-700',
    headerBg: 'bg-red-50',
  },
  transit: {
    badge: 'bg-red-600 text-white',
    text: 'text-red-700',
    headerBg: 'bg-red-50',
  },
  'things-to-do': {
    badge: 'bg-red-600 text-white',
    text: 'text-red-700',
    headerBg: 'bg-red-50',
  },
  'food-drink': {
    badge: 'bg-red-600 text-white',
    text: 'text-red-700',
    headerBg: 'bg-red-50',
  },
  housing: {
    badge: 'bg-red-600 text-white',
    text: 'text-red-700',
    headerBg: 'bg-red-50',
  },
  sports: {
    badge: 'bg-red-600 text-white',
    text: 'text-red-700',
    headerBg: 'bg-red-50',
  },
  science: {
    badge: 'bg-gradient-to-r from-sky-500 to-cyan-600 text-white',
    text: 'text-sky-600',
    headerBg: 'bg-gradient-to-r from-sky-500/10 to-cyan-600/10',
  },
  culture: {
    badge: 'bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white',
    text: 'text-fuchsia-600',
    headerBg: 'bg-gradient-to-r from-pink-500/10 to-fuchsia-600/10',
  },
  psychology: {
    badge: 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white',
    text: 'text-violet-600',
    headerBg: 'bg-gradient-to-r from-indigo-500/10 to-violet-600/10',
  },
  technology: {
    badge: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white',
    text: 'text-indigo-600',
    headerBg: 'bg-gradient-to-r from-blue-600/10 to-indigo-600/10',
  },
  health: {
    badge: 'bg-gradient-to-r from-emerald-500 to-green-600 text-white',
    text: 'text-emerald-600',
    headerBg: 'bg-gradient-to-r from-emerald-500/10 to-green-600/10',
  },
  space: {
    badge: 'bg-gradient-to-r from-indigo-600 to-fuchsia-700 text-white',
    text: 'text-indigo-700',
    headerBg: 'bg-gradient-to-r from-indigo-600/10 to-fuchsia-700/10',
  },
  lifestyle: {
    badge: 'bg-gradient-to-r from-rose-500 to-orange-500 text-white',
    text: 'text-rose-600',
    headerBg: 'bg-gradient-to-r from-rose-500/10 to-orange-500/10',
  },
};

export function getCategoryKey(input?: string): CategoryKey {
  const key = (input || '').toLowerCase();
  // Backward-compatibility + aliases
  const alias = key === 'mystery' ? 'space' : key;
  if ((styles as Record<string, Style>)[alias]) return alias as CategoryKey;
  // Fallback to technology as a sensible default
  return 'technology';
}

export function getCategoryStyles(input?: string): Style {
  return styles[getCategoryKey(input)];
}

export function getCategoryDescription(input?: string): string {
  switch (getCategoryKey(input)) {
    case 'local-news':
      return 'The latest civic, community, weather, and service updates across the Lower Mainland.';
    case 'transit':
      return 'SkyTrain, bus, road, ferry, airport, and travel changes that affect your day.';
    case 'things-to-do':
      return 'Events, festivals, and useful ideas for making plans around the Lower Mainland.';
    case 'food-drink':
      return 'Restaurant openings, closures, neighbourhood food news, and local dining guides.';
    case 'housing':
      return 'Housing, rent, development, and city-building changes across the region.';
    case 'sports':
      return 'Canucks, Whitecaps, Lions, Giants, and the local sports stories worth knowing.';
    case 'science':
      return 'Breakthrough discoveries, research, and the science shaping tomorrow.';
    case 'culture':
      return 'Dive into cultural phenomena, social trends, arts, and modern society.';
    case 'psychology':
      return 'Human behavior, cognition, and the surprising science of the mind.';
    case 'technology':
      return 'Gadgets, AI, and innovations changing how we live and work.';
    case 'health':
      return 'Wellness, medicine, and evidence-based advice for better living.';
    case 'space':
      return 'Astronomy, exploration, and the science of our universe.';
    case 'lifestyle':
      return 'Ideas, habits, and trends for living smarter every day.';
    default:
      return '';
  }
}
