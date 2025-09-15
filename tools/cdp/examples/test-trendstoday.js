#!/usr/bin/env node

const CDPClient = require('../client.js');

async function testTrendsToday() {
  const client = new CDPClient({
    rateLimitMs: 800, // Slower for thorough testing
    defaultTimeoutMs: 30000,
  });

  try {
    console.log('🚀 Testing Trends Today website...');

    // Connect to Chrome
    await client.connect();

    // Navigate to homepage
    console.log('📡 Loading homepage: https://www.trendstoday.ca/');
    await client.open('https://www.trendstoday.ca/');

    // Wait for page to load
    await client.waitForLoad();
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Get basic page info
    const title = await client.getTitle();
    const url = await client.getCurrentUrl();
    console.log(`✓ Page Title: ${title}`);
    console.log(`✓ Current URL: ${url}`);

    // Test for common elements and potential issues
    console.log('\n🔍 Checking page elements...');

    const pageTests = await client.evaluate(`
      (function() {
        const results = {
          hasNavigation: !!document.querySelector('nav, .nav, .navigation'),
          hasHeader: !!document.querySelector('header, .header'),
          hasFooter: !!document.querySelector('footer, .footer'),
          hasMainContent: !!document.querySelector('main, .main, .content'),
          
          // Check for broken images
          brokenImages: [],
          totalImages: 0,
          
          // Check for articles/posts
          articles: [],
          
          // Performance checks
          loadTime: performance.now(),
          
          // Check for errors in console (basic)
          hasErrors: false
        };
        
        // Count and check images
        const images = document.querySelectorAll('img');
        results.totalImages = images.length;
        
        images.forEach((img, index) => {
          if (!img.complete || img.naturalWidth === 0) {
            results.brokenImages.push({
              index: index + 1,
              src: img.src,
              alt: img.alt || 'No alt text'
            });
          }
        });
        
        // Find articles/blog posts
        const articleSelectors = [
          'article',
          '.post',
          '.blog-post', 
          '.article',
          '[data-testid*="article"]',
          '.card',
          'h1, h2, h3'
        ];
        
        articleSelectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            results.articles.push({
              selector: selector,
              count: elements.length,
              titles: Array.from(elements).slice(0, 5).map(el => 
                el.textContent?.trim().substring(0, 80) || 'No text'
              )
            });
          }
        });
        
        // Check for loading indicators or errors
        const errorElements = document.querySelectorAll('.error, .not-found, .404');
        results.hasErrors = errorElements.length > 0;
        
        return results;
      })();
    `);

    // Report results
    console.log('\n📊 Test Results:');
    console.log(
      `✓ Navigation: ${pageTests.hasNavigation ? 'Found' : 'Not found'}`
    );
    console.log(`✓ Header: ${pageTests.hasHeader ? 'Found' : 'Not found'}`);
    console.log(`✓ Footer: ${pageTests.hasFooter ? 'Found' : 'Not found'}`);
    console.log(
      `✓ Main Content: ${pageTests.hasMainContent ? 'Found' : 'Not found'}`
    );

    console.log(`\n🖼️  Images: ${pageTests.totalImages} total`);
    if (pageTests.brokenImages.length > 0) {
      console.log(`❌ Broken Images Found (${pageTests.brokenImages.length}):`);
      pageTests.brokenImages.forEach((img) => {
        console.log(`   - Image ${img.index}: ${img.src}`);
        console.log(`     Alt text: ${img.alt}`);
      });
    } else {
      console.log(`✅ All images loading correctly`);
    }

    console.log(`\n📄 Content Analysis:`);
    if (pageTests.articles.length > 0) {
      pageTests.articles.forEach((article) => {
        console.log(
          `✓ Found ${article.count} elements with selector: ${article.selector}`
        );
        if (article.titles.length > 0) {
          console.log('   Titles/Content:');
          article.titles.forEach((title) => {
            console.log(`   - ${title}${title.length >= 80 ? '...' : ''}`);
          });
        }
      });
    } else {
      console.log('⚠️  No articles or blog posts detected');
    }

    console.log(
      `\n⚡ Performance: Page loaded in ${pageTests.loadTime.toFixed(0)}ms`
    );
    console.log(
      `${pageTests.hasErrors ? '❌' : '✅'} Error Status: ${pageTests.hasErrors ? 'Errors detected' : 'No errors detected'}`
    );

    // Take a screenshot
    console.log('\n📸 Taking screenshot...');
    await client.screenshot('../../screenshots/trendstoday-test.png');
    console.log('✓ Screenshot saved to screenshots/trendstoday-test.png');

    // Test mobile responsiveness (basic)
    console.log('\n📱 Testing mobile viewport...');
    await client.evaluate(`
      document.documentElement.style.width = '375px';
      document.body.style.width = '375px';
    `);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await client.screenshot('../../screenshots/trendstoday-mobile.png');
    console.log('✓ Mobile screenshot saved');

    console.log('\n✅ Website testing complete!');
  } catch (error) {
    console.error('❌ Error testing website:', error.message);

    // Try to get current page info for debugging
    try {
      const currentUrl = await client.getCurrentUrl();
      const title = await client.getTitle();
      console.error(`Debug info - URL: ${currentUrl}, Title: ${title}`);
    } catch (debugError) {
      console.error('Could not get debug info');
    }
  } finally {
    await client.disconnect();
  }
}

testTrendsToday().catch(console.error);
