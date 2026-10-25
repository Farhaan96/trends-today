const {
  ARTICLE_CATEGORIES,
  canonicalArticleUrl,
  isNoindexFrontmatter,
  isPublishedFrontmatter,
} = require('./src/lib/article-policy');
const {
  getSitemapArticles,
  readArticle,
} = require('./scripts/sitemap-articles');

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.trendstoday.ca',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,
  autoLastmod: false,
  exclude: [
    '/api/*',
    '/admin/*',
    '/demo-article',
    '/subscribe',
    '/_next/*',
    '/images/*',
    '/assets/*',
    '/search',
    '/search/*',
    '/robots.txt',
    '/rss.xml',
    '/feed',
    '/feed/*',
    '/news-sitemap.xml',
    '/compare/iphone-15-pro-vs-samsung-galaxy-s24',
  ],
  transform: async (config, path) => {
    const articleMatch = path.match(/^\/([^/]+)\/([^/]+)$/);
    let contentLastmod;
    let loc = path;
    if (articleMatch && ARTICLE_CATEGORIES.includes(articleMatch[1])) {
      const article = readArticle(articleMatch[1], articleMatch[2]);
      if (
        article &&
        (!isPublishedFrontmatter(article.data) ||
          isNoindexFrontmatter(article.data))
      ) {
        return null;
      }
      contentLastmod = article?.lastmod;
      if (article) loc = canonicalArticleUrl(article.category, article.slug);
    }

    // Custom priorities based on page type
    let priority = 0.7;
    let changefreq = 'daily';

    if (path === '/') {
      priority = 1.0; // Homepage gets highest priority
      changefreq = 'hourly';
    } else if (path.match(/^\/page\/[0-9]+$/)) {
      // Paginated homepage pages - decreasing priority
      const pageNum = parseInt(path.split('/')[2]);
      priority = Math.max(0.5, 0.9 - (pageNum - 1) * 0.1);
      changefreq = 'daily';
    } else if (path.match(/^\/[^\/]+\/page\/[0-9]+$/)) {
      // Category pagination pages
      const pageNum = parseInt(path.split('/')[3]);
      priority = Math.max(0.4, 0.7 - (pageNum - 1) * 0.1);
      changefreq = 'daily';
    } else if (path.match(/^\/[^\/]+$/) && !path.includes('.')) {
      // Category pages
      priority = 0.8;
      changefreq = 'daily';
    } else if (path.match(/^\/[^\/]+\/[^\/]+$/)) {
      // Article pages
      priority = 0.6;
      changefreq = 'weekly';
    } else if (path.includes('/author/')) {
      // Author pages
      priority = 0.5;
      changefreq = 'monthly';
    } else {
      // Other pages
      priority = 0.5;
      changefreq = 'monthly';
    }

    const entry = {
      loc,
      changefreq,
      priority: Math.round(priority * 10) / 10,
    };
    if (contentLastmod) entry.lastmod = contentLastmod;
    return entry;
  },
  additionalPaths: async () =>
    getSitemapArticles().map((article) => {
      const entry = {
        loc: canonicalArticleUrl(article.category, article.slug),
        changefreq: 'weekly',
        priority: 0.6,
      };
      if (article.lastmod) entry.lastmod = article.lastmod;
      return entry;
    }),
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/demo-article',
          '/search?*',
          '/*?page=*', // Prevent query parameter URLs from being indexed
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/demo-article'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/demo-article'],
      },
    ],
    additionalSitemaps: ['https://www.trendstoday.ca/news-sitemap.xml'],
  },
};
