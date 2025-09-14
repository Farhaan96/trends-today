/**
 * Topic Duplicate Checker
 * Prevents creating articles on topics already covered
 * Analyzes existing article titles, keywords, and content similarity
 */

const fs = require('fs').promises;
const path = require('path');

class TopicDuplicateChecker {
  constructor() {
    this.contentDir = path.join(__dirname, '..', 'content');
    this.existingArticles = [];
  }

  async loadExistingArticles() {
    this.existingArticles = [];

    const categories = await fs.readdir(this.contentDir);

    for (const category of categories) {
      const categoryPath = path.join(this.contentDir, category);
      const stat = await fs.stat(categoryPath);

      if (stat.isDirectory()) {
        const files = await fs.readdir(categoryPath);

        for (const file of files) {
          if (file.endsWith('.mdx')) {
            const filePath = path.join(categoryPath, file);
            const content = await fs.readFile(filePath, 'utf-8');

            // Extract frontmatter
            const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
            if (frontmatterMatch) {
              const frontmatter = frontmatterMatch[1];
              const title = frontmatter.match(/title:\s*['"](.*?)['"]/)?.[1] || '';
              const description = frontmatter.match(/description:\s*>-\s*([\s\S]*?)(?=\n[a-z]+:|\n---|\Z)/)?.[1]?.replace(/\n\s*/g, ' ').trim() || '';
              const tags = frontmatter.match(/tags:\s*([\s\S]*?)(?=\n[a-z]+:|\Z)/)?.[1] || '';

              this.existingArticles.push({
                filename: file,
                category,
                title: title.toLowerCase(),
                description: description.toLowerCase(),
                tags: tags.toLowerCase(),
                content: content.toLowerCase(),
                filePath
              });
            }
          }
        }
      }
    }

    console.log(`📚 Loaded ${this.existingArticles.length} existing articles for duplicate checking`);
    return this.existingArticles;
  }

  extractKeywords(text) {
    // Extract meaningful keywords (2+ chars, not common words)
    const commonWords = [
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after',
      'above', 'below', 'between', 'among', 'is', 'are', 'was', 'were', 'be',
      'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
      'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these',
      'those', 'a', 'an', 'as', 'if', 'or', 'not', 'no', 'yes', 'how', 'why',
      'what', 'when', 'where', 'who', 'which', 'more', 'most', 'much', 'many'
    ];

    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.includes(word))
      .filter(word => word.match(/^[a-z]/)); // Only words starting with letters
  }

  calculateSimilarity(text1, text2) {
    const keywords1 = this.extractKeywords(text1);
    const keywords2 = this.extractKeywords(text2);

    if (keywords1.length === 0 || keywords2.length === 0) return 0;

    const commonKeywords = keywords1.filter(word => keywords2.includes(word));
    const similarity = (commonKeywords.length * 2) / (keywords1.length + keywords2.length);

    return similarity;
  }

  async checkForDuplicates(proposedTitle, proposedDescription = '', proposedKeywords = []) {
    await this.loadExistingArticles();

    const duplicates = [];
    const proposedTitleLower = proposedTitle.toLowerCase();
    const proposedDescLower = proposedDescription.toLowerCase();
    const proposedKeywordsStr = proposedKeywords.join(' ').toLowerCase();

    for (const article of this.existingArticles) {
      let duplicateScore = 0;
      const reasons = [];

      // 1. Exact title match (high penalty)
      if (article.title === proposedTitleLower) {
        duplicateScore += 1.0;
        reasons.push('Exact title match');
      }

      // 2. Title similarity (high penalty for >70% similarity)
      const titleSimilarity = this.calculateSimilarity(article.title, proposedTitleLower);
      if (titleSimilarity > 0.7) {
        duplicateScore += 0.8;
        reasons.push(`High title similarity (${Math.round(titleSimilarity * 100)}%)`);
      } else if (titleSimilarity > 0.5) {
        duplicateScore += 0.5;
        reasons.push(`Moderate title similarity (${Math.round(titleSimilarity * 100)}%)`);
      }

      // 3. Description similarity
      if (proposedDescLower && article.description) {
        const descSimilarity = this.calculateSimilarity(article.description, proposedDescLower);
        if (descSimilarity > 0.6) {
          duplicateScore += 0.6;
          reasons.push(`High description similarity (${Math.round(descSimilarity * 100)}%)`);
        }
      }

      // 4. Keyword overlap
      if (proposedKeywordsStr) {
        const keywordSimilarity = this.calculateSimilarity(article.tags + ' ' + article.title, proposedKeywordsStr);
        if (keywordSimilarity > 0.6) {
          duplicateScore += 0.4;
          reasons.push(`High keyword overlap (${Math.round(keywordSimilarity * 100)}%)`);
        }
      }

      // 5. Check for common tech terms that indicate same topic
      const techTerms = {
        'quantum': ['quantum', 'qubit', 'superposition'],
        'ai': ['artificial intelligence', 'machine learning', 'neural network', 'llm', 'gpt'],
        'apple': ['apple', 'iphone', 'ios', 'siri', 'apple intelligence'],
        'google': ['google', 'android', 'chrome', 'pixel', 'gemini'],
        'spacex': ['spacex', 'starship', 'falcon', 'mars'],
        'tesla': ['tesla', 'model', 'autopilot', 'fsd'],
        'meta': ['meta', 'facebook', 'instagram', 'vr', 'metaverse']
      };

      for (const [category, terms] of Object.entries(techTerms)) {
        const proposedHasTerms = terms.some(term => proposedTitleLower.includes(term));
        const existingHasTerms = terms.some(term => article.title.includes(term) || article.description.includes(term));

        if (proposedHasTerms && existingHasTerms) {
          duplicateScore += 0.3;
          reasons.push(`Same tech category: ${category}`);
          break;
        }
      }

      // Record significant duplicates (score > 0.6)
      if (duplicateScore > 0.6) {
        duplicates.push({
          filename: article.filename,
          category: article.category,
          title: article.title,
          duplicateScore: Math.round(duplicateScore * 100),
          reasons: reasons,
          filePath: article.filePath
        });
      }
    }

    // Sort by duplicate score (highest first)
    duplicates.sort((a, b) => b.duplicateScore - a.duplicateScore);

    return {
      isDuplicate: duplicates.length > 0 && duplicates[0].duplicateScore > 80,
      duplicates: duplicates.slice(0, 5), // Top 5 potential duplicates
      riskLevel: this.assessRiskLevel(duplicates)
    };
  }

  assessRiskLevel(duplicates) {
    if (duplicates.length === 0) return 'LOW';

    const highestScore = duplicates[0].duplicateScore;

    if (highestScore > 90) return 'CRITICAL'; // Almost certain duplicate
    if (highestScore > 80) return 'HIGH';     // Very likely duplicate
    if (highestScore > 65) return 'MEDIUM';   // Possible duplicate
    return 'LOW';                             // Low risk
  }

  generateAlternativeTopics(originalTopic, duplicates) {
    const suggestions = [];

    // If quantum computing duplicate, suggest alternatives
    if (originalTopic.toLowerCase().includes('quantum')) {
      suggestions.push(
        'IBM Quantum Network Reaches 1000+ Members Milestone',
        'Quantum Internet: First City-Wide Network Goes Live',
        'Microsoft Azure Quantum Cloud Breaks Computing Records'
      );
    }

    // If AI duplicate, suggest alternatives
    if (originalTopic.toLowerCase().includes('ai') || originalTopic.toLowerCase().includes('artificial intelligence')) {
      suggestions.push(
        'OpenAI Sora Video Generation Goes Mainstream',
        'Anthropic Claude 3.5 Defeats GPT-4 in Reasoning Tests',
        'Meta AI Llama 3 Powers 500M+ Daily Users'
      );
    }

    // If Apple duplicate, suggest alternatives
    if (originalTopic.toLowerCase().includes('apple') || originalTopic.toLowerCase().includes('iphone')) {
      suggestions.push(
        'Apple Vision Pro 2 Leaks Reveal Revolutionary Features',
        'iPhone 17 Air: Thinnest iPhone Ever at 6mm',
        'Apple Car Project Phoenix: Secret Development Continues'
      );
    }

    return suggestions;
  }

  async generateDuplicateReport(proposedTitle, proposedDescription = '', proposedKeywords = []) {
    const result = await this.checkForDuplicates(proposedTitle, proposedDescription, proposedKeywords);

    console.log(`\n🔍 DUPLICATE CHECK REPORT`);
    console.log(`================================`);
    console.log(`Proposed Topic: "${proposedTitle}"`);
    console.log(`Risk Level: ${result.riskLevel}`);
    console.log(`Is Duplicate: ${result.isDuplicate ? '❌ YES' : '✅ NO'}`);

    if (result.duplicates.length > 0) {
      console.log(`\n📋 Potential Duplicates Found:`);
      result.duplicates.forEach((dup, index) => {
        console.log(`${index + 1}. ${dup.filename} (${dup.duplicateScore}% similar)`);
        console.log(`   Title: "${dup.title}"`);
        console.log(`   Reasons: ${dup.reasons.join(', ')}`);
        console.log('');
      });

      if (result.isDuplicate) {
        const alternatives = this.generateAlternativeTopics(proposedTitle, result.duplicates);
        if (alternatives.length > 0) {
          console.log(`💡 Suggested Alternative Topics:`);
          alternatives.forEach((alt, index) => {
            console.log(`${index + 1}. ${alt}`);
          });
        }
      }
    } else {
      console.log(`\n✅ No duplicates found - topic is unique!`);
    }

    return result;
  }
}

// CLI interface
if (require.main === module) {
  const checker = new TopicDuplicateChecker();

  const args = process.argv.slice(2);
  const command = args[0];

  async function run() {
    switch (command) {
      case 'check':
        const title = args[1];
        const description = args[2] || '';

        if (!title) {
          console.log('Usage: node topic-duplicate-checker.js check "Article Title" ["Description"]');
          return;
        }

        await checker.generateDuplicateReport(title, description);
        break;

      case 'list':
        await checker.loadExistingArticles();
        console.log('\n📚 Existing Articles:');
        checker.existingArticles.forEach(article => {
          console.log(`${article.category}/${article.filename}: "${article.title}"`);
        });
        break;

      default:
        console.log(`
🔍 Topic Duplicate Checker

Usage: node topic-duplicate-checker.js <command> [options]

Commands:
  check "title" ["description"]  - Check if topic is duplicate
  list                          - List all existing articles

Examples:
  node topic-duplicate-checker.js check "Google's New Quantum Chip"
  node topic-duplicate-checker.js check "AI Breakthrough" "Latest ChatGPT update"
  node topic-duplicate-checker.js list
        `);
    }
  }

  run().catch(console.error);
}

module.exports = { TopicDuplicateChecker };