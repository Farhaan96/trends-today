import Link from 'next/link';
import Image from 'next/image';

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
            const href = `/${currentCategory}/${article.slug}`;

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
                      {new Date(articleDate).toLocaleDateString()}
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
  const currentTitle =
    currentArticle.title || currentArticle.frontmatter?.title;
  const currentKeywords = currentArticle.frontmatter?.keywords || [];
  const currentTags = currentArticle.frontmatter?.tags || [];

  // Filter and score related articles
  const relatedArticles = allArticles
    .filter((article) => {
      // Exclude current article
      if (article.slug === currentArticle.slug) return false;

      // Must have a title
      if (!article.title && !article.frontmatter?.title) return false;

      return true;
    })
    .map((article) => {
      let score = 0;
      const articleCategory = article.category || article.frontmatter?.category;
      const articleTitle = article.title || article.frontmatter?.title;
      const articleKeywords = article.frontmatter?.keywords || [];
      const articleTags = article.frontmatter?.tags || [];

      // Same category gets highest score
      if (articleCategory === currentCategory) {
        score += 10;
      }

      // Keyword matches
      const keywordMatches = currentKeywords.filter(
        (keyword) =>
          articleKeywords.includes(keyword) ||
          articleTitle?.toLowerCase().includes(keyword.toLowerCase())
      );
      score += keywordMatches.length * 5;

      // Tag matches
      const tagMatches = currentTags.filter((tag) => articleTags.includes(tag));
      score += tagMatches.length * 3;

      // Title word similarity (basic)
      if (currentTitle && articleTitle) {
        const currentWords = currentTitle
          .toLowerCase()
          .split(' ')
          .filter((w) => w.length > 3);
        const articleWords = articleTitle
          .toLowerCase()
          .split(' ')
          .filter((w) => w.length > 3);
        const wordMatches = currentWords.filter((word) =>
          articleWords.some((aw) => aw.includes(word) || word.includes(aw))
        );
        score += wordMatches.length * 2;
      }

      return { article, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxArticles)
    .map(({ article }) => article);

  if (relatedArticles.length === 0) {
    // Fallback: just get recent articles from the same category
    const fallbackArticles = allArticles
      .filter((article) => {
        const articleCategory =
          article.category || article.frontmatter?.category;
        return (
          articleCategory === currentCategory &&
          article.slug !== currentArticle.slug
        );
      })
      .slice(0, maxArticles);

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
