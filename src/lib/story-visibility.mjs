/**
 * Shared visibility rules for editorial story rails and category hubs.
 *
 * Plain .mjs (like google-analytics.mjs) so the same logic runs in the
 * Next.js app and in dependency-free `node --test` regression tests.
 */

/**
 * A story is "still on" unless its window has explicitly closed:
 * either `eventEnded: true` or an `eventEndDate` in the past.
 * Missing or unparseable dates never hide a story.
 */
export function isStillOn(frontmatter, now = new Date()) {
  if (!frontmatter) return true;
  if (frontmatter.eventEnded === true) return false;
  const endDate = frontmatter.eventEndDate;
  if (!endDate) return true;
  const end = new Date(endDate);
  if (Number.isNaN(end.getTime())) return true;
  return end >= now;
}

function getTitle(article) {
  return article.title || article.frontmatter?.title;
}

function getCategory(article) {
  return article.category || article.frontmatter?.category;
}

function getLocality(article) {
  return article.frontmatter?.locality || article.frontmatter?.city;
}

function getAuthorName(article) {
  const author = article.author ?? article.frontmatter?.author ?? undefined;
  if (typeof author === 'string') return author;
  return author?.name;
}

function getPublishedTime(article) {
  const raw = article.publishedAt || article.frontmatter?.publishedAt;
  const time = new Date(raw || 0).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function isRailCandidate(article, currentArticle, now) {
  if (article.slug === currentArticle.slug) return false;
  if (!getTitle(article)) return false;
  return isStillOn(article.frontmatter, now);
}

function scoreRelatedStory(article, currentArticle) {
  let score = 0;
  const currentCategory = getCategory(currentArticle);
  const currentLocality = getLocality(currentArticle);
  const currentTitle = getTitle(currentArticle);
  const currentKeywords = currentArticle.frontmatter?.keywords || [];
  const currentTags = currentArticle.frontmatter?.tags || [];

  const articleCategory = getCategory(article);
  const articleLocality = getLocality(article);
  const articleTitle = getTitle(article);
  const articleKeywords = article.frontmatter?.keywords || [];
  const articleTags = article.frontmatter?.tags || [];

  // Same beat gets the highest score
  if (articleCategory && articleCategory === currentCategory) {
    score += 10;
  }

  // Same city is the next strongest signal
  if (articleLocality && articleLocality === currentLocality) {
    score += 8;
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

  return score;
}

/**
 * Scored related-rail selection: still-on stories only, preferring
 * same city or same beat, then keyword/tag/title overlap.
 */
export function selectRelatedStories(
  currentArticle,
  allArticles,
  maxArticles = 3,
  now = new Date()
) {
  return allArticles
    .filter((article) => isRailCandidate(article, currentArticle, now))
    .map((article) => ({
      article,
      score: scoreRelatedStory(article, currentArticle),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxArticles)
    .map(({ article }) => article);
}

/**
 * Fallback rail when nothing scores: recent still-on stories from the
 * same category.
 */
export function selectCategoryFallbackStories(
  currentArticle,
  allArticles,
  maxArticles = 3,
  now = new Date()
) {
  const currentCategory = getCategory(currentArticle);
  return allArticles
    .filter(
      (article) =>
        isRailCandidate(article, currentArticle, now) &&
        getCategory(article) === currentCategory
    )
    .sort((a, b) => getPublishedTime(b) - getPublishedTime(a))
    .slice(0, maxArticles);
}

/**
 * "More from author" rail: still-on stories by the same author,
 * preferring same city or same beat, then recency.
 */
export function selectAuthorStories(
  currentArticle,
  allArticles,
  authorName,
  maxArticles = 3,
  now = new Date()
) {
  const currentCategory = getCategory(currentArticle);
  const currentLocality = getLocality(currentArticle);
  const prefers = (article) => {
    const locality = getLocality(article);
    if (locality && locality === currentLocality) return true;
    return getCategory(article) === currentCategory;
  };

  return allArticles
    .filter(
      (article) =>
        isRailCandidate(article, currentArticle, now) &&
        getAuthorName(article) === authorName
    )
    .sort((a, b) => {
      const preference = Number(prefers(b)) - Number(prefers(a));
      if (preference !== 0) return preference;
      return getPublishedTime(b) - getPublishedTime(a);
    })
    .slice(0, maxArticles);
}

/**
 * Category hubs excluded from search indexing. Story-level noindex
 * behavior is handled separately on article pages.
 */
const NOINDEX_CATEGORY_HUBS = ['science'];

export function isNoindexCategoryHub(category) {
  if (!category) return false;
  return NOINDEX_CATEGORY_HUBS.includes(String(category).toLowerCase());
}
