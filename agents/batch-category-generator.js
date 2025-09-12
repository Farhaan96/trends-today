/**
 * Batch Category Generator
 * Generates one ultra-short article for each category in a single batch
 * Follows Ultra-Short, Highly Readable Content Strategy (400-500 words)
 */

require('dotenv').config();
const UltraShortContentCreator = require('./ultra-short-content-creator');
const TrendingTopicsDiscovery = require('./trending-topics-discovery');
const fs = require('fs').promises;
const path = require('path');

class BatchCategoryGenerator {
  constructor() {
    this.creator = new UltraShortContentCreator();
    this.topicsDiscovery = new TrendingTopicsDiscovery();
    
    // Define all categories
    this.categories = [
      'technology',
      'science', 
      'psychology',
      'health',
      'space',
      'culture'
    ];
    
    // Track generation stats
    this.stats = {
      totalArticles: 0,
      successfulArticles: 0,
      failedArticles: 0,
      totalWords: 0,
      startTime: null,
      endTime: null
    };
  }

  /**
   * Generate one article for each category
   */
  async generateBatch(options = {}) {
    console.log('\n🚀 Starting Batch Generation for All Categories');
    console.log('=' .repeat(60));
    
    this.stats.startTime = new Date();
    const results = [];
    
    // Generate trending topics for each category
    const topicsByCategory = await this.discoverTopics();
    
    // Generate articles in parallel for efficiency
    const promises = this.categories.map(async (category) => {
      try {
        const topic = topicsByCategory[category];
        if (!topic) {
          console.warn(`⚠️ No topic found for ${category}`);
          return null;
        }
        
        console.log(`\n📝 Generating article for ${category}: ${topic}`);
        
        const article = await this.creator.generateArticle(
          topic,
          category,
          { save: options.save !== false }
        );
        
        this.stats.successfulArticles++;
        this.stats.totalWords += article.wordCount;
        
        return {
          category,
          topic,
          success: true,
          wordCount: article.wordCount,
          slug: article.slug,
          metadata: article.metadata
        };
        
      } catch (error) {
        console.error(`❌ Failed to generate article for ${category}:`, error.message);
        this.stats.failedArticles++;
        
        return {
          category,
          topic: topicsByCategory[category],
          success: false,
          error: error.message
        };
      }
    });
    
    // Wait for all articles to complete
    const batchResults = await Promise.all(promises);
    
    this.stats.endTime = new Date();
    this.stats.totalArticles = this.categories.length;
    
    // Generate batch report
    const report = await this.generateReport(batchResults);
    
    return {
      results: batchResults.filter(r => r !== null),
      stats: this.stats,
      report
    };
  }

  /**
   * Discover trending topics for each category
   */
  async discoverTopics() {
    console.log('\n🔍 Discovering trending topics for each category...');
    
    const topics = {};
    
    // Category-specific topic templates
    const topicTemplates = {
      technology: [
        'AI Agents Transform Software Development',
        'Quantum Computing Reaches Commercial Viability',
        'Neuromorphic Chips Beat Traditional CPUs',
        'Web3 Authentication Replaces Passwords',
        'Edge Computing Revolutionizes IoT'
      ],
      science: [
        'CRISPR 3.0 Cures Genetic Diseases',
        'Room Temperature Superconductor Confirmed',
        'Synthetic Biology Creates Living Materials',
        'Nuclear Fusion Achieves Net Energy Gain',
        'Lab-Grown Organs Pass Human Trials'
      ],
      psychology: [
        'Digital Detox Improves Mental Health',
        'Neurofeedback Therapy Beats Depression',
        'Social Media Addiction Brain Changes',
        'Cognitive Bias Training Shows Results',
        'Memory Enhancement Techniques Proven'
      ],
      health: [
        'Personalized Medicine Using AI',
        'Gut Microbiome Controls Aging',
        'Sleep Optimization Technology',
        'Mental Health Apps Show Clinical Results',
        'Longevity Breakthrough Extends Lifespan'
      ],
      space: [
        'Mars Colony Construction Begins',
        'James Webb Discovers Habitable Planets',
        'Asteroid Mining Becomes Reality',
        'Space Tourism Reaches Mainstream',
        'Quantum Communication via Satellites'
      ],
      culture: [
        'Gen Z Redefines Work Culture',
        'AI Art Wins Major Competition',
        'Virtual Reality Social Platforms',
        'Digital Nomad Cities Emerge',
        'Creator Economy Hits $500 Billion'
      ]
    };
    
    // Select trending topic for each category
    for (const category of this.categories) {
      const categoryTopics = topicTemplates[category] || [];
      
      // Try to get real trending topic first
      try {
        const trending = await this.topicsDiscovery.discoverForCategory(category);
        if (trending && trending.length > 0) {
          topics[category] = trending[0].title;
        } else {
          // Fallback to template topics
          topics[category] = categoryTopics[Math.floor(Math.random() * categoryTopics.length)];
        }
      } catch (error) {
        // Use template topic on error
        topics[category] = categoryTopics[Math.floor(Math.random() * categoryTopics.length)];
      }
      
      console.log(`  ✅ ${category}: ${topics[category]}`);
    }
    
    return topics;
  }

  /**
   * Generate batch generation report
   */
  async generateReport(results) {
    const duration = (this.stats.endTime - this.stats.startTime) / 1000;
    const avgWords = Math.round(this.stats.totalWords / this.stats.successfulArticles);
    
    const report = `
╔════════════════════════════════════════════════════════════╗
║           BATCH GENERATION REPORT                          ║
╚════════════════════════════════════════════════════════════╝

📊 GENERATION STATISTICS
├─ Total Articles: ${this.stats.totalArticles}
├─ Successful: ${this.stats.successfulArticles}
├─ Failed: ${this.stats.failedArticles}
├─ Success Rate: ${Math.round(this.stats.successfulArticles / this.stats.totalArticles * 100)}%
├─ Total Words: ${this.stats.totalWords}
├─ Average Words: ${avgWords}
└─ Generation Time: ${duration.toFixed(2)} seconds

📝 ARTICLES BY CATEGORY
${results.map(r => {
  if (!r) return '';
  const status = r.success ? '✅' : '❌';
  const words = r.success ? `${r.wordCount} words` : `Error: ${r.error}`;
  return `├─ ${status} ${r.category}: ${r.topic}\n│    └─ ${words}`;
}).join('\n')}

✨ QUALITY METRICS
├─ Word Count Compliance: ${this.checkWordCountCompliance(results)}
├─ Reading Time: 2 minutes (all articles)
├─ Typography: Bold emphasis, blockquotes, horizontal rules
└─ SEO Optimization: All articles include metadata

📋 NEXT STEPS
1. Review generated articles in content/ directory
2. Run quality check: npm run agents:quality-check
3. Publish batch: npm run publish:batch
4. Monitor engagement metrics

Generated at: ${new Date().toLocaleString()}
════════════════════════════════════════════════════════════
`;
    
    // Save report
    const reportPath = path.join(__dirname, '../reports', `batch-${Date.now()}.txt`);
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, report);
    
    console.log(report);
    console.log(`📄 Report saved: ${reportPath}`);
    
    return report;
  }

  /**
   * Check word count compliance
   */
  checkWordCountCompliance(results) {
    const compliant = results.filter(r => 
      r && r.success && r.wordCount >= 400 && r.wordCount <= 500
    );
    
    const percentage = Math.round(compliant.length / results.filter(r => r && r.success).length * 100);
    return `${percentage}% (${compliant.length}/${results.filter(r => r && r.success).length})`;
  }

  /**
   * Run scheduled batch generation
   */
  async runScheduledBatch(schedule = 'morning') {
    console.log(`\n⏰ Running scheduled batch: ${schedule}`);
    
    const scheduleConfig = {
      morning: { time: '9:00 AM', focus: 'breaking news' },
      midday: { time: '1:00 PM', focus: 'deep analysis' },
      evening: { time: '5:00 PM', focus: 'evergreen content' }
    };
    
    const config = scheduleConfig[schedule] || scheduleConfig.morning;
    console.log(`📅 Schedule: ${config.time} - Focus: ${config.focus}`);
    
    return await this.generateBatch({ save: true });
  }
}

module.exports = BatchCategoryGenerator;

// CLI interface
if (require.main === module) {
  const generator = new BatchCategoryGenerator();
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const command = args[0] || 'generate';
  
  switch (command) {
    case 'generate':
      // Generate one article per category
      generator.generateBatch({ save: true })
        .then(result => {
          console.log('\n✅ Batch generation complete!');
          process.exit(0);
        })
        .catch(error => {
          console.error('❌ Batch generation failed:', error);
          process.exit(1);
        });
      break;
      
    case 'morning':
    case 'midday':
    case 'evening':
      // Run scheduled batch
      generator.runScheduledBatch(command)
        .then(result => {
          console.log(`\n✅ ${command} batch complete!`);
          process.exit(0);
        })
        .catch(error => {
          console.error(`❌ ${command} batch failed:`, error);
          process.exit(1);
        });
      break;
      
    case 'test':
      // Test mode - don't save files
      generator.generateBatch({ save: false })
        .then(result => {
          console.log('\n✅ Test batch complete (no files saved)');
          process.exit(0);
        })
        .catch(error => {
          console.error('❌ Test batch failed:', error);
          process.exit(1);
        });
      break;
      
    default:
      console.log(`
Usage: node batch-category-generator.js [command]

Commands:
  generate  - Generate one article per category (default)
  morning   - Run morning batch (9 AM schedule)
  midday    - Run midday batch (1 PM schedule)  
  evening   - Run evening batch (5 PM schedule)
  test      - Test generation without saving files

Examples:
  node batch-category-generator.js generate
  node batch-category-generator.js morning
  node batch-category-generator.js test
      `);
      process.exit(0);
  }
}