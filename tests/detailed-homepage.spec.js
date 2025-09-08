import { test, expect } from '@playwright/test';

test.describe('Detailed Homepage Analysis', () => {
  test('should capture full homepage with all articles', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take full page screenshot
    await page.screenshot({ 
      path: './screenshots/full-homepage.png',
      fullPage: true 
    });
    
    // Capture just the articles section
    const articlesSection = page.locator('.articles, .posts, main, [class*="article"]');
    if (await articlesSection.count() > 0) {
      await articlesSection.first().screenshot({ 
        path: './screenshots/articles-section.png' 
      });
    }
    
    // Find all images and check for broken ones
    const images = page.locator('img');
    const imageCount = await images.count();
    console.log(`Found ${imageCount} images on homepage`);
    
    for (let i = 0; i < Math.min(imageCount, 10); i++) {
      const img = images.nth(i);
      const src = await img.getAttribute('src');
      const alt = await img.getAttribute('alt');
      console.log(`Image ${i + 1}: src="${src}", alt="${alt}"`);
    }
  });
});