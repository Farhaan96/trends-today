#!/usr/bin/env node

// Test Firecrawl API directly
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

const { FirecrawlDirect } = require('../lib/firecrawl-direct.js');

async function main() {
  console.log('🔥 Firecrawl API Test');
  console.log('====================');
  console.log('');

  const firecrawl = new FirecrawlDirect();

  // Test 1: Basic connection
  console.log('1️⃣ Testing basic API connection...');
  const connectionTest = await firecrawl.testConnection();
  
  if (connectionTest.success) {
    console.log('✅ Firecrawl API is working!');
    console.log(`✨ Response: ${connectionTest.message}`);
  } else {
    console.log('❌ Connection failed:', connectionTest.error);
    if (connectionTest.error.includes('API key')) {
      console.log('');
      console.log('🔧 Next steps:');
      console.log('1. Make sure you added FIRECRAWL_API_KEY to Vercel');
      console.log('2. Redeploy your site');
      console.log('3. Test in production environment');
      return;
    }
  }

  console.log('');
  
  // Test 2: Scrape Apple product page
  console.log('2️⃣ Testing Apple.com product scraping...');
  const appleTest = await firecrawl.scrapeAppleProduct('iPhone 15 Pro');
  
  if (appleTest.success) {
    console.log('✅ Successfully scraped Apple.com!');
    console.log(`📄 Title: ${appleTest.title}`);
    console.log(`🔍 Specs found: ${Object.keys(appleTest.specs).length}`);
    if (Object.keys(appleTest.specs).length > 0) {
      console.log('📱 Extracted specs:');
      Object.entries(appleTest.specs).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
    }
  } else if (appleTest.demo) {
    console.log('⚠️ Using demo mode (no API key)');
  } else {
    console.log('❌ Apple scraping failed:', appleTest.error);
  }

  console.log('');
  
  // Test 3: Analyze TechRadar for UI insights
  console.log('3️⃣ Testing TechRadar.com analysis...');
  const techRadarTest = await firecrawl.analyzeTechRadar();
  
  if (techRadarTest.success) {
    console.log('✅ Successfully analyzed TechRadar!');
    console.log(`📊 Articles found: ${techRadarTest.articlesFound}`);
    console.log('🎨 UI Insights:');
    Object.entries(techRadarTest.insights).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });
    console.log('');
    console.log('📰 Sample headlines:');
    techRadarTest.sampleArticles.forEach((article, i) => {
      console.log(`   ${i + 1}. ${article}`);
    });
  } else if (techRadarTest.demo) {
    console.log('⚠️ Using demo mode (no API key)');
  } else {
    console.log('❌ TechRadar analysis failed:', techRadarTest.error);
  }

  console.log('');
  console.log('🎯 Summary:');
  if (connectionTest.success) {
    console.log('✅ Firecrawl API is properly configured and working!');
    console.log('🚀 Ready for live content generation');
    console.log('💡 Ready for UI analysis and improvements');
  } else {
    console.log('⚠️ API not yet configured - still using demo mode');
    console.log('🔧 Add your Firecrawl API key to Vercel to enable live features');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };