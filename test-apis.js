#!/usr/bin/env node

// Test script for image APIs
require('dotenv').config({ path: '.env.local' });

const https = require('https');
const fetch = require('node-fetch');

// Test Unsplash API
async function testUnsplash() {
  const apiKey = process.env.UNSPLASH_ACCESS_KEY;
  
  if (!apiKey || apiKey === 'YOUR_ACCESS_KEY_HERE') {
    console.log('❌ Unsplash: No valid API key found');
    return false;
  }
  
  try {
    const response = await fetch(`https://api.unsplash.com/photos/random?client_id=${apiKey}`);
    
    if (response.status === 200) {
      const data = await response.json();
      console.log('✅ Unsplash API working!');
      console.log(`   Photo URL: ${data.urls?.regular}`);
      return true;
    } else {
      console.log(`❌ Unsplash API error: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Unsplash connection error: ${error.message}`);
    return false;
  }
}

// Test Pexels API
async function testPexels() {
  const apiKey = process.env.PEXELS_API_KEY;
  
  if (!apiKey || apiKey === 'YOUR_PEXELS_API_KEY_HERE') {
    console.log('❌ Pexels: No valid API key found');
    return false;
  }
  
  try {
    const response = await fetch('https://api.pexels.com/v1/search?query=technology&per_page=1', {
      headers: {
        'Authorization': apiKey
      }
    });
    
    if (response.status === 200) {
      const data = await response.json();
      console.log('✅ Pexels API working!');
      if (data.photos && data.photos[0]) {
        console.log(`   Photo URL: ${data.photos[0].src.large}`);
      }
      return true;
    } else {
      console.log(`❌ Pexels API error: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Pexels connection error: ${error.message}`);
    return false;
  }
}

// Test Google Gemini API (if available)
async function testGemini() {
  const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey.includes('YOUR_')) {
    console.log('ℹ️  Google Gemini/Nano Banana: No API key configured');
    return false;
  }
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    
    if (response.status === 200) {
      console.log('✅ Google Gemini API key valid!');
      console.log('   You can use Nano Banana (gemini-2.5-flash-image-preview) for image generation');
      return true;
    } else {
      console.log(`❌ Google Gemini API error: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Google Gemini connection error: ${error.message}`);
    return false;
  }
}

// Main test function
async function testAllAPIs() {
  console.log('🔍 Testing Image API Connections...\n');
  console.log('='.repeat(50));
  
  const results = {
    unsplash: await testUnsplash(),
    pexels: await testPexels(),
    gemini: await testGemini()
  };
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 API Test Summary:');
  console.log(`   Unsplash: ${results.unsplash ? '✅ Working' : '❌ Not working'}`);
  console.log(`   Pexels: ${results.pexels ? '✅ Working' : '❌ Not working'}`);
  console.log(`   Google Gemini: ${results.gemini ? '✅ Working' : 'ℹ️  Not configured'}`);
  
  const workingAPIs = Object.values(results).filter(r => r).length;
  console.log(`\n✨ ${workingAPIs}/3 APIs are working`);
  
  if (workingAPIs > 0) {
    console.log('\n🚀 Your blog can now source high-quality, contextual images!');
    console.log('   Run: npm run agents:batch to generate content with proper images');
  }
  
  if (!results.gemini) {
    console.log('\n💡 To enable Nano Banana (Gemini 2.5 Flash Image):');
    console.log('   1. Get API key from: https://aistudio.google.com');
    console.log('   2. Add to .env.local: GOOGLE_AI_API_KEY=your_key_here');
    console.log('   3. Cost: $0.039 per generated image');
  }
}

// Run tests
testAllAPIs().catch(console.error);