#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

class SEOOpportunityFinder {
  constructor() {
    this.perplexityApiKey = process.env.PERPLEXITY_API_KEY;
    this.dataDir = path.join(__dirname, '..', 'data');
    this.opportunitiesFile = path.join(this.dataDir, 'seo-opportunities.json');
    
    // Focus areas for low-competition keywords
    this.focusAreas = [
      'how to use',
      'vs comparison', 
      'alternatives to',
      'worth it',
      'hidden features',
      'tips and tricks',
      'beginner guide',
      'troubleshooting',
      'setup guide',
      'review',
      'best for',
      'cheap alternative'
    ];

    // Emerging tech terms to monitor
    this.emergingTech = [
      'AI assistant',
      'foldable phone',
      'spatial computing',
      'neural processor',
      'quantum chip',
      'holographic display',
      'brain-computer interface',
      'autonomous drone',
      'smart glasses',
      'haptic feedback',
      'edge computing',
      'digital twin'
    ];
  }

  async ensureDataDirectory() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      // Directory exists
    }
  }

  async findZeroVolumeKeywords() {
    console.log('🔍 Finding zero-volume keywords with high potential...');
    
    if (!this.perplexityApiKey) {
      console.log('⚠️ Perplexity API key not configured, using demo keywords');
      return this.getDemoZeroVolumeKeywords();
    }

    const keywords = [];

    // Generate combinations of emerging tech + focus areas
    for (const tech of this.emergingTech.slice(0, 5)) {
      for (const focus of this.focusAreas.slice(0, 8)) {
        const query = `${tech} ${focus}`;
        
        try {
          const opportunity = await this.analyzeKeywordOpportunity(query);
          if (opportunity) {
            keywords.push(opportunity);
          }
          
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 3000));
          
        } catch (error) {
          console.log(`Error analyzing "${query}": ${error.message}`);
        }
      }
    }

    return keywords;
  }

  async analyzeKeywordOpportunity(keyword) {
    try {
      console.log(`Analyzing: "${keyword}"`);

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.perplexityApiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are an SEO expert analyzing keyword opportunities. Provide brief, factual assessments of search intent, competition level, and content opportunity.'
            },
            {
              role: 'user',
              content: `Analyze the keyword "${keyword}" for SEO opportunity. Is there existing content covering this topic? What's the search intent? Would this be valuable for a tech blog? Give a brief assessment in 2-3 sentences.`
            }
          ],
          max_tokens: 200,
          temperature: 0.2
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const analysis = data.choices?.[0]?.message?.content || '';

      // Determine if this is a good opportunity
      const isOpportunity = this.evaluateOpportunity(keyword, analysis);

      if (isOpportunity) {
        return {
          keyword,
          analysis,
          intent: this.determineIntent(keyword),
          competition: this.estimateCompetition(analysis),
          potential: this.calculatePotential(keyword, analysis),
          contentType: this.suggestContentType(keyword),
          foundAt: new Date().toISOString()
        };
      }

      return null;

    } catch (error) {
      console.log(`Failed to analyze "${keyword}": ${error.message}`);
      return null;
    }
  }

  evaluateOpportunity(keyword, analysis) {
    const analysisLower = analysis.toLowerCase();
    
    // Positive signals
    const goodSignals = [
      'limited content',
      'few results',
      'low competition',
      'emerging',
      'new technology',
      'underserved',
      'opportunity',
      'gap in content',
      'niche topic'
    ];

    // Negative signals  
    const badSignals = [
      'highly competitive',
      'saturated',
      'well-covered',
      'established players',
      'dominated by',
      'no search interest',
      'irrelevant'
    ];

    const hasGoodSignal = goodSignals.some(signal => analysisLower.includes(signal));
    const hasBadSignal = badSignals.some(signal => analysisLower.includes(signal));

    return hasGoodSignal && !hasBadSignal;
  }

  determineIntent(keyword) {
    const keywordLower = keyword.toLowerCase();
    
    if (keywordLower.includes('how to') || keywordLower.includes('guide')) {
      return 'informational';
    }
    if (keywordLower.includes('vs') || keywordLower.includes('comparison')) {
      return 'comparison';
    }
    if (keywordLower.includes('best') || keywordLower.includes('review')) {
      return 'commercial';
    }
    if (keywordLower.includes('buy') || keywordLower.includes('price')) {
      return 'transactional';
    }
    
    return 'informational';
  }

  estimateCompetition(analysis) {
    const analysisLower = analysis.toLowerCase();
    
    if (analysisLower.includes('low competition') || analysisLower.includes('limited content')) {
      return 'low';
    }
    if (analysisLower.includes('moderate') || analysisLower.includes('some competition')) {
      return 'medium';
    }
    
    return 'unknown';
  }

  calculatePotential(keyword, analysis) {
    let score = 5; // Base score
    
    const keywordLower = keyword.toLowerCase();
    const analysisLower = analysis.toLowerCase();
    
    // Boost for emerging tech
    if (this.emergingTech.some(tech => keywordLower.includes(tech.toLowerCase()))) {
      score += 2;
    }
    
    // Boost for low competition signals
    if (analysisLower.includes('low competition') || analysisLower.includes('opportunity')) {
      score += 3;
    }
    
    // Boost for commercial intent
    if (keywordLower.includes('review') || keywordLower.includes('vs')) {
      score += 1;
    }
    
    // Penalty for saturated markets
    if (analysisLower.includes('saturated') || analysisLower.includes('highly competitive')) {
      score -= 2;
    }
    
    return Math.max(1, Math.min(score, 10));
  }

  suggestContentType(keyword) {
    const keywordLower = keyword.toLowerCase();
    
    if (keywordLower.includes('how to') || keywordLower.includes('guide')) {
      return 'how-to';
    }
    if (keywordLower.includes('vs') || keywordLower.includes('comparison')) {
      return 'comparison';
    }
    if (keywordLower.includes('review')) {
      return 'review';
    }
    if (keywordLower.includes('best')) {
      return 'buying-guide';
    }
    
    return 'article';
  }

  async findTrendingTopics() {
    console.log('📈 Finding trending tech topics with opportunity...');
    
    if (!this.perplexityApiKey) {
      return this.getDemoTrendingTopics();
    }

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.perplexityApiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-large-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are a tech trend analyst. Identify emerging technology topics that are gaining interest but not yet oversaturated with content.'
            },
            {
              role: 'user',
              content: 'What are 5 emerging tech topics or products that are starting to gain attention but don\'t have much content coverage yet? Focus on topics that would interest tech enthusiasts. List them with brief explanations.'
            }
          ],
          max_tokens: 400,
          temperature: 0.3
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      
      return this.parseTrendingTopics(content);

    } catch (error) {
      console.log(`Error finding trending topics: ${error.message}`);
      return this.getDemoTrendingTopics();
    }
  }

  parseTrendingTopics(content) {
    const topics = [];
    const lines = content.split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
      const match = line.match(/^\d+\.\s*([^:]+)[:.]?\s*(.+)?/);
      if (match) {
        const topic = match[1].trim();
        const description = match[2]?.trim() || '';
        
        topics.push({
          topic,
          description,
          potential: this.calculateTopicPotential(topic, description),
          suggestedKeywords: this.generateKeywordVariations(topic),
          foundAt: new Date().toISOString()
        });
      }
    });
    
    return topics.slice(0, 5);
  }

  generateKeywordVariations(topic) {
    const variations = [];
    const baseKeyword = topic.toLowerCase();
    
    this.focusAreas.slice(0, 6).forEach(focus => {
      variations.push(`${baseKeyword} ${focus}`);
    });
    
    return variations;
  }

  calculateTopicPotential(topic, description) {
    let score = 6; // Base score for trending topics
    
    const combined = `${topic} ${description}`.toLowerCase();
    
    // Boost for emerging tech indicators
    if (combined.includes('new') || combined.includes('emerging') || combined.includes('innovative')) {
      score += 2;
    }
    
    // Boost for AI/ML related
    if (combined.includes('ai') || combined.includes('machine learning') || combined.includes('neural')) {
      score += 1;
    }
    
    return Math.min(score, 10);
  }

  getDemoZeroVolumeKeywords() {
    return [
      {
        keyword: 'spatial computing setup guide',
        analysis: 'Limited existing content for this emerging technology. Good opportunity for informational content.',
        intent: 'informational',
        competition: 'low',
        potential: 8,
        contentType: 'how-to',
        foundAt: new Date().toISOString()
      },
      {
        keyword: 'AI assistant vs smart speaker',
        analysis: 'Emerging comparison topic with moderate interest but limited comprehensive comparisons.',
        intent: 'comparison',
        competition: 'low',
        potential: 7,
        contentType: 'comparison',
        foundAt: new Date().toISOString()
      },
      {
        keyword: 'neural processor worth it',
        analysis: 'New technology adoption questions are underserved in current content landscape.',
        intent: 'commercial',
        competition: 'low',
        potential: 8,
        contentType: 'review',
        foundAt: new Date().toISOString()
      }
    ];
  }

  getDemoTrendingTopics() {
    return [
      {
        topic: 'Spatial Computing',
        description: 'Next-generation interface technology combining AR/VR',
        potential: 9,
        suggestedKeywords: ['spatial computing how to use', 'spatial computing vs VR', 'spatial computing setup guide'],
        foundAt: new Date().toISOString()
      },
      {
        topic: 'Neural Processing Units',
        description: 'Specialized chips for AI computations in consumer devices',
        potential: 8,
        suggestedKeywords: ['neural processor review', 'NPU vs CPU', 'neural processing worth it'],
        foundAt: new Date().toISOString()
      }
    ];
  }

  async saveOpportunities(opportunities) {
    try {
      const data = {
        zeroVolumeKeywords: opportunities.keywords || [],
        trendingTopics: opportunities.topics || [],
        lastUpdated: new Date().toISOString(),
        totalOpportunities: (opportunities.keywords?.length || 0) + (opportunities.topics?.length || 0)
      };

      await fs.writeFile(
        this.opportunitiesFile,
        JSON.stringify(data, null, 2),
        'utf-8'
      );

      console.log(`💾 Saved ${data.totalOpportunities} SEO opportunities`);
      return data;

    } catch (error) {
      console.error('Error saving SEO opportunities:', error.message);
      return opportunities;
    }
  }

  async run() {
    console.log('🚀 Starting SEO opportunity finder...');
    
    await this.ensureDataDirectory();

    try {
      // Find zero-volume keywords
      const keywords = await this.findZeroVolumeKeywords();
      console.log(`Found ${keywords.length} zero-volume keyword opportunities`);

      // Find trending topics
      const topics = await this.findTrendingTopics();
      console.log(`Found ${topics.length} trending topics`);

      // Save opportunities
      const opportunities = { keywords, topics };
      const saved = await this.saveOpportunities(opportunities);

      console.log(`✅ SEO opportunity finding completed.`);
      
      // Output top opportunities
      console.log('🎯 Top keyword opportunities:');
      keywords.slice(0, 3).forEach((opp, i) => {
        console.log(`${i + 1}. "${opp.keyword}" (${opp.potential}/10) - ${opp.contentType}`);
      });

      console.log('🔥 Top trending topics:');
      topics.slice(0, 3).forEach((topic, i) => {
        console.log(`${i + 1}. ${topic.topic} (${topic.potential}/10)`);
      });

      return saved;

    } catch (error) {
      console.error('SEO opportunity finder failed:', error.message);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const finder = new SEOOpportunityFinder();
  finder.run().catch(console.error);
}

module.exports = { SEOOpportunityFinder };