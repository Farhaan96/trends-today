export const CANONICAL_ORIGIN = 'https://www.trendstoday.ca';

const SCHEMA_URL_KEYS = new Set([
  'url',
  'image',
  'logo',
  '@id',
  'item',
  'contentUrl',
  'thumbnailUrl',
  'embedUrl',
  'target',
  'sameAs',
  'screenshot',
  'mainEntityOfPage',
]);

export function toAbsoluteSchemaUrl(value: string): string {
  if (value.startsWith('/') && !value.startsWith('//')) {
    return `${CANONICAL_ORIGIN}${value}`;
  }

  return value;
}

export function absolutizeSchemaUrls<T>(value: T, key?: string): T {
  if (typeof value === 'string') {
    if (key && SCHEMA_URL_KEYS.has(key)) {
      return toAbsoluteSchemaUrl(value) as T;
    }

    return value;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => absolutizeSchemaUrls(entry, key)) as T;
  }

  if (value && typeof value === 'object') {
    const output: Record<string, unknown> = {};

    for (const [childKey, childValue] of Object.entries(
      value as Record<string, unknown>
    )) {
      output[childKey] = absolutizeSchemaUrls(childValue, childKey);
    }

    return output as T;
  }

  return value;
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(absolutizeSchemaUrls(data)).replace(/</g, '\\u003c');
}

/**
 * Home and paginated home render this Organization + WebSite graph in addition
 * to the same two types from the root layout. Layout tags are the sitewide
 * copies, so the extra graph would duplicate them once both are in the HTML.
 */
export function isLayoutBaseSchemaGraph(data: unknown): boolean {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false;

  const record = data as Record<string, unknown>;
  if (record['@context'] !== 'https://schema.org') return false;

  const graph = record['@graph'];
  if (!Array.isArray(graph) || graph.length !== 2) return false;

  const types = new Set(
    graph.map((node) => {
      if (!node || typeof node !== 'object' || !('@type' in node)) return '';
      return String((node as { '@type'?: unknown })['@type'] || '');
    })
  );

  return types.has('Organization') && types.has('WebSite');
}
