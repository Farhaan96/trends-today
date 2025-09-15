#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { AIImageGenerator } = require('./utils/ai-image-generator');
const fs = require('fs').promises;
const path = require('path');

async function generateImageForAnunnaki() {
  const generator = new AIImageGenerator();

  console.log('🎨 Generating contextual image for Anunnaki article...');

  // Create archaeological prompt based on article content
  const prompt = `Professional archaeological illustration for academic article about ancient Sumerian civilization:

Ancient Mesopotamian archaeological scene featuring:
- Authentic weathered clay tablets with clearly visible cuneiform script
- Sumerian archaeological artifacts arranged in scholarly presentation
- Warm museum lighting highlighting the texture and age of ancient clay
- Earth tones and archaeological patina
- Professional academic documentation style
- Subtle background suggesting ancient Mesopotamian setting
- Sharp focus on authentic historical artifacts showing cuneiform writing
- No modern elements, text overlays, or watermarks
- High-quality archaeological photography aesthetic
- 1536x1024 aspect ratio for blog header
- Scholarly presentation suitable for scientific content about ancient civilizations`;

  try {
    await generator.ensureDirs();

    const result = await generator.generateImage(prompt, {
      size: '1536x1024',
      quality: 'high',
      filename: 'ai-generated-anunnaki-1726327950000.png',
      downloadImage: true
    });

    console.log('\n✅ Anunnaki Image Generated:');
    console.log(`   Model: gpt-image-1`);
    console.log(`   Filename: ${result.filename}`);
    console.log(`   Local path: ${result.localPath}`);
    console.log(`   Full system path: ${result.localPath}`);

    return result;

  } catch (error) {
    console.error(`❌ Image generation failed: ${error.message}`);
    console.error(`   Stack trace: ${error.stack}`);
    throw error;
  }
}

if (require.main === module) {
  generateImageForAnunnaki()
    .then(result => {
      console.log('\n🎯 Image generation complete!');
      console.log(`   Article frontmatter already updated with: ${result.localPath}`);
      console.log('   Ready to build and deploy.');
    })
    .catch(error => {
      console.error(`❌ Fatal error: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { generateImageForAnunnaki };