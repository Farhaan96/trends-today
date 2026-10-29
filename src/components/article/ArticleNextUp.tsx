import { MDXRemote } from 'next-mdx-remote/rsc';

interface ArticleNextUpProps {
  /** MDX for the section, starting with its own "## What ... next" heading. */
  section?: string | null;
}

/**
 * The civic page's next new fact (for example "What closes next"), lifted out
 * of the article body unchanged and placed under the dek so it is on the
 * first screen.
 */
export default function ArticleNextUp({ section }: ArticleNextUpProps) {
  if (!section) return null;
  return (
    <aside className="article-next-up" aria-label="What comes next">
      <MDXRemote source={section} />
    </aside>
  );
}
