const { test, expect } = require('@playwright/test');

test.describe('Trends Today Website Comprehensive Test', () => {
  test('Homepage functionality and content analysis', async ({ page }) => {
    console.log('🚀 Starting comprehensive test of https://www.trendstoday.ca/');
    
    // Navigate to homepage
    await page.goto('https://www.trendstoday.ca/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'screenshots/trendstoday-homepage.png', 
      fullPage: true 
    });
    
    // Basic page checks
    await expect(page).toHaveTitle(/Trends Today/i);
    console.log('✓ Page title contains "Trends Today"');
    
    const url = page.url();
    console.log(`✓ Current URL: ${url}`);
    
    // Check for essential page elements
    const hasNav = await page.locator('nav, .nav, .navigation').count() > 0;
    const hasHeader = await page.locator('header, .header').count() > 0;
    const hasFooter = await page.locator('footer, .footer').count() > 0;
    const hasMain = await page.locator('main, .main, .content').count() > 0;
    
    console.log(`✓ Navigation: ${hasNav ? 'Found' : 'Not found'}`);
    console.log(`✓ Header: ${hasHeader ? 'Found' : 'Not found'}`);
    console.log(`✓ Footer: ${hasFooter ? 'Found' : 'Not found'}`);
    console.log(`✓ Main content: ${hasMain ? 'Found' : 'Not found'}`);
    
    // Check for broken images
    const images = await page.locator('img').all();
    const brokenImages = [];
    
    console.log(`🖼️ Checking ${images.length} images...`);
    
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const src = await img.getAttribute('src');
      const alt = await img.getAttribute('alt');
      
      try {
        // Check if image loads successfully
        const isVisible = await img.isVisible();
        const naturalWidth = await img.evaluate(el => el.naturalWidth);
        const naturalHeight = await img.evaluate(el => el.naturalHeight);
        
        if (!isVisible || naturalWidth === 0 || naturalHeight === 0) {
          brokenImages.push({
            index: i + 1,
            src: src || 'No src',
            alt: alt || 'No alt text'
          });
        }
      } catch (error) {
        brokenImages.push({
          index: i + 1,
          src: src || 'No src',
          alt: alt || 'No alt text',
          error: error.message
        });
      }
    }
    
    if (brokenImages.length > 0) {
      console.log(`❌ Found ${brokenImages.length} broken/problematic images:`);
      brokenImages.forEach(img => {
        console.log(`   - Image ${img.index}: ${img.src}`);
        console.log(`     Alt: ${img.alt}`);
        if (img.error) console.log(`     Error: ${img.error}`);
      });
    } else {
      console.log('✅ All images appear to be loading correctly');
    }
    
    // Check for articles/blog posts
    const articleSelectors = [
      'article',
      '.post', 
      '.blog-post',
      '.card',
      '[class*="article"]',
      'h1, h2, h3'
    ];
    
    console.log('\n📄 Content Analysis:');
    for (const selector of articleSelectors) {
      const elements = await page.locator(selector).all();
      if (elements.length > 0) {
        console.log(`✓ Found ${elements.length} elements with selector: ${selector}`);
        
        // Get first few titles/content
        const titles = [];
        for (let i = 0; i < Math.min(elements.length, 5); i++) {
          try {
            const text = await elements[i].textContent();
            if (text && text.trim().length > 0) {
              titles.push(text.trim().substring(0, 80));
            }
          } catch (e) {
            // Skip if can't get text
          }
        }
        
        if (titles.length > 0) {
          console.log('   Sample content:');
          titles.forEach(title => {
            console.log(`   - ${title}${title.length >= 80 ? '...' : ''}`);
          });
        }
      }
    }
    
    // Check page performance
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        totalTime: navigation.loadEventEnd - navigation.fetchStart
      };
    });
    
    console.log(`\n⚡ Performance Metrics:`);
    console.log(`   - Load Time: ${performanceMetrics.loadTime.toFixed(0)}ms`);
    console.log(`   - DOM Content Loaded: ${performanceMetrics.domContentLoaded.toFixed(0)}ms`);
    console.log(`   - Total Time: ${performanceMetrics.totalTime.toFixed(0)}ms`);
    
    // Test mobile responsiveness
    console.log('\n📱 Testing mobile responsiveness...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: 'screenshots/trendstoday-mobile.png',
      fullPage: true 
    });
    
    // Check if mobile-friendly elements exist
    const mobileMenu = await page.locator('[class*="mobile"], [class*="hamburger"], [class*="menu-toggle"]').count();
    console.log(`✓ Mobile menu elements: ${mobileMenu > 0 ? 'Found' : 'Not found'}`);
    
    // Reset to desktop view
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Check for common Next.js/React indicators
    const techStack = await page.evaluate(() => {
      const indicators = {
        nextjs: !!window.__NEXT_DATA__ || document.querySelector('[id="__next"]'),
        react: !!window.React || !!document.querySelector('[data-reactroot]'),
        hasServiceWorker: 'serviceWorker' in navigator,
        hasManifest: !!document.querySelector('link[rel="manifest"]')
      };
      return indicators;
    });
    
    console.log(`\n🔧 Technical Stack:`);
    console.log(`   - Next.js: ${techStack.nextjs ? 'Detected' : 'Not detected'}`);
    console.log(`   - React: ${techStack.react ? 'Detected' : 'Not detected'}`);
    console.log(`   - Service Worker: ${techStack.hasServiceWorker ? 'Available' : 'Not available'}`);
    console.log(`   - Web Manifest: ${techStack.hasManifest ? 'Found' : 'Not found'}`);
    
    // Check for SEO elements
    const seoData = await page.evaluate(() => {
      return {
        title: document.title,
        metaDescription: document.querySelector('meta[name="description"]')?.content || 'None',
        ogTitle: document.querySelector('meta[property="og:title"]')?.content || 'None',
        ogDescription: document.querySelector('meta[property="og:description"]')?.content || 'None',
        ogImage: document.querySelector('meta[property="og:image"]')?.content || 'None',
        canonicalUrl: document.querySelector('link[rel="canonical"]')?.href || 'None',
        hasStructuredData: !!document.querySelector('script[type="application/ld+json"]')
      };
    });
    
    console.log(`\n🔍 SEO Analysis:`);
    console.log(`   - Title: ${seoData.title}`);
    console.log(`   - Meta Description: ${seoData.metaDescription.substring(0, 100)}${seoData.metaDescription.length > 100 ? '...' : ''}`);
    console.log(`   - Open Graph Title: ${seoData.ogTitle}`);
    console.log(`   - Open Graph Image: ${seoData.ogImage !== 'None' ? 'Present' : 'Missing'}`);
    console.log(`   - Canonical URL: ${seoData.canonicalUrl !== 'None' ? 'Present' : 'Missing'}`);
    console.log(`   - Structured Data: ${seoData.hasStructuredData ? 'Present' : 'Missing'}`);
    
    console.log('\n✅ Comprehensive website test completed!');
  });
  
  test('Test key navigation and links', async ({ page }) => {
    await page.goto('https://www.trendstoday.ca/');
    
    // Find and test main navigation links
    const navLinks = await page.locator('nav a, .nav a, .navigation a, header a').all();
    console.log(`🔗 Found ${navLinks.length} navigation links`);
    
    const workingLinks = [];
    const brokenLinks = [];
    
    // Test first 10 links to avoid overwhelming
    const linksToTest = navLinks.slice(0, 10);
    
    for (let i = 0; i < linksToTest.length; i++) {
      const link = linksToTest[i];
      try {
        const href = await link.getAttribute('href');
        const text = await link.textContent();
        
        if (href && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
          console.log(`Testing link: ${text?.trim()} (${href})`);
          
          // Test if it's an internal link
          if (href.startsWith('/') || href.includes('trendstoday.ca')) {
            try {
              await link.click({ timeout: 5000 });
              await page.waitForTimeout(2000);
              
              const newUrl = page.url();
              workingLinks.push({ text: text?.trim(), href, newUrl });
              
              // Go back to homepage
              await page.goto('https://www.trendstoday.ca/');
              await page.waitForTimeout(1000);
              
            } catch (clickError) {
              brokenLinks.push({ text: text?.trim(), href, error: clickError.message });
            }
          } else {
            // External link - just log it
            workingLinks.push({ text: text?.trim(), href, type: 'external' });
          }
        }
      } catch (error) {
        console.log(`Error testing link: ${error.message}`);
      }
    }
    
    console.log(`✅ Working links: ${workingLinks.length}`);
    console.log(`❌ Broken links: ${brokenLinks.length}`);
    
    if (brokenLinks.length > 0) {
      console.log('Broken links found:');
      brokenLinks.forEach(link => {
        console.log(`  - ${link.text}: ${link.href} (${link.error})`);
      });
    }
  });
});