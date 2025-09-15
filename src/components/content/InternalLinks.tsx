import Link from 'next/link';
import { getAllPosts } from '@/lib/content';

type InternalLink = {
  text: string;
  href: string;
  context?: string;
};

// interface InternalLinksProps {
//   currentArticle?: string;
//   category?: string;
//   maxLinks?: number;
// }

export async function getRelatedLinks(
  currentArticle?: string,
  category?: string,
  maxLinks: number = 4
): Promise<InternalLink[]> {
  const posts = await getAllPosts();

  // Exclude current article
  const pool = posts.filter((p) => p.href !== currentArticle);

  // Strategy: blend categories for cross-linking
  const sameCategory = pool.filter(
    (p) => !category || p.frontmatter.category === category
  );
  const otherCategories = pool.filter(
    (p) => !category || p.frontmatter.category !== category
  );

  const targetSame = Math.ceil(maxLinks / 2); // 50% same category
  const selected: typeof pool = [];

  for (const p of sameCategory) {
    if (selected.length >= targetSame) break;
    selected.push(p);
  }
  for (const p of otherCategories) {
    if (selected.length >= maxLinks) break;
    selected.push(p);
  }

  // Map to link objects with descriptive, natural anchor text
  const links: InternalLink[] = selected.map((post) => ({
    text: post.frontmatter.title, // Descriptive anchor text
    href: post.href,
    context: post.frontmatter.description || '',
  }));

  return links;
}

function _extractKeyPhrase(title: string): string {
  // Extract meaningful phrases for natural linking
  const phrases = [
    /iPhone \d+/i,
    /Galaxy S\d+/i,
    /MacBook \w+/i,
    /Pixel \d+/i,
    /best \w+ \w+/i,
    /\w+ review/i,
    /\w+ guide/i,
  ];

  for (const pattern of phrases) {
    const match = title.match(pattern);
    if (match) return match[0].toLowerCase();
  }

  // Fallback: use first 3-4 significant words
  const words = title.split(' ').filter((w) => w.length > 3);
  return words.slice(0, 3).join(' ').toLowerCase();
}

// Component for rendering inline links within article content
export function InlineLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-blue-600 hover:text-blue-800 underline decoration-gray-300 hover:decoration-blue-600 transition-colors"
    >
      {children}
    </Link>
  );
}

// Component for "Related Articles" section
export default function RelatedArticles({ links }: { links: InternalLink[] }) {
  if (!links || links.length === 0) return null;

  return (
    <section className="my-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">
        Related Articles
      </h3>
      <ul className="space-y-3">
        {links.map((link, index) => (
          <li key={index} className="flex items-start">
            <span className="text-blue-600 mr-2 mt-1">→</span>
            <div>
              <Link
                href={link.href}
                className="text-blue-600 hover:text-blue-800 font-medium no-underline"
              >
                {link.text}
              </Link>
              {link.context && (
                <p className="text-sm text-gray-600 mt-1">{link.context}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
