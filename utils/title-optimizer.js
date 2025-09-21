#!/usr/bin/env node

/**
 * Title Optimizer Utility
 * Validates and optimizes article titles using the SPARK framework
 * Ensures 50-60 character compliance and SEO optimization
 */

const fs = require('fs');
const path = require('path');

class TitleOptimizer {
  constructor() {
    this.sparkElements = {
      powerWords: [
        'Scientists', 'Breakthrough', 'Secret', 'Impossible', 'Doctors', 'NASA', 'MIT',
        'Found', 'Discovered', 'Revealed', 'Proved', 'Breakthrough', 'Revolutionary',
        'Hidden', 'Nobody', 'Can\'t Explain', 'Mystery', 'Shocking', 'Stunning'
      ],
      actionWords: [
        'Detects', 'Transforms', 'Reveals', 'Solves', 'Doubles', 'Cuts', 'Reverses',
        'Found', 'Discovered', 'Proves', 'Shows', 'Beats', 'Changes', 'Breaks'
      ],
      numberPatterns: [
        /\d+%/,           // percentages: 90%
        /\d+x/i,          // multipliers: 3x
        /\d+,?\d*/,       // numbers: 26, 5,400
        /\d+-year/i,      // time: 500-year
        /\d+\s*mph/i,     // speed: 5,400 MPH
        /\d+\s*days?/i,   // duration: 7 days
      ]
    };

    this.titleTemplates = [
      {
        pattern: "Scientists Found [Number] Ways [Tech] [Benefit]",
        example: "Scientists Found 3 Ways AI Detects Cancer Early",
        category: "science"
      },
      {
        pattern: "Why [Percentage] of [Group] [Action] [Thing]",
        example: "Why 90% of Planets Rain Glass at 5,400 MPH",
        category: "science"
      },
      {
        pattern: "How [Tech] [Action] [Problem] [Multiplier] Faster",
        example: "How AI Solves Cancer Detection 3x Faster",
        category: "technology"
      },
      {
        pattern: "[Treatment] Cuts [Disease] by [Percentage]",
        example: "Gene Therapy Cuts Cancer Deaths by 44%",
        category: "health"
      },
      {
        pattern: "Secret [Process] Doubles [Outcome] in [Time]",
        example: "Secret Brain Trick Doubles Memory in 7 Days",
        category: "psychology"
      }
    ];
  }

  /**
   * Validate title against SPARK criteria
   */
  validateTitle(title) {
    const issues = [];
    const suggestions = [];

    // Character count validation (CRITICAL)
    const charCount = title.length;
    if (charCount < 50) {
      issues.push(`Title too short: ${charCount} chars (need 50-60)`);
      suggestions.push("Add specific numbers, power words, or context");
    } else if (charCount > 60) {
      issues.push(`Title too long: ${charCount} chars (need 50-60)`);
      suggestions.push("Remove filler words, abbreviate, or split concepts");
    }

    // SPARK element validation
    const sparkCheck = this.checkSparkElements(title);

    if (!sparkCheck.hasNumbers) {
      issues.push("Missing specific numbers (3, 90%, 26, 500-year)");
      suggestions.push("Add exact statistics or measurements");
    }

    if (!sparkCheck.hasPowerWords) {
      issues.push("Missing power words (Scientists, Breakthrough, Secret)");
      suggestions.push("Start with authority words or emotional triggers");
    }

    if (!sparkCheck.hasAction) {
      issues.push("Missing action words (Found, Detects, Solves)");
      suggestions.push("Use active verbs that create movement");
    }

    return {
      isValid: issues.length === 0 && charCount >= 50 && charCount <= 60,
      charCount,
      issues,
      suggestions,
      sparkScore: this.calculateSparkScore(sparkCheck),
      sparkCheck
    };
  }

  /**
   * Check for SPARK elements in title
   */
  checkSparkElements(title) {
    const titleLower = title.toLowerCase();

    return {
      hasNumbers: this.sparkElements.numberPatterns.some(pattern => pattern.test(title)),
      hasPowerWords: this.sparkElements.powerWords.some(word =>
        titleLower.includes(word.toLowerCase())
      ),
      hasAction: this.sparkElements.actionWords.some(word =>
        titleLower.includes(word.toLowerCase())
      ),
      specificity: this.checkSpecificity(title),
      relevance: this.checkRelevance(title)
    };
  }

  /**
   * Calculate SPARK score (0-100)
   */
  calculateSparkScore(sparkCheck) {
    let score = 0;
    if (sparkCheck.hasNumbers) score += 25;
    if (sparkCheck.hasPowerWords) score += 25;
    if (sparkCheck.hasAction) score += 25;
    if (sparkCheck.specificity) score += 15;
    if (sparkCheck.relevance) score += 10;
    return score;
  }

  /**
   * Check title specificity
   */
  checkSpecificity(title) {
    // Look for specific numbers, timeframes, exact measurements
    const specificityPatterns = [
      /\d+%/,                    // percentages
      /\d+x/i,                   // multipliers
      /\d+,\d+/,                 // large numbers with commas
      /\d+\s*(mph|km\/h)/i,      // speeds
      /\d+\s*(year|day|hour)s?/i,// time periods
      /\d+\.\d+/,                // decimals
    ];

    return specificityPatterns.some(pattern => pattern.test(title));
  }

  /**
   * Check title relevance (question words, searchable terms)
   */
  checkRelevance(title) {
    const relevanceIndicators = [
      /^(how|why|what|which|when|where)/i,  // Question starters
      /\b(help|work|best|better|faster)\b/i, // Benefit words
      /\b(2025|new|latest|breakthrough)\b/i,  // Timeliness
    ];

    return relevanceIndicators.some(pattern => pattern.test(title));
  }

  /**
   * Auto-optimize title to fit 50-60 character range
   */
  optimizeTitle(title) {
    let optimized = title.trim();

    // If too long, apply compression strategies
    if (optimized.length > 60) {
      optimized = this.compressTitle(optimized);
    }

    // If too short, apply expansion strategies
    if (optimized.length < 50) {
      optimized = this.expandTitle(optimized);
    }

    return optimized;
  }

  /**
   * Compress long titles
   */
  compressTitle(title) {
    let compressed = title;

    // Remove unnecessary words
    const fillerWords = [
      'the', 'a', 'an', 'and', 'or', 'but', 'so', 'yet', 'for',
      'that', 'this', 'these', 'those', 'very', 'really', 'quite'
    ];

    // Remove articles and connectors that don't add SEO value
    compressed = compressed.replace(/\b(the|a|an)\s+/gi, '');
    compressed = compressed.replace(/\s+and\s+/gi, ' & ');
    compressed = compressed.replace(/\s+that\s+/gi, ' ');

    // Abbreviate common terms
    const abbreviations = {
      'artificial intelligence': 'AI',
      'machine learning': 'ML',
      'virtual reality': 'VR',
      'augmented reality': 'AR',
      'cryptocurrency': 'crypto',
      'scientists': 'experts',
      'researchers': 'experts',
      'technology': 'tech',
      'percentage': '%'
    };

    Object.entries(abbreviations).forEach(([full, abbrev]) => {
      compressed = compressed.replace(new RegExp(full, 'gi'), abbrev);
    });

    return compressed.trim();
  }

  /**
   * Expand short titles
   */
  expandTitle(title) {
    let expanded = title;

    // Add power words if missing
    const sparkCheck = this.checkSparkElements(expanded);

    if (!sparkCheck.hasPowerWords && expanded.length < 55) {
      if (/scientists?|researchers?|experts?/i.test(expanded)) {
        // Already has authority
      } else {
        expanded = 'Scientists: ' + expanded;
      }
    }

    if (!sparkCheck.hasNumbers && expanded.length < 55) {
      // Suggest adding a number - this would need context
      // For now, flag for manual review
    }

    return expanded.trim();
  }

  /**
   * Suggest optimized titles based on templates
   */
  suggestTitles(originalTitle, category = 'general') {
    const suggestions = [];

    // Extract key concepts from original title
    const concepts = this.extractConcepts(originalTitle);

    // Generate suggestions based on templates
    this.titleTemplates
      .filter(template => template.category === category || category === 'general')
      .forEach(template => {
        const suggestion = this.fillTemplate(template, concepts);
        if (suggestion) {
          suggestions.push({
            title: suggestion,
            template: template.pattern,
            example: template.example
          });
        }
      });

    return suggestions;
  }

  /**
   * Extract key concepts from title
   */
  extractConcepts(title) {
    // Extract numbers
    const numbers = title.match(/\d+(?:[.,]\d+)?%?/g) || [];

    // Extract key nouns (simple approach)
    const words = title.toLowerCase().split(/\s+/);
    const keyTerms = words.filter(word =>
      word.length > 3 &&
      !['the', 'and', 'but', 'for', 'with', 'this', 'that'].includes(word)
    );

    return {
      numbers,
      keyTerms,
      originalLength: title.length
    };
  }

  /**
   * Fill template with concepts (basic implementation)
   */
  fillTemplate(template, concepts) {
    // This is a simplified version - in practice, would need more sophisticated
    // concept matching and natural language processing
    return null; // Placeholder for now
  }

  /**
   * Validate all titles in content directory
   */
  validateAllTitles() {
    const contentDir = path.join(process.cwd(), 'content');
    const results = [];

    if (!fs.existsSync(contentDir)) {
      console.error('Content directory not found');
      return [];
    }

    // Get all MDX files
    const getAllMdxFiles = (dir) => {
      const files = [];
      const items = fs.readdirSync(dir);

      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          files.push(...getAllMdxFiles(fullPath));
        } else if (item.endsWith('.mdx')) {
          files.push(fullPath);
        }
      });

      return files;
    };

    const mdxFiles = getAllMdxFiles(contentDir);

    mdxFiles.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const titleMatch = content.match(/^title:\s*['"](.+)['"]$/m);

        if (titleMatch) {
          const title = titleMatch[1];
          const validation = this.validateTitle(title);

          results.push({
            file: path.relative(process.cwd(), filePath),
            title,
            validation
          });
        }
      } catch (error) {
        console.error(`Error reading ${filePath}:`, error.message);
      }
    });

    return results;
  }
}

// CLI Interface
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const optimizer = new TitleOptimizer();

  switch (command) {
    case 'validate':
      if (args[1]) {
        // Validate single title
        const title = args.slice(1).join(' ');
        const result = optimizer.validateTitle(title);

        console.log(`\nTitle: "${title}"`);
        console.log(`Characters: ${result.charCount}/60`);
        console.log(`SPARK Score: ${result.sparkScore}/100`);

        if (result.isValid) {
          console.log('✅ Title is VALID');
        } else {
          console.log('❌ Title needs optimization');
          result.issues.forEach(issue => console.log(`  - ${issue}`));
          console.log('\nSuggestions:');
          result.suggestions.forEach(suggestion => console.log(`  • ${suggestion}`));
        }
      } else {
        // Validate all titles
        console.log('Validating all article titles...\n');
        const results = optimizer.validateAllTitles();

        const issues = results.filter(r => !r.validation.isValid);
        const valid = results.filter(r => r.validation.isValid);

        console.log(`Results: ${valid.length} valid, ${issues.length} need fixing\n`);

        if (issues.length > 0) {
          console.log('❌ TITLES NEEDING OPTIMIZATION:\n');
          issues.forEach(result => {
            console.log(`File: ${result.file}`);
            console.log(`Title: "${result.title}"`);
            console.log(`Issues: ${result.validation.issues.join(', ')}`);
            console.log(`SPARK Score: ${result.validation.sparkScore}/100\n`);
          });
        }

        if (valid.length > 0) {
          console.log('✅ VALID TITLES:\n');
          valid.forEach(result => {
            console.log(`${result.title} (${result.validation.charCount} chars, ${result.validation.sparkScore}/100)`);
          });
        }
      }
      break;

    case 'optimize':
      if (args[1]) {
        const title = args.slice(1).join(' ');
        const optimized = optimizer.optimizeTitle(title);
        const validation = optimizer.validateTitle(optimized);

        console.log(`Original: "${title}" (${title.length} chars)`);
        console.log(`Optimized: "${optimized}" (${optimized.length} chars)`);
        console.log(`SPARK Score: ${validation.sparkScore}/100`);

        if (validation.isValid) {
          console.log('✅ Optimized title is valid');
        } else {
          console.log('⚠️  Still needs manual refinement');
          validation.suggestions.forEach(suggestion => console.log(`  • ${suggestion}`));
        }
      } else {
        console.log('Usage: node title-optimizer.js optimize "Your Title Here"');
      }
      break;

    case 'suggest':
      if (args[1]) {
        const title = args.slice(1).join(' ');
        const category = args.find(arg => arg.startsWith('--category='))?.split('=')[1] || 'general';
        const suggestions = optimizer.suggestTitles(title, category);

        console.log(`Suggestions for: "${title}"\n`);
        if (suggestions.length > 0) {
          suggestions.forEach((suggestion, index) => {
            console.log(`${index + 1}. ${suggestion.title}`);
            console.log(`   Template: ${suggestion.template}`);
            console.log(`   Example: ${suggestion.example}\n`);
          });
        } else {
          console.log('No template suggestions available. Manual optimization needed.');
        }
      } else {
        console.log('Usage: node title-optimizer.js suggest "Your Title" --category=science');
      }
      break;

    default:
      console.log('Title Optimizer - SPARK Framework Validation\n');
      console.log('Commands:');
      console.log('  validate [title]     - Validate title(s) against SPARK criteria');
      console.log('  optimize "title"     - Auto-optimize title length and SPARK elements');
      console.log('  suggest "title"      - Suggest optimized titles using templates');
      console.log('\nExamples:');
      console.log('  node title-optimizer.js validate');
      console.log('  node title-optimizer.js validate "Your Title Here"');
      console.log('  node title-optimizer.js optimize "This is a very long title that exceeds the character limit"');
      console.log('  node title-optimizer.js suggest "AI Cancer Detection" --category=health');
  }
}

// Export for use as module
if (require.main === module) {
  main();
} else {
  module.exports = TitleOptimizer;
}