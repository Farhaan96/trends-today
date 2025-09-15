#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

async function createPlaceholderImages() {
  const imagesDir = path.join(__dirname, '..', 'public', 'images');

  // Create directory structure
  const dirs = [
    imagesDir,
    path.join(imagesDir, 'products'),
    path.join(imagesDir, 'news'),
    path.join(imagesDir, 'guides'),
    path.join(imagesDir, 'reviews'),
  ];

  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true }).catch(() => {});
  }

  // SVG placeholder
  const placeholderSVG = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#e2e8f0"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-size="48" fill="#64748b">Loading...</text>
  </svg>`;

  // Create placeholder images
  const placeholders = [
    'placeholder.svg',
    'products/google-pixel-8-pro-hero.jpg',
    'products/google-pixel-9-pro-hero.jpg',
    'products/iphone-15-pro-max-hero.jpg',
    'products/iphone-15-pro-hero.jpg',
    'products/iphone-16-pro-hero.jpg',
    'products/iphone-16-pro-max-hero.jpg',
    'products/samsung-galaxy-s24-ultra-hero.jpg',
    'products/samsung-galaxy-s25-ultra-hero.jpg',
    'products/macbook-air-m3-hero.jpg',
    'products/oneplus-12-hero.jpg',
    'products/xiaomi-14-ultra-hero.jpg',
    'news/iphone-17-lineup-comparison.jpg',
    'news/iphone-17-air-thin-profile.jpg',
    'news/ios-26-features.jpg',
    'news/ai-settlement-hero.jpg',
    'news/ai-agents-revolution-hero.jpg',
    'news/ai-generated-minecraft-oasis-gaming-hero.jpg',
    'news/quantum-computing-2025-breakthrough-hero.jpg',
    'news/samsung-galaxy-s25-perplexity-ai-hero.jpg',
    'guides/ai-agents-workplace-productivity-hero.jpg',
    'reviews/apple-vision-pro-vs-meta-quest-spatial-computing-hero.jpg',
  ];

  for (const placeholder of placeholders) {
    const filePath = path.join(imagesDir, placeholder);
    const ext = path.extname(placeholder);

    // For SVG files, write the SVG content
    if (ext === '.svg') {
      await fs.writeFile(filePath, placeholderSVG);
    } else {
      // For JPG files, create a simple placeholder file
      // In production, you'd want to generate actual placeholder images
      await fs.writeFile(filePath, placeholderSVG);
    }

    console.log(`Created placeholder: ${placeholder}`);
  }

  console.log('✅ All placeholder images created');
}

createPlaceholderImages().catch(console.error);
