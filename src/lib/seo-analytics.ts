// SEO Analytics and Performance Tracking

export interface SEOMetrics {
  pageUrl: string;
  title: string;
  description: string;
  keywords: string[];
  wordCount: number;
  readingTime: number;
  lastModified: string;
  schema: string[];
  images: number;
  internalLinks: number;
  externalLinks: number;
  headings: {
    h1: number;
    h2: number;
    h3: number;
    h4: number;
  };
  seoScore: number;
  issues: string[];
  suggestions: string[];
}

export interface SEOPerformanceData {
  url: string;
  timestamp: number;
  metrics: {
    // Core Web Vitals
    lcp?: number; // Largest Contentful Paint
    fid?: number; // First Input Delay
    cls?: number; // Cumulative Layout Shift
    fcp?: number; // First Contentful Paint
    ttfb?: number; // Time to First Byte
    
    // SEO Metrics
    seoScore: number;
    metaOptimization: number;
    contentQuality: number;
    technicalSEO: number;
    
    // Search Performance (would come from Search Console API)
    impressions?: number;
    clicks?: number;
    avgPosition?: number;
    ctr?: number;
    
    // Engagement Metrics
    bounceRate?: number;
    timeOnPage?: number;
    pageViews?: number;
    socialShares?: number;
  };
  rankings?: Array<{
    keyword: string;
    position: number;
    searchVolume?: number;
    difficulty?: number;
  }>;
}

// Track SEO events and metrics
export class SEOTracker {
  private static instance: SEOTracker;
  private events: Array<any> = [];
  private sessionId: string;

  constructor() {
    this.sessionId = Math.random().toString(36).substring(2, 15);
  }

  static getInstance(): SEOTracker {
    if (!SEOTracker.instance) {
      SEOTracker.instance = new SEOTracker();
    }
    return SEOTracker.instance;
  }

  // Track page view with SEO metrics
  trackPageView(url: string, seoMetrics: Partial<SEOMetrics>) {
    const event = {
      type: 'page_view',
      url,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      seoMetrics,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      referrer: typeof document !== 'undefined' ? document.referrer : ''
    };

    this.events.push(event);
    this.sendToAnalytics(event);
  }

  // Track SEO interactions
  trackSEOInteraction(type: 'internal_link_click' | 'external_link_click' | 'image_view' | 'schema_impression', data: any) {
    const event = {
      type,
      data,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      url: typeof window !== 'undefined' ? window.location.href : ''
    };

    this.events.push(event);
    this.sendToAnalytics(event);
  }

  // Track search performance metrics
  trackSearchPerformance(data: SEOPerformanceData) {
    const event = {
      type: 'seo_performance',
      ...data,
      sessionId: this.sessionId
    };

    this.sendToAnalytics(event);
  }

  // Track Core Web Vitals
  trackWebVital(name: string, value: number, id: string, delta: number) {
    const event = {
      type: 'web_vital',
      name,
      value,
      id,
      delta,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      url: typeof window !== 'undefined' ? window.location.href : ''
    };

    this.events.push(event);
    this.sendToAnalytics(event);
  }

  // Send events to analytics endpoint
  private async sendToAnalytics(event: any) {
    try {
      if (typeof fetch !== 'undefined') {
        await fetch('/api/seo-analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        });
      }
    } catch (error) {
      console.error('Failed to send SEO analytics:', error);
    }
  }

  // Get session events
  getSessionEvents(): Array<any> {
    return [...this.events];
  }
}

// Extract SEO metrics from page content
export function extractSEOMetrics(
  content: string,
  metadata: {
    title: string;
    description: string;
    keywords?: string[];
    url: string;
  }
): SEOMetrics {
  const wordCount = content.trim().split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200); // 200 words per minute
  
  // Count headings
  const headings = {
    h1: (content.match(/^# /gm) || []).length,
    h2: (content.match(/^## /gm) || []).length,
    h3: (content.match(/^### /gm) || []).length,
    h4: (content.match(/^#### /gm) || []).length,
  };

  // Count images
  const images = (content.match(/!\[.*?\]\(/g) || []).length;

  // Count links
  const internalLinks = (content.match(/\]\(\/[^)]*\)/g) || []).length;
  const externalLinks = (content.match(/\]\(https?:\/\/[^)]*\)/g) || []).length;

  // Detect schema types (basic detection)
  const schema: string[] = [];
  if (content.includes('rating') || content.includes('review')) schema.push('Review');
  if (content.includes('price') || content.includes('$')) schema.push('Product');
  if (content.includes('question') || content.includes('answer')) schema.push('FAQ');
  
  // Calculate basic SEO score (simplified)
  let seoScore = 100;
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Title checks
  if (metadata.title.length < 30) {
    issues.push('Title too short');
    seoScore -= 10;
  }
  if (metadata.title.length > 60) {
    issues.push('Title too long');
    seoScore -= 10;
  }

  // Description checks
  if (metadata.description.length < 120) {
    issues.push('Meta description too short');
    seoScore -= 10;
  }
  if (metadata.description.length > 160) {
    issues.push('Meta description too long');
    seoScore -= 10;
  }

  // Content checks
  if (wordCount < 300) {
    issues.push('Content too short');
    seoScore -= 15;
  }
  if (headings.h1 === 0) {
    issues.push('No H1 heading');
    seoScore -= 15;
  }
  if (headings.h2 < 2) {
    issues.push('Too few H2 headings');
    seoScore -= 10;
  }
  if (images === 0) {
    issues.push('No images');
    seoScore -= 10;
  }

  // Suggestions
  if (internalLinks < 3) {
    suggestions.push('Add more internal links');
  }
  if (schema.length === 0) {
    suggestions.push('Add structured data');
  }

  return {
    pageUrl: metadata.url,
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords || [],
    wordCount,
    readingTime,
    lastModified: new Date().toISOString(),
    schema,
    images,
    internalLinks,
    externalLinks,
    headings,
    seoScore: Math.max(0, seoScore),
    issues,
    suggestions
  };
}

// Generate SEO audit report
export function generateSEOAuditReport(
  pages: SEOMetrics[]
): {
  overallScore: number;
  summary: {
    totalPages: number;
    pagesWithIssues: number;
    avgWordCount: number;
    avgSEOScore: number;
  };
  topIssues: Array<{ issue: string; count: number; pages: string[] }>;
  recommendations: string[];
  performance: {
    bestPages: Array<{ url: string; score: number }>;
    worstPages: Array<{ url: string; score: number; issues: string[] }>;
  };
} {
  const totalPages = pages.length;
  const pagesWithIssues = pages.filter(page => page.issues.length > 0).length;
  const avgWordCount = pages.reduce((sum, page) => sum + page.wordCount, 0) / totalPages;
  const avgSEOScore = pages.reduce((sum, page) => sum + page.seoScore, 0) / totalPages;

  // Collect and count issues
  const issueMap = new Map<string, { count: number; pages: string[] }>();
  pages.forEach(page => {
    page.issues.forEach(issue => {
      const existing = issueMap.get(issue);
      if (existing) {
        existing.count++;
        existing.pages.push(page.pageUrl);
      } else {
        issueMap.set(issue, { count: 1, pages: [page.pageUrl] });
      }
    });
  });

  const topIssues = Array.from(issueMap.entries())
    .map(([issue, data]) => ({ issue, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Generate recommendations
  const recommendations: string[] = [];
  
  if (avgWordCount < 600) {
    recommendations.push('Increase average content length to 600+ words');
  }
  
  if (topIssues.find(issue => issue.issue.includes('H1'))) {
    recommendations.push('Ensure all pages have proper H1 headings');
  }
  
  if (topIssues.find(issue => issue.issue.includes('images'))) {
    recommendations.push('Add relevant images to pages lacking visual content');
  }

  if (avgSEOScore < 80) {
    recommendations.push('Focus on improving overall SEO scores across all pages');
  }

  // Best and worst performing pages
  const sortedPages = [...pages].sort((a, b) => b.seoScore - a.seoScore);
  const bestPages = sortedPages.slice(0, 5).map(page => ({
    url: page.pageUrl,
    score: page.seoScore
  }));
  
  const worstPages = sortedPages.slice(-5).map(page => ({
    url: page.pageUrl,
    score: page.seoScore,
    issues: page.issues
  }));

  return {
    overallScore: Math.round(avgSEOScore),
    summary: {
      totalPages,
      pagesWithIssues,
      avgWordCount: Math.round(avgWordCount),
      avgSEOScore: Math.round(avgSEOScore)
    },
    topIssues,
    recommendations,
    performance: {
      bestPages,
      worstPages
    }
  };
}

// Monitor search rankings (would integrate with external APIs)
export async function monitorSearchRankings(
  keywords: string[],
  domain: string
): Promise<Array<{
  keyword: string;
  position: number;
  url: string;
  searchVolume?: number;
  difficulty?: number;
}>> {
  // This would integrate with services like:
  // - Google Search Console API
  // - SEMrush API
  // - Ahrefs API
  // - SERPApi
  
  // Mock implementation for demonstration
  return keywords.map(keyword => ({
    keyword,
    position: Math.floor(Math.random() * 100) + 1,
    url: `${domain}/search-result-for-${keyword.replace(/\s+/g, '-')}`,
    searchVolume: Math.floor(Math.random() * 10000) + 100,
    difficulty: Math.floor(Math.random() * 100) + 1
  }));
}

// Generate SEO performance report
export function generatePerformanceReport(
  data: SEOPerformanceData[]
): {
  period: { start: string; end: string };
  metrics: {
    avgSEOScore: number;
    avgLCP: number;
    avgFID: number;
    avgCLS: number;
    totalImpressions: number;
    totalClicks: number;
    avgCTR: number;
    avgPosition: number;
  };
  trends: {
    seoScore: 'improving' | 'declining' | 'stable';
    webVitals: 'improving' | 'declining' | 'stable';
    searchPerformance: 'improving' | 'declining' | 'stable';
  };
  topPerformingPages: Array<{ url: string; seoScore: number; clicks: number }>;
  actionItems: string[];
} {
  if (data.length === 0) {
    return {
      period: { start: '', end: '' },
      metrics: {
        avgSEOScore: 0,
        avgLCP: 0,
        avgFID: 0,
        avgCLS: 0,
        totalImpressions: 0,
        totalClicks: 0,
        avgCTR: 0,
        avgPosition: 0
      },
      trends: {
        seoScore: 'stable',
        webVitals: 'stable',
        searchPerformance: 'stable'
      },
      topPerformingPages: [],
      actionItems: []
    };
  }

  const sortedData = data.sort((a, b) => a.timestamp - b.timestamp);
  const start = new Date(sortedData[0].timestamp).toISOString().split('T')[0];
  const end = new Date(sortedData[sortedData.length - 1].timestamp).toISOString().split('T')[0];

  // Calculate averages
  const metrics = {
    avgSEOScore: data.reduce((sum, d) => sum + d.metrics.seoScore, 0) / data.length,
    avgLCP: data.reduce((sum, d) => sum + (d.metrics.lcp || 0), 0) / data.filter(d => d.metrics.lcp).length,
    avgFID: data.reduce((sum, d) => sum + (d.metrics.fid || 0), 0) / data.filter(d => d.metrics.fid).length,
    avgCLS: data.reduce((sum, d) => sum + (d.metrics.cls || 0), 0) / data.filter(d => d.metrics.cls).length,
    totalImpressions: data.reduce((sum, d) => sum + (d.metrics.impressions || 0), 0),
    totalClicks: data.reduce((sum, d) => sum + (d.metrics.clicks || 0), 0),
    avgCTR: data.reduce((sum, d) => sum + (d.metrics.ctr || 0), 0) / data.filter(d => d.metrics.ctr).length,
    avgPosition: data.reduce((sum, d) => sum + (d.metrics.avgPosition || 0), 0) / data.filter(d => d.metrics.avgPosition).length
  };

  // Calculate trends (simplified)
  const midPoint = Math.floor(data.length / 2);
  const firstHalf = data.slice(0, midPoint);
  const secondHalf = data.slice(midPoint);

  const trends = {
    seoScore: calculateTrend(
      firstHalf.reduce((sum, d) => sum + d.metrics.seoScore, 0) / firstHalf.length,
      secondHalf.reduce((sum, d) => sum + d.metrics.seoScore, 0) / secondHalf.length
    ),
    webVitals: calculateTrend(
      firstHalf.reduce((sum, d) => sum + (d.metrics.lcp || 0), 0) / firstHalf.filter(d => d.metrics.lcp).length,
      secondHalf.reduce((sum, d) => sum + (d.metrics.lcp || 0), 0) / secondHalf.filter(d => d.metrics.lcp).length
    ),
    searchPerformance: calculateTrend(
      firstHalf.reduce((sum, d) => sum + (d.metrics.clicks || 0), 0),
      secondHalf.reduce((sum, d) => sum + (d.metrics.clicks || 0), 0)
    )
  };

  // Top performing pages
  const topPerformingPages = data
    .sort((a, b) => (b.metrics.clicks || 0) - (a.metrics.clicks || 0))
    .slice(0, 10)
    .map(d => ({
      url: d.url,
      seoScore: d.metrics.seoScore,
      clicks: d.metrics.clicks || 0
    }));

  // Generate action items
  const actionItems: string[] = [];
  
  if (metrics.avgSEOScore < 70) {
    actionItems.push('Overall SEO scores need improvement - focus on content quality and technical SEO');
  }
  
  if (metrics.avgLCP > 2500) {
    actionItems.push('Improve Largest Contentful Paint (LCP) - optimize images and server response times');
  }
  
  if (metrics.avgCLS > 0.1) {
    actionItems.push('Reduce Cumulative Layout Shift (CLS) - ensure proper image dimensions and avoid layout jumps');
  }
  
  if (metrics.avgCTR < 2) {
    actionItems.push('Improve click-through rates - optimize meta titles and descriptions');
  }

  return {
    period: { start, end },
    metrics,
    trends,
    topPerformingPages,
    actionItems
  };
}

// Helper function to calculate trend
function calculateTrend(oldValue: number, newValue: number): 'improving' | 'declining' | 'stable' {
  const change = ((newValue - oldValue) / oldValue) * 100;
  if (change > 5) return 'improving';
  if (change < -5) return 'declining';
  return 'stable';
}

// Export tracker instance
export const seoTracker = typeof window !== 'undefined' ? SEOTracker.getInstance() : null;