// Image Optimization and Alt Text Generation for SEO

export interface ImageMetadata {
  src: string;
  alt: string;
  title?: string;
  caption?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  format?: 'jpg' | 'jpeg' | 'png' | 'webp' | 'avif' | 'gif' | 'svg';
  isHero?: boolean;
  isLazy?: boolean;
  priority?: boolean;
}

export interface ImageSEOAnalysis {
  score: number;
  issues: string[];
  suggestions: string[];
  altTextQuality: 'excellent' | 'good' | 'fair' | 'poor';
  seoOptimized: boolean;
}

// Generate SEO-optimized alt text
export function generateOptimizedAltText(
  fileName: string,
  context: {
    productName?: string;
    brandName?: string;
    category?: string;
    action?: string;
    contentType?: 'review' | 'comparison' | 'guide' | 'news';
    pageTitle?: string;
    mainKeyword?: string;
  } = {}
): string {
  const {
    productName,
    brandName,
    category,
    action,
    contentType,
    pageTitle,
    mainKeyword
  } = context;

  // Extract descriptive information from filename
  const baseName = fileName
    .replace(/\.(jpg|jpeg|png|webp|gif|svg|avif)$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());

  let altText = '';

  // Build alt text based on context
  if (productName && brandName) {
    if (action) {
      altText = `${brandName} ${productName} ${action}`;
    } else {
      altText = `${brandName} ${productName}`;
    }
  } else if (productName) {
    altText = productName;
  } else if (mainKeyword) {
    altText = mainKeyword;
  }

  // Add descriptive elements from filename
  if (baseName && !altText.toLowerCase().includes(baseName.toLowerCase())) {
    altText = altText ? `${altText} - ${baseName}` : baseName;
  }

  // Add context-specific descriptions
  if (contentType === 'review') {
    if (fileName.includes('unbox')) {
      altText += ' unboxing';
    } else if (fileName.includes('camera') || fileName.includes('photo')) {
      altText += ' camera sample';
    } else if (fileName.includes('screen') || fileName.includes('display')) {
      altText += ' display quality';
    } else if (fileName.includes('design') || fileName.includes('build')) {
      altText += ' design and build';
    }
  }

  // Ensure alt text is descriptive and under 125 characters
  if (altText.length > 125) {
    altText = altText.substring(0, 122) + '...';
  }

  // Add category if relevant and space permits
  if (category && altText.length < 100) {
    altText += ` - ${category}`;
  }

  return altText || 'Product image';
}

// Analyze image SEO optimization
export function analyzeImageSEO(
  image: ImageMetadata,
  context: {
    targetKeywords?: string[];
    contentType?: string;
    isHeroImage?: boolean;
  } = {}
): ImageSEOAnalysis {
  let score = 100;
  const issues: string[] = [];
  const suggestions: string[] = [];
  const { targetKeywords = [], isHeroImage = false } = context;

  // Alt text analysis
  const altTextScore = analyzeAltText(image.alt, targetKeywords, issues, suggestions);
  score = Math.min(score, altTextScore + 20); // Weight alt text heavily

  // File size analysis
  if (image.fileSize) {
    if (image.fileSize > 1000000) { // 1MB
      issues.push('Image file size too large (over 1MB)');
      score -= 20;
    } else if (image.fileSize > 500000) { // 500KB
      suggestions.push('Consider compressing image further for better loading speed');
      score -= 10;
    }
  }

  // Format optimization
  if (image.format === 'png' && !image.src.includes('logo') && !image.src.includes('icon')) {
    suggestions.push('Consider using WebP or AVIF format for better compression');
    score -= 5;
  }

  // Dimensions check
  if (isHeroImage && (!image.width || !image.height)) {
    issues.push('Hero image missing width and height attributes (affects LCP)');
    score -= 15;
  }

  // Loading strategy
  if (isHeroImage && image.isLazy !== false) {
    issues.push('Hero image should not be lazy loaded (use priority loading)');
    score -= 10;
  }

  // Title attribute
  if (!image.title && image.alt) {
    suggestions.push('Consider adding title attribute for additional context');
  }

  // Caption for SEO
  if (!image.caption && context.contentType === 'review') {
    suggestions.push('Add image caption for better context and SEO');
    score -= 5;
  }

  // Determine alt text quality
  let altTextQuality: ImageSEOAnalysis['altTextQuality'] = 'poor';
  if (altTextScore >= 90) altTextQuality = 'excellent';
  else if (altTextScore >= 75) altTextQuality = 'good';
  else if (altTextScore >= 50) altTextQuality = 'fair';

  return {
    score: Math.max(0, score),
    issues,
    suggestions,
    altTextQuality,
    seoOptimized: score >= 80
  };
}

// Analyze alt text quality
function analyzeAltText(
  altText: string,
  targetKeywords: string[],
  issues: string[],
  suggestions: string[]
): number {
  let score = 100;

  // Basic checks
  if (!altText || altText.trim().length === 0) {
    issues.push('Alt text is missing');
    return 0;
  }

  if (altText.trim().length < 5) {
    issues.push('Alt text too short (less than 5 characters)');
    score -= 30;
  }

  if (altText.length > 125) {
    issues.push('Alt text too long (over 125 characters)');
    score -= 20;
  }

  // Generic/poor alt text
  const genericPhrases = [
    'image', 'picture', 'photo', 'img', 'graphic', 'screenshot',
    'untitled', 'dsc', 'img_', 'image_', 'photo_'
  ];

  const isGeneric = genericPhrases.some(phrase => 
    altText.toLowerCase().includes(phrase.toLowerCase()) && altText.split(' ').length <= 2
  );

  if (isGeneric) {
    issues.push('Alt text is too generic');
    score -= 40;
  }

  // Keyword stuffing check
  const words = altText.toLowerCase().split(' ');
  const duplicates = words.filter((word, index) => 
    word.length > 3 && words.indexOf(word) !== index
  );

  if (duplicates.length > 0) {
    issues.push('Alt text contains repeated keywords (keyword stuffing)');
    score -= 25;
  }

  // Target keyword presence
  if (targetKeywords.length > 0) {
    const altTextLower = altText.toLowerCase();
    let keywordFound = false;

    targetKeywords.forEach(keyword => {
      if (altTextLower.includes(keyword.toLowerCase())) {
        keywordFound = true;
      }
    });

    if (!keywordFound) {
      suggestions.push('Consider including target keywords in alt text naturally');
      score -= 15;
    }
  }

  // Descriptiveness check
  if (words.length < 3) {
    suggestions.push('Make alt text more descriptive');
    score -= 10;
  }

  // Redundancy with nearby text (this would require context)
  if (altText.toLowerCase().includes('image of') || 
      altText.toLowerCase().includes('photo of') ||
      altText.toLowerCase().includes('picture of')) {
    suggestions.push('Remove redundant phrases like "image of" from alt text');
    score -= 5;
  }

  return Math.max(0, score);
}

// Generate responsive image srcset
export function generateResponsiveSrcSet(
  baseSrc: string,
  sizes: number[] = [480, 768, 1024, 1280, 1920, 2560]
): string {
  return sizes
    .map(size => `${baseSrc}?w=${size}&q=75 ${size}w`)
    .join(', ');
}

// Generate sizes attribute for responsive images
export function generateSizesAttribute(
  breakpoints: Array<{ mediaQuery: string; width: string }> = [
    { mediaQuery: '(max-width: 640px)', width: '100vw' },
    { mediaQuery: '(max-width: 1024px)', width: '50vw' },
    { mediaQuery: '', width: '33vw' }
  ]
): string {
  return breakpoints
    .map(bp => bp.mediaQuery ? `${bp.mediaQuery} ${bp.width}` : bp.width)
    .join(', ');
}

// Batch analyze images in content
export function analyzeContentImages(
  content: string,
  context: {
    targetKeywords?: string[];
    contentType?: 'review' | 'comparison' | 'guide' | 'news';
    productName?: string;
    brandName?: string;
  } = {}
): Array<{
  src: string;
  alt: string;
  analysis: ImageSEOAnalysis;
  suggestedAlt: string;
}> {
  const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
  const images: Array<{ src: string; alt: string; analysis: ImageSEOAnalysis; suggestedAlt: string }> = [];
  
  let match;
  while ((match = imageRegex.exec(content)) !== null) {
    const [, alt, src] = match;
    
    const imageMetadata: ImageMetadata = {
      src,
      alt,
      format: getImageFormat(src),
    };
    
    const analysis = analyzeImageSEO(imageMetadata, context);
    
    const suggestedAlt = generateOptimizedAltText(
      src.split('/').pop() || src,
      {
        ...context,
        mainKeyword: context.targetKeywords?.[0]
      }
    );
    
    images.push({
      src,
      alt,
      analysis,
      suggestedAlt
    });
  }
  
  return images;
}

// Get image format from URL
function getImageFormat(src: string): ImageMetadata['format'] {
  const extension = src.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'jpeg';
    case 'png':
      return 'png';
    case 'webp':
      return 'webp';
    case 'avif':
      return 'avif';
    case 'gif':
      return 'gif';
    case 'svg':
      return 'svg';
    default:
      return 'jpeg';
  }
}

// Generate structured data for images
export function generateImageStructuredData(
  images: ImageMetadata[],
  context: {
    productName?: string;
    brandName?: string;
    pageUrl?: string;
    contentType?: string;
  } = {}
): any {
  if (images.length === 0) return null;

  const primaryImage = images[0];
  
  return {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "name": `${context.productName || 'Product'} Images`,
    "description": `Image gallery for ${context.productName || 'product'}`,
    "image": images.map(img => ({
      "@type": "ImageObject",
      "url": img.src,
      "name": img.alt,
      "caption": img.caption,
      "width": img.width,
      "height": img.height,
      "encodingFormat": `image/${img.format}`,
      "contentUrl": img.src,
      "acquireLicensePage": context.pageUrl
    }))
  };
}

// Image optimization recommendations
export function getImageOptimizationRecommendations(
  images: ImageMetadata[]
): {
  criticalIssues: string[];
  improvements: string[];
  overallScore: number;
} {
  const criticalIssues: string[] = [];
  const improvements: string[] = [];
  let totalScore = 0;
  
  images.forEach((image, index) => {
    const analysis = analyzeImageSEO(image, { isHeroImage: index === 0 });
    totalScore += analysis.score;
    
    // Collect critical issues
    if (analysis.score < 50) {
      criticalIssues.push(`Image ${index + 1}: ${analysis.issues.join(', ')}`);
    }
    
    // Collect improvement suggestions
    if (analysis.suggestions.length > 0) {
      improvements.push(`Image ${index + 1}: ${analysis.suggestions.join(', ')}`);
    }
  });
  
  const overallScore = images.length > 0 ? totalScore / images.length : 0;
  
  // General recommendations based on image count
  if (images.length === 0) {
    criticalIssues.push('No images found in content - add relevant images for better SEO');
  } else if (images.length < 3) {
    improvements.push('Consider adding more images to improve engagement');
  }
  
  return {
    criticalIssues,
    improvements,
    overallScore
  };
}

// Auto-generate captions for images in content
export function generateImageCaptions(
  images: Array<{ src: string; alt: string }>,
  context: {
    productName?: string;
    brandName?: string;
    contentType?: 'review' | 'comparison' | 'guide' | 'news';
  } = {}
): Array<{ src: string; alt: string; caption: string }> {
  return images.map(image => {
    let caption = image.alt;
    
    // Enhance caption based on context
    if (context.contentType === 'review') {
      if (image.src.includes('camera') || image.alt.toLowerCase().includes('photo')) {
        caption += ` - Sample photo taken with ${context.productName || 'the device'}`;
      } else if (image.src.includes('screen') || image.alt.toLowerCase().includes('display')) {
        caption += ` - Display quality demonstration`;
      } else if (image.src.includes('unbox')) {
        caption += ` - What's included in the box`;
      }
    }
    
    return {
      ...image,
      caption
    };
  });
}