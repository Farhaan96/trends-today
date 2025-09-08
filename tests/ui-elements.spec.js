import { test, expect } from '@playwright/test';

test.describe('UI Elements Tests', () => {
  test('should check for loading states', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of fully loaded page
    await page.screenshot({ path: './screenshots/page-loaded.png' });
    
    // Check for any loading spinners that might still be visible
    const loaders = page.locator('.loader, .loading, .spinner, [class*="load"]');
    const loaderCount = await loaders.count();
    
    // If loaders exist, they shouldn't be visible after page load
    if (loaderCount > 0) {
      await expect(loaders.first()).toBeHidden();
    }
  });

  test('should check for interactive elements', async ({ page }) => {
    await page.goto('/');
    
    // Check for buttons
    const buttons = page.locator('button, .btn, [role="button"]');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      // Take screenshot showing buttons
      await page.screenshot({ path: './screenshots/interactive-buttons.png' });
      
      // Test hover state on first button
      await buttons.first().hover();
      await page.screenshot({ path: './screenshots/button-hover-state.png' });
    }
    
    // Check for form elements
    const inputs = page.locator('input, textarea, select');
    const inputCount = await inputs.count();
    
    if (inputCount > 0) {
      await page.screenshot({ path: './screenshots/form-elements.png' });
    }
  });

  test('should check for accessibility elements', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper headings hierarchy
    const h1 = page.locator('h1');
    const h1Count = await h1.count();
    
    if (h1Count > 0) {
      await expect(h1.first()).toBeVisible();
    }
    
    // Check for alt text on images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < Math.min(imageCount, 3); i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      
      if (!alt || alt.trim() === '') {
        console.log(`Image ${i + 1} missing alt text`);
      }
    }
    
    // Take screenshot for accessibility review
    await page.screenshot({ path: './screenshots/accessibility-check.png' });
  });

  test('should check for console errors', async ({ page }) => {
    const consoleErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot if there are console errors
    if (consoleErrors.length > 0) {
      await page.screenshot({ path: './screenshots/console-errors.png' });
      console.log('Console errors found:', consoleErrors);
    }
    
    // The test will continue even with console errors, but log them
    await page.screenshot({ path: './screenshots/final-state.png' });
  });
});