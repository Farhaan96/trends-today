/**
 * Intelligent API Caching System
 * Optimizes Perplexity and Firecrawl API usage with smart caching strategies
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class APICache {
  constructor() {
    this.cacheDir = path.join(__dirname, '..', '.cache');
    this.perplexityDir = path.join(this.cacheDir, 'perplexity');
    this.firecrawlDir = path.join(this.cacheDir, 'firecrawl');
    this.metadataFile = path.join(this.cacheDir, 'metadata.json');
    
    // Cache TTL settings (in milliseconds)
    this.cacheTTL = {
      research: 1 * 60 * 60 * 1000,    // 1 hour for research queries
      news: 30 * 60 * 1000,            // 30 minutes for news/trending
      seo: 24 * 60 * 60 * 1000,        // 24 hours for SEO data
      firecrawl: 6 * 60 * 60 * 1000,   // 6 hours for web scraping
      emergency: 10 * 60 * 1000        // 10 minutes for emergency/breaking
    };
    
    // API call tracking
    this.apiUsage = {
      perplexity: { daily: 0, hourly: 0, lastReset: Date.now() },
      firecrawl: { daily: 0, hourly: 0, lastReset: Date.now() }
    };
    
    this.maxDailyCalls = {
      perplexity: 250,  // Conservative daily limit
      firecrawl: 100    // Conservative daily limit
    };
  }

  async initialize() {
    try {
      // Create cache directories
      await fs.mkdir(this.cacheDir, { recursive: true });
      await fs.mkdir(this.perplexityDir, { recursive: true });
      await fs.mkdir(this.firecrawlDir, { recursive: true });
      
      // Load metadata
      await this.loadMetadata();
      
      console.log('🗄️ API Cache system initialized');
      
    } catch (error) {
      console.error('Failed to initialize API cache:', error.message);
    }
  }

  async loadMetadata() {
    try {
      const data = await fs.readFile(this.metadataFile, 'utf8');
      const metadata = JSON.parse(data);
      
      // Reset daily counters if it's a new day
      const now = Date.now();
      const daysSinceReset = (now - metadata.apiUsage?.perplexity?.lastReset || 0) / (24 * 60 * 60 * 1000);
      
      if (daysSinceReset >= 1) {
        this.apiUsage = {
          perplexity: { daily: 0, hourly: 0, lastReset: now },
          firecrawl: { daily: 0, hourly: 0, lastReset: now }
        };
      } else {
        this.apiUsage = metadata.apiUsage || this.apiUsage;
      }
      
    } catch (error) {
      // File doesn't exist or is corrupted, start fresh
      await this.saveMetadata();
    }
  }

  async saveMetadata() {
    const metadata = {
      lastUpdated: new Date().toISOString(),
      apiUsage: this.apiUsage,
      cacheStats: await this.getCacheStats()
    };
    
    await fs.writeFile(this.metadataFile, JSON.stringify(metadata, null, 2));
  }

  generateCacheKey(query, type = 'research') {
    const normalizedQuery = query.toLowerCase().trim();
    const hash = crypto.createHash('md5').update(normalizedQuery).digest('hex');
    return `${type}_${hash}.json`;
  }

  async isCacheValid(filePath, cacheType = 'research') {
    try {
      const stats = await fs.stat(filePath);
      const age = Date.now() - stats.mtime.getTime();
      return age < this.cacheTTL[cacheType];
    } catch (error) {
      return false;
    }
  }

  async getCachedResult(query, type = 'research', api = 'perplexity') {
    const cacheKey = this.generateCacheKey(query, type);
    const cacheDir = api === 'perplexity' ? this.perplexityDir : this.firecrawlDir;
    const filePath = path.join(cacheDir, cacheKey);
    
    if (await this.isCacheValid(filePath, type)) {
      try {
        const cachedData = await fs.readFile(filePath, 'utf8');
        const parsed = JSON.parse(cachedData);
        
        console.log(`💾 Cache hit for ${api}: ${query.slice(0, 50)}...`);
        return parsed.result;
        
      } catch (error) {
        console.log(`⚠️ Cache read error, will fetch fresh: ${error.message}`);
      }
    }
    
    return null;
  }

  async setCachedResult(query, result, type = 'research', api = 'perplexity') {
    const cacheKey = this.generateCacheKey(query, type);
    const cacheDir = api === 'perplexity' ? this.perplexityDir : this.firecrawlDir;
    const filePath = path.join(cacheDir, cacheKey);
    
    const cacheData = {
      query: query,
      type: type,
      result: result,
      timestamp: new Date().toISOString(),
      api: api
    };
    
    try {
      await fs.writeFile(filePath, JSON.stringify(cacheData, null, 2));
      console.log(`💾 Cached ${api} result: ${query.slice(0, 50)}...`);
    } catch (error) {
      console.error(`Failed to cache ${api} result:`, error.message);
    }
  }

  canMakeAPICall(api) {
    const usage = this.apiUsage[api];
    return usage.daily < this.maxDailyCalls[api];
  }

  trackAPICall(api) {
    this.apiUsage[api].daily++;
    this.apiUsage[api].hourly++;
    this.saveMetadata(); // Async save, don't await
  }

  async getCacheStats() {
    try {
      const perplexityFiles = await fs.readdir(this.perplexityDir);
      const firecrawlFiles = await fs.readdir(this.firecrawlDir);
      
      return {
        perplexityCacheSize: perplexityFiles.length,
        firecrawlCacheSize: firecrawlFiles.length,
        totalCacheFiles: perplexityFiles.length + firecrawlFiles.length
      };
    } catch (error) {
      return { perplexityCacheSize: 0, firecrawlCacheSize: 0, totalCacheFiles: 0 };
    }
  }

  async cleanExpiredCache() {
    console.log('🧹 Cleaning expired cache entries...');
    
    const cleanDirectory = async (dir, cacheType) => {
      try {
        const files = await fs.readdir(dir);
        let cleaned = 0;
        
        for (const file of files) {
          const filePath = path.join(dir, file);
          if (!(await this.isCacheValid(filePath, cacheType))) {
            await fs.unlink(filePath);
            cleaned++;
          }
        }
        
        return cleaned;
      } catch (error) {
        return 0;
      }
    };
    
    const perplexityCleaned = await cleanDirectory(this.perplexityDir, 'research');
    const firecrawlCleaned = await cleanDirectory(this.firecrawlDir, 'firecrawl');
    
    console.log(`🧹 Cleaned ${perplexityCleaned + firecrawlCleaned} expired cache entries`);
    
    await this.saveMetadata();
  }

  async getOptimizedQuery(originalQuery, contentType = 'research') {
    // Check if we have a similar cached query first
    const cached = await this.getCachedResult(originalQuery, contentType);
    if (cached) {
      return { result: cached, fromCache: true };
    }
    
    // Return query ready for API call
    return { 
      query: originalQuery, 
      fromCache: false,
      canMakeCall: this.canMakeAPICall('perplexity'),
      dailyUsage: this.apiUsage.perplexity.daily,
      remainingCalls: this.maxDailyCalls.perplexity - this.apiUsage.perplexity.daily
    };
  }

  async reportUsage() {
    const stats = await this.getCacheStats();
    
    console.log('\n📊 API CACHE USAGE REPORT');
    console.log('='.repeat(40));
    console.log(`Perplexity: ${this.apiUsage.perplexity.daily}/${this.maxDailyCalls.perplexity} calls today`);
    console.log(`Firecrawl: ${this.apiUsage.firecrawl.daily}/${this.maxDailyCalls.firecrawl} calls today`);
    console.log(`Cache hits: ${stats.totalCacheFiles} files cached`);
    console.log(`Cache efficiency: ${stats.perplexityCacheSize > 0 ? '✅ Active' : '⚠️ Empty'}`);
    
    return stats;
  }
}

// Singleton pattern for global cache access
let cacheInstance = null;

async function getAPICache() {
  if (!cacheInstance) {
    cacheInstance = new APICache();
    await cacheInstance.initialize();
  }
  return cacheInstance;
}

// Helper functions for agent integration
async function getCachedOrFetch(query, fetchFunction, options = {}) {
  const cache = await getAPICache();
  const type = options.type || 'research';
  const api = options.api || 'perplexity';
  
  // Try cache first
  const cached = await cache.getCachedResult(query, type, api);
  if (cached) {
    return cached;
  }
  
  // Check API limits
  if (!cache.canMakeAPICall(api)) {
    console.log(`⚠️ ${api} daily limit reached, using demo mode`);
    return options.fallback || null;
  }
  
  // Make API call
  try {
    cache.trackAPICall(api);
    const result = await fetchFunction(query);
    
    // Cache the result
    await cache.setCachedResult(query, result, type, api);
    
    return result;
  } catch (error) {
    console.error(`${api} API call failed:`, error.message);
    return options.fallback || null;
  }
}

module.exports = {
  APICache,
  getAPICache,
  getCachedOrFetch
};