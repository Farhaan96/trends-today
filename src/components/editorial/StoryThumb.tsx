import Image from 'next/image';
import { getCategoryLabel } from '@/lib/categories';
import type { ImageFit } from '@/lib/cinematic-feed';

// Articles without usable art fall back to a branded category card.
// Nothing is invented or fetched: the card only carries the category name
// and the masthead, set in the brand colours.
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
  category,
  className = '',
  sizes,
  priority = false,
  illustration = false,
  fit = 'cover',
}: {
  image?: string;
  category: string;
  className?: string;
  sizes: string;
  priority?: boolean;
  illustration?: boolean;
  fit?: ImageFit;
}) {
  const classes = [
    'story-thumb',
    image
      ? 'story-thumb--photo'
      : `story-thumb--card ${fallbackTones[category] || 'story-thumb--ink'}`,
    image && fit === 'contain' ? 'story-thumb--contain' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes}>
      {image ? (
        <>
          {/* The headline sits inside the same link, so the art is decorative. */}
          <Image
            src={image}
            alt=""
            fill
            sizes={sizes}
            priority={priority}
            className="story-thumb__image"
          />
          {illustration && (
            <span className="story-thumb__illustration">Illustration</span>
          )}
        </>
      ) : (
        <span className="story-thumb__fallback" aria-hidden="true">
          <span className="story-thumb__mark">trends today</span>
          <span className="story-thumb__rule" />
          <span className="story-thumb__label">
            {getCategoryLabel(category)}
          </span>
        </span>
      )}
    </span>
  );
}
