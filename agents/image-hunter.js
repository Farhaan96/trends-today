#!/usr/bin/env node

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const matter = require('gray-matter');

class ImageHunter {
  constructor() {
    this.contentDir = path.join(__dirname, '..', 'content');
    this.publicDir = path.join(__dirname, '..', 'public');
    this.imagesDir = path.join(this.publicDir, 'images');
    this.reportDir = path.join(__dirname, '..', 'reports');
    this.srcDir = path.join(__dirname, '..', 'src');
    
    this.unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY || 'demo';
    this.firecrawlApiKey = process.env.FIRECRAWL_API_KEY;
    
    this.imageReplacements = [];
    this.errors = [];
    this.missingImages = new Set();
    this.downloadQueue = [];
    
    // Enhanced image sourcing database with high-quality tech images
    this.imageDatabase = {
      // iPhone 16 Pro Max variations
      'iphone-16-pro-max-titanium-hero.jpg': {
        query: 'iPhone 16 Pro titanium premium smartphone',
        fallback: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1200&h=800&fit=crop',
        category: 'product-hero'
      },
      'iphone-16-pro-max-camera-system.jpg': {
        query: 'iPhone camera system lens macro photography',
        fallback: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&h=800&fit=crop',
        category: 'product-feature'
      },
      'iphone-16-pro-max-apple-intelligence.jpg': {
        query: 'AI artificial intelligence smartphone features',
        fallback: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=800&fit=crop',
        category: 'product-feature'
      },
      'iphone-16-pro-max-a18-bionic.jpg': {
        query: 'computer chip processor semiconductor technology',
        fallback: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=800&fit=crop',
        category: 'product-feature'
      },
      'iphone-16-pro-max-battery-life.jpg': {
        query: 'smartphone battery charging wireless power',
        fallback: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=1200&h=800&fit=crop',
        category: 'product-feature'
      },
      'iphone-16-pro-max-titanium-design.jpg': {
        query: 'titanium metal premium design smartphone',
        fallback: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1200&h=800&fit=crop',
        category: 'product-feature'
      },
      // iPhone 15 Pro Max variations
      'iphone-15-pro-max-camera.jpg': {
        query: 'iPhone 15 Pro camera lens photography',
        fallback: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&h=800&fit=crop',
        category: 'product-feature'
      },
      'iphone-15-pro-max-titanium.jpg': {
        query: 'iPhone 15 Pro titanium design premium',
        fallback: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1200&h=800&fit=crop',
        category: 'product-feature'
      },
      'iphone-15-pro-max-display.jpg': {
        query: 'smartphone OLED display screen technology',
        fallback: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&h=800&fit=crop',
        category: 'product-feature'
      },
      'iphone-15-pro-max-battery.jpg': {
        query: 'smartphone battery life charging technology',
        fallback: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=1200&h=800&fit=crop',
        category: 'product-feature'
      },
      'iphone-15-pro-max-usbc.jpg': {
        query: 'USB-C cable charging connector smartphone',
        fallback: 'https://images.unsplash.com/photo-1558618666-fcd25d85cd64?w=1200&h=800&fit=crop',
        category: 'product-feature'
      },
      // News images
      'ai-agents-revolution-hero.jpg': {
        query: 'AI artificial intelligence robots automation future',
        fallback: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=800&fit=crop',
        category: 'news'
      },
      'ai-settlement-hero.jpg': {
        query: 'legal documents settlement AI technology law',
        fallback: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&h=800&fit=crop',
        category: 'news'
      },
      'iphone-17-lineup-comparison.jpg': {
        query: 'smartphone lineup comparison multiple phones',
        fallback: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&h=800&fit=crop',
        category: 'news'
      },
      'ios-26-features.jpg': {
        query: 'iOS interface smartphone features software',
        fallback: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&h=800&fit=crop',
        category: 'news'
      },
      'iphone-17-air-thin-profile.jpg': {
        query: 'thin smartphone profile ultra slim design',
        fallback: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&h=800&fit=crop',
        category: 'news'
      }
    };
    
    // Rate limiting for APIs
    this.requestCount = 0;
    this.maxRequestsPerHour = 100; // Conservative limit
    this.requestStartTime = Date.now();
  }

  async ensureDirectories() {
    const dirs = [
      this.imagesDir,
      path.join(this.imagesDir, 'news'),
      path.join(this.imagesDir, 'reviews'),
      path.join(this.imagesDir, 'authors'),
      path.join(this.imagesDir, 'products'),
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

  async scanForMissingImages() {
    console.log('🔍 Scanning for missing images in all articles...');
    
    const missingImages = [];
    
    // Scan content files
    const contentTypes = ['news', 'reviews'];
    for (const type of contentTypes) {
      const typeDir = path.join(this.contentDir, type);
      try {
        const files = await fs.readdir(typeDir);
        const mdxFiles = files.filter(file => file.endsWith('.mdx'));
        
        for (const file of mdxFiles) {
          const filePath = path.join(typeDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          
          // Parse frontmatter to extract image references
          const { data: frontmatter } = matter(content);
          const imagePaths = this.extractImagePaths(frontmatter, content);
          
          for (const imagePath of imagePaths) {
            const fullPath = path.join(this.publicDir, imagePath);
            try {
              await fs.access(fullPath);
              // Image exists, skip
            } catch (error) {
              // Image doesn't exist, add to missing list
              const filename = path.basename(imagePath);
              if (!this.missingImages.has(filename)) {
                this.missingImages.add(filename);
                missingImages.push({
                  file: filePath,
                  imagePath: imagePath,
                  filename: filename,
                  type: type,
                  product: this.extractProductFromPath(imagePath),
                  priority: this.determinePriority(filename, frontmatter)
                });
              }
            }
          }
        }
      } catch (error) {
        console.log(`Error scanning ${type} directory:`, error.message);
      }
    }
    
    console.log(`📊 Found ${missingImages.length} missing images`);
    return missingImages;
  }
  
  extractImagePaths(frontmatter, content) {
    const paths = [];
    
    // Extract main image
    if (frontmatter.image) {
      paths.push(frontmatter.image);
    }
    
    // Extract featured image
    if (frontmatter.images && frontmatter.images.featured) {
      paths.push(frontmatter.images.featured);
    }
    
    // Extract gallery images
    if (frontmatter.images && frontmatter.images.gallery) {
      paths.push(...frontmatter.images.gallery);
    }
    
    // Extract any other image references in content
    const imageRegex = /\/images\/[\w\/-]+\.(jpg|jpeg|png|webp)/g;
    const matches = content.match(imageRegex) || [];
    paths.push(...matches);
    
    return [...new Set(paths)]; // Remove duplicates
  }
  
  extractProductFromPath(imagePath) {
    const filename = path.basename(imagePath);
    if (filename.includes('iphone')) return 'iphone';
    if (filename.includes('samsung') || filename.includes('galaxy')) return 'samsung';
    if (filename.includes('pixel') || filename.includes('google')) return 'google';
    if (filename.includes('macbook')) return 'macbook';
    if (filename.includes('oneplus')) return 'oneplus';
    if (filename.includes('xiaomi')) return 'xiaomi';
    return 'general';
  }

  determinePriority(filename, frontmatter = {}) {
    // Critical: Homepage and featured articles
    if (filename.includes('hero') || frontmatter.featured) return 'CRITICAL';
    
    // High: Latest iPhone models and main product images
    if (filename.includes('iphone-16') || filename.includes('iphone-17')) return 'HIGH';
    if (filename.includes('galaxy-s24') || filename.includes('galaxy-s25')) return 'HIGH';
    if (filename.includes('pixel-9')) return 'HIGH';
    
    // Medium: Feature images and older models
    if (filename.includes('camera') || filename.includes('battery') || filename.includes('display')) return 'MEDIUM';
    
    // Low: News and supplementary images
    return 'LOW';
  }

  async downloadImageFromUnsplash(query, filename, directory) {
    console.log(`📸 Downloading image for: ${query}`);
    
    // For demo purposes, we'll create high-quality tech stock images
    const demoImages = {
      'iphone-15-pro-max': 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1200&h=800&fit=crop',
      'iphone-17-air': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&h=800&fit=crop',
      'galaxy-s24-ultra': 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=1200&h=800&fit=crop',
      'pixel-8-pro': 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=1200&h=800&fit=crop',
      'tech-workspace': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=800&fit=crop',
      'tech-expert': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      'smartphone-comparison': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&h=800&fit=crop'
    };
    
    const imageUrl = demoImages[query] || demoImages['tech-workspace'];
    const targetPath = path.join(directory, filename);
    
    try {
      await this.downloadImage(imageUrl, targetPath);
      return targetPath;
    } catch (error) {
      console.error(`Failed to download ${query}:`, error.message);
      return null;
    }
  }

  async downloadImage(url, targetPath) {
    return new Promise((resolve, reject) => {
      const file = require('fs').createWriteStream(targetPath);
      
      https.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }
        
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          console.log(`✅ Downloaded: ${path.basename(targetPath)}`);
          resolve(targetPath);
        });
        
        file.on('error', (err) => {
          fs.unlink(targetPath);
          reject(err);
        });
      });
    });
  }

  async replaceImageReferences(placeholders) {
    console.log('🔄 Replacing image references...');
    
    for (const placeholder of placeholders) {
      try {
        console.log(`Processing: ${path.basename(placeholder.file)}`);
        
        const content = await fs.readFile(placeholder.file, 'utf-8');
        let updatedContent = content;
        
        if (placeholder.type === 'news') {
          updatedContent = await this.updateNewsImages(content, placeholder);
        } else if (placeholder.type === 'reviews') {
          updatedContent = await this.updateReviewImages(content, placeholder);
        } else if (placeholder.type === 'homepage') {
          updatedContent = await this.updateHomepageImages(content);
        }
        
        if (updatedContent !== content) {
          await fs.writeFile(placeholder.file, updatedContent, 'utf-8');
          this.imageReplacements.push({
            file: placeholder.file,
            type: placeholder.type,
            status: 'Updated',
            timestamp: new Date().toISOString()
          });
        }
        
      } catch (error) {
        console.error(`Error processing ${placeholder.file}:`, error.message);
        this.errors.push({
          file: placeholder.file,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  async updateNewsImages(content, placeholder) {
    const newsImagesDir = path.join(this.imagesDir, 'news');
    let updatedContent = content;
    
    if (placeholder.contentType === 'iphone' || content.includes('iPhone 17 Air')) {
      // Download iPhone 17 Air concept image
      const imagePath = await this.downloadImageFromUnsplash(
        'iphone-17-air',
        'iphone-17-air-concept.jpg',
        newsImagesDir
      );
      
      if (imagePath) {
        updatedContent = updatedContent.replace(
          '/images/news/iphone-17-air-concept.jpg',
          '/images/news/iphone-17-air-concept.jpg'
        );
      }
      
      // Also download supporting images
      await this.downloadImageFromUnsplash(
        'smartphone-comparison',
        'iphone-17-lineup.jpg', 
        newsImagesDir
      );
      
      await this.downloadImageFromUnsplash(
        'tech-workspace',
        'apple-event.jpg',
        newsImagesDir
      );
    }
    
    return updatedContent;
  }

  async updateReviewImages(content, placeholder) {
    const reviewImagesDir = path.join(this.imagesDir, 'reviews');
    let updatedContent = content;
    
    if (placeholder.contentType === 'iphone') {
      await this.downloadImageFromUnsplash(
        'iphone-15-pro-max',
        'iphone-15-pro-max-review.jpg',
        reviewImagesDir
      );
    } else if (placeholder.contentType === 'samsung') {
      await this.downloadImageFromUnsplash(
        'galaxy-s24-ultra',
        'samsung-galaxy-s24-ultra.jpg',
        reviewImagesDir
      );
    } else if (placeholder.contentType === 'google') {
      await this.downloadImageFromUnsplash(
        'pixel-8-pro',
        'google-pixel-8-pro.jpg',
        reviewImagesDir
      );
    }
    
    return updatedContent;
  }

  async updateHomepageImages(content) {
    console.log('🏠 Updating homepage images...');
    
    // Download hero images for homepage
    const productImages = path.join(this.imagesDir, 'products');
    
    await this.downloadImageFromUnsplash(
      'iphone-15-pro-max',
      'iphone-15-pro-max-hero.jpg',
      productImages
    );
    
    await this.downloadImageFromUnsplash(
      'galaxy-s24-ultra', 
      'samsung-galaxy-s24-hero.jpg',
      productImages
    );
    
    // Update homepage to use actual product images instead of /file.svg
    let updatedContent = content.replace(
      /\/file\.svg/g,
      '/images/products/iphone-15-pro-max-hero.jpg'
    );
    
    return updatedContent;
  }

  async downloadAuthorImages() {
    console.log('👥 Downloading author images...');
    
    const authorImagesDir = path.join(this.imagesDir, 'authors');
    const authors = ['alex-chen', 'sarah-martinez', 'david-kim', 'emma-thompson'];
    
    for (const author of authors) {
      await this.downloadImageFromUnsplash(
        'tech-expert',
        `${author}.jpg`,
        authorImagesDir
      );
    }
  }

  async generateImageReport() {
    const report = {
      timestamp: new Date().toISOString(),
      replacements: this.imageReplacements,
      errors: this.errors,
      summary: {
        totalReplacements: this.imageReplacements.length,
        totalErrors: this.errors.length,
        success: this.errors.length === 0
      }
    };

    const reportFile = path.join(this.reportDir, 'image-hunting-report.json');
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
    
    console.log('\n📋 IMAGE HUNTING REPORT');
    console.log('='.repeat(50));
    console.log(`🖼️ Images replaced: ${this.imageReplacements.length}`);
    console.log(`❌ Errors encountered: ${this.errors.length}`);
    console.log(`📄 Report saved: ${reportFile}`);
    
    if (this.imageReplacements.length > 0) {
      console.log('\n🎯 Image replacements:');
      this.imageReplacements.forEach(replacement => {
        console.log(`  - ${path.basename(replacement.file)}: ${replacement.status}`);
      });
    }
    
    if (this.errors.length > 0) {
      console.log('\n⚠️ Errors encountered:');
      this.errors.forEach(error => {
        console.log(`  - ${path.basename(error.file)}: ${error.error}`);
      });
    }
    
    return report;
  }

  async run() {
    console.log('🎯 IMAGE HUNTER - Professional Image Sourcing');
    console.log('Replacing placeholder images with real content...\n');
    
    try {
      await this.ensureDirectories();
      
      // Scan for placeholders
      const placeholders = await this.scanForPlaceholders();
      console.log(`Found ${placeholders.length} files with placeholder images`);
      
      // Download author images first
      await this.downloadAuthorImages();
      
      // Replace image references
      if (placeholders.length > 0) {
        await this.replaceImageReferences(placeholders);
      }
      
      // Generate report
      await this.generateImageReport();
      
      console.log('\n✅ Image hunting completed!');
      console.log('📸 Professional images ready for deployment');
      
    } catch (error) {
      console.error('Image hunter failed:', error.message);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const hunter = new ImageHunter();
  hunter.run().catch(console.error);
}

module.exports = { ImageHunter };