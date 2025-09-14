#!/usr/bin/env node

/**
 * Generate AI image for Parker Solar Probe article
 */

const { AIImageGenerator } = require('./utils/ai-image-generator');

async function generateParkerProbeImage() {
  const generator = new AIImageGenerator();

  const spacePrompt = `
NASA Parker Solar Probe spacecraft approaching the Sun's glowing corona during its historic Christmas Eve 2024 flyby.
The spacecraft is small but detailed in the foreground, with its distinctive heat shield facing toward the massive,
brilliant Sun in the background. The Sun's corona is visible as flowing, luminous plasma streams and solar flares.
The space environment shows the intense brightness and energy of our star, with dramatic lighting and cosmic scale.
Photorealistic space photography style, ultra-high detail, cinematic composition, vibrant oranges and yellows from
the solar atmosphere, deep space background with subtle stars. Professional NASA mission photography aesthetic,
no text or watermarks, epic scale showing the incredible achievement of humanity's closest approach to a star.
1536x1024 aspect ratio, HD quality, vivid colors.
  `.trim();

  try {
    console.log('🎨 Generating AI image for Parker Solar Probe article...');

    const result = await generator.generateImage(spacePrompt, {
      filename: 'ai-generated-parker-probe.png',
      provider: 'openai',
      downloadImage: true,
      size: '1536x1024',
      quality: 'hd',
      style: 'vivid'
    });

    console.log('\n✅ Space image generated successfully!');
    console.log(`   Filename: ${result.filename}`);
    console.log(`   Local path: ${result.localPath}`);
    console.log(`   Image URL: ${result.url}`);
    console.log(`   Cost: $0.08 (HD quality)`);

    return result;

  } catch (error) {
    console.error('❌ Failed to generate space image:', error.message);

    // Fallback to a stock photo approach
    console.log('\n⚠️ Using stock photo as fallback...');
    console.log('   Suggested Unsplash search: "solar probe space sun"');
    console.log('   Alternative: Update image path in MDX to use Unsplash');

    return null;
  }
}

if (require.main === module) {
  generateParkerProbeImage().catch(console.error);
}

module.exports = { generateParkerProbeImage };