import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    
    if (!apiKey || apiKey.includes('your-api-key')) {
      return NextResponse.json({
        success: false,
        error: 'Firecrawl API key not configured'
      });
    }

    console.log('🔍 Analyzing TechRadar.com layout and structure...');
    
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url: 'https://www.techradar.com/',
        formats: ['markdown'],
        onlyMainContent: true,
        timeout: 30000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.success || !data.data?.markdown) {
      throw new Error('No content returned from TechRadar');
    }

    const markdown = data.data.markdown;
    
    // Analyze the content structure
    const analysis = analyzeContent(markdown);
    const articles = extractArticles(markdown);
    const navigation = extractNavigation(markdown);
    const uiInsights = generateUIInsights(markdown, data.data.metadata);

    return NextResponse.json({
      success: true,
      url: 'https://www.techradar.com/',
      title: data.data.metadata?.title || 'TechRadar',
      contentLength: markdown.length,
      analysis,
      sampleArticles: articles.slice(0, 8),
      navigation: navigation.slice(0, 10),
      uiInsights,
      recommendations: generateRecommendations(analysis, uiInsights),
      scrapedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('TechRadar analysis failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

function analyzeContent(markdown: string) {
  const lines = markdown.split('\n');
  const headings = markdown.match(/^#{1,6}\s+.+$/gm) || [];
  const links = markdown.match(/\[([^\]]+)\]/g) || [];
  const images = markdown.match(/!\[[^\]]*\]/g) || [];
  
  return {
    totalLines: lines.length,
    headingCount: headings.length,
    linkCount: links.length,
    imageCount: images.length,
    hasHeroSection: markdown.toLowerCase().includes('hero') || markdown.includes('featured'),
    hasSidebar: markdown.toLowerCase().includes('sidebar') || markdown.toLowerCase().includes('latest'),
    contentDensity: markdown.length > 15000 ? 'high' : markdown.length > 8000 ? 'medium' : 'low'
  };
}

function extractArticles(markdown: string) {
  const articles: Array<{title: string, type: string}> = [];
  
  // Extract headings that look like article titles
  const headingRegex = /^#{1,4}\s+(.+)$/gm;
  let match;
  
  while ((match = headingRegex.exec(markdown)) !== null) {
    const title = match[1].trim();
    
    // Skip navigation/generic headings
    if (title.length > 10 && !title.match(/^(Home|News|Reviews|About|Contact|Menu|Search)$/i)) {
      const type = determineArticleType(title);
      articles.push({ title, type });
    }
  }
  
  return articles;
}

function extractNavigation(markdown: string) {
  const navItems: string[] = [];
  
  // Look for navigation-like links
  const navRegex = /\[([^\]]+)\]\([^)]+\)/g;
  let match;
  
  while ((match = navRegex.exec(markdown)) !== null) {
    const linkText = match[1].trim();
    
    // Filter for likely navigation items
    if (linkText.match(/^(Reviews|News|Buying|Best|Compare|How to|Guide|Analysis|Opinion)/i)) {
      navItems.push(linkText);
    }
  }
  
  return [...new Set(navItems)]; // Remove duplicates
}

function determineArticleType(title: string): string {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('review') || titleLower.includes('tested')) return 'review';
  if (titleLower.includes('vs') || titleLower.includes('compare')) return 'comparison';
  if (titleLower.includes('best') || titleLower.includes('guide')) return 'buying-guide';
  if (titleLower.includes('leak') || titleLower.includes('rumor') || titleLower.includes('announce')) return 'news';
  if (titleLower.includes('how to') || titleLower.includes('tutorial')) return 'tutorial';
  
  return 'article';
}

function generateUIInsights(markdown: string, metadata: any) {
  const insights = {
    layoutStructure: 'unknown',
    contentTypes: [] as string[],
    designPatterns: [] as string[],
    userEngagement: [] as string[]
  };
  
  // Analyze layout structure
  if (markdown.includes('hero') || markdown.includes('featured')) {
    insights.layoutStructure = 'hero-based';
    insights.designPatterns.push('Hero section with featured content');
  }
  
  if (markdown.includes('sidebar') || markdown.includes('latest')) {
    insights.designPatterns.push('Sidebar with latest content');
  }
  
  // Content types found
  const contentTypes = new Set<string>();
  if (markdown.toLowerCase().includes('review')) contentTypes.add('Reviews');
  if (markdown.toLowerCase().includes('news')) contentTypes.add('News');
  if (markdown.toLowerCase().includes('guide')) contentTypes.add('Guides');
  if (markdown.toLowerCase().includes('compare')) contentTypes.add('Comparisons');
  
  insights.contentTypes = Array.from(contentTypes);
  
  // User engagement features
  if (markdown.includes('comment') || markdown.includes('share')) {
    insights.userEngagement.push('Social sharing and comments');
  }
  
  if (markdown.includes('newsletter') || markdown.includes('subscribe')) {
    insights.userEngagement.push('Newsletter subscription');
  }
  
  return insights;
}

function generateRecommendations(analysis: any, uiInsights: any) {
  const recommendations: string[] = [];
  
  if (analysis.hasHeroSection) {
    recommendations.push('✅ Keep hero section - effective for featuring main content');
  } else {
    recommendations.push('💡 Consider adding a hero section for featured articles');
  }
  
  if (analysis.hasSidebar) {
    recommendations.push('✅ Sidebar approach works well - keep latest news/popular content');
  }
  
  if (analysis.contentDensity === 'high') {
    recommendations.push('⚖️ High content density - consider better visual hierarchy');
  }
  
  if (uiInsights.contentTypes.includes('Reviews') && uiInsights.contentTypes.includes('News')) {
    recommendations.push('✅ Reviews + News mix is effective - maintain balance');
  }
  
  recommendations.push('🎨 Consider card-based layout for article previews');
  recommendations.push('📱 Ensure mobile-responsive grid system');
  
  return recommendations;
}

export const dynamic = 'force-dynamic';