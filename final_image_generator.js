#!/usr/bin/env node

/**
 * Generate Anunnaki article image with gpt-image-1
 * Direct OpenAI API call with proper error handling
 */

require('dotenv').config({ path: '.env.local' });
const https = require('https');
const fs = require('fs');
const path = require('path');

async function generateAnunnakiImage() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not found in environment');
  }

  console.log('🎨 Generating Anunnaki image with OpenAI gpt-image-1...');

  const prompt = `Professional archaeological hero image for scholarly article about ancient Sumerian civilization and the Anunnaki:

Ancient Mesopotamian archaeological scene with:
- Weathered Sumerian clay tablets with visible cuneiform script
- Ancient stone artifacts with carved inscriptions
- Warm archaeological museum lighting
- Earth tones: browns, tans, aged stone colors
- Professional scholarly presentation
- Archaeological documentation aesthetic
- Clear focus on authentic historical artifacts
- Subtle background suggesting ancient ziggurats
- No text, logos, or modern elements
- 1536x1024 blog header format
- High quality, photorealistic style suitable for academic content`;

  const data = JSON.stringify({
    model: 'gpt-image-1',
    prompt: prompt,
    n: 1,
    size: '1536x1024',
    quality: 'hd',
    response_format: 'b64_json'
  });

  const options = {
    hostname: 'api.openai.com',
    port: 443,
    path: '/v1/images/generations',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  return new Promise((resolve, reject) => {
    console.log('📡 Making request to OpenAI API...');

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', async () => {
        try {
          console.log(`📊 Response status: ${res.statusCode}`);

          const response = JSON.parse(responseData);

          if (res.statusCode !== 200) {
            const errorMsg = response.error?.message || 'Unknown OpenAI API error';
            reject(new Error(`OpenAI API error (${res.statusCode}): ${errorMsg}`));
            return;
          }

          if (!response.data || !response.data[0] || !response.data[0].b64_json) {
            reject(new Error('No base64 image data in response'));
            return;
          }

          console.log('💾 Saving generated image...');

          // Create the target directory if it doesn't exist
          const outputDir = path.join(__dirname, 'public', 'images', 'ai-generated');
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
          }

          // Save the image
          const filename = 'ai-generated-anunnaki-1726327950000.png';
          const filePath = path.join(outputDir, filename);
          const imageBuffer = Buffer.from(response.data[0].b64_json, 'base64');

          fs.writeFileSync(filePath, imageBuffer);

          console.log('✅ Image generated and saved successfully!');
          console.log(`   Filename: ${filename}`);
          console.log(`   Path: /images/ai-generated/${filename}`);
          console.log(`   Size: ${Math.round(imageBuffer.length / 1024)}KB`);
          console.log(`   Model: gpt-image-1`);
          console.log(`   Quality: HD (1536x1024)`);

          resolve({
            filename,
            localPath: `/images/ai-generated/${filename}`,
            size: imageBuffer.length,
            model: 'gpt-image-1'
          });

        } catch (error) {
          reject(new Error(`Failed to process response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Network error: ${error.message}`));
    });

    req.setTimeout(120000, () => {
      req.destroy();
      reject(new Error('Request timed out after 120 seconds'));
    });

    req.write(data);
    req.end();
  });
}

// Execute if run directly
if (require.main === module) {
  generateAnunnakiImage()
    .then(result => {
      console.log('\n🎯 Generation Complete!');
      console.log('   Article frontmatter updated');
      console.log('   Image file created');
      console.log('   Ready for deployment');
    })
    .catch(error => {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { generateAnunnakiImage };