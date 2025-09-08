/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://trendstoday.ca',
  generateRobotsTxt: false, // We have a custom robots.txt
  exclude: [
    '/server-sitemap-index.xml',
    '/api/*',
    '/admin/*', 
    '/_next/*',
    '/private/*',
    '/dashboard/*',
    '/dev/*',
    '/test/*',
    '404',
    '/500'
  ],
  generateIndexSitemap: true,
  
  // Additional paths for important pages
  additionalPaths: async (config) => {
    const paths = [
      // Main category pages
      await config.transform(config, '/reviews'),
      await config.transform(config, '/compare'),
      await config.transform(config, '/best'),
      await config.transform(config, '/news'),
      await config.transform(config, '/guides'),
      await config.transform(config, '/authors'),
      
      // Important review pages
      await config.transform(config, '/reviews/iphone-15-pro-review'),
      await config.transform(config, '/reviews/samsung-galaxy-s24-ultra-review'),
      await config.transform(config, '/reviews/google-pixel-8-pro-review'),
      await config.transform(config, '/reviews/macbook-air-m3-review'),
      await config.transform(config, '/reviews/oneplus-12-review'),
      
      // Important comparison pages
      await config.transform(config, '/compare/iphone-15-pro-vs-samsung-galaxy-s24'),
      await config.transform(config, '/compare/macbook-vs-windows-laptop'),
      await config.transform(config, '/compare/iphone-vs-android'),
      
      // Best of pages
      await config.transform(config, '/best/smartphones/2025'),
      await config.transform(config, '/best/laptops/2025'),
      await config.transform(config, '/best/headphones/2025'),
      
      // Important news pages
      await config.transform(config, '/news/apple-vision-pro-2-development'),
      await config.transform(config, '/news/galaxy-s25-launch-date'),
      
      // Category-specific pages
      await config.transform(config, '/reviews/smartphones'),
      await config.transform(config, '/reviews/laptops'),
      await config.transform(config, '/reviews/headphones'),
      await config.transform(config, '/compare/smartphones'),
      await config.transform(config, '/compare/laptops'),
    ];
    return paths;
  },

  // Custom transform function with enhanced SEO settings
  transform: async (config, path) => {
    let changefreq = 'weekly';
    let priority = 0.6;

    // Set frequency and priority based on path patterns
    if (path === '/') {
      changefreq = 'daily';
      priority = 1.0;
    } else if (path.includes('/news/')) {
      changefreq = 'daily';
      priority = 0.7;
    } else if (path.includes('/reviews/') && !path.endsWith('/reviews')) {
      changefreq = 'weekly';
      priority = 0.9;
    } else if (path.includes('/compare/') && !path.endsWith('/compare')) {
      changefreq = 'weekly';
      priority = 0.8;
    } else if (path.includes('/best/')) {
      changefreq = 'monthly';
      priority = 0.9;
    } else if (path.includes('/guides/')) {
      changefreq = 'monthly';
      priority = 0.8;
    } else if (path.match(/\/(reviews|compare|best|news|guides)$/)) {
      // Category index pages
      changefreq = 'daily';
      priority = 0.8;
    } else if (path.includes('/authors/')) {
      changefreq = 'monthly';
      priority = 0.5;
    } else if (path.includes('/categories/')) {
      changefreq = 'weekly';
      priority = 0.6;
    }

    // Enhanced lastmod logic
    let lastmod;
    if (config.autoLastmod) {
      // In production, you'd get actual modification dates from your CMS
      if (path.includes('/news/')) {
        // News articles update frequently
        lastmod = new Date().toISOString();
      } else if (path.includes('/reviews/') || path.includes('/compare/')) {
        // Reviews and comparisons updated less frequently
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        lastmod = date.toISOString();
      } else if (path.includes('/best/')) {
        // Best of pages updated monthly
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        lastmod = date.toISOString();
      } else {
        lastmod = new Date().toISOString();
      }
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod,
      alternateRefs: [
        {
          href: `https://trendstoday.ca${path}`,
          hreflang: 'en',
        },
      ],
    };
  },

  // Robots.txt options (even though we're not generating it)
  robotsTxtOptions: {
    additionalSitemaps: [
      'https://trendstoday.ca/reviews-sitemap.xml',
      'https://trendstoday.ca/comparisons-sitemap.xml', 
      'https://trendstoday.ca/guides-sitemap.xml',
      'https://trendstoday.ca/news-sitemap.xml',
      'https://trendstoday.ca/best-sitemap.xml',
    ],
  },

  // Output directory
  outDir: './public',
};