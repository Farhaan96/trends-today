// Direct Firecrawl integration for immediate testing

class FirecrawlDirect {
  constructor() {
    this.apiKey = process.env.FIRECRAWL_API_KEY;
    this.baseUrl = 'https://api.firecrawl.dev';
  }

  async testConnection() {
    if (!this.apiKey || this.apiKey.includes('your-api-key')) {
      return { success: false, error: 'API key not configured' };
    }

    try {
      console.log('🔥 Testing Firecrawl API connection...');

      const response = await fetch(`${this.baseUrl}/v1/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          url: 'https://example.com',
          formats: ['markdown'],
          timeout: 10000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Firecrawl API connection successful!');

      return {
        success: true,
        data: data,
        message: 'API is working correctly',
      };
    } catch (error) {
      console.error('❌ Firecrawl API connection failed:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async scrapeAppleProduct(productName) {
    if (!this.apiKey || this.apiKey.includes('your-api-key')) {
      console.log('⚠️ No API key - using demo data');
      return { success: false, demo: true };
    }

    try {
      console.log(`🍎 Scraping Apple.com for ${productName}...`);

      // Try to scrape Apple's iPhone page
      const appleUrl = 'https://www.apple.com/iphone-15-pro/';

      const response = await fetch(`${this.baseUrl}/v1/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          url: appleUrl,
          formats: ['markdown'],
          onlyMainContent: true,
          timeout: 30000,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data?.markdown) {
        console.log('✅ Successfully scraped Apple.com!');
        console.log(
          `📄 Content length: ${data.data.markdown.length} characters`
        );

        // Extract key specs from the markdown
        const specs = this.extractSpecs(data.data.markdown);

        return {
          success: true,
          url: appleUrl,
          markdown: data.data.markdown.substring(0, 2000) + '...', // Truncate for display
          specs: specs,
          title: data.data.metadata?.title || 'iPhone 15 Pro',
        };
      } else {
        throw new Error('No content returned');
      }
    } catch (error) {
      console.error(`❌ Failed to scrape Apple.com: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  extractSpecs(markdown) {
    const specs = {};

    // Look for common iPhone specs in the markdown
    const patterns = [
      { key: 'display', regex: /(\d+\.?\d*-inch.*?display)/i },
      { key: 'chip', regex: /(A\d+.*?chip)/i },
      { key: 'camera', regex: /(\d+MP.*?camera)/i },
      { key: 'battery', regex: /(up to \d+.*?hours)/i },
      { key: 'storage', regex: /(\d+GB.*?storage)/i },
    ];

    patterns.forEach((pattern) => {
      const match = markdown.match(pattern.regex);
      if (match) {
        specs[pattern.key] = match[1];
      }
    });

    return specs;
  }

  async analyzeTechRadar() {
    if (!this.apiKey || this.apiKey.includes('your-api-key')) {
      console.log('⚠️ No API key - skipping TechRadar analysis');
      return { success: false, demo: true };
    }

    try {
      console.log('🔍 Analyzing TechRadar.com layout...');

      const response = await fetch(`${this.baseUrl}/v1/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          url: 'https://www.techradar.com/',
          formats: ['markdown'],
          onlyMainContent: true,
          timeout: 30000,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data?.markdown) {
        console.log('✅ Successfully analyzed TechRadar!');

        // Extract article structure
        const articles = this.extractArticles(data.data.markdown);

        return {
          success: true,
          url: 'https://www.techradar.com/',
          articlesFound: articles.length,
          sampleArticles: articles.slice(0, 3),
          insights: this.generateUIInsights(data.data.markdown),
        };
      }
    } catch (error) {
      console.error(`❌ Failed to analyze TechRadar: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  extractArticles(markdown) {
    // Look for article patterns in markdown
    const articleHeaders = markdown.match(/^#+\s+(.+)$/gm) || [];
    return articleHeaders
      .slice(0, 10)
      .map((header) => header.replace(/^#+\s+/, ''));
  }

  generateUIInsights(markdown) {
    return {
      hasHeroSection:
        markdown.toLowerCase().includes('hero') ||
        markdown.includes('featured'),
      hasSidebar:
        markdown.toLowerCase().includes('sidebar') ||
        markdown.includes('latest'),
      hasCategories:
        markdown.toLowerCase().includes('reviews') &&
        markdown.toLowerCase().includes('news'),
      contentDensity: markdown.length > 10000 ? 'high' : 'medium',
    };
  }
}

module.exports = { FirecrawlDirect };
