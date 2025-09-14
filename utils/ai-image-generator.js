#!/usr/bin/env node

/**
 * AI Image Generation Utility
 * Supports OpenAI gpt-image-1 and Google AI as backup image sources
 * Perfect for blog post hero images and product visuals
 */

require('dotenv').config({ path: '.env.local' });
const https = require('https');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class AIImageGenerator {
  constructor() {
    this.openaiKey = process.env.OPENAI_API_KEY;
    this.googleKey = process.env.GOOGLE_AI_API_KEY;
    
    this.cacheDir = path.join(__dirname, '..', '.cache', 'ai-images');
    this.outputDir = path.join(__dirname, '..', 'public', 'images', 'ai-generated');
    
    this.providers = ['openai', 'google'];
    this.currentProvider = 'openai';
    
    // Rate limiting
    this.lastRequestTime = 0;
    this.minRequestInterval = 2000; // 2 seconds between requests
    
    this.generatedImages = [];
    this.errors = [];
  }

  async ensureDirs() {
    await fs.mkdir(this.cacheDir, { recursive: true }).catch(() => {});
    await fs.mkdir(this.outputDir, { recursive: true }).catch(() => {});
  }

  getCacheKey(prompt, options = {}) {
    const hash = crypto.createHash('md5');
    hash.update(prompt);
    hash.update(JSON.stringify(options));
    return hash.digest('hex');
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

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const req = https.request(url, options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({ statusCode: res.statusCode, data: parsed });
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${parsed.error?.message || 'Unknown error'}`));
            }
          } catch (e) {
            reject(new Error(`Parse error: ${data.substring(0, 200)}`));
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(120000, () => { // 120 second timeout for image generation
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (options.body) {
        req.write(options.body);
      }
      
      req.end();
    });
  }

  async generateWithOpenAI(prompt, options = {}) {
    if (!this.openaiKey || this.openaiKey === 'sk-your-api-key-here') {
      throw new Error('OpenAI API key not configured');
    }

    const {
      size = '1024x1024',
      quality = 'standard', // standard or hd
      style = 'vivid', // vivid or natural
      n = 1
    } = options;

    console.log(`🎨 Generating image with OpenAI gpt-image-1...`);
    console.log(`   Prompt: "${prompt.substring(0, 50)}..."`);

    await this.enforceRateLimit();

    const response = await this.makeRequest('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: prompt,
        n: n,
        size: size,
        quality: quality
      })
    });

    const item = response.data?.data?.[0] || {};
    const imageUrl = item.url;
    const b64 = item.b64_json;
    const revisedPrompt = item.revised_prompt;

    if (!imageUrl && !b64) {
      throw new Error('No image returned from OpenAI');
    }

    return {
      url: imageUrl,
      b64_json: b64,
      provider: 'openai',
      model: 'gpt-image-1',
      originalPrompt: prompt,
      revisedPrompt: revisedPrompt,
      size: size,
      quality: quality,
      style: style
    };
  }

  async generateWithGoogle(prompt, options = {}) {
    // Note: Google Imagen requires Google Cloud Project setup
    // This is a placeholder for future implementation
    console.log(`🎨 Google AI image generation requires Cloud Project setup`);
    console.log(`   Falling back to curated alternatives...`);
    
    // For now, return a fallback suggestion
    throw new Error('Google AI image generation requires Google Cloud Project configuration');
  }

  async downloadImage(imageUrl, filename) {
    return new Promise((resolve, reject) => {
      const filePath = path.join(this.outputDir, filename);
      const file = require('fs').createWriteStream(filePath);
      
      https.get(imageUrl, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }
        
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          resolve(filePath);
        });
        
        file.on('error', reject);
      }).on('error', reject);
    });
  }

  async generateImage(prompt, options = {}) {
    const {
      filename,
      provider = 'auto', // auto, openai, google
      downloadImage = true,
      ...providerOptions
    } = options;

    await this.ensureDirs();

    // Check cache first
    const cacheKey = this.getCacheKey(prompt, providerOptions);
    const cachePath = path.join(this.cacheDir, `${cacheKey}.json`);
    
    try {
      const cached = await fs.readFile(cachePath, 'utf-8');
      const cachedData = JSON.parse(cached);
      console.log(`📦 Using cached AI image for: "${prompt.substring(0, 50)}..."`);
      return cachedData;
    } catch {
      // No cache found, proceed with generation
    }

    let result;
    const providersToTry = provider === 'auto' ? ['openai'] : [provider];

    for (const currentProvider of providersToTry) {
      try {
        switch (currentProvider) {
          case 'openai':
            result = await this.generateWithOpenAI(prompt, providerOptions);
            break;
          case 'google':
            result = await this.generateWithGoogle(prompt, providerOptions);
            break;
          default:
            throw new Error(`Unknown provider: ${currentProvider}`);
        }

        // If successful, break out of loop
        break;
      } catch (error) {
        console.error(`❌ ${currentProvider} failed: ${error.message}`);
        this.errors.push({ provider: currentProvider, error: error.message, prompt });
        
        // If this was the last provider to try, throw error
        if (currentProvider === providersToTry[providersToTry.length - 1]) {
          throw new Error(`All providers failed. Last error: ${error.message}`);
        }
      }
    }

    // Save base64 image if provided
    if (downloadImage && result.b64_json && !result.localPath) {
      const imageFilename = filename || `ai-generated-${Date.now()}.png`;
      try {
        await this.ensureDirs();
        const filePath = path.join(this.outputDir, imageFilename);
        const buffer = Buffer.from(result.b64_json, 'base64');
        await require('fs').promises.writeFile(filePath, buffer);
        result.localPath = filePath;
        result.filename = imageFilename;
        console.log(`dY'_ Saved base64 image: ${imageFilename}`);
      } catch (error) {
        console.error(`Failed to save base64 image: ${error.message}`);
      }
    }

    // Download image if requested
    if (downloadImage && result.url) {
      const imageFilename = filename || `ai-generated-${Date.now()}.png`;
      try {
        const localPath = await this.downloadImage(result.url, imageFilename);
        result.localPath = localPath;
        result.filename = imageFilename;
        console.log(`💾 Downloaded image: ${imageFilename}`);
      } catch (error) {
        console.error(`⚠️ Failed to download image: ${error.message}`);
      }
    }

    // Cache result
    await fs.writeFile(cachePath, JSON.stringify(result, null, 2)).catch(console.error);

    this.generatedImages.push(result);
    return result;
  }

  async generateBlogImages(topics, options = {}) {
    console.log(`🎨 Generating AI images for ${topics.length} blog topics...`);
    
    const results = [];
    for (const topic of topics) {
      try {
        // Create a detailed prompt for blog hero images
        const prompt = `Professional blog hero image for "${topic}": sleek, modern, high-quality, engaging visual that represents the topic, professional photography style, clean composition, vibrant colors`;
        
        const filename = `blog-${topic.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
        
        const result = await this.generateImage(prompt, {
          filename,
          size: '1792x1024', // Blog hero ratio
          quality: 'hd',
          style: 'vivid',
          ...options
        });

        results.push({
          topic,
          ...result
        });

        console.log(`✅ Generated image for: ${topic}`);
        
        // Small delay between generations
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Failed to generate image for "${topic}": ${error.message}`);
        results.push({
          topic,
          error: error.message
        });
      }
    }

    return results;
  }

  async getUsageStats() {
    return {
      imagesGenerated: this.generatedImages.length,
      errors: this.errors.length,
      providers: [...new Set(this.generatedImages.map(img => img.provider))],
      totalCost: this.estimateCost()
    };
  }

  estimateCost() {
    // OpenAI gpt-image-1 3 pricing estimates
    let cost = 0;
    for (const img of this.generatedImages) {
      if (img.provider === 'openai') {
        cost += img.quality === 'hd' ? 0.080 : 0.040; // USD per image
      }
    }
    return `$${cost.toFixed(3)}`;
  }
}

// CLI interface
if (require.main === module) {
  const generator = new AIImageGenerator();
  
  const args = process.argv.slice(2);
  const command = args[0];
  const prompt = args.slice(1).join(' ');
  
  async function run() {
    switch (command) {
      case 'generate':
        if (!prompt) {
          console.log('Usage: node ai-image-generator.js generate "your image prompt"');
          return;
        }
        
        const result = await generator.generateImage(prompt, {
          size: '1024x1024',
          quality: 'hd',
          style: 'vivid'
        });
        
        console.log('\n🎨 Generation Result:');
        console.log(`   URL: ${result.url}`);
        console.log(`   Local: ${result.localPath || 'Not downloaded'}`);
        console.log(`   Provider: ${result.provider}`);
        break;

      case 'blog-batch':
        const topics = prompt.split(',').map(t => t.trim());
        const results = await generator.generateBlogImages(topics);
        
        console.log('\n📊 Batch Generation Results:');
        results.forEach(r => {
          console.log(`   ${r.topic}: ${r.error ? '❌ ' + r.error : '✅ ' + r.filename}`);
        });
        break;

      case 'stats':
        const stats = await generator.getUsageStats();
        console.log('\n📊 Usage Statistics:', stats);
        break;

      default:
        console.log(`
🎨 AI Image Generator

Usage: node ai-image-generator.js <command> [options]

Commands:
  generate "prompt"           - Generate single image
  blog-batch "topic1,topic2"  - Generate blog hero images
  stats                       - Show usage statistics

Examples:
  node ai-image-generator.js generate "iPhone 16 Pro in titanium"
  node ai-image-generator.js blog-batch "AI trends,5G technology,quantum computing"
        `);
    }
  }
  
  run().catch(console.error);
}

module.exports = { AIImageGenerator };
