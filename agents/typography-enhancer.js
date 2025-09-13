/**
 * Typography Enhancer Agent
 * Enhances ultra-short articles with bold emphasis, blockquotes, and visual hierarchy
 * Ensures all articles follow the Ultra-Short Readable Strategy formatting
 */

const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');

class TypographyEnhancer {
  constructor() {
    this.contentDir = path.join(__dirname, '../content');
  }

  /**
   * Enhance typography for an article
   */
  async enhanceArticle(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const { data: frontmatter, content: body } = matter(content);

      console.log(`📝 Enhancing typography for: ${path.basename(filePath)}`);

      // Apply typography enhancements
      let enhancedBody = body;
      enhancedBody = this.boldStatistics(enhancedBody);
      enhancedBody = this.formatQuotes(enhancedBody);
      enhancedBody = this.addSectionSeparators(enhancedBody);
      enhancedBody = this.shortenParagraphs(enhancedBody);
      enhancedBody = this.addWhiteSpace(enhancedBody);

      // Rebuild the article
      const enhancedContent = matter.stringify(enhancedBody, frontmatter);

      // Save the enhanced version
      await fs.writeFile(filePath, enhancedContent);

      console.log(`✅ Enhanced: ${path.basename(filePath)}`);
      return true;
    } catch (error) {
      console.error(`❌ Error enhancing ${filePath}:`, error.message);
      return false;
    }
  }

  /**
   * Bold all statistics and percentages
   */
  boldStatistics(content) {
    // Bold percentages (e.g., 73%, 2.5%)
    content = content.replace(/(\d+\.?\d*%)/g, '**$1**');

    // Bold large numbers with context (e.g., $500 billion, 10 million users)
    content = content.replace(/(\$?\d+\.?\d*\s*(billion|million|thousand|K|M|B))/gi, '**$1**');

    // Bold multipliers (e.g., 10x, 3X)
    content = content.replace(/(\d+[xX]\s)/g, '**$1**');

    // Bold numeric comparisons (e.g., 3 out of 4, 9/10)
    content = content.replace(/(\d+\s*(?:out of|\/)\s*\d+)/g, '**$1**');

    // Bold year statistics (e.g., by 2025, in 2024)
    content = content.replace(/((?:by|in|since)\s+20\d{2})/gi, '**$1**');

    return content;
  }

  /**
   * Format quotes as blockquotes
   */
  formatQuotes(content) {
    // Convert inline quotes to blockquotes if they're expert quotes
    const quotePattern = /"([^"]{50,})"(?:\s*[-—]\s*([^,\n]+(?:,\s*[^\n]+)?))?/g;

    content = content.replace(quotePattern, (match, quote, attribution) => {
      if (attribution) {
        return `\n> "${quote}"\n> — ${attribution}\n`;
      }
      return `\n> "${quote}"\n`;
    });

    return content;
  }

  /**
   * Add horizontal rule separators between major sections
   */
  addSectionSeparators(content) {
    // Add --- before H2 headers if not already present
    content = content.replace(/\n(?!---\n)(## )/g, '\n---\n\n$1');

    // Ensure proper spacing around horizontal rules
    content = content.replace(/\n---\n/g, '\n\n---\n\n');

    return content;
  }

  /**
   * Ensure paragraphs are 2-3 sentences maximum
   */
  shortenParagraphs(content) {
    const lines = content.split('\n');
    const processedLines = [];

    for (let line of lines) {
      // Skip headers, lists, quotes, and separators
      if (line.startsWith('#') || line.startsWith('-') || line.startsWith('>') || line === '---' || line.trim() === '') {
        processedLines.push(line);
        continue;
      }

      // Split long paragraphs
      const sentences = line.match(/[^.!?]+[.!?]+/g) || [line];
      if (sentences.length > 3) {
        // Group into 2-3 sentence chunks
        for (let i = 0; i < sentences.length; i += 2) {
          const chunk = sentences.slice(i, Math.min(i + 2, sentences.length)).join(' ').trim();
          if (chunk) {
            processedLines.push(chunk);
            if (i + 2 < sentences.length) {
              processedLines.push(''); // Add line break between chunks
            }
          }
        }
      } else {
        processedLines.push(line);
      }
    }

    return processedLines.join('\n');
  }

  /**
   * Add generous white space
   */
  addWhiteSpace(content) {
    // Ensure double line breaks between sections
    content = content.replace(/\n(?=##)/g, '\n\n');

    // Add space after lists
    content = content.replace(/(\n- [^\n]+)(\n(?!-))/g, '$1\n$2');

    // Add space around blockquotes
    content = content.replace(/\n(>.*)\n/g, '\n\n$1\n\n');

    // Clean up excessive whitespace
    content = content.replace(/\n{4,}/g, '\n\n\n');

    return content;
  }

  /**
   * Process all articles in a category
   */
  async enhanceCategory(category) {
    const categoryDir = path.join(this.contentDir, category);

    try {
      const files = await fs.readdir(categoryDir);
      const mdxFiles = files.filter(f => f.endsWith('.mdx'));

      console.log(`\n🎨 Enhancing typography for ${mdxFiles.length} articles in ${category}...`);

      let enhanced = 0;
      for (const file of mdxFiles) {
        const filePath = path.join(categoryDir, file);
        const success = await this.enhanceArticle(filePath);
        if (success) enhanced++;
      }

      console.log(`✅ Enhanced ${enhanced}/${mdxFiles.length} articles in ${category}\n`);
      return enhanced;
    } catch (error) {
      console.error(`❌ Error processing category ${category}:`, error.message);
      return 0;
    }
  }

  /**
   * Process all content
   */
  async enhanceAllContent() {
    const categories = ['technology', 'science', 'psychology', 'health', 'culture', 'space'];
    let totalEnhanced = 0;

    console.log('🎨 Starting typography enhancement for all articles...\n');

    for (const category of categories) {
      const enhanced = await this.enhanceCategory(category);
      totalEnhanced += enhanced;
    }

    console.log(`\n✅ Typography enhancement complete! Enhanced ${totalEnhanced} articles total.`);
    return totalEnhanced;
  }
}

// Run if executed directly
if (require.main === module) {
  const enhancer = new TypographyEnhancer();

  // Get command line arguments
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'all') {
    enhancer.enhanceAllContent();
  } else if (command === 'category' && args[1]) {
    enhancer.enhanceCategory(args[1]);
  } else if (command === 'file' && args[1]) {
    enhancer.enhanceArticle(args[1]);
  } else {
    console.log(`
Typography Enhancer - Enhance article formatting

Usage:
  node typography-enhancer.js all                    # Enhance all articles
  node typography-enhancer.js category <name>        # Enhance specific category
  node typography-enhancer.js file <path>           # Enhance specific file

Examples:
  node typography-enhancer.js all
  node typography-enhancer.js category technology
  node typography-enhancer.js file content/science/article.mdx
    `);
  }
}

module.exports = TypographyEnhancer;