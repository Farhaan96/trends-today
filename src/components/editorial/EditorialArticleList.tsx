'use client';

import { useState } from 'react';
import ArticleCard, { type EditorialArticle } from './ArticleCard';
import { SubtlePaginationLinks } from '@/components/ui/PaginationLinks';
import { paginateItems } from '@/lib/pagination';

interface Article {
  href: string;
  category?: string;
  frontmatter: {
    title: string;
    author?: string | { name?: string };
    publishedAt?: string;
    datePublished?: string;
    image?: string;
    description?: string;
    category?: string;
  };
}

interface EditorialArticleListProps {
  initialArticles: Article[];
  allArticles: Article[];
}

function normalizeArticle(article: Article): EditorialArticle {
  return {
    href: article.href,
    title: article.frontmatter.title,
    description: article.frontmatter.description,
    image: article.frontmatter.image,
    author: article.frontmatter.author,
    publishedAt:
      article.frontmatter.publishedAt || article.frontmatter.datePublished,
    category: article.category || article.frontmatter.category,
  };
}

export default function EditorialArticleList({
  initialArticles,
  allArticles,
}: EditorialArticleListProps) {
  const [displayedArticles, setDisplayedArticles] = useState(initialArticles);
  const [currentIndex, setCurrentIndex] = useState(initialArticles.length);
  const articlesPerLoad = 6;
  const pagination = paginateItems(allArticles, 1, 12, '').pagination;

  const loadMore = () => {
    const nextIndex = Math.min(
      currentIndex + articlesPerLoad,
      allArticles.length
    );
    setDisplayedArticles(allArticles.slice(0, nextIndex));
    setCurrentIndex(nextIndex);
  };

  const [featuredPost, secondPost, thirdPost] = displayedArticles;
  const latestPosts = displayedArticles.slice(3);

  return (
    <div className="home-feed">
      <div className="home-intro">
        <p className="home-intro__kicker">
          Independent reporting and useful ideas
        </p>
        <h1>What is worth knowing today.</h1>
        <p>
          Clear reporting across science, culture, psychology, technology,
          health, and space.
        </p>
      </div>

      {featuredPost && (
        <section className="lead-layout" aria-label="Featured stories">
          <ArticleCard
            article={normalizeArticle(featuredPost)}
            variant="lead"
            priority
          />
          <div className="lead-layout__rail">
            {secondPost && (
              <ArticleCard
                article={normalizeArticle(secondPost)}
                variant="compact"
                priority
              />
            )}
            {thirdPost && (
              <ArticleCard
                article={normalizeArticle(thirdPost)}
                variant="compact"
              />
            )}
          </div>
        </section>
      )}

      {latestPosts.length > 0 && (
        <section className="latest-section" aria-labelledby="latest-heading">
          <div className="section-heading">
            <h2 id="latest-heading">Latest stories</h2>
            <span>{allArticles.length} articles</span>
          </div>
          <div className="latest-grid">
            {latestPosts.map((article, index) => (
              <ArticleCard
                key={article.href}
                article={normalizeArticle(article)}
                variant={index === 0 ? 'wide' : 'standard'}
              />
            ))}
          </div>
        </section>
      )}

      {currentIndex < allArticles.length && (
        <div className="feed-actions">
          <button type="button" onClick={loadMore} className="primary-button">
            Load more stories
          </button>
          <p>
            Showing {displayedArticles.length} of {allArticles.length}
          </p>
        </div>
      )}

      <SubtlePaginationLinks
        pagination={pagination}
        baseUrl=""
        className="crawler-pagination"
      />
    </div>
  );
}
