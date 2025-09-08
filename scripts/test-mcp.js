#!/usr/bin/env node

// Test MCP integration and API connectivity
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

class MCPTester {
  constructor() {
    this.results = {
      firecrawl: { status: 'pending', error: null },
      perplexity: { status: 'pending', error: null },
      dataForSEO: { status: 'pending', error: null }
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString().substr(11, 8);
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async testFirecrawl() {
    this.log('Testing Firecrawl API connection...');
    
    const apiKey = process.env.FIRECRAWL_API_KEY;
    
    if (!apiKey || apiKey.includes('your-api-key')) {
      this.results.firecrawl.status = 'not_configured';
      this.results.firecrawl.error = 'API key not configured';
      this.log('Firecrawl API key not configured', 'error');
      return;
    }

    try {
      const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          url: 'https://example.com',
          formats: ['markdown'],
          timeout: 10000
        }),
      });

      if (response.ok) {
        this.results.firecrawl.status = 'connected';
        this.log('Firecrawl API connection successful', 'success');
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      this.results.firecrawl.status = 'error';
      this.results.firecrawl.error = error.message;
      this.log(`Firecrawl API connection failed: ${error.message}`, 'error');
    }
  }

  async testPerplexity() {
    this.log('Testing Perplexity API connection...');
    
    const apiKey = process.env.PERPLEXITY_API_KEY;
    
    if (!apiKey || apiKey.includes('your-api-key')) {
      this.results.perplexity.status = 'not_configured';
      this.results.perplexity.error = 'API key not configured';
      this.log('Perplexity API key not configured', 'error');
      return;
    }

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            { role: 'user', content: 'Test connection' }
          ],
          max_tokens: 10
        }),
      });

      if (response.ok) {
        this.results.perplexity.status = 'connected';
        this.log('Perplexity API connection successful', 'success');
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      this.results.perplexity.status = 'error';
      this.results.perplexity.error = error.message;
      this.log(`Perplexity API connection failed: ${error.message}`, 'error');
    }
  }

  async testDataForSEO() {
    this.log('Testing DataForSEO API connection...');
    
    const login = process.env.DATAFORSEO_LOGIN;
    const password = process.env.DATAFORSEO_PASSWORD;
    
    if (!login || !password || login.includes('your_login') || password.includes('your_password')) {
      this.results.dataForSEO.status = 'not_configured';
      this.results.dataForSEO.error = 'Credentials not configured';
      this.log('DataForSEO credentials not configured', 'error');
      return;
    }

    try {
      const auth = Buffer.from(`${login}:${password}`).toString('base64');
      
      const response = await fetch('https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`,
        },
        body: JSON.stringify([{
          keyword: 'test',
          location_code: 2840,
          language_code: 'en'
        }]),
      });

      if (response.ok) {
        this.results.dataForSEO.status = 'connected';
        this.log('DataForSEO API connection successful', 'success');
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      this.results.dataForSEO.status = 'error';
      this.results.dataForSEO.error = error.message;
      this.log(`DataForSEO API connection failed: ${error.message}`, 'error');
    }
  }

  async runAllTests() {
    console.log('🔍 MCP API Connection Test');
    console.log('==========================');
    console.log('');

    // Test all APIs in parallel
    await Promise.all([
      this.testFirecrawl(),
      this.testPerplexity(),
      this.testDataForSEO()
    ]);

    console.log('');
    console.log('📊 Test Results Summary:');
    console.log('========================');

    Object.entries(this.results).forEach(([service, result]) => {
      const statusEmoji = {
        'connected': '✅',
        'not_configured': '⚠️',
        'error': '❌',
        'pending': '⏳'
      }[result.status] || '❓';

      console.log(`${statusEmoji} ${service.toUpperCase()}: ${result.status.toUpperCase()}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });

    console.log('');

    // Provide setup instructions if needed
    const notConfigured = Object.entries(this.results)
      .filter(([, result]) => result.status === 'not_configured')
      .map(([service]) => service);

    if (notConfigured.length > 0) {
      console.log('🔧 Setup Instructions:');
      console.log('======================');
      
      if (notConfigured.includes('firecrawl')) {
        console.log('1. Firecrawl API:');
        console.log('   - Sign up at: https://firecrawl.dev');
        console.log('   - Get API key from dashboard');
        console.log('   - Add to .env.local: FIRECRAWL_API_KEY=fc-your-key-here');
        console.log('');
      }
      
      if (notConfigured.includes('perplexity')) {
        console.log('2. Perplexity API:');
        console.log('   - Sign up at: https://docs.perplexity.ai');
        console.log('   - Generate API key in settings');
        console.log('   - Add to .env.local: PERPLEXITY_API_KEY=pplx-your-key-here');
        console.log('');
      }
      
      if (notConfigured.includes('dataForSEO')) {
        console.log('3. DataForSEO API:');
        console.log('   - Sign up at: https://dataforseo.com');
        console.log('   - Create API credentials');
        console.log('   - Add to .env.local: DATAFORSEO_LOGIN=your-login');
        console.log('   - Add to .env.local: DATAFORSEO_PASSWORD=your-password');
        console.log('');
      }
    }

    // Overall status
    const connected = Object.values(this.results).filter(r => r.status === 'connected').length;
    const total = Object.keys(this.results).length;
    
    console.log(`🎯 Overall Status: ${connected}/${total} services connected`);
    
    if (connected === total) {
      console.log('✅ All MCP services are ready for content generation!');
      return true;
    } else if (connected > 0) {
      console.log('⚠️  Some services available - limited content generation possible');
      return false;
    } else {
      console.log('❌ No MCP services configured - content generation will use demo mode');
      return false;
    }
  }

  async generateSampleContent() {
    this.log('Testing sample content generation...');
    
    const connected = Object.values(this.results).filter(r => r.status === 'connected').length;
    
    if (connected === 0) {
      this.log('Using demo mode for content generation example', 'error');
      
      // Demo content
      const demoContent = {
        title: "iPhone 15 Pro Review - Demo Mode",
        keywords: ["iPhone 15 Pro review", "Apple smartphone 2024"],
        outline: [
          "Overview and first impressions",
          "Design and build quality", 
          "Performance benchmarks",
          "Camera system analysis",
          "Battery life testing",
          "Final verdict and pricing"
        ],
        estimatedWordCount: 2500,
        targetAudience: "Tech enthusiasts and potential buyers"
      };
      
      console.log('');
      console.log('📝 Demo Content Structure:');
      console.log('===========================');
      console.log(JSON.stringify(demoContent, null, 2));
      
    } else {
      this.log(`${connected} services available - real content generation possible`, 'success');
      
      // Could make real API calls here if services are connected
      console.log('');
      console.log('🚀 Ready for live content generation with:');
      Object.entries(this.results).forEach(([service, result]) => {
        if (result.status === 'connected') {
          console.log(`   ✅ ${service.toUpperCase()}`);
        }
      });
    }
  }
}

// CLI interface
async function main() {
  const tester = new MCPTester();
  
  try {
    const allConnected = await tester.runAllTests();
    
    console.log('');
    await tester.generateSampleContent();
    
    if (allConnected) {
      console.log('');
      console.log('🚀 Next steps:');
      console.log('  1. Run: npm run gen:reviews');
      console.log('  2. Run: npm run gen:comparisons');
      console.log('  3. Run: npm run gen:best');
      console.log('  4. Deploy to Vercel');
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { MCPTester };