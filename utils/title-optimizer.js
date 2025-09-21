#!/usr/bin/env node

/**
 * Title Optimizer Utility v2.0
 * Provides suggestions and flexible validation for article titles
 * Focuses on natural language and search intent over rigid formulas
 * Optimal range: 50-70 characters (best: 55-65)
 */

const fs = require('fs');
const path = require('path');

class TitleOptimizer {
  constructor() {
    this.sparkElements = {
      powerWords: [
        'Scientists',
        'Breakthrough',
        'Secret',
        'Impossible',
        'Doctors',
        'NASA',
        'MIT',
        'Found',
        'Discovered',
        'Revealed',
        'Proved',
        'Breakthrough',
        'Revolutionary',
        'Hidden',
        'Nobody',
        "Can't Explain",
        'Mystery',
        'Shocking',
        'Stunning',
      ],
      actionWords: [
        'Detects',
        'Transforms',
        'Reveals',
        'Solves',
        'Doubles',
        'Cuts',
        'Reverses',
        'Found',
        'Discovered',
        'Proves',
        'Shows',
        'Beats',
        'Changes',
        'Breaks',
      ],
      numberPatterns: [
        /\d+%/, // percentages: 90%
        /\d+x/i, // multipliers: 3x
        /\d+,?\d*/, // numbers: 26, 5,400
        /\d+-year/i, // time: 500-year
        /\d+\s*mph/i, // speed: 5,400 MPH
        /\d+\s*days?/i, // duration: 7 days
      ],
    };

    this.titleTemplates = [
      {
        pattern: 'Scientists Found [Number] Ways [Tech] [Benefit]',
        example: 'Scientists Found 3 Ways AI Detects Cancer Early',
        category: 'science',
      },
      {
        pattern: 'Why [Percentage] of [Group] [Action] [Thing]',
        example: 'Why 90% of Planets Rain Glass at 5,400 MPH',
        category: 'science',
      },
      {
        pattern: 'How [Tech] [Action] [Problem] [Multiplier] Faster',
        example: 'How AI Solves Cancer Detection 3x Faster',
        category: 'technology',
      },
      {
        pattern: '[Treatment] Cuts [Disease] by [Percentage]',
        example: 'Gene Therapy Cuts Cancer Deaths by 44%',
        category: 'health',
      },
      {
        pattern: 'Secret [Process] Doubles [Outcome] in [Time]',
        example: 'Secret Brain Trick Doubles Memory in 7 Days',
        category: 'psychology',
      },
    ];
  }

  /**
   * Suggest improvements for title (flexible validation)
   */
  suggestTitle(title) {
    const suggestions = [];
    const strengths = [];
    const improvements = [];

    // Character count validation (FLEXIBLE)
    const charCount = title.length;
    if (charCount < 50) {
      improvements.push(
        `Title is ${charCount} chars (optimal: 55-65, acceptable: 50-70)`
      );
      suggestions.push('Consider adding more context or descriptive words');
    } else if (charCount > 70) {
      improvements.push(
        `Title is ${charCount} chars (optimal: 55-65, max recommended: 70)`
      );
      suggestions.push('Consider shortening while preserving key message');
    } else if (charCount >= 55 && charCount <= 65) {
      strengths.push(`Perfect length: ${charCount} characters`);
    } else {
      strengths.push(`Good length: ${charCount} characters`);
    }

    // Natural element analysis (not requirements)
    const elements = this.analyzeNaturalElements(title);

    if (elements.hasNumbers) {
      strengths.push('Contains specific numbers for credibility');
    } else {
      suggestions.push(
        'Consider adding specific numbers or statistics if relevant'
      );
    }

    if (elements.hasPowerWords) {
      strengths.push('Uses compelling power words');
    }

    if (elements.hasAction) {
      strengths.push('Contains active, engaging verbs');
    }

    if (elements.hasQuestion) {
      strengths.push('Question format good for voice search');
    }

    if (elements.hasEmotionalHook) {
      strengths.push('Creates emotional connection');
    }

    return {
      optimal: charCount >= 55 && charCount <= 65,
      acceptable: charCount >= 50 && charCount <= 70,
      charCount,
      strengths,
      improvements,
      suggestions,
      naturalScore: this.calculateNaturalScore(elements),
      elements,
      searchIntentMatch: this.assessSearchIntent(title),
    };
  }

  /**
   * Analyze natural elements in title (not requirements)
   */
  analyzeNaturalElements(title) {
    const titleLower = title.toLowerCase();

    return {
      hasNumbers: this.sparkElements.numberPatterns.some((pattern) =>
        pattern.test(title)
      ),
      hasPowerWords: this.sparkElements.powerWords.some((word) =>
        titleLower.includes(word.toLowerCase())
      ),
      hasAction: this.sparkElements.actionWords.some((word) =>
        titleLower.includes(word.toLowerCase())
      ),
      hasQuestion: /^(how|what|why|when|where|who|which|can|does|is)/i.test(
        title
      ),
      hasEmotionalHook: this.checkEmotionalHook(title),
      specificity: this.checkSpecificity(title),
      relevance: this.checkRelevance(title),
      naturalFlow: this.checkNaturalFlow(title),
    };
  }

  /**
   * Calculate natural optimization score (0-100)
   */
  calculateNaturalScore(elements) {
    let score = 0;
    if (elements.hasNumbers) score += 15;
    if (elements.hasPowerWords) score += 15;
    if (elements.hasAction) score += 15;
    if (elements.hasQuestion) score += 10;
    if (elements.hasEmotionalHook) score += 10;
    if (elements.specificity) score += 15;
    if (elements.relevance) score += 10;
    if (elements.naturalFlow) score += 10;
    return score;
  }

  /**
   * Check for emotional hook
   */
  checkEmotionalHook(title) {
    const emotionalWords = [
      'amazing',
      'surprising',
      'shocking',
      'incredible',
      'revolutionary',
      'breakthrough',
      'secret',
      'hidden',
      'revealed',
      'truth',
      'real',
      'finally',
      'actually',
      'really',
      'proven',
      'game-changing',
    ];
    const titleLower = title.toLowerCase();
    return emotionalWords.some((word) => titleLower.includes(word));
  }

  /**
   * Check natural flow and readability
   */
  checkNaturalFlow(title) {
    // Check if title reads naturally
    const hasNaturalStructure = /^[A-Z][^:]+(:.*)?$/.test(title);
    const notTooManyNumbers = (title.match(/\d+/g) || []).length <= 2;
    const properSpacing = !/ {2,}/.test(title);
    return hasNaturalStructure && notTooManyNumbers && properSpacing;
  }

  /**
   * Assess search intent match
   */
  assessSearchIntent(title) {
    const intents = {
      informational: 0,
      transactional: 0,
      navigational: 0,
      investigational: 0,
    };

    // Informational intent signals
    if (/^(how|what|why|when|where|who)\s/i.test(title))
      intents.informational += 3;
    if (/guide|tutorial|explained|understanding/i.test(title))
      intents.informational += 2;

    // Transactional intent signals
    if (/best|top|review|buy|cheap|deal/i.test(title))
      intents.transactional += 2;

    // Investigational intent signals
    if (/vs\.|versus|comparison|difference/i.test(title))
      intents.investigational += 2;

    const primary = Object.keys(intents).reduce((a, b) =>
      intents[a] > intents[b] ? a : b
    );
    return {
      primary,
      score: intents[primary],
      strong: intents[primary] >= 2,
    };
  }

  /**
   * Check title specificity
   */
  checkSpecificity(title) {
    // Look for specific numbers, timeframes, exact measurements
    const specificityPatterns = [
      /\d+%/, // percentages
      /\d+x/i, // multipliers
      /\d+,\d+/, // large numbers with commas
      /\d+\s*(mph|km\/h)/i, // speeds
      /\d+\s*(year|day|hour)s?/i, // time periods
      /\d+\.\d+/, // decimals
    ];

    return specificityPatterns.some((pattern) => pattern.test(title));
  }

  /**
   * Check title relevance (question words, searchable terms)
   */
  checkRelevance(title) {
    const relevanceIndicators = [
      /^(how|why|what|which|when|where)/i, // Question starters
      /\b(help|work|best|better|faster)\b/i, // Benefit words
      /\b(2025|new|latest|breakthrough)\b/i, // Timeliness
    ];

    return relevanceIndicators.some((pattern) => pattern.test(title));
  }

  /**
   * Auto-optimize title to fit optimal character range (50-70, best 55-65)
   */
  optimizeTitle(title) {
    let optimized = title.trim();

    // If too long, apply compression strategies
    if (optimized.length > 70) {
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
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'so',
      'yet',
      'for',
      'that',
      'this',
      'these',
      'those',
      'very',
      'really',
      'quite',
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
      cryptocurrency: 'crypto',
      scientists: 'experts',
      researchers: 'experts',
      technology: 'tech',
      percentage: '%',
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
    const elements = this.analyzeNaturalElements(expanded);

    if (!elements.hasPowerWords && expanded.length < 55) {
      if (/scientists?|researchers?|experts?/i.test(expanded)) {
        // Already has authority
      } else {
        expanded = 'Scientists: ' + expanded;
      }
    }

    if (!elements.hasNumbers && expanded.length < 55) {
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
      .filter(
        (template) => template.category === category || category === 'general'
      )
      .forEach((template) => {
        const suggestion = this.fillTemplate(template, concepts);
        if (suggestion) {
          suggestions.push({
            title: suggestion,
            template: template.pattern,
            example: template.example,
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
    const keyTerms = words.filter(
      (word) =>
        word.length > 3 &&
        !['the', 'and', 'but', 'for', 'with', 'this', 'that'].includes(word)
    );

    return {
      numbers,
      keyTerms,
      originalLength: title.length,
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
   * Analyze all titles in content directory
   */
  analyzeAllTitles() {
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

      items.forEach((item) => {
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

    mdxFiles.forEach((filePath) => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const titleMatch = content.match(/^title:\s*['"](.+)['"]$/m);

        if (titleMatch) {
          const title = titleMatch[1];
          const analysis = this.suggestTitle(title);

          results.push({
            file: path.relative(process.cwd(), filePath),
            title,
            analysis,
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
    case 'suggest':
      if (args[1]) {
        // Analyze and suggest improvements for title
        const title = args.slice(1).join(' ');
        const result = optimizer.suggestTitle(title);

        console.log(`\n📝 Title Analysis: "${title}"`);
        console.log(`📏 Length: ${result.charCount} characters`);

        if (result.optimal) {
          console.log('✅ Status: OPTIMAL (55-65 chars)');
        } else if (result.acceptable) {
          console.log('✅ Status: ACCEPTABLE (50-70 chars)');
        } else {
          console.log('⚠️  Status: NEEDS ADJUSTMENT');
        }

        console.log(`🎯 Natural Score: ${result.naturalScore}/100`);
        console.log(
          `🔍 Search Intent: ${result.searchIntentMatch.primary} (${result.searchIntentMatch.strong ? 'strong' : 'moderate'})`
        );

        if (result.strengths.length > 0) {
          console.log('\n💪 Strengths:');
          result.strengths.forEach((strength) =>
            console.log(`  • ${strength}`)
          );
        }

        if (result.improvements.length > 0) {
          console.log('\n🔧 Areas for Improvement:');
          result.improvements.forEach((improvement) =>
            console.log(`  • ${improvement}`)
          );
        }

        if (result.suggestions.length > 0) {
          console.log('\n💡 Suggestions:');
          result.suggestions.forEach((suggestion) =>
            console.log(`  • ${suggestion}`)
          );
        }
      } else {
        // Analyze all titles
        console.log('Analyzing all article titles...\n');
        const results = optimizer.analyzeAllTitles();

        const optimal = results.filter((r) => r.analysis.optimal);
        const acceptable = results.filter(
          (r) => r.analysis.acceptable && !r.analysis.optimal
        );
        const needsWork = results.filter((r) => !r.analysis.acceptable);

        console.log(
          `📊 Results: ${optimal.length} optimal, ${acceptable.length} acceptable, ${needsWork.length} need adjustment\n`
        );

        if (optimal.length > 0) {
          console.log('✅ OPTIMAL TITLES (55-65 chars):\n');
          optimal.forEach((result) => {
            console.log(
              `  • ${result.title} (${result.analysis.charCount} chars, score: ${result.analysis.naturalScore}/100)`
            );
          });
        }

        if (acceptable.length > 0) {
          console.log('\n✔️  ACCEPTABLE TITLES (50-70 chars):\n');
          acceptable.forEach((result) => {
            console.log(
              `  • ${result.title} (${result.analysis.charCount} chars, score: ${result.analysis.naturalScore}/100)`
            );
          });
        }

        if (needsWork.length > 0) {
          console.log('\n⚠️  TITLES NEEDING ADJUSTMENT:\n');
          needsWork.forEach((result) => {
            console.log(`File: ${result.file}`);
            console.log(
              `Title: "${result.title}" (${result.analysis.charCount} chars)`
            );
            if (result.analysis.suggestions.length > 0) {
              console.log(`Suggestions:`);
              result.analysis.suggestions.forEach((s) =>
                console.log(`  • ${s}`)
              );
            }
            console.log('');
          });
        }
      }
      break;

    case 'optimize':
      if (args[1]) {
        const title = args.slice(1).join(' ');
        const optimized = optimizer.optimizeTitle(title);
        const analysis = optimizer.suggestTitle(optimized);

        console.log(`Original: "${title}" (${title.length} chars)`);
        console.log(`Optimized: "${optimized}" (${optimized.length} chars)`);
        console.log(`Natural Score: ${analysis.naturalScore}/100`);

        if (analysis.optimal) {
          console.log('✅ Optimized title is in optimal range');
        } else if (analysis.acceptable) {
          console.log('✔️  Optimized title is acceptable');
        } else {
          console.log('⚠️  Still needs manual refinement');
          analysis.suggestions.forEach((suggestion) =>
            console.log(`  • ${suggestion}`)
          );
        }
      } else {
        console.log(
          'Usage: node title-optimizer.js optimize "Your Title Here"'
        );
      }
      break;

    default:
      console.log('Title Optimizer v2.0 - Natural SEO Analysis\n');
      console.log('Commands:');
      console.log(
        '  suggest [title]      - Analyze and suggest improvements for title(s)'
      );
      console.log(
        '  optimize "title"     - Auto-optimize title to ideal length'
      );
      console.log('\nExamples:');
      console.log('  node title-optimizer.js suggest');
      console.log('  node title-optimizer.js suggest "Your Title Here"');
      console.log(
        '  node title-optimizer.js optimize "This is a very long title that exceeds the character limit"'
      );
      console.log('\nOptimal Range: 55-65 characters');
      console.log('Acceptable Range: 50-70 characters');
  }
}

// Export for use as module
if (require.main === module) {
  main();
} else {
  module.exports = TitleOptimizer;
}
