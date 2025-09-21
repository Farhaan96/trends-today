#!/usr/bin/env node

/**
 * Semantic Keywords Analyzer v1.0
 * Analyzes content for semantic SEO optimization and entity relationships
 * Focuses on natural language patterns and search intent
 */

const fs = require('fs');
const path = require('path');

class SemanticKeywordAnalyzer {
  constructor() {
    // Common entities and their relationships
    this.entityRelationships = {
      technology: {
        related: [
          'AI',
          'machine learning',
          'automation',
          'software',
          'hardware',
          'innovation',
        ],
        entities: ['Google', 'Microsoft', 'OpenAI', 'Meta', 'Apple', 'AWS'],
        concepts: [
          'algorithm',
          'data',
          'cloud',
          'API',
          'platform',
          'framework',
        ],
      },
      health: {
        related: [
          'medicine',
          'wellness',
          'treatment',
          'diagnosis',
          'therapy',
          'clinical',
        ],
        entities: ['FDA', 'WHO', 'CDC', 'NIH', 'Mayo Clinic', 'Johns Hopkins'],
        concepts: [
          'symptoms',
          'prevention',
          'research',
          'trials',
          'patients',
          'doctors',
        ],
      },
      science: {
        related: [
          'research',
          'discovery',
          'experiment',
          'hypothesis',
          'theory',
          'evidence',
        ],
        entities: ['NASA', 'MIT', 'Stanford', 'Harvard', 'Nature', 'Science'],
        concepts: [
          'molecule',
          'quantum',
          'physics',
          'biology',
          'chemistry',
          'genetics',
        ],
      },
      psychology: {
        related: [
          'behavior',
          'mental health',
          'cognition',
          'emotion',
          'consciousness',
          'brain',
        ],
        entities: [
          'APA',
          'psychiatry',
          'neuroscience',
          'therapy',
          'counseling',
        ],
        concepts: [
          'anxiety',
          'depression',
          'memory',
          'learning',
          'personality',
          'motivation',
        ],
      },
      space: {
        related: [
          'astronomy',
          'cosmos',
          'universe',
          'galaxy',
          'exploration',
          'satellite',
        ],
        entities: ['NASA', 'SpaceX', 'ESA', 'JWST', 'ISS', 'Mars', 'Moon'],
        concepts: ['orbit', 'rocket', 'telescope', 'planet', 'star', 'mission'],
      },
      culture: {
        related: [
          'society',
          'trends',
          'social media',
          'lifestyle',
          'art',
          'entertainment',
        ],
        entities: ['TikTok', 'Instagram', 'YouTube', 'Netflix', 'Spotify'],
        concepts: [
          'creator',
          'content',
          'viral',
          'community',
          'influence',
          'digital',
        ],
      },
    };

    // Search intent patterns
    this.intentPatterns = {
      informational: [
        'what',
        'how',
        'why',
        'when',
        'where',
        'who',
        'guide',
        'tutorial',
        'explained',
        'meaning',
        'definition',
        'examples',
        'types',
        'benefits',
        'process',
        'methods',
      ],
      transactional: [
        'buy',
        'price',
        'cost',
        'cheap',
        'deal',
        'discount',
        'order',
        'purchase',
        'shop',
        'sale',
        'offer',
      ],
      navigational: [
        'login',
        'sign in',
        'website',
        'contact',
        'location',
        'near me',
        'directions',
        'hours',
        'address',
      ],
      investigational: [
        'vs',
        'versus',
        'compare',
        'comparison',
        'difference',
        'alternative',
        'review',
        'best',
        'top',
        'which',
      ],
    };

    // LSI (Latent Semantic Indexing) keywords
    this.lsiKeywords = {
      'artificial intelligence': [
        'machine learning',
        'neural networks',
        'deep learning',
        'AI models',
        'algorithms',
      ],
      'climate change': [
        'global warming',
        'carbon emissions',
        'greenhouse gases',
        'sustainability',
        'renewable energy',
      ],
      'mental health': [
        'anxiety',
        'depression',
        'therapy',
        'wellness',
        'mindfulness',
        'stress management',
      ],
      'quantum computing': [
        'qubits',
        'superposition',
        'entanglement',
        'quantum supremacy',
        'quantum algorithms',
      ],
      blockchain: [
        'cryptocurrency',
        'smart contracts',
        'decentralized',
        'ledger',
        'Web3',
      ],
      'gene therapy': [
        'CRISPR',
        'DNA editing',
        'genetic engineering',
        'mutations',
        'gene expression',
      ],
    };
  }

  /**
   * Analyze content for semantic keywords and entities
   */
  analyzeContent(content, metadata = {}) {
    const analysis = {
      primaryKeyword:
        metadata.primaryKeyword || this.extractPrimaryKeyword(content),
      semanticKeywords: [],
      entities: [],
      searchIntent: null,
      lsiTerms: [],
      topicalRelevance: 0,
      keywordDensity: {},
      naturalLanguageScore: 0,
      recommendations: [],
    };

    // Extract and analyze text
    const text = this.extractText(content);
    const words = this.tokenize(text);
    const phrases = this.extractPhrases(text);

    // Identify semantic keywords
    analysis.semanticKeywords = this.identifySemanticKeywords(
      text,
      metadata.category
    );

    // Extract entities
    analysis.entities = this.extractEntities(text, metadata.category);

    // Determine search intent
    analysis.searchIntent = this.determineSearchIntent(text, metadata.title);

    // Find LSI terms
    analysis.lsiTerms = this.findLSITerms(text, analysis.primaryKeyword);

    // Calculate topical relevance
    analysis.topicalRelevance = this.calculateTopicalRelevance(
      text,
      metadata.category
    );

    // Analyze keyword density (natural)
    analysis.keywordDensity = this.analyzeKeywordDensity(words, phrases);

    // Natural language score
    analysis.naturalLanguageScore = this.calculateNaturalLanguageScore(text);

    // Generate recommendations
    analysis.recommendations = this.generateRecommendations(analysis);

    return analysis;
  }

  /**
   * Extract text from MDX content
   */
  extractText(content) {
    // Remove frontmatter
    const contentWithoutFrontmatter = content.replace(/^---[\s\S]+?---/, '');

    // Remove MDX/markdown formatting
    let text = contentWithoutFrontmatter;
    text = text.replace(/#{1,6}\s/g, ''); // Headers
    text = text.replace(/\*\*([^*]+)\*\*/g, '$1'); // Bold
    text = text.replace(/\*([^*]+)\*/g, '$1'); // Italic
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Links
    text = text.replace(/```[\s\S]+?```/g, ''); // Code blocks
    text = text.replace(/`([^`]+)`/g, '$1'); // Inline code
    text = text.replace(/^>\s/gm, ''); // Blockquotes

    return text.trim();
  }

  /**
   * Tokenize text into words
   */
  tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 2);
  }

  /**
   * Extract multi-word phrases
   */
  extractPhrases(text, maxWords = 4) {
    const phrases = [];
    const words = text.toLowerCase().split(/\s+/);

    for (let length = 2; length <= maxWords; length++) {
      for (let i = 0; i <= words.length - length; i++) {
        const phrase = words.slice(i, i + length).join(' ');
        if (this.isPhraseRelevant(phrase)) {
          phrases.push(phrase);
        }
      }
    }

    return phrases;
  }

  /**
   * Check if phrase is relevant
   */
  isPhraseRelevant(phrase) {
    const stopWords = [
      'the',
      'is',
      'at',
      'which',
      'on',
      'and',
      'a',
      'an',
      'as',
      'are',
      'was',
      'were',
      'been',
    ];
    const words = phrase.split(' ');

    // Avoid phrases that start/end with stop words
    if (
      stopWords.includes(words[0]) ||
      stopWords.includes(words[words.length - 1])
    ) {
      return false;
    }

    // Phrase should have at least one meaningful word
    return words.some((word) => word.length > 4);
  }

  /**
   * Extract primary keyword from content
   */
  extractPrimaryKeyword(content) {
    const titleMatch = content.match(/^title:\s*['"](.+)['"]$/m);
    if (titleMatch) {
      const title = titleMatch[1].toLowerCase();
      // Extract the main concept from title
      const words = title.split(/\s+/).filter((w) => w.length > 4);
      return words.slice(0, 3).join(' ');
    }
    return '';
  }

  /**
   * Identify semantic keywords based on category
   */
  identifySemanticKeywords(text, category = 'general') {
    const keywords = new Set();
    const textLower = text.toLowerCase();

    // Add category-specific related terms
    if (this.entityRelationships[category]) {
      const categoryData = this.entityRelationships[category];

      categoryData.related.forEach((term) => {
        if (textLower.includes(term.toLowerCase())) {
          keywords.add(term);
        }
      });

      categoryData.concepts.forEach((concept) => {
        if (textLower.includes(concept.toLowerCase())) {
          keywords.add(concept);
        }
      });
    }

    // Find naturally occurring semantic terms
    const phrases = this.extractPhrases(text, 3);
    const phraseCounts = {};

    phrases.forEach((phrase) => {
      phraseCounts[phrase] = (phraseCounts[phrase] || 0) + 1;
    });

    // Add frequent meaningful phrases
    Object.entries(phraseCounts)
      .filter(([phrase, count]) => count >= 2 && phrase.split(' ').length >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([phrase]) => keywords.add(phrase));

    return Array.from(keywords);
  }

  /**
   * Extract named entities from text
   */
  extractEntities(text, category = 'general') {
    const entities = new Set();

    // Category-specific entities
    if (this.entityRelationships[category]) {
      this.entityRelationships[category].entities.forEach((entity) => {
        if (text.includes(entity)) {
          entities.add(entity);
        }
      });
    }

    // Common patterns for entities
    const patterns = [
      /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, // Person names
      /\b[A-Z]{2,}\b/g, // Acronyms
      /\b(?:Dr|Prof|Mr|Ms|Mrs)\.\s+[A-Z][a-z]+/g, // Titles
      /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+(?:University|Institute|Laboratory|Center|Agency))\b/g, // Institutions
    ];

    patterns.forEach((pattern) => {
      const matches = text.match(pattern) || [];
      matches.forEach((match) => {
        if (match.length > 2 && !this.isCommonWord(match)) {
          entities.add(match);
        }
      });
    });

    return Array.from(entities);
  }

  /**
   * Check if word is common (not an entity)
   */
  isCommonWord(word) {
    const common = [
      'The',
      'This',
      'That',
      'These',
      'Those',
      'Here',
      'There',
      'What',
      'When',
      'Where',
    ];
    return common.includes(word);
  }

  /**
   * Determine search intent from content
   */
  determineSearchIntent(text, title = '') {
    const combined = (title + ' ' + text).toLowerCase();
    const intents = {
      informational: 0,
      transactional: 0,
      navigational: 0,
      investigational: 0,
    };

    // Check for intent patterns
    Object.entries(this.intentPatterns).forEach(([intent, patterns]) => {
      patterns.forEach((pattern) => {
        if (combined.includes(pattern)) {
          intents[intent]++;
        }
      });
    });

    // Determine primary intent
    const primary = Object.entries(intents).sort((a, b) => b[1] - a[1])[0];

    return {
      primary: primary[0],
      confidence: primary[1] > 0 ? 'high' : 'low',
      scores: intents,
    };
  }

  /**
   * Find LSI (Latent Semantic Indexing) terms
   */
  findLSITerms(text, primaryKeyword) {
    const lsiTerms = [];
    const textLower = text.toLowerCase();

    // Check if primary keyword has known LSI terms
    Object.entries(this.lsiKeywords).forEach(([keyword, terms]) => {
      if (
        primaryKeyword.includes(keyword) ||
        keyword.includes(primaryKeyword)
      ) {
        terms.forEach((term) => {
          if (textLower.includes(term.toLowerCase())) {
            lsiTerms.push(term);
          }
        });
      }
    });

    return lsiTerms;
  }

  /**
   * Calculate topical relevance score
   */
  calculateTopicalRelevance(text, category) {
    if (!this.entityRelationships[category]) return 50;

    const categoryData = this.entityRelationships[category];
    const textLower = text.toLowerCase();
    let relevanceScore = 0;
    let totalTerms = 0;

    // Check related terms
    categoryData.related.forEach((term) => {
      totalTerms++;
      if (textLower.includes(term.toLowerCase())) {
        relevanceScore++;
      }
    });

    // Check concepts
    categoryData.concepts.forEach((concept) => {
      totalTerms++;
      if (textLower.includes(concept.toLowerCase())) {
        relevanceScore++;
      }
    });

    return Math.round((relevanceScore / totalTerms) * 100);
  }

  /**
   * Analyze keyword density naturally
   */
  analyzeKeywordDensity(words, phrases) {
    const density = {};
    const totalWords = words.length;

    // Count word frequencies
    const wordCounts = {};
    words.forEach((word) => {
      if (word.length > 4) {
        // Only meaningful words
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });

    // Calculate density for top keywords
    Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([word, count]) => {
        density[word] = {
          count,
          percentage: ((count / totalWords) * 100).toFixed(2),
        };
      });

    return density;
  }

  /**
   * Calculate natural language score
   */
  calculateNaturalLanguageScore(text) {
    let score = 100;

    // Check for keyword stuffing
    const words = this.tokenize(text);
    const wordCounts = {};
    words.forEach((word) => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });

    // Penalize over-repetition
    Object.values(wordCounts).forEach((count) => {
      if (count > words.length * 0.05) {
        // More than 5% frequency
        score -= 10;
      }
    });

    // Check for natural sentence variation
    const sentences = text.split(/[.!?]+/);
    const avgSentenceLength =
      sentences.reduce((sum, s) => sum + s.split(' ').length, 0) /
      sentences.length;

    if (avgSentenceLength < 10 || avgSentenceLength > 25) {
      score -= 10;
    }

    // Check for transition words
    const transitions = [
      'however',
      'therefore',
      'moreover',
      'furthermore',
      'additionally',
      'meanwhile',
    ];
    const hasTransitions = transitions.some((t) =>
      text.toLowerCase().includes(t)
    );
    if (!hasTransitions) {
      score -= 5;
    }

    return Math.max(0, score);
  }

  /**
   * Generate SEO recommendations
   */
  generateRecommendations(analysis) {
    const recommendations = [];

    // Check semantic keyword coverage
    if (analysis.semanticKeywords.length < 5) {
      recommendations.push('Add more semantic variations and related terms');
    }

    // Check entity usage
    if (analysis.entities.length < 2) {
      recommendations.push(
        'Include more authoritative sources and expert names'
      );
    }

    // Check search intent alignment
    if (analysis.searchIntent.confidence === 'low') {
      recommendations.push('Strengthen content to better match search intent');
    }

    // Check LSI terms
    if (analysis.lsiTerms.length < 2) {
      recommendations.push(
        'Include more contextually related terms (LSI keywords)'
      );
    }

    // Check topical relevance
    if (analysis.topicalRelevance < 50) {
      recommendations.push(
        'Increase category-specific terminology and concepts'
      );
    }

    // Check natural language
    if (analysis.naturalLanguageScore < 70) {
      recommendations.push('Write more naturally, avoid keyword stuffing');
    }

    // Check keyword density
    const densityValues = Object.values(analysis.keywordDensity);
    if (densityValues.some((d) => parseFloat(d.percentage) > 3)) {
      recommendations.push('Reduce repetition of overused keywords');
    }

    return recommendations;
  }

  /**
   * Analyze file from path
   */
  analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');

      // Extract metadata from frontmatter
      const metadata = {};
      const titleMatch = content.match(/^title:\s*['"](.+)['"]$/m);
      const categoryMatch = content.match(/^category:\s*(.+)$/m);
      const keywordMatch = content.match(/primaryKeyword:\s*['"](.+)['"]$/m);

      if (titleMatch) metadata.title = titleMatch[1];
      if (categoryMatch) metadata.category = categoryMatch[1];
      if (keywordMatch) metadata.primaryKeyword = keywordMatch[1];

      return this.analyzeContent(content, metadata);
    } catch (error) {
      throw new Error(`Error analyzing file: ${error.message}`);
    }
  }
}

// CLI Interface
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const analyzer = new SemanticKeywordAnalyzer();

  if (command === 'analyze' && args[1]) {
    const filePath = args[1];

    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      process.exit(1);
    }

    try {
      const analysis = analyzer.analyzeFile(filePath);

      console.log('\n📊 SEMANTIC KEYWORD ANALYSIS\n' + '='.repeat(50));

      console.log(
        '\n🎯 Primary Keyword:',
        analysis.primaryKeyword || 'Not identified'
      );

      console.log(
        '\n🔤 Semantic Keywords:',
        analysis.semanticKeywords.length > 0
          ? '\n  • ' + analysis.semanticKeywords.join('\n  • ')
          : 'None found'
      );

      console.log(
        '\n👤 Entities:',
        analysis.entities.length > 0
          ? '\n  • ' + analysis.entities.join('\n  • ')
          : 'None found'
      );

      console.log('\n🔍 Search Intent:');
      console.log(
        `  Primary: ${analysis.searchIntent.primary} (${analysis.searchIntent.confidence} confidence)`
      );

      console.log(
        '\n🔗 LSI Terms:',
        analysis.lsiTerms.length > 0
          ? analysis.lsiTerms.join(', ')
          : 'None found'
      );

      console.log('\n📈 Scores:');
      console.log(`  • Topical Relevance: ${analysis.topicalRelevance}%`);
      console.log(`  • Natural Language: ${analysis.naturalLanguageScore}/100`);

      console.log('\n📊 Top Keywords by Density:');
      Object.entries(analysis.keywordDensity)
        .slice(0, 5)
        .forEach(([word, data]) => {
          console.log(`  • ${word}: ${data.count} times (${data.percentage}%)`);
        });

      if (analysis.recommendations.length > 0) {
        console.log('\n💡 Recommendations:');
        analysis.recommendations.forEach((rec) => {
          console.log(`  • ${rec}`);
        });
      } else {
        console.log('\n✅ No improvements needed - content is well-optimized!');
      }
    } catch (error) {
      console.error(`Analysis failed: ${error.message}`);
      process.exit(1);
    }
  } else {
    console.log('Semantic Keyword Analyzer v1.0\n');
    console.log('Usage:');
    console.log('  node semantic-keywords.js analyze <file.mdx>\n');
    console.log('Example:');
    console.log(
      '  node semantic-keywords.js analyze content/technology/ai-article.mdx'
    );
  }
}

// Export for use as module
if (require.main === module) {
  main();
} else {
  module.exports = SemanticKeywordAnalyzer;
}
