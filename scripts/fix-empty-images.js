#!/usr/bin/env node

/**
 * Fix Empty Images Script
 * Replaces empty (0-byte) image files with working fallback images
 */

const fs = require('fs').promises;
const path = require('path');
const https = require('https');

class EmptyImageFixer {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.imagesDir = path.join(this.projectRoot, 'public', 'images');
    
    // Reliable fallback images that are known to work
    this.workingFallbacks = {
      'iphone-15-pro-max-titanium.jpg': 'https://images.unsplash.com/photo-1663519540056-77b1e31e2934?w=1200&h=800&fit=crop&q=85&auto=format',
      'iphone-15-pro-max-usbc.jpg': 'https://images.unsplash.com/photo-1625735113341-a3ae8e7d9c8b?w=1200&h=800&fit=crop&q=85&auto=format',
      'iphone-16-pro-max-a18-bionic.jpg': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=800&fit=crop&q=85&auto=format',
      'iphone-16-pro-max-battery-life.jpg': 'https://images.unsplash.com/photo-1625281147023-33eb69b4e79c?w=1200&h=800&fit=crop&q=85&auto=format',
      'nothing-phone-2-guide.jpg': 'https://images.unsplash.com/photo-1554775480-da8c9fbbf267?w=1200&h=800&fit=crop&q=85&auto=format',
      
      // Fix remaining duplicates with unique images
      'iphone-16-pro-hero.jpg': 'https://images.unsplash.com/photo-1674574124475-16dd78234342?w=1200&h=800&fit=crop&q=85&auto=format',
      'iphone-16-pro-max-titanium-hero.jpg': 'https://images.unsplash.com/photo-1689088262554-fb447b36b1e9?w=1200&h=800&fit=crop&q=85&auto=format'
    };
    
    this.fixes = [];
    this.errors = [];
  }

  async run() {
    console.log('🔧 FIXING EMPTY AND DUPLICATE IMAGES');
    console.log('====================================');

    try {
      // Find and fix empty files
      await this.findAndFixEmptyFiles();
      
      // Fix remaining duplicates
      await this.fixRemainingDuplicates();
      
      console.log('\n✅ EMPTY IMAGE FIXING COMPLETED!');
      console.log(`🖼️  Files fixed: ${this.fixes.length}`);
      console.log(`❌ Errors: ${this.errors.length}`);
      
    } catch (error) {
      console.error('Fix failed:', error);
      process.exit(1);
    }
  }

  async findAndFixEmptyFiles() {
    console.log('🔍 Finding empty image files...');
    
    const imageFiles = await this.getAllImageFiles();
    
    for (const file of imageFiles) {
      try {
        const stats = await fs.stat(file);
        
        if (stats.size === 0) {
          const filename = path.basename(file);
          console.log(`📄 Empty file found: ${filename}`);
          
          if (this.workingFallbacks[filename]) {
            console.log(`   🔄 Downloading replacement...`);
            await this.downloadImage(this.workingFallbacks[filename], file);
            
            this.fixes.push({
              file: filename,
              action: 'replaced_empty',
              url: this.workingFallbacks[filename]
            });
            
            console.log(`   ✅ Fixed empty file: ${filename}`);
          } else {
            console.log(`   ⚠️  No fallback available for: ${filename}`);
          }
        }
      } catch (error) {
        console.error(`Error checking ${file}:`, error.message);
      }
    }
  }

  async fixRemainingDuplicates() {
    console.log('\n🎨 Fixing remaining duplicate files...');
    
    const duplicateFiles = ['iphone-16-pro-hero.jpg', 'iphone-16-pro-max-titanium-hero.jpg'];
    
    for (const filename of duplicateFiles) {
      const filePath = path.join(this.imagesDir, 'products', filename);
      
      try {
        if (this.workingFallbacks[filename]) {
          console.log(`🔄 Replacing duplicate: ${filename}`);
          await this.downloadImage(this.workingFallbacks[filename], filePath);
          
          this.fixes.push({
            file: filename,
            action: 'replaced_duplicate',
            url: this.workingFallbacks[filename]
          });
          
          console.log(`✅ Fixed duplicate: ${filename}`);
        }
      } catch (error) {
        console.error(`Error fixing ${filename}:`, error.message);
        this.errors.push({
          file: filename,
          error: error.message
        });
      }
    }
  }

  async getAllImageFiles() {
    const imageFiles = [];
    
    async function scanDir(dir) {
      try {
        const items = await fs.readdir(dir, { withFileTypes: true });
        
        for (const item of items) {
          const fullPath = path.join(dir, item.name);
          
          if (item.isDirectory()) {
            await scanDir(fullPath);
          } else if (/\.(jpg|jpeg|png|webp)$/i.test(item.name)) {
            imageFiles.push(fullPath);
          }
        }
      } catch (error) {
        // Skip inaccessible directories
      }
    }
    
    await scanDir(this.imagesDir);
    return imageFiles;
  }

  async downloadImage(url, targetPath) {
    return new Promise((resolve, reject) => {
      const file = require('fs').createWriteStream(targetPath);
      
      const request = https.get(url, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          return this.downloadImage(response.headers.location, targetPath)
            .then(resolve)
            .catch(reject);
        }
        
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }
        
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          resolve();
        });
        
        file.on('error', reject);
      });
      
      request.on('error', reject);
      request.setTimeout(30000, () => {
        request.abort();
        reject(new Error('Download timeout'));
      });
    });
  }
}

// Run the fixer
if (require.main === module) {
  const fixer = new EmptyImageFixer();
  fixer.run().catch(console.error);
}

module.exports = { EmptyImageFixer };