#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Map of correct images for each product
const imageMapping = {
  // iPhone models
  'iphone-16-pro-max': '/images/products/iphone-16-pro-hero.jpg',
  'iphone-16-pro': '/images/products/iphone-16-pro-hero.jpg', 
  'iphone-15-pro-max': '/images/products/iphone-15-pro-max-hero.jpg',
  'iphone-15-pro': '/images/products/iphone-15-pro-hero.jpg',
  
  // Samsung Galaxy models
  'samsung-galaxy-s25-ultra': '/images/products/samsung-galaxy-s24-hero.jpg', // Using S24 as placeholder for S25
  'samsung-galaxy-s24-ultra': '/images/products/samsung-galaxy-s24-hero.jpg',
  'samsung-galaxy-s24': '/images/products/samsung-galaxy-s24-hero.jpg',
  
  // Google Pixel models
  'google-pixel-9-pro': '/images/products/google-pixel-9-pro-hero.jpg',
  'google-pixel-8-pro': '/images/products/google-pixel-8-pro-hero.jpg',
  
  // Other brands
  'oneplus-12': '/images/products/oneplus-12-hero.jpg',
  'xiaomi-14-ultra': '/images/products/xiaomi-14-ultra-hero.jpg',
  'macbook-air-m3': '/images/products/macbook-air-m3-hero.jpg'
};

// Function to detect product from filename or content
function detectProduct(filename, content) {
  const lowerFilename = filename.toLowerCase();
  const lowerContent = content.toLowerCase();
  
  // Check filename first
  for (const [product, imagePath] of Object.entries(imageMapping)) {
    if (lowerFilename.includes(product.replace(/-/g, '-')) || 
        lowerFilename.includes(product.replace(/-/g, ''))) {
      return product;
    }
  }
  
  // Check content if not found in filename
  for (const [product, imagePath] of Object.entries(imageMapping)) {
    const searchTerms = product.split('-');
    let matches = 0;
    for (const term of searchTerms) {
      if (lowerContent.includes(term)) {
        matches++;
      }
    }
    if (matches >= searchTerms.length - 1) { // Allow one missing term
      return product;
    }
  }
  
  return null;
}

// Function to fix image paths in frontmatter
function fixImagePaths(content, correctImage) {
  let fixedContent = content;
  
  // Fix featured image
  fixedContent = fixedContent.replace(
    /(featured:\s*)\/images\/products\/[^\\n]+/g, 
    `$1${correctImage}`
  );
  
  // Fix main image field
  fixedContent = fixedContent.replace(
    /(image:\s*)\/images\/products\/[^\\n]+/g,
    `$1${correctImage}`
  );
  
  // Fix gallery images - replace all with the same correct image for now
  fixedContent = fixedContent.replace(
    /(gallery:\s*\n(?:\s*-\s*\/images\/products\/[^\\n]+\n)*)/g,
    (match) => {
      const lines = match.split('\n');
      const galleryHeader = lines[0];
      const imageCount = lines.length - 2; // Subtract header and empty line
      
      let newGallery = galleryHeader + '\n';
      for (let i = 0; i < Math.max(3, imageCount); i++) {
        newGallery += `    - ${correctImage}\n`;
      }
      return newGallery;
    }
  );
  
  return fixedContent;
}

// Function to recursively find all MDX files
function findMdxFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findMdxFiles(fullPath));
    } else if (item.endsWith('.mdx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Main function to fix all image issues
async function fixAllImages() {
  console.log('🖼️  Starting image fixes...');
  console.log('📋 This will fix mismatched product images and ensure relevance');
  
  try {
    const files = findMdxFiles('content');
    let fixedFiles = 0;
    let totalFixes = 0;
    
    for (const file of files) {
      console.log(`📝 Processing: ${file}`);
      
      const content = fs.readFileSync(file, 'utf8');
      const filename = path.basename(file, '.mdx');
      
      // Detect what product this article is about
      const detectedProduct = detectProduct(filename, content);
      
      if (detectedProduct && imageMapping[detectedProduct]) {
        const correctImage = imageMapping[detectedProduct];
        
        // Check if current images are wrong
        const currentImages = content.match(/\/images\/products\/[^\\s\\n"']+/g) || [];
        const needsFix = currentImages.some(img => img !== correctImage);
        
        if (needsFix) {
          const fixedContent = fixImagePaths(content, correctImage);
          fs.writeFileSync(file, fixedContent);
          
          console.log(`✅ Fixed images in ${file}`);
          console.log(`   Product: ${detectedProduct}`);
          console.log(`   Correct image: ${correctImage}`);
          
          fixedFiles++;
          totalFixes++;
        } else {
          console.log(`✨ Images already correct in ${file}`);
        }
      } else {
        console.log(`⚠️  Could not detect product for ${file} - manual review needed`);
      }
    }
    
    console.log(`\n🎉 Image fixes completed!`);
    console.log(`📊 Fixed images in ${fixedFiles} files`);
    console.log(`📁 Processed ${files.length} total files`);
    
    if (totalFixes > 0) {
      console.log(`\n🚀 Next steps to improve image quality:`);
      console.log(`1. Replace stock images with actual product photography`);
      console.log(`2. Add comparison charts and infographics`);
      console.log(`3. Include multiple angles and real-world usage photos`);
      console.log(`4. Ensure all images are 1200x800px minimum`);
    }
    
  } catch (error) {
    console.error('❌ Error fixing images:', error);
    process.exit(1);
  }
}

// Run the fixes
if (require.main === module) {
  fixAllImages();
}

module.exports = { fixAllImages, fixImagePaths, detectProduct };