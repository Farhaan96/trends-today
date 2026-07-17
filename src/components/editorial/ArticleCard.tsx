import Link from 'next/link';
import EditorialImage from './EditorialImage';
import {
  formatArticleDate,
  formatArticleDateTime,
  getAuthorName,
  getCategoryFromHref,
  type EditorialAuthor,
} from '@/lib/editorial';

export interface EditorialArticle {
  href: string;
  title: string;
  description?: string;
  image?: string;
  author?: EditorialAuthor;
  publishedAt?: string;
  category?: string;
  locality?: string;
  storyType?: string;
}

interface ArticleCardProps {
  article: EditorialArticle;
  variant?: 'lead' | 'standard' | 'compact' | 'wide';
  priority?: boolean;
}

export default function ArticleCard({
  article,
  variant = 'standard',
  priority = false,
}: ArticleCardProps) {
  const category = article.category || getCategoryFromHref(article.href);
  const date = article.locality
    ? formatArticleDateTime(article.publishedAt)
    : formatArticleDate(article.publishedAt);

  return (
    <article className={`story-card story-card--${variant}`}>
      <Link
        href={article.href}
        prefetch={false}
        className="story-card__image-link"
        aria-label={article.title}
      >
        <div className="story-card__media">
          <EditorialImage
            src={article.image}
            alt={article.title}
            priority={priority}
            sizes={
              variant === 'lead'
                ? '(max-width: 1024px) 100vw, 62vw'
                : variant === 'wide'
                  ? '(max-width: 768px) 100vw, 48vw'
                  : '(max-width: 768px) 100vw, 32vw'
            }
          />
        </div>
      </Link>

      <div className="story-card__body">
        <div className="story-card__category">{category}</div>
        <Link
          href={article.href}
          prefetch={false}
          className="story-card__title-link"
        >
          <h2 className="story-card__title">{article.title}</h2>
        </Link>
        {article.description && variant !== 'compact' && (
          <p className="story-card__description">{article.description}</p>
        )}
        <div className="story-card__meta">
          {article.locality && <span>{article.locality}</span>}
          <span>{getAuthorName(article.author)}</span>
          {date && <time dateTime={article.publishedAt}>{date}</time>}
        </div>
      </div>
    </article>
  );
}
