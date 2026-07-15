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

export function getCategoryFromHref(href: string): string {
  const category = href.split('/').filter(Boolean)[0] || 'latest';
  return category.charAt(0).toUpperCase() + category.slice(1);
}
