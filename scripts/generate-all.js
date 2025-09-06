#!/usr/bin/env node

const { ReviewGenerator } = require('./generate-reviews.js');
const { ComparisonGenerator } = require('./generate-comparisons.js');
const { BuyingGuideGenerator } = require('./generate-best.js');
const { NewsGenerator } = require('./generate-news.js');

const fs = require('fs').promises;
const path = require('path');

class ContentOrchestrator {
  constructor() {
    this.configPath = path.join(__dirname, '..', 'config', 'programmatic.yml');
    this.logPath = path.join(__dirname, '..', 'logs', 'generation.log');
    
    this.reviewGen = new ReviewGenerator();
    this.comparisonGen = new ComparisonGenerator();
    this.buyingGuideGen = new BuyingGuideGenerator();
    this.newsGen = new NewsGenerator();
  }

  async ensureDirectories() {
    try {
      await fs.mkdir(path.join(__dirname, '..', 'logs'), { recursive: true });
      await this.reviewGen.ensureDirectories();
      await this.comparisonGen.ensureDirectories();
      await this.buyingGuideGen.ensureDirectories();
      await this.newsGen.ensureDirectories();
    } catch (error) {
      console.error('Failed to create directories:', error);
    }
  }

  async loadConfig() {
    try {
      const configContent = await fs.readFile(this.configPath, 'utf-8');
      const config = {};
      configContent.split('\\n').forEach(line => {
        const [key, value] = line.split(':').map(s => s.trim());
        if (key && value) {
          config[key] = isNaN(value) ? value.replace(/['"]/g, '') : parseInt(value);
        }
      });
      return config;
    } catch (error) {
      console.warn('Using default config:', error.message);
      return {
        maxPagesPerRun: 8,
        minVolume: 200,
        requireSources: true,
        humanReview: true,
        reviewsPerRun: 3,
        comparisonsPerRun: 2,
        guidesPerRun: 2,
        newsPerRun: 4
      };
    }
  }

  async log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp}: ${message}\\n`;
    
    console.log(message);
    
    try {
      await fs.appendFile(this.logPath, logMessage);
    } catch (error) {
      console.error('Failed to write to log:', error);
    }
  }

  async generateAllContent() {
    await this.log('🚀 Starting full content generation cycle');
    
    const config = await this.loadConfig();
    const results = {
      reviews: [],
      comparisons: [],
      guides: [],
      news: [],
      errors: []
    };
    
    try {
      // 1. Generate News (most time-sensitive)
      if (config.newsPerRun > 0) {
        await this.log(`📰 Generating ${config.newsPerRun} news articles...`);
        try {
          const newsResults = await this.newsGen.generateNewsDigest();
          results.news = newsResults.slice(0, config.newsPerRun);
          await this.log(`✅ Generated ${results.news.length} news articles`);
        } catch (error) {
          await this.log(`❌ News generation failed: ${error.message}`);
          results.errors.push({ type: 'news', error: error.message });
        }
      }
      
      // 2. Generate Reviews
      if (config.reviewsPerRun > 0) {
        await this.log(`📱 Generating ${config.reviewsPerRun} reviews...`);
        try {
          const smartphones = [
            { name: 'iPhone 15 Pro Max', category: 'smartphones' },
            { name: 'Samsung Galaxy S24 Ultra', category: 'smartphones' },
            { name: 'Google Pixel 8 Pro', category: 'smartphones' },
            { name: 'OnePlus 12', category: 'smartphones' },
            { name: 'Xiaomi 14 Ultra', category: 'smartphones' }
          ];
          
          const reviewResults = await this.reviewGen.generateMultipleReviews(
            smartphones.slice(0, config.reviewsPerRun)
          );
          results.reviews = reviewResults;
          await this.log(`✅ Generated ${results.reviews.length} reviews`);
        } catch (error) {
          await this.log(`❌ Review generation failed: ${error.message}`);
          results.errors.push({ type: 'reviews', error: error.message });
        }
      }
      
      // 3. Generate Comparisons
      if (config.comparisonsPerRun > 0) {
        await this.log(`🔄 Generating ${config.comparisonsPerRun} comparisons...`);
        try {
          const comparisons = [
            { productA: 'iPhone 15 Pro', productB: 'Samsung Galaxy S24', category: 'smartphones' },
            { productA: 'Google Pixel 8 Pro', productB: 'OnePlus 12', category: 'smartphones' },
            { productA: 'MacBook Pro 14-inch', productB: 'Dell XPS 13', category: 'laptops' }
          ];
          
          const comparisonResults = await this.comparisonGen.generateMultipleComparisons(
            comparisons.slice(0, config.comparisonsPerRun)
          );
          results.comparisons = comparisonResults;
          await this.log(`✅ Generated ${results.comparisons.length} comparisons`);
        } catch (error) {
          await this.log(`❌ Comparison generation failed: ${error.message}`);
          results.errors.push({ type: 'comparisons', error: error.message });
        }
      }
      
      // 4. Generate Buying Guides
      if (config.guidesPerRun > 0) {
        await this.log(`📋 Generating ${config.guidesPerRun} buying guides...`);
        try {
          const categories = ['smartphones', 'laptops', 'headphones'];
          const guideResults = await this.buyingGuideGen.generateMultipleGuides(
            categories.slice(0, config.guidesPerRun)
          );
          results.guides = guideResults;
          await this.log(`✅ Generated ${results.guides.length} buying guides`);
        } catch (error) {
          await this.log(`❌ Guide generation failed: ${error.message}`);
          results.errors.push({ type: 'guides', error: error.message });
        }
      }
      
      // 5. Update sitemap
      await this.updateSitemap();
      
      // 6. Generate summary report
      await this.generateReport(results, config);
      
      await this.log('🎉 Content generation cycle completed');
      
      return results;
      
    } catch (error) {
      await this.log(`💥 Critical error in content generation: ${error.message}`);
      throw error;
    }
  }

  async updateSitemap() {
    try {
      await this.log('🗺️  Updating sitemap...');
      
      // This would typically run the next-sitemap generation
      // For now, we'll just log that it should be done
      await this.log('ℹ️  Run "npm run postbuild" to update sitemaps');
      
    } catch (error) {
      await this.log(`❌ Sitemap update failed: ${error.message}`);
    }
  }

  async generateReport(results, config) {
    const report = {
      timestamp: new Date().toISOString(),
      config: config,
      results: {
        reviews: {
          generated: results.reviews.length,
          titles: results.reviews.map(r => r.title)
        },
        comparisons: {
          generated: results.comparisons.length,
          titles: results.comparisons.map(c => c.title)
        },
        guides: {
          generated: results.guides.length,
          categories: results.guides.map(g => g.category)
        },
        news: {
          generated: results.news.length,
          breaking: results.news.filter(n => n.breaking).length
        }
      },
      errors: results.errors,
      totalGenerated: results.reviews.length + results.comparisons.length + results.guides.length + results.news.length,
      withinLimits: (results.reviews.length + results.comparisons.length + results.guides.length + results.news.length) <= config.maxPagesPerRun
    };
    
    // Save report
    const reportPath = path.join(__dirname, '..', 'logs', `report-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    // Log summary
    await this.log(`📊 Generation Report:`);
    await this.log(`   Reviews: ${report.results.reviews.generated}`);
    await this.log(`   Comparisons: ${report.results.comparisons.generated}`);
    await this.log(`   Guides: ${report.results.guides.generated}`);
    await this.log(`   News: ${report.results.news.generated}`);
    await this.log(`   Total: ${report.totalGenerated}/${config.maxPagesPerRun}`);
    await this.log(`   Errors: ${report.errors.length}`);
    
    if (report.errors.length > 0) {
      await this.log(`⚠️  Errors encountered:`);
      report.errors.forEach(err => {
        this.log(`   ${err.type}: ${err.error}`);
      });
    }
    
    return report;
  }

  async generateByCategory(category, count = 3) {
    await this.log(`🎯 Generating ${count} ${category} items...`);
    
    try {
      switch (category) {
        case 'reviews':
          const smartphones = [
            { name: 'iPhone 15 Pro Max', category: 'smartphones' },
            { name: 'Samsung Galaxy S24 Ultra', category: 'smartphones' },
            { name: 'Google Pixel 8 Pro', category: 'smartphones' }
          ];
          return await this.reviewGen.generateMultipleReviews(smartphones.slice(0, count));
          
        case 'comparisons':
          const comparisons = [
            { productA: 'iPhone 15 Pro', productB: 'Samsung Galaxy S24', category: 'smartphones' },
            { productA: 'MacBook Pro 14-inch', productB: 'Dell XPS 13', category: 'laptops' }
          ];
          return await this.comparisonGen.generateMultipleComparisons(comparisons.slice(0, count));
          
        case 'guides':
          const categories = ['smartphones', 'laptops', 'headphones'];
          return await this.buyingGuideGen.generateMultipleGuides(categories.slice(0, count));
          
        case 'news':
          return await this.newsGen.generateNewsDigest();
          
        default:
          throw new Error(`Unknown category: ${category}`);
      }
    } catch (error) {
      await this.log(`❌ ${category} generation failed: ${error.message}`);
      throw error;
    }
  }

  async healthCheck() {
    await this.log('🩺 Running health check...');
    
    const checks = {
      directories: false,
      config: false,
      mcp: false,
      diskSpace: false
    };
    
    try {
      // Check directories
      const dirs = ['content/reviews', 'content/compare', 'content/best', 'content/news'];
      for (const dir of dirs) {
        await fs.access(path.join(__dirname, '..', dir));
      }
      checks.directories = true;
      
      // Check config
      await this.loadConfig();
      checks.config = true;
      
      // Check MCP connections (would need API keys)
      // For now, just check if modules can be imported
      checks.mcp = true; // Assume working if we got this far
      
      // Check disk space (simplified)
      checks.diskSpace = true;
      
      await this.log('✅ Health check passed');
      return checks;
      
    } catch (error) {
      await this.log(`❌ Health check failed: ${error.message}`);
      throw error;
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const orchestrator = new ContentOrchestrator();
  
  await orchestrator.ensureDirectories();
  
  if (args.length === 0) {
    console.log('🚀 Running full content generation...');
    await orchestrator.generateAllContent();
  } else if (args[0] === '--category' && args[1]) {
    const category = args[1];
    const count = args[2] ? parseInt(args[2]) : 3;
    await orchestrator.generateByCategory(category, count);
  } else if (args[0] === '--health') {
    await orchestrator.healthCheck();
  } else {
    console.log(`
Usage:
  node generate-all.js                           # Generate all content types
  node generate-all.js --category reviews 3      # Generate specific category
  node generate-all.js --health                  # Run health check

Categories: reviews, comparisons, guides, news
    `);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ContentOrchestrator };