#!/usr/bin/env node

/**
 * Generate new AI image for Anunnaki article using gpt-image-1
 */

require('dotenv').config({ path: '.env.local' });
const { AIImageGenerator } = require('./utils/ai-image-generator');
const fs = require('fs').promises;
const path = require('path');

async function main() {
  const generator = new AIImageGenerator();

  console.log('🎨 Generating contextual gpt-image-1 image for Anunnaki article...');

  // Read the article content to understand context
  const articlePath = path.resolve('./content/science/anunnaki-sumerian-gods-mystery.mdx');
  const content = await fs.readFile(articlePath, 'utf-8');

  // Extract key topics from the article
  const topics = generator.extractMainTopics(content);
  const technologies = generator.extractTechnologies(content, 'science');

  console.log('📄 Article analysis:');
  console.log(`   Key topics: ${topics.slice(0, 3).join(', ')}`);
  console.log(`   Technologies: ${technologies.slice(0, 3).join(', ')}`);

  // Create a contextually rich prompt for the Anunnaki article
  const prompt = `Professional archaeological illustration for scientific article: "The Anunnaki: Ancient Sumerian Gods or Something More? The Archaeological Truth"

Key concepts: Ancient Sumerian cuneiform tablets, Mesopotamian archaeology, ancient clay tablets with inscribed writing
Archaeological elements: Weathered stone tablets, ancient cuneiform script, Sumerian ziggurats in background
Scientific approach: Museum-quality archaeological documentation, scholarly presentation

Visual requirements:
- Ultra high quality, photorealistic archaeological illustration
- 1536x1024 aspect ratio for blog header
- Warm earth tones, ancient patina, scholarly atmosphere
- Clean composition focusing on authentic Sumerian artifacts
- Professional academic publication quality
- Ancient clay tablets with visible cuneiform inscriptions
- Subtle lighting highlighting texture and age of artifacts
- No text, logos, or watermarks
- Sharp details showing archaeological authenticity
- Suitable for serious scientific content about ancient civilizations`;

  try {
    // Generate image with high quality settings
    const result = await generator.generateImage(prompt, {
      size: '1536x1024',
      quality: 'high',
      downloadImage: true
    });

    console.log('\n✅ Anunnaki Image Generation Complete:');
    console.log(`   Model: gpt-image-1`);
    console.log(`   Filename: ${result.filename}`);
    console.log(`   Local path: ${result.localPath}`);
    console.log(`   Estimated cost: ${generator.estimateCost()}`);

    // Return the local path for frontmatter update
    return result.localPath;

  } catch (error) {
    console.error(`❌ Image generation failed: ${error.message}`);
    throw error;
  }
}

if (require.main === module) {
  main()
    .then(localPath => {
      console.log(`\n🎯 Next step: Update article frontmatter with:`);
      console.log(`   image: ${localPath}`);
    })
    .catch(console.error);
}

module.exports = { main };