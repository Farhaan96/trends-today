import { test, expect } from '@playwright/test';

test.describe('Blog Navigation Tests', () => {
  test('should navigate to blog posts', async ({ page }) => {
    await page.goto('/');
    
    // Look for blog post links
    const postLinks = page.locator('a[href*="/post"], a[href*="/blog"], .post-link, .blog-link');
    const linkCount = await postLinks.count();
    
    if (linkCount > 0) {
      // Click the first blog post link
      await postLinks.first().click();
      
      // Wait for navigation
      await page.waitForLoadState('networkidle');
      
      // Take screenshot of blog post
      await page.screenshot({ path: './screenshots/blog-post-page.png' });
      
      // Check if we're on a blog post page
      await expect(page.url()).toMatch(/\/(post|blog|article)/);
    }
  });

  test('should display blog post content', async ({ page }) => {
    await page.goto('/');
    
    // Look for blog posts on homepage
    const posts = page.locator('.post, .article, .blog-item, [class*="post"]');
    const postCount = await posts.count();
    
    if (postCount > 0) {
      // Take screenshot showing blog posts
      await page.screenshot({ path: './screenshots/blog-posts-listing.png' });
      
      // Check that posts are visible
      await expect(posts.first()).toBeVisible();
    }
  });

  test('should handle responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await page.screenshot({ path: './screenshots/mobile-view.png' });
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    
    await page.screenshot({ path: './screenshots/tablet-view.png' });
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();
    
    await page.screenshot({ path: './screenshots/desktop-view.png' });
  });
});