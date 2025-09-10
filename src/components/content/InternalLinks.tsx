import Link from 'next/link';
import { getAllPosts } from '@/lib/content';

type InternalLink = {
  text: string;
  href: string;
  context?: string;
};

interface InternalLinksProps {
  currentArticle?: string;
  category?: string;
  maxLinks?: number;
}

export async function getRelatedLinks(
  currentArticle?: string,
  category?: string,
  maxLinks: number = 5
): Promise<InternalLink[]> {
  const posts = await getAllPosts();
  
  // Filter out current article and get related posts
  const relatedPosts = posts
    .filter(post => post.href !== currentArticle)
    .filter(post => !category || post.frontmatter.category === category)
    .slice(0, maxLinks * 2); // Get extra to have options

  // Create natural anchor texts based on article titles
  const links: InternalLink[] = relatedPosts.slice(0, maxLinks).map(post => {
    // Generate contextual anchor text (not just the title)
    const anchorVariations = [
      post.frontmatter.title.toLowerCase().includes('review') ? 'our detailed analysis' : null,
      post.frontmatter.title.toLowerCase().includes('best') ? 'top recommendations' : null,
      post.frontmatter.title.toLowerCase().includes('vs') ? 'comparison guide' : null,
      post.frontmatter.title.toLowerCase().includes('how') ? 'step-by-step guide' : null,
      // Fallback to key phrases from title
      extractKeyPhrase(post.frontmatter.title)
    ].filter(Boolean);

    return {
      text: anchorVariations[0] || post.frontmatter.title,
      href: post.href,
      context: post.frontmatter.description || ''
    };
  });

  return links;
}

function extractKeyPhrase(title: string): string {
  // Extract meaningful phrases for natural linking
  const phrases = [
    /iPhone \d+/i,
    /Galaxy S\d+/i,
    /MacBook \w+/i,
    /Pixel \d+/i,
    /best \w+ \w+/i,
    /\w+ review/i,
    /\w+ guide/i
  ];

  for (const pattern of phrases) {
    const match = title.match(pattern);
    if (match) return match[0].toLowerCase();
  }

  // Fallback: use first 3-4 significant words
  const words = title.split(' ').filter(w => w.length > 3);
  return words.slice(0, 3).join(' ').toLowerCase();
}

// Component for rendering inline links within article content
export function InlineLink({ href, children }: { href: string; children: React.ReactNode }) {
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
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Related Articles</h3>
      <ul className="space-y-3">
        {links.map((link, index) => (
          <li key={index} className="flex items-start">
            <span className="text-blue-600 mr-2 mt-1">→</span>
            <div>
              <Link 
                href={link.href}
                className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
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