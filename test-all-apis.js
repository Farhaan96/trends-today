#!/usr/bin/env node

// Comprehensive API Test Suite
require('dotenv').config({ path: '.env.local' });

const fetch = require('node-fetch');
const fs = require('fs').promises;
const path = require('path');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Test Unsplash API
async function testUnsplash() {
  console.log(`\n${colors.cyan}Testing Unsplash API...${colors.reset}`);
  const apiKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!apiKey || apiKey === 'YOUR_ACCESS_KEY_HERE') {
    console.log(`${colors.red}❌ No valid Unsplash API key${colors.reset}`);
    return false;
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=iphone&per_page=1&client_id=${apiKey}`
    );

    if (response.status === 200) {
      const data = await response.json();
      console.log(`${colors.green}✅ Unsplash API working!${colors.reset}`);
      if (data.results && data.results[0]) {
        console.log(
          `   Found: ${data.results[0].description || 'iPhone image'}`
        );
        console.log(`   URL: ${data.results[0].urls?.regular}`);
      }
      return true;
    } else {
      console.log(
        `${colors.red}❌ Unsplash error: ${response.status}${colors.reset}`
      );
      return false;
    }
  } catch (error) {
    console.log(
      `${colors.red}❌ Unsplash error: ${error.message}${colors.reset}`
    );
    return false;
  }
}

// Test Pexels API
async function testPexels() {
  console.log(`\n${colors.cyan}Testing Pexels API...${colors.reset}`);
  const apiKey = process.env.PEXELS_API_KEY;

  if (!apiKey || apiKey === 'YOUR_PEXELS_API_KEY_HERE') {
    console.log(`${colors.red}❌ No valid Pexels API key${colors.reset}`);
    return false;
  }

  try {
    const response = await fetch(
      'https://api.pexels.com/v1/search?query=smartphone&per_page=1',
      {
        headers: { Authorization: apiKey },
      }
    );

    if (response.status === 200) {
      const data = await response.json();
      console.log(`${colors.green}✅ Pexels API working!${colors.reset}`);
      if (data.photos && data.photos[0]) {
        console.log(`   Found: ${data.photos[0].alt || 'Smartphone image'}`);
        console.log(`   URL: ${data.photos[0].src.large}`);
      }
      return true;
    } else {
      console.log(
        `${colors.red}❌ Pexels error: ${response.status}${colors.reset}`
      );
      return false;
    }
  } catch (error) {
    console.log(
      `${colors.red}❌ Pexels error: ${error.message}${colors.reset}`
    );
    return false;
  }
}

// Test OpenAI API
async function testOpenAI() {
  console.log(`\n${colors.cyan}Testing OpenAI API...${colors.reset}`);
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey.includes('YOUR_KEY')) {
    console.log(`${colors.red}❌ No valid OpenAI API key${colors.reset}`);
    return false;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (response.status === 200) {
      const data = await response.json();
      console.log(`${colors.green}✅ OpenAI API working!${colors.reset}`);
      const hasDalle = data.data.some((model) => model.id.includes('dall-e'));
      const hasGPT4 = data.data.some((model) => model.id.includes('gpt-4'));
      console.log(
        `   Models: ${hasGPT4 ? 'GPT-4 ✓' : 'GPT-3.5'} ${hasDalle ? '| DALL-E ✓' : ''}`
      );
      return true;
    } else {
      console.log(
        `${colors.red}❌ OpenAI error: ${response.status}${colors.reset}`
      );
      return false;
    }
  } catch (error) {
    console.log(
      `${colors.red}❌ OpenAI error: ${error.message}${colors.reset}`
    );
    return false;
  }
}

// Test Google Gemini/Nano Banana API
async function testGemini() {
  console.log(
    `\n${colors.cyan}Testing Google Gemini (Nano Banana) API...${colors.reset}`
  );
  const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.includes('YOUR_')) {
    console.log(`${colors.red}❌ No valid Google AI API key${colors.reset}`);
    return false;
  }

  try {
    // Test API key validity
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    if (response.status === 200) {
      const data = await response.json();
      console.log(
        `${colors.green}✅ Google Gemini API working!${colors.reset}`
      );

      // Check for Nano Banana model
      const hasNanoBanana = data.models?.some(
        (model) =>
          model.name?.includes('gemini-2.5-flash-image') ||
          model.name?.includes('gemini-2-5-flash-image')
      );

      if (hasNanoBanana) {
        console.log(
          `   ${colors.green}✅ Nano Banana (Gemini 2.5 Flash Image) available!${colors.reset}`
        );
      } else {
        console.log(`   Models available: ${data.models?.length || 0}`);
      }

      // Try to generate a test image description
      await testNanoBananaGeneration(apiKey);

      return true;
    } else {
      const errorData = await response.text();
      console.log(
        `${colors.red}❌ Google API error: ${response.status}${colors.reset}`
      );
      if (errorData.includes('API_KEY_INVALID')) {
        console.log(`   Invalid API key - please check your key`);
      }
      return false;
    }
  } catch (error) {
    console.log(
      `${colors.red}❌ Google API error: ${error.message}${colors.reset}`
    );
    return false;
  }
}

// Test Nano Banana image generation
async function testNanoBananaGeneration(apiKey) {
  console.log(
    `\n${colors.cyan}Testing Nano Banana image generation...${colors.reset}`
  );

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: 'Generate an image of a futuristic iPhone with holographic display',
                },
              ],
            },
          ],
        }),
      }
    );

    if (response.status === 200) {
      console.log(
        `   ${colors.green}✅ Image generation request successful!${colors.reset}`
      );
      console.log(`   Cost: $0.039 per image`);
    } else if (response.status === 404) {
      console.log(
        `   ${colors.yellow}⚠️  Model not available yet or different endpoint needed${colors.reset}`
      );
    } else {
      console.log(
        `   ${colors.yellow}⚠️  Generation test returned: ${response.status}${colors.reset}`
      );
    }
  } catch (error) {
    console.log(
      `   ${colors.yellow}⚠️  Generation test error: ${error.message}${colors.reset}`
    );
  }
}

// Test Perplexity API
async function testPerplexity() {
  console.log(`\n${colors.cyan}Testing Perplexity API...${colors.reset}`);
  const apiKey = process.env.PERPLEXITY_API_KEY;

  if (!apiKey || apiKey.includes('YOUR_')) {
    console.log(`${colors.red}❌ No valid Perplexity API key${colors.reset}`);
    return false;
  }

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          { role: 'user', content: 'What is the latest iPhone model in 2025?' },
        ],
        max_tokens: 50,
      }),
    });

    if (response.status === 200) {
      const data = await response.json();
      console.log(`${colors.green}✅ Perplexity API working!${colors.reset}`);
      console.log(
        `   Response: ${data.choices?.[0]?.message?.content?.substring(0, 100)}...`
      );
      return true;
    } else {
      console.log(
        `${colors.red}❌ Perplexity error: ${response.status}${colors.reset}`
      );
      return false;
    }
  } catch (error) {
    console.log(
      `${colors.red}❌ Perplexity error: ${error.message}${colors.reset}`
    );
    return false;
  }
}

// Test Firecrawl API
async function testFirecrawl() {
  console.log(`\n${colors.cyan}Testing Firecrawl API...${colors.reset}`);
  const apiKey = process.env.FIRECRAWL_API_KEY;

  if (!apiKey || apiKey.includes('YOUR_')) {
    console.log(`${colors.red}❌ No valid Firecrawl API key${colors.reset}`);
    return false;
  }

  try {
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url: 'https://www.techradar.com',
        formats: ['markdown'],
        onlyMainContent: true,
      }),
    });

    if (response.status === 200) {
      console.log(`${colors.green}✅ Firecrawl API working!${colors.reset}`);
      console.log(`   Can scrape: TechRadar, The Verge, TechCrunch, etc.`);
      return true;
    } else {
      console.log(
        `${colors.red}❌ Firecrawl error: ${response.status}${colors.reset}`
      );
      return false;
    }
  } catch (error) {
    console.log(
      `${colors.red}❌ Firecrawl error: ${error.message}${colors.reset}`
    );
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.blue}🚀 COMPREHENSIVE API TEST SUITE${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}`);

  const results = {
    unsplash: await testUnsplash(),
    pexels: await testPexels(),
    openai: await testOpenAI(),
    gemini: await testGemini(),
    perplexity: await testPerplexity(),
    firecrawl: await testFirecrawl(),
  };

  console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.blue}📊 TEST RESULTS SUMMARY${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}\n`);

  const apis = [
    { name: 'Unsplash', key: 'unsplash', purpose: 'Stock photos' },
    { name: 'Pexels', key: 'pexels', purpose: 'Stock photos' },
    { name: 'OpenAI', key: 'openai', purpose: 'DALL-E & GPT' },
    { name: 'Google Gemini', key: 'gemini', purpose: 'Nano Banana images' },
    { name: 'Perplexity', key: 'perplexity', purpose: 'Research & content' },
    { name: 'Firecrawl', key: 'firecrawl', purpose: 'Web scraping' },
  ];

  apis.forEach((api) => {
    const status = results[api.key]
      ? `${colors.green}✅ Working${colors.reset}`
      : `${colors.red}❌ Not working${colors.reset}`;
    console.log(`${api.name.padEnd(15)} ${status.padEnd(30)} (${api.purpose})`);
  });

  const workingCount = Object.values(results).filter((r) => r).length;
  console.log(
    `\n${colors.blue}✨ ${workingCount}/6 APIs are operational${colors.reset}`
  );

  if (workingCount === 6) {
    console.log(
      `\n${colors.green}🎉 PERFECT! All APIs are working!${colors.reset}`
    );
    console.log(
      `${colors.green}Your blog has full automation capabilities:${colors.reset}`
    );
    console.log('   • AI-powered content generation');
    console.log('   • Unique image creation with Nano Banana');
    console.log('   • High-quality stock photos');
    console.log('   • Real-time web scraping');
    console.log('   • Deep research capabilities');

    console.log(
      `\n${colors.cyan}Ready to generate premium content!${colors.reset}`
    );
    console.log('Run: npm run agents:batch');
  } else if (workingCount >= 4) {
    console.log(
      `\n${colors.yellow}⚠️  Most APIs working - blog can operate with reduced features${colors.reset}`
    );
  } else {
    console.log(
      `\n${colors.red}⚠️  Several APIs need configuration${colors.reset}`
    );
  }

  // Save test results
  const reportPath = path.join(__dirname, 'reports', 'api-test-results.json');
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(
    reportPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        results,
        summary: `${workingCount}/6 APIs working`,
      },
      null,
      2
    )
  );

  console.log(
    `\n${colors.cyan}📄 Full report saved: reports/api-test-results.json${colors.reset}`
  );
}

// Run tests
runAllTests().catch(console.error);
