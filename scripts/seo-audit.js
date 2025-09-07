#!/usr/bin/env node

/**
 * SEO Audit Script for Trends Today Tech Blog
 * 
 * This script performs a comprehensive SEO audit of the website including:
 * - Meta tags optimization
 * - Content analysis
 * - Image optimization
 * - Internal linking
 * - Technical SEO checks
 * - Schema markup validation
 * - Core Web Vitals simulation
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class SEOAuditor {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      overallScore: 0,
      categories: {
        technical: { score: 0, issues: [], suggestions: [] },
        content: { score: 0, issues: [], suggestions: [] },
        metadata: { score: 0, issues: [], suggestions: [] },
        performance: { score: 0, issues: [], suggestions: [] },
        schema: { score: 0, issues: [], suggestions: [] }
      },
      pages: []
    };
    
    this.siteUrl = process.env.SITE_URL || 'https://trendstoday.ca';
    this.sourceDir = path.join(__dirname, '../src');
    this.publicDir = path.join(__dirname, '../public');
  }

  // Main audit function
  async runAudit() {
    console.log('🔍 Starting comprehensive SEO audit for Trends Today...\n');
    
    try {
      // Run all audit categories
      await this.auditTechnicalSEO();
      await this.auditContentSEO();
      await this.auditMetadata();
      await this.auditPerformance();
      await this.auditSchemaMarkup();
      
      // Calculate overall score
      this.calculateOverallScore();
      
      // Generate and save report
      this.generateReport();
      
      console.log('✅ SEO audit completed successfully!');
      console.log(`📊 Overall SEO Score: ${this.results.overallScore}/100\n`);
      
    } catch (error) {
      console.error('❌ Error during SEO audit:', error);
      process.exit(1);
    }
  }

  // Audit technical SEO elements
  async auditTechnicalSEO() {
    console.log('🔧 Auditing Technical SEO...');
    const category = this.results.categories.technical;
    let score = 100;

    // Check robots.txt
    const robotsPath = path.join(this.publicDir, 'robots.txt');
    if (fs.existsSync(robotsPath)) {
      const robotsContent = fs.readFileSync(robotsPath, 'utf8');
      
      if (!robotsContent.includes('Sitemap:')) {
        category.issues.push('robots.txt missing sitemap references');
        score -= 10;
      }
      
      if (!robotsContent.includes('User-agent: *')) {
        category.issues.push('robots.txt missing universal user-agent directive');
        score -= 5;
      }
      
      if (robotsContent.includes('Disallow: /')) {
        category.issues.push('robots.txt may be blocking entire site');
        score -= 20;
      }
    } else {
      category.issues.push('robots.txt file not found');
      score -= 15;
    }

    // Check sitemap configuration
    const sitemapConfigPath = path.join(__dirname, '../next-sitemap.config.js');
    if (fs.existsSync(sitemapConfigPath)) {
      const sitemapConfig = fs.readFileSync(sitemapConfigPath, 'utf8');
      
      if (!sitemapConfig.includes('siteUrl')) {
        category.issues.push('Sitemap configuration missing siteUrl');
        score -= 10;
      }
      
      if (!sitemapConfig.includes('generateIndexSitemap')) {
        category.suggestions.push('Consider enabling index sitemap generation');
      }
    } else {
      category.issues.push('Sitemap configuration file not found');
      score -= 15;
    }

    // Check for essential meta tags in layout
    const layoutPath = path.join(this.sourceDir, 'app/layout.tsx');
    if (fs.existsSync(layoutPath)) {
      const layoutContent = fs.readFileSync(layoutPath, 'utf8');
      
      if (!layoutContent.includes('viewport')) {
        category.issues.push('Layout missing viewport meta tag');
        score -= 10;
      }
      
      if (!layoutContent.includes('preconnect')) {
        category.suggestions.push('Add preconnect links for external resources');
      }
      
      if (!layoutContent.includes('dns-prefetch')) {
        category.suggestions.push('Add DNS prefetch for performance');
      }
    }

    // Check for canonical URL implementation
    const seoHeadPath = path.join(this.sourceDir, 'components/seo/SEOHead.tsx');
    if (fs.existsSync(seoHeadPath)) {
      const seoHeadContent = fs.readFileSync(seoHeadPath, 'utf8');
      
      if (!seoHeadContent.includes('canonical')) {
        category.issues.push('SEO component missing canonical URL support');
        score -= 15;
      }
    }

    // Check for 404 and error pages
    const notFoundPath = path.join(this.sourceDir, 'app/not-found.tsx');
    if (!fs.existsSync(notFoundPath)) {
      category.issues.push('Custom 404 page not found');
      score -= 10;
    }

    category.score = Math.max(0, score);
    console.log(`   ✓ Technical SEO Score: ${category.score}/100`);
  }

  // Audit content SEO
  async auditContentSEO() {
    console.log('📝 Auditing Content SEO...');
    const category = this.results.categories.content;
    let totalScore = 0;
    let pageCount = 0;

    // Find all content files
    const contentDirs = [
      path.join(this.sourceDir, 'app'),
      path.join(__dirname, '../content')
    ];

    for (const dir of contentDirs) {
      if (fs.existsSync(dir)) {
        const files = this.findContentFiles(dir);
        
        for (const file of files) {
          const pageScore = await this.auditPageContent(file);
          totalScore += pageScore;
          pageCount++;
        }
      }
    }

    // Check for content optimization utilities
    const contentSEOPath = path.join(this.sourceDir, 'lib/content-seo.ts');
    if (fs.existsSync(contentSEOPath)) {
      category.suggestions.push('Content SEO utilities are available for optimization');
    } else {
      category.issues.push('Content SEO optimization utilities missing');
      totalScore -= 10;
    }

    category.score = pageCount > 0 ? Math.round(totalScore / pageCount) : 0;
    console.log(`   ✓ Content SEO Score: ${category.score}/100 (${pageCount} pages analyzed)`);
  }

  // Audit individual page content
  async auditPageContent(filePath) {
    let score = 100;
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const wordCount = content.split(/\s+/).length;
      
      // Basic content checks
      if (wordCount < 300) {
        score -= 20; // Too short
      } else if (wordCount < 600) {
        score -= 10; // Could be longer
      }
      
      // Check for headings
      const h1Count = (content.match(/^# /gm) || []).length;
      const h2Count = (content.match(/^## /gm) || []).length;
      
      if (h1Count === 0) score -= 15;
      if (h1Count > 1) score -= 10;
      if (h2Count < 2) score -= 10;
      
      // Check for images
      const imageCount = (content.match(/!\[.*?\]\(/g) || []).length;
      if (imageCount === 0) score -= 15;
      
      // Check for internal links
      const internalLinkCount = (content.match(/\]\(\/[^)]*\)/g) || []).length;
      if (internalLinkCount < 2) score -= 10;
      
      // Check for lists (better readability)
      const listCount = (content.match(/^- /gm) || []).length;
      if (listCount === 0) score -= 5;
      
    } catch (error) {
      console.warn(`Warning: Could not analyze ${filePath}`);
      return 50; // Default score for unanalyzable files
    }
    
    return Math.max(0, score);
  }

  // Audit metadata optimization
  async auditMetadata() {
    console.log('🏷️ Auditing Metadata...');
    const category = this.results.categories.metadata;
    let score = 100;

    // Check main layout metadata
    const layoutPath = path.join(this.sourceDir, 'app/layout.tsx');
    if (fs.existsSync(layoutPath)) {
      const layoutContent = fs.readFileSync(layoutPath, 'utf8');
      
      // Check for Open Graph tags
      if (!layoutContent.includes('openGraph')) {
        category.issues.push('Layout missing Open Graph metadata');
        score -= 20;
      }
      
      // Check for Twitter Card tags  
      if (!layoutContent.includes('twitter')) {
        category.issues.push('Layout missing Twitter Card metadata');
        score -= 15;
      }
      
      // Check for structured metadata
      if (!layoutContent.includes('metadataBase')) {
        category.issues.push('Layout missing metadata base URL');
        score -= 10;
      }
      
      // Check for verification tags
      if (!layoutContent.includes('verification')) {
        category.suggestions.push('Add search engine verification tags');
      }
    }

    // Check SEO utilities
    const seoUtilsPath = path.join(this.sourceDir, 'lib/seo-utils.ts');
    if (fs.existsSync(seoUtilsPath)) {
      const seoUtilsContent = fs.readFileSync(seoUtilsPath, 'utf8');
      
      if (!seoUtilsContent.includes('generateMetaTitle')) {
        category.issues.push('SEO utilities missing title generation');
        score -= 10;
      }
      
      if (!seoUtilsContent.includes('generateMetaDescription')) {
        category.issues.push('SEO utilities missing description generation');
        score -= 10;
      }
    } else {
      category.issues.push('SEO utilities library not found');
      score -= 15;
    }

    category.score = Math.max(0, score);
    console.log(`   ✓ Metadata Score: ${category.score}/100`);
  }

  // Audit performance optimizations
  async auditPerformance() {
    console.log('⚡ Auditing Performance...');
    const category = this.results.categories.performance;
    let score = 100;

    // Check for Web Vitals monitoring
    const webVitalsPath = path.join(this.sourceDir, 'components/seo/WebVitals.tsx');
    if (fs.existsSync(webVitalsPath)) {
      const webVitalsContent = fs.readFileSync(webVitalsPath, 'utf8');
      
      if (!webVitalsContent.includes('getCLS')) {
        category.issues.push('Web Vitals monitoring incomplete');
        score -= 15;
      }
      
      if (!webVitalsContent.includes('OptimizedImage')) {
        category.issues.push('Optimized image component missing');
        score -= 10;
      }
    } else {
      category.issues.push('Web Vitals monitoring not implemented');
      score -= 25;
    }

    // Check for image optimization
    const imageOptPath = path.join(this.sourceDir, 'lib/image-optimization.ts');
    if (fs.existsSync(imageOptPath)) {
      category.suggestions.push('Image optimization utilities are available');
    } else {
      category.issues.push('Image optimization utilities missing');
      score -= 15;
    }

    // Check Next.js config for performance
    const nextConfigPath = path.join(__dirname, '../next.config.ts');
    if (fs.existsSync(nextConfigPath)) {
      const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
      
      if (!nextConfig.includes('experimental')) {
        category.suggestions.push('Consider enabling experimental features for performance');
      }
    }

    // Check for lazy loading implementation
    const layoutPath = path.join(this.sourceDir, 'app/layout.tsx');
    if (fs.existsSync(layoutPath)) {
      const layoutContent = fs.readFileSync(layoutPath, 'utf8');
      
      if (!layoutContent.includes('preconnect')) {
        category.issues.push('Missing preconnect links for external resources');
        score -= 10;
      }
    }

    category.score = Math.max(0, score);
    console.log(`   ✓ Performance Score: ${category.score}/100`);
  }

  // Audit schema markup implementation
  async auditSchemaMarkup() {
    console.log('📋 Auditing Schema Markup...');
    const category = this.results.categories.schema;
    let score = 100;

    // Check for schema components
    const schemaPath = path.join(this.sourceDir, 'components/seo/SchemaMarkup.tsx');
    if (fs.existsSync(schemaPath)) {
      const schemaContent = fs.readFileSync(schemaPath, 'utf8');
      
      const requiredSchemas = [
        'ReviewSchema',
        'ProductSchema', 
        'OrganizationSchema',
        'WebsiteSchema',
        'BreadcrumbSchema',
        'FAQSchema'
      ];
      
      requiredSchemas.forEach(schema => {
        if (!schemaContent.includes(schema)) {
          category.issues.push(`Missing ${schema} component`);
          score -= 10;
        }
      });
    } else {
      category.issues.push('Schema markup components not found');
      score -= 50;
    }

    // Check for schema utilities
    const schemaLibPath = path.join(this.sourceDir, 'lib/schema.ts');
    if (fs.existsSync(schemaLibPath)) {
      const schemaLibContent = fs.readFileSync(schemaLibPath, 'utf8');
      
      if (!schemaLibContent.includes('generateReviewSchema')) {
        category.issues.push('Schema generation utilities incomplete');
        score -= 15;
      }
    } else {
      category.issues.push('Schema utilities library missing');
      score -= 20;
    }

    // Check schema types
    const schemaTypesPath = path.join(this.sourceDir, 'types/schema.ts');
    if (fs.existsSync(schemaTypesPath)) {
      category.suggestions.push('Schema types are properly defined');
    } else {
      category.issues.push('Schema TypeScript types missing');
      score -= 10;
    }

    category.score = Math.max(0, score);
    console.log(`   ✓ Schema Markup Score: ${category.score}/100`);
  }

  // Find content files for analysis
  findContentFiles(dir, files = []) {
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          this.findContentFiles(fullPath, files);
        } else if (stat.isFile() && (item.endsWith('.tsx') || item.endsWith('.mdx') || item.endsWith('.md'))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
    }
    
    return files.slice(0, 20); // Limit to prevent overwhelming analysis
  }

  // Calculate overall SEO score
  calculateOverallScore() {
    const scores = Object.values(this.results.categories).map(cat => cat.score);
    this.results.overallScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }

  // Generate comprehensive audit report
  generateReport() {
    const reportPath = path.join(__dirname, '../reports/seo-audit-report.json');
    const htmlReportPath = path.join(__dirname, '../reports/seo-audit-report.html');
    
    // Ensure reports directory exists
    const reportsDir = path.dirname(reportPath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Save JSON report
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    // Generate HTML report
    const htmlReport = this.generateHTMLReport();
    fs.writeFileSync(htmlReportPath, htmlReport);
    
    console.log(`📄 Reports saved:`);
    console.log(`   JSON: ${reportPath}`);
    console.log(`   HTML: ${htmlReportPath}\n`);
    
    // Print summary to console
    this.printSummary();
  }

  // Generate HTML report
  generateHTMLReport() {
    const { categories, overallScore, timestamp } = this.results;
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SEO Audit Report - Trends Today</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 30px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .score-circle { display: inline-block; width: 120px; height: 120px; border-radius: 50%; background: conic-gradient(#10b981 ${overallScore * 3.6}deg, #e5e7eb 0deg); position: relative; }
        .score-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 24px; font-weight: bold; }
        .category { background: white; margin-bottom: 20px; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .category-header { padding: 20px; background: #1f2937; color: white; font-weight: bold; font-size: 18px; }
        .category-content { padding: 20px; }
        .score-bar { height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; margin: 10px 0; }
        .score-fill { height: 100%; background: linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #10b981 100%); }
        .issues { color: #dc2626; margin: 10px 0; }
        .suggestions { color: #2563eb; margin: 10px 0; }
        .timestamp { color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>SEO Audit Report</h1>
            <p class="timestamp">Generated on ${new Date(timestamp).toLocaleString()}</p>
            <div style="display: flex; align-items: center; gap: 30px;">
                <div class="score-circle">
                    <div class="score-text">${overallScore}</div>
                </div>
                <div>
                    <h2>Overall SEO Score</h2>
                    <p>Your site scores ${overallScore}/100 for SEO optimization.</p>
                    <p><strong>Status:</strong> ${overallScore >= 80 ? '🟢 Excellent' : overallScore >= 60 ? '🟡 Good' : '🔴 Needs Improvement'}</p>
                </div>
            </div>
        </div>
        
        ${Object.entries(categories).map(([name, data]) => `
        <div class="category">
            <div class="category-header">
                ${name.charAt(0).toUpperCase() + name.slice(1)} SEO
                <span style="float: right;">${data.score}/100</span>
            </div>
            <div class="category-content">
                <div class="score-bar">
                    <div class="score-fill" style="width: ${data.score}%;"></div>
                </div>
                
                ${data.issues.length > 0 ? `
                <div class="issues">
                    <strong>🚨 Issues (${data.issues.length}):</strong>
                    <ul>
                        ${data.issues.map(issue => `<li>${issue}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                
                ${data.suggestions.length > 0 ? `
                <div class="suggestions">
                    <strong>💡 Suggestions (${data.suggestions.length}):</strong>
                    <ul>
                        ${data.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
            </div>
        </div>
        `).join('')}
        
        <div class="category">
            <div class="category-header">Recommendations</div>
            <div class="category-content">
                <h3>Priority Actions:</h3>
                <ol>
                    ${this.generatePriorityActions().map(action => `<li>${action}</li>`).join('')}
                </ol>
            </div>
        </div>
    </div>
</body>
</html>
    `;
  }

  // Generate priority actions based on audit results
  generatePriorityActions() {
    const actions = [];
    const { categories } = this.results;
    
    // Sort categories by score (lowest first)
    const sortedCategories = Object.entries(categories)
      .sort(([,a], [,b]) => a.score - b.score);
    
    sortedCategories.forEach(([name, data]) => {
      if (data.score < 70 && data.issues.length > 0) {
        actions.push(`Improve ${name} SEO: ${data.issues[0]}`);
      }
    });
    
    if (actions.length === 0) {
      actions.push('Continue monitoring and optimizing based on performance data');
      actions.push('Consider implementing advanced SEO features like auto-linking');
      actions.push('Set up regular SEO audits and monitoring');
    }
    
    return actions.slice(0, 5);
  }

  // Print summary to console
  printSummary() {
    const { categories, overallScore } = this.results;
    
    console.log('📊 SEO Audit Summary');
    console.log('='.repeat(50));
    console.log(`Overall Score: ${overallScore}/100`);
    console.log('');
    
    Object.entries(categories).forEach(([name, data]) => {
      const status = data.score >= 80 ? '🟢' : data.score >= 60 ? '🟡' : '🔴';
      console.log(`${status} ${name.toUpperCase()}: ${data.score}/100`);
      
      if (data.issues.length > 0) {
        console.log(`   Issues: ${data.issues.length}`);
      }
      if (data.suggestions.length > 0) {
        console.log(`   Suggestions: ${data.suggestions.length}`);
      }
      console.log('');
    });
    
    console.log('Priority Actions:');
    this.generatePriorityActions().forEach((action, index) => {
      console.log(`${index + 1}. ${action}`);
    });
  }
}

// Run the audit if this script is executed directly
if (require.main === module) {
  const auditor = new SEOAuditor();
  auditor.runAudit().catch(console.error);
}

module.exports = SEOAuditor;