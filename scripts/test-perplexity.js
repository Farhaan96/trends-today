require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

console.log('🔧 Testing Perplexity API...\n');
console.log(
  'API Key prefix:',
  process.env.PERPLEXITY_API_KEY
    ? process.env.PERPLEXITY_API_KEY.substring(0, 15) + '...'
    : 'NOT FOUND'
);
console.log('='.repeat(50));

// Try the correct model names from Perplexity docs
const models = [
  'llama-3.1-sonar-small-128k-online',
  'llama-3.1-sonar-large-128k-online',
  'llama-3.1-sonar-huge-128k-online',
  'llama-3.1-8b-instruct',
  'llama-3.1-70b-instruct',
];

async function testModel(model) {
  try {
    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: model,
        messages: [{ role: 'user', content: 'What is 2+2?' }],
        max_tokens: 20,
        temperature: 0.1,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    console.log(`✅ SUCCESS with model: ${model}`);
    console.log(`   Response: ${response.data.choices[0].message.content}`);
    return true;
  } catch (e) {
    const error =
      e.response?.data?.error?.message ||
      e.response?.data?.message ||
      e.response?.statusText ||
      e.message;
    console.log(`❌ Failed with ${model}:`);
    console.log(`   Error: ${error}`);

    // If it's a 401, the key is invalid
    if (e.response?.status === 401) {
      console.log(
        '   🔑 This appears to be an authentication issue. Your API key may be invalid.'
      );
    }
    return false;
  }
}

async function runTests() {
  console.log('\nTesting models...\n');

  let found = false;
  for (const model of models) {
    const worked = await testModel(model);
    if (worked) {
      found = true;
      console.log('\n✨ Perplexity API is working correctly!');
      console.log(`   Working model: ${model}`);
      break;
    }
  }

  if (!found) {
    console.log('\n' + '='.repeat(50));
    console.log('⚠️  No working models found.\n');
    console.log('Possible issues:');
    console.log('1. The API key might be invalid or expired');
    console.log('2. Your account might not have access to these models');
    console.log('3. There might be a rate limit or quota issue');
    console.log('\n📝 Next steps:');
    console.log(
      '1. Verify your API key at: https://www.perplexity.ai/settings/api'
    );
    console.log('2. Check your usage and limits');
    console.log('3. Try generating a new API key');

    // Show the actual key (partially) for debugging
    if (process.env.PERPLEXITY_API_KEY) {
      console.log(
        `\nYour current key starts with: ${process.env.PERPLEXITY_API_KEY.substring(0, 20)}...`
      );
      console.log(
        'Make sure this matches what you see in the Perplexity dashboard.'
      );
    }
  }
}

runTests().catch(console.error);
