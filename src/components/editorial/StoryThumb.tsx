import Image from 'next/image';
import { getCategoryLabel } from '@/lib/categories';

// Articles without frontmatter art fall back to a flat brand colour block.
// Nothing is invented or fetched: the block only carries the category name.
const fallbackTones: Record<string, string> = {
  'local-news': 'story-thumb--ink',
  transit: 'story-thumb--lime',
  'things-to-do': 'story-thumb--coral',
  'food-drink': 'story-thumb--accent',
  housing: 'story-thumb--surface',
  sports: 'story-thumb--ink',
};

export default function StoryThumb({
  image,
  imageAlt,
  title,
  category,
  className = '',
  sizes,
  priority = false,
}: {
  image?: string;
  imageAlt?: string;
  title: string;
  category: string;
  className?: string;
  sizes: string;
  priority?: boolean;
}) {
  const classes = [
    'story-thumb',
    image
      ? 'story-thumb--photo'
      : fallbackTones[category] || 'story-thumb--ink',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes}>
      {image ? (
        <Image
          src={image}
          alt={imageAlt || title}
          fill
          sizes={sizes}
          priority={priority}
          className="story-thumb__image"
        />
      ) : (
        <span className="story-thumb__fallback" aria-hidden="true">
          <span className="story-thumb__rule" />
          <span className="story-thumb__label">
            {getCategoryLabel(category)}
          </span>
          <span className="story-thumb__mark">Trends Today</span>
        </span>
      )}
    </span>
  );
}
