#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Testing Automation Pipeline...');
console.log('=====================================\n');

async function testAgent(agentName, description) {
  console.log(`🧪 Testing ${agentName}...`);
  console.log(`   ${description}\n`);

  return new Promise((resolve) => {
    const agentPath = path.join(__dirname, 'agents', `${agentName}.js`);
    const command = `node "${agentPath}"`;

    const child = exec(command, { timeout: 60000 }, (error, stdout, stderr) => {
      if (error) {
        console.log(`❌ ${agentName} failed: ${error.message}\n`);
        resolve(false);
      } else {
        console.log(`✅ ${agentName} completed successfully\n`);
        if (stdout) console.log(`Output: ${stdout.slice(-200)}...\n`);
        resolve(true);
      }
    });

    // Handle timeout
    setTimeout(() => {
      child.kill();
      console.log(`⏰ ${agentName} timed out (60s limit)\n`);
      resolve(false);
    }, 60000);
  });
}

async function runTests() {
  const tests = [
    {
      agent: 'news-scanner',
      description:
        'Scans tech news sources for trending topics and breaking news',
    },
    {
      agent: 'seo-finder',
      description: 'Finds zero-volume keywords and emerging SEO opportunities',
    },
    {
      agent: 'content-creator',
      description: 'Creates tech articles using research and templates',
      args: '--type=news --count=1',
    },
    {
      agent: 'quality-check',
      description: 'Validates content quality and SEO optimization',
    },
    {
      agent: 'product-tracker',
      description: 'Tracks new product announcements from major tech companies',
    },
  ];

  let passed = 0;
  let total = tests.length;

  for (const test of tests) {
    const success = await testAgent(test.agent, test.description);
    if (success) passed++;
  }

  console.log('📊 Test Results');
  console.log('===============');
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  console.log(`📈 Success Rate: ${Math.round((passed / total) * 100)}%\n`);

  if (passed === total) {
    console.log('🎉 All automation agents are working correctly!');
    console.log('🚀 Ready for automated content generation at scale.');
  } else {
    console.log('⚠️  Some agents need attention. Check the logs above.');
  }

  // Test API endpoints
  console.log('\n🌐 Testing API Endpoints...');
  await testApiEndpoints();
}

async function testApiEndpoints() {
  const endpoints = [
    'https://trendstoday.ca/api/test-perplexity',
    'https://trendstoday.ca/api/test-firecrawl',
    'https://trendstoday.ca/api/analytics',
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint);
      const name = endpoint.split('/').pop();

      if (response.ok) {
        console.log(`✅ ${name} endpoint working`);
      } else {
        console.log(`❌ ${name} endpoint failed (${response.status})`);
      }
    } catch (error) {
      const name = endpoint.split('/').pop();
      console.log(`❌ ${name} endpoint error: ${error.message}`);
    }
  }
}

// Run tests
runTests().catch(console.error);
