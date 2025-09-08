// Content SEO Optimization Tools

export interface SEOScore {
  overall: number;
  breakdown: {
    title: number;
    description: number;
    content: number;
    structure: number;
    keywords: number;
    readability: number;
  };
  issues: string[];
  suggestions: string[];
}

export interface KeywordDensity {
  keyword: string;
  count: number;
  density: number;
  isOptimal: boolean;
}

export interface ReadabilityScore {
  score: number;
  level: 'Very Easy' | 'Easy' | 'Fairly Easy' | 'Standard' | 'Fairly Difficult' | 'Difficult' | 'Very Difficult';
  avgWordsPerSentence: number;
  avgSyllablesPerWord: number;
  sentences: number;
  words: number;
}

// Main content SEO analyzer
export function analyzeContentSEO(data: {
  title: string;
  description: string;
  content: string;
  targetKeywords?: string[];
  url?: string;
}): SEOScore {
  const { title, description, content, targetKeywords = [] } = data;
  
  let issues: string[] = [];
  let suggestions: string[] = [];
  
  // Analyze title
  const titleScore = analyzeTitleSEO(title, targetKeywords, issues, suggestions);
  
  // Analyze description
  const descriptionScore = analyzeDescriptionSEO(description, targetKeywords, issues, suggestions);
  
  // Analyze content
  const contentScore = analyzeContentBody(content, targetKeywords, issues, suggestions);
  
  // Analyze structure
  const structureScore = analyzeContentStructure(content, issues, suggestions);
  
  // Analyze keywords
  const keywordScore = analyzeKeywordUsage(title, description, content, targetKeywords, issues, suggestions);
  
  // Analyze readability
  const readabilityScore = analyzeReadability(content, issues, suggestions);
  
  const breakdown = {
    title: titleScore,
    description: descriptionScore,
    content: contentScore,
    structure: structureScore,
    keywords: keywordScore,
    readability: readabilityScore
  };
  
  const overall = Object.values(breakdown).reduce((sum, score) => sum + score, 0) / Object.keys(breakdown).length;
  
  return {
    overall: Math.round(overall),
    breakdown,
    issues,
    suggestions
  };
}

// Title SEO analysis
function analyzeTitleSEO(title: string, targetKeywords: string[], issues: string[], suggestions: string[]): number {
  let score = 100;
  
  // Length check
  if (title.length < 30) {
    issues.push('Title is too short (less than 30 characters)');
    score -= 20;
  } else if (title.length > 60) {
    issues.push('Title is too long (more than 60 characters)');
    score -= 15;
  }
  
  // Keyword presence
  const titleLower = title.toLowerCase();
  let keywordFound = false;
  targetKeywords.forEach(keyword => {
    if (titleLower.includes(keyword.toLowerCase())) {
      keywordFound = true;
    }
  });
  
  if (!keywordFound && targetKeywords.length > 0) {
    issues.push('Target keyword not found in title');
    score -= 25;
  }
  
  // Title structure
  if (!title.includes('|') && !title.includes('-') && !title.includes(':')) {
    suggestions.push('Consider adding a separator (| or -) to include brand name');
  }
  
  // Emotional/power words
  const powerWords = ['ultimate', 'complete', 'comprehensive', 'best', 'top', 'amazing', 'incredible', 'perfect'];
  const hasPowerWord = powerWords.some(word => titleLower.includes(word));
  
  if (!hasPowerWord) {
    suggestions.push('Consider adding power words to make title more engaging');
    score -= 5;
  }
  
  return Math.max(0, score);
}

// Description SEO analysis
function analyzeDescriptionSEO(description: string, targetKeywords: string[], issues: string[], suggestions: string[]): number {
  let score = 100;
  
  // Length check
  if (description.length < 120) {
    issues.push('Meta description is too short (less than 120 characters)');
    score -= 20;
  } else if (description.length > 160) {
    issues.push('Meta description is too long (more than 160 characters)');
    score -= 15;
  }
  
  // Keyword presence
  const descriptionLower = description.toLowerCase();
  let keywordFound = false;
  targetKeywords.forEach(keyword => {
    if (descriptionLower.includes(keyword.toLowerCase())) {
      keywordFound = true;
    }
  });
  
  if (!keywordFound && targetKeywords.length > 0) {
    issues.push('Target keyword not found in meta description');
    score -= 20;
  }
  
  // Call to action
  const cta = ['learn', 'discover', 'find out', 'read more', 'get', 'buy', 'compare', 'review'];
  const hasCTA = cta.some(word => descriptionLower.includes(word));
  
  if (!hasCTA) {
    suggestions.push('Consider adding a call-to-action in the meta description');
    score -= 10;
  }
  
  return Math.max(0, score);
}

// Content body analysis
function analyzeContentBody(content: string, targetKeywords: string[], issues: string[], suggestions: string[]): number {
  let score = 100;
  
  const wordCount = content.trim().split(/\s+/).length;
  
  // Word count
  if (wordCount < 300) {
    issues.push('Content is too short (less than 300 words)');
    score -= 30;
  } else if (wordCount < 600) {
    suggestions.push('Consider expanding content for better SEO (600+ words recommended)');
    score -= 10;
  }
  
  // Keyword density
  if (targetKeywords.length > 0) {
    const densities = analyzeKeywordDensity(content, targetKeywords);
    densities.forEach(density => {
      if (density.density > 3) {
        issues.push(`Keyword "${density.keyword}" density too high (${density.density.toFixed(1)}%)`);
        score -= 15;
      } else if (density.density < 0.5) {
        suggestions.push(`Consider using keyword "${density.keyword}" more frequently`);
        score -= 5;
      }
    });
  }
  
  // Content freshness indicators
  const currentYear = new Date().getFullYear();
  if (!content.includes(currentYear.toString())) {
    suggestions.push(`Consider mentioning ${currentYear} for content freshness`);
    score -= 5;
  }
  
  return Math.max(0, score);
}

// Content structure analysis
function analyzeContentStructure(content: string, issues: string[], suggestions: string[]): number {
  let score = 100;
  
  // Headings analysis
  const h1Count = (content.match(/^# /gm) || []).length;
  const h2Count = (content.match(/^## /gm) || []).length;
  const h3Count = (content.match(/^### /gm) || []).length;
  
  if (h1Count === 0) {
    issues.push('No H1 heading found');
    score -= 20;
  } else if (h1Count > 1) {
    issues.push('Multiple H1 headings found (should be only one)');
    score -= 15;
  }
  
  if (h2Count < 2) {
    issues.push('Too few H2 headings (minimum 2 recommended)');
    score -= 15;
  }
  
  if (h2Count > 10) {
    suggestions.push('Consider consolidating some H2 sections');
  }
  
  // Lists and formatting
  const bulletLists = (content.match(/^- /gm) || []).length;
  const numberedLists = (content.match(/^\d+\. /gm) || []).length;
  
  if (bulletLists === 0 && numberedLists === 0) {
    suggestions.push('Add bullet points or numbered lists for better readability');
    score -= 10;
  }
  
  // Images
  const images = (content.match(/!\[.*?\]\(/g) || []).length;
  const wordCount = content.trim().split(/\s+/).length;
  const imageRatio = images / (wordCount / 300); // Roughly 1 image per 300 words
  
  if (images === 0) {
    issues.push('No images found in content');
    score -= 15;
  } else if (imageRatio < 0.5) {
    suggestions.push('Consider adding more images for better engagement');
    score -= 5;
  }
  
  // Tables for comparisons
  if (content.includes('vs') || content.includes('compare') || content.includes('comparison')) {
    const tables = (content.match(/\|.*\|/g) || []).length;
    if (tables === 0) {
      suggestions.push('Consider adding comparison tables for better readability');
    }
  }
  
  return Math.max(0, score);
}

// Keyword usage analysis
function analyzeKeywordUsage(
  title: string, 
  description: string, 
  content: string, 
  targetKeywords: string[], 
  issues: string[], 
  suggestions: string[]
): number {
  let score = 100;
  
  if (targetKeywords.length === 0) {
    suggestions.push('Define target keywords for better optimization');
    return 70;
  }
  
  const fullText = `${title} ${description} ${content}`.toLowerCase();
  
  targetKeywords.forEach(keyword => {
    const keywordLower = keyword.toLowerCase();
    const occurrences = (fullText.match(new RegExp(keywordLower, 'g')) || []).length;
    const wordCount = fullText.trim().split(/\s+/).length;
    const density = (occurrences / wordCount) * 100;
    
    // Keyword placement
    let placementScore = 0;
    if (title.toLowerCase().includes(keywordLower)) placementScore += 30;
    if (description.toLowerCase().includes(keywordLower)) placementScore += 20;
    if (content.toLowerCase().substring(0, 200).includes(keywordLower)) placementScore += 25;
    if (content.toLowerCase().includes(keywordLower)) placementScore += 25;
    
    if (placementScore < 50) {
      issues.push(`Keyword "${keyword}" not well distributed across content`);
      score -= 10;
    }
    
    // LSI keywords (semantic variations)
    const lsiKeywords = generateLSIKeywords(keyword);
    const lsiFound = lsiKeywords.filter(lsi => fullText.includes(lsi.toLowerCase())).length;
    
    if (lsiFound < 2) {
      suggestions.push(`Add semantic variations of "${keyword}" for better context`);
      score -= 5;
    }
  });
  
  return Math.max(0, score);
}

// Readability analysis (simplified Flesch-Kincaid)
function analyzeReadability(content: string, issues: string[], suggestions: string[]): number {
  let score = 100;
  
  const readability = calculateReadabilityScore(content);
  
  if (readability.score < 30) {
    issues.push('Content is very difficult to read');
    score -= 25;
  } else if (readability.score < 50) {
    issues.push('Content is difficult to read');
    score -= 15;
  } else if (readability.score < 60) {
    suggestions.push('Consider simplifying sentences for better readability');
    score -= 10;
  }
  
  if (readability.avgWordsPerSentence > 20) {
    suggestions.push('Break down long sentences (average: ' + readability.avgWordsPerSentence.toFixed(1) + ' words/sentence)');
    score -= 10;
  }
  
  return Math.max(0, score);
}

// Calculate Flesch Reading Ease score
export function calculateReadabilityScore(content: string): ReadabilityScore {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = content.trim().split(/\s+/);
  
  // Count syllables (simplified method)
  let totalSyllables = 0;
  words.forEach(word => {
    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
    const vowelMatches = cleanWord.match(/[aeiouy]+/g);
    let syllables = vowelMatches ? vowelMatches.length : 1;
    
    // Adjust for silent 'e'
    if (cleanWord.endsWith('e') && syllables > 1) {
      syllables--;
    }
    
    totalSyllables += Math.max(1, syllables);
  });
  
  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = totalSyllables / words.length;
  
  // Flesch Reading Ease formula
  const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
  
  let level: ReadabilityScore['level'];
  if (score >= 90) level = 'Very Easy';
  else if (score >= 80) level = 'Easy';
  else if (score >= 70) level = 'Fairly Easy';
  else if (score >= 60) level = 'Standard';
  else if (score >= 50) level = 'Fairly Difficult';
  else if (score >= 30) level = 'Difficult';
  else level = 'Very Difficult';
  
  return {
    score: Math.max(0, Math.min(100, score)),
    level,
    avgWordsPerSentence,
    avgSyllablesPerWord,
    sentences: sentences.length,
    words: words.length
  };
}

// Analyze keyword density
export function analyzeKeywordDensity(content: string, keywords: string[]): KeywordDensity[] {
  const words = content.toLowerCase().trim().split(/\s+/);
  const totalWords = words.length;
  
  return keywords.map(keyword => {
    const keywordLower = keyword.toLowerCase();
    const count = (content.toLowerCase().match(new RegExp(keywordLower, 'g')) || []).length;
    const density = (count / totalWords) * 100;
    
    return {
      keyword,
      count,
      density,
      isOptimal: density >= 0.5 && density <= 2.5
    };
  });
}

// Generate LSI (Latent Semantic Indexing) keywords
function generateLSIKeywords(mainKeyword: string): string[] {
  const keywordLower = mainKeyword.toLowerCase();
  const lsiMap: Record<string, string[]> = {
    'smartphone': ['mobile phone', 'cell phone', 'mobile device', 'handset', 'android', 'ios'],
    'laptop': ['notebook', 'computer', 'portable computer', 'pc', 'ultrabook', 'macbook'],
    'headphones': ['earphones', 'earbuds', 'headset', 'audio', 'wireless earphones', 'bluetooth headphones'],
    'review': ['analysis', 'evaluation', 'test', 'assessment', 'rating', 'comparison'],
    'best': ['top', 'recommended', 'excellent', 'premium', 'quality', 'leading'],
    'camera': ['photography', 'photo quality', 'image', 'lens', 'sensor', 'megapixel'],
    'battery': ['battery life', 'power', 'charging', 'endurance', 'capacity', 'longevity'],
    'performance': ['speed', 'fast', 'processing', 'benchmark', 'efficiency', 'powerful']
  };
  
  // Find matching LSI keywords
  const lsiKeywords: string[] = [];
  Object.entries(lsiMap).forEach(([key, synonyms]) => {
    if (keywordLower.includes(key) || key.includes(keywordLower)) {
      lsiKeywords.push(...synonyms);
    }
  });
  
  return lsiKeywords;
}

// Generate content outline based on keywords and competitors
export function generateContentOutline(
  mainKeyword: string,
  targetKeywords: string[] = [],
  contentType: 'review' | 'comparison' | 'guide' | 'news' = 'review'
): string[] {
  const outlineTemplates = {
    review: [
      'Introduction and Overview',
      'Design and Build Quality',
      'Technical Specifications',
      'Performance Testing',
      'Key Features Analysis',
      'Pros and Cons',
      'Price and Value Proposition',
      'Comparison with Competitors',
      'Final Verdict and Rating'
    ],
    comparison: [
      'Introduction',
      'Specification Comparison',
      'Design and Build Comparison',
      'Performance Benchmarks',
      'Feature Comparison',
      'Price Comparison',
      'Use Case Scenarios',
      'Winner Decision',
      'Buying Recommendations'
    ],
    guide: [
      'Introduction',
      'What to Consider',
      'Top Recommendations',
      'Budget Options',
      'Premium Choices',
      'Key Features to Look For',
      'Common Mistakes to Avoid',
      'Buying Tips',
      'Conclusion'
    ],
    news: [
      'Breaking News Summary',
      'Background Information',
      'Key Details',
      'Impact Analysis',
      'Industry Reactions',
      'What This Means for Consumers',
      'Future Implications',
      'Related Coverage'
    ]
  };
  
  return outlineTemplates[contentType];
}

// Content optimization suggestions
export function generateOptimizationSuggestions(
  content: string,
  targetKeywords: string[],
  contentType: 'review' | 'comparison' | 'guide' | 'news'
): string[] {
  const suggestions: string[] = [];
  const contentLower = content.toLowerCase();
  
  // Content type specific suggestions
  if (contentType === 'review') {
    if (!contentLower.includes('pros') && !contentLower.includes('advantages')) {
      suggestions.push('Add a pros and cons section');
    }
    if (!contentLower.includes('rating') && !contentLower.includes('score')) {
      suggestions.push('Include a numerical rating or score');
    }
    if (!contentLower.includes('price') && !contentLower.includes('cost')) {
      suggestions.push('Mention pricing information');
    }
  }
  
  if (contentType === 'comparison') {
    if (!contentLower.includes('table') && !content.includes('|')) {
      suggestions.push('Add comparison tables for easy reference');
    }
    if (!contentLower.includes('winner') && !contentLower.includes('better')) {
      suggestions.push('Clearly state which option is better for different use cases');
    }
  }
  
  if (contentType === 'guide') {
    if (!contentLower.includes('step') && !contentLower.includes('how to')) {
      suggestions.push('Add step-by-step instructions');
    }
    if (!contentLower.includes('tip') && !contentLower.includes('advice')) {
      suggestions.push('Include practical tips and advice');
    }
  }
  
  // General content suggestions
  if (!contentLower.includes('faq') && !contentLower.includes('question')) {
    suggestions.push('Consider adding an FAQ section');
  }
  
  if (!contentLower.includes('conclusion') && !contentLower.includes('summary')) {
    suggestions.push('Add a conclusion or summary section');
  }
  
  // Keyword-based suggestions
  targetKeywords.forEach(keyword => {
    const lsiKeywords = generateLSIKeywords(keyword);
    const missingLSI = lsiKeywords.filter(lsi => !contentLower.includes(lsi.toLowerCase()));
    
    if (missingLSI.length > 0) {
      suggestions.push(`Include related terms: ${missingLSI.slice(0, 3).join(', ')}`);
    }
  });
  
  return suggestions;
}