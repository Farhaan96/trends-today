import Image from 'next/image';
import { getCategoryLabel } from '@/lib/categories';

const fallbackTones: Record<string, string> = {
  'local-news': 'story-thumb--coral',
  transit: 'story-thumb--ink',
  'things-to-do': 'story-thumb--lime',
  'food-drink': 'story-thumb--accent',
  housing: 'story-thumb--surface',
  sports: 'story-thumb--coral',
};

export default function StoryThumb({
  image,
  imageAlt,
  title,
  category,
  className = '',
  sizes,
}: {
  image?: string;
  imageAlt?: string;
  title: string;
  category: string;
  className?: string;
  sizes: string;
}) {
  const classes = [
    'story-thumb',
    fallbackTones[category] || 'story-thumb--surface',
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
          className="story-thumb__image"
        />
      ) : (
        <span className="story-thumb__fallback">
          {getCategoryLabel(category)}
        </span>
      )}
    </span>
  );
}
