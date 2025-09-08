#!/usr/bin/env node

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const fs = require('fs').promises;
const path = require('path');

class ProductTracker {
  constructor() {
    this.firecrawlApiKey = process.env.FIRECRAWL_API_KEY;
    this.perplexityApiKey = process.env.PERPLEXITY_API_KEY;
    this.dataDir = path.join(__dirname, '..', 'data');
    this.trackingFile = path.join(this.dataDir, 'product-tracking.json');
    
    // Sources to monitor for new products
    this.sources = {
      newsrooms: [
        { name: 'Apple Newsroom', url: 'https://www.apple.com/newsroom/', brand: 'Apple' },
        { name: 'Samsung News', url: 'https://news.samsung.com/us/', brand: 'Samsung' },
        { name: 'Google Blog', url: 'https://blog.google/', brand: 'Google' },
        { name: 'Microsoft News', url: 'https://news.microsoft.com/', brand: 'Microsoft' }
      ],
      retailers: [
        { name: 'Best Buy', url: 'https://www.bestbuy.com/site/electronics/coming-soon/pcmcat1476124791454.c', category: 'coming-soon' },
        { name: 'Amazon', url: 'https://www.amazon.com/gp/new-releases/', category: 'new-releases' }
      ],
      databases: [
        { name: 'FCC Database', type: 'regulatory' },
        { name: 'Patent Filings', type: 'patents' }
      ]
    };

    // Product categories to track
    this.categories = [
      'smartphones',
      'laptops',
      'tablets',
      'wearables',
      'headphones',
      'smart-home',
      'gaming',
      'ai-devices'
    ];
  }

  async ensureDataDirectory() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      // Directory exists
    }
  }

  async loadExistingTracking() {
    try {
      const data = await fs.readFile(this.trackingFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return {
        products: [],
        lastUpdated: new Date().toISOString(),
        stats: { total: 0, new: 0, updated: 0 }
      };
    }
  }

  async scanNewsrooms() {
    console.log('🏢 Scanning company newsrooms for product announcements...');
    const discoveries = [];

    for (const source of this.sources.newsrooms) {
      try {
        console.log(`Scanning ${source.name}...`);
        
        if (!this.firecrawlApiKey) {
          console.log('⚠️ Firecrawl API not available, using demo data');
          discoveries.push(...this.getDemoNewsroomData(source));
          continue;
        }

        const scrapedData = await this.scrapeSource(source.url);
        if (scrapedData.success) {
          const products = this.extractProductAnnouncements(scrapedData.content, source);
          discoveries.push(...products);
        }

        // Rate limiting (reduced for testing)
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.log(`Error scanning ${source.name}: ${error.message}`);
      }
    }

    return discoveries;
  }

  async scrapeSource(url) {
    try {
      const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.firecrawlApiKey}`,
        },
        body: JSON.stringify({
          url: url,
          formats: ['markdown'],
          onlyMainContent: true,
          timeout: 30000
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return {
        success: data.success,
        content: data.data?.markdown || '',
        metadata: data.data?.metadata || {}
      };

    } catch (error) {
      console.log(`Scraping failed for ${url}: ${error.message}`);
      return { success: false, content: '', metadata: {} };
    }
  }

  extractProductAnnouncements(content, source) {
    const products = [];
    
    // Product announcement patterns
    const announcementPatterns = [
      /announce[sd]?\s+(?:the\s+)?([^.\n]+)/gi,
      /introduce[sd]?\s+(?:the\s+)?([^.\n]+)/gi,
      /launch(?:ing|ed)?\s+(?:the\s+)?([^.\n]+)/gi,
      /unveil[s|ed]?\s+(?:the\s+)?([^.\n]+)/gi,
      /reveal[s|ed]?\s+(?:the\s+)?([^.\n]+)/gi,
      /new\s+([^.\n]+?)(?:\sis|will|with)/gi
    ];

    announcementPatterns.forEach(pattern => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const productName = match[1].trim();
        
        if (this.isValidProductName(productName)) {
          const category = this.categorizeProduct(productName);
          if (category) {
            products.push({
              name: productName,
              brand: source.brand,
              category,
              source: source.name,
              sourceUrl: source.url,
              announcementType: 'official',
              discoveredAt: new Date().toISOString(),
              status: 'announced',
              confidence: this.calculateConfidence(productName, content)
            });
          }
        }
      }
    });

    return products.slice(0, 5); // Top 5 per source
  }

  isValidProductName(name) {
    // Filter out invalid product names
    const minLength = 5;
    const maxLength = 100;
    
    if (name.length < minLength || name.length > maxLength) return false;
    
    // Must contain at least one letter
    if (!/[a-zA-Z]/.test(name)) return false;
    
    // Exclude generic terms
    const excludeTerms = [
      'the company', 'our team', 'this year', 'next month',
      'privacy policy', 'terms of service', 'learn more',
      'contact us', 'about us', 'press release'
    ];
    
    const lowerName = name.toLowerCase();
    if (excludeTerms.some(term => lowerName.includes(term))) return false;
    
    return true;
  }

  categorizeProduct(productName) {
    const name = productName.toLowerCase();
    
    // Category keywords
    const categoryMap = {
      smartphones: ['iphone', 'galaxy', 'pixel', 'phone', 'smartphone'],
      laptops: ['macbook', 'laptop', 'notebook', 'chromebook', 'thinkpad'],
      tablets: ['ipad', 'tablet', 'surface'],
      wearables: ['watch', 'band', 'fitness', 'wearable', 'smartwatch'],
      headphones: ['airpods', 'headphones', 'earbuds', 'buds', 'audio'],
      'smart-home': ['home', 'alexa', 'google home', 'nest', 'smart'],
      gaming: ['xbox', 'playstation', 'nintendo', 'gaming', 'console'],
      'ai-devices': ['ai', 'assistant', 'copilot', 'chatgpt', 'neural']
    };

    for (const [category, keywords] of Object.entries(categoryMap)) {
      if (keywords.some(keyword => name.includes(keyword))) {
        return category;
      }
    }

    return null; // Unknown category
  }

  calculateConfidence(productName, content) {
    let confidence = 5; // Base confidence
    
    const name = productName.toLowerCase();
    const contentLower = content.toLowerCase();
    
    // Boost for official announcement terms
    if (contentLower.includes('officially announce')) confidence += 3;
    if (contentLower.includes('press release')) confidence += 2;
    if (contentLower.includes('available now') || contentLower.includes('pre-order')) confidence += 2;
    
    // Boost for specific product details
    if (contentLower.includes('price') || contentLower.includes('$')) confidence += 1;
    if (contentLower.includes('release date') || contentLower.includes('available')) confidence += 1;
    if (contentLower.includes('specs') || contentLower.includes('features')) confidence += 1;
    
    // Penalty for vague terms
    if (name.includes('and more') || name.includes('various')) confidence -= 2;
    if (name.includes('upcoming') || name.includes('future')) confidence -= 1;
    
    return Math.max(1, Math.min(confidence, 10));
  }

  async researchProductDetails(product) {
    if (!this.perplexityApiKey) {
      return this.getDemoProductDetails(product);
    }

    try {
      console.log(`🔍 Researching details for: ${product.name}`);

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.perplexityApiKey}`,
        },
        body: JSON.stringify({
          model: 'sonar',
          messages: [
            {
              role: 'system',
              content: 'You are a tech product analyst. Provide factual, up-to-date information about technology products including specifications, pricing, and availability.'
            },
            {
              role: 'user',
              content: `Research the ${product.brand} ${product.name}. I need:
              1. Key specifications and features
              2. Expected or announced pricing
              3. Release date or availability
              4. How it compares to existing products
              5. Target market and use cases
              Provide factual information only.`
            }
          ],
          max_tokens: 500,
          temperature: 0.2
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const research = data.choices?.[0]?.message?.content || '';

      return this.parseProductResearch(research);

    } catch (error) {
      console.log(`Research failed for ${product.name}: ${error.message}`);
      return this.getDemoProductDetails(product);
    }
  }

  parseProductResearch(research) {
    const details = {
      specifications: [],
      pricing: null,
      availability: null,
      keyFeatures: [],
      targetMarket: null
    };

    const lines = research.split('\n');
    
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      
      // Extract pricing
      const priceMatch = line.match(/\$[\d,]+/);
      if (priceMatch && !details.pricing) {
        details.pricing = priceMatch[0];
      }
      
      // Extract availability
      if (lowerLine.includes('available') || lowerLine.includes('release')) {
        details.availability = line.trim();
      }
      
      // Extract key features (lines with specs or features)
      if (lowerLine.includes('feature') || lowerLine.includes('spec') || line.match(/^\d+\./)) {
        details.keyFeatures.push(line.trim().replace(/^\d+\.\s*/, ''));
      }
    });

    return details;
  }

  getDemoNewsroomData(source) {
    const demoProducts = {
      Apple: [
        {
          name: 'iPhone 16 Pro Max',
          brand: 'Apple',
          category: 'smartphones',
          source: source.name,
          sourceUrl: source.url,
          announcementType: 'official',
          discoveredAt: new Date().toISOString(),
          status: 'announced',
          confidence: 9
        }
      ],
      Samsung: [
        {
          name: 'Galaxy S25 Ultra',
          brand: 'Samsung',
          category: 'smartphones',
          source: source.name,
          sourceUrl: source.url,
          announcementType: 'official',
          discoveredAt: new Date().toISOString(),
          status: 'rumored',
          confidence: 7
        }
      ],
      Google: [
        {
          name: 'Pixel 9 Pro XL',
          brand: 'Google',
          category: 'smartphones',
          source: source.name,
          sourceUrl: source.url,
          announcementType: 'official',
          discoveredAt: new Date().toISOString(),
          status: 'announced',
          confidence: 8
        }
      ]
    };

    return demoProducts[source.brand] || [];
  }

  getDemoProductDetails(product) {
    return {
      specifications: ['Advanced processor', 'Improved camera system', 'Enhanced battery life'],
      pricing: '$999',
      availability: 'Expected Q2 2025',
      keyFeatures: ['Pro camera system', 'All-day battery', 'Premium design'],
      targetMarket: 'Tech enthusiasts and professionals'
    };
  }

  async saveTrackingData(trackingData) {
    try {
      await fs.writeFile(
        this.trackingFile,
        JSON.stringify(trackingData, null, 2),
        'utf-8'
      );
      console.log(`💾 Saved tracking data: ${trackingData.products.length} products`);
    } catch (error) {
      console.error('Error saving tracking data:', error.message);
    }
  }

  async run() {
    console.log('🚀 Starting product tracker...');
    
    await this.ensureDataDirectory();

    try {
      // Load existing tracking data
      const existing = await this.loadExistingTracking();
      console.log(`📊 Currently tracking ${existing.products.length} products`);

      // Scan for new products
      const discoveries = await this.scanNewsrooms();
      console.log(`Found ${discoveries.length} potential new products`);

      // Filter out duplicates and enhance with research
      const newProducts = [];
      for (const discovery of discoveries) {
        const exists = existing.products.find(p => 
          p.name.toLowerCase() === discovery.name.toLowerCase() &&
          p.brand === discovery.brand
        );

        if (!exists) {
          // Research product details
          const details = await this.researchProductDetails(discovery);
          const enhancedProduct = { ...discovery, details };
          newProducts.push(enhancedProduct);
          
          // Rate limiting for API calls (reduced for testing)
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Update tracking data
      const updatedTracking = {
        products: [...existing.products, ...newProducts],
        lastUpdated: new Date().toISOString(),
        stats: {
          total: existing.products.length + newProducts.length,
          new: newProducts.length,
          updated: 0
        }
      };

      await this.saveTrackingData(updatedTracking);

      console.log(`✅ Product tracking completed.`);
      console.log(`🆕 Found ${newProducts.length} new products:`);
      
      newProducts.forEach(product => {
        console.log(`   - ${product.brand} ${product.name} (${product.category})`);
      });

      return updatedTracking;

    } catch (error) {
      console.error('Product tracking failed:', error.message);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const tracker = new ProductTracker();
  tracker.run().catch(console.error);
}

module.exports = { ProductTracker };