#!/usr/bin/env node

/**
 * Topic Validator - Prevents duplicate content creation
 *
 * Usage:
 * node utils/topic-validator.js check "proposed topic title"
 * node utils/topic-validator.js keywords "keyword1,keyword2,keyword3"
 * node utils/topic-validator.js update-inventory
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONTENT_DIR = path.join(__dirname, '..', 'content');
const INVENTORY_FILE = path.join(__dirname, '..', 'existing-articles.txt');
const DUPLICATE_THRESHOLD = 0.7; // 70% similarity = duplicate

class TopicValidator {
  constructor() {
    this.existingArticles = this.loadExistingArticles();
    this.keywords = this.loadAllKeywords();
  }

  /**
   * Load existing article slugs from file system
   */
  loadExistingArticles() {
    try {
      const articles = [];
      const globResult = execSync(
        `find "${CONTENT_DIR}" -name "*.mdx" -type f`,
        { encoding: 'utf8' }
      );

      globResult
        .split('\n')
        .filter(Boolean)
        .forEach((filePath) => {
          const slug = path.basename(filePath, '.mdx');
          const title = this.extractTitleFromFile(filePath);
          articles.push({ slug, title, path: filePath });
        });

      return articles;
    } catch (error) {
      console.error('Error loading existing articles:', error);
      return [];
    }
  }

  /**
   * Extract title from MDX frontmatter
   */
  extractTitleFromFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const titleMatch = content.match(/^title:\s*['"](.+?)['"]$/m);
      return titleMatch ? titleMatch[1] : path.basename(filePath, '.mdx');
    } catch (error) {
      return path.basename(filePath, '.mdx');
    }
  }

  /**
   * Load all keywords from existing articles
   */
  loadAllKeywords() {
    const allKeywords = new Set();

    this.existingArticles.forEach((article) => {
      try {
        const content = fs.readFileSync(article.path, 'utf8');

        // Extract keywords from frontmatter
        const keywordsMatch = content.match(
          /primaryKeyword:\s*['"](.+?)['"]|tags:\s*\[([^\]]+)\]/gm
        );
        if (keywordsMatch) {
          keywordsMatch.forEach((match) => {
            const keywords = match.match(/['"]([^'"]+)['"]/g);
            if (keywords) {
              keywords.forEach((kw) =>
                allKeywords.add(kw.replace(/['"]/g, '').toLowerCase())
              );
            }
          });
        }

        // Extract key terms from title
        const title = article.title.toLowerCase();
        const titleWords = title.split(/\s+/).filter((word) => word.length > 3);
        titleWords.forEach((word) => allKeywords.add(word));
      } catch (error) {
        // Skip problematic files
      }
    });

    return Array.from(allKeywords);
  }

  /**
   * Calculate similarity between two strings using Levenshtein distance
   */
  calculateSimilarity(str1, str2) {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    if (s1 === s2) return 1.0;

    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;

    if (longer.length === 0) return 1.0;

    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Levenshtein distance algorithm
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Check if proposed topic is a duplicate
   */
  checkForDuplicates(proposedTopic) {
    const results = {
      isDuplicate: false,
      confidence: 0,
      similarArticles: [],
      recommendations: [],
    };

    // Check title similarity
    this.existingArticles.forEach((article) => {
      const similarity = this.calculateSimilarity(proposedTopic, article.title);

      if (similarity > DUPLICATE_THRESHOLD) {
        results.isDuplicate = true;
        results.confidence = Math.max(results.confidence, similarity);
        results.similarArticles.push({
          title: article.title,
          slug: article.slug,
          similarity: similarity.toFixed(2),
        });
      } else if (similarity > 0.4) {
        results.similarArticles.push({
          title: article.title,
          slug: article.slug,
          similarity: similarity.toFixed(2),
        });
      }
    });

    // Generate recommendations if duplicate found
    if (results.isDuplicate) {
      results.recommendations = [
        'Consider a more specific angle or focus',
        'Add a unique perspective or recent development',
        'Combine with another trending topic',
        'Focus on a specific application or industry',
      ];
    }

    return results;
  }

  /**
   * Check keyword overlap with existing content
   */
  checkKeywordOverlap(keywords) {
    const keywordArray = keywords.split(',').map((k) => k.trim().toLowerCase());
    const overlapping = [];

    keywordArray.forEach((keyword) => {
      if (
        this.keywords.some(
          (existing) => existing.includes(keyword) || keyword.includes(existing)
        )
      ) {
        overlapping.push(keyword);
      }
    });

    return {
      overlap: overlapping,
      overlapPercentage: (overlapping.length / keywordArray.length) * 100,
      isHighOverlap: overlapping.length / keywordArray.length > 0.6,
    };
  }

  /**
   * Update inventory file
   */
  updateInventory() {
    try {
      const articles = this.existingArticles.map((a) => a.slug).sort();
      fs.writeFileSync(INVENTORY_FILE, articles.join('\n') + '\n');
      console.log(`✅ Updated inventory with ${articles.length} articles`);
      return true;
    } catch (error) {
      console.error('❌ Error updating inventory:', error);
      return false;
    }
  }

  /**
   * Generate validation report
   */
  generateReport(proposedTopic, keywords = '') {
    console.log('\n🔍 TOPIC VALIDATION REPORT\n');
    console.log(`Proposed Topic: "${proposedTopic}"`);
    console.log(`Existing Articles: ${this.existingArticles.length}`);
    console.log('─'.repeat(50));

    const duplicateCheck = this.checkForDuplicates(proposedTopic);

    if (duplicateCheck.isDuplicate) {
      console.log('❌ DUPLICATE DETECTED');
      console.log(
        `Confidence: ${(duplicateCheck.confidence * 100).toFixed(1)}%`
      );
      console.log('\nSimilar Articles:');
      duplicateCheck.similarArticles.forEach((article) => {
        console.log(
          `  • ${article.title} (${(article.similarity * 100).toFixed(1)}% similar)`
        );
      });
      console.log('\n💡 Recommendations:');
      duplicateCheck.recommendations.forEach((rec) => {
        console.log(`  • ${rec}`);
      });
    } else {
      console.log('✅ UNIQUE TOPIC');
      if (duplicateCheck.similarArticles.length > 0) {
        console.log('\nSomewhat Similar (but acceptable):');
        duplicateCheck.similarArticles.forEach((article) => {
          console.log(
            `  • ${article.title} (${(article.similarity * 100).toFixed(1)}% similar)`
          );
        });
      }
    }

    if (keywords) {
      console.log('\n🏷️  KEYWORD ANALYSIS');
      const keywordCheck = this.checkKeywordOverlap(keywords);
      console.log(`Overlap: ${keywordCheck.overlapPercentage.toFixed(1)}%`);
      if (keywordCheck.isHighOverlap) {
        console.log('⚠️  High keyword overlap detected');
        console.log('Overlapping keywords:', keywordCheck.overlap.join(', '));
      } else {
        console.log('✅ Acceptable keyword overlap');
      }
    }

    console.log('\n─'.repeat(50));
    return (
      !duplicateCheck.isDuplicate &&
      (!keywords || !this.checkKeywordOverlap(keywords).isHighOverlap)
    );
  }
}

// CLI Interface
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const input = args[1];

  const validator = new TopicValidator();

  switch (command) {
    case 'check':
      if (!input) {
        console.error('Usage: node topic-validator.js check "topic title"');
        process.exit(1);
      }
      const isValid = validator.generateReport(input);
      process.exit(isValid ? 0 : 1);
      break;

    case 'keywords':
      if (!input) {
        console.error(
          'Usage: node topic-validator.js keywords "keyword1,keyword2,keyword3"'
        );
        process.exit(1);
      }
      const keywordResult = validator.checkKeywordOverlap(input);
      console.log('Keyword Overlap Analysis:');
      console.log(`Overlap: ${keywordResult.overlapPercentage.toFixed(1)}%`);
      console.log(
        `High Overlap: ${keywordResult.isHighOverlap ? 'Yes' : 'No'}`
      );
      if (keywordResult.overlap.length > 0) {
        console.log('Overlapping keywords:', keywordResult.overlap.join(', '));
      }
      process.exit(keywordResult.isHighOverlap ? 1 : 0);
      break;

    case 'update-inventory':
      validator.updateInventory();
      break;

    case 'list':
      console.log('Existing Articles:');
      validator.existingArticles.forEach((article) => {
        console.log(`  • ${article.slug}`);
      });
      break;

    default:
      console.log('Usage:');
      console.log('  node topic-validator.js check "topic title"');
      console.log('  node topic-validator.js keywords "keyword1,keyword2"');
      console.log('  node topic-validator.js update-inventory');
      console.log('  node topic-validator.js list');
      break;
  }
}

if (require.main === module) {
  main();
}

module.exports = TopicValidator;
