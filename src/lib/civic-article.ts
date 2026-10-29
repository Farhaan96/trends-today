/**
 * Template helpers for civic article pages (Local News and Transit).
 *
 * These helpers only change how existing MDX and frontmatter are laid out.
 * They never rewrite article prose: a section is either moved as a whole or a
 * fully repeated "What to know" line is left out of the rendered page.
 */

export const CIVIC_CATEGORIES = ['local-news', 'transit'] as const;

export function isCivicCategory(category?: string): boolean {
  return (CIVIC_CATEGORIES as readonly string[]).includes(
    (category || '').toLowerCase()
  );
}

/** H2 headings that announce the next dated change on a civic page. */
const NEXT_HEADING =
  /^##\s+What\s+(?:closes|opens|reopens|changes|happens)\s+next\s*$/i;
const SECTION_END = /^(?:#{1,2}\s|---\s*$|\*\*\*\s*$)/;

export interface MdxSection {
  /** The lifted section, heading included, or null when none matched. */
  section: string | null;
  /** The MDX with the lifted section removed. */
  rest: string;
}

function findSection(mdx: string, heading: RegExp) {
  const lines = mdx.split('\n');
  const start = lines.findIndex((line) => heading.test(line.trim()));
  if (start === -1) return null;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i += 1) {
    if (SECTION_END.test(lines[i].trim())) {
      end = i;
      break;
    }
  }
  return { lines, start, end };
}

/**
 * Pull the "What closes next" style section out of the MDX body so the
 * template can place it under the dek. The section text is moved unchanged.
 */
export function extractNextSection(mdx: string): MdxSection {
  const found = findSection(mdx || '', NEXT_HEADING);
  if (!found) return { section: null, rest: mdx };
  const { lines, start, end } = found;
  const section = lines.slice(start, end).join('\n').trim();
  if (section.split('\n').length < 2) return { section: null, rest: mdx };
  const rest = [...lines.slice(0, start), ...lines.slice(end)].join('\n');
  return { section, rest };
}

const STOPWORDS = new Set(
  (
    'a an and are as at be by for from in into is it its of on or the this ' +
    'that to with will was were has have not no use instead also only per ' +
    'there their they you your which who what when where while than then ' +
    'one each way any all'
  ).split(' ')
);

const MONTHS: Record<string, string> = {
  jan: 'january',
  feb: 'february',
  mar: 'march',
  apr: 'april',
  jun: 'june',
  jul: 'july',
  aug: 'august',
  sep: 'september',
  sept: 'september',
  oct: 'october',
  nov: 'november',
  dec: 'december',
  ave: 'avenue',
  st: 'street',
  hwy: 'highway',
};

function stripMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[*_`>#]/g, ' ');
}

export function contentTokens(text: string): string[] {
  return stripMarkdown(text)
    .toLowerCase()
    .replace(/24\/7/g, ' twentyfourseven ')
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map((token) => MONTHS[token] || token)
    .map((token) =>
      token.length > 3 && token.endsWith('s') ? token.slice(0, -1) : token
    )
    .filter((token) => !STOPWORDS.has(token) && token !== 's');
}

const LABEL_LINE = /^\*\*([^*]+?):?\*\*:?\s*(.*)$/;
const WHAT_TO_KNOW = /^##\s+What\s+to\s+know\s*$/i;

function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n|\n(?=\s*[-*]\s)/)
    .map((part) => part.trim())
    .filter(Boolean);
}

/**
 * Share of a line's content words found in one earlier block (the title, the
 * dek, one highlight or one opening paragraph). A line counts as repeated only
 * when a single earlier block already says it, and every number in the line
 * (dates, hours, street numbers) appears in that same block.
 */
export function repeatedShare(line: string, earlierBlocks: string[]): number {
  const tokens = contentTokens(line);
  if (tokens.length === 0) return 0;
  let best = 0;
  for (const block of earlierBlocks) {
    const seen = new Set(contentTokens(block));
    if (tokens.some((token) => /\d/.test(token) && !seen.has(token))) continue;
    const share =
      tokens.filter((token) => seen.has(token)).length / tokens.length;
    best = Math.max(best, share);
  }
  return best;
}

export const REPEATED_LINE_THRESHOLD = 0.85;

/**
 * Leave out "What to know" label lines (for example "**Use instead:** 188
 * Street.") that one block above the section already says: the title, dek,
 * a highlight, the lifted next block or an opening paragraph. Only whole
 * lines are dropped, never words inside a line, and lines with links stay.
 * If every label line would go, the section is left as written.
 */
export function trimRepeatedWhatToKnow(
  mdx: string,
  pageTextAbove: string[]
): { mdx: string; removed: string[] } {
  const found = findSection(mdx || '', WHAT_TO_KNOW);
  if (!found) return { mdx, removed: [] };
  const { lines, start, end } = found;

  const earlierBlocks = [
    ...pageTextAbove.filter(Boolean).flatMap(paragraphs),
    ...paragraphs(lines.slice(0, start).join('\n')),
  ];

  const removed: string[] = [];
  const kept: string[] = [];
  const body = lines.slice(start + 1, end);
  for (const line of body) {
    const match = LABEL_LINE.exec(line.trim());
    const value = match?.[2] || '';
    if (
      match &&
      value &&
      !/\]\(|<|https?:/.test(value) &&
      repeatedShare(value, earlierBlocks) >= REPEATED_LINE_THRESHOLD
    ) {
      removed.push(line.trim());
      continue;
    }
    kept.push(line);
  }

  const labelLinesLeft = kept.some((line) => LABEL_LINE.test(line.trim()));
  if (removed.length === 0 || !labelLinesLeft) return { mdx, removed: [] };

  // Collapse the blank lines a removed line leaves behind.
  const compact = kept.filter(
    (line, i) => line.trim() !== '' || (kept[i - 1] ?? '').trim() !== ''
  );
  return {
    mdx: [...lines.slice(0, start + 1), ...compact, ...lines.slice(end)].join(
      '\n'
    ),
    removed,
  };
}

/** Text of the opening paragraphs, up to the first heading or rule. */
export function openingText(mdx: string): string {
  const lines = (mdx || '').split('\n');
  const out: string[] = [];
  for (const line of lines) {
    if (SECTION_END.test(line.trim())) break;
    out.push(line);
  }
  return out.join('\n');
}

const PACIFIC_PARTS = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Vancouver',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

/**
 * 23:59:59 America/Vancouver on a YYYY-MM-DD date, DST-correct from the
 * runtime's time zone data: PDT (-07:00) or PST (-08:00), whichever applies
 * at that moment (BC stays on -07:00 after March 8, 2026 in tzdata 2026e).
 */
export function pacificEndOfDay(ymd: string): number {
  for (const offset of ['-07:00', '-08:00']) {
    const time = Date.parse(`${ymd}T23:59:59${offset}`);
    if (!Number.isFinite(time)) return NaN;
    const parts = Object.fromEntries(
      PACIFIC_PARTS.formatToParts(new Date(time)).map((p) => [p.type, p.value])
    );
    const local = `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
    if (local === `${ymd}T23:59:59`) return time;
  }
  return NaN;
}

export type ClosureStatus = 'current' | 'ended' | 'undated';

/**
 * Current or upcoming vs ended, from the existing `eventEndDate` frontmatter
 * field. Articles without a parseable end date are "undated".
 */
export function closureStatus(
  eventEndDate: unknown,
  now: number
): ClosureStatus {
  if (typeof eventEndDate !== 'string' || !eventEndDate.trim())
    return 'undated';
  const raw = eventEndDate.trim();
  // A date with no time means the whole day in Pacific time.
  const end = /^\d{4}-\d{2}-\d{2}$/.test(raw)
    ? pacificEndOfDay(raw)
    : Date.parse(raw);
  if (!Number.isFinite(end)) return 'undated';
  return end >= now ? 'current' : 'ended';
}

export function formatPacificDay(value?: string): string {
  if (!value) return '';
  const raw = value.trim();
  const date = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(raw) ? `${raw}T12:00:00-08:00` : raw
  );
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/Vancouver',
  }).format(date);
}

export interface RelatedCandidate {
  slug: string;
  score: number;
  eventEndDate?: string;
}

/**
 * Split scored related articles for a civic page: current or upcoming
 * closures lead as cards (filled with undated related stories if there are
 * not enough), and ended closures are kept as links further down, newest
 * end date first.
 */
export function splitCivicRelated<T extends RelatedCandidate>(
  scored: T[],
  now: number,
  maxCards = 3,
  maxEnded = 6
): { cards: T[]; ended: T[] } {
  const byScore = [...scored].sort((a, b) => b.score - a.score);
  const current = byScore.filter(
    (item) => closureStatus(item.eventEndDate, now) === 'current'
  );
  const undated = byScore.filter(
    (item) => closureStatus(item.eventEndDate, now) === 'undated'
  );
  const ended = byScore
    .filter((item) => closureStatus(item.eventEndDate, now) === 'ended')
    .sort(
      (a, b) =>
        b.score - a.score ||
        Date.parse(b.eventEndDate || '') - Date.parse(a.eventEndDate || '')
    )
    .slice(0, maxEnded)
    .sort(
      (a, b) =>
        Date.parse(b.eventEndDate || '') - Date.parse(a.eventEndDate || '')
    );
  const cards = [...current, ...undated].slice(0, maxCards);
  return { cards, ended };
}
