// Multi-source image procurement system
// Integrates Unsplash, manufacturer APIs, and fallback systems

const https = require('https');
const http = require('http');

class ImageSourceManager {
  constructor(config = {}) {
    this.unsplashAccessKey =
      config.unsplashAccessKey || process.env.UNSPLASH_ACCESS_KEY;
    this.shutterStockApiKey =
      config.shutterStockApiKey || process.env.SHUTTERSTOCK_API_KEY;

    // Request tracking for rate limiting
    this.requestCounts = {
      unsplash: 0,
      shutterstock: 0,
      manufacturer: 0,
    };

    this.rateLimits = {
      unsplash: { max: 50, window: 3600000 }, // 50 per hour
      shutterstock: { max: 20, window: 3600000 }, // 20 per hour
      manufacturer: { max: 10, window: 3600000 }, // 10 per hour
    };

    this.lastResetTime = Date.now();

    // High-quality curated image database by product category
    this.curatedImages = {
      // iPhone 16 Pro Max Collection
      'iphone-16-pro-max-titanium-hero.jpg': {
        primary:
          'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1200&h=800&fit=crop&q=90',
        fallbacks: [
          'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1200&h=800&fit=crop&q=90',
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&h=800&fit=crop&q=90',
        ],
        description: 'iPhone 16 Pro Max titanium premium build quality',
      },
      'iphone-16-pro-max-camera-system.jpg': {
        primary:
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&h=800&fit=crop&q=90',
        fallbacks: [
          'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=1200&h=800&fit=crop&q=90',
        ],
        description: 'iPhone camera system professional macro photography',
      },
      'iphone-16-pro-max-apple-intelligence.jpg': {
        primary:
          'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=800&fit=crop&q=90',
        fallbacks: [
          'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=800&fit=crop&q=90',
        ],
        description: 'AI artificial intelligence features interface',
      },
      'iphone-16-pro-max-a18-bionic.jpg': {
        primary:
          'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=800&fit=crop&q=90',
        fallbacks: [
          'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=800&fit=crop&q=90',
        ],
        description: 'A18 Bionic chip processor semiconductor technology',
      },
      'iphone-16-pro-max-battery-life.jpg': {
        primary:
          'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=1200&h=800&fit=crop&q=90',
        fallbacks: [
          'https://images.unsplash.com/photo-1558618666-fcd25d85cd64?w=1200&h=800&fit=crop&q=90',
        ],
        description: 'Smartphone battery charging wireless power',
      },
      'iphone-16-pro-max-titanium-design.jpg': {
        primary:
          'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1200&h=800&fit=crop&q=90',
        fallbacks: [
          'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1200&h=800&fit=crop&q=90',
        ],
        description: 'Premium titanium smartphone design materials',
      },

      // iPhone 15 Pro Max Collection
      'iphone-15-pro-max-camera.jpg': {
        primary:
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&h=800&fit=crop&q=90',
        fallbacks: [
          'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=1200&h=800&fit=crop&q=90',
        ],
        description: 'iPhone 15 Pro camera telephoto zoom system',
      },
      'iphone-15-pro-max-titanium.jpg': {
        primary:
          'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1200&h=800&fit=crop&q=90',
        fallbacks: [
          'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1200&h=800&fit=crop&q=90',
        ],
        description: 'iPhone 15 Pro titanium premium design',
      },
      'iphone-15-pro-max-display.jpg': {
        primary:
          'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&h=800&fit=crop&q=90',
        fallbacks: [
          'https://images.unsplash.com/photo-1558618666-fcd25d85cd64?w=1200&h=800&fit=crop&q=90',
        ],
        description: 'OLED smartphone display screen technology',
      },
      'iphone-15-pro-max-battery.jpg': {
        primary:
          'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=1200&h=800&fit=crop&q=90',
        fallbacks: [
          'https://images.unsplash.com/photo-1558618666-fcd25d85cd64?w=1200&h=800&fit=crop&q=90',
        ],
        description: 'iPhone battery life charging technology',
      },
      'iphone-15-pro-max-usbc.jpg': {
        primary:
          'https://images.unsplash.com/photo-1558618666-fcd25d85cd64?w=1200&h=800&fit=crop&q=90',
        fallbacks: [
          'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=1200&h=800&fit=crop&q=90',
        ],
        description: 'USB-C cable connector charging port',
      },

      // Review-specific images
      'titanium-design.jpg': {
        primary:
          'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1200&h=800&fit=crop&q=90',
        fallbacks: [
          'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1200&h=800&fit=crop&q=90',
        ],
        description: 'Titanium smartphone premium build quality design',
      },
      'camera-comparison.jpg': {
        primary:
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&h=800&fit=crop&q=90',
        fallbacks: [
          'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=1200&h=800&fit=crop&q=90',
        ],
        description: 'Smartphone camera comparison telephoto zoom',
      },
      'performance-benchmarks.jpg': {
        primary:
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop&q=90',
        fallbacks: [
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop&q=90',
        ],
        description: 'Performance benchmarks graphs testing data',
      },

      // News images
      'apple-event-how-to-watch.jpg': {
        primary:
          'https://images.unsplash.com/photo-1531498860502-7c67cf02f657?w=1200&h=800&fit=crop&q=90',
        fallbacks: [
          'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=1200&h=800&fit=crop&q=90',
        ],
        description: 'Apple event streaming keynote presentation',
      },
      'iphone-17-air-engineering.jpg': {
        primary:
          'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=800&fit=crop&q=90',
        fallbacks: [
          'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=800&fit=crop&q=90',
        ],
        description: 'Smartphone engineering thin design technology',
      },
      'apple-watch-airpods-2025.jpg': {
        primary:
          'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=1200&h=800&fit=crop&q=90',
        fallbacks: [
          'https://images.unsplash.com/photo-1609634104886-f5b5f77d6d0d?w=1200&h=800&fit=crop&q=90',
        ],
        description: 'Apple Watch AirPods wearable technology',
      },
      'iphone-17-air-analysis.jpg': {
        primary:
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&h=800&fit=crop&q=90',
        fallbacks: [
          'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&h=800&fit=crop&q=90',
        ],
        description: 'iPhone analysis expert review technology',
      },
    };

    // Manufacturer press resources (when available)
    this.manufacturerApis = {
      apple: {
        pressKit: 'https://www.apple.com/newsroom/images/',
        fallback: true,
      },
      samsung: {
        pressKit: 'https://images.samsung.com/is/content/samsung/assets/',
        fallback: true,
      },
      google: {
        pressKit: 'https://blog.google/static/googlepress/',
        fallback: true,
      },
    };
  }

  // Reset rate limiting counters
  resetRateLimits() {
    const now = Date.now();
    if (now - this.lastResetTime >= 3600000) {
      // 1 hour
      Object.keys(this.requestCounts).forEach((key) => {
        this.requestCounts[key] = 0;
      });
      this.lastResetTime = now;
    }
  }

  // Check if we can make a request to a specific source
  canMakeRequest(source) {
    this.resetRateLimits();
    return this.requestCounts[source] < this.rateLimits[source].max;
  }

  // Primary method: Get best available image URL
  async getImageUrl(filename, options = {}) {
    const {
      searchQuery = '',
      category = 'general',
      quality = 'high',
      dimensions = { width: 1200, height: 800 },
      fallbackAllowed = true,
    } = options;

    // Step 1: Check curated collection first (highest quality)
    if (this.curatedImages[filename]) {
      console.log(`📋 Using curated image for: ${filename}`);
      return await this.validateAndReturnImage(this.curatedImages[filename]);
    }

    // Step 2: Try Unsplash API search
    if (
      this.unsplashAccessKey &&
      this.canMakeRequest('unsplash') &&
      searchQuery
    ) {
      try {
        const unsplashUrl = await this.searchUnsplash(
          searchQuery,
          dimensions,
          quality
        );
        if (unsplashUrl) {
          this.requestCounts.unsplash++;
          console.log(`🔍 Found via Unsplash search: ${filename}`);
          return unsplashUrl;
        }
      } catch (error) {
        console.log(`Unsplash search failed for ${filename}: ${error.message}`);
      }
    }

    // Step 3: Try manufacturer press resources
    if (this.canMakeRequest('manufacturer')) {
      try {
        const manufacturerUrl = await this.searchManufacturerApi(
          filename,
          category
        );
        if (manufacturerUrl) {
          this.requestCounts.manufacturer++;
          console.log(`🏭 Found via manufacturer API: ${filename}`);
          return manufacturerUrl;
        }
      } catch (error) {
        console.log(
          `Manufacturer API failed for ${filename}: ${error.message}`
        );
      }
    }

    // Step 4: Use intelligent fallback
    if (fallbackAllowed) {
      console.log(`🛡️  Using intelligent fallback for: ${filename}`);
      return this.getIntelligentFallback(filename, searchQuery, dimensions);
    }

    throw new Error(`No image source available for: ${filename}`);
  }

  // Validate curated image and return best option
  async validateAndReturnImage(imageConfig) {
    // Try primary URL first
    try {
      await this.validateImageUrl(imageConfig.primary);
      return imageConfig.primary;
    } catch (error) {
      console.log(`Primary image URL failed, trying fallbacks...`);
    }

    // Try fallback URLs
    for (const fallbackUrl of imageConfig.fallbacks || []) {
      try {
        await this.validateImageUrl(fallbackUrl);
        return fallbackUrl;
      } catch (error) {
        continue;
      }
    }

    throw new Error('All image URLs failed validation');
  }

  // Validate that an image URL returns a valid image
  async validateImageUrl(url) {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https:') ? https : http;

      const request = protocol.request(url, { method: 'HEAD' }, (response) => {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          const contentType = response.headers['content-type'];
          if (contentType && contentType.startsWith('image/')) {
            resolve(url);
          } else {
            reject(new Error('Not a valid image'));
          }
        } else {
          reject(new Error(`HTTP ${response.statusCode}`));
        }
      });

      request.on('error', reject);
      request.setTimeout(5000, () => {
        request.abort();
        reject(new Error('Validation timeout'));
      });

      request.end();
    });
  }

  // Search Unsplash API
  async searchUnsplash(query, dimensions, quality) {
    if (!this.unsplashAccessKey || this.unsplashAccessKey === 'demo') {
      return null;
    }

    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`,
        {
          headers: {
            Authorization: `Client-ID ${this.unsplashAccessKey}`,
            'Accept-Version': 'v1',
          },
          timeout: 10000,
        }
      );

      if (!response.ok) {
        throw new Error(`Unsplash API: ${response.status}`);
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        // Select best image based on quality requirements
        const bestImage = this.selectBestUnsplashImage(data.results, quality);
        return `${bestImage.urls.regular}&w=${dimensions.width}&h=${dimensions.height}&fit=crop&q=${quality === 'premium' ? 95 : 85}`;
      }

      return null;
    } catch (error) {
      console.error('Unsplash API error:', error.message);
      return null;
    }
  }

  // Select the best image from Unsplash results
  selectBestUnsplashImage(results, quality) {
    // Sort by quality indicators
    return results.sort((a, b) => {
      let scoreA = 0,
        scoreB = 0;

      // Prefer higher resolution
      scoreA += (a.width * a.height) / 1000000;
      scoreB += (b.width * b.height) / 1000000;

      // Prefer more likes (quality indicator)
      scoreA += a.likes / 1000;
      scoreB += b.likes / 1000;

      // Prefer more downloads (popularity indicator)
      if (a.downloads) scoreA += a.downloads / 10000;
      if (b.downloads) scoreB += b.downloads / 10000;

      return scoreB - scoreA;
    })[0];
  }

  // Search manufacturer press APIs (simplified for demo)
  async searchManufacturerApi(filename, category) {
    // This would integrate with actual manufacturer APIs
    // For now, return null to use other sources
    return null;
  }

  // Get intelligent fallback based on filename and context
  getIntelligentFallback(filename, searchQuery = '', dimensions) {
    const fn = filename.toLowerCase();
    const query = searchQuery.toLowerCase();

    // iPhone fallbacks
    if (fn.includes('iphone') || query.includes('iphone')) {
      return `https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=${dimensions.width}&h=${dimensions.height}&fit=crop&q=85`;
    }

    // Samsung fallbacks
    if (
      fn.includes('samsung') ||
      fn.includes('galaxy') ||
      query.includes('samsung')
    ) {
      return `https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=${dimensions.width}&h=${dimensions.height}&fit=crop&q=85`;
    }

    // Google/Pixel fallbacks
    if (
      fn.includes('pixel') ||
      fn.includes('google') ||
      query.includes('pixel')
    ) {
      return `https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=${dimensions.width}&h=${dimensions.height}&fit=crop&q=85`;
    }

    // Camera-specific fallbacks
    if (fn.includes('camera') || query.includes('camera')) {
      return `https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=${dimensions.width}&h=${dimensions.height}&fit=crop&q=85`;
    }

    // AI/Tech fallbacks
    if (
      fn.includes('ai') ||
      fn.includes('intelligence') ||
      query.includes('ai')
    ) {
      return `https://images.unsplash.com/photo-1677442136019-21780ecad995?w=${dimensions.width}&h=${dimensions.height}&fit=crop&q=85`;
    }

    // Performance/benchmark fallbacks
    if (
      fn.includes('performance') ||
      fn.includes('benchmark') ||
      query.includes('benchmark')
    ) {
      return `https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=${dimensions.width}&h=${dimensions.height}&fit=crop&q=85`;
    }

    // General tech fallback
    return `https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=${dimensions.width}&h=${dimensions.height}&fit=crop&q=85`;
  }

  // Get statistics about image source usage
  getStats() {
    this.resetRateLimits();

    return {
      requests: { ...this.requestCounts },
      limits: { ...this.rateLimits },
      curatedCount: Object.keys(this.curatedImages).length,
      lastReset: new Date(this.lastResetTime).toISOString(),
      timeUntilReset: Math.max(0, 3600000 - (Date.now() - this.lastResetTime)),
    };
  }

  // Preload and validate all curated images (for maintenance)
  async validateAllCuratedImages() {
    console.log('🔍 Validating curated image collection...');

    const results = {
      valid: [],
      invalid: [],
      total: Object.keys(this.curatedImages).length,
    };

    for (const [filename, config] of Object.entries(this.curatedImages)) {
      try {
        await this.validateAndReturnImage(config);
        results.valid.push(filename);
        console.log(`✅ ${filename}`);
      } catch (error) {
        results.invalid.push({ filename, error: error.message });
        console.log(`❌ ${filename}: ${error.message}`);
      }
    }

    console.log(`\n📊 Validation Results:`);
    console.log(`✅ Valid: ${results.valid.length}/${results.total}`);
    console.log(`❌ Invalid: ${results.invalid.length}/${results.total}`);

    return results;
  }
}

module.exports = { ImageSourceManager };
