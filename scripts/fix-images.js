#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

// High-quality product images from reliable sources
const productImages = {
  'iphone-16-pro-hero.jpg': 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&h=500&fit=crop&crop=center',
  'iphone-15-pro-hero.jpg': 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&h=500&fit=crop&crop=center',
  'samsung-galaxy-s24-hero.jpg': 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&h=500&fit=crop&crop=center',
  'google-pixel-9-pro-hero.jpg': 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&h=500&fit=crop&crop=center',
  'macbook-air-m3-hero.jpg': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=500&fit=crop&crop=center'
};

const downloadImage = (url, filePath) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✅ Downloaded: ${path.basename(filePath)}`);
        resolve();
      });
    }).on('error', (error) => {
      fs.unlink(filePath, () => {}); // Delete partial file
      reject(error);
    });
  });
};

const fixImages = async () => {
  console.log('🔧 FIXING PRODUCT IMAGES');
  console.log('Downloading high-quality product images...\n');
  
  const imagesDir = path.join(__dirname, '../public/images/products');
  
  // Ensure directory exists
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  
  const promises = Object.entries(productImages).map(async ([filename, url]) => {
    const filePath = path.join(imagesDir, filename);
    
    try {
      await downloadImage(url, filePath);
    } catch (error) {
      console.error(`❌ Failed to download ${filename}:`, error.message);
    }
  });
  
  await Promise.all(promises);
  
  console.log('\n🎉 Image fixing complete!');
  console.log('All product images should now display properly.');
};

// Run if called directly
if (require.main === module) {
  fixImages().catch(console.error);
}

module.exports = { fixImages };