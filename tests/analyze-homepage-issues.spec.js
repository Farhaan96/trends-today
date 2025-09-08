const { test, expect } = require('@playwright/test');

test.describe('Trends Today Homepage Issues Analysis', () => {
  test('Identify grey rev squares and image problems', async ({ page }) => {
    console.log('🔍 Analyzing homepage for grey "rev" squares and image issues...');
    
    await page.goto('https://www.trendstoday.ca/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Take full page screenshot for reference
    await page.screenshot({ 
      path: 'screenshots/homepage-analysis.png', 
      fullPage: true 
    });
    
    // Find all article cards/containers
    const articleSelectors = [
      'article',
      '.card',
      '.post',
      '[class*="article"]',
      '[class*="review"]'
    ];
    
    let allArticles = [];
    
    for (const selector of articleSelectors) {
      const elements = await page.locator(selector).all();
      if (elements.length > 0) {
        console.log(`Found ${elements.length} elements with selector: ${selector}`);
        
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          
          try {
            // Get article details
            const articleData = await element.evaluate(el => {
              const title = el.querySelector('h1, h2, h3, .title, [class*="title"]')?.textContent?.trim();
              const images = Array.from(el.querySelectorAll('img')).map(img => ({
                src: img.src,
                alt: img.alt,
                width: img.width,
                height: img.height
              }));
              
              // Look for "rev" text or grey squares
              const textContent = el.textContent;
              const hasRevText = textContent.includes('rev') || textContent.includes('REV');
              
              // Check for grey elements or placeholders
              const greyElements = Array.from(el.querySelectorAll('*')).filter(node => {
                const styles = window.getComputedStyle(node);
                const bgColor = styles.backgroundColor;
                const color = styles.color;
                return bgColor.includes('128') || bgColor.includes('grey') || bgColor.includes('gray') ||
                       color.includes('128') || color.includes('grey') || color.includes('gray');
              }).map(node => ({
                tagName: node.tagName,
                className: node.className,
                textContent: node.textContent?.trim(),
                backgroundColor: window.getComputedStyle(node).backgroundColor,
                color: window.getComputedStyle(node).color
              }));
              
              return {
                title,
                images,
                hasRevText,
                greyElements,
                innerHTML: el.innerHTML.substring(0, 500) // First 500 chars for analysis
              };
            });
            
            allArticles.push({
              selector,
              index: i,
              ...articleData
            });
            
          } catch (error) {
            console.log(`Error analyzing article ${i}: ${error.message}`);
          }
        }
      }
    }
    
    // Analyze results
    console.log(`\n📊 Found ${allArticles.length} total articles/cards`);
    
    // Look for grey "rev" issues
    const greyRevIssues = allArticles.filter(article => 
      article.hasRevText || article.greyElements.length > 0
    );
    
    if (greyRevIssues.length > 0) {
      console.log(`\n⚠️ Found ${greyRevIssues.length} articles with potential grey "rev" issues:`);
      
      greyRevIssues.forEach((article, index) => {
        console.log(`\nArticle ${index + 1}:`);
        console.log(`  Title: ${article.title}`);
        console.log(`  Has "rev" text: ${article.hasRevText}`);
        console.log(`  Grey elements found: ${article.greyElements.length}`);
        
        if (article.greyElements.length > 0) {
          console.log(`  Grey elements:`);
          article.greyElements.forEach(el => {
            console.log(`    - ${el.tagName}.${el.className}: "${el.textContent}" (bg: ${el.backgroundColor}, color: ${el.color})`);
          });
        }
      });
    }
    
    // Analyze images for duplicates and mismatches
    console.log(`\n🖼️ Image Analysis:`);
    const imageMap = new Map();
    const duplicateImages = [];
    
    allArticles.forEach(article => {
      article.images.forEach(img => {
        if (img.src && img.src !== '') {
          if (imageMap.has(img.src)) {
            duplicateImages.push({
              src: img.src,
              articles: [imageMap.get(img.src), article.title]
            });
          } else {
            imageMap.set(img.src, article.title);
          }
        }
      });
    });
    
    if (duplicateImages.length > 0) {
      console.log(`\n❌ Found ${duplicateImages.length} duplicate images:`);
      duplicateImages.forEach(dup => {
        console.log(`  Image: ${dup.src}`);
        console.log(`  Used in: ${dup.articles.join(' AND ')}`);
      });
    }
    
    // List all articles with their images for manual review
    console.log(`\n📝 All Articles and Their Images:`);
    allArticles.forEach((article, index) => {
      if (article.title) {
        console.log(`\n${index + 1}. "${article.title}"`);
        if (article.images.length > 0) {
          article.images.forEach((img, imgIndex) => {
            const filename = img.src.split('/').pop();
            console.log(`     Image ${imgIndex + 1}: ${filename} (${img.alt || 'No alt text'})`);
          });
        } else {
          console.log(`     No images found`);
        }
      }
    });
    
    // Take screenshots of specific problem areas if found
    if (greyRevIssues.length > 0) {
      console.log(`\n📸 Taking screenshots of problem areas...`);
      
      for (let i = 0; i < Math.min(greyRevIssues.length, 3); i++) {
        const issue = greyRevIssues[i];
        try {
          const element = page.locator(issue.selector).nth(issue.index);
          await element.screenshot({ 
            path: `screenshots/grey-rev-issue-${i + 1}.png` 
          });
          console.log(`✓ Screenshot saved for issue ${i + 1}`);
        } catch (error) {
          console.log(`Could not screenshot issue ${i + 1}: ${error.message}`);
        }
      }
    }
    
    console.log(`\n✅ Homepage analysis complete!`);
  });
});