/**
 * Balanced Batch Orchestrator
 * Coordinates category-balanced article generation with the trending-content-creator agent
 */

const CategoryDistributionManager = require('./category-distribution-manager');

class BalancedBatchOrchestrator {
  constructor() {
    this.categoryManager = new CategoryDistributionManager();
  }

  /**
   * Generate a comprehensive batch plan with balanced categories
   * @param {number} batchSize - Number of articles to generate
   * @param {string[]} excludeCategories - Categories to exclude
   * @param {boolean} strictBalance - Enforce perfect balance vs priority-based
   */
  generateBatchPlan(batchSize = 3, excludeCategories = [], strictBalance = false) {
    console.log(`\n🎯 GENERATING BATCH PLAN FOR ${batchSize} ARTICLES`);
    console.log('================================================\n');

    // Get current distribution for context
    const currentDistribution = this.categoryManager.getCurrentDistribution();
    const priorities = this.categoryManager.getCategoryPriorities();

    console.log('📊 Current Content Distribution:');
    priorities.forEach((p, index) => {
      const indicator = index < 2 ? '🔥' : index < 4 ? '⚡' : '📝';
      console.log(`  ${indicator} ${p.category.padEnd(12)} ${p.count} articles (${p.percentage}%)`);
    });

    // Get balanced category selection
    const selectedCategories = this.categoryManager.getBalancedSelection(batchSize, excludeCategories);

    console.log(`\n🎯 Selected Categories for This Batch:`);
    selectedCategories.forEach((category, index) => {
      console.log(`  ${index + 1}. ${category}`);
    });

    // Generate article plans for each category
    const articlePlans = selectedCategories.map((category, index) => {
      const queries = this.categoryManager.generateSearchQueries(category, 2);
      const suggestions = this.categoryManager.getCategoryTopicSuggestions(category);

      return {
        position: index + 1,
        category,
        primaryQuery: queries[0] || `breakthrough ${category} discoveries that defy logic`,
        secondaryQuery: queries[1] || `impossible ${category} phenomena scientists can't explain`,
        topicSuggestions: suggestions.slice(0, 3),
        targetWordCount: this.getWordCountForCategory(category),
        priority: priorities.find(p => p.category === category)?.priority || 1
      };
    });

    console.log(`\n📝 Article Generation Plan:`);
    articlePlans.forEach(plan => {
      console.log(`\n  Article ${plan.position}: ${plan.category.toUpperCase()}`);
      console.log(`  Target: ${plan.targetWordCount} words`);
      console.log(`  Primary Query: "${plan.primaryQuery}"`);
      console.log(`  Secondary Query: "${plan.secondaryQuery}"`);
      console.log(`  Topic Suggestions:`);
      plan.topicSuggestions.forEach(suggestion => {
        console.log(`    • ${suggestion}`);
      });
    });

    return {
      batchSize,
      selectedCategories,
      articlePlans,
      currentDistribution,
      priorities,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get appropriate word count for category
   */
  getWordCountForCategory(category) {
    const wordCounts = {
      'science': '600-800',
      'technology': '600-800',
      'space': '600-800',
      'health': '500-700',
      'psychology': '500-700',
      'culture': '300-500',
      'news': '300-500',
      'reviews': '600-800'
    };

    return wordCounts[category] || '500-700';
  }

  /**
   * Generate Claude Code agent invocation commands
   */
  generateAgentCommands(batchPlan) {
    console.log(`\n🤖 CLAUDE CODE AGENT COMMANDS`);
    console.log('==============================\n');

    console.log('Step 1: Generate the balanced batch using trending-content-creator');
    console.log('Copy and paste this command:\n');

    const command = `Use the trending-content-creator subagent to create a balanced batch of ${batchPlan.batchSize} articles with the following category distribution:

${batchPlan.articlePlans.map(plan =>
  `${plan.position}. **${plan.category.toUpperCase()}** (${plan.targetWordCount} words)
   - Primary research: "${plan.primaryQuery}"
   - Secondary research: "${plan.secondaryQuery}"
   - Focus areas: ${plan.topicSuggestions.slice(0, 2).join(', ')}
`).join('\n')}

CRITICAL INSTRUCTIONS:
- Use Category Distribution Manager to verify this selection: node utils/category-distribution-manager.js balance ${batchPlan.batchSize}
- Research each category with the provided queries for balanced topic discovery
- Create exactly ONE article per selected category
- Follow category-specific word count targets
- Ensure diverse topics across the batch (no clustering in similar themes)
- Apply all quality standards and SEO optimization per category requirements`;

    console.log(command);

    console.log('\n\nStep 2: After content creation, run post-batch analysis:');
    console.log('node utils/category-distribution-manager.js report\n');

    return command;
  }

  /**
   * Analyze post-batch results
   */
  analyzeBatchResults(preBatchDistribution) {
    const currentDistribution = this.categoryManager.getCurrentDistribution();

    console.log(`\n📈 BATCH RESULTS ANALYSIS`);
    console.log('==========================\n');

    console.log('Distribution Changes:');
    Object.keys(currentDistribution).forEach(category => {
      const before = preBatchDistribution[category] || 0;
      const after = currentDistribution[category];
      const change = after - before;

      if (change > 0) {
        console.log(`  ${category.padEnd(12)} ${before} → ${after} (+${change}) ✅`);
      } else if (change === 0) {
        console.log(`  ${category.padEnd(12)} ${before} → ${after} (no change)`);
      }
    });

    const newPriorities = this.categoryManager.getCategoryPriorities();
    console.log('\nUpdated Priorities:');
    newPriorities.slice(0, 3).forEach((p, index) => {
      console.log(`  ${index + 1}. ${p.category} (${p.count} articles, priority: ${p.priority})`);
    });

    return {
      distributionImprovement: this.calculateDistributionImprovement(preBatchDistribution, currentDistribution),
      newPriorities,
      recommendedNextBatch: this.categoryManager.getBalancedSelection(3)
    };
  }

  /**
   * Calculate how much the distribution improved
   */
  calculateDistributionImprovement(before, after) {
    const beforeValues = Object.values(before);
    const afterValues = Object.values(after);

    const beforeVariance = this.calculateVariance(beforeValues);
    const afterVariance = this.calculateVariance(afterValues);

    return {
      beforeVariance: Math.round(beforeVariance * 100) / 100,
      afterVariance: Math.round(afterVariance * 100) / 100,
      improvement: Math.round((beforeVariance - afterVariance) * 100) / 100,
      percentageImprovement: beforeVariance > 0 ?
        Math.round(((beforeVariance - afterVariance) / beforeVariance) * 100) : 0
    };
  }

  /**
   * Calculate variance for distribution balance measurement
   */
  calculateVariance(values) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }

  /**
   * Quick balance check - are we approaching balanced distribution?
   */
  checkBalance() {
    const distribution = this.categoryManager.getCurrentDistribution();
    const values = Object.values(distribution);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;

    let status;
    if (range <= 2) {
      status = '🎯 EXCELLENT - Nearly perfect balance';
    } else if (range <= 4) {
      status = '⚡ GOOD - Minor imbalances';
    } else if (range <= 6) {
      status = '📝 FAIR - Some categories need attention';
    } else {
      status = '🔥 NEEDS WORK - Significant imbalances';
    }

    console.log(`\n${status}`);
    console.log(`Range: ${range} articles (${min}-${max})`);

    return { range, status, needsRebalancing: range > 4 };
  }
}

// CLI Interface
if (require.main === module) {
  const orchestrator = new BalancedBatchOrchestrator();
  const command = process.argv[2];

  switch (command) {
    case 'plan':
      const batchSize = parseInt(process.argv[3]) || 3;
      const exclude = process.argv[4] ? process.argv[4].split(',') : [];
      const plan = orchestrator.generateBatchPlan(batchSize, exclude);
      console.log('\n' + '='.repeat(50));
      orchestrator.generateAgentCommands(plan);
      break;

    case 'check':
      orchestrator.checkBalance();
      break;

    case 'analyze':
      // This would typically be called with pre-batch data
      console.log('Run this after batch completion with: node utils/category-distribution-manager.js report');
      break;

    default:
      console.log(`Balanced Batch Orchestrator - Ensures category balance in content generation

Usage: node balanced-batch-orchestrator.js <command>

Commands:
  plan [size] [exclude]     - Generate balanced batch plan and agent commands
  check                     - Quick balance status check
  analyze                   - Analyze batch results (use after completion)

Examples:
  node balanced-batch-orchestrator.js plan 3
  node balanced-batch-orchestrator.js plan 5 "technology,space"
  node balanced-batch-orchestrator.js check

The 'plan' command generates the exact Claude Code agent invocation you need!
      `);
  }
}

module.exports = BalancedBatchOrchestrator;