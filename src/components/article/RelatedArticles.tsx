import Link from 'next/link';
import Image from 'next/image';
import { formatArticleDate } from '@/lib/editorial';
import {
  selectRelatedStories,
  selectCategoryFallbackStories,
} from '@/lib/story-visibility.mjs';

interface Article {
  slug: string;
  title?: string;
  image?: string;
  category?: string;
  publishedAt?: string;
  frontmatter?: {
    title?: string;
    image?: string;
    category?: string;
    publishedAt?: string;
    description?: string;
    keywords?: string[];
    tags?: string[];
    locality?: string;
    city?: string;
    eventEndDate?: string;
    eventEnded?: boolean;
  };
}

interface RelatedArticlesProps {
  articles: Article[];
  currentCategory: string;
  title?: string;
  className?: string;
}

export default function RelatedArticles({
  articles,
  currentCategory,
  title = 'Related Articles',
  className = '',
}: RelatedArticlesProps) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <section className={`py-12 ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">{title}</h2>
        <div
          className={`grid gap-6 ${
            articles.length === 1
              ? 'grid-cols-1 max-w-md'
              : articles.length === 2
                ? 'md:grid-cols-2'
                : 'md:grid-cols-3'
          }`}
        >
          {articles.map((article) => {
            const articleTitle = article.title || article.frontmatter?.title;
            const articleImage = article.image || article.frontmatter?.image;
            const articleDescription = article.frontmatter?.description;
            const articleDate =
              article.publishedAt || article.frontmatter?.publishedAt;
            const articleCategory =
              article.category ||
              article.frontmatter?.category ||
              currentCategory;
            const href = `/${articleCategory}/${article.slug}`;

            return (
              <Link
                key={article.slug}
                href={href}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow block overflow-hidden group"
              >
                <div className="relative aspect-video">
                  {articleImage ? (
                    <Image
                      src={articleImage}
                      alt={articleTitle || 'Article'}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-2"></div>
                        <p className="text-xs">Image</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg line-clamp-2 hover:text-blue-600 transition-colors mb-2">
                    {articleTitle}
                  </h3>
                  {articleDescription && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {articleDescription}
                    </p>
                  )}
                  {articleDate && (
                    <p className="text-xs text-gray-500">
                      {formatArticleDate(articleDate)}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/**
 * Smart related articles component that automatically finds related content
 */
interface SmartRelatedArticlesProps {
  currentArticle: {
    slug: string;
    title?: string;
    category?: string;
    frontmatter?: {
      title?: string;
      category?: string;
      keywords?: string[];
      tags?: string[];
      locality?: string;
      city?: string;
    };
  };
  allArticles: Article[];
  maxArticles?: number;
  className?: string;
}

export function SmartRelatedArticles({
  currentArticle,
  allArticles,
  maxArticles = 3,
  className = '',
}: SmartRelatedArticlesProps) {
  const currentCategory =
    currentArticle.category || currentArticle.frontmatter?.category;

  // Still-on stories only, preferring same city or same beat
  const relatedArticles: Article[] = selectRelatedStories(
    currentArticle,
    allArticles,
    maxArticles
  );

  if (relatedArticles.length === 0) {
    // Fallback: recent still-on articles from the same category
    const fallbackArticles: Article[] = selectCategoryFallbackStories(
      currentArticle,
      allArticles,
      maxArticles
    );

    if (fallbackArticles.length === 0) return null;

    return (
      <RelatedArticles
        articles={fallbackArticles}
        currentCategory={currentCategory || ''}
        title={`More from ${currentCategory || 'this category'}`}
        className={className}
      />
    );
  }

  return (
    <RelatedArticles
      articles={relatedArticles}
      currentCategory={currentCategory || ''}
      title="Related Articles"
      className={className}
    />
  );
}
