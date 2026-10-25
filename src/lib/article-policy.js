const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

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

function timestamp(data, fields) {
  for (const field of fields) {
    const value = data?.[field];
    const parsed = value instanceof Date ? value.getTime() : Date.parse(value);
    if (!Number.isFinite(parsed)) {
      continue;
    }
    return new Date(parsed).toISOString();
  }
}

function readArticle(
  category,
  slug,
  contentDir = path.join(process.cwd(), 'content')
) {
  if (!ARTICLE_CATEGORIES.includes(category)) return null;
  const filePath = path.join(contentDir, category, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const { data } = matter(fs.readFileSync(filePath, 'utf8'));
  const publishedAt = timestamp(data, ['publishedAt', 'datePublished']);
  const lastmod = timestamp(data, [
    'updatedAt',
    'modifiedAt',
    'publishedAt',
    'datePublished',
  ]);
  return { category, slug, data, publishedAt, lastmod };
}

function getSitemapArticles(contentDir = path.join(process.cwd(), 'content')) {
  const articles = [];
  for (const category of ARTICLE_CATEGORIES) {
    const categoryDir = path.join(contentDir, category);
    if (!fs.existsSync(categoryDir)) continue;
    for (const file of fs.readdirSync(categoryDir).sort()) {
      if (!file.endsWith('.mdx') || /\.backup\.mdx$/i.test(file)) continue;
      const article = readArticle(category, file.slice(0, -4), contentDir);
      if (
        !article ||
        !isPublishedFrontmatter(article.data) ||
        isNoindexFrontmatter(article.data)
      ) {
        continue;
      }
      if (!article.publishedAt || !article.lastmod) {
        throw new Error(
          `Published article has no valid date: ${category}/${article.slug}`
        );
      }
      articles.push(article);
    }
  }
  return articles;
}

function selectNewsArticles(articles, now = Date.now()) {
  const cutoff = now - 2 * 24 * 60 * 60 * 1000;
  return articles.filter((article) => {
    const publishedTime = Date.parse(article.publishedAt);
    return publishedTime >= cutoff && publishedTime <= now;
  });
}

module.exports = {
  ARTICLE_CATEGORIES,
  SITE_URL,
  articlePath,
  canonicalArticleUrl,
  getSitemapArticles,
  isNoindexFrontmatter,
  isPublishedFrontmatter,
  readArticle,
  selectNewsArticles,
};
