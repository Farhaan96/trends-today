export type EditorialAuthor = string | { name?: string } | undefined;

export function getAuthorName(author: EditorialAuthor): string {
  if (typeof author === 'string') return author;
  return author?.name || 'Trends Today Editorial';
}

export function formatArticleDate(value?: string): string {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function formatArticleDateTime(value?: string): string {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-CA', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Vancouver',
  }).format(date);
}

/**
 * Format a date with weekday for prominent display on article pages.
 * Returns format: "Mon, Sep 8, 2026"
 */
export function formatArticleDateWithWeekday(value?: string): string {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-CA', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/Vancouver',
  }).format(date);
}

/**
 * Check if two date strings represent different dates (ignoring time).
 * Used to determine if "Updated" date should be shown.
 */
export function datesAreDifferent(dateA?: string, dateB?: string): boolean {
  if (!dateA || !dateB) return false;

  const a = new Date(dateA);
  const b = new Date(dateB);

  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return false;

  return (
    a.getFullYear() !== b.getFullYear() ||
    a.getMonth() !== b.getMonth() ||
    a.getDate() !== b.getDate()
  );
}

export function getCategoryFromHref(href: string): string {
  const category = href.split('/').filter(Boolean)[0] || 'latest';
  return category.charAt(0).toUpperCase() + category.slice(1);
}
