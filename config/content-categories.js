/**
 * Content Categories Configuration
 * Broader focus like Le Ravi - covering everything trendy
 */

module.exports = {
  // Main content verticals (like Le Ravi)
  categories: {
    // Science & Discovery
    science: {
      name: 'Science',
      slug: 'science',
      description: 'Breakthrough discoveries, space exploration, and scientific mysteries',
      keywords: ['quantum physics', 'space exploration', 'scientific breakthrough', 'NASA discovery', 'archaeological find'],
      aiImageStyle: 'abstract scientific visualization, cosmic imagery, molecular structures'
    },
    
    // Psychology & Mind
    psychology: {
      name: 'Psychology',
      slug: 'psychology',
      description: 'Human behavior, mental health, and psychological phenomena',
      keywords: ['mental health', 'psychology study', 'brain science', 'human behavior', 'emotional intelligence'],
      aiImageStyle: 'abstract mind concepts, neural networks, emotional visualization'
    },
    
    // Health & Wellness
    health: {
      name: 'Health',
      slug: 'health',
      description: 'Medical breakthroughs, wellness trends, and health discoveries',
      keywords: ['medical breakthrough', 'health study', 'wellness trend', 'nutrition discovery', 'fitness science'],
      aiImageStyle: 'wellness imagery, medical visualization, healthy lifestyle abstract'
    },
    
    // Technology & Innovation
    technology: {
      name: 'Technology',
      slug: 'technology',
      description: 'Tech innovations, AI developments, and digital transformation',
      keywords: ['AI breakthrough', 'tech innovation', 'startup unicorn', 'cybersecurity', 'quantum computing'],
      aiImageStyle: 'futuristic tech, abstract digital art, innovation visualization'
    },
    
    // Culture & Society
    culture: {
      name: 'Culture',
      slug: 'culture',
      description: 'Cultural phenomena, social trends, and generational insights',
      keywords: ['cultural trend', 'gen z behavior', 'social phenomenon', 'viral trend', 'cultural shift'],
      aiImageStyle: 'cultural symbolism, social connection abstract, diverse representation'
    },
    
    // Environment & Climate
    environment: {
      name: 'Environment',
      slug: 'environment',
      description: 'Climate discoveries, environmental solutions, and sustainability',
      keywords: ['climate change', 'renewable energy', 'sustainability', 'environmental breakthrough', 'conservation'],
      aiImageStyle: 'nature abstract, climate visualization, green energy concepts'
    },
    
    // History & Archaeology
    history: {
      name: 'History',
      slug: 'history',
      description: 'Historical discoveries, archaeological finds, and mysteries solved',
      keywords: ['archaeological discovery', 'historical mystery', 'ancient civilization', 'historical breakthrough', 'artifact found'],
      aiImageStyle: 'ancient civilization imagery, historical artifacts, time period visualization'
    },
    
    // Future & Predictions
    future: {
      name: 'Future',
      slug: 'future',
      description: 'Future predictions, emerging trends, and what\'s next',
      keywords: ['future prediction', '2030 forecast', 'emerging trend', 'future technology', 'what\'s next'],
      aiImageStyle: 'futuristic cityscape, abstract future concepts, prediction visualization'
    },
    
    // Lifestyle & Trends
    lifestyle: {
      name: 'Lifestyle',
      slug: 'lifestyle',
      description: 'Lifestyle trends, consumer behavior, and modern living',
      keywords: ['lifestyle trend', 'consumer behavior', 'modern living', 'life hack', 'productivity tip'],
      aiImageStyle: 'modern lifestyle abstract, minimalist living, trend visualization'
    },
    
    // Mystery & Unexplained
    mystery: {
      name: 'Mystery',
      slug: 'mystery',
      description: 'Unexplained phenomena, mysteries solved, and strange discoveries',
      keywords: ['unexplained phenomenon', 'mystery solved', 'strange discovery', 'paranormal', 'conspiracy theory'],
      aiImageStyle: 'mysterious atmosphere, enigmatic visualization, dark abstract'
    }
  },

  // Long-tail keyword templates (Le Ravi style)
  longTailTemplates: [
    // Discovery patterns
    '[YEAR]-year-old [DISCOVERY] found in [LOCATION]',
    'Scientists discover [FINDING] that could change [FIELD]',
    'New study reveals [SURPRISING FACT] about [TOPIC]',
    'Researchers shocked by [DISCOVERY] in [FIELD]',
    
    // Mystery patterns
    'The mysterious [PHENOMENON] that scientists can\'t explain',
    'Why [COMMON BELIEF] might be completely wrong',
    'The strange case of [MYSTERY] finally solved',
    'What [DISCOVERY] tells us about [BIGGER TOPIC]',
    
    // Future patterns
    'How [TECHNOLOGY] will change [ASPECT] by [YEAR]',
    'The surprising future of [INDUSTRY] in [TIMEFRAME]',
    'Why [TREND] is the next big thing in [FIELD]',
    '[NUMBER] predictions about [TOPIC] that came true',
    
    // Health/Psychology patterns
    'The psychology behind why we [BEHAVIOR]',
    'What your [TRAIT] says about your [CHARACTERISTIC]',
    'The hidden health benefits of [COMMON THING]',
    'Why [PERCENTAGE]% of people [BEHAVIOR]',
    
    // Cultural patterns
    'How [GENERATION] is changing [INDUSTRY]',
    'The rise of [TREND] and what it means for [GROUP]',
    'Why [COUNTRY] does [PRACTICE] differently',
    'The cultural phenomenon of [TREND] explained'
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

  // Content depth guidelines
  contentGuidelines: {
    wordCount: { min: 1200, optimal: 1800, max: 2500 },
    internalLinks: { min: 4, optimal: 6, max: 8 },
    headings: { h2: 4-6, h3: 2-4 },
    images: { hero: 1, body: 2-3, charts: 1-2 },
    readingTime: { min: 5, optimal: 8, max: 12 }
  }
};