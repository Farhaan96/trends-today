// Internal Linking System for SEO Optimization

export interface InternalLink {
  text: string;
  url: string;
  context: string;
  relevanceScore: number;
  type: 'review' | 'comparison' | 'guide' | 'news' | 'category';
}

export interface TopicCluster {
  pillarPage: {
    title: string;
    url: string;
    keywords: string[];
  };
  clusterPages: Array<{
    title: string;
    url: string;
    keywords: string[];
    type: 'review' | 'comparison' | 'guide';
  }>;
}

// Define topic clusters for tech blog
export const topicClusters: TopicCluster[] = [
  {
    pillarPage: {
      title: "Best Smartphones 2025: Complete Buying Guide",
      url: "/best/smartphones/2025",
      keywords: ["best smartphones", "smartphone buying guide", "phone comparison", "mobile phones"]
    },
    clusterPages: [
      {
        title: "iPhone 15 Pro Review",
        url: "/reviews/iphone-15-pro-review",
        keywords: ["iphone 15 pro", "apple phone", "ios phone"],
        type: "review"
      },
      {
        title: "Samsung Galaxy S24 Ultra Review", 
        url: "/reviews/samsung-galaxy-s24-ultra-review",
        keywords: ["galaxy s24", "samsung phone", "android flagship"],
        type: "review"
      },
      {
        title: "iPhone vs Android: Which is Better?",
        url: "/compare/iphone-vs-android",
        keywords: ["iphone vs android", "ios vs android", "phone comparison"],
        type: "comparison"
      },
      {
        title: "How to Choose the Perfect Smartphone",
        url: "/guides/choosing-perfect-smartphone",
        keywords: ["choose smartphone", "smartphone guide", "phone buying tips"],
        type: "guide"
      }
    ]
  },
  {
    pillarPage: {
      title: "Best Laptops 2025: Expert Reviews & Buying Guide",
      url: "/best/laptops/2025",
      keywords: ["best laptops", "laptop buying guide", "computer comparison", "notebook reviews"]
    },
    clusterPages: [
      {
        title: "MacBook Air M3 Review",
        url: "/reviews/macbook-air-m3-review", 
        keywords: ["macbook air", "apple laptop", "m3 chip"],
        type: "review"
      },
      {
        title: "Gaming vs Productivity Laptops",
        url: "/compare/gaming-vs-productivity-laptops",
        keywords: ["gaming laptop", "productivity laptop", "laptop comparison"],
        type: "comparison"
      },
      {
        title: "Laptop Buying Guide 2025",
        url: "/guides/laptop-buying-guide-2025",
        keywords: ["laptop guide", "buy laptop", "choose laptop"],
        type: "guide"
      }
    ]
  },
  {
    pillarPage: {
      title: "Best Headphones 2025: Reviews & Buying Guide", 
      url: "/best/headphones/2025",
      keywords: ["best headphones", "headphone reviews", "audio comparison", "wireless earbuds"]
    },
    clusterPages: [
      {
        title: "AirPods Pro 3 Review",
        url: "/reviews/airpods-pro-3-review",
        keywords: ["airpods pro", "apple earbuds", "wireless earbuds"],
        type: "review"
      },
      {
        title: "Wired vs Wireless Headphones",
        url: "/compare/wired-vs-wireless-headphones",
        keywords: ["wired headphones", "wireless headphones", "headphone comparison"], 
        type: "comparison"
      }
    ]
  }
];

// Content database for internal linking (in production, this would come from your CMS)
export const contentDatabase = [
  // Reviews
  {
    title: "iPhone 15 Pro Review: Apple's Most Advanced Phone Yet",
    url: "/reviews/iphone-15-pro-review",
    type: "review",
    category: "smartphones",
    keywords: ["iphone 15 pro", "apple", "smartphone", "review", "ios", "a17 pro", "titanium", "camera"],
    excerpt: "Our comprehensive review of the iPhone 15 Pro covers design, performance, camera quality, and value proposition.",
    publishedAt: "2025-01-15"
  },
  {
    title: "Samsung Galaxy S24 Ultra Review: Android Excellence",
    url: "/reviews/samsung-galaxy-s24-ultra-review", 
    type: "review",
    category: "smartphones",
    keywords: ["galaxy s24 ultra", "samsung", "android", "smartphone", "s pen", "camera", "snapdragon"],
    excerpt: "Samsung's flagship delivers exceptional performance, camera capabilities, and productivity features.",
    publishedAt: "2025-01-14"
  },
  {
    title: "Google Pixel 8 Pro Review: AI Photography Perfected",
    url: "/reviews/google-pixel-8-pro-review",
    type: "review", 
    category: "smartphones",
    keywords: ["pixel 8 pro", "google", "android", "ai photography", "computational photography"],
    excerpt: "Google's latest flagship showcases the future of AI-powered mobile photography.",
    publishedAt: "2025-01-12"
  },
  {
    title: "MacBook Air M3 Review: Perfect Balance of Power and Portability",
    url: "/reviews/macbook-air-m3-review",
    type: "review",
    category: "laptops", 
    keywords: ["macbook air", "m3 chip", "apple", "laptop", "ultrabook", "performance"],
    excerpt: "Apple's M3-powered MacBook Air delivers impressive performance in an ultra-portable package.",
    publishedAt: "2025-01-10"
  },
  // Comparisons
  {
    title: "iPhone 15 Pro vs Samsung Galaxy S24: Ultimate Flagship Battle",
    url: "/compare/iphone-15-pro-vs-samsung-galaxy-s24",
    type: "comparison",
    category: "smartphones",
    keywords: ["iphone vs samsung", "flagship comparison", "ios vs android", "smartphone battle"],
    excerpt: "Head-to-head comparison of Apple and Samsung's latest flagships across all key metrics.",
    publishedAt: "2025-01-13"
  },
  {
    title: "MacBook vs Windows Laptop: Which is Better in 2025?",
    url: "/compare/macbook-vs-windows-laptop",
    type: "comparison", 
    category: "laptops",
    keywords: ["macbook vs windows", "laptop comparison", "mac vs pc", "operating system"],
    excerpt: "Comprehensive comparison to help you choose between macOS and Windows laptops.",
    publishedAt: "2025-01-08"
  },
  // Buying Guides
  {
    title: "Best Smartphones 2025: Top Picks for Every Budget",
    url: "/best/smartphones/2025",
    type: "guide",
    category: "smartphones",
    keywords: ["best smartphones", "smartphone guide", "phone recommendations", "buying guide"],
    excerpt: "Our expert picks for the best smartphones across all price ranges in 2025.",
    publishedAt: "2025-01-01"
  },
  {
    title: "Best Laptops 2025: Expert Reviews & Recommendations", 
    url: "/best/laptops/2025",
    type: "guide",
    category: "laptops",
    keywords: ["best laptops", "laptop guide", "computer recommendations", "buying guide"],
    excerpt: "Top laptop picks for gaming, productivity, students, and professionals.",
    publishedAt: "2025-01-02"
  },
  {
    title: "Best Headphones 2025: Wired, Wireless & Everything Between",
    url: "/best/headphones/2025", 
    type: "guide",
    category: "audio",
    keywords: ["best headphones", "headphone guide", "audio gear", "wireless earbuds"],
    excerpt: "Complete guide to the best headphones and earbuds for every use case and budget.",
    publishedAt: "2025-01-03"
  }
];

// Generate contextual internal links
export function generateInternalLinks(
  currentContent: string,
  currentUrl: string,
  maxLinks = 5
): InternalLink[] {
  const links: InternalLink[] = [];
  const contentLower = currentContent.toLowerCase();
  const usedUrls = new Set([currentUrl]);

  // Find relevant content based on keyword matching
  contentDatabase.forEach(item => {
    if (usedUrls.has(item.url)) return;

    let relevanceScore = 0;
    let matchingKeywords = 0;

    // Check for keyword matches
    item.keywords.forEach(keyword => {
      if (contentLower.includes(keyword.toLowerCase())) {
        relevanceScore += 10;
        matchingKeywords++;
      }
    });

    // Check for title matches
    const titleWords = item.title.toLowerCase().split(' ');
    titleWords.forEach(word => {
      if (word.length > 3 && contentLower.includes(word)) {
        relevanceScore += 5;
      }
    });

    // Boost score for same category
    const currentCategory = getCurrentCategory(currentUrl);
    if (currentCategory && item.category === currentCategory) {
      relevanceScore += 15;
    }

    // Only include if relevance score is high enough
    if (relevanceScore >= 20) {
      // Find the best context for the link
      const context = findLinkContext(contentLower, item.keywords);
      
      links.push({
        text: item.title,
        url: item.url,
        context,
        relevanceScore,
        type: item.type as any
      });
      
      usedUrls.add(item.url);
    }
  });

  // Sort by relevance and return top links
  return links
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, maxLinks);
}

// Generate topic cluster links
export function generateClusterLinks(currentUrl: string): InternalLink[] {
  const links: InternalLink[] = [];

  topicClusters.forEach(cluster => {
    // If current page is the pillar page, link to cluster pages
    if (cluster.pillarPage.url === currentUrl) {
      cluster.clusterPages.forEach(page => {
        links.push({
          text: page.title,
          url: page.url, 
          context: `Related ${page.type}`,
          relevanceScore: 95,
          type: page.type
        });
      });
    }
    // If current page is a cluster page, link to pillar and related pages
    else {
      const currentPage = cluster.clusterPages.find(page => page.url === currentUrl);
      if (currentPage) {
        // Link to pillar page
        links.push({
          text: cluster.pillarPage.title,
          url: cluster.pillarPage.url,
          context: "Complete buying guide",
          relevanceScore: 100,
          type: "guide"
        });

        // Link to related cluster pages
        cluster.clusterPages.forEach(page => {
          if (page.url !== currentUrl) {
            links.push({
              text: page.title,
              url: page.url,
              context: `Related ${page.type}`,
              relevanceScore: 90,
              type: page.type
            });
          }
        });
      }
    }
  });

  return links.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

// Generate related articles links
export function generateRelatedLinks(
  category: string,
  tags: string[] = [],
  currentUrl: string,
  maxLinks = 3
): InternalLink[] {
  const links: InternalLink[] = [];

  const relatedContent = contentDatabase.filter(item => {
    if (item.url === currentUrl) return false;
    
    // Match by category
    if (item.category === category) return true;
    
    // Match by tags/keywords
    if (tags.some(tag => 
      item.keywords.some(keyword => 
        keyword.toLowerCase().includes(tag.toLowerCase()) ||
        tag.toLowerCase().includes(keyword.toLowerCase())
      )
    )) return true;
    
    return false;
  });

  // Sort by publication date (newest first) and take top results
  relatedContent
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, maxLinks)
    .forEach(item => {
      links.push({
        text: item.title,
        url: item.url,
        context: "Related article",
        relevanceScore: 85,
        type: item.type as any
      });
    });

  return links;
}

// Helper function to find the best context for a link
function findLinkContext(content: string, keywords: string[]): string {
  // Find sentences that contain the keywords
  const sentences = content.split(/[.!?]+/);
  
  for (const sentence of sentences) {
    for (const keyword of keywords) {
      if (sentence.toLowerCase().includes(keyword.toLowerCase())) {
        return sentence.trim().substring(0, 100) + '...';
      }
    }
  }
  
  return 'Related content';
}

// Helper function to get category from URL
function getCurrentCategory(url: string): string | null {
  const segments = url.split('/').filter(Boolean);
  
  if (segments[0] === 'reviews' || segments[0] === 'compare' || segments[0] === 'best') {
    return segments[1] || null;
  }
  
  return segments[0] || null;
}

// Generate anchor text variations to avoid over-optimization
export function generateAnchorTextVariations(originalTitle: string): string[] {
  const variations = [originalTitle];
  
  // Remove common stop words for shorter variations
  const stopWords = ['review', 'guide', 'best', 'top', '2025', 'complete', 'ultimate'];
  let shortTitle = originalTitle;
  
  stopWords.forEach(word => {
    shortTitle = shortTitle.replace(new RegExp(`\\b${word}\\b`, 'gi'), '').trim();
  });
  
  if (shortTitle !== originalTitle && shortTitle.length > 10) {
    variations.push(shortTitle);
  }
  
  // Add contextual variations
  if (originalTitle.includes('Review')) {
    variations.push(originalTitle.replace('Review', 'Analysis'));
    variations.push(originalTitle.replace('Review', 'Tested'));
  }
  
  if (originalTitle.includes('Best')) {
    variations.push(originalTitle.replace('Best', 'Top'));
    variations.push(originalTitle.replace('Best', 'Recommended'));
  }
  
  return variations.slice(0, 3); // Limit to 3 variations
}

// Automatic internal linking for content
export function addInternalLinksToContent(
  content: string,
  currentUrl: string,
  options: {
    maxLinksPerParagraph?: number;
    maxTotalLinks?: number;
    avoidOverOptimization?: boolean;
  } = {}
): string {
  const {
    maxLinksPerParagraph = 2,
    maxTotalLinks = 8,
    avoidOverOptimization = true
  } = options;

  let modifiedContent = content;
  let totalLinksAdded = 0;
  
  const availableLinks = generateInternalLinks(content, currentUrl, maxTotalLinks * 2);
  const usedAnchors = new Set<string>();

  // Split content into paragraphs
  const paragraphs = content.split('\n\n');
  
  paragraphs.forEach((paragraph, index) => {
    if (totalLinksAdded >= maxTotalLinks) return;
    
    let linksInParagraph = 0;
    let modifiedParagraph = paragraph;
    
    availableLinks.forEach(link => {
      if (totalLinksAdded >= maxTotalLinks || linksInParagraph >= maxLinksPerParagraph) {
        return;
      }
      
      // Generate anchor text variations
      const anchorVariations = generateAnchorTextVariations(link.text);
      
      anchorVariations.forEach(anchor => {
        if (usedAnchors.has(anchor.toLowerCase()) && avoidOverOptimization) return;
        
        const anchorRegex = new RegExp(`\\b${anchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b(?![^<]*>)`, 'gi');
        
        if (anchorRegex.test(modifiedParagraph)) {
          modifiedParagraph = modifiedParagraph.replace(
            anchorRegex,
            `[${anchor}](${link.url})`
          );
          
          usedAnchors.add(anchor.toLowerCase());
          linksInParagraph++;
          totalLinksAdded++;
          return;
        }
      });
    });
    
    paragraphs[index] = modifiedParagraph;
  });
  
  return paragraphs.join('\n\n');
}

// SEO-optimized navigation menu
export function generateNavigationLinks(): Array<{
  name: string;
  url: string;
  children?: Array<{name: string, url: string}>;
}> {
  return [
    {
      name: 'Reviews',
      url: '/reviews',
      children: [
        { name: 'Smartphones', url: '/reviews/smartphones' },
        { name: 'Laptops', url: '/reviews/laptops' },
        { name: 'Headphones', url: '/reviews/headphones' },
        { name: 'Smart Watches', url: '/reviews/smartwatches' },
        { name: 'Tablets', url: '/reviews/tablets' }
      ]
    },
    {
      name: 'Comparisons',
      url: '/compare',
      children: [
        { name: 'Phone Comparisons', url: '/compare/smartphones' },
        { name: 'Laptop Comparisons', url: '/compare/laptops' },
        { name: 'Brand Battles', url: '/compare/brands' }
      ]
    },
    {
      name: 'Best Of 2025',
      url: '/best',
      children: [
        { name: 'Best Smartphones', url: '/best/smartphones/2025' },
        { name: 'Best Laptops', url: '/best/laptops/2025' },
        { name: 'Best Headphones', url: '/best/headphones/2025' },
        { name: 'Best Budget Picks', url: '/best/budget/2025' }
      ]
    },
    {
      name: 'Guides',
      url: '/guides',
      children: [
        { name: 'Buying Guides', url: '/guides/buying' },
        { name: 'How-To Guides', url: '/guides/how-to' },
        { name: 'Setup Guides', url: '/guides/setup' }
      ]
    },
    {
      name: 'News',
      url: '/news'
    }
  ];
}