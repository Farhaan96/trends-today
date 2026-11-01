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
  const subject =
    cleaned
      .replace(
        /^(?:an?\s+)?(?:(?:ai[-\s]?)?generated\s+)?(?:editorial\s+)?illustration\s+of\s+/i,
        ''
      )
      .trim() || cleaned;
  // Lowercase only a leading article, so proper nouns like "Trout Lake" keep their capital.
  const lead = /^(?:a|an|the)\b/i.test(subject)
    ? subject.charAt(0).toLowerCase() + subject.slice(1)
    : subject;
  return `${prefix} ${lead}`;
}
