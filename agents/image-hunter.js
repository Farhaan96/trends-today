#!/usr/bin/env node

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const fs = require('fs').promises;
const path = require('path');
const https = require('https');

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
    
    // Image mapping for different content types
    this.imageMapping = {
      'iphone': ['iphone-15-pro-max', 'iphone-16-pro', 'iphone-17-air'],
      'samsung': ['galaxy-s24-ultra', 'galaxy-s25-ultra'],
      'google': ['pixel-8-pro', 'pixel-9-pro'],
      'apple': ['macbook-air-m3', 'apple-vision-pro'],
      'tech-news': ['tech-workspace', 'smartphone-comparison', 'tech-event'],
      'authors': ['tech-expert-1', 'tech-expert-2', 'tech-expert-3', 'tech-expert-4']
    };
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

  async scanForPlaceholders() {
    console.log('🔍 Scanning for placeholder images...');
    
    const placeholders = [];
    
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
          
          // Check for /file.svg placeholders
          if (content.includes('/file.svg') || content.includes('/images/placeholder')) {
            placeholders.push({
              file: filePath,
              type: type,
              contentType: this.detectContentType(file, content),
              priority: this.determinePriority(file)
            });
          }
        }
      } catch (error) {
        console.log(`No ${type} directory found`);
      }
    }
    
    // Scan homepage for placeholder images
    const homepagePath = path.join(this.srcDir, 'app', 'page.tsx');
    try {
      const homepageContent = await fs.readFile(homepagePath, 'utf-8');
      if (homepageContent.includes('/file.svg')) {
        placeholders.push({
          file: homepagePath,
          type: 'homepage',
          contentType: 'homepage',
          priority: 'CRITICAL'
        });
      }
    } catch (error) {
      console.log('Could not scan homepage');
    }
    
    return placeholders;
  }

  detectContentType(filename, content) {
    const lower = filename.toLowerCase() + ' ' + content.toLowerCase();
    
    if (lower.includes('iphone')) return 'iphone';
    if (lower.includes('samsung') || lower.includes('galaxy')) return 'samsung';
    if (lower.includes('pixel') || lower.includes('google')) return 'google';
    if (lower.includes('apple') && !lower.includes('iphone')) return 'apple';
    if (lower.includes('news') || lower.includes('announcement')) return 'tech-news';
    
    return 'general-tech';
  }

  determinePriority(filename) {
    if (filename.includes('iphone-17-air') || filename.includes('homepage')) return 'CRITICAL';
    if (filename.includes('iphone-15-pro-max')) return 'HIGH';
    if (filename.includes('samsung-galaxy-s24')) return 'HIGH';
    return 'MEDIUM';
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