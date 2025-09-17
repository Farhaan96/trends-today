import Link from 'next/link';
import Image from 'next/image';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import { Article } from '@/lib/content';

type Props = {
  article: Article;
  showThumb?: boolean;
};

export default function PostListItem({ article, showThumb = false }: Props) {
  const title: string = article.frontmatter.title;
  const href: string = article.href;
  const date = new Date(
    article.frontmatter.publishedAt ||
      article.frontmatter.datePublished ||
      new Date().toISOString()
  );
  const category: string = article.frontmatter.category || article.type;
  const img: string | undefined = article.frontmatter.image;
  const description: string =
    article.frontmatter.description || article.frontmatter.summary || '';

  return (
    <article className="py-6 border-b border-gray-100 last:border-b-0">
      <div className="flex gap-6 items-start">
        {/* Content section */}
        <div className="flex-1 min-w-0">
          <Link href={href} prefetch={false} className="group">
            {/* Clean, clickable title like leravi.org */}
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors">
              {title}
            </h2>

            {/* Brief description for context */}
            {description && (
              <p className="text-gray-600 text-sm sm:text-base line-clamp-2 mb-3 leading-relaxed">
                {description}
              </p>
            )}
          </Link>

          {/* Clean metadata */}
          <div className="flex items-center text-sm text-gray-500 space-x-3">
            <span className="font-medium text-blue-600 uppercase tracking-wide text-xs">
              {category}
            </span>
            <span>•</span>
            <time dateTime={date.toISOString()}>
              {date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
            {article.frontmatter.readingTime && (
              <>
                <span>•</span>
                <span>
                  {typeof article.frontmatter.readingTime === 'string' &&
                  article.frontmatter.readingTime.includes('min read')
                    ? article.frontmatter.readingTime
                    : `${article.frontmatter.readingTime} min read`}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Thumbnail with consistent 16:9 ratio */}
        {showThumb && img && (
          <Link
            href={href}
            prefetch={false}
            className="flex-shrink-0 hidden sm:block"
          >
            <div className="relative w-40 h-24 md:w-48 md:h-28 rounded-lg overflow-hidden bg-gray-100 hover:shadow-lg transition-shadow">
              <ImageWithFallback
                src={img}
                alt={title}
                fill
                className="object-cover transition-transform duration-300"
                sizes="(max-width: 768px) 160px, 192px"
                loading="lazy"
              />
            </div>
          </Link>
        )}
      </div>
    </article>
  );
}
