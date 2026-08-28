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
    eventEndDate?: string;
    city?: string;
    tags?: string[];
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
    eventEndDate: article.frontmatter.eventEndDate,
    city: article.frontmatter.city,
    tags: article.frontmatter.tags,
  };
}

const PIN_CANDIDATES = [
  '/local-news/surrey-20-dollar-tree-sale-august-18',
  '/things-to-do/burnaby-farm-tour-big-bend',
  '/transit/translink-fall-service-changes-september-2026',
];

function isWorkAreaStory(article: Article): boolean {
  const href = article.href.toLowerCase();
  const title = article.frontmatter.title?.toLowerCase() || '';
  const combined = `${href} ${title}`;
  return (
    combined.includes('intersection') ||
    combined.includes('signal-work') ||
    combined.includes('signal-upgrades') ||
    combined.includes('signal work') ||
    combined.includes('water-main') ||
    combined.includes('water main') ||
    combined.includes('lane-closure') ||
    combined.includes('lane closure') ||
    combined.includes('road-work') ||
    combined.includes('road work') ||
    combined.includes('trunk') ||
    combined.includes('work-area')
  );
}

function isStillOn(article: Article): boolean {
  const endDate = article.frontmatter.eventEndDate;
  if (!endDate) return true;
  const end = new Date(endDate);
  if (Number.isNaN(end.getTime())) return true;
  return end >= new Date();
}

function applyPinning(articles: Article[]): Article[] {
  if (articles.length < 3) return articles;

  const firstThree = articles.slice(0, 3);
  const allWorkArea = firstThree.every(isWorkAreaStory);
  if (!allWorkArea) {
    const hasNonWorkAreaStillOn = firstThree.some(
      (a) => !isWorkAreaStory(a) && isStillOn(a)
    );
    if (hasNonWorkAreaStillOn) return articles;
  }

  for (const candidateHref of PIN_CANDIDATES) {
    const idx = articles.findIndex((a) => a.href === candidateHref);
    if (idx === -1) continue;
    const candidate = articles[idx];
    if (!isStillOn(candidate)) continue;
    if (idx < 3) return articles;
    const reordered = [...articles];
    reordered.splice(idx, 1);
    reordered.splice(0, 0, candidate);
    return reordered;
  }

  return articles;
}

export default function EditorialArticleList({
  allArticles,
}: EditorialArticleListProps) {
  const localArticles = allArticles.filter((article) =>
    isLocalNewsCategory(article.category || article.frontmatter.category || '')
  );
  const localDeskIsLive = localArticles.length > 0;
  const baseFeed = localDeskIsLive ? localArticles : allArticles;
  const feedArticles = applyPinning(baseFeed);
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
