#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const https = require('https');
const fs = require('fs').promises;
const path = require('path');

async function generateAnunnakiImage() {
    const openaiKey = process.env.OPENAI_API_KEY;
    console.log('OpenAI API Key:', openaiKey ? `${openaiKey.substring(0, 10)}...` : 'NOT FOUND');

    if (!openaiKey) {
        console.error('❌ OpenAI API key not found');
        return null;
    }

    // Create prompt based on Anunnaki article
    const prompt = `Professional hero image for tech blog article: "The Anunnaki: Ancient Sumerian Gods or Something More? The Archaeological Truth"

Key concepts: Anunnaki mythology, ancient Mesopotamian civilization, archaeological evidence
Technologies featured: cuneiform tablets, archaeological discovery, ancient writing systems
Data visualization elements: 5,000 years ago timeline, 2144-2124 BCE historical period

Visual requirements:
- Ultra high quality, photorealistic or stylized professional illustration
- 1536x1024 aspect ratio for blog header
- Ancient Mesopotamian aesthetic with modern archaeological elements
- Cuneiform tablets, ancient stone carvings, astronomical symbols
- Warm, mystical lighting with academic credibility
- Clean composition with clear focal point
- No text, logos, or watermarks
- Sharp details, editorial quality
- Suitable for science content theme`;

    console.log('🎨 Generating Anunnaki image with OpenAI gpt-image-1...');
    console.log(`Prompt length: ${prompt.length} characters`);

    try {
        const response = await makeOpenAIRequest(prompt, openaiKey);

        if (response.data && response.data[0]) {
            const imageData = response.data[0];
            const timestamp = Date.now();
            const filename = `anunnaki-sumerian-mythology-${timestamp}.png`;

            // Ensure directory exists
            const outputDir = path.join(__dirname, 'public', 'images', 'ai-generated');
            await fs.mkdir(outputDir, { recursive: true });

            if (imageData.b64_json) {
                // Save base64 image
                const buffer = Buffer.from(imageData.b64_json, 'base64');
                const filePath = path.join(outputDir, filename);
                await fs.writeFile(filePath, buffer);

                const localPath = `/images/ai-generated/${filename}`;
                console.log(`✅ Image saved successfully: ${filename}`);
                console.log(`   Local path: ${localPath}`);

                return localPath;
            } else if (imageData.url) {
                // Download from URL (fallback)
                const filePath = path.join(outputDir, filename);
                await downloadImage(imageData.url, filePath);

                const localPath = `/images/ai-generated/${filename}`;
                console.log(`✅ Image downloaded successfully: ${filename}`);
                console.log(`   Local path: ${localPath}`);

                return localPath;
            }
        }

        console.error('❌ No image data returned from OpenAI');
        return null;

    } catch (error) {
        console.error(`❌ Error generating image: ${error.message}`);
        return null;
    }
}

function makeOpenAIRequest(prompt, apiKey) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            model: 'dall-e-3',
            prompt: prompt,
            n: 1,
            size: '1792x1024',
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
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(parsed);
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${parsed.error?.message || 'Unknown error'}`));
                    }
                } catch (e) {
                    reject(new Error(`Parse error: ${data.substring(0, 200)}`));
                }
            });
        });

        req.on('error', reject);
        req.setTimeout(120000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.write(postData);
        req.end();
    });
}

function downloadImage(url, filePath) {
    return new Promise((resolve, reject) => {
        const file = require('fs').createWriteStream(filePath);

        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`HTTP ${response.statusCode}`));
                return;
            }

            response.pipe(file);

            file.on('finish', () => {
                file.close();
                resolve(filePath);
            });

            file.on('error', reject);
        }).on('error', reject);
    });
}

// Run the function
generateAnunnakiImage().then(imagePath => {
    if (imagePath) {
        console.log(`\n🎨 SUCCESS: Image generated at ${imagePath}`);
        console.log(`\nUpdate your article frontmatter with:`);
        console.log(`image: ${imagePath}`);
    } else {
        console.log('\n❌ Image generation failed');
    }
    process.exit(0);
}).catch(error => {
    console.error('❌ Script error:', error.message);
    process.exit(1);
});