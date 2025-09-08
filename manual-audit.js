require('dotenv').config({ path: '.env.local' });

async function simpleAudit() {
  console.log('🔍 MANUAL WEBSITE AUDIT');
  console.log('Analyzing key pages with rate-limited requests...\n');

  const results = {
    pages: [],
    criticalIssues: [],
    recommendations: []
  };

  // Helper function for basic scraping
  async function scrapeBasic(url, delay = 3000) {
    try {
      console.log(`Scraping: ${url}`);
      
      const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
        },
        body: JSON.stringify({
          url: url,
          formats: ['markdown']
        }),
      });

      if (response.status === 429) {
        console.log('Rate limited - waiting 60 seconds...');
        await new Promise(resolve => setTimeout(resolve, 60000));
        return await scrapeBasic(url, delay);
      }

      if (!response.ok) {
        console.log(`Error ${response.status} for ${url}`);
        return null;
      }

      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ Scraped: ${data.data.metadata?.title || 'Untitled'}`);
        
        // Wait before next request
        await new Promise(resolve => setTimeout(resolve, delay));
        return data.data;
      } else {
        console.log(`❌ Failed: ${url}`);
        return null;
      }
    } catch (error) {
      console.error(`Error scraping ${url}:`, error.message);
      return null;
    }
  }

  // Analyze with Perplexity
  async function analyzeWithPerplexity(content, analysisType, url) {
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'sonar-pro',
          messages: [
            {
              role: 'system',
              content: 'You are a website content auditor specializing in tech review sites. Analyze content for accuracy, completeness, and current best practices.'
            },
            {
              role: 'user',
              content: `Analyze this ${analysisType} content from ${url}:

${content}

Provide a detailed analysis focusing on:
1. Content accuracy and currentness
2. Missing or placeholder images
3. Navigation and user experience issues
4. SEO and accessibility concerns
5. Trust signals and credibility
6. Specific technical inaccuracies if any
7. Overall content quality rating (1-10)

Be specific and actionable in your recommendations.`
            }
          ],
          max_tokens: 800,
          temperature: 0.2
        }),
      });

      const data = await response.json();
      return data.choices?.[0]?.message?.content || null;
    } catch (error) {
      console.error('Perplexity analysis error:', error.message);
      return null;
    }
  }

  // 1. Audit Homepage
  console.log('\n=== 1. HOMEPAGE AUDIT ===');
  const homepage = await scrapeBasic('https://www.trendstoday.ca');
  if (homepage) {
    const homepageAnalysis = await analyzeWithPerplexity(
      homepage.markdown.substring(0, 2000),
      'homepage',
      'https://www.trendstoday.ca'
    );
    
    results.pages.push({
      url: 'https://www.trendstoday.ca',
      type: 'homepage',
      title: homepage.metadata?.title,
      analysis: homepageAnalysis,
      content: homepage.markdown.substring(0, 1000)
    });
    
    console.log('Homepage Analysis:', homepageAnalysis);
  }

  // 2. Audit iPhone 17 Air article (our new article)
  console.log('\n=== 2. NEW ARTICLE AUDIT (iPhone 17 Air) ===');
  const newArticle = await scrapeBasic('https://www.trendstoday.ca/news/iphone-17-air-announcement-what-to-expect');
  if (newArticle) {
    const articleAnalysis = await analyzeWithPerplexity(
      newArticle.markdown.substring(0, 3000),
      'iPhone 17 Air news article',
      'https://www.trendstoday.ca/news/iphone-17-air-announcement-what-to-expect'
    );
    
    results.pages.push({
      url: 'https://www.trendstoday.ca/news/iphone-17-air-announcement-what-to-expect',
      type: 'news-article',
      title: newArticle.metadata?.title,
      analysis: articleAnalysis,
      content: newArticle.markdown.substring(0, 1500)
    });
    
    console.log('iPhone 17 Air Article Analysis:', articleAnalysis);
  }

  // 3. Audit a review article
  console.log('\n=== 3. REVIEW ARTICLE AUDIT ===');
  const reviewArticle = await scrapeBasic('https://www.trendstoday.ca/reviews/iphone-15-pro-max-review');
  if (reviewArticle) {
    const reviewAnalysis = await analyzeWithPerplexity(
      reviewArticle.markdown.substring(0, 3000),
      'iPhone 15 Pro Max review',
      'https://www.trendstoday.ca/reviews/iphone-15-pro-max-review'
    );
    
    results.pages.push({
      url: 'https://www.trendstoday.ca/reviews/iphone-15-pro-max-review',
      type: 'review',
      title: reviewArticle.metadata?.title,
      analysis: reviewAnalysis,
      content: reviewArticle.markdown.substring(0, 1500)
    });
    
    console.log('iPhone 15 Pro Max Review Analysis:', reviewAnalysis);
  }

  // 4. Check Authors page
  console.log('\n=== 4. AUTHORS PAGE AUDIT ===');
  const authorsPage = await scrapeBasic('https://www.trendstoday.ca/authors');
  if (authorsPage) {
    const authorsAnalysis = await analyzeWithPerplexity(
      authorsPage.markdown.substring(0, 2000),
      'authors page',
      'https://www.trendstoday.ca/authors'
    );
    
    results.pages.push({
      url: 'https://www.trendstoday.ca/authors',
      type: 'authors',
      title: authorsPage.metadata?.title,
      analysis: authorsAnalysis,
      content: authorsPage.markdown.substring(0, 1000)
    });
    
    console.log('Authors Page Analysis:', authorsAnalysis);
  }

  // 5. Analyze all results for critical issues
  console.log('\n=== 5. IDENTIFYING CRITICAL ISSUES ===');
  
  const criticalIssues = [];
  
  results.pages.forEach(page => {
    // Check for placeholder images
    if (page.content?.includes('/file.svg')) {
      criticalIssues.push({
        page: page.url,
        type: 'CRITICAL',
        issue: 'Using placeholder SVG images instead of actual content',
        impact: 'Poor user experience, unprofessional appearance'
      });
    }

    // Check for broken links or missing content
    if (page.content?.includes('404') || page.content?.includes('Not Found')) {
      criticalIssues.push({
        page: page.url,
        type: 'CRITICAL',
        issue: 'Page contains 404 or missing content references',
        impact: 'Broken user experience'
      });
    }

    // Check for outdated dates
    if (page.content?.includes('2023') || page.content?.includes('2024')) {
      criticalIssues.push({
        page: page.url,
        type: 'HIGH',
        issue: 'Content references potentially outdated years',
        impact: 'Content may appear stale'
      });
    }
  });

  results.criticalIssues = criticalIssues;

  // 6. Generate comprehensive recommendations
  console.log('\n=== 6. GENERATING RECOMMENDATIONS ===');
  
  const recommendations = [
    {
      priority: 'CRITICAL',
      category: 'Images',
      issue: 'All placeholder images (/file.svg) need replacement',
      action: 'Create or source high-quality product photos, screenshots, and graphics for every article',
      effort: 'High - requires design/photography work',
      impact: 'Massive improvement in professionalism and user trust'
    },
    {
      priority: 'CRITICAL',
      category: 'Content Accuracy',
      issue: 'Tech specifications and product details may be outdated',
      action: 'Fact-check all product specs, prices, and availability across all articles',
      effort: 'Medium - systematic content review',
      impact: 'Essential for credibility and user trust'
    },
    {
      priority: 'HIGH',
      category: 'SEO & Accessibility',
      issue: 'Missing alt text and image optimization',
      action: 'Add descriptive alt text to all images, optimize file sizes',
      effort: 'Medium - systematic image audit',
      impact: 'Better SEO rankings and accessibility compliance'
    },
    {
      priority: 'HIGH',
      category: 'Navigation',
      issue: 'News article routing may not work properly',
      action: 'Test all internal links, ensure /news/[slug] routes work correctly',
      effort: 'Low - technical testing and fixes',
      impact: 'Improved user experience and reduced bounce rate'
    },
    {
      priority: 'MEDIUM',
      category: 'Trust Signals',
      issue: 'Author credibility could be enhanced',
      action: 'Add author photos, credentials, social links, and expertise indicators',
      effort: 'Medium - content creation and design',
      impact: 'Increased authority and user trust'
    }
  ];

  results.recommendations = recommendations;

  // 7. Output comprehensive report
  console.log('\n' + '='.repeat(60));
  console.log('🎯 COMPREHENSIVE AUDIT RESULTS');
  console.log('='.repeat(60));
  
  console.log(`\n📊 OVERVIEW:`);
  console.log(`- Pages analyzed: ${results.pages.length}`);
  console.log(`- Critical issues: ${criticalIssues.length}`);
  console.log(`- Recommendations: ${recommendations.length}`);

  console.log(`\n🚨 CRITICAL ISSUES:`);
  criticalIssues.forEach((issue, index) => {
    console.log(`${index + 1}. [${issue.type}] ${issue.page}`);
    console.log(`   Issue: ${issue.issue}`);
    console.log(`   Impact: ${issue.impact}`);
  });

  console.log(`\n📋 ACTION PLAN (by priority):`);
  recommendations.forEach((rec, index) => {
    console.log(`\n${index + 1}. [${rec.priority}] ${rec.category}`);
    console.log(`   Issue: ${rec.issue}`);
    console.log(`   Action: ${rec.action}`);
    console.log(`   Effort: ${rec.effort}`);
    console.log(`   Impact: ${rec.impact}`);
  });

  // Save detailed results
  const fs = require('fs');
  fs.writeFileSync('detailed-audit-results.json', JSON.stringify(results, null, 2));
  console.log(`\n💾 Detailed results saved to: detailed-audit-results.json`);

  console.log('\n✅ AUDIT COMPLETE - Ready for implementation!');
}

simpleAudit();