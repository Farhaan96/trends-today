/**
 * Category Distribution Manager
 * Ensures balanced content creation across all categories when generating article batches
 */

const fs = require('fs');
const path = require('path');

class CategoryDistributionManager {
  constructor() {
    this.categories = [
      'science', // Research breakthroughs, discoveries
      'technology', // AI, quantum, products
      'space', // NASA, astronomy, exploration
      'health', // Medical breakthroughs, medicine
      'psychology', // Cognitive research, mental health
      'culture', // Digital culture, creator economy
      // 'news',      // Breaking news (activated when needed)
      // 'reviews',   // Product reviews (activated when needed)
      // 'best'       // Best-of lists (activated when needed)
    ];

    this.contentPath = path.join(__dirname, '..', 'content');
  }

  /**
   * Get current article count for each category
   */
  getCurrentDistribution() {
    const distribution = {};

    for (const category of this.categories) {
      const categoryPath = path.join(this.contentPath, category);
      if (fs.existsSync(categoryPath)) {
        const files = fs
          .readdirSync(categoryPath)
          .filter((file) => file.endsWith('.mdx'));
        distribution[category] = files.length;
      } else {
        distribution[category] = 0;
      }
    }

    return distribution;
  }

  /**
   * Calculate category priorities based on current distribution
   * Returns categories ordered by priority (lowest count = highest priority)
   */
  getCategoryPriorities() {
    const distribution = this.getCurrentDistribution();
    const total = Object.values(distribution).reduce(
      (sum, count) => sum + count,
      0
    );
    const avgPerCategory = total / this.categories.length;

    // Calculate priority scores (higher score = higher priority)
    const priorities = this.categories.map((category) => {
      const count = distribution[category];
      const deviation = avgPerCategory - count; // Positive = below average
      const priority = Math.max(1, deviation + 1); // Ensure minimum priority of 1

      return {
        category,
        count,
        priority: Math.round(priority * 100) / 100,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      };
    });

    // Sort by priority (highest first)
    priorities.sort((a, b) => b.priority - a.priority);

    return priorities;
  }

  /**
   * Get balanced category selection for a batch
   * @param {number} batchSize - Number of articles to generate
   * @param {string[]} exclude - Categories to exclude from selection
   */
  getBalancedSelection(batchSize = 3, exclude = []) {
    const priorities = this.getCategoryPriorities().filter(
      (p) => !exclude.includes(p.category)
    );

    // For small batches, pick top priority categories
    if (batchSize <= priorities.length) {
      return priorities.slice(0, batchSize).map((p) => p.category);
    }

    // For larger batches, use weighted selection
    const selection = [];
    let remainingSlots = batchSize;

    // First pass: Ensure each category gets at least one if batch is large enough
    if (batchSize >= priorities.length) {
      for (const priority of priorities) {
        selection.push(priority.category);
        remainingSlots--;
      }
    }

    // Second pass: Fill remaining slots based on priority
    let priorityIndex = 0;
    while (remainingSlots > 0) {
      const category = priorities[priorityIndex % priorities.length].category;
      selection.push(category);
      remainingSlots--;
      priorityIndex++;
    }

    return selection;
  }

  /**
   * Get category-specific topic suggestions
   */
  getCategoryTopicSuggestions(category) {
    const suggestions = {
      science: [
        'latest archaeological discoveries that challenge history',
        'breakthrough research in quantum physics that defies logic',
        'biological phenomena that seem impossible but are real',
        'materials science innovations changing everything',
        'neuroscience discoveries about consciousness and memory',
      ],
      technology: [
        'AI breakthroughs that nobody saw coming',
        'quantum computing achieving impossible calculations',
        'robotics innovations changing manufacturing',
        'edge computing revolutionizing data processing',
        'biotech merging with digital technology',
      ],
      space: [
        'NASA missions discovering impossible planetary phenomena',
        'exoplanet discoveries that break known physics',
        'space technology innovations for Mars exploration',
        'cosmic phenomena that challenge our understanding',
        'asteroid and comet discoveries revealing solar system secrets',
      ],
      health: [
        'precision medicine breakthroughs targeting individual DNA',
        'CRISPR gene editing curing previously incurable diseases',
        'AI detecting diseases years before human doctors',
        'biomarker discoveries revolutionizing early diagnosis',
        'immunotherapy innovations giving hope to cancer patients',
      ],
      psychology: [
        'neuroscience revealing how consciousness actually works',
        'cognitive research explaining why we procrastinate',
        'brain imaging showing how meditation changes neural structure',
        'psychological studies on decision-making and bias',
        'mental health innovations using technology and therapy',
      ],
      culture: [
        'creator economy reaching unprecedented scales',
        'social media exodus to niche communities',
        'digital culture trends shaping human behavior',
        'neurodivergent voices changing online communities',
        'AI-generated content transforming creative industries',
      ],
    };

    return suggestions[category] || [];
  }

  /**
   * Generate category-specific search queries for trending-content-creator
   */
  generateSearchQueries(category, count = 2) {
    const baseQueries = {
      science: [
        'breakthrough scientific discoveries 2025 that change everything',
        "impossible biological phenomena scientists can't explain",
        'archaeological discoveries rewriting human history',
        'physics experiments breaking known laws of nature',
        'materials science innovations defying expectations',
      ],
      technology: [
        'AI breakthroughs 2025 nobody predicted',
        'quantum computing achievements thought impossible',
        'robotics innovations changing manufacturing forever',
        'edge computing solving unsolvable problems',
        'biotech digital fusion creating new possibilities',
      ],
      space: [
        "NASA discoveries that shouldn't exist according to physics",
        'exoplanets with impossible characteristics discovered',
        'space missions revealing shocking solar system secrets',
        'cosmic phenomena challenging everything we know',
        'Mars exploration technology achieving the impossible',
      ],
      health: [
        'precision medicine curing diseases thought incurable',
        'CRISPR gene editing eliminating genetic disorders',
        'AI medical diagnosis detecting cancer years early',
        'biomarker research revolutionizing disease prediction',
        'immunotherapy breakthroughs offering impossible cures',
      ],
      psychology: [
        'neuroscience explaining consciousness mysteries finally',
        'brain research revealing procrastination causes',
        'meditation studies showing physical brain changes',
        'cognitive psychology exposing decision-making flaws',
        'mental health technology creating therapeutic breakthroughs',
      ],
      culture: [
        'creator economy hitting unprecedented billions in revenue',
        'mass social media exodus to private communities',
        'digital culture shifts changing human interaction',
        'neurodivergent online communities transforming society',
        'AI content generation disrupting creative industries',
      ],
    };

    const queries = baseQueries[category] || [];
    return queries.slice(0, count);
  }

  /**
   * Generate distribution report
   */
  generateReport() {
    const distribution = this.getCurrentDistribution();
    const priorities = this.getCategoryPriorities();
    const total = Object.values(distribution).reduce(
      (sum, count) => sum + count,
      0
    );

    let report = `\n📊 CONTENT DISTRIBUTION REPORT\n`;
    report += `=====================================\n\n`;
    report += `Total Articles: ${total}\n\n`;

    report += `Current Distribution:\n`;
    for (const priority of priorities) {
      const { category, count, percentage } = priority;
      const bar = '█'.repeat(Math.floor(percentage / 2));
      report += `  ${category.padEnd(12)} ${count.toString().padStart(2)} articles (${percentage.toString().padStart(2)}%) ${bar}\n`;
    }

    report += `\nCategory Priorities (for next batch):\n`;
    for (let i = 0; i < priorities.length; i++) {
      const { category, priority } = priorities[i];
      const indicator = i < 3 ? '🔥' : i < 5 ? '⚡' : '📝';
      report += `  ${i + 1}. ${indicator} ${category.padEnd(12)} (priority: ${priority})\n`;
    }

    const balanced = this.getBalancedSelection(3);
    report += `\nRecommended Next Batch (3 articles): ${balanced.join(', ')}\n`;

    return report;
  }
}

// CLI Interface
if (require.main === module) {
  const manager = new CategoryDistributionManager();
  const command = process.argv[2];

  switch (command) {
    case 'report':
      console.log(manager.generateReport());
      break;

    case 'balance':
      const batchSize = parseInt(process.argv[3]) || 3;
      const exclude = process.argv[4] ? process.argv[4].split(',') : [];
      const selection = manager.getBalancedSelection(batchSize, exclude);
      console.log(JSON.stringify(selection));
      break;

    case 'queries':
      const category = process.argv[3];
      const queryCount = parseInt(process.argv[4]) || 2;
      if (!category) {
        console.error(
          'Usage: node category-distribution-manager.js queries <category> [count]'
        );
        process.exit(1);
      }
      const queries = manager.generateSearchQueries(category, queryCount);
      console.log(JSON.stringify(queries));
      break;

    case 'priorities':
      const priorities = manager.getCategoryPriorities();
      console.log(JSON.stringify(priorities, null, 2));
      break;

    default:
      console.log(`Usage: node category-distribution-manager.js <command>

Commands:
  report                           - Show full distribution report
  balance [size] [exclude]         - Get balanced category selection
  queries <category> [count]       - Get search queries for category
  priorities                       - Get category priorities as JSON

Examples:
  node category-distribution-manager.js report
  node category-distribution-manager.js balance 5
  node category-distribution-manager.js balance 3 "technology,space"
  node category-distribution-manager.js queries science 3
  node category-distribution-manager.js priorities
      `);
  }
}

module.exports = CategoryDistributionManager;
