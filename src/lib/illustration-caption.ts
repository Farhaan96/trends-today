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
  const cleaned = (String(imageAlt || '').trim() || fallback).replace(
    /[—–]/g,
    ','
  );
  if (!isGeneratedIllustration(attribution, sourceType)) return cleaned;
  const prefix = 'Generated illustration of';
  // Drop any label the author already wrote, so the prefix never doubles
  // (e.g. "AI-generated illustration of ...", "Generated editorial illustration of ...").
  const label =
    /^(?:an?\s+)?(?:labell?ed\s+)?(?:(?:ai[-\s]?)?generated\s+)?(?:editorial\s+)?(?:illustration|watercolou?r)\s+of\s+/i;
  const stripped = cleaned.replace(label, '').trim();
  // When the author wrote "... illustration of X", X is already cased for the
  // middle of a sentence, so keep it as written (proper nouns stay capitalized).
  // Otherwise keep the existing behaviour of lowercasing the first letter.
  const lead =
    stripped && stripped !== cleaned
      ? stripped
      : cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
  return `${prefix} ${lead}`;
}
