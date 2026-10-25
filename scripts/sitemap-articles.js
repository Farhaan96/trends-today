const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const {
  ARTICLE_CATEGORIES,
  articleLastmod,
  articlePublishedAt,
  isNoindexFrontmatter,
  isPublishedFrontmatter,
} = require('../src/lib/article-policy');

function readArticle(
  category,
  slug,
  contentDir = path.join(process.cwd(), 'content')
) {
  if (!ARTICLE_CATEGORIES.includes(category)) return null;
  const filePath = path.join(contentDir, category, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const { data } = matter(fs.readFileSync(filePath, 'utf8'));
  return {
    category,
    slug,
    data,
    publishedAt: articlePublishedAt(data),
    lastmod: articleLastmod(data),
  };
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
        article &&
        isPublishedFrontmatter(article.data) &&
        !isNoindexFrontmatter(article.data)
      ) {
        articles.push(article);
      }
    }
  }
  return articles;
}

module.exports = { getSitemapArticles, readArticle };
