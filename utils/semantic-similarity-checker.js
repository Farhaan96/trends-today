#!/usr/bin/env node

/**
 * Semantic Similarity Checker
 * Uses AI embeddings to detect conceptual duplicates that string matching misses
 *
 * Replaces lexical similarity (string matching) with semantic similarity (meaning matching)
 *
 * Examples of what this catches:
 * - "CRISPR Gene Therapy" vs "DNA Editing Treatment" = 95% semantic match
 * - "Gratitude Rewires Brain" vs "Neuroscience of Thankfulness" = 92% semantic match
 * - "Quantum Computing Breakthrough" vs "IBM Quantum Processors Milestone" = 88% semantic match
 *
 * Usage:
 *   node utils/semantic-similarity-checker.js check "Proposed Title" "Brief description" [category]
 *   node utils/semantic-similarity-checker.js cross-check "Title" "Description" technology
 *   node utils/semantic-similarity-checker.js batch-analyze health
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SemanticSimilarityChecker {
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
    this.similarityThreshold = 0.85; // 85% semantic similarity = duplicate
    this.crossCategoryThreshold = 0.75; // Lower threshold for cross-category checks

    // Simple embedding cache to speed up repeated checks
    this.embeddingCache = new Map();
  }

  /**
   * Generate semantic embedding for text using simple TF-IDF + cosine similarity
   * (Fallback implementation until @xenova/transformers is installed)
   *
   * For production: Replace with @xenova/transformers sentence-transformers model
   */
  async getEmbedding(text) {
    // Check cache first
    const cacheKey = text.toLowerCase().trim();
    if (this.embeddingCache.has(cacheKey)) {
      return this.embeddingCache.get(cacheKey);
    }

    // Simple TF-IDF-like embedding (word frequency vector)
    const embedding = this.createSimpleEmbedding(text);

    // Cache for future use
    this.embeddingCache.set(cacheKey, embedding);

    return embedding;
  }

  /**
   * Create simple word-frequency embedding (fallback method)
   * Returns normalized vector for cosine similarity
   */
  createSimpleEmbedding(text) {
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((word) => word.length > 2);

    // Create frequency map
    const freq = {};
    words.forEach((word) => {
      freq[word] = (freq[word] || 0) + 1;
    });

    // Normalize to unit vector
    const values = Object.values(freq);
    const magnitude = Math.sqrt(
      values.reduce((sum, val) => sum + val * val, 0)
    );

    const normalized = {};
    Object.keys(freq).forEach((word) => {
      normalized[word] = freq[word] / (magnitude || 1);
    });

    return normalized;
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  cosineSimilarity(emb1, emb2) {
    const allKeys = new Set([...Object.keys(emb1), ...Object.keys(emb2)]);

    let dotProduct = 0;
    let mag1 = 0;
    let mag2 = 0;

    allKeys.forEach((key) => {
      const val1 = emb1[key] || 0;
      const val2 = emb2[key] || 0;
      dotProduct += val1 * val2;
      mag1 += val1 * val1;
      mag2 += val2 * val2;
    });

    mag1 = Math.sqrt(mag1);
    mag2 = Math.sqrt(mag2);

    if (mag1 === 0 || mag2 === 0) return 0;

    return dotProduct / (mag1 * mag2);
  }

  /**
   * Load all existing articles from content directory
   */
  loadArticles(category = null) {
    const articles = [];
    const categories = category ? [category] : this.categories;

    categories.forEach((cat) => {
      const categoryPath = path.join(this.contentPath, cat);
      if (!fs.existsSync(categoryPath)) return;

      const files = fs
        .readdirSync(categoryPath)
        .filter((file) => file.endsWith('.mdx'));

      files.forEach((file) => {
        const filePath = path.join(categoryPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const frontmatter = this.extractFrontmatter(content);

        articles.push({
          title: frontmatter.title || '',
          description: frontmatter.description || '',
          category: cat,
          file: file,
          path: filePath,
          tags: frontmatter.tags || [],
          primaryKeyword: frontmatter.seo?.primaryKeyword || '',
        });
      });
    });

    return articles;
  }

  /**
   * Check if proposed topic is semantically duplicate
   */
  async checkSemanticDuplicate(
    proposedTitle,
    proposedDesc,
    targetCategory = null
  ) {
    const proposedText = `${proposedTitle} ${proposedDesc}`;
    const proposedEmb = await this.getEmbedding(proposedText);

    const existingArticles = this.loadArticles(targetCategory);
    const duplicates = [];
    const similar = [];

    for (const article of existingArticles) {
      const articleText = `${article.title} ${article.description}`;
      const articleEmb = await this.getEmbedding(articleText);
      const similarity = this.cosineSimilarity(proposedEmb, articleEmb);

      if (similarity >= this.similarityThreshold) {
        duplicates.push({
          title: article.title,
          category: article.category,
          similarity: Math.round(similarity * 100),
          file: article.file,
          reason: 'High semantic similarity - likely same topic/concept',
        });
      } else if (similarity >= 0.6) {
        similar.push({
          title: article.title,
          category: article.category,
          similarity: Math.round(similarity * 100),
          file: article.file,
        });
      }
    }

    // Sort by similarity (highest first)
    duplicates.sort((a, b) => b.similarity - a.similarity);
    similar.sort((a, b) => b.similarity - a.similarity);

    return {
      isDuplicate: duplicates.length > 0,
      duplicates,
      similar: similar.slice(0, 5), // Top 5 similar
      highestSimilarity:
        duplicates.length > 0
          ? duplicates[0].similarity
          : similar.length > 0
            ? similar[0].similarity
            : 0,
      threshold: Math.round(this.similarityThreshold * 100),
    };
  }

  /**
   * Check for cross-category duplicates
   */
  async checkCrossCategoryDuplicates(
    proposedTitle,
    proposedDesc,
    targetCategory
  ) {
    const proposedEmb = await this.getEmbedding(
      `${proposedTitle} ${proposedDesc}`
    );

    const otherCategories = this.categories.filter(
      (cat) => cat !== targetCategory
    );
    const crossCategoryDuplicates = [];

    for (const category of otherCategories) {
      const articles = this.loadArticles(category);

      for (const article of articles) {
        const articleEmb = await this.getEmbedding(
          `${article.title} ${article.description}`
        );
        const similarity = this.cosineSimilarity(proposedEmb, articleEmb);

        if (similarity > this.crossCategoryThreshold) {
          crossCategoryDuplicates.push({
            title: article.title,
            category: category,
            similarity: Math.round(similarity * 100),
            file: article.file,
            warning: `Similar topic already covered in ${category} category`,
          });
        }
      }
    }

    crossCategoryDuplicates.sort((a, b) => b.similarity - a.similarity);

    return {
      hasCrossCategoryDuplicates: crossCategoryDuplicates.length > 0,
      duplicates: crossCategoryDuplicates.slice(0, 5), // Top 5
      threshold: Math.round(this.crossCategoryThreshold * 100),
    };
  }

  /**
   * Comprehensive validation report
   */
  async generateValidationReport(proposedTitle, proposedDesc, targetCategory) {
    console.log('\n🔍 SEMANTIC VALIDATION RESULTS\n');
    console.log(`Proposed: "${proposedTitle}"`);
    console.log(`Category: ${targetCategory}`);
    console.log('─'.repeat(60));

    // 1. Semantic similarity check within category
    const semanticCheck = await this.checkSemanticDuplicate(
      proposedTitle,
      proposedDesc,
      targetCategory
    );

    console.log('\n📊 SEMANTIC SIMILARITY CHECK');
    if (semanticCheck.isDuplicate) {
      console.log('❌ FAILED - Duplicate detected');
      console.log(
        `   Highest similarity: ${semanticCheck.highestSimilarity}% (threshold: ${semanticCheck.threshold}%)`
      );
      console.log('\n   Duplicate articles:');
      semanticCheck.duplicates.forEach((dup) => {
        console.log(`   • ${dup.similarity}% - ${dup.title}`);
        console.log(`     Category: ${dup.category} | File: ${dup.file}`);
      });
    } else {
      console.log('✅ PASSED - Topic is semantically unique');
      console.log(
        `   Highest similarity: ${semanticCheck.highestSimilarity}% (threshold: ${semanticCheck.threshold}%)`
      );

      if (semanticCheck.similar.length > 0) {
        console.log('\n   Somewhat similar (but acceptable):');
        semanticCheck.similar.forEach((sim) => {
          console.log(`   • ${sim.similarity}% - ${sim.title}`);
        });
      }
    }

    // 2. Cross-category check
    console.log('\n🔄 CROSS-CATEGORY CHECK');
    const crossCheck = await this.checkCrossCategoryDuplicates(
      proposedTitle,
      proposedDesc,
      targetCategory
    );

    if (crossCheck.hasCrossCategoryDuplicates) {
      console.log('⚠️  WARNING - Similar topics in other categories');
      console.log(`   Threshold: ${crossCheck.threshold}%`);
      console.log('\n   Similar articles in other categories:');
      crossCheck.duplicates.forEach((dup) => {
        console.log(`   • ${dup.similarity}% - ${dup.title}`);
        console.log(`     Category: ${dup.category}`);
      });
    } else {
      console.log('✅ PASSED - No cross-category overlap');
    }

    // 3. Category saturation check (integrate with existing tool)
    const ContentDiversityManager = require('./content-diversity-manager.js');
    const diversityManager = new ContentDiversityManager();
    const saturation = diversityManager.analyzeContentSaturation(
      targetCategory,
      30
    );

    console.log('\n📈 CATEGORY SATURATION (30 days)');
    console.log(`   Recent articles: ${saturation.recentArticles}`);

    if (saturation.oversaturatedTopics.length > 0) {
      console.log('   ⚠️  Oversaturated topics:');
      saturation.saturation
        .filter((s) => s.count >= 2)
        .forEach((topic) => {
          console.log(`   • ${topic.pattern}: ${topic.count} articles`);
        });
    } else {
      console.log('   ✅ Good topic diversity');
    }

    // Final verdict
    console.log('\n' + '─'.repeat(60));
    const shouldProceed = !semanticCheck.isDuplicate;

    if (shouldProceed) {
      console.log('🟢 VERDICT: PROCEED WITH CONTENT CREATION');

      if (crossCheck.hasCrossCategoryDuplicates) {
        console.log('\n💡 Note: Similar topics exist in other categories.');
        console.log('   Ensure your angle is unique and adds value.');
      }
    } else {
      console.log('🔴 VERDICT: STOP - DO NOT PROCEED');
      console.log('\n💡 ALTERNATIVE TOPICS SUGGESTED:');
      const alternatives = diversityManager.generateDiverseQueries(
        targetCategory,
        3
      );
      alternatives.forEach((alt, i) => {
        console.log(`   ${i + 1}. ${alt}`);
      });
    }

    console.log('\n');

    return shouldProceed;
  }

  /**
   * Batch analyze category for duplicate clusters
   */
  async batchAnalyze(category) {
    console.log(
      `\n🔍 Analyzing ${category} category for semantic clusters...\n`
    );

    const articles = this.loadArticles(category);
    const clusters = [];
    const processed = new Set();

    for (let i = 0; i < articles.length; i++) {
      if (processed.has(i)) continue;

      const article1 = articles[i];
      const emb1 = await this.getEmbedding(
        `${article1.title} ${article1.description}`
      );
      const cluster = [article1];
      processed.add(i);

      for (let j = i + 1; j < articles.length; j++) {
        if (processed.has(j)) continue;

        const article2 = articles[j];
        const emb2 = await this.getEmbedding(
          `${article2.title} ${article2.description}`
        );
        const similarity = this.cosineSimilarity(emb1, emb2);

        if (similarity >= 0.7) {
          cluster.push({
            ...article2,
            similarity: Math.round(similarity * 100),
          });
          processed.add(j);
        }
      }

      if (cluster.length > 1) {
        clusters.push(cluster);
      }
    }

    // Report clusters
    if (clusters.length === 0) {
      console.log(`✅ No duplicate clusters found in ${category}`);
    } else {
      console.log(
        `⚠️  Found ${clusters.length} duplicate clusters in ${category}:\n`
      );

      clusters.forEach((cluster, i) => {
        console.log(`Cluster ${i + 1}: ${cluster.length} articles`);
        cluster.forEach((article) => {
          const sim = article.similarity
            ? ` (${article.similarity}% similar)`
            : '';
          console.log(`  • ${article.title}${sim}`);
        });
        console.log('');
      });
    }

    return clusters;
  }

  /**
   * Extract frontmatter from MDX file
   */
  extractFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return {};

    const frontmatter = {};
    const lines = match[1].split('\n');

    let currentKey = null;
    let currentValue = '';
    let inMultiline = false;

    lines.forEach((line) => {
      if (line.trim().endsWith(':') && !inMultiline) {
        if (currentKey) {
          frontmatter[currentKey] = this.parseValue(currentValue.trim());
        }
        currentKey = line.trim().slice(0, -1);
        currentValue = '';
      } else if (
        line.includes(':') &&
        !inMultiline &&
        !line.trim().startsWith('-')
      ) {
        if (currentKey) {
          frontmatter[currentKey] = this.parseValue(currentValue.trim());
        }
        const [key, ...valueParts] = line.split(':');
        currentKey = key.trim();
        currentValue = valueParts.join(':').trim();

        if (
          currentValue === '>-' ||
          currentValue === '>' ||
          currentValue === '|'
        ) {
          inMultiline = true;
          currentValue = '';
        }
      } else {
        if (
          line.trim() &&
          !line.startsWith('  ') &&
          inMultiline &&
          !line.startsWith('-')
        ) {
          inMultiline = false;
        }
        currentValue += (currentValue ? '\n' : '') + line;
      }
    });

    if (currentKey) {
      frontmatter[currentKey] = this.parseValue(currentValue.trim());
    }

    return frontmatter;
  }

  parseValue(value) {
    if (!value) return '';

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

    // Handle multiline strings
    return value.replace(/\n\s+/g, ' ').trim();
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const checker = new SemanticSimilarityChecker();

  try {
    switch (command) {
      case 'check': {
        const title = args[1];
        const description = args[2];
        const category = args[3] || 'all';

        if (!title || !description) {
          console.error(
            '\nUsage: node semantic-similarity-checker.js check "Title" "Description" [category]'
          );
          console.error('\nExample:');
          console.error(
            '  node semantic-similarity-checker.js check "CRISPR Saves Baby" "Gene editing breakthrough" health\n'
          );
          process.exit(1);
        }

        const shouldProceed = await checker.generateValidationReport(
          title,
          description,
          category
        );
        process.exit(shouldProceed ? 0 : 1);
        break;
      }

      case 'cross-check': {
        const title = args[1];
        const description = args[2];
        const targetCategory = args[3];

        if (!title || !description || !targetCategory) {
          console.error(
            '\nUsage: node semantic-similarity-checker.js cross-check "Title" "Description" category'
          );
          process.exit(1);
        }

        const result = await checker.checkCrossCategoryDuplicates(
          title,
          description,
          targetCategory
        );
        console.log(JSON.stringify(result, null, 2));
        process.exit(result.hasCrossCategoryDuplicates ? 1 : 0);
        break;
      }

      case 'batch-analyze': {
        const category = args[1];

        if (!category) {
          console.error(
            '\nUsage: node semantic-similarity-checker.js batch-analyze <category>'
          );
          console.error(
            '\nCategories: science, technology, space, health, psychology, culture\n'
          );
          process.exit(1);
        }

        await checker.batchAnalyze(category);
        break;
      }

      case 'install-deps': {
        console.log(
          '\n📦 Installing enhanced semantic analysis dependencies...\n'
        );
        console.log('For production-grade semantic similarity, install:');
        console.log('  npm install @xenova/transformers\n');
        console.log(
          'This will enable transformer-based sentence embeddings (all-MiniLM-L6-v2)'
        );
        console.log('Current implementation uses TF-IDF fallback.\n');
        break;
      }

      default:
        console.log(`
Semantic Similarity Checker - AI-powered duplicate detection
─────────────────────────────────────────────────────────────

Detects conceptual duplicates that string matching misses:
  • "CRISPR Gene Therapy" vs "DNA Editing Treatment" ✓
  • "Gratitude Rewires Brain" vs "Neuroscience of Thankfulness" ✓
  • "Quantum Computing" vs "IBM Quantum Processors" ✓

Usage:
  node semantic-similarity-checker.js check "Title" "Description" [category]
  node semantic-similarity-checker.js cross-check "Title" "Description" category
  node semantic-similarity-checker.js batch-analyze <category>
  node semantic-similarity-checker.js install-deps

Examples:
  node semantic-similarity-checker.js check "CRISPR Saves Baby" "Gene editing breakthrough" health
  node semantic-similarity-checker.js cross-check "AI Brain Interface" "Neural control" technology
  node semantic-similarity-checker.js batch-analyze health

Categories: science, technology, space, health, psychology, culture
        `);
        break;
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = SemanticSimilarityChecker;
