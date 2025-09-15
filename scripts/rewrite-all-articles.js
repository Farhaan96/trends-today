/**
 * Rewrite All Articles Script
 * Uses the LeRavi Content Creator to rewrite all existing articles
 * to ultra-short 400-500 word format
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const LeRaviContentCreator = require('../agents/leravi-content-creator');

class ArticleRewriter {
  constructor() {
    this.contentDir = path.join(__dirname, '../content');
    this.creator = new LeRaviContentCreator();
    this.stats = {
      total: 0,
      rewritten: 0,
      failed: 0,
      skipped: 0,
    };
  }

  /**
   * Find all MDX articles in content directory
   */
  findAllArticles() {
    const articles = [];
    const categories = fs
      .readdirSync(this.contentDir)
      .filter((item) =>
        fs.statSync(path.join(this.contentDir, item)).isDirectory()
      );

    for (const category of categories) {
      const categoryPath = path.join(this.contentDir, category);
      const files = fs
        .readdirSync(categoryPath)
        .filter((file) => file.endsWith('.mdx'));

      for (const file of files) {
        articles.push({
          category,
          filename: file,
          filepath: path.join(categoryPath, file),
        });
      }
    }

    return articles;
  }

  /**
   * Extract key information from existing article
   */
  extractArticleInfo(filepath) {
    try {
      const content = fs.readFileSync(filepath, 'utf8');
      const { data: frontmatter, content: body } = matter(content);

      // Extract main topic from title
      const title = frontmatter.title || '';
      const topic = this.extractTopicFromTitle(title);

      // Extract keywords from tags or generate from title
      const keywords = frontmatter.tags || this.generateKeywords(title);

      // Get word count
      const wordCount = body.split(/\s+/).length;

      return {
        title,
        topic,
        keywords,
        category: frontmatter.category || 'technology',
        originalWordCount: wordCount,
        frontmatter,
      };
    } catch (error) {
      console.error(`Error reading ${filepath}:`, error.message);
      return null;
    }
  }

  /**
   * Extract clean topic from title
   */
  extractTopicFromTitle(title) {
    // Keep more of the original title for better context
    return title
      .replace(/\(.*?\)/g, '') // Remove parenthetical content
      .replace(/[:\-–—]/g, ' ') // Replace separators with spaces
      .trim();
  }

  /**
   * Generate keywords from title
   */
  generateKeywords(title) {
    const stopWords = [
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'by',
      'from',
      'as',
      'is',
      'was',
      'are',
      'were',
    ];
    const words = title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((word) => word.length > 3 && !stopWords.includes(word));

    return words.slice(0, 5);
  }

  /**
   * Rewrite a single article
   */
  async rewriteArticle(articleInfo, filepath) {
    const { topic, category, keywords, title, originalWordCount } = articleInfo;

    console.log(`\n📝 Rewriting: ${title}`);
    console.log(`   Category: ${category}`);
    console.log(`   Original: ${originalWordCount} words`);
    console.log(`   Keywords: ${keywords.join(', ')}`);

    try {
      // Generate new ultra-short content
      const newContent = await this.creator.generateUltraShortContent(
        topic,
        category,
        keywords
      );

      // Keep some original metadata but update with new content
      const updatedFrontmatter = {
        ...articleInfo.frontmatter,
        title: this.creator.generateCuriosityGapHeadline(topic, category),
        description: this.creator.generateDescription(topic, category),
        readingTime: 2,
        updatedAt: new Date().toISOString(),
        rewrittenBy: 'LeRavi Ultra-Short Agent',
        originalWordCount: originalWordCount,
        newWordCount: newContent.split(/\s+/).length,
      };

      // Format frontmatter
      const frontmatterStr = Object.entries(updatedFrontmatter)
        .map(([key, value]) => {
          if (value === null || value === undefined) return null;
          if (Array.isArray(value)) {
            return `${key}: [${value.map((v) => `"${v}"`).join(', ')}]`;
          }
          if (typeof value === 'string') {
            return `${key}: "${value.replace(/"/g, '\\"')}"`;
          }
          return `${key}: ${value}`;
        })
        .filter(Boolean)
        .join('\n');

      // Combine frontmatter and content
      const fullContent = `---
${frontmatterStr}
---

${newContent}`;

      // Create backup of original
      const backupPath = filepath.replace('.mdx', '.backup.mdx');
      fs.copyFileSync(filepath, backupPath);

      // Write new content
      fs.writeFileSync(filepath, fullContent, 'utf8');

      const newWordCount = newContent.split(/\s+/).length;
      console.log(
        `   ✅ Rewritten: ${newWordCount} words (reduced by ${Math.round((1 - newWordCount / originalWordCount) * 100)}%)`
      );

      return true;
    } catch (error) {
      console.error(`   ❌ Failed to rewrite: ${error.message}`);
      return false;
    }
  }

  /**
   * Main rewrite process
   */
  async rewriteAll(options = {}) {
    console.log('🚀 Starting article rewrite process...\n');

    const articles = this.findAllArticles();
    this.stats.total = articles.length;

    console.log(`Found ${articles.length} articles to process\n`);

    // Process options
    const limit = options.limit || articles.length;
    const skipBackups = options.skipBackups !== false;
    const category = options.category;

    // Filter articles
    let articlesToProcess = articles;
    if (skipBackups) {
      articlesToProcess = articles.filter(
        (a) => !a.filename.includes('.backup.')
      );
    }
    if (category) {
      articlesToProcess = articlesToProcess.filter(
        (a) => a.category === category
      );
    }

    // Limit number of articles
    articlesToProcess = articlesToProcess.slice(0, limit);

    console.log(`Processing ${articlesToProcess.length} articles...\n`);
    console.log('─'.repeat(60));

    for (const article of articlesToProcess) {
      const info = this.extractArticleInfo(article.filepath);

      if (!info) {
        console.log(`⚠️  Skipping ${article.filename} - couldn't read file`);
        this.stats.skipped++;
        continue;
      }

      // Skip if already short
      if (info.originalWordCount <= 600) {
        console.log(
          `⏭️  Skipping ${article.filename} - already short (${info.originalWordCount} words)`
        );
        this.stats.skipped++;
        continue;
      }

      const success = await this.rewriteArticle(info, article.filepath);

      if (success) {
        this.stats.rewritten++;
      } else {
        this.stats.failed++;
      }

      // Add delay to avoid overwhelming the system
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Print summary
    console.log('\n' + '─'.repeat(60));
    console.log('\n📊 Rewrite Summary:');
    console.log(`   Total articles: ${this.stats.total}`);
    console.log(`   ✅ Rewritten: ${this.stats.rewritten}`);
    console.log(`   ⏭️  Skipped: ${this.stats.skipped}`);
    console.log(`   ❌ Failed: ${this.stats.failed}`);
    console.log('\n✨ Rewrite process complete!');

    return this.stats;
  }
}

// Run the rewriter
if (require.main === module) {
  const rewriter = new ArticleRewriter();

  // Parse command line arguments
  const args = process.argv.slice(2);
  const options = {};

  // Parse options
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--limit' && args[i + 1]) {
      options.limit = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === '--category' && args[i + 1]) {
      options.category = args[i + 1];
      i++;
    } else if (args[i] === '--help') {
      console.log(`
📝 Article Rewriter Script
Rewrites all articles to ultra-short 400-500 word format

Usage:
  node scripts/rewrite-all-articles.js [options]

Options:
  --limit <n>        Limit number of articles to rewrite
  --category <name>  Only rewrite articles in specific category
  --help            Show this help message

Examples:
  node scripts/rewrite-all-articles.js
  node scripts/rewrite-all-articles.js --limit 5
  node scripts/rewrite-all-articles.js --category technology
      `);
      process.exit(0);
    }
  }

  // Run rewriter
  rewriter
    .rewriteAll(options)
    .then((stats) => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = ArticleRewriter;
