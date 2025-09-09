#!/usr/bin/env node

/**
 * Fix Duplicate Images Script
 * Replaces identical images with diverse, product-specific alternatives
 */

require('dotenv').config({ path: '.env.local' });

const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const crypto = require('crypto');

const { DiverseImageSourceManager } = require('../lib/diverse-image-sources');

class DuplicateImageFixer {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.imagesDir = path.join(this.projectRoot, 'public', 'images');
    this.reportDir = path.join(this.projectRoot, 'reports');
    
    this.diverseSource = new DiverseImageSourceManager();
    this.duplicateGroups = [];
    this.replacements = [];
    this.errors = [];
  }

  async run() {
    console.log('🎨 FIXING DUPLICATE IMAGES');
    console.log('=========================');
    console.log('Replacing identical images with diverse alternatives...\n');

    try {
      // Step 1: Find duplicate groups
      await this.findDuplicates();
      
      // Step 2: Download diverse replacements
      await this.downloadDiverseReplacements();
      
      // Step 3: Generate report
      await this.generateReport();
      
      console.log('\n🎉 DUPLICATE IMAGE FIXING COMPLETED!');
      console.log('====================================');
      console.log(`🔍 Duplicate groups found: ${this.duplicateGroups.length}`);
      console.log(`🖼️  Images replaced: ${this.replacements.length}`);
      console.log(`❌ Errors: ${this.errors.length}`);
      
    } catch (error) {
      console.error('Duplicate fixing failed:', error);
      process.exit(1);
    }
  }

  async findDuplicates() {
    console.log('🔍 Finding duplicate images...');
    
    // Get all image files with their hashes
    const imageFiles = await this.getAllImageFiles();
    const hashToFiles = new Map();
    
    for (const file of imageFiles) {
      try {
        const hash = await this.getFileHash(file);
        
        if (!hashToFiles.has(hash)) {
          hashToFiles.set(hash, []);
        }
        hashToFiles.get(hash).push(file);
      } catch (error) {
        console.warn(`Error hashing ${file}:`, error.message);
      }
    }
    
    // Find groups with more than one file (duplicates)
    for (const [hash, files] of hashToFiles.entries()) {
      if (files.length > 1) {
        this.duplicateGroups.push({
          hash,
          files: files.map(f => ({
            path: f,
            filename: path.basename(f),
            relativePath: path.relative(this.imagesDir, f)
          }))
        });
      }
    }
    
    console.log(`📊 Found ${this.duplicateGroups.length} duplicate groups`);
    
    // Show duplicate groups
    for (const group of this.duplicateGroups) {
      console.log(`\n📎 Duplicate Group (${group.files.length} files):`);
      for (const file of group.files) {
        console.log(`   - ${file.relativePath}`);
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

  async getFileHash(filePath) {
    const buffer = await fs.readFile(filePath);
    return crypto.createHash('md5').update(buffer).digest('hex');
  }

  async downloadDiverseReplacements() {
    console.log('\n🎨 Downloading diverse replacement images...');
    
    for (const group of this.duplicateGroups) {
      console.log(`\n🔄 Processing duplicate group: ${group.files[0].filename}`);
      
      // Keep the first file as-is, replace the others
      const filesToReplace = group.files.slice(1);
      
      for (const file of filesToReplace) {
        try {
          console.log(`   🖼️  Replacing: ${file.relativePath}`);
          
          // Get diverse image URL
          const imageUrl = this.diverseSource.getDiverseImageUrl(file.filename, {
            dimensions: { width: 1200, height: 800 },
            quality: 'high'
          });
          
          if (imageUrl) {
            // Download and replace
            await this.downloadAndReplace(imageUrl, file.path);
            
            this.replacements.push({
              originalFile: file.relativePath,
              newUrl: imageUrl,
              status: 'success'
            });
            
            console.log(`   ✅ Replaced with diverse image`);
          } else {
            console.log(`   ⚠️  No diverse replacement found, keeping original`);
          }
          
        } catch (error) {
          console.error(`   ❌ Error replacing ${file.relativePath}:`, error.message);
          this.errors.push({
            file: file.relativePath,
            error: error.message
          });
        }
      }
    }
  }

  async downloadAndReplace(imageUrl, targetPath) {
    return new Promise((resolve, reject) => {
      const https = require('https');
      const file = require('fs').createWriteStream(targetPath);
      
      const request = https.get(imageUrl, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          return this.downloadAndReplace(response.headers.location, targetPath)
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

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        duplicateGroupsFound: this.duplicateGroups.length,
        imagesReplaced: this.replacements.length,
        errors: this.errors.length,
        successRate: this.replacements.length / (this.replacements.length + this.errors.length) * 100
      },
      duplicateGroups: this.duplicateGroups,
      replacements: this.replacements,
      errors: this.errors,
      diverseSourceStats: this.diverseSource.getUsageStats()
    };
    
    const reportPath = path.join(this.reportDir, `duplicate-image-fix-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📄 Report saved: ${reportPath}`);
  }
}

// Run the fixer
if (require.main === module) {
  const fixer = new DuplicateImageFixer();
  fixer.run().catch(console.error);
}

module.exports = { DuplicateImageFixer };