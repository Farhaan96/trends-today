/**
 * Content Diversity Manager
 * Prevents duplicate topics and ensures diverse content creation across all categories
 */

const fs = require('fs');
const path = require('path');

class ContentDiversityManager {
  constructor() {
    this.contentPath = path.join(__dirname, '..', 'content');
    this.categories = [
      'science',
      'technology',
      'space',
      'health',
      'psychology',
      'culture',
    ];

    // Common duplicate patterns to detect
    this.duplicatePatterns = {
      health: [
        ['crispr', 'gene editing', 'dna editing', 'genetic therapy'],
        [
          'ai diagnosis',
          'ai medical',
          'ai detection',
          'machine learning medical',
        ],
        ['precision medicine', 'personalized medicine', 'custom therapy'],
        ['cancer breakthrough', 'cancer treatment', 'oncology', 'tumor'],
        ['mental health', 'depression', 'anxiety', 'psychiatric'],
      ],
      psychology: [
        ['consciousness', 'awareness', 'conscious experience'],
        ['procrastination', 'delay', 'postponing', 'avoidance'],
        ['meditation', 'mindfulness', 'contemplation'],
        ['brain research', 'neuroscience', 'neural', 'cognitive'],
        ['decision making', 'choice', 'cognitive bias', 'judgment'],
      ],
      science: [
        ['quantum physics', 'quantum mechanics', 'quantum computing'],
        ['archaeological discovery', 'ancient', 'historical', 'excavation'],
        ['climate change', 'global warming', 'carbon', 'emissions'],
        ['space discovery', 'astronomical', 'cosmic', 'universe'],
        ['biological phenomena', 'evolution', 'species', 'organism'],
      ],
      technology: [
        [
          'ai breakthrough',
          'artificial intelligence',
          'machine learning',
          'neural networks',
        ],
        ['robotics', 'automation', 'robotic systems'],
        ['quantum computing', 'quantum processors', 'quantum algorithms'],
        ['autonomous vehicles', 'self-driving', 'driverless'],
        ['cybersecurity', 'hacking', 'data breach', 'security'],
      ],
      space: [
        ['nasa mission', 'space exploration', 'spacecraft'],
        ['exoplanet', 'planet discovery', 'planetary'],
        ['mars exploration', 'red planet', 'martian'],
        ['black hole', 'cosmic phenomena', 'galaxy'],
        ['asteroid', 'comet', 'space rock', 'meteor'],
      ],
      culture: [
        ['social media', 'platform', 'digital culture', 'online'],
        ['creator economy', 'influencer', 'content creator'],
        ['ai art', 'artificial intelligence art', 'digital art'],
        ['gaming', 'esports', 'video games', 'virtual'],
        ['privacy', 'data protection', 'surveillance', 'digital rights'],
      ],
    };
  }

  /**
   * Analyze existing content in a category for topic saturation
   */
  analyzeContentSaturation(category, daysBack = 30) {
    const categoryPath = path.join(this.contentPath, category);
    if (!fs.existsSync(categoryPath)) return { topics: [], saturation: [] };

    const files = fs
      .readdirSync(categoryPath)
      .filter((file) => file.endsWith('.mdx'))
      .map((file) => {
        const filePath = path.join(categoryPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const frontmatter = this.extractFrontmatter(content);

        return {
          file,
          title: frontmatter.title || '',
          description: frontmatter.description || '',
          tags: frontmatter.tags || [],
          publishedAt: new Date(frontmatter.publishedAt || '1970-01-01'),
          content: content.toLowerCase(),
        };
      })
      .filter((article) => {
        const daysSincePublished =
          (Date.now() - article.publishedAt.getTime()) / (1000 * 60 * 60 * 24);
        return daysSincePublished <= daysBack;
      });

    const topicSaturation = this.calculateTopicSaturation(category, files);
    const recentTopics = this.extractRecentTopics(files);

    return {
      recentArticles: files.length,
      topics: recentTopics,
      saturation: topicSaturation,
      oversaturatedTopics: topicSaturation
        .filter((t) => t.count >= 2)
        .map((t) => t.pattern),
    };
  }

  /**
   * Calculate how saturated each topic pattern is
   */
  calculateTopicSaturation(category, articles) {
    const patterns = this.duplicatePatterns[category] || [];

    return patterns.map((pattern) => {
      const count = articles.reduce((total, article) => {
        const text =
          `${article.title} ${article.description} ${Array.isArray(article.tags) ? article.tags.join(' ') : ''}`.toLowerCase();
        const matches = pattern.some((keyword) =>
          text.includes(keyword.toLowerCase())
        );
        return total + (matches ? 1 : 0);
      }, 0);

      return {
        pattern: pattern[0], // Primary keyword
        keywords: pattern,
        count,
        articles: articles
          .filter((article) => {
            const text =
              `${article.title} ${article.description} ${Array.isArray(article.tags) ? article.tags.join(' ') : ''}`.toLowerCase();
            return pattern.some((keyword) =>
              text.includes(keyword.toLowerCase())
            );
          })
          .map((a) => a.title),
      };
    });
  }

  /**
   * Extract recent topic keywords from articles
   */
  extractRecentTopics(articles) {
    const allKeywords = [];

    articles.forEach((article) => {
      const text = `${article.title} ${article.description}`.toLowerCase();
      // Extract important keywords (simplified approach)
      const keywords = text
        .split(/\s+/)
        .filter((word) => word.length > 4 && !this.isCommonWord(word))
        .slice(0, 5);
      allKeywords.push(...keywords);
    });

    // Count frequency
    const frequency = {};
    allKeywords.forEach((keyword) => {
      frequency[keyword] = (frequency[keyword] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([keyword, count]) => ({ keyword, count }));
  }

  /**
   * Check if a proposed article would be a duplicate
   */
  checkForDuplicates(
    category,
    proposedTitle,
    proposedDescription,
    proposedTags = []
  ) {
    const analysis = this.analyzeContentSaturation(category, 60); // Check last 60 days
    const proposedText =
      `${proposedTitle} ${proposedDescription} ${proposedTags.join(' ')}`.toLowerCase();

    const duplicateRisks = [];

    // Check against oversaturated topics
    analysis.oversaturatedTopics.forEach((topic) => {
      if (proposedText.includes(topic.toLowerCase())) {
        duplicateRisks.push({
          type: 'oversaturated_topic',
          topic,
          risk: 'HIGH',
          message: `Topic "${topic}" already has ${analysis.saturation.find((s) => s.pattern === topic)?.count || 0} recent articles`,
        });
      }
    });

    // Check for title similarity
    const existingArticles = fs
      .readdirSync(path.join(this.contentPath, category))
      .filter((file) => file.endsWith('.mdx'))
      .map((file) => {
        const content = fs.readFileSync(
          path.join(this.contentPath, category, file),
          'utf8'
        );
        const frontmatter = this.extractFrontmatter(content);
        return frontmatter.title || '';
      });

    existingArticles.forEach((existingTitle) => {
      const similarity = this.calculateTitleSimilarity(
        proposedTitle,
        existingTitle
      );
      if (similarity > 0.7) {
        duplicateRisks.push({
          type: 'similar_title',
          existingTitle,
          similarity: Math.round(similarity * 100),
          risk: similarity > 0.8 ? 'HIGH' : 'MEDIUM',
          message: `${Math.round(similarity * 100)}% similar to existing article: "${existingTitle}"`,
        });
      }
    });

    return {
      isDuplicate: duplicateRisks.some((risk) => risk.risk === 'HIGH'),
      risks: duplicateRisks,
      analysis,
    };
  }

  /**
   * Generate diverse research queries that avoid oversaturated topics
   */
  generateDiverseQueries(category, count = 2) {
    const analysis = this.analyzeContentSaturation(category);
    const oversaturated = analysis.oversaturatedTopics;

    const baseQueries = {
      health: [
        'rare disease breakthrough treatments 2025',
        'biomarker discovery revolutionizing diagnostics',
        'organ regeneration advances changing medicine',
        'microbiome therapy unexpected benefits',
        'sleep science breakthrough discoveries',
        'aging reversal research breakthroughs',
        'pain management revolutionary approaches',
        'immune system discoveries changing treatment',
      ],
      psychology: [
        'emotional intelligence research surprising findings',
        'memory formation breakthrough discoveries',
        'social psychology unexpected behaviors',
        'creativity research brain mechanisms',
        'stress response new understanding',
        'learning optimization breakthrough methods',
        'personality research surprising correlations',
        'behavioral economics decision discoveries',
      ],
      science: [
        'materials science impossible properties discovered',
        'ocean depths revealing unexpected life',
        'atmospheric science surprising discoveries',
        'chemistry reactions defying expectations',
        'geology discoveries rewriting textbooks',
        'energy research breakthrough methods',
        'biodiversity discoveries changing understanding',
        'physics phenomena challenging theories',
      ],
      technology: [
        'edge computing revolutionary applications',
        'biotechnology merging digital systems',
        'renewable energy storage breakthroughs',
        'manufacturing automation advances',
        'communication technology unexpected uses',
        'computational biology breakthrough tools',
        'virtual reality therapeutic applications',
        'blockchain solving unexpected problems',
      ],
      space: [
        'magnetosphere discoveries changing understanding',
        'solar system formation new theories',
        'interstellar medium unexpected properties',
        'planetary geology surprising discoveries',
        'space weather affecting technology',
        'cosmic ray research breakthrough findings',
        'satellite technology unexpected applications',
        'space debris solutions innovative approaches',
      ],
      culture: [
        'digital wellness emerging practices',
        'remote work cultural transformations',
        'generational differences technology adoption',
        'cultural preservation digital methods',
        'virtual communities unexpected benefits',
        'digital art therapy applications',
        'online education transformation methods',
        'cultural exchange digital platforms',
      ],
    };

    const availableQueries = (baseQueries[category] || []).filter((query) => {
      // Filter out queries that match oversaturated topics
      const queryLower = query.toLowerCase();
      return !oversaturated.some(
        (topic) =>
          queryLower.includes(topic.toLowerCase()) ||
          topic
            .toLowerCase()
            .split(' ')
            .some((word) => queryLower.includes(word))
      );
    });

    // Shuffle and return requested count
    const shuffled = availableQueries.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Generate comprehensive diversity report
   */
  generateDiversityReport() {
    let report = `\n🎯 CONTENT DIVERSITY ANALYSIS\n`;
    report += `====================================\n\n`;

    this.categories.forEach((category) => {
      const analysis = this.analyzeContentSaturation(category);

      report += `📂 ${category.toUpperCase()}\n`;
      report += `  Recent articles (30 days): ${analysis.recentArticles}\n`;

      if (analysis.oversaturatedTopics.length > 0) {
        report += `  🚨 OVERSATURATED TOPICS:\n`;
        analysis.saturation
          .filter((s) => s.count >= 2)
          .forEach((topic) => {
            report += `    - ${topic.pattern}: ${topic.count} articles\n`;
            topic.articles.forEach((title) => {
              report += `      • ${title}\n`;
            });
          });
      } else {
        report += `  ✅ Good topic diversity\n`;
      }

      report += `\n`;
    });

    return report;
  }

  /**
   * Utility methods
   */
  extractFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return {};

    const frontmatter = {};
    const lines = match[1].split('\n');

    let currentKey = null;
    let currentValue = '';
    let inArray = false;

    lines.forEach((line) => {
      if (line.trim().endsWith(':')) {
        if (currentKey) {
          frontmatter[currentKey] = this.parseValue(currentValue.trim());
        }
        currentKey = line.trim().slice(0, -1);
        currentValue = '';
        inArray = false;
      } else if (line.includes(':') && !inArray) {
        if (currentKey) {
          frontmatter[currentKey] = this.parseValue(currentValue.trim());
        }
        const [key, ...valueParts] = line.split(':');
        currentKey = key.trim();
        currentValue = valueParts.join(':').trim();
        inArray = currentValue.startsWith('[');
      } else {
        currentValue += (currentValue ? '\n' : '') + line;
        if (line.trim() === ']') {
          inArray = false;
        }
      }
    });

    if (currentKey) {
      frontmatter[currentKey] = this.parseValue(currentValue.trim());
    }

    return frontmatter;
  }

  parseValue(value) {
    if (value.startsWith('[') && value.endsWith(']')) {
      return value
        .slice(1, -1)
        .split(',')
        .map((v) => v.trim().replace(/['"]/g, ''));
    }
    if (value.startsWith('"') && value.endsWith('"')) {
      return value.slice(1, -1);
    }
    if (value.startsWith("'") && value.endsWith("'")) {
      return value.slice(1, -1);
    }
    return value;
  }

  calculateTitleSimilarity(title1, title2) {
    const words1 = title1
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3);
    const words2 = title2
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3);

    const commonWords = words1.filter((word) => words2.includes(word));
    const totalUniqueWords = new Set([...words1, ...words2]).size;

    return commonWords.length / totalUniqueWords;
  }

  isCommonWord(word) {
    const commonWords = [
      'that',
      'this',
      'with',
      'from',
      'they',
      'have',
      'were',
      'been',
      'their',
      'said',
      'each',
      'which',
      'what',
      'there',
      'will',
      'more',
      'other',
      'after',
      'first',
      'well',
      'many',
      'some',
      'time',
    ];
    return commonWords.includes(word.toLowerCase());
  }
}

// CLI Interface
if (require.main === module) {
  const manager = new ContentDiversityManager();
  const command = process.argv[2];
  const category = process.argv[3];

  switch (command) {
    case 'report':
      console.log(manager.generateDiversityReport());
      break;

    case 'analyze':
      if (!category) {
        console.error(
          'Usage: node content-diversity-manager.js analyze <category>'
        );
        process.exit(1);
      }
      const analysis = manager.analyzeContentSaturation(category);
      console.log(JSON.stringify(analysis, null, 2));
      break;

    case 'check':
      const title = process.argv[4];
      const description = process.argv[5];
      if (!category || !title) {
        console.error(
          'Usage: node content-diversity-manager.js check <category> "<title>" "<description>"'
        );
        process.exit(1);
      }
      const result = manager.checkForDuplicates(
        category,
        title,
        description || ''
      );
      console.log(JSON.stringify(result, null, 2));
      break;

    case 'queries':
      if (!category) {
        console.error(
          'Usage: node content-diversity-manager.js queries <category> [count]'
        );
        process.exit(1);
      }
      const count = parseInt(process.argv[4]) || 2;
      const queries = manager.generateDiverseQueries(category, count);
      console.log(JSON.stringify(queries, null, 2));
      break;

    default:
      console.log(`Content Diversity Manager - Prevents duplicate topics and ensures content variety

Usage: node content-diversity-manager.js <command>

Commands:
  report                              - Full diversity analysis across all categories
  analyze <category>                  - Detailed analysis of specific category
  check <category> "<title>" "<desc>" - Check if proposed article would be duplicate
  queries <category> [count]          - Generate diverse research queries avoiding saturated topics

Examples:
  node content-diversity-manager.js report
  node content-diversity-manager.js analyze health
  node content-diversity-manager.js check health "CRISPR Baby Treatment" "Gene editing saves infant"
  node content-diversity-manager.js queries psychology 3
      `);
  }
}

module.exports = ContentDiversityManager;
