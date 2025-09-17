'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { SubtlePaginationLinks } from '@/components/ui/PaginationLinks';
import { paginateItems } from '@/lib/pagination';

interface Article {
  href: string;
  frontmatter: {
    title: string;
    author?: string | { name?: string };
    publishedAt?: string;
    datePublished?: string;
    image?: string;
    description?: string;
  };
}

interface ArticleListProps {
  initialArticles: Article[];
  allArticles: Article[];
}

export default function ArticleList({
  initialArticles,
  allArticles,
}: ArticleListProps) {
  const [displayedArticles, setDisplayedArticles] = useState(initialArticles);
  const [currentIndex, setCurrentIndex] = useState(9); // Start after initial 9 articles
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const pathname = usePathname();
  const articlesPerLoad = 6;

  const loadMore = () => {
    const nextArticles = allArticles.slice(
      currentIndex,
      currentIndex + articlesPerLoad
    );
    setDisplayedArticles([...displayedArticles, ...nextArticles]);
    setCurrentIndex(currentIndex + articlesPerLoad);

    // Update URL to reflect new page (for analytics and sharing)
    const newPage = Math.ceil((currentIndex + articlesPerLoad) / 12);
    setCurrentPage(newPage);
    if (newPage > 1) {
      const newUrl = `${pathname}?page=${newPage}`;
      window.history.replaceState({}, '', newUrl);
    }
  };

  const hasMore = currentIndex < allArticles.length;

  // Generate pagination info for subtle links
  const paginationResult = paginateItems(allArticles, currentPage, 12, '');
  const pagination = paginationResult.pagination;

  // Get first 3 posts for the featured layout
  const featuredPost = displayedArticles[0];
  const secondPost = displayedArticles[1];
  const thirdPost = displayedArticles[2];

  return (
    <>
      {/* Featured Article */}
      {featuredPost && (
        <div className="mb-16 md:mb-48">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Image */}
            <Link href={featuredPost.href} prefetch={false}>
              <div className="relative w-full aspect-square bg-gray-100 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                {featuredPost.frontmatter.image ? (
                  <Image
                    src={featuredPost.frontmatter.image}
                    alt={featuredPost.frontmatter.title}
                    fill
                    className="object-cover rounded-xl transition-transform duration-300"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3"></div>
                      <p className="text-sm">Image</p>
                    </div>
                  </div>
                )}
              </div>
            </Link>

            {/* Content */}
            <div className="space-y-4">
              <Link href={featuredPost.href} prefetch={false}>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 hover:text-blue-600 transition-colors leading-tight break-words">
                  {featuredPost.frontmatter.title}
                </h2>
              </Link>

              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>
                  By{' '}
                  {(() => {
                    const author = featuredPost.frontmatter.author;
                    const authorName =
                      typeof author === 'string'
                        ? author
                        : author?.name || 'Trends Today';
                    const authorId =
                      typeof author === 'string'
                        ? author.toLowerCase().replace(/\s+/g, '-')
                        : null;
                    const knownAuthors = [
                      'alex-chen',
                      'sarah-martinez',
                      'david-kim',
                      'emma-thompson',
                    ];

                    return authorId && knownAuthors.includes(authorId) ? (
                      <Link
                        href={`/author/${authorId}`}
                        className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {authorName}
                      </Link>
                    ) : (
                      <span className="font-medium">{authorName}</span>
                    );
                  })()}
                </span>
                <span>•</span>
                <span>
                  {new Date(
                    featuredPost.frontmatter.publishedAt ||
                      featuredPost.frontmatter.datePublished ||
                      new Date().toISOString()
                  ).toLocaleDateString()}
                </span>
              </div>

              {featuredPost.frontmatter.description && (
                <p className="text-gray-600 text-lg leading-relaxed">
                  {featuredPost.frontmatter.description.substring(0, 200)}...
                </p>
              )}

              <Link
                href={featuredPost.href}
                className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors shadow-sm"
              >
                Read more →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Preview Articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 md:mb-48">
        {secondPost && (
          <div className="space-y-4">
            <Link href={secondPost.href} prefetch={false}>
              <div className="relative w-full aspect-square bg-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                {secondPost.frontmatter.image ? (
                  <Image
                    src={secondPost.frontmatter.image}
                    alt={secondPost.frontmatter.title}
                    fill
                    className="object-cover rounded-xl transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-2"></div>
                      <p className="text-xs">Image</p>
                    </div>
                  </div>
                )}
              </div>
            </Link>
            <Link href={secondPost.href} prefetch={false}>
              <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors leading-tight break-words">
                {secondPost.frontmatter.title}
              </h3>
            </Link>
            <div className="text-sm text-gray-500">
              <span className="font-medium">
                {typeof secondPost.frontmatter.author === 'string'
                  ? secondPost.frontmatter.author
                  : secondPost.frontmatter.author?.name || 'Trends Today'}
              </span>
              <span className="mx-2">•</span>
              <span>
                {new Date(
                  secondPost.frontmatter.publishedAt ||
                    secondPost.frontmatter.datePublished ||
                    new Date().toISOString()
                ).toLocaleDateString()}
              </span>
            </div>
            <Link
              href={secondPost.href}
              className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors shadow-sm"
            >
              Read more →
            </Link>
          </div>
        )}

        {thirdPost && (
          <div className="space-y-4">
            <Link href={thirdPost.href} prefetch={false}>
              <div className="relative w-full aspect-square bg-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                {thirdPost.frontmatter.image ? (
                  <Image
                    src={thirdPost.frontmatter.image}
                    alt={thirdPost.frontmatter.title}
                    fill
                    className="object-cover rounded-xl transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-2"></div>
                      <p className="text-xs">Image</p>
                    </div>
                  </div>
                )}
              </div>
            </Link>
            <Link href={thirdPost.href} prefetch={false}>
              <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors leading-tight break-words">
                {thirdPost.frontmatter.title}
              </h3>
            </Link>
            <div className="text-sm text-gray-500">
              {(() => {
                const author = thirdPost.frontmatter.author;
                const authorName =
                  typeof author === 'string'
                    ? author
                    : author?.name || 'Trends Today';
                const authorId =
                  typeof author === 'string'
                    ? author.toLowerCase().replace(/\s+/g, '-')
                    : null;
                const knownAuthors = [
                  'alex-chen',
                  'sarah-martinez',
                  'david-kim',
                  'emma-thompson',
                ];

                return authorId && knownAuthors.includes(authorId) ? (
                  <Link
                    href={`/author/${authorId}`}
                    className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {authorName}
                  </Link>
                ) : (
                  <span className="font-medium">{authorName}</span>
                );
              })()}
              <span className="mx-2">•</span>
              <span>
                {new Date(
                  thirdPost.frontmatter.publishedAt ||
                    thirdPost.frontmatter.datePublished ||
                    new Date().toISOString()
                ).toLocaleDateString()}
              </span>
            </div>
            <Link
              href={thirdPost.href}
              className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors shadow-sm"
            >
              Read more →
            </Link>
          </div>
        )}
      </div>

      {/* Additional Articles Grid */}
      {displayedArticles.length > 3 && (
        <div className="mt-16 md:mt-48">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16">
            {displayedArticles.slice(3).map((article) => (
              <div key={article.href} className="space-y-4">
                <Link href={article.href} prefetch={false}>
                  <div className="relative w-full aspect-square bg-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    {article.frontmatter.image ? (
                      <Image
                        src={article.frontmatter.image}
                        alt={article.frontmatter.title}
                        fill
                        className="object-cover rounded-xl transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-2"></div>
                          <p className="text-xs">Image</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
                <Link href={article.href} prefetch={false}>
                  <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors leading-tight break-words">
                    {article.frontmatter.title}
                  </h3>
                </Link>
                <div className="text-sm text-gray-500">
                  {(() => {
                    const author = article.frontmatter.author;
                    const authorName =
                      typeof author === 'string'
                        ? author
                        : author?.name || 'Trends Today';
                    const authorId =
                      typeof author === 'string'
                        ? author.toLowerCase().replace(/\s+/g, '-')
                        : null;
                    const knownAuthors = [
                      'alex-chen',
                      'sarah-martinez',
                      'david-kim',
                      'emma-thompson',
                    ];

                    return authorId && knownAuthors.includes(authorId) ? (
                      <Link
                        href={`/author/${authorId}`}
                        className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {authorName}
                      </Link>
                    ) : (
                      <span className="font-medium">{authorName}</span>
                    );
                  })()}
                  <span className="mx-2">•</span>
                  <span>
                    {new Date(
                      article.frontmatter.publishedAt ||
                        article.frontmatter.datePublished ||
                        new Date().toISOString()
                    ).toLocaleDateString()}
                  </span>
                </div>
                <Link
                  href={article.href}
                  className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors shadow-sm"
                >
                  Read more →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="mt-16 md:mt-24 text-center">
          <button
            onClick={loadMore}
            className="inline-block bg-gradient-to-r from-blue-500 via-purple-600 to-blue-700 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105"
          >
            Load More Articles
          </button>
          <p className="mt-4 text-sm text-gray-500">
            Showing {displayedArticles.length} of {allArticles.length} articles
          </p>
        </div>
      )}

      {/* Subtle Pagination Links for Crawlers (Footer Area) */}
      <div className="mt-20 pt-8 border-t border-gray-100">
        <SubtlePaginationLinks
          pagination={pagination}
          baseUrl=""
          className="mb-8"
        />
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-2">
            For search engines and accessibility:
          </p>
          <nav className="flex flex-wrap justify-center gap-2 text-xs">
            {Array.from(
              { length: Math.min(pagination.totalPages, 10) },
              (_, i) => i + 1
            ).map((page) => (
              <Link
                key={page}
                href={page === 1 ? '/' : `/page/${page}`}
                className="px-2 py-1 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={`View page ${page} of articles`}
              >
                Page {page}
              </Link>
            ))}
            {pagination.totalPages > 10 && (
              <span className="px-2 py-1 text-gray-400">
                ... +{pagination.totalPages - 10} more pages
              </span>
            )}
          </nav>
        </div>
      </div>
    </>
  );
}
