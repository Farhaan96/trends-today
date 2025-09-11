/**
 * Content Categories Configuration
 * Optimized for long-tail keyword targeting and Le Ravi-style content
 * 6 Core Categories: Science, Culture, Psychology, Technology, Health, Space
 */

module.exports = {
  // Main content verticals (optimized for SEO and engagement)
  categories: {
    // Science & Discovery
    science: {
      name: 'Science',
      slug: 'science',
      description: 'Breakthrough discoveries, quantum physics, and scientific mysteries that challenge our understanding',
      keywords: ['quantum physics breakthrough', 'scientific discovery 2025', 'MIT research findings', 'Nobel Prize discovery', 'archaeological breakthrough'],
      longTailPatterns: [
        'scientists discover {finding} that changes everything about {field}',
        'new study reveals surprising link between {topic1} and {topic2}',
        'breakthrough in {field} could revolutionize {industry} by 2026',
        'why {scientific_concept} proves Einstein was right about {theory}',
        '{university} researchers shocked by {unexpected_discovery}'
      ],
      aiImageStyle: 'abstract scientific visualization, cosmic nebula, molecular structures, laboratory aesthetics, quantum particles',
      curiosityGapHeadlines: [
        'The {discovery} That Scientists Say Shouldn\'t Exist',
        'This {finding} Changes Everything We Know About {topic}',
        'Scientists Can\'t Explain This {phenomenon} - Here\'s Why It Matters'
      ]
    },
    
    // Culture & Society
    culture: {
      name: 'Culture',
      slug: 'culture',
      description: 'Cultural phenomena, generational shifts, and social trends reshaping our world',
      keywords: ['gen z culture shift', 'viral trend analysis', 'cultural phenomenon 2025', 'social movement impact', 'generational differences'],
      longTailPatterns: [
        'how gen z is completely changing {industry} in 2025',
        'why {cultural_trend} is becoming the new normal',
        'the rise of {phenomenon} and what it means for {demographic}',
        'inside the {movement} that\'s reshaping {aspect_of_life}',
        'why {country} does {practice} differently than everyone else'
      ],
      aiImageStyle: 'cultural mosaic, social connection visualization, diverse representation, modern urban aesthetics, trending symbols',
      curiosityGapHeadlines: [
        'The {trend} That\'s Quietly Taking Over {industry}',
        'Why {demographic} Is Abandoning {old_practice} for {new_practice}',
        'The Hidden Reason {cultural_shift} Is Happening Now'
      ]
    },
    
    // Psychology & Mind
    psychology: {
      name: 'Psychology',
      slug: 'psychology',
      description: 'Human behavior, mental wellness, and the fascinating science of the mind',
      keywords: ['psychology behind behavior', 'mental health breakthrough', 'cognitive science discovery', 'personality traits meaning', 'subconscious mind secrets'],
      longTailPatterns: [
        'the psychology behind why we {common_behavior}',
        'what your {trait} says about your {characteristic}',
        'why {percentage}% of people {behavior} without realizing it',
        'the hidden psychological reason you {action}',
        'how {mental_process} secretly controls your {daily_activity}'
      ],
      aiImageStyle: 'abstract mind visualization, neural pathways, emotional spectrum, consciousness representation, surreal mental landscape',
      curiosityGapHeadlines: [
        'The Psychological Trick That {outcome} Every Time',
        'What {behavior} Reveals About Your Hidden Personality',
        'The Surprising Reason Your Brain {mental_process}'
      ]
    },
    
    // Technology & Innovation
    technology: {
      name: 'Technology',
      slug: 'technology',
      description: 'Tech innovations, AI developments, and the digital transformation of everything',
      keywords: ['AI technology breakthrough', 'tech innovation 2025', 'best gadgets under 500', 'smartphone comparison guide', 'future of technology'],
      longTailPatterns: [
        'how {new_tech} will completely change {industry} by 2026',
        'why {company}\'s new {product} beats {competitor} hands down',
        'what {technology} means for the future of {field}',
        'is {tech_product} worth the hype in 2025 honest review',
        'best {product_category} under ${price} that actually deliver'
      ],
      aiImageStyle: 'futuristic tech visualization, circuit board abstract, AI neural networks, innovation flow, cyberpunk aesthetics',
      curiosityGapHeadlines: [
        'The {technology} That Makes {old_tech} Obsolete',
        'Why {tech_company} Just Changed {industry} Forever',
        'The Hidden Feature in {product} That Changes Everything'
      ]
    },
    
    // Health & Wellness
    health: {
      name: 'Health',
      slug: 'health',
      description: 'Medical breakthroughs, wellness discoveries, and evidence-based health insights',
      keywords: ['health benefits discovery', 'medical breakthrough 2025', 'wellness trend science', 'nutrition research findings', 'longevity secrets'],
      longTailPatterns: [
        'surprising health benefits of {common_thing} scientists just discovered',
        'why {food_or_habit} might be {more/less} healthy than you think',
        'new research shows {supplement} can {benefit} in just {timeframe}',
        'the {time} {practice} that {health_benefit} according to doctors',
        'what {symptom} really means according to medical experts'
      ],
      aiImageStyle: 'wellness visualization, organic flowing forms, medical innovation, healthy lifestyle abstract, vitality representation',
      curiosityGapHeadlines: [
        'The {common_food} That Doctors Say You Should Never Eat',
        'This {simple_habit} Adds 10 Years to Your Life',
        'The Hidden Health Risk in {everyday_item} No One Talks About'
      ]
    },
    
    // Space & Astronomy
    space: {
      name: 'Space',
      slug: 'space',
      description: 'Space exploration, astronomical discoveries, and the mysteries of the cosmos',
      keywords: ['NASA discovery announcement', 'James Webb telescope findings', 'SpaceX mission update', 'exoplanet discovery 2025', 'black hole mystery solved'],
      longTailPatterns: [
        'NASA discovers {phenomenon} that defies known laws of physics',
        'James Webb telescope reveals {discovery} about {cosmic_object}',
        'why {planet_or_moon} could harbor alien life according to scientists',
        'breakthrough in {space_technology} brings Mars colony closer to reality',
        'astronomers baffled by {observation} that shouldn\'t be possible'
      ],
      aiImageStyle: 'cosmic nebula visualization, deep space imagery, planetary surfaces, galaxy formations, astronomical phenomena',
      curiosityGapHeadlines: [
        'The {space_object} That Shouldn\'t Exist According to Physics',
        'NASA\'s {discovery} Changes Everything About {space_topic}',
        'The Impossible {phenomenon} That Has Astronomers Questioning Reality'
      ]
    }
  },

  // Long-tail keyword templates (Le Ravi style - optimized for featured snippets)
  longTailTemplates: [
    // Question-based patterns (voice search optimized)
    'what is {topic} and why does it matter in 2025',
    'how does {technology} work step by step guide',
    'why do {demographic} prefer {choice} over {alternative}',
    'when will {future_event} happen according to experts',
    'where to find best {product} under {price} in 2025',
    
    // Discovery patterns (curiosity gap)
    '{number}-year-old {discovery} found in {location} changes everything',
    'scientists discover {finding} that could change {field} forever',
    'new study reveals {surprising_fact} about {topic} no one expected',
    'researchers shocked by {discovery} that defies {established_theory}',
    
    // Comparison patterns (high commercial intent)
    '{product1} vs {product2} which is better for {use_case}',
    'difference between {option1} and {option2} explained',
    '{brand1} compared to {brand2} honest review 2025',
    'should you choose {option1} or {option2} expert verdict',
    
    // How-to patterns (tutorial intent)
    'how to {achieve_goal} in {timeframe} proven method',
    'step by step guide to {task} for beginners',
    'easiest way to {accomplish} without {common_obstacle}',
    'professional tips for {skill} that actually work',
    
    // List patterns (featured snippet friendly)
    'top {number} {items} for {purpose} ranked and reviewed',
    'best {product_category} under ${price} tested by experts',
    '{number} signs that {indicator} according to {authority}',
    'complete list of {items} you need for {goal}'
  ],

  // Topic discovery sources
  trendingSources: [
    'Google Trends',
    'Reddit trending',
    'Twitter/X trending',
    'Academic journals',
    'Science Daily',
    'Psychology Today',
    'Nature journal',
    'arXiv papers',
    'TED Talks',
    'Hacker News'
  ],

  // AI image generation prompts for abstract concepts
  imagePromptTemplates: {
    science: 'abstract scientific visualization, glowing particles, cosmic nebula, laboratory aesthetics, futuristic research, depth of field',
    psychology: 'abstract mind concept, neural pathways, emotional spectrum, consciousness visualization, surreal mental landscape',
    health: 'wellness visualization, organic flowing forms, vitality abstract, healing energy, balanced lifestyle imagery',
    culture: 'cultural mosaic, diverse patterns, social connection web, cultural symbols abstract, unity in diversity',
    environment: 'nature abstract, climate visualization, earth from space, renewable energy flow, ecological balance',
    mystery: 'enigmatic atmosphere, shadowy depths, mysterious portal, unknown dimensions, cryptic symbols',
    future: 'futuristic cityscape, neon geometry, time travel visualization, technological singularity, cyberpunk aesthetic',
    history: 'ancient ruins abstract, time layers, historical artifacts collage, vintage texture overlay, archaeological dig site',
    lifestyle: 'modern minimalist, lifestyle montage, urban living abstract, work-life balance visualization, trendy aesthetics',
    technology: 'digital matrix, circuit board abstract, AI visualization, quantum computing representation, innovation flow'
  },

  // Le Ravi-style content guidelines (optimized for engagement and SEO)
  contentGuidelines: {
    wordCount: { min: 1500, optimal: 2000, max: 2500 },
    internalLinks: { min: 4, optimal: 6, max: 8 },
    headings: { h2: '4-6', h3: '2-4 per h2 section' },
    images: { hero: 1, body: '2-3', charts: '1-2 if relevant' },
    readingTime: { min: 7, optimal: 10, max: 12 },
    paragraphLength: { min: 2, optimal: 3, max: 4 }, // sentences per paragraph
    sentenceLength: { min: 10, optimal: 15, max: 25 }, // words per sentence
    keywordDensity: { primary: '1-2%', secondary: '0.5-1%', lsi: 'natural distribution' }
  },

  // Le Ravi article structure template
  articleStructure: {
    hook: {
      type: 'opening',
      length: '1 paragraph',
      elements: ['provocative question', 'surprising fact', 'personal anecdote'],
      purpose: 'Create curiosity gap and emotional connection'
    },
    discovery: {
      type: 'context',
      length: '2-3 paragraphs',
      elements: ['problem introduction', 'why it matters now', 'recent developments'],
      purpose: 'Set up the importance and relevance'
    },
    deepDive: {
      type: 'main content',
      length: '4-5 paragraphs',
      elements: ['expert quotes', 'research citations', 'technical explanations', 'examples'],
      purpose: 'Deliver value and establish authority'
    },
    implications: {
      type: 'analysis',
      length: '1-2 paragraphs',
      elements: ['personal reflection', 'broader implications', 'future predictions'],
      purpose: 'Add unique perspective and thought leadership'
    },
    engagement: {
      type: 'conclusion',
      length: '1 paragraph',
      elements: ['direct question', 'call for comments', 'related content suggestions'],
      purpose: 'Drive interaction and internal navigation'
    }
  },

  // SEO optimization settings
  seoSettings: {
    featuredSnippet: {
      targetLength: '40-60 words',
      format: 'paragraph or list',
      placement: 'after first H2'
    },
    metaDescription: {
      length: '150-160 characters',
      includeKeyword: true,
      includeCTA: true
    },
    schemaMarkup: {
      types: ['Article', 'NewsArticle', 'BlogPosting'],
      includeAuthor: true,
      includeRatings: false
    }
  }
};