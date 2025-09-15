import { test, expect } from '@playwright/test';

test.describe('Homepage Tests', () => {
  test('should load the homepage successfully', async ({ page }) => {
    await page.goto('/');

    // Check if the page loads
    await expect(page).toHaveTitle(/Trends Today/i);

    // Take a screenshot for debugging
    await page.screenshot({ path: './screenshots/homepage-loaded.png' });
  });

  test('should display navigation elements', async ({ page }) => {
    await page.goto('/');

    // Check for common navigation elements
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Take screenshot of navigation
    await page.screenshot({ path: './screenshots/navigation-elements.png' });
  });

  test('should display main content area', async ({ page }) => {
    await page.goto('/');

    // Check for main content
    const main = page.locator('main, .content, .main-content');
    await expect(main.first()).toBeVisible();

    // Take screenshot of main content
    await page.screenshot({ path: './screenshots/main-content.png' });
  });
});
