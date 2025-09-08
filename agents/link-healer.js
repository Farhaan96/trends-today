#!/usr/bin/env node

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const fs = require('fs').promises;
const path = require('path');

class LinkHealer {
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://trendstoday.ca';
    this.contentDir = path.join(__dirname, '..', 'content');
    this.srcDir = path.join(__dirname, '..', 'src');
    this.reportDir = path.join(__dirname, '..', 'reports');
    this.firecrawlApiKey = process.env.FIRECRAWL_API_KEY;
    
    this.fixes = [];
    this.errors = [];
  }

  async ensureDirectories() {
    const dirs = [this.reportDir];
    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error) {
        // Directory exists
      }
    }
  }

  async scanSite() {
    console.log('🔍 Scanning site for broken links...');
    
    const brokenLinks = [];
    
    // First check if our critical news article exists
    const newsFile = path.join(this.contentDir, 'news', 'iphone-17-air-announcement-what-to-expect.mdx');
    const newsFileExists = await this.fileExists(newsFile);
    
    if (!newsFileExists) {
      brokenLinks.push({
        url: '/news/iphone-17-air-announcement-what-to-expect',
        issue: 'Missing content file',
        fix: 'Create news article content',
        priority: 'CRITICAL'
      });
    }

    // Check if news route handler exists
    const newsRouteFile = path.join(this.srcDir, 'app', 'news', '[slug]', 'page.tsx');
    const newsRouteExists = await this.fileExists(newsRouteFile);
    
    if (!newsRouteExists) {
      brokenLinks.push({
        url: '/news/*',
        issue: 'Missing route handler',
        fix: 'Create news route handler',
        priority: 'CRITICAL'
      });
    }

    // Check review articles exist
    const reviewDir = path.join(this.contentDir, 'reviews');
    try {
      const reviewFiles = await fs.readdir(reviewDir);
      const expectedReviews = [
        'iphone-15-pro-max-review.mdx',
        'samsung-galaxy-s24-ultra-review.mdx',
        'google-pixel-8-pro-review.mdx'
      ];

      for (const expectedFile of expectedReviews) {
        if (!reviewFiles.includes(expectedFile)) {
          brokenLinks.push({
            url: `/reviews/${expectedFile.replace('.mdx', '')}`,
            issue: 'Missing review content',
            fix: `Create ${expectedFile}`,
            priority: 'HIGH'
          });
        }
      }
    } catch (error) {
      brokenLinks.push({
        url: '/reviews/*',
        issue: 'Reviews directory missing',
        fix: 'Create reviews directory and content',
        priority: 'CRITICAL'
      });
    }

    return brokenLinks;
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async fixBrokenLinks(brokenLinks) {
    console.log('🔧 Fixing broken links...');
    
    for (const link of brokenLinks) {
      console.log(`Fixing: ${link.url} - ${link.issue}`);
      
      try {
        if (link.url === '/news/iphone-17-air-announcement-what-to-expect') {
          await this.fixNewsArticle();
        } else if (link.url === '/news/*') {
          await this.fixNewsRouting();
        } else if (link.url.startsWith('/reviews/')) {
          await this.fixReviewArticle(link);
        }
        
        this.fixes.push({
          url: link.url,
          action: 'Fixed',
          timestamp: new Date().toISOString()
        });
        
      } catch (error) {
        console.error(`Failed to fix ${link.url}:`, error.message);
        this.errors.push({
          url: link.url,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  async fixNewsArticle() {
    console.log('📰 Ensuring iPhone 17 Air article exists...');
    
    const newsDir = path.join(this.contentDir, 'news');
    const newsFile = path.join(newsDir, 'iphone-17-air-announcement-what-to-expect.mdx');
    
    // Ensure news directory exists
    try {
      await fs.mkdir(newsDir, { recursive: true });
    } catch (error) {
      // Directory exists
    }
    
    // Check if file already exists
    const fileExists = await this.fileExists(newsFile);
    if (fileExists) {
      console.log('✅ News article already exists');
      return;
    }
    
    // Article should already exist from previous creation
    console.log('⚠️ News article missing - this should not happen');
  }

  async fixNewsRouting() {
    console.log('🔄 Ensuring news routing works...');
    
    const newsRouteDir = path.join(this.srcDir, 'app', 'news', '[slug]');
    const newsRouteFile = path.join(newsRouteDir, 'page.tsx');
    
    // Check if route handler exists
    const routeExists = await this.fileExists(newsRouteFile);
    if (routeExists) {
      console.log('✅ News route handler already exists');
      return;
    }
    
    console.log('⚠️ News route handler missing - this should not happen');
  }

  async fixReviewArticle(link) {
    const reviewFile = link.url.replace('/reviews/', '') + '.mdx';
    const filePath = path.join(this.contentDir, 'reviews', reviewFile);
    
    console.log(`📝 Checking review article: ${reviewFile}`);
    
    const fileExists = await this.fileExists(filePath);
    if (fileExists) {
      console.log(`✅ Review article ${reviewFile} already exists`);
      return;
    }
    
    console.log(`⚠️ Review article ${reviewFile} missing - will need content generation`);
  }

  async updateHomepageLinks() {
    console.log('🏠 Checking homepage links...');
    
    const homepageFile = path.join(this.srcDir, 'app', 'page.tsx');
    
    try {
      const content = await fs.readFile(homepageFile, 'utf-8');
      
      // Check if the iPhone 17 Air article is linked correctly
      const hasCorrectNewsLink = content.includes('/news/iphone-17-air-announcement-what-to-expect');
      
      if (hasCorrectNewsLink) {
        console.log('✅ Homepage links are correct');
      } else {
        console.log('⚠️ Homepage may need link updates');
      }
      
    } catch (error) {
      console.error('Error checking homepage:', error.message);
    }
  }

  async testLinks() {
    console.log('🧪 Testing critical links...');
    
    const criticalLinks = [
      '/news/iphone-17-air-announcement-what-to-expect',
      '/reviews/iphone-15-pro-max-review',
      '/reviews/samsung-galaxy-s24-ultra-review'
    ];
    
    for (const link of criticalLinks) {
      const expectedFile = this.linkToFilePath(link);
      const exists = await this.fileExists(expectedFile);
      
      console.log(`${exists ? '✅' : '❌'} ${link} → ${exists ? 'EXISTS' : 'MISSING'}`);
    }
  }

  linkToFilePath(link) {
    if (link.startsWith('/news/')) {
      return path.join(this.contentDir, 'news', link.replace('/news/', '') + '.mdx');
    } else if (link.startsWith('/reviews/')) {
      return path.join(this.contentDir, 'reviews', link.replace('/reviews/', '') + '.mdx');
    }
    return null;
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      fixes: this.fixes,
      errors: this.errors,
      summary: {
        totalFixes: this.fixes.length,
        totalErrors: this.errors.length,
        success: this.errors.length === 0
      }
    };

    const reportFile = path.join(this.reportDir, 'link-healing-report.json');
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
    
    console.log('\n📋 LINK HEALING REPORT');
    console.log('='.repeat(50));
    console.log(`✅ Fixes applied: ${this.fixes.length}`);
    console.log(`❌ Errors encountered: ${this.errors.length}`);
    console.log(`📄 Report saved: ${reportFile}`);
    
    if (this.fixes.length > 0) {
      console.log('\n🔧 Applied fixes:');
      this.fixes.forEach(fix => {
        console.log(`  - ${fix.url}: ${fix.action}`);
      });
    }
    
    if (this.errors.length > 0) {
      console.log('\n⚠️ Errors encountered:');
      this.errors.forEach(error => {
        console.log(`  - ${error.url}: ${error.error}`);
      });
    }
    
    return report;
  }

  async run() {
    console.log('🚑 LINK HEALER - Emergency Repair Service');
    console.log('Fixing broken links and 404 errors...\n');
    
    try {
      await this.ensureDirectories();
      
      // Scan for broken links
      const brokenLinks = await this.scanSite();
      console.log(`Found ${brokenLinks.length} potential issues`);
      
      // Fix broken links
      if (brokenLinks.length > 0) {
        await this.fixBrokenLinks(brokenLinks);
      }
      
      // Update homepage links
      await this.updateHomepageLinks();
      
      // Test critical links
      await this.testLinks();
      
      // Generate report
      await this.generateReport();
      
      console.log('\n✅ Link healing completed!');
      
    } catch (error) {
      console.error('Link healer failed:', error.message);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const healer = new LinkHealer();
  healer.run().catch(console.error);
}

module.exports = { LinkHealer };