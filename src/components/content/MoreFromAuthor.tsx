import Link from 'next/link';
import Image from 'next/image';
import { UserIcon } from '@heroicons/react/24/outline';
import authorsData from '../../../data/authors.json';
import { formatArticleDate } from '@/lib/editorial';

interface Author {
  id?: string;
  name: string;
  title?: string;
  bio?: string;
}

interface Article {
  title: string;
  description: string;
  href: string;
  publishedAt: string;
  image?: string;
  category: string;
  readingTime: string | number;
}

interface MoreFromAuthorProps {
  author: Author | string;
  articles?: Article[];
}

export default function MoreFromAuthor({
  author,
  articles = [],
}: MoreFromAuthorProps) {
  const authorName = typeof author === 'string' ? author : author.name;
  const authorId =
    typeof author === 'object' && author.id
      ? author.id
      : authorName.toLowerCase().replace(/\s+/g, '-');

  // Get author data from JSON for profile image
  const authors = authorsData as Record<string, { avatar?: string }>;
  const authorData = authors[authorId];

  const displayArticles = articles.slice(0, 3);

  if (displayArticles.length === 0) return null;

  return (
    <section className="author-more">
      <div className="author-more__header">
        <div className="author-more__avatar">
          {authorData?.avatar ? (
            <Image
              src={authorData.avatar}
              alt={authorName}
              width={64}
              height={64}
              className="h-full w-full object-cover"
            />
          ) : (
            <UserIcon aria-hidden="true" />
          )}
        </div>
        <div>
          <h3>More from {authorName}</h3>
          <p>More reporting and analysis from this author.</p>
        </div>
      </div>

      <div className="author-more__grid">
        {displayArticles.map((article, index) => (
          <Link key={index} href={article.href} className="author-more__story">
            {article.image && (
              <div className="author-more__media">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover editorial-image"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            )}

            <div>
              <h4>{article.title}</h4>

              <div className="author-more__meta">
                <span className="story-card__category">{article.category}</span>
                <span>•</span>
                <span className="text-xs">
                  {typeof article.readingTime === 'string' &&
                  article.readingTime.includes('min read')
                    ? article.readingTime
                    : `${article.readingTime} min read`}
                </span>
              </div>

              {article.description && (
                <p className="author-more__description">
                  {article.description}
                </p>
              )}

              <div className="author-more__date">
                {formatArticleDate(article.publishedAt)}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {authorId && authorId !== 'trends-today-editorial' && (
        <div className="author-more__action">
          <Link href={`/author/${authorId}`} className="primary-button">
            View all articles by {authorName} →
          </Link>
        </div>
      )}
    </section>
  );
}
