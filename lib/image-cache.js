// Advanced image caching and performance optimization system
// Implements intelligent caching, rate limiting, and performance monitoring

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class ImageCacheManager {
  constructor(options = {}) {
    this.cacheDir = options.cacheDir || path.join(__dirname, '..', '.cache', 'images');
    this.maxCacheSize = options.maxCacheSize || 500 * 1024 * 1024; // 500MB
    this.maxCacheAge = options.maxCacheAge || 7 * 24 * 60 * 60 * 1000; // 7 days
    this.cleanupInterval = options.cleanupInterval || 60 * 60 * 1000; // 1 hour
    
    // In-memory cache for frequently accessed items
    this.memoryCache = new Map();
    this.maxMemoryItems = options.maxMemoryItems || 100;
    
    // Performance tracking
    this.stats = {
      hits: 0,
      misses: 0,
      downloads: 0,
      errors: 0,
      totalSize: 0,
      lastCleanup: Date.now()
    };
    
    // Rate limiting
    this.rateLimiter = new RateLimiter({
      windowMs: options.rateLimitWindow || 60 * 60 * 1000, // 1 hour
      maxRequests: options.maxRequestsPerHour || 100
    });
    
    // Auto-cleanup
    this.startPeriodicCleanup();
  }

  async ensureCacheDirectory() {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
      await fs.mkdir(path.join(this.cacheDir, 'images'), { recursive: true });
      await fs.mkdir(path.join(this.cacheDir, 'metadata'), { recursive: true });
    } catch (error) {
      console.warn('Failed to create cache directories:', error.message);
    }
  }

  // Generate cache key from image parameters
  generateCacheKey(url, options = {}) {
    const keyData = {
      url: this.normalizeUrl(url),
      dimensions: options.dimensions,
      quality: options.quality,
      format: options.format
    };
    
    const keyString = JSON.stringify(keyData);
    return crypto.createHash('md5').update(keyString).digest('hex');
  }

  // Normalize URL for consistent caching
  normalizeUrl(url) {
    try {
      const urlObj = new URL(url);
      // Remove unnecessary parameters that don't affect image content
      urlObj.searchParams.delete('utm_source');
      urlObj.searchParams.delete('utm_medium');
      urlObj.searchParams.delete('utm_campaign');
      return urlObj.toString();
    } catch (error) {
      return url;
    }
  }

  // Check if image is cached and still valid
  async isCached(cacheKey) {
    try {
      // Check memory cache first
      if (this.memoryCache.has(cacheKey)) {
        const entry = this.memoryCache.get(cacheKey);
        if (Date.now() - entry.timestamp < this.maxCacheAge) {
          this.stats.hits++;
          return true;
        } else {
          this.memoryCache.delete(cacheKey);
        }
      }
      
      // Check disk cache
      const imagePath = path.join(this.cacheDir, 'images', `${cacheKey}.jpg`);
      const metadataPath = path.join(this.cacheDir, 'metadata', `${cacheKey}.json`);
      
      const [imageStat, metadataStat] = await Promise.all([
        fs.stat(imagePath).catch(() => null),
        fs.stat(metadataPath).catch(() => null)
      ]);
      
      if (imageStat && metadataStat) {
        const age = Date.now() - imageStat.mtime.getTime();
        if (age < this.maxCacheAge) {
          this.stats.hits++;
          return true;
        }
      }
      
      this.stats.misses++;
      return false;
      
    } catch (error) {
      this.stats.errors++;
      return false;
    }
  }

  // Get cached image URL or path
  async getCachedImage(cacheKey) {
    try {
      // Check memory cache first
      if (this.memoryCache.has(cacheKey)) {
        const entry = this.memoryCache.get(cacheKey);
        if (Date.now() - entry.timestamp < this.maxCacheAge) {
          return entry.data;
        } else {
          this.memoryCache.delete(cacheKey);
        }
      }
      
      // Load from disk cache
      const metadataPath = path.join(this.cacheDir, 'metadata', `${cacheKey}.json`);
      const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));
      
      // Add to memory cache for faster future access
      this.addToMemoryCache(cacheKey, metadata);
      
      return metadata;
      
    } catch (error) {
      this.stats.errors++;
      return null;
    }
  }

  // Cache image and metadata
  async cacheImage(cacheKey, imageBuffer, metadata) {
    try {
      await this.ensureCacheDirectory();
      
      // Save image to disk
      const imagePath = path.join(this.cacheDir, 'images', `${cacheKey}.jpg`);
      await fs.writeFile(imagePath, imageBuffer);
      
      // Create enhanced metadata
      const enrichedMetadata = {
        ...metadata,
        cacheKey,
        localPath: imagePath,
        cachedAt: Date.now(),
        size: imageBuffer.length,
        fileExists: true
      };
      
      // Save metadata to disk
      const metadataPath = path.join(this.cacheDir, 'metadata', `${cacheKey}.json`);
      await fs.writeFile(metadataPath, JSON.stringify(enrichedMetadata, null, 2));
      
      // Add to memory cache
      this.addToMemoryCache(cacheKey, enrichedMetadata);
      
      // Update stats
      this.stats.totalSize += imageBuffer.length;
      this.stats.downloads++;
      
      return enrichedMetadata;
      
    } catch (error) {
      console.error('Failed to cache image:', error.message);
      this.stats.errors++;
      return null;
    }
  }

  // Add item to memory cache with LRU eviction
  addToMemoryCache(key, data) {
    // Remove oldest items if cache is full
    if (this.memoryCache.size >= this.maxMemoryItems) {
      const oldestKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(oldestKey);
    }
    
    this.memoryCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Download and cache image with rate limiting
  async downloadAndCache(url, options = {}) {
    // Check rate limit
    if (!this.rateLimiter.canMakeRequest()) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    const cacheKey = this.generateCacheKey(url, options);
    
    // Check if already cached
    if (await this.isCached(cacheKey)) {
      return await this.getCachedImage(cacheKey);
    }
    
    try {
      // Record request for rate limiting
      this.rateLimiter.recordRequest();
      
      // Download image
      const imageBuffer = await this.downloadImage(url, options);
      
      // Create metadata
      const metadata = {
        originalUrl: url,
        downloadedAt: Date.now(),
        size: imageBuffer.length,
        options: options,
        source: this.detectImageSource(url)
      };
      
      // Cache the image
      return await this.cacheImage(cacheKey, imageBuffer, metadata);
      
    } catch (error) {
      console.error('Failed to download and cache image:', error.message);
      this.stats.errors++;
      throw error;
    }
  }

  // Download image with retry logic and timeout
  async downloadImage(url, options = {}) {
    const maxRetries = options.maxRetries || 3;
    const timeout = options.timeout || 30000;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.performDownload(url, timeout);
      } catch (error) {
        console.warn(`Download attempt ${attempt}/${maxRetries} failed:`, error.message);
        
        if (attempt === maxRetries) {
          throw new Error(`Download failed after ${maxRetries} attempts: ${error.message}`);
        }
        
        // Exponential backoff
        await this.sleep(Math.pow(2, attempt) * 1000);
      }
    }
  }

  // Perform the actual download
  async performDownload(url, timeout) {
    return new Promise((resolve, reject) => {
      const https = require('https');
      const http = require('http');
      
      const protocol = url.startsWith('https:') ? https : http;
      const chunks = [];
      
      const request = protocol.request(url, { timeout }, (response) => {
        // Handle redirects
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          return this.performDownload(response.headers.location, timeout)
            .then(resolve)
            .catch(reject);
        }
        
        // Check for successful response
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
          return;
        }
        
        // Validate content type
        const contentType = response.headers['content-type'];
        if (!contentType || !contentType.startsWith('image/')) {
          reject(new Error(`Invalid content type: ${contentType}`));
          return;
        }
        
        response.on('data', (chunk) => {
          chunks.push(chunk);
        });
        
        response.on('end', () => {
          const buffer = Buffer.concat(chunks);
          
          // Basic validation
          if (buffer.length === 0) {
            reject(new Error('Empty image received'));
            return;
          }
          
          if (buffer.length > 10 * 1024 * 1024) { // 10MB limit
            reject(new Error('Image too large'));
            return;
          }
          
          resolve(buffer);
        });
      });
      
      request.on('error', reject);
      request.on('timeout', () => {
        request.abort();
        reject(new Error('Download timeout'));
      });
      
      request.end();
    });
  }

  // Detect image source for better caching strategies
  detectImageSource(url) {
    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('unsplash.com')) return 'unsplash';
    if (urlLower.includes('shutterstock.com')) return 'shutterstock';
    if (urlLower.includes('apple.com')) return 'apple';
    if (urlLower.includes('samsung.com')) return 'samsung';
    if (urlLower.includes('google.com')) return 'google';
    
    return 'unknown';
  }

  // Clean up old cache entries
  async cleanupCache() {
    console.log('🧹 Starting cache cleanup...');
    
    try {
      const imagesDir = path.join(this.cacheDir, 'images');
      const metadataDir = path.join(this.cacheDir, 'metadata');
      
      const [imageFiles, metadataFiles] = await Promise.all([
        fs.readdir(imagesDir).catch(() => []),
        fs.readdir(metadataDir).catch(() => [])
      ]);
      
      let deletedCount = 0;
      let freedSpace = 0;
      
      // Clean up based on age and size
      for (const file of metadataFiles) {
        const metadataPath = path.join(metadataDir, file);
        const imagePath = path.join(imagesDir, file.replace('.json', '.jpg'));
        
        try {
          const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));
          const age = Date.now() - metadata.cachedAt;
          
          // Delete if too old
          if (age > this.maxCacheAge) {
            await Promise.all([
              fs.unlink(metadataPath).catch(() => {}),
              fs.unlink(imagePath).catch(() => {})
            ]);
            
            deletedCount++;
            freedSpace += metadata.size || 0;
            this.stats.totalSize -= metadata.size || 0;
            
            // Remove from memory cache
            this.memoryCache.delete(metadata.cacheKey);
          }
        } catch (error) {
          // Delete corrupted metadata files
          await fs.unlink(metadataPath).catch(() => {});
          deletedCount++;
        }
      }
      
      // Additional cleanup if cache is too large
      if (this.stats.totalSize > this.maxCacheSize) {
        await this.cleanupBySizeLRU();
      }
      
      this.stats.lastCleanup = Date.now();
      
      console.log(`✅ Cache cleanup complete: ${deletedCount} files deleted, ${(freedSpace / 1024 / 1024).toFixed(2)}MB freed`);
      
    } catch (error) {
      console.error('Cache cleanup failed:', error.message);
    }
  }

  // Cleanup based on LRU when cache is too large
  async cleanupBySizeLRU() {
    try {
      const metadataDir = path.join(this.cacheDir, 'metadata');
      const files = await fs.readdir(metadataDir);
      
      // Load all metadata and sort by access time
      const entries = [];
      for (const file of files) {
        try {
          const metadataPath = path.join(metadataDir, file);
          const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));
          entries.push({ file, metadata, path: metadataPath });
        } catch (error) {
          // Skip corrupted files
        }
      }
      
      // Sort by last accessed (oldest first)
      entries.sort((a, b) => a.metadata.cachedAt - b.metadata.cachedAt);
      
      // Delete oldest entries until under size limit
      let currentSize = this.stats.totalSize;
      let deletedCount = 0;
      
      for (const entry of entries) {
        if (currentSize <= this.maxCacheSize) break;
        
        const imagePath = path.join(this.cacheDir, 'images', entry.file.replace('.json', '.jpg'));
        
        await Promise.all([
          fs.unlink(entry.path).catch(() => {}),
          fs.unlink(imagePath).catch(() => {})
        ]);
        
        currentSize -= entry.metadata.size || 0;
        deletedCount++;
        
        this.memoryCache.delete(entry.metadata.cacheKey);
      }
      
      this.stats.totalSize = currentSize;
      console.log(`🗂️  LRU cleanup: ${deletedCount} old entries removed`);
      
    } catch (error) {
      console.error('LRU cleanup failed:', error.message);
    }
  }

  // Start periodic cleanup
  startPeriodicCleanup() {
    setInterval(() => {
      this.cleanupCache().catch(console.error);
    }, this.cleanupInterval);
  }

  // Get cache statistics
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : '0.00';
    
    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      cacheSize: `${(this.stats.totalSize / 1024 / 1024).toFixed(2)}MB`,
      maxCacheSize: `${(this.maxCacheSize / 1024 / 1024).toFixed(2)}MB`,
      memoryItems: this.memoryCache.size,
      rateLimitStatus: this.rateLimiter.getStatus(),
      lastCleanup: new Date(this.stats.lastCleanup).toISOString()
    };
  }

  // Preload critical images
  async preloadImages(imageList) {
    console.log(`🚀 Preloading ${imageList.length} critical images...`);
    
    const results = await Promise.allSettled(
      imageList.map(async (item) => {
        try {
          return await this.downloadAndCache(item.url, item.options);
        } catch (error) {
          console.warn(`Failed to preload ${item.url}:`, error.message);
          return null;
        }
      })
    );
    
    const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;
    console.log(`✅ Preloaded ${successful}/${imageList.length} images`);
    
    return results;
  }

  // Sleep utility
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Clear all cache
  async clearCache() {
    try {
      await Promise.all([
        fs.rmdir(path.join(this.cacheDir, 'images'), { recursive: true }).catch(() => {}),
        fs.rmdir(path.join(this.cacheDir, 'metadata'), { recursive: true }).catch(() => {})
      ]);
      
      this.memoryCache.clear();
      this.stats = {
        hits: 0,
        misses: 0,
        downloads: 0,
        errors: 0,
        totalSize: 0,
        lastCleanup: Date.now()
      };
      
      console.log('🗑️  Cache cleared successfully');
    } catch (error) {
      console.error('Failed to clear cache:', error.message);
    }
  }
}

// Rate limiter for API requests
class RateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 60 * 60 * 1000; // 1 hour
    this.maxRequests = options.maxRequests || 100;
    this.requests = [];
  }

  canMakeRequest() {
    this.cleanupOldRequests();
    return this.requests.length < this.maxRequests;
  }

  recordRequest() {
    this.requests.push(Date.now());
  }

  cleanupOldRequests() {
    const cutoff = Date.now() - this.windowMs;
    this.requests = this.requests.filter(time => time > cutoff);
  }

  getStatus() {
    this.cleanupOldRequests();
    return {
      requests: this.requests.length,
      maxRequests: this.maxRequests,
      windowMs: this.windowMs,
      resetTime: new Date(Date.now() + this.windowMs).toISOString()
    };
  }

  getRemainingRequests() {
    this.cleanupOldRequests();
    return Math.max(0, this.maxRequests - this.requests.length);
  }
}

module.exports = { ImageCacheManager, RateLimiter };