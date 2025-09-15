#!/usr/bin/env node

/**
 * Direct OpenAI gpt-image-1 generation for Anunnaki article
 */

require('dotenv').config({ path: '.env.local' });
const https = require('https');
const fs = require('fs').promises;
const path = require('path');

async function generateAnunnakiImage() {
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!openaiKey || openaiKey === 'sk-your-api-key-here') {
    throw new Error('OpenAI API key not configured in .env.local');
  }

  console.log('🎨 Generating Anunnaki image with gpt-image-1...');

  // Contextual prompt based on the article content
  const prompt = `Professional archaeological hero image for scholarly article: "The Anunnaki: Ancient Sumerian Gods or Something More? The Archaeological Truth"

Ancient Mesopotamian setting with:
- Authentic weathered Sumerian cuneiform tablets made of clay
- Ancient stone with carved cuneiform script clearly visible
- Warm archaeological lighting showing texture and age
- Scholarly museum-quality presentation
- Subtle background of ancient ziggurats or Mesopotamian landscape
- Earthy tones: browns, tans, warm stone colors
- Professional academic publication aesthetic
- Sharp focus on authentic historical artifacts
- No modern elements, text overlays, or watermarks
- 1536x1024 aspect ratio optimized for blog header
- Photorealistic archaeological documentation style`;

  const requestData = JSON.stringify({
    model: 'gpt-image-1',
    prompt: prompt,
    n: 1,
    size: '1536x1024',
    quality: 'hd',
    response_format: 'b64_json'
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/images/generations',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestData)
      }
    };

    const req = https.request(options, async (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', async () => {
        try {
          const response = JSON.parse(data);

          if (res.statusCode !== 200) {
            reject(new Error(`OpenAI API error ${res.statusCode}: ${response.error?.message || 'Unknown error'}`));
            return;
          }

          const imageData = response.data[0];
          if (!imageData.b64_json) {
            reject(new Error('No base64 image data returned'));
            return;
          }

          // Generate unique filename
          const timestamp = Date.now();
          const filename = `ai-generated-anunnaki-${timestamp}.png`;
          const outputPath = path.join(__dirname, 'public', 'images', 'ai-generated', filename);

          // Save the base64 image
          const buffer = Buffer.from(imageData.b64_json, 'base64');
          await fs.writeFile(outputPath, buffer);

          console.log(`✅ Image generated successfully:`);
          console.log(`   Filename: ${filename}`);
          console.log(`   Path: /images/ai-generated/${filename}`);
          console.log(`   Model: gpt-image-1`);
          console.log(`   Size: 1536x1024`);
          console.log(`   Quality: HD`);

          resolve({
            filename,
            localPath: `/images/ai-generated/${filename}`,
            fullPath: outputPath
          });

        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    req.setTimeout(120000, () => {
      req.destroy();
      reject(new Error('Request timeout (120s)'));
    });

    req.write(requestData);
    req.end();
  });
}

if (require.main === module) {
  generateAnunnakiImage()
    .then(result => {
      console.log('\n🎯 Ready to update article frontmatter with:');
      console.log(`image: ${result.localPath}`);
      console.log(`imageAlt: Ancient Sumerian clay tablets with cuneiform script depicting archaeological evidence of Anunnaki mythology`);
    })
    .catch(error => {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { generateAnunnakiImage };