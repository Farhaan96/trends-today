'use client';

import { useState } from 'react';
import ArticleCard, { type EditorialArticle } from './ArticleCard';
import { SubtlePaginationLinks } from '@/components/ui/PaginationLinks';
import { paginateItems } from '@/lib/pagination';
import { isLocalNewsCategory } from '@/lib/categories';

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
    locality?: string;
    storyType?: string;
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
    locality: article.frontmatter.locality,
    storyType: article.frontmatter.storyType,
  };
}

export default function EditorialArticleList({
  allArticles,
}: EditorialArticleListProps) {
  const localArticles = allArticles.filter((article) =>
    isLocalNewsCategory(article.category || article.frontmatter.category || '')
  );
  const localDeskIsLive = localArticles.length > 0;
  const feedArticles = localDeskIsLive ? localArticles : allArticles;
  const initialCount = Math.min(12, feedArticles.length);
  const [displayedArticles, setDisplayedArticles] = useState(
    feedArticles.slice(0, initialCount)
  );
  const [currentIndex, setCurrentIndex] = useState(initialCount);
  const articlesPerLoad = 9;
  const pagination = paginateItems(feedArticles, 1, 12, '').pagination;

  const loadMore = () => {
    const nextIndex = Math.min(
      currentIndex + articlesPerLoad,
      feedArticles.length
    );
    setDisplayedArticles(feedArticles.slice(0, nextIndex));
    setCurrentIndex(nextIndex);
  };

  const [featuredPost, secondPost, thirdPost] = displayedArticles;
  const latestPosts = displayedArticles.slice(3);

  return (
    <div className="home-feed">
      <div className="home-intro">
        <p className="home-intro__kicker">Lower Mainland, today</p>
        <h1>What is happening around you.</h1>
        <p>
          Local news, transit, food, events, housing and sports from Vancouver
          to the Fraser Valley.
        </p>
      </div>

      {!localDeskIsLive && (
        <div className="local-desk-note" role="status">
          <strong>Lower Mainland desk in preparation.</strong>
          <span>The existing Trends Today archive is shown below.</span>
        </div>
      )}

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
            <h2 id="latest-heading">
              {localDeskIsLive ? 'Latest local updates' : 'From the archive'}
            </h2>
            <span>{feedArticles.length} updates</span>
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

      {currentIndex < feedArticles.length && (
        <div className="feed-actions">
          <button type="button" onClick={loadMore} className="primary-button">
            Load more stories
          </button>
          <p>
            Showing {displayedArticles.length} of {feedArticles.length}
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
