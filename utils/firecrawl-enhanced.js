// Enhanced Firecrawl API Integration for Web Scraping
// Optimized for extracting tech news and product information

require('dotenv').config({ path: '.env.local' });

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class FirecrawlEnhanced {
  constructor() {
    this.apiKey = process.env.FIRECRAWL_API_KEY;
    this.baseUrl = 'https://api.firecrawl.dev/v1';
    this.cacheDir = path.join(__dirname, '..', '.cache', 'firecrawl');
    this.cacheEnabled = true;
    this.cacheTTL = 7200000; // 2 hours for web content
    
    // Rate limiting
    this.requestQueue = [];
    this.lastRequestTime = 0;
    this.minRequestInterval = 1000; // 1 request per second
    
    // Preset configurations for different tech sites
    this.siteConfigs = {
      techradar: {
        waitFor: 2000,
        selectors: {
          title: 'h1',
          content: 'article',
          author: '.author-name',
          date: 'time',
          image: 'article img'
        }
      },
      theverge: {
        waitFor: 2000,
        selectors: {
          title: 'h1',
          content: '.article-content',
          author: '.author',
          date: 'time',
          image: 'picture img'
        }
      },
      techcrunch: {
        waitFor: 1500,
        selectors: {
          title: 'h1',
          content: '.article-content',
          author: '.article__byline',
          date: 'time',
          image: '.article__featured-image img'
        }
      },
      default: {
        waitFor: 1000,
        selectors: {
          title: 'h1',
          content: 'main, article, .content',
          author: '.author, .by-author',
          date: 'time, .date, .published',
          image: 'img'
        }
      }
    };
  }

  async ensureCacheDir() {
    await fs.mkdir(this.cacheDir, { recursive: true }).catch(() => {});
  }

  getCacheKey(url, options = {}) {
    const hash = crypto.createHash('md5');
    hash.update(url);
    hash.update(JSON.stringify(options));
    return hash.digest('hex');
  }

  async getCached(cacheKey) {
    if (!this.cacheEnabled) return null;
    
    try {
      const cachePath = path.join(this.cacheDir, `${cacheKey}.json`);
      const stats = await fs.stat(cachePath);
      
      if (Date.now() - stats.mtime.getTime() > this.cacheTTL) {
        await fs.unlink(cachePath).catch(() => {});
        return null;
      }
      
      const cached = await fs.readFile(cachePath, 'utf-8');
      return JSON.parse(cached);
    } catch {
      return null;
    }
  }

  async saveCache(cacheKey, data) {
    if (!this.cacheEnabled) return;
    
    try {
      await this.ensureCacheDir();
      const cachePath = path.join(this.cacheDir, `${cacheKey}.json`);
      await fs.writeFile(cachePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Cache save error:', error.message);
    }
  }

  async enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  detectSiteType(url) {
    if (url.includes('techradar.com')) return 'techradar';
    if (url.includes('theverge.com')) return 'theverge';
    if (url.includes('techcrunch.com')) return 'techcrunch';
    return 'default';
  }

  async scrapeUrl(url, options = {}) {
    const {
      format = 'markdown',     // markdown, html, or text
      includeHtml = false,
      onlyMainContent = true,
      includeTags = true,
      includeMetadata = true,
      screenshot = false,
      useCache = true,
      customSelectors = null
    } = options;

    // Check cache first
    if (useCache) {
      const cacheKey = this.getCacheKey(url, options);
      const cached = await this.getCached(cacheKey);
      if (cached) {
        console.log(`📦 Using cached scrape for: ${url}`);
        return cached;
      }
    }

    // Get site-specific configuration
    const siteType = this.detectSiteType(url);
    const siteConfig = customSelectors || this.siteConfigs[siteType];

    const requestBody = {
      url: url,
      formats: [format],
      includeHtml: includeHtml,
      onlyMainContent: onlyMainContent,
      includeTags: includeTags,
      includeMetadata: includeMetadata,
      screenshot: screenshot,
      waitFor: siteConfig.waitFor
    };

    // Add CSS selectors if specified
    if (siteConfig.selectors) {
      requestBody.extract = {
        schema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              selector: siteConfig.selectors.title
            },
            content: {
              type: 'string',
              selector: siteConfig.selectors.content
            },
            author: {
              type: 'string',
              selector: siteConfig.selectors.author
            },
            date: {
              type: 'string',
              selector: siteConfig.selectors.date
            },
            image: {
              type: 'string',
              selector: siteConfig.selectors.image,
              attribute: 'src'
            }
          }
        }
      };
    }

    try {
      await this.enforceRateLimit();
      
      console.log(`🕷️ Scraping with Firecrawl: ${url}`);
      
      const response = await fetch(`${this.baseUrl}/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(requestBody),
        timeout: 30000
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      const result = {
        success: data.success,
        url: url,
        title: data.data?.metadata?.title || data.data?.extract?.title || '',
        description: data.data?.metadata?.description || '',
        content: data.data?.markdown || data.data?.text || '',
        extract: data.data?.extract || {},
        metadata: data.data?.metadata || {},
        screenshot: data.data?.screenshot || null,
        scrapedAt: new Date().toISOString()
      };

      // Process and clean content
      result.content = this.cleanContent(result.content);
      
      // Extract key information
      result.keyInfo = this.extractKeyInfo(result);

      // Save to cache
      if (useCache) {
        const cacheKey = this.getCacheKey(url, options);
        await this.saveCache(cacheKey, result);
      }

      return result;

    } catch (error) {
      console.error(`Firecrawl API error: ${error.message}`);
      return this.getFallbackScrape(url);
    }
  }

  cleanContent(content) {
    if (!content) return '';
    
    // Remove excessive whitespace
    content = content.replace(/\n{3,}/g, '\n\n');
    
    // Remove common website artifacts
    const artifactPatterns = [
      /Newsletter\s+Sign\s+up/gi,
      /Subscribe\s+to\s+our/gi,
      /Follow\s+us\s+on/gi,
      /Share\s+this\s+article/gi,
      /Advertisement/gi,
      /Cookie\s+Policy/gi,
      /Terms\s+of\s+Service/gi
    ];
    
    artifactPatterns.forEach(pattern => {
      content = content.replace(pattern, '');
    });
    
    // Trim and return
    return content.trim();
  }

  extractKeyInfo(scrapedData) {
    const keyInfo = {
      title: scrapedData.title,
      author: scrapedData.extract?.author || scrapedData.metadata?.author || 'Unknown',
      publishDate: scrapedData.extract?.date || scrapedData.metadata?.publishedTime || null,
      mainImage: scrapedData.extract?.image || scrapedData.metadata?.image || null,
      wordCount: scrapedData.content ? scrapedData.content.split(/\s+/).length : 0,
      readingTime: 0
    };
    
    // Calculate reading time (200 words per minute)
    keyInfo.readingTime = Math.ceil(keyInfo.wordCount / 200);
    
    // Extract key points from content
    keyInfo.keyPoints = this.extractKeyPoints(scrapedData.content);
    
    return keyInfo;
  }

  extractKeyPoints(content) {
    if (!content) return [];
    
    const keyPoints = [];
    const lines = content.split('\n');
    
    // Look for bullet points or numbered lists
    lines.forEach(line => {
      if (line.match(/^[\-\*•]\s+(.+)/) || line.match(/^\d+\.\s+(.+)/)) {
        const point = line.replace(/^[\-\*•\d\.]\s+/, '').trim();
        if (point.length > 20 && point.length < 200) {
          keyPoints.push(point);
        }
      }
    });
    
    // If no bullet points found, extract first few sentences
    if (keyPoints.length === 0) {
      const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
      keyPoints.push(...sentences.slice(0, 3).map(s => s.trim()));
    }
    
    return keyPoints.slice(0, 5);
  }

  async scrapeMultiple(urls, options = {}) {
    console.log(`🕷️ Batch scraping ${urls.length} URLs...`);
    
    const results = [];
    for (const url of urls) {
      const result = await this.scrapeUrl(url, options);
      results.push(result);
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }

  async scrapeTechNews(options = {}) {
    const {
      sources = ['techradar', 'theverge', 'techcrunch'],
      limit = 5
    } = options;

    const newsUrls = {
      techradar: 'https://www.techradar.com/news',
      theverge: 'https://www.theverge.com/tech',
      techcrunch: 'https://techcrunch.com/latest'
    };

    const allNews = [];

    for (const source of sources) {
      if (!newsUrls[source]) continue;
      
      console.log(`📰 Scraping ${source} news...`);
      
      const result = await this.scrapeUrl(newsUrls[source], {
        onlyMainContent: true,
        includeMetadata: true
      });
      
      if (result.success) {
        // Extract article links from the page
        const articleLinks = this.extractArticleLinks(result.content, source);
        
        // Scrape individual articles (up to limit)
        for (const link of articleLinks.slice(0, limit)) {
          const article = await this.scrapeUrl(link, {
            format: 'markdown',
            includeMetadata: true
          });
          
          if (article.success) {
            allNews.push({
              source: source,
              ...article
            });
          }
        }
      }
    }

    return allNews;
  }

  extractArticleLinks(content, source) {
    const links = [];
    
    // Extract URLs from markdown links
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    
    while ((match = linkPattern.exec(content)) !== null) {
      const url = match[2];
      
      // Filter for article URLs based on source
      if (source === 'techradar' && url.includes('/news/')) {
        links.push(url);
      } else if (source === 'theverge' && url.includes('.com/')) {
        links.push(url);
      } else if (source === 'techcrunch' && url.includes('.com/')) {
        links.push(url);
      }
    }
    
    return [...new Set(links)]; // Remove duplicates
  }

  getFallbackScrape(url) {
    return {
      success: false,
      url: url,
      title: 'Scraping Failed',
      description: 'Unable to scrape content from this URL',
      content: 'Content could not be retrieved. Please check the URL and try again.',
      extract: {},
      metadata: {},
      screenshot: null,
      scrapedAt: new Date().toISOString(),
      keyInfo: {
        title: 'N/A',
        author: 'Unknown',
        publishDate: null,
        mainImage: null,
        wordCount: 0,
        readingTime: 0,
        keyPoints: []
      }
    };
  }

  async searchAndScrape(query, options = {}) {
    const {
      limit = 5,
      useGoogle = true
    } = options;

    console.log(`🔍 Searching and scraping for: ${query}`);
    
    // This would typically use Google Custom Search API
    // For now, we'll use predefined tech sites
    const searchUrls = [
      `https://www.techradar.com/search?searchTerm=${encodeURIComponent(query)}`,
      `https://www.theverge.com/search?q=${encodeURIComponent(query)}`,
      `https://techcrunch.com/search/${encodeURIComponent(query)}`
    ];
    
    const results = await this.scrapeMultiple(searchUrls.slice(0, limit), options);
    
    return results.filter(r => r.success);
  }

  async getCacheStats() {
    try {
      const files = await fs.readdir(this.cacheDir);
      let totalSize = 0;
      
      for (const file of files) {
        const filePath = path.join(this.cacheDir, file);
        const stats = await fs.stat(filePath);
        totalSize += stats.size;
      }
      
      return {
        fileCount: files.length,
        totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
        cacheDir: this.cacheDir
      };
    } catch {
      return { fileCount: 0, totalSize: '0 KB', cacheDir: this.cacheDir };
    }
  }

  async clearCache() {
    try {
      const files = await fs.readdir(this.cacheDir);
      for (const file of files) {
        await fs.unlink(path.join(this.cacheDir, file));
      }
      console.log('✅ Firecrawl cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error.message);
    }
  }
}

// Export for use in other modules
module.exports = FirecrawlEnhanced;

// CLI interface for testing
if (require.main === module) {
  const firecrawl = new FirecrawlEnhanced();
  
  const args = process.argv.slice(2);
  const command = args[0];
  const param = args[1];
  
  async function run() {
    switch (command) {
      case 'scrape':
        if (!param) {
          console.log('Please provide a URL to scrape');
          return;
        }
        const result = await firecrawl.scrapeUrl(param);
        console.log('\nScrape Result:');
        console.log('Title:', result.title);
        console.log('Word Count:', result.keyInfo?.wordCount);
        console.log('Key Points:', result.keyInfo?.keyPoints);
        break;
        
      case 'tech-news':
        const news = await firecrawl.scrapeTechNews({ limit: 3 });
        console.log(`\nScraped ${news.length} articles:`);
        news.forEach(article => {
          console.log(`- ${article.title} (${article.source})`);
        });
        break;
        
      case 'search':
        if (!param) {
          console.log('Please provide a search query');
          return;
        }
        const searchResults = await firecrawl.searchAndScrape(param, { limit: 3 });
        console.log(`\nFound ${searchResults.length} results for "${param}":`);
        searchResults.forEach(r => {
          console.log(`- ${r.title}`);
        });
        break;
        
      case 'cache-stats':
        const stats = await firecrawl.getCacheStats();
        console.log('Cache Statistics:', stats);
        break;
        
      case 'clear-cache':
        await firecrawl.clearCache();
        break;
        
      default:
        console.log(`
Usage: node firecrawl-enhanced.js <command> [param]

Commands:
  scrape <url>       - Scrape a single URL
  tech-news          - Scrape latest tech news
  search <query>     - Search and scrape results
  cache-stats        - Show cache statistics
  clear-cache        - Clear all cached responses

Example:
  node firecrawl-enhanced.js scrape "https://www.techradar.com/news/iphone-17"
        `);
    }
  }
  
  run().catch(console.error);
}