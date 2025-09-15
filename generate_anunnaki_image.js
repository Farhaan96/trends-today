#!/usr/bin/env node

/**
 * Generate new AI image for Anunnaki article
 * Uses dynamic content analysis for contextual prompting
 */

const { AIImageGenerator } = require('./utils/ai-image-generator');
const path = require('path');

async function generateAnunnakiImage() {
  const generator = new AIImageGenerator();

  console.log('🎨 Generating new gpt-image-1 image for Anunnaki article...');

  try {
    // Article path
    const articlePath = path.resolve('./content/science/anunnaki-sumerian-gods-mystery.mdx');

    // Generate contextual image using dynamic content analysis
    const result = await generator.generateFromArticle(articlePath, {
      size: '1536x1024',
      quality: 'high'
    });

    console.log('\n✅ Anunnaki Image Generation Complete:');
    console.log(`   Filename: ${result.filename}`);
    console.log(`   Local path: ${result.localPath}`);
    console.log(`   Cost: ~$${result.cost}`);
    console.log(`   Extracted Topics: ${result.extractedTopics.slice(0, 3).join(', ')}`);
    console.log(`   Extracted Technologies: ${result.extractedTech.slice(0, 3).join(', ')}`);
    console.log(`   Model: gpt-image-1`);

    return result;

  } catch (error) {
    console.error(`❌ Failed to generate Anunnaki image: ${error.message}`);
    throw error;
  }
}

if (require.main === module) {
  generateAnunnakiImage().catch(console.error);
}

module.exports = { generateAnunnakiImage };