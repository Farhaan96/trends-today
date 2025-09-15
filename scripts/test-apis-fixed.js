require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

console.log('🔧 Testing All Configured APIs (Fixed Version)...\n');
console.log('='.repeat(50));

const results = {
  working: [],
  failed: [],
  notConfigured: [],
};

// Test function wrapper
async function testAPI(name, testFn) {
  process.stdout.write(`Testing ${name}... `);
  try {
    const result = await testFn();
    console.log('✅ WORKING');
    results.working.push({ name, details: result });
    return true;
  } catch (error) {
    const errorMsg =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message;
    console.log(`❌ FAILED: ${errorMsg}`);
    results.failed.push({ name, error: errorMsg });
    return false;
  }
}

async function runTests() {
  // 1. Test Perplexity API - FIXED
  await testAPI('Perplexity API', async () => {
    const key = process.env.PERPLEXITY_API_KEY;
    if (!key) throw new Error('API key not configured');

    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'user',
            content: 'What is 2+2?',
          },
        ],
        max_tokens: 50,
        temperature: 0.2,
      },
      {
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );
    return `Response: ${response.data.choices?.[0]?.message?.content?.substring(0, 20)}...`;
  });

  // 2. Test OpenAI API - FIXED (using correct endpoint)
  await testAPI('OpenAI API', async () => {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error('API key not configured');

    const response = await axios.get('https://api.openai.com/v1/models', {
      headers: {
        Authorization: `Bearer ${key}`,
      },
      timeout: 10000,
    });
    const gptModels = response.data.data.filter((m) =>
      m.id.includes('gpt')
    ).length;
    return `GPT Models available: ${gptModels}`;
  });

  // 3. Test Unsplash API
  await testAPI('Unsplash API', async () => {
    const key = process.env.UNSPLASH_ACCESS_KEY;
    if (!key) throw new Error('API key not configured');

    const response = await axios.get('https://api.unsplash.com/search/photos', {
      params: {
        query: 'technology',
        per_page: 1,
      },
      headers: {
        Authorization: `Client-ID ${key}`,
      },
      timeout: 10000,
    });
    return `Total results: ${response.data.total}`;
  });

  // 4. Test Pexels API
  await testAPI('Pexels API', async () => {
    const key = process.env.PEXELS_API_KEY;
    if (!key) throw new Error('API key not configured');

    const response = await axios.get('https://api.pexels.com/v1/search', {
      params: {
        query: 'technology',
        per_page: 1,
      },
      headers: {
        Authorization: key,
      },
      timeout: 10000,
    });
    return `Total results: ${response.data.total_results}`;
  });

  // 5. Test Google AI API (Gemini)
  await testAPI('Google AI/Gemini API', async () => {
    const key =
      process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;
    if (!key) throw new Error('API key not configured');

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        contents: [
          {
            parts: [
              {
                text: 'What is 2+2?',
              },
            ],
          },
        ],
      },
      { timeout: 10000 }
    );
    return `Response: ${response.data.candidates?.[0]?.content?.parts?.[0]?.text?.substring(0, 20)}...`;
  });

  // 6. Test Firecrawl API
  await testAPI('Firecrawl API', async () => {
    const key = process.env.FIRECRAWL_API_KEY;
    if (!key) throw new Error('API key not configured');

    // Test with scrape endpoint instead
    const response = await axios.post(
      'https://api.firecrawl.dev/v1/scrape',
      {
        url: 'https://example.com',
        formats: ['markdown'],
      },
      {
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );
    return `Scrape successful: ${response.data.success || response.status === 200}`;
  });

  // 7. Test News API
  await testAPI('News API', async () => {
    const key = process.env.NEWS_API_KEY;
    if (!key) throw new Error('API key not configured');

    const response = await axios.get(`https://newsapi.org/v2/top-headlines`, {
      params: {
        country: 'us',
        pageSize: 1,
        apiKey: key,
      },
      timeout: 10000,
    });
    return `Articles found: ${response.data.totalResults}`;
  });

  // 8. Test DataForSEO API
  await testAPI('DataForSEO API', async () => {
    const login = process.env.DATAFORSEO_LOGIN;
    const password = process.env.DATAFORSEO_PASSWORD;
    if (!login || !password) throw new Error('API credentials not configured');

    const auth = Buffer.from(`${login}:${password}`).toString('base64');
    const response = await axios.get(
      'https://api.dataforseo.com/v3/dataforseo_labs/locations_and_languages',
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );
    return `Status: ${response.data.status_message || 'Connected'}`;
  });

  // 9. Test DALL-E 3 (part of OpenAI)
  await testAPI('DALL-E 3 (OpenAI)', async () => {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error('API key not configured');

    // Just check if we can access the endpoint
    const response = await axios.post(
      'https://api.openai.com/v1/images/generations',
      {
        model: 'dall-e-3',
        prompt: 'test',
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      },
      {
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
        validateStatus: (status) => status < 500, // Don't throw on 4xx to see the error
      }
    );

    if (
      response.status === 400 &&
      response.data.error?.code === 'billing_hard_limit_reached'
    ) {
      return 'API configured (billing limit reached)';
    }
    if (response.data.data?.[0]?.url) {
      return 'Image generation working';
    }
    throw new Error(response.data.error?.message || 'Unknown error');
  });

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 API TEST SUMMARY\n');

  console.log(`✅ Working APIs (${results.working.length}):`);
  results.working.forEach((api) => {
    console.log(`   • ${api.name}: ${api.details}`);
  });

  if (results.failed.length > 0) {
    console.log(`\n❌ Failed APIs (${results.failed.length}):`);
    results.failed.forEach((api) => {
      console.log(`   • ${api.name}: ${api.error}`);
    });
  }

  // Check which keys are actually set
  console.log('\n🔑 Environment Variables Status:');
  const envVars = {
    PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY
      ? `✅ Set (${process.env.PERPLEXITY_API_KEY.substring(0, 10)}...)`
      : '❌ Not set',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY
      ? `✅ Set (${process.env.OPENAI_API_KEY.substring(0, 10)}...)`
      : '❌ Not set',
    UNSPLASH_ACCESS_KEY: process.env.UNSPLASH_ACCESS_KEY
      ? `✅ Set (${process.env.UNSPLASH_ACCESS_KEY.substring(0, 10)}...)`
      : '❌ Not set',
    PEXELS_API_KEY: process.env.PEXELS_API_KEY
      ? `✅ Set (${process.env.PEXELS_API_KEY.substring(0, 10)}...)`
      : '❌ Not set',
    GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY
      ? `✅ Set (${process.env.GOOGLE_AI_API_KEY.substring(0, 10)}...)`
      : '❌ Not set',
    FIRECRAWL_API_KEY: process.env.FIRECRAWL_API_KEY
      ? `✅ Set (${process.env.FIRECRAWL_API_KEY.substring(0, 10)}...)`
      : '❌ Not set',
    NEWS_API_KEY: process.env.NEWS_API_KEY ? `✅ Set` : '❌ Not set',
    DATAFORSEO_LOGIN: process.env.DATAFORSEO_LOGIN ? '✅ Set' : '❌ Not set',
  };

  Object.entries(envVars).forEach(([key, status]) => {
    console.log(`   ${key}: ${status}`);
  });

  const total = results.working.length + results.failed.length;
  const successRate = Math.round((results.working.length / total) * 100);
  console.log(
    `\n🎯 Success Rate: ${successRate}% (${results.working.length}/${total})`
  );

  // Recommendations
  if (results.failed.length > 0) {
    console.log('\n💡 Recommendations:');
    results.failed.forEach((api) => {
      if (api.error.includes('401') || api.error.includes('Unauthorized')) {
        console.log(`   • ${api.name}: Check if API key is valid and active`);
      } else if (api.error.includes('billing')) {
        console.log(
          `   • ${api.name}: Check billing/usage limits on your account`
        );
      } else if (api.error.includes('404')) {
        console.log(`   • ${api.name}: Verify endpoint URL or API version`);
      }
    });
  }
}

// Run all tests
runTests().catch(console.error);
