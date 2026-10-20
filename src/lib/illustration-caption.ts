export const GENERATED_ILLUSTRATION_CAPTION =
  'Generated illustration by Trends Today, not a photo.';

const EXEMPT_SOURCE_TYPES = new Set([
  'official-photo',
  'licensed-photo',
  'official-map',
  'official-source',
]);

export function isGeneratedIllustration(
  attribution: unknown,
  sourceType?: unknown
): boolean {
  const source = String(sourceType || '')
    .trim()
    .toLowerCase();
  if (EXEMPT_SOURCE_TYPES.has(source)) return false;
  return /\b(?:ai|generated|generative)\b/i.test(String(attribution || ''));
}

export function illustrationImageAlt(
  imageAlt: unknown,
  title: unknown,
  attribution: unknown,
  sourceType?: unknown
): string {
  const fallback = String(title || '').trim() || 'Article';
  const cleaned = (String(imageAlt || '').trim() || fallback)
    .replace(/[—–]/g, ',')
    .replace(/^generated\b.*?illustration of\s+/i, '');
  if (!isGeneratedIllustration(attribution, sourceType)) return cleaned;
  const prefix = 'Generated illustration of';
  if (cleaned.toLowerCase().startsWith(prefix.toLowerCase())) {
    return prefix + cleaned.slice(prefix.length);
  }
  const rest = cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
  return `${prefix} ${rest}`;
}
