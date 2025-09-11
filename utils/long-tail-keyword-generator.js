/**
 * Advanced Long-Tail Keyword Generator
 * Implements semantic keyword expansion with voice search optimization
 * Focuses on conversational, question-based patterns for featured snippets
 */

class LongTailKeywordGenerator {
  constructor() {
    // Question starters for voice search optimization
    this.questionStarters = {
      informational: ['what is', 'what are', 'how does', 'how do', 'why does', 'why do', 'when does', 'when do', 'where does', 'where do'],
      comparison: ['what is the difference between', 'which is better', 'versus', 'compared to', 'vs'],
      process: ['how to', 'step by step guide', 'tutorial for', 'best way to', 'easiest way to'],
      definition: ['meaning of', 'definition of', 'what does it mean', 'explanation of'],
      list: ['best', 'top', 'most popular', 'list of', 'examples of'],
      troubleshooting: ['why is my', 'how to fix', 'solution for', 'troubleshoot', 'problem with']
    };

    // Category-specific patterns
    this.categoryPatterns = {
      science: {
        templates: [
          'latest discovery in {topic} reveals {finding}',
          'scientists discover {phenomenon} that changes {field}',
          'why {scientific_concept} proves {theory}',
          'breakthrough in {field} shows {unexpected_result}',
          'how {discovery} could revolutionize {industry}',
          'what {research} tells us about {bigger_topic}',
          'new study reveals surprising link between {topic1} and {topic2}'
        ],
        modifiers: ['breakthrough', 'discovery', 'research', 'study', 'experiment', 'findings', 'evidence'],
        entities: ['NASA', 'MIT', 'Stanford', 'quantum', 'DNA', 'climate', 'physics', 'biology']
      },
      culture: {
        templates: [
          'how {generation} is changing {aspect} in 2025',
          'why {cultural_trend} is becoming mainstream',
          'the rise of {phenomenon} and what it means for {group}',
          '{country} cultural practice that is spreading globally',
          'how {social_media} is reshaping {behavior}',
          'why {demographic} prefers {choice} over {alternative}',
          'the cultural impact of {trend} on {society}'
        ],
        modifiers: ['trending', 'viral', 'cultural shift', 'generation', 'movement', 'phenomenon'],
        entities: ['Gen Z', 'millennials', 'TikTok', 'Instagram', 'social media', 'influencers']
      },
      psychology: {
        templates: [
          'the psychology behind why we {behavior}',
          'what your {trait} says about your {characteristic}',
          'why {percentage}% of people {behavior}',
          'how {mental_process} affects {daily_life}',
          'the hidden reason you {common_behavior}',
          'psychological trick that makes {outcome}',
          'what {behavior} reveals about your personality'
        ],
        modifiers: ['mental health', 'cognitive', 'behavioral', 'emotional', 'subconscious', 'mindset'],
        entities: ['anxiety', 'happiness', 'stress', 'motivation', 'habits', 'relationships', 'confidence']
      },
      technology: {
        templates: [
          'how {new_tech} will change {industry} by {year}',
          'why {company} new {product} beats {competitor}',
          'what {technology} means for the future of {field}',
          '{tech_trend} explained in simple terms',
          'is {technology} worth the hype in 2025',
          'how to use {tool} for {specific_purpose}',
          'best {product_category} under ${price} in 2025'
        ],
        modifiers: ['AI-powered', 'revolutionary', 'next-generation', 'innovative', 'disruptive', 'smart'],
        entities: ['AI', 'ChatGPT', 'iPhone', 'Android', 'Google', 'Apple', 'Microsoft', 'Tesla']
      },
      health: {
        templates: [
          'surprising health benefits of {common_thing}',
          'why {food_or_habit} might be {effect} than you think',
          'new research shows {supplement} can {benefit}',
          'the {time_period} {health_practice} that {result}',
          'how {lifestyle_change} affects your {health_aspect}',
          'what doctors say about {health_trend}',
          '{number} signs your {body_part} needs attention'
        ],
        modifiers: ['wellness', 'holistic', 'natural', 'clinical', 'proven', 'evidence-based', 'medical'],
        entities: ['vitamin D', 'immune system', 'gut health', 'mental wellness', 'longevity', 'metabolism']
      },
      space: {
        templates: [
          'NASA discovers {phenomenon} that defies known physics',
          'James Webb telescope reveals {discovery} about {cosmic_object}',
          'why {planet_or_star} could harbor alien life',
          'breakthrough in {space_technology} brings Mars colony closer',
          'astronomers baffled by {mysterious_observation}',
          'how {space_event} will affect Earth in {timeframe}',
          'new evidence suggests {theory} about the universe'
        ],
        modifiers: ['cosmic', 'interstellar', 'astronomical', 'extraterrestrial', 'galactic', 'orbital'],
        entities: ['Mars', 'black holes', 'exoplanets', 'SpaceX', 'ISS', 'dark matter', 'galaxies']
      }
    };

    // Semantic variations and LSI keywords
    this.semanticExpansions = {
      'best': ['top', 'finest', 'premium', 'superior', 'optimal', 'recommended'],
      'guide': ['tutorial', 'how-to', 'walkthrough', 'instructions', 'manual', 'steps'],
      'review': ['analysis', 'evaluation', 'assessment', 'comparison', 'verdict', 'opinion'],
      'tips': ['advice', 'tricks', 'hacks', 'strategies', 'techniques', 'methods'],
      'cheap': ['affordable', 'budget', 'economical', 'inexpensive', 'value', 'under']
    };

    // Voice search conversational patterns
    this.voiceSearchPatterns = [
      'tell me about {topic}',
      'I need to know {question}',
      'show me {request}',
      'find {specific_thing} near me',
      'what\'s the best way to {action}',
      'help me understand {concept}',
      'explain {topic} like I\'m five'
    ];
  }

  /**
   * Generate long-tail keywords for a topic and category
   */
  generateKeywords(topic, category, options = {}) {
    const {
      count = 20,
      includeQuestions = true,
      includeVoiceSearch = true,
      includeLocal = false,
      targetYear = new Date().getFullYear()
    } = options;

    const keywords = new Set();
    
    // Generate question-based keywords
    if (includeQuestions) {
      this.generateQuestionKeywords(topic, category).forEach(kw => keywords.add(kw));
    }

    // Generate category-specific long-tail keywords
    this.generateCategoryKeywords(topic, category, targetYear).forEach(kw => keywords.add(kw));

    // Generate voice search optimized keywords
    if (includeVoiceSearch) {
      this.generateVoiceSearchKeywords(topic, category).forEach(kw => keywords.add(kw));
    }

    // Generate local SEO keywords if needed
    if (includeLocal) {
      this.generateLocalKeywords(topic, category).forEach(kw => keywords.add(kw));
    }

    // Generate semantic variations
    this.generateSemanticVariations(topic, Array.from(keywords)).forEach(kw => keywords.add(kw));

    return Array.from(keywords).slice(0, count);
  }

  /**
   * Generate question-based keywords for featured snippets
   */
  generateQuestionKeywords(topic, category) {
    const keywords = [];
    const topicLower = topic.toLowerCase();

    Object.values(this.questionStarters).flat().forEach(starter => {
      keywords.push(`${starter} ${topicLower}`);
      keywords.push(`${starter} ${topicLower} work`);
      keywords.push(`${starter} ${topicLower} important`);
    });

    // Add category-specific questions
    if (category === 'technology') {
      keywords.push(`is ${topicLower} worth it`);
      keywords.push(`should I buy ${topicLower}`);
      keywords.push(`${topicLower} alternatives`);
    } else if (category === 'health') {
      keywords.push(`is ${topicLower} safe`);
      keywords.push(`${topicLower} side effects`);
      keywords.push(`${topicLower} benefits and risks`);
    } else if (category === 'science') {
      keywords.push(`${topicLower} explained simply`);
      keywords.push(`evidence for ${topicLower}`);
      keywords.push(`${topicLower} research findings`);
    }

    return keywords;
  }

  /**
   * Generate category-specific long-tail keywords
   */
  generateCategoryKeywords(topic, category, year) {
    const keywords = [];
    const patterns = this.categoryPatterns[category];
    
    if (!patterns) return keywords;

    const topicLower = topic.toLowerCase();

    // Use templates with topic insertion
    patterns.templates.forEach(template => {
      let keyword = template
        .replace(/{topic}/g, topicLower)
        .replace(/{year}/g, year)
        .replace(/{topic1}/g, topicLower)
        .replace(/{field}/g, category)
        .replace(/{price}/g, ['500', '1000', '200', '100'][Math.floor(Math.random() * 4)]);
      
      keywords.push(keyword);
    });

    // Add modifier combinations
    patterns.modifiers.forEach(modifier => {
      keywords.push(`${modifier} ${topicLower} ${year}`);
      keywords.push(`${topicLower} ${modifier} guide`);
    });

    // Add entity combinations
    patterns.entities.forEach(entity => {
      keywords.push(`${entity} ${topicLower}`);
      keywords.push(`${topicLower} for ${entity}`);
    });

    return keywords;
  }

  /**
   * Generate voice search optimized keywords
   */
  generateVoiceSearchKeywords(topic, category) {
    const keywords = [];
    const topicLower = topic.toLowerCase();

    this.voiceSearchPatterns.forEach(pattern => {
      keywords.push(pattern.replace(/{topic}/g, topicLower));
    });

    // Add conversational variations
    keywords.push(`ok google ${topicLower}`);
    keywords.push(`hey siri what is ${topicLower}`);
    keywords.push(`alexa tell me about ${topicLower}`);

    return keywords;
  }

  /**
   * Generate local SEO keywords
   */
  generateLocalKeywords(topic, category) {
    const keywords = [];
    const topicLower = topic.toLowerCase();
    const locations = ['near me', 'in my area', 'nearby', 'local', 'in [city]'];

    locations.forEach(location => {
      keywords.push(`${topicLower} ${location}`);
      keywords.push(`best ${topicLower} ${location}`);
      keywords.push(`find ${topicLower} ${location}`);
    });

    return keywords;
  }

  /**
   * Generate semantic variations using LSI
   */
  generateSemanticVariations(topic, existingKeywords) {
    const variations = [];
    
    existingKeywords.forEach(keyword => {
      Object.entries(this.semanticExpansions).forEach(([original, replacements]) => {
        if (keyword.includes(original)) {
          replacements.forEach(replacement => {
            variations.push(keyword.replace(original, replacement));
          });
        }
      });
    });

    return variations;
  }

  /**
   * Analyze keyword competitiveness (simplified scoring)
   */
  analyzeKeywordDifficulty(keyword) {
    const wordCount = keyword.split(' ').length;
    const hasQuestion = /^(what|how|why|when|where|who|is|can|does|should)/.test(keyword);
    const hasYear = /20\d{2}/.test(keyword);
    const hasModifier = /(best|top|guide|review|cheap|free)/.test(keyword);

    let difficulty = 50; // Base difficulty

    // Longer keywords are generally easier to rank for
    if (wordCount >= 4) difficulty -= 15;
    if (wordCount >= 6) difficulty -= 10;

    // Questions are easier to rank for
    if (hasQuestion) difficulty -= 10;

    // Year-specific content is easier
    if (hasYear) difficulty -= 5;

    // Modifiers can make it easier
    if (hasModifier) difficulty -= 5;

    return {
      keyword,
      difficulty: Math.max(10, Math.min(100, difficulty)),
      opportunity: difficulty < 40 ? 'high' : difficulty < 60 ? 'medium' : 'low',
      wordCount,
      hasQuestion,
      hasYear
    };
  }

  /**
   * Generate content ideas from keywords
   */
  generateContentIdeas(keywords, category) {
    return keywords.map(keyword => {
      const analysis = this.analyzeKeywordDifficulty(keyword);
      
      return {
        keyword,
        title: this.generateTitleFromKeyword(keyword, category),
        contentType: this.determineContentType(keyword),
        targetLength: this.determineContentLength(keyword),
        ...analysis
      };
    });
  }

  /**
   * Generate engaging title from keyword
   */
  generateTitleFromKeyword(keyword, category) {
    const templates = [
      `${keyword}: The Complete 2025 Guide`,
      `Everything You Need to Know About ${keyword}`,
      `${keyword} - What Experts Won't Tell You`,
      `The Truth About ${keyword} (Backed by Science)`,
      `${keyword}: Surprising Facts and Insights`
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * Determine optimal content type for keyword
   */
  determineContentType(keyword) {
    if (keyword.includes('how to')) return 'tutorial';
    if (keyword.includes('best') || keyword.includes('top')) return 'listicle';
    if (keyword.includes('review')) return 'review';
    if (keyword.includes('vs') || keyword.includes('versus')) return 'comparison';
    if (keyword.startsWith('what') || keyword.startsWith('why')) return 'explainer';
    return 'article';
  }

  /**
   * Determine optimal content length for keyword
   */
  determineContentLength(keyword) {
    const wordCount = keyword.split(' ').length;
    if (wordCount >= 5) return '2000-2500 words';
    if (wordCount >= 3) return '1500-2000 words';
    return '1000-1500 words';
  }
}

module.exports = LongTailKeywordGenerator;

// Example usage
if (require.main === module) {
  const generator = new LongTailKeywordGenerator();
  
  console.log('\n🎯 Long-Tail Keyword Generation Examples:\n');
  
  const categories = ['science', 'culture', 'psychology', 'technology', 'health', 'space'];
  
  categories.forEach(category => {
    console.log(`\n📌 ${category.toUpperCase()} Keywords:`);
    const keywords = generator.generateKeywords('artificial intelligence', category, {
      count: 5,
      includeQuestions: true,
      includeVoiceSearch: true
    });
    
    keywords.forEach(kw => {
      const analysis = generator.analyzeKeywordDifficulty(kw);
      console.log(`  - "${kw}" (Difficulty: ${analysis.difficulty}, Opportunity: ${analysis.opportunity})`);
    });
  });
}