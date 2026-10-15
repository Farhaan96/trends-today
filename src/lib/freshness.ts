export interface FreshnessFields {
  updatedAt?: unknown;
  publishedAt?: unknown;
  datePublished?: unknown;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

function cleanTimestamp(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed || !Number.isFinite(Date.parse(trimmed))) return undefined;
  return trimmed;
}

/**
 * Timestamp used for the public "Updated" stamp and Article JSON-LD
 * dateModified. updatedAt wins when it is present and parseable. Otherwise
 * the value is publishedAt, then datePublished.
 */
export function contentUpdatedValue(
  fields: FreshnessFields
): string | undefined {
  return (
    cleanTimestamp(fields.updatedAt) ||
    cleanTimestamp(fields.publishedAt) ||
    cleanTimestamp(fields.datePublished)
  );
}

export function isLivePostStatus(status: unknown): boolean {
  const value = String(status ?? '')
    .trim()
    .toLowerCase();
  return value === '' || value === 'published';
}

export function pickNewestUpdatedIso(
  posts: FreshnessFields[]
): string | undefined {
  let best: { iso: string; time: number } | undefined;
  for (const post of posts) {
    const iso = contentUpdatedValue(post);
    if (!iso) continue;
    const time = Date.parse(iso);
    if (!best || time > best.time) best = { iso, time };
  }
  return best?.iso;
}

function vancouverParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    hourCycle: 'h12',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';
  return {
    hour: read('hour'),
    minute: read('minute'),
    dayPeriod: read('dayPeriod'),
    weekday: read('weekday'),
    month: read('month'),
    day: read('day'),
  };
}

/**
 * "Updated 6:58 a.m. PT, Wed Oct 14". Copy uses commas and periods only.
 */
export function formatFreshnessStamp(
  iso: string,
  timeZone = 'America/Vancouver'
): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  const parts = vancouverParts(date, timeZone);
  const dayPeriod = parts.dayPeriod.toLowerCase().replace(/\./g, '');
  const period = dayPeriod === 'am' || dayPeriod === 'a' ? 'a.m.' : 'p.m.';
  const weekday =
    WEEKDAYS.find((item) => parts.weekday.startsWith(item)) ||
    parts.weekday.replace(/\./g, '');
  const month =
    MONTHS.find((item) => parts.month.startsWith(item)) ||
    parts.month.replace(/\./g, '');
  const hour = String(Number(parts.hour));
  const minute = parts.minute.padStart(2, '0');
  const day = String(Number(parts.day));
  if (!hour || hour === 'NaN' || !minute || !weekday || !month || !day) {
    return null;
  }

  return `Updated ${hour}:${minute} ${period} PT, ${weekday} ${month} ${day}`;
}
