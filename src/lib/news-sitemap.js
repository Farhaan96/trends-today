const {
  articlePublishedAt,
  canonicalArticleUrl,
  selectNewsArticles,
} = require('./article-policy');

function safeCdata(value) {
  return value.replace(/]]>/g, ']]]]><![CDATA[>');
}

function buildNewsSitemap(articles, now = Date.now()) {
  const recentNews = selectNewsArticles(articles, now);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${recentNews
  .map(
    (article) => `  <url>
    <loc>${canonicalArticleUrl(article.category, article.slug)}</loc>
    <news:news>
      <news:publication>
        <news:name>Trends Today</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${articlePublishedAt(article.frontmatter)}</news:publication_date>
      <news:title><![CDATA[${safeCdata(article.title)}]]></news:title>
      <news:keywords>${article.category}</news:keywords>
    </news:news>
  </url>`
  )
  .join('\n')}
</urlset>`;
}

module.exports = { buildNewsSitemap };
