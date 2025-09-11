#!/usr/bin/env node

/**
 * SEO Keyword Research Agent
 * Advanced keyword research with clustering, competitor analysis, and content opportunity identification
 * Optimized for long-tail keywords and featured snippets
 */

require('dotenv').config({ path: '.env.local' });

const fs = require('fs').promises;
const path = require('path');
const LongTailKeywordGenerator = require('../utils/long-tail-keyword-generator');
const categories = require('../config/content-categories');

class SEOKeywordResearcher {
  constructor() {
    this.keywordGenerator = new LongTailKeywordGenerator();
    this.perplexityApiKey = process.env.PERPLEXITY_API_KEY;
    this.reportDir = path.join(__dirname, '..', 'reports', 'seo');
    
    // Keyword research sources
    this.sources = {
      trending: ['Google Trends', 'Reddit', 'Twitter/X', 'TikTok'],
      questions: ['People Also Ask', 'Quora', 'Reddit', 'AnswerThePublic'],
      competitors: ['TechCrunch', 'Wired', 'The Verge', 'Ars Technica'],
      tools: ['Google Keyword Planner', 'Ubersuggest', 'AlsoAsked']
    };
    
    // Search intent categories
    this.searchIntents = {
      informational: {
        patterns: ['what is', 'how to', 'why does', 'guide to', 'tutorial'],
        contentType: 'educational article',
        targetLength: '2000-2500 words'
      },
      commercial: {
        patterns: ['best', 'top', 'review', 'comparison', 'vs'],
        contentType: 'product review or comparison',
        targetLength: '1500-2000 words'
      },
      transactional: {
        patterns: ['buy', 'price', 'cheap', 'deal', 'discount'],
        contentType: 'buying guide',
        targetLength: '1000-1500 words'
      },
      navigational: {
        patterns: ['brand name', 'website', 'login', 'download'],
        contentType: 'resource page',
        targetLength: '800-1200 words'
      }
    };
  }

  /**
   * Discover trending topics and keywords for a category
   */
  async discoverTrendingKeywords(category, options = {}) {
    const {
      limit = 20,
      timeframe = '7d', // 1d, 7d, 30d, 90d
      includeCompetitors = true,
      includeQuestions = true
    } = options;

    console.log(`\n🔍 Discovering trending keywords for ${category}...`);

    const trendingTopics = await this.getTrendingTopics(category, timeframe);
    const keywords = [];

    // Generate keywords for each trending topic
    for (const topic of trendingTopics) {
      const topicKeywords = this.keywordGenerator.generateKeywords(topic, category, {
        count: 10,
        includeQuestions,
        includeVoiceSearch: true
      });

      // Analyze each keyword
      for (const keyword of topicKeywords) {
        const analysis = await this.analyzeKeyword(keyword, category);
        keywords.push(analysis);
      }
    }

    // Add competitor keywords if requested
    if (includeCompetitors) {
      const competitorKeywords = await this.getCompetitorKeywords(category);
      keywords.push(...competitorKeywords);
    }

    // Sort by opportunity score
    keywords.sort((a, b) => b.opportunityScore - a.opportunityScore);

    // Save report
    await this.saveKeywordReport(category, keywords.slice(0, limit));

    return keywords.slice(0, limit);
  }

  /**
   * Get trending topics for a category
   */
  async getTrendingTopics(category, timeframe) {
    const categoryConfig = categories.categories[category];
    if (!categoryConfig) return [];

    // Simulate trending topics (in production, would use actual APIs)
    const trendingTemplates = {
      science: [
        'quantum computing breakthrough',
        'CRISPR gene editing advancement',
        'fusion energy milestone',
        'brain-computer interface',
        'dark matter detection'
      ],
      technology: [
        'AI consciousness debate',
        'quantum internet development',
        'metaverse adoption',
        'blockchain scalability',
        'autonomous vehicles progress'
      ],
      health: [
        'longevity research breakthrough',
        'gut microbiome discoveries',
        'mental health innovations',
        'personalized medicine advances',
        'sleep optimization techniques'
      ],
      psychology: [
        'neuroplasticity discoveries',
        'social media mental impact',
        'cognitive enhancement methods',
        'emotional intelligence training',
        'meditation brain changes'
      ],
      culture: [
        'Gen Alpha trends',
        'remote work culture shift',
        'digital nomad lifestyle',
        'sustainable living movement',
        'AI art controversy'
      ],
      space: [
        'Mars colonization update',
        'James Webb discoveries',
        'commercial space tourism',
        'asteroid mining prospects',
        'exoplanet habitability'
      ]
    };

    return trendingTemplates[category] || [];
  }

  /**
   * Analyze a keyword for SEO potential
   */
  async analyzeKeyword(keyword, category) {
    const difficulty = this.keywordGenerator.analyzeKeywordDifficulty(keyword);
    const intent = this.determineSearchIntent(keyword);
    const seasonality = this.checkSeasonality(keyword);
    const trendDirection = this.analyzeTrend(keyword);
    
    // Calculate opportunity score
    const opportunityScore = this.calculateOpportunityScore({
      difficulty: difficulty.difficulty,
      intent,
      seasonality,
      trendDirection,
      wordCount: difficulty.wordCount,
      hasQuestion: difficulty.hasQuestion
    });

    return {
      keyword,
      category,
      ...difficulty,
      intent,
      seasonality,
      trendDirection,
      opportunityScore,
      contentRecommendation: this.getContentRecommendation(keyword, intent),
      estimatedTraffic: this.estimateTraffic(difficulty.difficulty),
      competitionLevel: this.getCompetitionLevel(difficulty.difficulty)
    };
  }

  /**
   * Determine search intent from keyword
   */
  determineSearchIntent(keyword) {
    const keywordLower = keyword.toLowerCase();
    
    for (const [intent, config] of Object.entries(this.searchIntents)) {
      for (const pattern of config.patterns) {
        if (keywordLower.includes(pattern)) {
          return {
            type: intent,
            contentType: config.contentType,
            targetLength: config.targetLength,
            confidence: 0.8
          };
        }
      }
    }

    // Default to informational
    return {
      type: 'informational',
      contentType: 'educational article',
      targetLength: '1500-2000 words',
      confidence: 0.5
    };
  }

  /**
   * Check keyword seasonality
   */
  checkSeasonality(keyword) {
    const seasonal = {
      january: ['new year', 'resolution', 'fitness', 'diet'],
      february: ['valentine', 'love', 'romance'],
      march: ['spring', 'cleaning', 'garden'],
      april: ['easter', 'tax', 'spring break'],
      may: ['mother', 'graduation', 'memorial'],
      june: ['father', 'summer', 'vacation'],
      july: ['independence', 'bbq', 'beach'],
      august: ['back to school', 'college'],
      september: ['fall', 'autumn', 'school'],
      october: ['halloween', 'costume', 'pumpkin'],
      november: ['thanksgiving', 'black friday', 'cyber monday'],
      december: ['christmas', 'holiday', 'gift', 'new year']
    };

    const keywordLower = keyword.toLowerCase();
    const currentMonth = new Date().toLocaleString('default', { month: 'long' }).toLowerCase();
    
    for (const [month, terms] of Object.entries(seasonal)) {
      for (const term of terms) {
        if (keywordLower.includes(term)) {
          return {
            isSeasonal: true,
            peakMonth: month,
            isCurrentlyRelevant: month === currentMonth
          };
        }
      }
    }

    return {
      isSeasonal: false,
      peakMonth: null,
      isCurrentlyRelevant: true
    };
  }

  /**
   * Analyze keyword trend direction
   */
  analyzeTrend(keyword) {
    // Simulate trend analysis (in production, would use actual trend data)
    const trendingTerms = ['AI', 'ChatGPT', 'quantum', 'sustainable', 'metaverse', 'Web3'];
    const decliningTerms = ['NFT', 'crypto', 'blockchain game'];
    
    const keywordLower = keyword.toLowerCase();
    
    for (const term of trendingTerms) {
      if (keywordLower.includes(term.toLowerCase())) {
        return { direction: 'rising', momentum: 'strong' };
      }
    }
    
    for (const term of decliningTerms) {
      if (keywordLower.includes(term.toLowerCase())) {
        return { direction: 'declining', momentum: 'weak' };
      }
    }
    
    return { direction: 'stable', momentum: 'moderate' };
  }

  /**
   * Calculate opportunity score for a keyword
   */
  calculateOpportunityScore(factors) {
    let score = 100;
    
    // Difficulty factor (lower is better)
    score -= factors.difficulty * 0.5;
    
    // Intent factor
    if (factors.intent.type === 'commercial') score += 15;
    if (factors.intent.type === 'informational') score += 10;
    
    // Seasonality factor
    if (factors.seasonality.isCurrentlyRelevant) score += 10;
    
    // Trend factor
    if (factors.trendDirection.direction === 'rising') score += 20;
    if (factors.trendDirection.direction === 'declining') score -= 15;
    
    // Long-tail bonus
    if (factors.wordCount >= 4) score += 15;
    if (factors.wordCount >= 6) score += 10;
    
    // Question bonus
    if (factors.hasQuestion) score += 10;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Get content recommendation for keyword
   */
  getContentRecommendation(keyword, intent) {
    const recommendations = {
      format: intent.contentType,
      structure: [],
      optimization: []
    };

    // Structure recommendations
    if (intent.type === 'informational') {
      recommendations.structure = [
        'Start with a compelling hook',
        'Include a featured snippet-optimized paragraph after first H2',
        'Add FAQ section with 5-8 questions',
        'Include step-by-step instructions if applicable',
        'Add expert quotes and citations'
      ];
    } else if (intent.type === 'commercial') {
      recommendations.structure = [
        'Lead with benefits and key features',
        'Include comparison table',
        'Add pros and cons section',
        'Include pricing information',
        'Add buyer\'s guide section'
      ];
    }

    // Optimization recommendations
    recommendations.optimization = [
      `Use keyword "${keyword}" in title, H1, and first paragraph`,
      'Include 3-5 related long-tail variations',
      'Add schema markup for better rich snippets',
      'Optimize images with descriptive alt text',
      'Target 2-3% keyword density for natural flow'
    ];

    return recommendations;
  }

  /**
   * Estimate traffic potential
   */
  estimateTraffic(difficulty) {
    if (difficulty < 30) return '500-1000 visits/month';
    if (difficulty < 50) return '200-500 visits/month';
    if (difficulty < 70) return '50-200 visits/month';
    return '10-50 visits/month';
  }

  /**
   * Get competition level description
   */
  getCompetitionLevel(difficulty) {
    if (difficulty < 30) return 'Low - Easy to rank';
    if (difficulty < 50) return 'Medium - Achievable with good content';
    if (difficulty < 70) return 'High - Requires strong authority';
    return 'Very High - Extremely competitive';
  }

  /**
   * Get competitor keywords (simplified version)
   */
  async getCompetitorKeywords(category) {
    // In production, would scrape or use API to get actual competitor data
    const competitorKeywords = {
      technology: [
        'best laptops 2025 under 1000',
        'iPhone 16 vs Samsung Galaxy S25',
        'how to use ChatGPT for coding',
        'quantum computer explained simply'
      ],
      science: [
        'CRISPR gene editing pros and cons',
        'fusion energy breakthrough 2025',
        'dark matter evidence found',
        'quantum entanglement practical applications'
      ],
      health: [
        'gut microbiome diet plan',
        'intermittent fasting benefits science',
        'mental health apps that actually work',
        'longevity supplements backed by research'
      ],
      psychology: [
        'signs of high emotional intelligence',
        'how to improve focus and concentration',
        'psychology of procrastination explained',
        'cognitive behavioral therapy techniques'
      ],
      culture: [
        'Gen Z workplace expectations',
        'digital nomad visa countries 2025',
        'sustainable fashion brands affordable',
        'social media detox benefits'
      ],
      space: [
        'SpaceX Starship Mars mission timeline',
        'James Webb telescope discoveries list',
        'how to become an astronaut 2025',
        'commercial space flight cost'
      ]
    };

    const keywords = competitorKeywords[category] || [];
    
    return keywords.map(keyword => ({
      keyword,
      category,
      source: 'competitor analysis',
      ...this.keywordGenerator.analyzeKeywordDifficulty(keyword),
      intent: this.determineSearchIntent(keyword),
      opportunityScore: Math.floor(Math.random() * 30) + 60 // 60-90 range
    }));
  }

  /**
   * Create keyword clusters for topic coverage
   */
  async createKeywordClusters(primaryKeyword, category, options = {}) {
    const {
      clusterSize = 5,
      includeQuestions = true
    } = options;

    console.log(`\n📊 Creating keyword clusters for: ${primaryKeyword}`);

    const clusters = {
      primary: {
        keyword: primaryKeyword,
        type: 'pillar',
        targetLength: '2500+ words',
        keywords: [primaryKeyword]
      },
      supporting: [],
      questions: [],
      comparisons: [],
      guides: []
    };

    // Generate variations for supporting content
    const variations = this.keywordGenerator.generateKeywords(primaryKeyword, category, {
      count: 20,
      includeQuestions: true,
      includeVoiceSearch: true
    });

    // Categorize variations into clusters
    for (const keyword of variations) {
      const intent = this.determineSearchIntent(keyword);
      
      if (keyword.includes('vs') || keyword.includes('compared to')) {
        clusters.comparisons.push({
          keyword,
          type: 'comparison',
          targetLength: '1500-2000 words'
        });
      } else if (keyword.startsWith('how to') || keyword.includes('guide')) {
        clusters.guides.push({
          keyword,
          type: 'guide',
          targetLength: '1800-2200 words'
        });
      } else if (keyword.includes('?') || intent.type === 'informational') {
        clusters.questions.push({
          keyword,
          type: 'FAQ',
          targetLength: '800-1200 words'
        });
      } else {
        clusters.supporting.push({
          keyword,
          type: 'supporting',
          targetLength: '1200-1500 words'
        });
      }
    }

    // Limit cluster sizes
    Object.keys(clusters).forEach(key => {
      if (Array.isArray(clusters[key])) {
        clusters[key] = clusters[key].slice(0, clusterSize);
      }
    });

    return clusters;
  }

  /**
   * Identify content gaps and opportunities
   */
  async identifyContentGaps(category, existingContent = []) {
    console.log(`\n🎯 Identifying content gaps for ${category}...`);

    const allKeywords = await this.discoverTrendingKeywords(category, { limit: 50 });
    const gaps = [];

    for (const keywordData of allKeywords) {
      const isCovered = existingContent.some(content => 
        content.toLowerCase().includes(keywordData.keyword.toLowerCase())
      );

      if (!isCovered && keywordData.opportunityScore > 60) {
        gaps.push({
          ...keywordData,
          priority: this.calculatePriority(keywordData),
          estimatedImpact: this.estimateImpact(keywordData)
        });
      }
    }

    // Sort by priority
    gaps.sort((a, b) => b.priority - a.priority);

    return gaps;
  }

  /**
   * Calculate content priority
   */
  calculatePriority(keywordData) {
    let priority = keywordData.opportunityScore;
    
    // Boost rising trends
    if (keywordData.trendDirection.direction === 'rising') priority += 20;
    
    // Boost commercial intent
    if (keywordData.intent.type === 'commercial') priority += 15;
    
    // Boost seasonal if currently relevant
    if (keywordData.seasonality.isCurrentlyRelevant) priority += 10;
    
    return Math.min(100, priority);
  }

  /**
   * Estimate content impact
   */
  estimateImpact(keywordData) {
    const impacts = [];
    
    if (keywordData.opportunityScore > 80) {
      impacts.push('High traffic potential');
    }
    
    if (keywordData.intent.type === 'commercial') {
      impacts.push('Revenue opportunity');
    }
    
    if (keywordData.trendDirection.direction === 'rising') {
      impacts.push('Growing interest');
    }
    
    if (keywordData.difficulty < 40) {
      impacts.push('Quick wins possible');
    }
    
    return impacts.join(', ') || 'Standard impact';
  }

  /**
   * Save keyword research report
   */
  async saveKeywordReport(category, keywords) {
    await fs.mkdir(this.reportDir, { recursive: true });
    
    const report = {
      category,
      timestamp: new Date().toISOString(),
      totalKeywords: keywords.length,
      averageOpportunity: Math.round(
        keywords.reduce((sum, k) => sum + k.opportunityScore, 0) / keywords.length
      ),
      keywords,
      recommendations: this.generateRecommendations(keywords)
    };

    const filename = `keyword-research-${category}-${Date.now()}.json`;
    const filepath = path.join(this.reportDir, filename);
    
    await fs.writeFile(filepath, JSON.stringify(report, null, 2));
    console.log(`\n✅ Keyword report saved: ${filename}`);
    
    return report;
  }

  /**
   * Generate actionable recommendations
   */
  generateRecommendations(keywords) {
    const recommendations = [];
    
    // Find quick wins
    const quickWins = keywords.filter(k => k.difficulty < 40 && k.opportunityScore > 70);
    if (quickWins.length > 0) {
      recommendations.push({
        type: 'quick-win',
        action: `Target these low-competition keywords first: ${quickWins.slice(0, 3).map(k => k.keyword).join(', ')}`,
        impact: 'High',
        effort: 'Low'
      });
    }
    
    // Find trending opportunities
    const trending = keywords.filter(k => k.trendDirection.direction === 'rising');
    if (trending.length > 0) {
      recommendations.push({
        type: 'trending',
        action: `Create content for rising trends: ${trending.slice(0, 3).map(k => k.keyword).join(', ')}`,
        impact: 'High',
        effort: 'Medium'
      });
    }
    
    // Find commercial opportunities
    const commercial = keywords.filter(k => k.intent.type === 'commercial');
    if (commercial.length > 0) {
      recommendations.push({
        type: 'monetization',
        action: `Prioritize commercial intent keywords: ${commercial.slice(0, 3).map(k => k.keyword).join(', ')}`,
        impact: 'High',
        effort: 'Medium'
      });
    }
    
    return recommendations;
  }
}

module.exports = SEOKeywordResearcher;

// Example usage
if (require.main === module) {
  const researcher = new SEOKeywordResearcher();
  
  async function test() {
    console.log('\n🚀 SEO Keyword Research Agent - Test Run\n');
    
    const categories = ['science', 'technology', 'health', 'psychology', 'culture', 'space'];
    
    for (const category of categories) {
      console.log(`\n📌 Researching ${category.toUpperCase()} keywords...`);
      
      // Discover trending keywords
      const keywords = await researcher.discoverTrendingKeywords(category, {
        limit: 5,
        includeCompetitors: true,
        includeQuestions: true
      });
      
      console.log(`\nTop opportunities for ${category}:`);
      keywords.slice(0, 3).forEach((k, i) => {
        console.log(`  ${i + 1}. "${k.keyword}"`);
        console.log(`     Opportunity: ${k.opportunityScore}/100 | Difficulty: ${k.competitionLevel}`);
        console.log(`     Intent: ${k.intent.type} | Traffic: ${k.estimatedTraffic}`);
      });
      
      // Create keyword cluster for top keyword
      if (keywords.length > 0) {
        const clusters = await researcher.createKeywordClusters(keywords[0].keyword, category);
        console.log(`\n  Cluster created for "${keywords[0].keyword}":`);
        console.log(`    - Supporting articles: ${clusters.supporting.length}`);
        console.log(`    - Question articles: ${clusters.questions.length}`);
        console.log(`    - Comparison articles: ${clusters.comparisons.length}`);
      }
    }
  }
  
  test().catch(console.error);
}