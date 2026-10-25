const SITE_URL = 'https://www.trendstoday.ca';
const ARTICLE_CATEGORIES = [
  'local-news',
  'transit',
  'things-to-do',
  'food-drink',
  'housing',
  'sports',
  'science',
  'culture',
  'psychology',
  'technology',
  'tech',
  'health',
  'space',
  'money',
  'facts',
];

function articlePath(category, slug) {
  return `/${category}/${slug}`;
}

function canonicalArticleUrl(category, slug) {
  return `${SITE_URL}${articlePath(category, slug)}`;
}

function isPublishedFrontmatter(data = {}) {
  const status = String(data.status || '')
    .trim()
    .toLowerCase();
  return (
    data.draft !== true &&
    (!status || status === 'published') &&
    !/draft\s*\(do not merge\)/i.test(String(data.title || ''))
  );
}

function isNoindexFrontmatter(data = {}) {
  const robots = data.robots ?? data.seo?.robots;
  return (
    data.noindex === true ||
    data.index === false ||
    data.seo?.noindex === true ||
    robots?.index === false ||
    (typeof robots === 'string' &&
      /(?:^|[,\s])noindex(?:$|[,\s])/i.test(robots))
  );
}

function timestamp(value) {
  const parsed = value instanceof Date ? value.getTime() : Date.parse(value);
  if (Number.isFinite(parsed)) return new Date(parsed).toISOString();
}

function articlePublishedAt(data = {}) {
  return timestamp(data.publishedAt);
}

function articleLastmod(data = {}) {
  for (const value of [data.updatedAt, data.publishedAt]) {
    const parsed = value instanceof Date ? value.getTime() : Date.parse(value);
    if (Number.isFinite(parsed)) return new Date(parsed).toISOString();
  }
}

function selectNewsArticles(articles, now = Date.now()) {
  const cutoff = now - 2 * 24 * 60 * 60 * 1000;
  return articles.filter((article) => {
    const data = article.frontmatter || article.data || {};
    const publishedTime = Date.parse(articlePublishedAt(data));
    return (
      isPublishedFrontmatter(data) &&
      !isNoindexFrontmatter(data) &&
      publishedTime >= cutoff &&
      publishedTime <= now
    );
  });
}

module.exports = {
  ARTICLE_CATEGORIES,
  SITE_URL,
  articleLastmod,
  articlePath,
  articlePublishedAt,
  canonicalArticleUrl,
  isNoindexFrontmatter,
  isPublishedFrontmatter,
  selectNewsArticles,
};
