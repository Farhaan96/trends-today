// SEO Utilities and Helper Functions

export interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  twitterImage?: string;
  author?: string;
  publishedAt?: string;
  modifiedAt?: string;
  category?: string;
  tags?: string[];
  readingTime?: number;
  wordCount?: number;
}

// Generate optimized meta title
export function generateMetaTitle(
  title: string, 
  category?: string, 
  brand?: string,
  includeCategory = true
): string {
  const siteName = 'Trends Today';
  const maxLength = 60;
  
  let metaTitle = title;
  
  // Add category if provided and not already in title
  if (includeCategory && category && !title.toLowerCase().includes(category.toLowerCase())) {
    metaTitle = `${title} - ${category}`;
  }
  
  // Add brand if provided and not already in title
  if (brand && !title.toLowerCase().includes(brand.toLowerCase())) {
    metaTitle = `${metaTitle} by ${brand}`;
  }
  
  // Add site name if not already included
  if (!metaTitle.includes(siteName)) {
    metaTitle = `${metaTitle} | ${siteName}`;
  }
  
  // Truncate if too long
  if (metaTitle.length > maxLength) {
    const withoutSiteName = metaTitle.replace(` | ${siteName}`, '');
    if (withoutSiteName.length <= maxLength - siteName.length - 3) {
      metaTitle = `${withoutSiteName} | ${siteName}`;
    } else {
      metaTitle = `${withoutSiteName.substring(0, maxLength - siteName.length - 4)}... | ${siteName}`;
    }
  }
  
  return metaTitle;
}

// Generate optimized meta description
export function generateMetaDescription(
  description: string,
  additional?: {
    rating?: number;
    maxRating?: number;
    price?: string;
    readingTime?: number;
    wordCount?: number;
  }
): string {
  const maxLength = 160;
  let metaDescription = description;
  
  if (additional) {
    const extras = [];
    
    if (additional.rating && additional.maxRating) {
      extras.push(`Rated ${additional.rating}/${additional.maxRating}`);
    }
    
    if (additional.price) {
      extras.push(`Price: ${additional.price}`);
    }
    
    if (additional.readingTime) {
      extras.push(`${additional.readingTime} min read`);
    }
    
    if (extras.length > 0) {
      const extrasText = ` • ${extras.join(' • ')}`;
      if (description.length + extrasText.length <= maxLength) {
        metaDescription += extrasText;
      }
    }
  }
  
  // Truncate if too long
  if (metaDescription.length > maxLength) {
    metaDescription = metaDescription.substring(0, maxLength - 3) + '...';
  }
  
  return metaDescription;
}

// Generate semantic keywords from content
export function generateSemanticKeywords(
  title: string,
  description: string,
  category?: string,
  tags?: string[]
): string[] {
  const commonTechTerms = [
    'review', 'comparison', 'buying guide', 'specs', 'performance',
    'price', 'features', 'pros and cons', 'rating', 'benchmark',
    'smartphone', 'laptop', 'tablet', 'headphones', 'smart watch',
    'gaming', 'productivity', 'photography', 'video', 'battery life',
    'display', 'camera', 'processor', 'storage', 'memory', 'design'
  ];
  
  const contentText = `${title} ${description}`.toLowerCase();
  const extractedKeywords = new Set<string>();
  
  // Extract relevant tech terms
  commonTechTerms.forEach(term => {
    if (contentText.includes(term)) {
      extractedKeywords.add(term);
    }
  });
  
  // Add category if provided
  if (category) {
    extractedKeywords.add(category.toLowerCase());
  }
  
  // Add tags if provided
  if (tags) {
    tags.forEach(tag => extractedKeywords.add(tag.toLowerCase()));
  }
  
  // Extract brand names (common tech brands)
  const brands = [
    'apple', 'samsung', 'google', 'microsoft', 'sony', 'lg', 'xiaomi',
    'oneplus', 'huawei', 'oppo', 'vivo', 'realme', 'nokia', 'motorola',
    'asus', 'acer', 'hp', 'dell', 'lenovo', 'msi', 'razer', 'alienware',
    'nvidia', 'amd', 'intel', 'qualcomm', 'mediatek'
  ];
  
  brands.forEach(brand => {
    if (contentText.includes(brand)) {
      extractedKeywords.add(brand);
    }
  });
  
  return Array.from(extractedKeywords).slice(0, 10);
}

// Generate optimized slug
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

// Generate breadcrumb data
export function generateBreadcrumbs(pathname: string): Array<{name: string, url: string}> {
  const paths = pathname.split('/').filter(Boolean);
  const breadcrumbs = [{ name: 'Home', url: '/' }];
  
  const pathMap: Record<string, string> = {
    'reviews': 'Reviews',
    'compare': 'Comparisons',
    'best': 'Best Of',
    'news': 'News',
    'guides': 'Guides',
    'authors': 'Authors',
    'categories': 'Categories',
    'search': 'Search Results'
  };
  
  let currentPath = '';
  paths.forEach((path, index) => {
    currentPath += `/${path}`;
    const name = pathMap[path] || 
                  path.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ');
    
    breadcrumbs.push({
      name,
      url: currentPath
    });
  });
  
  return breadcrumbs;
}

// Calculate reading time
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

// Calculate word count
export function calculateWordCount(content: string): number {
  return content.trim().split(/\s+/).length;
}

// Generate FAQ schema data from content
export function generateFAQFromContent(content: string): Array<{question: string, answer: string}> {
  const faqs: Array<{question: string, answer: string}> = [];
  
  // Common FAQ patterns for tech reviews
  const faqPatterns = [
    {
      question: "Is this product worth buying?",
      answer: "Based on our comprehensive review and testing, we provide detailed analysis of value proposition, performance, and alternatives to help you make an informed decision."
    },
    {
      question: "What are the main pros and cons?",
      answer: "Our detailed review covers all advantages and disadvantages, including performance, design, value for money, and comparison with competitors."
    },
    {
      question: "How does it compare to competitors?",
      answer: "We provide comprehensive comparisons with similar products in the same category, helping you understand relative strengths and weaknesses."
    }
  ];
  
  // Add generic FAQs (in a real implementation, you'd extract these from content)
  faqs.push(...faqPatterns);
  
  return faqs.slice(0, 5); // Limit to 5 FAQs
}

// Generate related content suggestions
export function generateRelatedContent(
  currentCategory: string,
  currentTags: string[] = [],
  allContent: any[] = []
): Array<{title: string, url: string, category: string}> {
  // In a real implementation, this would query your content database
  // For now, return example related content
  const related = [
    {
      title: "Best Smartphones 2025: Top Picks for Every Budget",
      url: "/best/smartphones/2025",
      category: "Best Of"
    },
    {
      title: "iPhone vs Android: Complete Comparison Guide",
      url: "/compare/iphone-vs-android",
      category: "Comparisons"
    },
    {
      title: "How to Choose the Perfect Smartphone",
      url: "/guides/choosing-smartphone",
      category: "Guides"
    }
  ];
  
  return related.slice(0, 3);
}

// Optimize image alt text
export function generateImageAltText(
  fileName: string,
  context?: {
    productName?: string;
    action?: string;
    category?: string;
  }
): string {
  const baseName = fileName
    .replace(/\.(jpg|jpeg|png|webp|gif)$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
  
  if (context) {
    if (context.productName && context.action) {
      return `${context.productName} ${context.action} - ${baseName}`;
    }
    if (context.productName) {
      return `${context.productName} - ${baseName}`;
    }
    if (context.category) {
      return `${context.category} - ${baseName}`;
    }
  }
  
  return baseName;
}

// Generate canonical URL
export function generateCanonicalUrl(pathname: string, baseUrl?: string): string {
  const siteUrl = baseUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://trendstoday.ca';
  return `${siteUrl}${pathname}`;
}

// Check content quality for SEO
export function analyzeContentSEO(content: string, title: string): {
  score: number;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 100;
  
  const wordCount = calculateWordCount(content);
  const readingTime = calculateReadingTime(content);
  
  // Check content length
  if (wordCount < 300) {
    issues.push('Content is too short (less than 300 words)');
    score -= 20;
  }
  
  if (wordCount > 3000) {
    suggestions.push('Consider breaking long content into multiple pages');
  }
  
  // Check title in content
  if (!content.toLowerCase().includes(title.toLowerCase().substring(0, 20))) {
    issues.push('Title keywords not found in content');
    score -= 10;
  }
  
  // Check headings structure
  const h2Count = (content.match(/## /g) || []).length;
  const h3Count = (content.match(/### /g) || []).length;
  
  if (h2Count < 2) {
    issues.push('Add more H2 headings for better structure');
    score -= 10;
  }
  
  if (h2Count > 10) {
    suggestions.push('Consider consolidating some sections');
  }
  
  // Check for lists
  const listCount = (content.match(/^- /gm) || []).length;
  if (listCount === 0) {
    suggestions.push('Add bullet points or numbered lists for better readability');
  }
  
  // Check for images
  const imageCount = (content.match(/!\[.*?\]\(/g) || []).length;
  if (imageCount === 0) {
    issues.push('Add images to improve user engagement');
    score -= 15;
  }
  
  return {
    score: Math.max(0, score),
    issues,
    suggestions
  };
}

// Extract key phrases for internal linking
export function extractKeyPhrases(content: string): string[] {
  const techPhrases = [
    'smartphone comparison', 'best laptops', 'buying guide', 'tech review',
    'performance test', 'battery life', 'camera quality', 'price comparison',
    'gaming performance', 'productivity features', 'display quality',
    'build quality', 'software experience', 'user interface', 'design language',
    'flagship phone', 'mid-range phone', 'budget phone', 'premium laptop',
    'gaming laptop', 'ultrabook', 'tablet comparison', 'smartwatch review',
    'wireless earbuds', 'noise cancelling', 'fast charging', 'wireless charging',
    'water resistance', 'durability test', 'benchmark scores', 'real-world usage'
  ];
  
  const contentLower = content.toLowerCase();
  const foundPhrases = techPhrases.filter(phrase => 
    contentLower.includes(phrase)
  );
  
  return foundPhrases;
}