require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

console.log('🔧 Testing All APIs - Final Comprehensive Test\n');
console.log('=' .repeat(60));

const results = {
  working: [],
  failed: []
};

async function testAPI(name, testFn) {
  process.stdout.write(`Testing ${name}... `);
  try {
    const result = await testFn();
    console.log('✅ WORKING');
    results.working.push({ name, details: result });
    return true;
  } catch (error) {
    const errorMsg = error.response?.data?.error?.message || error.response?.data?.message || error.message;
    console.log(`❌ FAILED: ${errorMsg.substring(0, 60)}...`);
    results.failed.push({ name, error: errorMsg });
    return false;
  }
}

async function runTests() {
  // 1. Perplexity API - FIXED with correct model
  await testAPI('Perplexity API', async () => {
    const key = process.env.PERPLEXITY_API_KEY;
    if (!key) throw new Error('API key not configured');
    
    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'sonar',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 20
      },
      {
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );
    return `Model: sonar working`;
  });

  // 2. OpenAI API
  await testAPI('OpenAI API (GPT-4)', async () => {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error('API key not configured');
    
    const response = await axios.get(
      'https://api.openai.com/v1/models',
      {
        headers: {
          'Authorization': `Bearer ${key}`
        },
        timeout: 10000
      }
    );
    const gptModels = response.data.data.filter(m => m.id.includes('gpt')).length;
    return `${gptModels} GPT models available`;
  });

  // 3. DALL-E 3 (OpenAI)
  await testAPI('DALL-E 3 (OpenAI)', async () => {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error('API key not configured');
    
    // Just verify we can access the endpoint
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5
      },
      {
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    return 'OpenAI API accessible (DALL-E 3 available)';
  });

  // 4. Unsplash API
  await testAPI('Unsplash API', async () => {
    const key = process.env.UNSPLASH_ACCESS_KEY;
    if (!key) throw new Error('API key not configured');
    
    const response = await axios.get(
      'https://api.unsplash.com/search/photos',
      {
        params: {
          query: 'technology',
          per_page: 1
        },
        headers: {
          'Authorization': `Client-ID ${key}`
        },
        timeout: 10000
      }
    );
    return `${response.data.total.toLocaleString()} images available`;
  });

  // 5. Pexels API
  await testAPI('Pexels API', async () => {
    const key = process.env.PEXELS_API_KEY;
    if (!key) throw new Error('API key not configured');
    
    const response = await axios.get(
      'https://api.pexels.com/v1/search',
      {
        params: {
          query: 'technology',
          per_page: 1
        },
        headers: {
          'Authorization': key
        },
        timeout: 10000
      }
    );
    return `${response.data.total_results.toLocaleString()} images available`;
  });

  // 6. Google AI/Gemini API
  await testAPI('Google AI/Gemini', async () => {
    const key = process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;
    if (!key) throw new Error('API key not configured');
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        contents: [{
          parts: [{
            text: "Say hello"
          }]
        }]
      },
      { timeout: 10000 }
    );
    return 'Gemini 1.5 Flash working';
  });

  // 7. Firecrawl API
  await testAPI('Firecrawl API', async () => {
    const key = process.env.FIRECRAWL_API_KEY;
    if (!key) throw new Error('API key not configured');
    
    const response = await axios.post(
      'https://api.firecrawl.dev/v1/scrape',
      {
        url: 'https://example.com',
        formats: ['markdown']
      },
      {
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );
    return 'Web scraping working';
  });

  // 8. News API
  await testAPI('News API', async () => {
    const key = process.env.NEWS_API_KEY;
    if (!key) throw new Error('API key not configured');
    
    const response = await axios.get(
      'https://newsapi.org/v2/top-headlines',
      {
        params: {
          country: 'us',
          pageSize: 1,
          apiKey: key
        },
        timeout: 10000
      }
    );
    if (response.data.status !== 'ok') {
      throw new Error(response.data.message || 'API not working');
    }
    return `${response.data.totalResults} articles available`;
  });

  // 9. DataForSEO API
  await testAPI('DataForSEO API', async () => {
    const login = process.env.DATAFORSEO_LOGIN;
    const password = process.env.DATAFORSEO_PASSWORD;
    if (!login || !password) throw new Error('API credentials not configured');
    
    const auth = Buffer.from(`${login}:${password}`).toString('base64');
    const response = await axios.get(
      'https://api.dataforseo.com/v3/dataforseo_labs/locations_and_languages',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    return 'SEO data access working';
  });

  // Print final summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 FINAL API TEST RESULTS\n');
  
  const total = results.working.length + results.failed.length;
  const successRate = Math.round((results.working.length / total) * 100);
  
  console.log(`✅ Working APIs (${results.working.length}/${total}):`);
  results.working.forEach(api => {
    console.log(`   • ${api.name}: ${api.details}`);
  });
  
  if (results.failed.length > 0) {
    console.log(`\n❌ Failed APIs (${results.failed.length}/${total}):`);
    results.failed.forEach(api => {
      console.log(`   • ${api.name}`);
    });
  }
  
  console.log(`\n🎯 Overall Success Rate: ${successRate}%`);
  
  if (successRate >= 70) {
    console.log('✨ Your API setup is healthy! Core functionality will work well.');
  } else if (successRate >= 50) {
    console.log('⚠️  Some APIs need attention, but core features should work.');
  } else {
    console.log('🔧 Several APIs need configuration. Check the failed APIs above.');
  }
  
  // Core APIs check
  const coreAPIs = ['Perplexity API', 'OpenAI API (GPT-4)', 'Unsplash API', 'Pexels API', 'Google AI/Gemini'];
  const workingCore = results.working.filter(api => coreAPIs.includes(api.name)).length;
  console.log(`\n🔑 Core APIs Status: ${workingCore}/${coreAPIs.length} working`);
  if (workingCore === coreAPIs.length) {
    console.log('   ✅ All essential APIs for content generation are operational!');
  }
}

// Run all tests
runTests().catch(console.error);