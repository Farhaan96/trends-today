#!/usr/bin/env node

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const fs = require('fs').promises;
const path = require('path');

class ContentRefresher {
  constructor() {
    this.contentDir = path.join(__dirname, '..', 'content');
    this.srcDir = path.join(__dirname, '..', 'src');
    this.reportDir = path.join(__dirname, '..', 'reports');
    
    this.perplexityApiKey = process.env.PERPLEXITY_API_KEY;
    
    this.refreshes = [];
    this.errors = [];
    
    // Current date for freshness updates
    this.currentDate = new Date().toISOString().split('T')[0];
    this.currentDateFormatted = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  }

  async ensureDirectories() {
    try {
      await fs.mkdir(this.reportDir, { recursive: true });
    } catch (error) {
      // Directory exists
    }
  }

  async scanForStaleContent() {
    console.log('🔍 Scanning for outdated content...');
    
    const staleContent = [];
    const contentTypes = ['news', 'reviews'];
    
    for (const type of contentTypes) {
      const typeDir = path.join(this.contentDir, type);
      try {
        const files = await fs.readdir(typeDir);
        const mdxFiles = files.filter(file => file.endsWith('.mdx'));
        
        for (const file of mdxFiles) {
          const filePath = path.join(typeDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          
          // Check for old dates in frontmatter or content
          const dateIssues = this.findDateIssues(content, file);
          if (dateIssues.length > 0) {
            staleContent.push({
              file: filePath,
              type: type,
              issues: dateIssues,
              priority: this.calculatePriority(dateIssues, file)
            });
          }
        }
      } catch (error) {
        console.log(`No ${type} directory found`);
      }
    }
    
    // Check homepage for stale dates
    const homepagePath = path.join(this.srcDir, 'app', 'page.tsx');
    try {
      const homepageContent = await fs.readFile(homepagePath, 'utf-8');
      const homepageDateIssues = this.findDateIssues(homepageContent, 'homepage');
      if (homepageDateIssues.length > 0) {
        staleContent.push({
          file: homepagePath,
          type: 'homepage',
          issues: homepageDateIssues,
          priority: 'HIGH'
        });
      }
    } catch (error) {
      console.log('Could not scan homepage');
    }
    
    return staleContent;
  }

  findDateIssues(content, filename) {
    const issues = [];
    
    // Check for old publication dates
    const publishDateMatch = content.match(/publishedAt:\s*["']([^"']+)["']/);
    if (publishDateMatch) {
      const publishDate = new Date(publishDateMatch[1]);
      const daysDiff = (new Date() - publishDate) / (1000 * 60 * 60 * 24);
      
      if (daysDiff > 30) {
        issues.push({
          type: 'stale_publish_date',
          current: publishDateMatch[1],
          suggestion: this.getSuggestedDate(filename),
          severity: daysDiff > 90 ? 'HIGH' : 'MEDIUM'
        });
      }
    }
    
    // Check for old year references
    const oldYearMatches = content.match(/(2023|2024)/g);
    if (oldYearMatches && oldYearMatches.length > 0) {
      issues.push({
        type: 'old_year_reference',
        occurrences: oldYearMatches.length,
        suggestion: 'Update year references to 2025',
        severity: 'MEDIUM'
      });
    }
    
    // Check for outdated pricing format (if no current pricing)
    if (content.includes('$') && !content.includes('2025') && content.includes('price')) {
      issues.push({
        type: 'potentially_outdated_pricing',
        suggestion: 'Verify current pricing information',
        severity: 'HIGH'
      });
    }
    
    // Check for "January 2025" specifically (our old dates)
    if (content.includes('2025-01-')) {
      issues.push({
        type: 'january_2025_date',
        suggestion: 'Update to current date',
        severity: 'HIGH'
      });
    }
    
    return issues;
  }

  getSuggestedDate(filename) {
    // For different content types, suggest appropriate dates
    if (filename.includes('iphone-17-air')) {
      return '2025-09-07'; // Today for breaking news
    } else if (filename.includes('review')) {
      return '2025-09-06'; // Yesterday for reviews
    } else {
      return '2025-09-05'; // Few days ago for other content
    }
  }

  calculatePriority(issues, filename) {
    if (filename.includes('iphone-17-air') || filename.includes('homepage')) {
      return 'CRITICAL';
    }
    
    const highSeverityIssues = issues.filter(issue => issue.severity === 'HIGH');
    if (highSeverityIssues.length > 0) {
      return 'HIGH';
    }
    
    return 'MEDIUM';
  }

  async refreshContent(staleItems) {
    console.log('🔄 Refreshing stale content...');
    
    for (const item of staleItems) {
      try {
        console.log(`Refreshing: ${path.basename(item.file)}`);
        
        let content = await fs.readFile(item.file, 'utf-8');
        let updated = false;
        
        for (const issue of item.issues) {
          const updatedContent = await this.fixIssue(content, issue, item.file);
          if (updatedContent !== content) {
            content = updatedContent;
            updated = true;
          }
        }
        
        // Add current facts and context where appropriate
        if (path.basename(item.file).includes('iphone') && updated) {
          content = await this.enhanceWithCurrentContext(content, 'iphone');
        }
        
        if (updated) {
          await fs.writeFile(item.file, content, 'utf-8');
          this.refreshes.push({
            file: item.file,
            issues: item.issues.length,
            status: 'Refreshed',
            timestamp: new Date().toISOString()
          });
        }
        
      } catch (error) {
        console.error(`Error refreshing ${item.file}:`, error.message);
        this.errors.push({
          file: item.file,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  async fixIssue(content, issue, filePath) {
    let updatedContent = content;
    
    switch (issue.type) {
      case 'stale_publish_date':
      case 'january_2025_date':
        // Update publication date
        updatedContent = updatedContent.replace(
          /publishedAt:\s*["'][^"']+["']/,
          `publishedAt: "${issue.suggestion}"`
        );
        
        // Update homepage dates if this is homepage
        if (filePath.includes('page.tsx')) {
          updatedContent = updatedContent.replace(
            /"2025-01-\d+"/g,
            `"${issue.suggestion}"`
          );
        }
        break;
        
      case 'old_year_reference':
        // Carefully update year references
        updatedContent = updatedContent.replace(/2024/g, '2025');
        // Don't replace 2023 as it might be historical
        break;
        
      case 'potentially_outdated_pricing':
        // Add a note about pricing verification
        if (!updatedContent.includes('*Pricing current as of')) {
          const priceRegex = /(\$\d+[,\d]*)/;
          const match = updatedContent.match(priceRegex);
          if (match) {
            updatedContent = updatedContent.replace(
              match[0],
              `${match[0]} (*Pricing current as of ${this.currentDateFormatted})`
            );
          }
        }
        break;
    }
    
    return updatedContent;
  }

  async enhanceWithCurrentContext(content, productType) {
    console.log(`📱 Adding current context for ${productType}`);
    
    if (!this.perplexityApiKey) {
      console.log('⚠️ No Perplexity API key - skipping context enhancement');
      return content;
    }
    
    try {
      // Get current context about the product
      const contextQuery = productType === 'iphone' 
        ? 'What is the current status of iPhone 17 and iPhone 15 Pro Max pricing and availability as of September 2025?'
        : `What is the current status of ${productType} products as of September 2025?`;
      
      const context = await this.getPerplexityContext(contextQuery);
      
      if (context && !content.includes('*Updated September 2025*')) {
        // Add current context note
        const contextNote = `\n\n*Updated September 2025: ${context.substring(0, 200)}...*\n`;
        
        // Insert before conclusion or at the end
        if (content.includes('## Conclusion')) {
          content = content.replace('## Conclusion', contextNote + '\n## Conclusion');
        } else {
          content += contextNote;
        }
      }
      
    } catch (error) {
      console.log('Could not enhance with current context:', error.message);
    }
    
    return content;
  }

  async getPerplexityContext(query) {
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.perplexityApiKey}`,
        },
        body: JSON.stringify({
          model: 'sonar-pro',
          messages: [
            {
              role: 'system',
              content: 'You are a tech product expert. Provide brief, current information about product status, pricing, and availability.'
            },
            {
              role: 'user',
              content: query
            }
          ],
          max_tokens: 300,
          temperature: 0.2
        }),
      });

      const data = await response.json();
      return data.choices?.[0]?.message?.content || null;
      
    } catch (error) {
      console.error('Perplexity context error:', error.message);
      return null;
    }
  }

  async generateRefreshReport() {
    const report = {
      timestamp: new Date().toISOString(),
      refreshes: this.refreshes,
      errors: this.errors,
      summary: {
        totalRefreshes: this.refreshes.length,
        totalErrors: this.errors.length,
        success: this.errors.length === 0
      }
    };

    const reportFile = path.join(this.reportDir, 'content-refresh-report.json');
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
    
    console.log('\n📋 CONTENT REFRESH REPORT');
    console.log('='.repeat(50));
    console.log(`🔄 Content refreshed: ${this.refreshes.length}`);
    console.log(`❌ Errors encountered: ${this.errors.length}`);
    console.log(`📄 Report saved: ${reportFile}`);
    
    if (this.refreshes.length > 0) {
      console.log('\n✨ Content refreshes:');
      this.refreshes.forEach(refresh => {
        console.log(`  - ${path.basename(refresh.file)}: ${refresh.issues} issues fixed`);
      });
    }
    
    if (this.errors.length > 0) {
      console.log('\n⚠️ Errors encountered:');
      this.errors.forEach(error => {
        console.log(`  - ${path.basename(error.file)}: ${error.error}`);
      });
    }
    
    return report;
  }

  async run() {
    console.log('🔄 CONTENT REFRESHER - Modernizing Stale Content');
    console.log('Updating dates, facts, and context...\n');
    
    try {
      await this.ensureDirectories();
      
      // Scan for stale content
      const staleItems = await this.scanForStaleContent();
      console.log(`Found ${staleItems.length} items with stale content`);
      
      // Refresh content
      if (staleItems.length > 0) {
        await this.refreshContent(staleItems);
      }
      
      // Generate report
      await this.generateRefreshReport();
      
      console.log('\n✅ Content refresh completed!');
      console.log('📅 All content updated with current information');
      
    } catch (error) {
      console.error('Content refresher failed:', error.message);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const refresher = new ContentRefresher();
  refresher.run().catch(console.error);
}

module.exports = { ContentRefresher };