/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://trendstoday.ca',
  generateRobotsTxt: true,
  exclude: ['/server-sitemap-index.xml'],
  additionalPaths: async (config) => [
    await config.transform(config, '/reviews/iphone-15-pro-review'),
    await config.transform(config, '/compare/iphone-15-pro-vs-samsung-galaxy-s24'),
    await config.transform(config, '/best/smartphones/2025'),
    await config.transform(config, '/news/apple-vision-pro-2-development'),
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: '*',
        disallow: ['/api/', '/_next/', '/admin/'],
      },
    ],
    additionalSitemaps: [
      'https://trendstoday.ca/news-sitemap.xml',
    ],
  },
  transform: async (config, path) => {
    return {
      loc: path,
      changefreq: path.includes('/news/') ? 'daily' : 
                 path.includes('/reviews/') ? 'weekly' :
                 path.includes('/compare/') ? 'weekly' :
                 path.includes('/best/') ? 'monthly' : 'weekly',
      priority: path === '/' ? 1.0 :
                path.includes('/reviews/') ? 0.9 :
                path.includes('/compare/') ? 0.8 :
                path.includes('/best/') ? 0.9 :
                path.includes('/news/') ? 0.7 : 0.6,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
};