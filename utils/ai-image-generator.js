#!/usr/bin/env node

/**
 * AI Image Generation Utility - gpt-image-1 ONLY
 * Generates unique, context-aware images from article content
 * Cost-optimized for HD quality with dynamic prompting
 */

require('dotenv').config({ path: '.env.local' });
const https = require('https');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class AIImageGenerator {
  constructor() {
    this.openaiKey = process.env.OPENAI_API_KEY;

    this.cacheDir = path.join(__dirname, '..', '.cache', 'ai-images');
    this.outputDir = path.join(__dirname, '..', 'public', 'images', 'ai-generated');

    // Optimized settings for cost and quality based on gpt-image-1 specs
    this.defaultOptions = {
      size: '1536x1024',  // Supported: 1024x1024, 1024x1536, 1536x1024
      quality: 'high',    // Options: low, medium, high, auto
      model: 'gpt-image-1',
      n: 1                // Only 1 image per request supported
    };

    // Rate limiting
    this.lastRequestTime = 0;
    this.minRequestInterval = 3000; // 3 seconds for gpt-image-1

    this.generatedImages = [];
    this.errors = [];
  }

  async ensureDirs() {
    await fs.mkdir(this.cacheDir, { recursive: true }).catch(() => {});
    await fs.mkdir(this.outputDir, { recursive: true }).catch(() => {});
  }

  // Dynamic content extraction for contextual image generation
  extractMainTopics(content) {
    const topics = [];

    // Extract from headers (## and ###)
    const headers = content.match(/^#{2,3}\s+(.+)$/gm) || [];
    headers.forEach(header => {
      const cleaned = header.replace(/^#{2,3}\s+/, '').replace(/[*_`]/g, '');
      topics.push(cleaned);
    });

    // Extract from bold text
    const boldText = content.match(/\*\*([^*]+)\*\*/g) || [];
    boldText.forEach(bold => {
      const cleaned = bold.replace(/\*\*/g, '');
      if (cleaned.length > 3 && cleaned.length < 50) {
        topics.push(cleaned);
      }
    });

    return [...new Set(topics)].slice(0, 5); // Top 5 unique topics
  }

  extractKeyStatistics(content) {
    const stats = [];

    // Find percentages
    const percentages = content.match(/\b\d+(\.\d+)?%/g) || [];
    stats.push(...percentages);

    // Find numbers with units (improved for space/science)
    const numbers = content.match(/\b[\d,]+(\.\d+)?[\s-]?(million|billion|thousand|years?|days?|hours?|minutes?|seconds?|miles?|MPH|mph|°F|°C|degrees?)\b/gi) || [];
    stats.push(...numbers);

    // Find dollar amounts
    const money = content.match(/\$[\d,]+(\.\d+)?(K|M|B)?/gi) || [];
    stats.push(...money);

    // Find space/science specific numbers
    const spaceNumbers = content.match(/\b\d+[\s-]?(qubits?|watts?|volts?|amps?|hertz|Hz|GHz|MHz|kilometers?|km|feet|ft|meters?|m)\b/gi) || [];
    stats.push(...spaceNumbers);

    // Find speed measurements
    const speeds = content.match(/\b[\d,]+(\.\d+)?[\s-]?(miles per hour|mph|MPH|kilometers per hour|kph|KPH)\b/gi) || [];
    stats.push(...speeds);

    return [...new Set(stats)].slice(0, 3); // Top 3 unique stats
  }

  extractTechnologies(content, category = 'technology') {
    const techTermsByCategory = {
      technology: [
        'AI', 'artificial intelligence', 'machine learning', 'neural network',
        'quantum', 'blockchain', 'cryptocurrency', 'VR', 'AR', 'IoT',
        'cloud computing', '5G', 'robotics', 'autonomous', 'automation',
        'smartphone', 'iPhone', 'Android', 'app', 'software', 'hardware',
        'algorithm', 'data', 'analytics', 'cybersecurity', 'privacy'
      ],
      space: [
        'NASA', 'SpaceX', 'Parker Solar Probe', 'spacecraft', 'probe', 'rover',
        'satellite', 'rocket', 'astronaut', 'space station', 'ISS', 'Mars',
        'solar', 'corona', 'flyby', 'orbit', 'telescope', 'galaxy', 'planet',
        'asteroid', 'comet', 'space exploration', 'mission', 'launch', 'lunar'
      ],
      science: [
        'CRISPR', 'DNA', 'genome', 'protein', 'molecule', 'research', 'study',
        'clinical trial', 'laboratory', 'experiment', 'analysis', 'breakthrough',
        'discovery', 'superconductor', 'quantum', 'physics', 'chemistry'
      ],
      health: [
        'clinical', 'medical', 'treatment', 'therapy', 'diagnosis', 'patient',
        'healthcare', 'medicine', 'pharmaceutical', 'drug', 'vaccine', 'trial',
        'FDA', 'biotech', 'precision medicine', 'personalized medicine'
      ],
      psychology: [
        'brain', 'neuroscience', 'cognitive', 'mental health', 'therapy',
        'psychology', 'psychiatry', 'depression', 'anxiety', 'mindfulness',
        'behavioral', 'neuroplasticity', 'psychedelic', 'meditation'
      ],
      culture: [
        'social media', 'creator economy', 'influencer', 'viral', 'platform',
        'content creation', 'streaming', 'TikTok', 'YouTube', 'Instagram',
        'digital culture', 'online community', 'metaverse'
      ]
    };

    const techTerms = techTermsByCategory[category] || techTermsByCategory.technology;
    const found = [];
    const contentLower = content.toLowerCase();

    techTerms.forEach(term => {
      // Use word boundaries to match whole words only
      const regex = new RegExp(`\\b${term.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(contentLower)) {
        found.push(term);
      }
    });
    return [...new Set(found)].slice(0, 4); // Top 4 unique technologies
  }

  determineMood(content) {
    const contentLower = content.toLowerCase();

    // Analyze sentiment indicators
    const positive = ['breakthrough', 'revolutionary', 'amazing', 'incredible', 'success', 'advance'];
    const urgent = ['emergency', 'critical', 'urgent', 'breaking', 'alert', 'crisis'];
    const scientific = ['study', 'research', 'analysis', 'findings', 'evidence', 'data'];
    const futuristic = ['future', 'tomorrow', 'next-gen', 'cutting-edge', 'innovation'];

    let mood = 'professional';

    if (positive.some(word => contentLower.includes(word))) mood = 'optimistic';
    if (urgent.some(word => contentLower.includes(word))) mood = 'urgent';
    if (scientific.some(word => contentLower.includes(word))) mood = 'analytical';
    if (futuristic.some(word => contentLower.includes(word))) mood = 'futuristic';

    return mood;
  }

  async generateDynamicPrompt(articleTitle, articleContent, category) {
    const topics = this.extractMainTopics(articleContent);
    const stats = this.extractKeyStatistics(articleContent);
    const technologies = this.extractTechnologies(articleContent, category);
    const mood = this.determineMood(articleContent);

    // Base prompt structure
    let prompt = `Professional hero image for tech blog article: "${articleTitle}"\n\n`;

    // Add key concepts
    if (topics.length > 0) {
      prompt += `Key concepts: ${topics.slice(0, 3).join(', ')}\n`;
    }

    // Add technologies
    if (technologies.length > 0) {
      prompt += `Technologies featured: ${technologies.slice(0, 3).join(', ')}\n`;
    }

    // Add data visualization if stats present
    if (stats.length > 0) {
      prompt += `Data visualization elements: Charts showing ${stats.slice(0, 2).join(' and ')}\n`;
    }

    // Add mood-specific visual requirements
    const moodStyles = {
      optimistic: 'vibrant colors, upward trending elements, bright lighting',
      urgent: 'dynamic composition, alert colors, high contrast',
      analytical: 'clean data visualization, graphs, scientific aesthetic',
      futuristic: 'holographic elements, neon accents, sci-fi atmosphere',
      professional: 'clean modern design, corporate colors, sophisticated layout'
    };

    prompt += `\nVisual requirements:\n`;
    prompt += `- Ultra high quality, photorealistic or stylized professional illustration\n`;
    prompt += `- 1536x1024 aspect ratio for blog header\n`;
    prompt += `- ${moodStyles[mood]}\n`;
    prompt += `- ${category} content theme\n`;
    prompt += `- Clean composition with clear focal point\n`;
    prompt += `- No text, logos, or watermarks\n`;
    prompt += `- Sharp details, editorial quality\n`;
    prompt += `- Suitable for professional tech publication`;

    return prompt;
  }

  async generateFromArticle(articleFilePath, options = {}) {
    try {
      console.log(`🎨 Generating single high-quality image from article: ${path.basename(articleFilePath)}`);

      // Read and parse article
      const content = await fs.readFile(articleFilePath, 'utf-8');

      // Extract frontmatter
      const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!frontmatterMatch) {
        throw new Error('No frontmatter found in article');
      }

      const frontmatter = frontmatterMatch[1];
      const title = frontmatter.match(/title:\s*['"](.*?)['"]/)?.[1] || 'Untitled';
      const category = frontmatter.match(/category:\s*(\w+)/)?.[1] || 'technology';

      // Generate dynamic prompt
      const prompt = await this.generateDynamicPrompt(title, content, category);

      console.log(`   Dynamic prompt generated (${prompt.length} chars)`);

      // Ensure only one image generation per call
      const forceOptions = {
        ...this.defaultOptions,
        ...options,
        n: 1  // Force single image generation
      };

      // Generate single high-quality image
      const result = await this.generateWithOpenAI(prompt, forceOptions);

      // Create unique filename with timestamp
      const timestamp = Date.now();
      const filename = `ai-generated-${timestamp}.png`;
      const localPath = path.join(this.outputDir, filename);

      // Save base64 image (gpt-image-1 ONLY returns base64, never URLs)
      console.log(`🔍 Result structure:`, { hasB64: !!result.b64_json, hasUrl: !!result.url });
      if (result.b64_json) {
        console.log(`📥 Saving gpt-image-1 base64 data to: ${path.join(this.outputDir, filename)}`);
        try {
          const buffer = Buffer.from(result.b64_json, 'base64');
          await fs.writeFile(path.join(this.outputDir, filename), buffer);
          console.log(`✅ gpt-image-1 image saved successfully`);
        } catch (error) {
          console.error(`❌ Base64 save failed: ${error.message}`);
          throw error;
        }
      } else {
        console.error(`❌ No base64 data returned from gpt-image-1 (URLs not supported)`);
        throw new Error('gpt-image-1 must return base64 data but none was found');
      }

      const imageResult = {
        url: result.url,
        localPath: `/images/ai-generated/${filename}`,
        filename,
        prompt: prompt.substring(0, 100) + '...',
        provider: 'openai',
        model: 'gpt-image-1',
        cost: 0.19, // High quality cost (~$0.19 per image in 2025)
        extractedTopics: this.extractMainTopics(content),
        extractedStats: this.extractKeyStatistics(content),
        extractedTech: this.extractTechnologies(content, category)
      };

      this.generatedImages.push(imageResult);

      console.log(`✅ Image generated successfully: ${filename}`);
      console.log(`   Local path: ${imageResult.localPath}`);

      return imageResult;

    } catch (error) {
      console.error(`❌ Error generating image from article: ${error.message}`);
      this.errors.push({ file: articleFilePath, error: error.message });
      throw error;
    }
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

    // Use optimized defaults
    const {
      size = this.defaultOptions.size,
      quality = this.defaultOptions.quality,
      n = 1
    } = options;

    console.log(`🎨 Generating image with OpenAI gpt-image-1...`);
    console.log(`   Size: ${size}, Quality: ${quality}`);
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
      quality: quality
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

    // Save base64 image (gpt-image-1 ONLY returns base64, never URLs)
    if (downloadImage && result.b64_json && !result.localPath) {
      const imageFilename = filename || `ai-generated-${Date.now()}.png`;
      try {
        await this.ensureDirs();
        const filePath = path.join(this.outputDir, imageFilename);
        const buffer = Buffer.from(result.b64_json, 'base64');
        await require('fs').promises.writeFile(filePath, buffer);
        result.localPath = filePath;
        result.filename = imageFilename;
        console.log(`💾 Saved gpt-image-1 base64 image: ${imageFilename}`);
      } catch (error) {
        console.error(`Failed to save base64 image: ${error.message}`);
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
          size: '1536x1024', // Blog hero ratio
          quality: 'high',
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
    // OpenAI gpt-image-1/DALL-E-like pricing estimate
    let cost = 0;
    for (const img of this.generatedImages) {
      if (img.provider === 'openai') {
        // Typical pricing buckets
        const qualityCosts = { low: 0.02, medium: 0.07, high: 0.19 };
        cost += qualityCosts[img.quality] || qualityCosts.high;
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

  async function run() {
    await generator.ensureDirs();

    switch (command) {
      case 'generate':
        const prompt = args.slice(1).join(' ');
        if (!prompt) {
          console.log('Usage: node ai-image-generator.js generate "your image prompt"');
          return;
        }

        const gen = await generator.generateImage(prompt, generator.defaultOptions);

        console.log('\n🎨 Generation Result:');
        console.log(`   Saved: ${gen.filename || 'inline base64'}`);
        console.log(`   Local: ${gen.localPath || 'N/A'}`);
        console.log(`   Model: gpt-image-1`);
        console.log(`   Quality: ${generator.defaultOptions.quality}`);
        console.log(`   Size: ${generator.defaultOptions.size}`);
        break;

      case 'generate-from-article':
        const fileFlag = args.find(arg => arg.startsWith('--file='));
        if (!fileFlag) {
          console.log('Usage: node ai-image-generator.js generate-from-article --file="path/to/article.mdx"');
          return;
        }

        const filePath = fileFlag.split('=')[1].replace(/['"]/g, '');
        const fullPath = path.resolve(filePath);

        try {
          const result = await generator.generateFromArticle(fullPath);

          console.log('\n✅ Dynamic Image Generation Complete:');
          console.log(`   Filename: ${result.filename}`);
          console.log(`   Local path: ${result.localPath}`);
          console.log(`   Cost: $${result.cost}`);
          console.log(`   Topics: ${result.extractedTopics.slice(0, 3).join(', ')}`);
          console.log(`   Technologies: ${result.extractedTech.slice(0, 3).join(', ')}`);
          console.log(`   Statistics: ${result.extractedStats.slice(0, 2).join(', ')}`);

        } catch (error) {
          console.error(`❌ Failed to generate image: ${error.message}`);
        }
        break;

      case 'stats':
        const stats = await generator.getUsageStats();
        console.log('\n📊 Usage Statistics:', stats);
        break;

      default:
        console.log(`
🎨 AI Image Generator - gpt-image-1 ONLY
Dynamic content-aware image generation for tech blog

Usage: node ai-image-generator.js <command> [options]

Commands:
  generate "prompt"                           - Generate single image from prompt
  generate-from-article --file="path.mdx"    - Generate contextual image from article
  stats                                       - Show usage statistics

Examples:
  node ai-image-generator.js generate "AI breakthrough visualization"
  node ai-image-generator.js generate-from-article --file="content/technology/ai-article.mdx"

Optimized Settings:
  - Size: 1536x1024 (blog header optimized)
  - Quality: HD ($0.08 per image)
  - Style: Vivid (engaging visuals)
  - Model: gpt-image-1 (latest OpenAI)
        `);
    }
  }

  run().catch(console.error);
}

module.exports = { AIImageGenerator };
