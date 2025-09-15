#!/usr/bin/env node

/**
 * Comprehensive Image Sourcing System
 * Combines stock photos, AI generation, and intelligent fallbacks
 * Perfect for automated blog content with diverse, high-quality images
 */

require('dotenv').config({ path: '.env.local' });
const { AIImageGenerator } = require('./ai-image-generator');
const https = require('https');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class ComprehensiveImageSystem {
  constructor() {
    this.aiGenerator = new AIImageGenerator();
    
    // API keys
    this.unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
    this.pexelsKey = process.env.PEXELS_API_KEY;
    
    this.outputDir = path.join(__dirname, '..', 'public', 'images');
    this.cacheDir = path.join(__dirname, '..', '.cache', 'images');
    
    // Image source priorities - ENFORCED: gpt-image-1 ONLY (no stock photos)
    this.sources = [
      'ai'     // ONLY AI generation with gpt-image-1 (no stock photos, no fallbacks)
    ];
    
    this.results = [];
    this.stats = {
      stock: 0,
      ai: 0,
      cached: 0,
      errors: 0
    };
  }

  async ensureDirs() {
    await fs.mkdir(this.outputDir, { recursive: true }).catch(() => {});
    await fs.mkdir(this.cacheDir, { recursive: true }).catch(() => {});
  }

  getCacheKey(query, options = {}) {
    const hash = crypto.createHash('md5');
    hash.update(query);
    hash.update(JSON.stringify(options));
    return hash.digest('hex');
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : require('http');
      
      const req = protocol.request(url, options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({ statusCode: res.statusCode, data: parsed });
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${parsed.error || 'Unknown error'}`));
            }
          } catch (e) {
            reject(new Error(`Parse error: ${data.substring(0, 200)}`));
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (options.body) {
        req.write(options.body);
      }
      
      req.end();
    });
  }

  async searchUnsplash(query, options = {}) {
    if (!this.unsplashKey || this.unsplashKey === 'your-unsplash-access-key') {
      throw new Error('Unsplash API key not configured');
    }

    const {
      per_page = 5,
      orientation = 'landscape',
      category = '',
      order_by = 'relevant'
    } = options;

    console.log(`📸 Searching Unsplash for: "${query}"`);

    const response = await this.makeRequest(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${per_page}&orientation=${orientation}&order_by=${order_by}&client_id=${this.unsplashKey}`,
      { method: 'GET' }
    );

    const photos = response.data?.results || [];
    return photos.map(photo => ({
      id: photo.id,
      url: photo.urls.regular,
      download_url: photo.urls.full,
      description: photo.description || photo.alt_description || query,
      width: photo.width,
      height: photo.height,
      photographer: photo.user.name,
      photographer_url: photo.user.links.html,
      source: 'unsplash'
    }));
  }

  async searchPexels(query, options = {}) {
    if (!this.pexelsKey || this.pexelsKey === 'your-pexels-api-key') {
      throw new Error('Pexels API key not configured');
    }

    const {
      per_page = 5,
      orientation = 'landscape',
      size = 'large'
    } = options;

    console.log(`📸 Searching Pexels for: "${query}"`);

    const response = await this.makeRequest(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${per_page}&orientation=${orientation}&size=${size}`,
      {
        method: 'GET',
        headers: {
          'Authorization': this.pexelsKey
        }
      }
    );

    const photos = response.data?.photos || [];
    return photos.map(photo => ({
      id: photo.id,
      url: photo.src.large,
      download_url: photo.src.original,
      description: photo.alt || query,
      width: photo.width,
      height: photo.height,
      photographer: photo.photographer,
      photographer_url: photo.photographer_url,
      source: 'pexels'
    }));
  }

  async getStockImages(query, options = {}) {
    const { count = 3, ...searchOptions } = options;
    const allImages = [];
    
    try {
      // Try Unsplash first
      const unsplashResults = await this.searchUnsplash(query, { 
        per_page: Math.ceil(count / 2), 
        ...searchOptions 
      });
      allImages.push(...unsplashResults);
    } catch (error) {
      console.error(`Unsplash search failed: ${error.message}`);
    }

    try {
      // Try Pexels as backup
      if (allImages.length < count) {
        const pexelsResults = await this.searchPexels(query, { 
          per_page: count - allImages.length, 
          ...searchOptions 
        });
        allImages.push(...pexelsResults);
      }
    } catch (error) {
      console.error(`Pexels search failed: ${error.message}`);
    }

    return allImages.slice(0, count);
  }

  async downloadImage(imageUrl, filename, subfolder = 'stock') {
    const fullPath = path.join(this.outputDir, subfolder, filename);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });

    return new Promise((resolve, reject) => {
      const file = require('fs').createWriteStream(fullPath);
      
      https.get(imageUrl, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }
        
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          resolve(fullPath);
        });
        
        file.on('error', reject);
      }).on('error', reject);
    });
  }

  async findBestImage(query, options = {}) {
    const {
      type = 'ai', // ENFORCED: only gpt-image-1 generation, no stock photos, no other sources
      downloadImages = true,
      filename,
      subfolder = 'auto',
      ...otherOptions
    } = options;

    await this.ensureDirs();

    // Check cache first
    const cacheKey = this.getCacheKey(query, options);
    const cachePath = path.join(this.cacheDir, `comprehensive-${cacheKey}.json`);
    
    try {
      const cached = await fs.readFile(cachePath, 'utf-8');
      const cachedData = JSON.parse(cached);
      console.log(`📦 Using cached image search for: "${query}"`);
      this.stats.cached++;
      return cachedData;
    } catch {
      // No cache found, proceed with search
    }

    let result = null;
    const sourcesToTry = type === 'auto' ? this.sources : [type];

    for (const source of sourcesToTry) {
      try {
        switch (source) {
          case 'ai':
            console.log(`🎨 Generating AI image for: "${query}"`);
            
            // Create a detailed prompt for AI generation
            const aiPrompt = `Professional high-quality image representing "${query}": modern, sleek, engaging, clean composition, professional photography style, vibrant colors`;
            
            const aiResult = await this.aiGenerator.generateImage(aiPrompt, {
              filename: filename || `ai-${query.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}.png`,
              size: '1536x1024', // Blog hero-friendly; accepted by images API
              quality: 'high',
              style: 'vivid',
              downloadImage: downloadImages,
              ...otherOptions
            });

            result = {
              source: 'ai',
              primary: {
                id: `ai-${Date.now()}`,
                url: aiResult.url,
                download_url: aiResult.url,
                localPath: aiResult.localPath,
                filename: aiResult.filename,
                description: aiResult.revisedPrompt || aiPrompt,
                width: 1792,
                height: 1024,
                provider: aiResult.provider,
                model: aiResult.model,
                source: 'ai-generated'
              },
              query: query,
              originalPrompt: query,
              aiPrompt: aiPrompt
            };

            this.stats.ai++;
            console.log(`✅ Generated AI image with ${aiResult.provider}`);
            break;
        }

        // If we found a result, break out of the loop
        if (result) break;

      } catch (error) {
        console.error(`❌ ${source} source failed: ${error.message}`);
        this.stats.errors++;
        
        // If this was the last source to try and we haven't found anything
        if (source === sourcesToTry[sourcesToTry.length - 1] && !result) {
          throw new Error(`All image sources failed for "${query}". Last error: ${error.message}`);
        }
      }
    }

    // Cache the result
    if (result) {
      await fs.writeFile(cachePath, JSON.stringify(result, null, 2)).catch(console.error);
      this.results.push({ query, ...result });
    }

    return result;
  }

  async generateBlogImageSet(topics, options = {}) {
    console.log(`🖼️  Generating comprehensive image set for ${topics.length} blog topics...`);
    
    const results = [];
    
    for (const topic of topics) {
      try {
        console.log(`\n📋 Processing: ${topic}`);
        
        const imageResult = await this.findBestImage(topic, {
          type: 'ai', // ENFORCED: only gpt-image-1, no stock photos
          downloadImages: true,
          subfolder: 'blog-heroes',
          ...options
        });

        results.push({
          topic,
          success: true,
          ...imageResult
        });

        console.log(`✅ Completed: ${topic} (${imageResult.source})`);
        
        // Small delay to be respectful to APIs
        await new Promise(resolve => setTimeout(resolve, 1500));
        
      } catch (error) {
        console.error(`❌ Failed for "${topic}": ${error.message}`);
        results.push({
          topic,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  async getComprehensiveStats() {
    const aiStats = await this.aiGenerator.getUsageStats();
    
    return {
      totalImages: this.results.length,
      sources: this.stats,
      successRate: `${Math.round((this.results.length / (this.results.length + this.stats.errors)) * 100)}%`,
      aiGeneration: aiStats,
      estimatedSavings: this.calculateSavings()
    };
  }

  calculateSavings() {
    // Estimate savings from using stock photos vs. AI generation
    const stockImagesUsed = this.stats.stock;
    const aiImagesUsed = this.stats.ai;
    const avgAIcost = 0.080; // USD per hd image (est.)

    const potentialAICost = (stockImagesUsed + aiImagesUsed) * avgAIcost; // if all were AI
    const actualAICost = aiImagesUsed * avgAIcost; // actual spend for AI images

    return {
      stockImagesUsed,
      aiImagesUsed,
      potentialCost: `$${potentialAICost.toFixed(3)}`,
      actualCost: `$${actualAICost.toFixed(3)}`,
      savings: `$${(potentialAICost - actualAICost).toFixed(3)}`
    };
  }
}

// CLI interface
if (require.main === module) {
  const imageSystem = new ComprehensiveImageSystem();
  
  const args = process.argv.slice(2);
  const command = args[0];
  const query = args.slice(1).join(' ');
  
  async function run() {
    switch (command) {
      case 'find':
        if (!query) {
          console.log('Usage: node comprehensive-image-system.js find "search query"');
          return;
        }
        
        const result = await imageSystem.findBestImage(query, {
          type: 'ai',
          downloadImages: true
        });
        
        console.log('\n🖼️  Image Result:');
        console.log(`   Source: ${result.source}`);
        console.log(`   Description: ${result.primary.description}`);
        console.log(`   Local Path: ${result.primary.localPath || 'Not downloaded'}`);
        console.log(`   URL: ${result.primary.url}`);
        break;

      case 'batch':
        const topics = query.split(',').map(t => t.trim());
        const results = await imageSystem.generateBlogImageSet(topics);
        
        console.log('\n📊 Batch Image Results:');
        results.forEach(r => {
          const status = r.success ? `✅ ${r.source}` : `❌ ${r.error}`;
          console.log(`   ${r.topic}: ${status}`);
        });
        break;

      case 'stats':
        const stats = await imageSystem.getComprehensiveStats();
        console.log('\n📊 Comprehensive Image System Statistics:');
        console.log(JSON.stringify(stats, null, 2));
        break;

      default:
        console.log(`
🖼️  Comprehensive Image System

Usage: node comprehensive-image-system.js <command> [options]

Commands:
  find "query"               - Find best image for query
  batch "topic1,topic2"      - Generate image set for blog topics  
  stats                      - Show detailed statistics

Examples:
  node comprehensive-image-system.js find "iPhone 16 Pro design"
  node comprehensive-image-system.js batch "AI trends,5G technology,quantum computing"
        `);
    }
  }
  
  run().catch(console.error);
}

module.exports = { ComprehensiveImageSystem };
