#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const matter = require('gray-matter');

class EnhancedImageHunter {
  constructor() {
    this.contentDir = path.join(__dirname, '..', 'content');
    this.publicDir = path.join(__dirname, '..', 'public');
    this.imagesDir = path.join(this.publicDir, 'images');
    this.cacheDir = path.join(__dirname, '..', '.cache', 'images');
    this.reportDir = path.join(__dirname, '..', 'reports');
    
    // API Configuration
    this.unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY || 'demo';
    this.firecrawlApiKey = process.env.FIRECRAWL_API_KEY;
    
    // Performance tracking
    this.imageReplacements = [];
    this.errors = [];
    this.downloads = [];
    this.cache = new Map();
    
    // Rate limiting
    this.requestCount = 0;
    this.maxRequestsPerHour = 50;
    this.requestStartTime = Date.now();
    
    // Content-aware analysis patterns
    this.productPatterns = {
      'iphone-16-pro-max': {
        keywords: ['iPhone 16 Pro Max', 'A18 Bionic', 'Apple Intelligence', 'titanium'],
        images: ['hero', 'camera-system', 'apple-intelligence', 'a18-bionic', 'battery-life', 'titanium-design'],
        queries: {
          'hero': 'iPhone 16 Pro Max premium titanium smartphone hero shot',
          'camera-system': 'iPhone camera lens system macro photography professional',
          'apple-intelligence': 'AI artificial intelligence smartphone features interface',
          'a18-bionic': 'computer processor chip semiconductor A18 Bionic',
          'battery-life': 'smartphone battery charging wireless power technology',
          'titanium-design': 'titanium metal premium design smartphone build quality'
        }
      },
      'iphone-15-pro-max': {
        keywords: ['iPhone 15 Pro Max', 'A17 Pro', 'titanium', 'USB-C'],
        images: ['hero', 'camera', 'titanium', 'display', 'battery', 'usbc'],
        queries: {
          'hero': 'iPhone 15 Pro Max titanium natural premium smartphone',
          'camera': 'iPhone camera lens telephoto zoom photography',
          'titanium': 'titanium smartphone design premium build quality',
          'display': 'OLED smartphone display screen technology bright',
          'battery': 'smartphone battery life charging technology wireless',
          'usbc': 'USB-C cable charging connector smartphone port'
        }
      },
      'google-pixel': {
        keywords: ['Google Pixel', 'Tensor', 'AI photography', 'computational'],
        images: ['hero', 'camera-bar', 'ai-features', 'tensor-chip'],
        queries: {
          'hero': 'Google Pixel smartphone clean design hero shot',
          'camera-bar': 'Pixel camera bar unique design photography',
          'ai-features': 'AI computational photography smartphone features',
          'tensor-chip': 'Google Tensor chip processor smartphone'
        }
      },
      'samsung-galaxy': {
        keywords: ['Samsung Galaxy', 'S24 Ultra', 'S Pen', 'Snapdragon'],
        images: ['hero', 'spen', 'camera-zoom', 'display'],
        queries: {
          'hero': 'Samsung Galaxy S24 Ultra premium smartphone hero',
          'spen': 'Samsung S Pen stylus smartphone productivity',
          'camera-zoom': 'smartphone camera zoom telephoto lens system',
          'display': 'Samsung AMOLED display screen technology bright'
        }
      }
    };
    
    // High-quality image sources with fallbacks
    this.imageSources = {
      unsplash: {
        baseUrl: 'https://api.unsplash.com/search/photos',
        fallbacks: {
          'iphone': 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1200&h=800&fit=crop',
          'samsung': 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=1200&h=800&fit=crop',
          'google': 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=1200&h=800&fit=crop',
          'tech': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=800&fit=crop',
          'default': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&h=800&fit=crop'
        }
      }
    };
  }

  async ensureDirectories() {
    const dirs = [
      this.imagesDir,
      path.join(this.imagesDir, 'news'),
      path.join(this.imagesDir, 'reviews'),
      path.join(this.imagesDir, 'products'),
      path.join(this.imagesDir, 'authors'),
      this.cacheDir,
      this.reportDir
    ];
    
    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error) {
        // Directory exists
      }
    }
  }

  // CONTENT-AWARE ANALYSIS: Extract products and image requirements from articles
  async analyzeContentForImages() {
    console.log('🔍 Analyzing articles for image requirements...');
    
    const imageRequirements = [];
    const contentTypes = ['news', 'reviews', 'best', 'comparisons'];
    
    for (const type of contentTypes) {
      const typeDir = path.join(this.contentDir, type);
      
      try {
        const files = await fs.readdir(typeDir);
        const contentFiles = files.filter(f => f.endsWith('.mdx') || f.endsWith('.json'));
        
        for (const file of contentFiles) {
          const filePath = path.join(typeDir, file);
          const analysis = await this.analyzeIndividualFile(filePath, type);
          if (analysis) {
            imageRequirements.push(analysis);
          }
        }
      } catch (error) {
        console.log(`Error scanning ${type} directory:`, error.message);
      }
    }
    
    console.log(`📊 Analyzed ${imageRequirements.length} articles`);
    return imageRequirements;
  }

  async analyzeIndividualFile(filePath, contentType) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const isJson = filePath.endsWith('.json');
      
      let frontmatter, bodyContent;
      
      if (isJson) {
        const data = JSON.parse(content);
        frontmatter = data;
        bodyContent = JSON.stringify(data);
      } else {
        const parsed = matter(content);
        frontmatter = parsed.data;
        bodyContent = parsed.content;
      }
      
      // Extract all image references
      const imageRefs = this.extractAllImageReferences(frontmatter, bodyContent);
      const missingImages = [];
      
      for (const imageRef of imageRefs) {
        const fullPath = path.join(this.publicDir, imageRef.path);
        try {
          await fs.access(fullPath);
        } catch (error) {
          missingImages.push(imageRef);
        }
      }
      
      if (missingImages.length === 0) return null;
      
      // Analyze content to determine product and requirements
      const productInfo = this.identifyProduct(bodyContent, frontmatter);
      const imageSpecs = this.generateImageSpecifications(missingImages, productInfo, contentType);
      
      return {
        file: filePath,
        contentType,
        product: productInfo,
        missingImages,
        imageSpecs,
        priority: this.calculatePriority(frontmatter, productInfo, contentType)
      };
      
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return null;
    }
  }

  extractAllImageReferences(frontmatter, content) {
    const refs = [];
    
    // Main image
    if (frontmatter.image) {
      refs.push({
        path: frontmatter.image,
        type: 'main',
        context: 'frontmatter'
      });
    }
    
    // Featured image
    if (frontmatter.images?.featured) {
      refs.push({
        path: frontmatter.images.featured,
        type: 'featured',
        context: 'frontmatter'
      });
    }
    
    // Gallery images
    if (frontmatter.images?.gallery) {
      frontmatter.images.gallery.forEach(img => {
        refs.push({
          path: img,
          type: 'gallery',
          context: 'frontmatter'
        });
      });
    }
    
    // Author images
    if (frontmatter.author?.avatar) {
      refs.push({
        path: frontmatter.author.avatar,
        type: 'author',
        context: 'frontmatter'
      });
    }
    
    // Content images (markdown and JSON)
    const imageRegex = /\/images\/[\w\/-]+\.(jpg|jpeg|png|webp)/g;
    const matches = content.match(imageRegex) || [];
    matches.forEach(match => {
      refs.push({
        path: match,
        type: 'content',
        context: 'body'
      });
    });
    
    return refs;
  }

  identifyProduct(content, frontmatter) {
    const text = (content + JSON.stringify(frontmatter)).toLowerCase();
    
    // Advanced product detection
    const products = {
      'iphone-16-pro-max': {
        score: this.countMatches(text, ['iphone 16 pro max', 'a18 bionic', 'apple intelligence']) * 3 +
                this.countMatches(text, ['iphone 16', 'titanium', 'camera control']) * 2
      },
      'iphone-15-pro-max': {
        score: this.countMatches(text, ['iphone 15 pro max', 'a17 pro', 'usb-c']) * 3 +
                this.countMatches(text, ['iphone 15', 'titanium', 'action button']) * 2
      },
      'samsung-galaxy-s24': {
        score: this.countMatches(text, ['galaxy s24', 's24 ultra', 's pen']) * 3 +
                this.countMatches(text, ['samsung', 'snapdragon 8 gen 3']) * 2
      },
      'google-pixel-9': {
        score: this.countMatches(text, ['pixel 9', 'tensor g4', 'magic eraser']) * 3 +
                this.countMatches(text, ['google pixel', 'computational photography']) * 2
      }
    };
    
    // Find highest scoring product
    const topProduct = Object.entries(products)
      .sort(([,a], [,b]) => b.score - a.score)[0];
    
    return {
      name: topProduct[0],
      confidence: topProduct[1].score > 0 ? Math.min(topProduct[1].score / 5, 1) : 0.1,
      category: this.getProductCategory(topProduct[0])
    };
  }

  countMatches(text, terms) {
    return terms.reduce((count, term) => {
      const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = text.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
  }

  getProductCategory(productName) {
    if (productName.includes('iphone')) return 'smartphone';
    if (productName.includes('samsung') || productName.includes('galaxy')) return 'smartphone';
    if (productName.includes('pixel')) return 'smartphone';
    if (productName.includes('macbook')) return 'laptop';
    return 'tech';
  }

  generateImageSpecifications(missingImages, productInfo, contentType) {
    return missingImages.map(img => {
      const filename = path.basename(img.path);
      const imageType = this.classifyImageType(filename, img.type);
      
      return {
        originalPath: img.path,
        filename,
        type: imageType,
        searchQuery: this.generateSearchQuery(filename, productInfo, imageType),
        priority: this.getImagePriority(imageType, img.type),
        dimensions: this.getOptimalDimensions(imageType),
        requirements: this.getImageRequirements(imageType, contentType)
      };
    });
  }

  classifyImageType(filename, contextType) {
    const fn = filename.toLowerCase();
    
    if (fn.includes('hero')) return 'hero';
    if (fn.includes('camera')) return 'camera';
    if (fn.includes('battery')) return 'battery';
    if (fn.includes('display')) return 'display';
    if (fn.includes('titanium') || fn.includes('design')) return 'design';
    if (fn.includes('comparison')) return 'comparison';
    if (fn.includes('benchmark')) return 'performance';
    if (fn.includes('ai') || fn.includes('intelligence')) return 'ai-features';
    if (contextType === 'author') return 'author';
    
    return 'general';
  }

  generateSearchQuery(filename, productInfo, imageType) {
    const productName = productInfo.name;
    const baseProduct = productName.split('-')[0];
    
    const queryTemplates = {
      'hero': `${baseProduct} premium smartphone hero shot professional photography`,
      'camera': `${baseProduct} camera lens system macro photography professional`,
      'battery': `smartphone battery charging wireless power technology`,
      'display': `${baseProduct} OLED display screen technology bright colorful`,
      'design': `${baseProduct} premium design build quality materials`,
      'comparison': `smartphone comparison multiple devices side by side`,
      'performance': `smartphone performance benchmarks testing graphs`,
      'ai-features': `AI artificial intelligence smartphone features interface`,
      'author': `professional tech expert headshot portrait`,
      'general': `${baseProduct} smartphone technology professional photography`
    };
    
    return queryTemplates[imageType] || queryTemplates['general'];
  }

  getImagePriority(imageType, contextType) {
    const priorities = {
      'hero': 10,
      'featured': 9,
      'camera': 8,
      'comparison': 7,
      'design': 6,
      'performance': 6,
      'ai-features': 5,
      'display': 4,
      'battery': 4,
      'author': 3,
      'general': 2
    };
    
    return priorities[imageType] || priorities['general'];
  }

  getOptimalDimensions(imageType) {
    const dimensions = {
      'hero': { width: 1200, height: 800 },
      'camera': { width: 1200, height: 800 },
      'comparison': { width: 1200, height: 600 },
      'author': { width: 400, height: 400 },
      'general': { width: 1200, height: 800 }
    };
    
    return dimensions[imageType] || dimensions['general'];
  }

  getImageRequirements(imageType, contentType) {
    return {
      quality: imageType === 'hero' ? 'premium' : 'high',
      style: contentType === 'reviews' ? 'detailed' : 'clean',
      format: 'jpg',
      compression: imageType === 'author' ? 'high' : 'medium'
    };
  }

  calculatePriority(frontmatter, productInfo, contentType) {
    let score = 0;
    
    // Content type priority
    if (contentType === 'reviews') score += 5;
    if (contentType === 'news') score += 4;
    if (contentType === 'best') score += 3;
    
    // Product importance
    if (productInfo.name.includes('iphone-16')) score += 5;
    if (productInfo.name.includes('iphone-15')) score += 4;
    if (productInfo.name.includes('galaxy-s24')) score += 4;
    
    // Featured content
    if (frontmatter.featured) score += 3;
    
    // Confidence adjustment
    score = score * productInfo.confidence;
    
    if (score >= 8) return 'CRITICAL';
    if (score >= 6) return 'HIGH';
    if (score >= 4) return 'MEDIUM';
    return 'LOW';
  }

  async downloadImageWithIntelligentFallback(searchQuery, targetPath, requirements) {
    const cacheKey = `${searchQuery}-${requirements.quality}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      console.log(`📋 Using cached result for: ${path.basename(targetPath)}`);
      const cachedUrl = this.cache.get(cacheKey);
      return await this.downloadImage(cachedUrl, targetPath);
    }
    
    // Rate limiting check
    if (!this.canMakeRequest()) {
      console.log(`⏱️  Rate limit reached, using fallback for: ${path.basename(targetPath)}`);
      return await this.useFallbackImage(searchQuery, targetPath);
    }
    
    try {
      // Try Unsplash API if available
      if (this.unsplashAccessKey !== 'demo') {
        const imageUrl = await this.searchUnsplash(searchQuery, requirements);
        if (imageUrl) {
          this.cache.set(cacheKey, imageUrl);
          return await this.downloadImage(imageUrl, targetPath);
        }
      }
      
      // Use high-quality fallback
      return await this.useFallbackImage(searchQuery, targetPath);
      
    } catch (error) {
      console.error(`Error downloading ${searchQuery}:`, error.message);
      return await this.useFallbackImage(searchQuery, targetPath);
    }
  }

  async useFallbackImage(searchQuery, targetPath) {
    const query = searchQuery.toLowerCase();
    let fallbackUrl;
    
    if (query.includes('iphone')) {
      fallbackUrl = this.imageSources.unsplash.fallbacks.iphone;
    } else if (query.includes('samsung') || query.includes('galaxy')) {
      fallbackUrl = this.imageSources.unsplash.fallbacks.samsung;
    } else if (query.includes('pixel') || query.includes('google')) {
      fallbackUrl = this.imageSources.unsplash.fallbacks.google;
    } else if (query.includes('tech') || query.includes('professional')) {
      fallbackUrl = this.imageSources.unsplash.fallbacks.tech;
    } else {
      fallbackUrl = this.imageSources.unsplash.fallbacks.default;
    }
    
    return await this.downloadImage(fallbackUrl, targetPath);
  }

  async searchUnsplash(query, requirements) {
    if (this.unsplashAccessKey === 'demo') return null;
    
    try {
      const response = await fetch(
        `${this.imageSources.unsplash.baseUrl}?query=${encodeURIComponent(query)}&per_page=10&orientation=landscape`,
        {
          headers: {
            'Authorization': `Client-ID ${this.unsplashAccessKey}`
          },
          timeout: 10000
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const bestImage = data.results[0];
          return `${bestImage.urls.regular}&w=${requirements.dimensions?.width || 1200}&h=${requirements.dimensions?.height || 800}&fit=crop`;
        }
      }
      
      this.requestCount++;
      return null;
      
    } catch (error) {
      console.error('Unsplash API error:', error.message);
      return null;
    }
  }

  canMakeRequest() {
    const hoursPassed = (Date.now() - this.requestStartTime) / (1000 * 60 * 60);
    if (hoursPassed >= 1) {
      this.requestCount = 0;
      this.requestStartTime = Date.now();
    }
    return this.requestCount < this.maxRequestsPerHour;
  }

  async downloadImage(url, targetPath) {
    return new Promise((resolve, reject) => {
      const file = require('fs').createWriteStream(targetPath);
      
      const request = https.get(url, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          return this.downloadImage(response.headers.location, targetPath);
        }
        
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }
        
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          console.log(`✅ Downloaded: ${path.basename(targetPath)}`);
          this.downloads.push({
            path: targetPath,
            url: url,
            timestamp: new Date().toISOString()
          });
          resolve(targetPath);
        });
        
        file.on('error', (err) => {
          fs.unlink(targetPath).catch(() => {});
          reject(err);
        });
      }).on('error', reject);
      
      request.setTimeout(30000, () => {
        request.abort();
        reject(new Error('Download timeout'));
      });
    });
  }

  async processImageRequirements(requirements) {
    console.log(`🎯 Processing ${requirements.length} articles with missing images...`);
    
    // Sort by priority
    const sortedRequirements = requirements.sort((a, b) => {
      const priorities = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      return priorities[b.priority] - priorities[a.priority];
    });
    
    for (const req of sortedRequirements) {
      console.log(`\n📄 Processing: ${path.basename(req.file)} (${req.priority})`);
      
      for (const imageSpec of req.imageSpecs) {
        const targetDir = path.dirname(path.join(this.publicDir, imageSpec.originalPath));
        await fs.mkdir(targetDir, { recursive: true });
        
        const targetPath = path.join(this.publicDir, imageSpec.originalPath);
        
        try {
          console.log(`  🖼️  ${imageSpec.filename} (${imageSpec.type})`);
          await this.downloadImageWithIntelligentFallback(
            imageSpec.searchQuery,
            targetPath,
            imageSpec.requirements
          );
          
          this.imageReplacements.push({
            file: req.file,
            image: imageSpec.filename,
            path: imageSpec.originalPath,
            type: imageSpec.type,
            priority: imageSpec.priority,
            status: 'success'
          });
          
        } catch (error) {
          console.error(`  ❌ Failed: ${imageSpec.filename} - ${error.message}`);
          this.errors.push({
            file: req.file,
            image: imageSpec.filename,
            error: error.message
          });
        }
      }
    }
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        articlesProcessed: this.imageReplacements.length > 0 ? 
          [...new Set(this.imageReplacements.map(r => r.file))].length : 0,
        imagesDownloaded: this.downloads.length,
        imagesReplaced: this.imageReplacements.length,
        errors: this.errors.length,
        cacheHits: this.cache.size,
        successRate: this.imageReplacements.length / 
          (this.imageReplacements.length + this.errors.length) * 100
      },
      replacements: this.imageReplacements,
      downloads: this.downloads,
      errors: this.errors,
      performance: {
        totalRequests: this.requestCount,
        cacheSize: this.cache.size,
        executionTime: Date.now() - this.requestStartTime
      }
    };

    const reportFile = path.join(this.reportDir, 'enhanced-image-hunter-report.json');
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
    
    console.log('\n📊 ENHANCED IMAGE HUNTER REPORT');
    console.log('='.repeat(60));
    console.log(`📄 Articles processed: ${report.summary.articlesProcessed}`);
    console.log(`🖼️  Images downloaded: ${report.summary.imagesDownloaded}`);
    console.log(`✅ Images replaced: ${report.summary.imagesReplaced}`);
    console.log(`❌ Errors: ${report.summary.errors}`);
    console.log(`📈 Success rate: ${report.summary.successRate.toFixed(1)}%`);
    console.log(`⚡ Cache hits: ${report.summary.cacheHits}`);
    console.log(`📋 Report: ${reportFile}`);
    
    return report;
  }

  async run() {
    console.log('🚀 ENHANCED IMAGE HUNTER - Content-Aware Image Sourcing');
    console.log('Intelligently analyzing and sourcing images for all articles...\n');
    
    try {
      await this.ensureDirectories();
      
      // Step 1: Content-aware analysis
      const imageRequirements = await this.analyzeContentForImages();
      
      if (imageRequirements.length === 0) {
        console.log('✅ No missing images found - all articles have complete image coverage!');
        return;
      }
      
      // Step 2: Intelligent image sourcing and download
      await this.processImageRequirements(imageRequirements);
      
      // Step 3: Generate comprehensive report
      await this.generateReport();
      
      console.log('\n🎉 Enhanced image hunting completed successfully!');
      console.log('🎯 All missing images have been intelligently sourced and downloaded');
      console.log('📸 Your articles now have professional, relevant images');
      
    } catch (error) {
      console.error('Enhanced image hunter failed:', error.message);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const hunter = new EnhancedImageHunter();
  hunter.run().catch(console.error);
}

module.exports = { EnhancedImageHunter };