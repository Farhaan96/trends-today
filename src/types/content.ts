export interface Product {
  name: string;
  brand: string;
  model?: string;
  category: string;
  price: {
    amount: number;
    currency: string;
    date?: string;
    retailer?: string;
    url?: string;
  };
  specs?: Record<string, string | number>;
  images?: Array<{
    url: string;
    alt: string;
    caption?: string;
  }>;
  keyFeatures?: string[];
  keySpecs?: Record<string, string | number>;
}

export interface ReviewContent {
  title: string;
  slug: string;
  product: Product;
  score: {
    overall: number;
    breakdown: {
      design?: number;
      performance?: number;
      features?: number;
      value?: number;
    };
  };
  testedClaims: Array<{
    claim: string;
    result: string;
    methodology: string;
    evidence?: string;
  }>;
  prosAndCons?: {
    pros: string[];
    cons: string[];
  };
  howWeTested: string;
  verdict: string;
  alternatives?: Array<{
    name: string;
    reason: string;
    link?: string;
  }>;
  sources: Array<{
    title: string;
    url: string;
    accessDate?: string;
  }>;
  seo?: SEOData;
  lastUpdated: string;
  author?: Author;
}

export interface ComparisonContent {
  title: string;
  slug: string;
  productA: Product;
  productB: Product;
  comparisonTable: Array<{
    category: string;
    productA: string;
    productB: string;
    winner: 'productA' | 'productB' | 'tie';
    explanation?: string;
  }>;
  verdict: {
    winner: 'productA' | 'productB' | 'depends';
    reasoning: string;
    bestFor?: {
      productA: string[];
      productB: string[];
    };
  };
  pricingCalculator?: {
    scenarios: Array<{
      name: string;
      productA: Record<string, string | number>;
      productB: Record<string, string | number>;
    }>;
  };
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
  sources: Array<{
    title: string;
    url: string;
    accessDate?: string;
  }>;
  seo?: SEOData;
  lastUpdated: string;
}

export interface BuyingGuideContent {
  title: string;
  slug: string;
  category: string;
  year: number;
  introduction?: string;
  buyingCriteria?: Array<{
    factor: string;
    importance: 'high' | 'medium' | 'low';
    explanation: string;
    tips?: string[];
  }>;
  recommendations: Array<{
    rank: number;
    product: Product;
    category: string;
    score: {
      overall: number;
      breakdown?: Record<string, number>;
    };
    verdict: {
      summary: string;
      bestFor: string[];
      pros?: string[];
      cons?: string[];
    };
    testingNotes?: string;
    alternatives?: Array<{
      name: string;
      reason: string;
    }>;
  }>;
  howWeTested: string;
  frequentlyAskedQuestions?: Array<{
    question: string;
    answer: string;
  }>;
  budgetBreakdown?: {
    budget?: {
      range: string;
      recommendations: string[];
    };
    midRange?: {
      range: string;
      recommendations: string[];
    };
    premium?: {
      range: string;
      recommendations: string[];
    };
  };
  sources: Array<{
    title: string;
    url: string;
    accessDate?: string;
  }>;
  seo?: SEOData;
  lastUpdated: string;
  nextUpdate?: string;
}

export interface NewsContent {
  title: string;
  slug: string;
  summary: string;
  content?: string;
  category: 
    | 'smartphones'
    | 'laptops'
    | 'gaming'
    | 'ai'
    | 'enterprise'
    | 'security'
    | 'startups'
    | 'acquisitions'
    | 'product-launches'
    | 'industry-analysis';
  tags?: string[];
  publishedAt: string;
  lastUpdated: string;
  author?: Author;
  sources: Array<{
    title: string;
    url: string;
    publisher: string;
    publishedAt?: string;
    accessDate?: string;
  }>;
  relatedProducts?: Array<{
    name: string;
    category: string;
    relevance?: string;
  }>;
  impact?: {
    industry?: string;
    consumers?: string;
    competitors?: string;
  };
  quotes?: Array<{
    text: string;
    source: string;
    title?: string;
    company?: string;
  }>;
  timeline?: Array<{
    date: string;
    event: string;
  }>;
  seo?: SEOData;
  socialMedia?: {
    twitterCard?: string;
    ogImage?: string;
    ogDescription?: string;
  };
  urgency?: 'breaking' | 'important' | 'standard';
  correction?: {
    date: string;
    reason: string;
    changes: string;
  };
}

export interface SEOData {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;
  newsKeywords?: string[];
}

export interface Author {
  name: string;
  bio?: string;
  expertise?: string[];
  twitter?: string;
}

export type ContentType = 'review' | 'comparison' | 'buying-guide' | 'news';

export interface ContentMetadata {
  id: string;
  type: ContentType;
  slug: string;
  title: string;
  status: 'pending' | 'draft' | 'review' | 'published';
  keywords?: string[];
  metadata?: Record<string, string | number>;
  sources?: Array<{ title: string; url: string }>;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}