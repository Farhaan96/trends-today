require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

console.log('🔧 Testing All Configured APIs...\n');
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
    console.log(`❌ FAILED: ${error.message}`);
    results.failed.push({ name, error: error.message });
    return false;
  }
}

async function runTests() {
  // 1. Test Perplexity API
  await testAPI('Perplexity API', async () => {
    const key = process.env.PERPLEXITY_API_KEY;
    if (!key) throw new Error('API key not configured');

    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'sonar',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 10,
      },
      {
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );
    return `Model: ${response.data.model}`;
  });

  // 2. Test OpenAI API
  await testAPI('OpenAI API', async () => {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error('API key not configured');

    const response = await axios.get('https://api.openai.com/v1/models', {
      headers: {
        Authorization: `Bearer ${key}`,
      },
      timeout: 10000,
    });
    return `Models available: ${response.data.data.length}`;
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

    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`,
      { timeout: 10000 }
    );
    return `Models available: ${response.data.models ? response.data.models.length : 0}`;
  });

  // 6. Test Firecrawl API
  await testAPI('Firecrawl API', async () => {
    const key = process.env.FIRECRAWL_API_KEY;
    if (!key) throw new Error('API key not configured');

    const response = await axios.get(
      'https://api.firecrawl.dev/v1/crawl/status/test',
      {
        headers: {
          Authorization: `Bearer ${key}`,
        },
        timeout: 10000,
        validateStatus: (status) => status < 500,
      }
    );
    return 'API accessible';
  });

  // 7. Test News API
  await testAPI('News API', async () => {
    const key = process.env.NEWS_API_KEY;
    if (!key) throw new Error('API key not configured');

    const response = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        country: 'us',
        pageSize: 1,
        apiKey: key,
      },
      timeout: 10000,
    });
    return `Status: ${response.data.status}`;
  });

  // 8. Test DataForSEO API
  await testAPI('DataForSEO API', async () => {
    const login = process.env.DATAFORSEO_LOGIN;
    const password = process.env.DATAFORSEO_PASSWORD;
    if (!login || !password) throw new Error('API credentials not configured');

    const auth = Buffer.from(`${login}:${password}`).toString('base64');
    const response = await axios.get(
      'https://api.dataforseo.com/v3/serp/locations',
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
        params: {
          limit: 1,
        },
      }
    );
    return `Status: ${response.data.status_message || 'OK'}`;
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
      ? '✅ Set'
      : '❌ Not set',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Not set',
    UNSPLASH_ACCESS_KEY: process.env.UNSPLASH_ACCESS_KEY
      ? '✅ Set'
      : '❌ Not set',
    PEXELS_API_KEY: process.env.PEXELS_API_KEY ? '✅ Set' : '❌ Not set',
    GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY ? '✅ Set' : '❌ Not set',
    FIRECRAWL_API_KEY: process.env.FIRECRAWL_API_KEY ? '✅ Set' : '❌ Not set',
    NEWS_API_KEY: process.env.NEWS_API_KEY ? '✅ Set' : '❌ Not set',
    DATAFORSEO_LOGIN: process.env.DATAFORSEO_LOGIN ? '✅ Set' : '❌ Not set',
    DATAFORSEO_PASSWORD: process.env.DATAFORSEO_PASSWORD
      ? '✅ Set'
      : '❌ Not set',
  };

  Object.entries(envVars).forEach(([key, status]) => {
    console.log(`   ${key}: ${status}`);
  });

  const successRate = Math.round(
    (results.working.length /
      (results.working.length + results.failed.length)) *
      100
  );
  console.log(
    `\n🎯 Success Rate: ${successRate}% (${results.working.length}/${results.working.length + results.failed.length})`
  );
}

// Run all tests
runTests().catch(console.error);
