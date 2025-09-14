import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface ContentStats {
  totalArticles: number;
  articlesByType: Record<string, number>;
  recentArticles: Array<{
    title: string;
    type: string;
    publishedAt: string;
    slug: string;
  }>;
  qualityMetrics: {
    averageScore: number;
    validArticles: number;
    articlesNeedingReview: number;
  };
}

interface AutomationStats {
  lastRun: string;
  newsOpportunities: number;
  seoOpportunities: number;
  trackedProducts: number;
  generationSuccess: number;
}

export async function GET(_request: NextRequest) {
  try {
    // Get content statistics
    const contentStats = await getContentStats();
    
    // Get automation statistics
    const automationStats = await getAutomationStats();
    
    // Get quality metrics
    const qualityMetrics = await getQualityMetrics();
    
    // Growth projections (simulated for demo)
    const growthProjections = getGrowthProjections();

    return NextResponse.json({
      success: true,
      data: {
        content: contentStats,
        automation: automationStats,
        quality: qualityMetrics,
        growth: growthProjections,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (_error) {
    console.error('Analytics dashboard error:', _error);
    
    return NextResponse.json({
      success: false,
      error: _error instanceof Error ? _error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

async function getContentStats(): Promise<ContentStats> {
  const contentDir = path.join(process.cwd(), 'content');
  const stats: ContentStats = {
    totalArticles: 0,
    articlesByType: {},
    recentArticles: [],
    qualityMetrics: {
      averageScore: 0,
      validArticles: 0,
      articlesNeedingReview: 0
    }
  };

  try {
    const contentTypes = ['news', 'reviews', 'compare', 'best', 'guides'];
    
    for (const type of contentTypes) {
      const typeDir = path.join(contentDir, type);
      
      try {
        const files = await fs.readdir(typeDir);
        const mdxFiles = files.filter(file => file.endsWith('.mdx'));
        
        stats.articlesByType[type] = mdxFiles.length;
        stats.totalArticles += mdxFiles.length;
        
        // Get recent articles from this type
        for (const file of mdxFiles.slice(-3)) { // Last 3 files
          const filePath = path.join(typeDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const frontmatter = parseFrontmatter(content);
          
          if (frontmatter.title) {
            stats.recentArticles.push({
              title: frontmatter.title,
              type: type,
              publishedAt: frontmatter.publishedAt || new Date().toISOString(),
              slug: file.replace('.mdx', '')
            });
          }
        }
        
      } catch (_error) {
        // Directory doesn't exist or is empty
        stats.articlesByType[type] = 0;
      }
    }
    
    // Sort recent articles by date
    stats.recentArticles.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    stats.recentArticles = stats.recentArticles.slice(0, 10);
    
  } catch (error) {
    console.error('Error getting content stats:', error);
  }

  return stats;
}

async function getAutomationStats(): Promise<AutomationStats> {
  const dataDir = path.join(process.cwd(), 'data');
  const stats: AutomationStats = {
    lastRun: new Date().toISOString(),
    newsOpportunities: 0,
    seoOpportunities: 0,
    trackedProducts: 0,
    generationSuccess: 85 // Simulated success rate
  };

  try {
    // Check news opportunities
    try {
      const newsFile = path.join(dataDir, 'news-opportunities.json');
      const newsData = await fs.readFile(newsFile, 'utf-8');
      const newsOpportunities = JSON.parse(newsData);
      stats.newsOpportunities = Array.isArray(newsOpportunities) ? newsOpportunities.length : 0;
    } catch (error) {
      // File doesn't exist
    }

    // Check SEO opportunities
    try {
      const seoFile = path.join(dataDir, 'seo-opportunities.json');
      const seoData = await fs.readFile(seoFile, 'utf-8');
      const seoOpportunities = JSON.parse(seoData);
      stats.seoOpportunities = seoOpportunities.totalOpportunities || 0;
    } catch (error) {
      // File doesn't exist
    }

    // Check tracked products
    try {
      const trackingFile = path.join(dataDir, 'product-tracking.json');
      const trackingData = await fs.readFile(trackingFile, 'utf-8');
      const tracking = JSON.parse(trackingData);
      stats.trackedProducts = tracking.stats?.total || 0;
    } catch (error) {
      // File doesn't exist
    }

  } catch (error) {
    console.error('Error getting automation stats:', error);
  }

  return stats;
}

async function getQualityMetrics() {
  const reportsDir = path.join(process.cwd(), 'reports');
  
  try {
    const reportFile = path.join(reportsDir, 'quality-report.json');
    const reportData = await fs.readFile(reportFile, 'utf-8');
    const report = JSON.parse(reportData);
    
    return {
      averageScore: Math.round(report.summary.averageScore),
      totalFiles: report.summary.totalFiles,
      validFiles: report.summary.validFiles,
      criticalIssues: report.issues.critical,
      warnings: report.issues.warning,
      goodFiles: report.issues.good,
      lastReport: report.generatedAt,
      topIssues: report.recommendations.slice(0, 3)
    };
    
  } catch (error) {
    // No quality report available
    return {
      averageScore: 0,
      totalFiles: 0,
      validFiles: 0,
      criticalIssues: 0,
      warnings: 0,
      goodFiles: 0,
      lastReport: null,
      topIssues: []
    };
  }
}

function getGrowthProjections() {
  // Simulated growth projections based on content strategy
  const now = new Date();
  const projections = [];
  
  for (let i = 0; i < 12; i++) {
    const month = new Date(now);
    month.setMonth(month.getMonth() + i);
    
    // Projected monthly organic visitors (exponential growth)
    const baseVisitors = 1000;
    const growthRate = 1.4; // 40% monthly growth
    const visitors = Math.round(baseVisitors * Math.pow(growthRate, i));
    
    // Articles published per month
    const articlesPerMonth = 90 + (i * 10); // Increasing content velocity
    
    projections.push({
      month: month.toISOString().substring(0, 7), // YYYY-MM format
      organicVisitors: Math.min(visitors, 35000), // Cap at 35k
      articlesPublished: articlesPerMonth,
      keywordRankings: Math.min(50 + (i * 15), 500), // Growing keyword portfolio
      avgPosition: Math.max(15 - i, 3) // Improving average ranking
    });
  }
  
  return projections;
}

function parseFrontmatter(content: string) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return {};
  }

  const frontmatterText = match[1];
  const frontmatter: Record<string, any> = {};
  
  // Simple YAML parsing for our needs
  frontmatterText.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
      frontmatter[key] = value;
    }
  });

  return frontmatter;
}

export const dynamic = 'force-dynamic';