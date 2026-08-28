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
  eventEndDate?: string;
  city?: string;
  tags?: string[];
}

interface ArticleCardProps {
  article: EditorialArticle;
  variant?: 'lead' | 'standard' | 'compact' | 'wide';
  priority?: boolean;
}

function inferCity(article: EditorialArticle): string | null {
  if (article.city) return article.city;
  if (article.locality) {
    const loc = article.locality.toLowerCase();
    if (loc === 'metro vancouver' || loc.includes('translink'))
      return 'Regional';
    return article.locality;
  }
  const tags = article.tags || [];
  const title = article.title.toLowerCase();
  const tagStr = tags.join(' ').toLowerCase();
  const combined = `${title} ${tagStr}`;
  if (combined.includes('translink') || combined.includes('metro vancouver'))
    return 'Regional';
  if (combined.includes('surrey')) return 'Surrey';
  if (combined.includes('burnaby')) return 'Burnaby';
  if (combined.includes('richmond')) return 'Richmond';
  if (combined.includes('vancouver') && !combined.includes('metro vancouver'))
    return 'Vancouver';
  if (combined.includes('coquitlam')) return 'Coquitlam';
  if (combined.includes('delta')) return 'Delta';
  if (combined.includes('langley')) return 'Langley';
  if (combined.includes('new westminster')) return 'New Westminster';
  return null;
}

function getEventStatus(
  article: EditorialArticle
): 'still-on' | 'ended' | null {
  if (!article.eventEndDate) return null;
  const endDate = new Date(article.eventEndDate);
  if (Number.isNaN(endDate.getTime())) return null;
  const now = new Date();
  return endDate < now ? 'ended' : 'still-on';
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
  const cityChip = inferCity(article);
  const eventStatus = getEventStatus(article);

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
          {eventStatus && (
            <span
              className={`story-card__status story-card__status--${eventStatus}`}
              aria-label={
                eventStatus === 'ended' ? 'Event ended' : 'Event still on'
              }
            >
              {eventStatus === 'ended' ? 'Ended' : 'Still on'}
            </span>
          )}
        </div>
      </Link>

      <div className="story-card__body">
        <div className="story-card__header">
          <span className="story-card__category">{category}</span>
          {cityChip && <span className="story-card__city">{cityChip}</span>}
        </div>
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
