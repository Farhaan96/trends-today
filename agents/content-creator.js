#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

class SmartContentCreator {
  constructor() {
    this.perplexityApiKey = process.env.PERPLEXITY_API_KEY;
    this.firecrawlApiKey = process.env.FIRECRAWL_API_KEY;
    this.dataDir = path.join(__dirname, '..', 'data');
    this.contentDir = path.join(__dirname, '..', 'content');
    
    this.templates = {
      news: this.getNewsTemplate(),
      review: this.getReviewTemplate(),
      comparison: this.getComparisonTemplate(),
      howto: this.getHowToTemplate(),
      best: this.getBestTemplate()
    };
  }

  async ensureDirectories() {
    const dirs = [
      this.dataDir,
      this.contentDir,
      path.join(this.contentDir, 'news'),
      path.join(this.contentDir, 'reviews'),
      path.join(this.contentDir, 'compare'),
      path.join(this.contentDir, 'best'),
      path.join(this.contentDir, 'guides')
    ];

    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error) {
        // Directory exists
      }
    }
  }

  async loadOpportunities() {
    try {
      // Load news opportunities
      const newsFile = path.join(this.dataDir, 'news-opportunities.json');
      let newsOpportunities = [];
      try {
        const newsData = await fs.readFile(newsFile, 'utf-8');
        newsOpportunities = JSON.parse(newsData);
      } catch (error) {
        console.log('No news opportunities found');
      }

      // Load SEO opportunities
      const seoFile = path.join(this.dataDir, 'seo-opportunities.json');
      let seoOpportunities = { zeroVolumeKeywords: [], trendingTopics: [] };
      try {
        const seoData = await fs.readFile(seoFile, 'utf-8');
        seoOpportunities = JSON.parse(seoData);
      } catch (error) {
        console.log('No SEO opportunities found');
      }

      return { news: newsOpportunities, seo: seoOpportunities };

    } catch (error) {
      console.error('Error loading opportunities:', error.message);
      return { news: [], seo: { zeroVolumeKeywords: [], trendingTopics: [] } };
    }
  }

  async enhancedResearch(topic, contentType) {
    if (!this.perplexityApiKey) {
      return this.getDemoResearch(topic, contentType);
    }

    try {
      console.log(`🔍 Conducting enhanced research for: ${topic}`);

      const systemPrompt = `You are a tech research expert writing for a professional tech blog. 
      Provide comprehensive, accurate, and up-to-date information. Focus on facts, specifications, 
      and real-world implications. Always include current market context.`;

      let userPrompt = '';
      switch (contentType) {
        case 'news':
          userPrompt = `Research this tech news topic: "${topic}". Provide:
          1. Key facts and details
          2. Why this matters to consumers/industry
          3. Context and background
          4. Potential impact or implications
          5. Related products or companies mentioned
          Keep it factual and newsworthy.`;
          break;
        case 'review':
          userPrompt = `Research for a comprehensive review of: "${topic}". Provide:
          1. Technical specifications and key features
          2. Current pricing and availability
          3. Main advantages and selling points
          4. Potential drawbacks or limitations
          5. Comparison context with similar products
          6. Target audience and use cases`;
          break;
        case 'comparison':
          userPrompt = `Research for comparing: "${topic}". Provide:
          1. Key differences between the products/options
          2. Specifications comparison
          3. Pricing and value analysis
          4. Pros and cons of each option
          5. Recommendation criteria for different users`;
          break;
        case 'howto':
          userPrompt = `Research for a how-to guide about: "${topic}". Provide:
          1. Step-by-step process overview
          2. Required tools or prerequisites
          3. Common challenges or troubleshooting
          4. Best practices and tips
          5. Alternative methods if applicable`;
          break;
        default:
          userPrompt = `Research this tech topic thoroughly: "${topic}". Provide comprehensive information including current facts, specifications, market context, and practical implications.`;
      }

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.perplexityApiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-large-128k-online',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 800,
          temperature: 0.2
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const research = data.choices?.[0]?.message?.content || '';

      return {
        research,
        sources: this.extractSources(research),
        keyPoints: this.extractKeyPoints(research),
        generated: true
      };

    } catch (error) {
      console.log(`Research failed for ${topic}: ${error.message}`);
      return this.getDemoResearch(topic, contentType);
    }
  }

  extractSources(research) {
    // Extract potential source mentions from research
    const sources = [];
    const lines = research.split('\n');
    
    lines.forEach(line => {
      if (line.includes('according to') || line.includes('reports') || line.includes('announced')) {
        const words = line.split(' ');
        words.forEach(word => {
          if (word.includes('.com') || word.includes('Inc') || word.includes('Corp')) {
            sources.push(word.replace(/[^\w.]/g, ''));
          }
        });
      }
    });

    return sources.slice(0, 3);
  }

  extractKeyPoints(research) {
    const points = [];
    const lines = research.split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
      if (line.match(/^\d+\./) || line.includes('•') || line.includes('-')) {
        const cleaned = line.replace(/^\d+\.\s*/, '').replace(/^[•\-]\s*/, '').trim();
        if (cleaned.length > 20 && cleaned.length < 150) {
          points.push(cleaned);
        }
      }
    });

    return points.slice(0, 5);
  }

  getDemoResearch(topic, contentType) {
    return {
      research: `Research data for ${topic}. This ${contentType} covers the key aspects of ${topic} including technical specifications, market positioning, and user considerations. The content provides valuable insights for tech enthusiasts and buyers.`,
      sources: ['techcrunch.com', 'theverge.com', 'ars-technica.com'],
      keyPoints: [
        `Key feature of ${topic}`,
        `Market impact of ${topic}`,
        `Technical specifications`,
        `User benefits and considerations`,
        `Competitive landscape analysis`
      ],
      generated: false
    };
  }

  async createNewsArticle(opportunity) {
    console.log(`📰 Creating news article: ${opportunity.title}`);

    const research = await this.enhancedResearch(opportunity.title, 'news');
    
    const slug = this.createSlug(opportunity.title);
    const content = this.templates.news
      .replace(/{title}/g, opportunity.title)
      .replace(/{description}/g, this.generateDescription(opportunity.title, 'news'))
      .replace(/{publishedAt}/g, new Date().toISOString())
      .replace(/{canonical}/g, `https://trendstoday.ca/news/${slug}`)
      .replace(/{keywords}/g, JSON.stringify(this.generateKeywords(opportunity.title)))
      .replace(/{featuredImage}/g, `/images/news/${slug}/hero.jpg`)
      .replace(/{breaking}/g, opportunity.type === 'reddit' ? 'true' : 'false')
      .replace(/{content}/g, this.generateNewsContent(opportunity, research));

    const filePath = path.join(this.contentDir, 'news', `${slug}.mdx`);
    
    try {
      await fs.access(filePath);
      console.log(`Article already exists: ${slug}.mdx`);
      return null;
    } catch {
      // File doesn't exist, continue
    }

    await fs.writeFile(filePath, content, 'utf-8');
    console.log(`✅ Created news article: ${slug}.mdx`);
    
    return { type: 'news', slug, title: opportunity.title, filePath };
  }

  async createHowToGuide(keyword) {
    console.log(`📖 Creating how-to guide: ${keyword.keyword}`);

    const research = await this.enhancedResearch(keyword.keyword, 'howto');
    
    const slug = this.createSlug(keyword.keyword);
    const title = this.formatTitle(keyword.keyword);
    
    const content = this.templates.howto
      .replace(/{title}/g, title)
      .replace(/{description}/g, this.generateDescription(title, 'guide'))
      .replace(/{publishedAt}/g, new Date().toISOString())
      .replace(/{canonical}/g, `https://trendstoday.ca/guides/${slug}`)
      .replace(/{keywords}/g, JSON.stringify([keyword.keyword, ...this.generateKeywords(title)]))
      .replace(/{featuredImage}/g, `/images/guides/${slug}/hero.jpg`)
      .replace(/{difficulty}/g, 'Beginner')
      .replace(/{timeToRead}/g, '5-10 minutes')
      .replace(/{content}/g, this.generateHowToContent(keyword, research));

    const filePath = path.join(this.contentDir, 'guides', `${slug}.mdx`);
    
    try {
      await fs.access(filePath);
      console.log(`Guide already exists: ${slug}.mdx`);
      return null;
    } catch {
      // File doesn't exist, continue
    }

    await fs.writeFile(filePath, content, 'utf-8');
    console.log(`✅ Created how-to guide: ${slug}.mdx`);
    
    return { type: 'howto', slug, title, filePath };
  }

  generateNewsContent(opportunity, research) {
    const sections = [];

    // Lead paragraph
    sections.push(`## Breaking: ${opportunity.title}

${research.research.split('\n')[0] || `Recent developments in ${opportunity.title} are making waves in the tech industry.`}`);

    // Key details
    if (research.keyPoints.length > 0) {
      sections.push(`## Key Details

${research.keyPoints.map(point => `- ${point}`).join('\n')}`);
    }

    // Context and analysis
    sections.push(`## What This Means

${research.research.split('\n').slice(1, 3).join('\n') || `This development represents a significant shift in the technology landscape, with potential implications for consumers and the broader industry.`}

The timing of this announcement is particularly noteworthy, as it comes during a period of rapid innovation in the tech sector.`);

    // Industry impact
    sections.push(`## Industry Impact

This news is likely to influence:

- **Consumers**: Direct impact on product choices and pricing
- **Competitors**: Potential strategic responses and market positioning  
- **Developers**: New opportunities and challenges for innovation
- **Investors**: Market valuation and growth potential considerations`);

    // What's next
    sections.push(`## What's Next

As this story develops, we'll be watching for:

- Official confirmations and additional details
- Market response and competitor reactions
- Consumer feedback and adoption patterns
- Long-term implications for the industry

*We'll continue to update this story as more information becomes available.*`);

    // Sources
    if (research.sources.length > 0) {
      sections.push(`## Sources

${research.sources.map((source, i) => `${i + 1}. ${source}`).join('\n')}

*Last updated: ${new Date().toLocaleDateString()}*`);
    }

    return sections.join('\n\n');
  }

  generateHowToContent(keyword, research) {
    const sections = [];
    const topic = keyword.keyword.replace(/how to\s*/i, '');

    // Introduction
    sections.push(`## Introduction

${research.research.split('\n')[0] || `Learning ${topic} is essential for tech enthusiasts who want to stay current with the latest developments.`}

This comprehensive guide will walk you through everything you need to know, from basic concepts to advanced techniques.`);

    // Prerequisites
    sections.push(`## Before You Begin

Make sure you have:

- Basic understanding of technology concepts
- Access to the necessary tools or devices
- About 10-15 minutes to complete the process
- A willingness to learn and experiment`);

    // Step-by-step guide
    sections.push(`## Step-by-Step Guide

### Step 1: Getting Started

Begin by understanding the fundamentals. ${research.keyPoints[0] || 'This first step is crucial for success.'}`);

    if (research.keyPoints.length > 1) {
      research.keyPoints.slice(1, 4).forEach((point, i) => {
        sections.push(`### Step ${i + 2}: ${point.split('.')[0] || 'Next Phase'}

${point.split('.').slice(1).join('.') || 'Follow these instructions carefully to proceed to the next phase.'}`);
      });
    }

    // Tips and best practices
    sections.push(`## Pro Tips & Best Practices

- **Take your time**: Don't rush through the process
- **Test thoroughly**: Verify each step before moving to the next
- **Keep notes**: Document your progress and any customizations
- **Stay updated**: Technology evolves quickly, so check for updates regularly`);

    // Troubleshooting
    sections.push(`## Common Issues & Solutions

**Problem**: Process doesn't work as expected
**Solution**: Double-check your setup and try again

**Problem**: Missing features or options
**Solution**: Ensure you're using the latest version

**Problem**: Performance issues
**Solution**: Restart and clear any cached data`);

    // Conclusion
    sections.push(`## Conclusion

You've successfully learned ${topic}! This skill will serve you well as technology continues to evolve.

**Next steps:**
- Practice what you've learned
- Explore advanced features
- Share your experience with others
- Stay updated with new developments

*Was this guide helpful? Let us know in the comments below.*`);

    return sections.join('\n\n');
  }

  createSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 60);
  }

  formatTitle(title) {
    return title
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  generateDescription(title, type) {
    const descriptions = {
      news: `Breaking tech news: ${title}. Get the latest updates, analysis, and implications for consumers and the industry.`,
      guide: `Learn ${title.toLowerCase()} with our step-by-step guide. Expert tips, best practices, and troubleshooting included.`,
      review: `Comprehensive ${title} review. We test features, performance, and value to help you make the right choice.`,
      comparison: `${title} comparison guide. We compare features, pricing, and performance to help you decide which is best.`
    };

    return descriptions[type] || `Comprehensive ${title} coverage with expert analysis and practical insights.`;
  }

  generateKeywords(title) {
    const keywords = [];
    const words = title.toLowerCase().split(' ');
    
    // Add the main title
    keywords.push(title.toLowerCase());
    
    // Add variations
    if (words.includes('iphone')) keywords.push('apple iphone', 'iphone review', 'iphone news');
    if (words.includes('android')) keywords.push('android phone', 'android update', 'google android');
    if (words.includes('ai')) keywords.push('artificial intelligence', 'AI technology', 'machine learning');
    
    // Add generic tech keywords
    keywords.push('tech news', 'technology trends', 'gadget reviews');
    
    return keywords.slice(0, 8);
  }

  getNewsTemplate() {
    return `---
title: "{title}"
description: "{description}"
category: "news"
publishedAt: "{publishedAt}"
lastUpdated: "{publishedAt}"
author:
  name: "Trends Today News"
  bio: "Breaking tech news and industry updates from our editorial team."
  avatar: "/images/authors/news-team.jpg"
seo:
  canonical: "{canonical}"
  keywords: {keywords}
schema:
  type: "NewsArticle"
  headline: "{title}"
  datePublished: "{publishedAt}"
  dateModified: "{publishedAt}"
  author: "Trends Today News"
  publisher: "Trends Today"
images:
  featured: "{featuredImage}"
news:
  breaking: {breaking}
  category: "technology"
---

{content}`;
  }

  getHowToTemplate() {
    return `---
title: "{title}"
description: "{description}"
category: "guides"
publishedAt: "{publishedAt}"
lastUpdated: "{publishedAt}"
author:
  name: "Trends Today Guides"
  bio: "Step-by-step tech guides and tutorials for all skill levels."
  avatar: "/images/authors/guide-team.jpg"
seo:
  canonical: "{canonical}"
  keywords: {keywords}
schema:
  type: "HowTo"
  name: "{title}"
  description: "{description}"
  datePublished: "{publishedAt}"
images:
  featured: "{featuredImage}"
guide:
  difficulty: "{difficulty}"
  timeToRead: "{timeToRead}"
  steps: 5
---

{content}`;
  }

  getReviewTemplate() {
    return `---
title: "{title}"
description: "{description}"
category: "reviews"
publishedAt: "{publishedAt}"
lastUpdated: "{publishedAt}"
author:
  name: "Trends Today Reviews"
  bio: "Independent tech reviews and analysis."
  avatar: "/images/authors/review-team.jpg"
seo:
  canonical: "{canonical}"
  keywords: {keywords}
schema:
  type: "Review"
images:
  featured: "{featuredImage}"
---

{content}`;
  }

  getComparisonTemplate() {
    return `---
title: "{title}"
description: "{description}"
category: "compare"
publishedAt: "{publishedAt}"
lastUpdated: "{publishedAt}"
author:
  name: "Trends Today Compare"
  bio: "Head-to-head tech comparisons and buying advice."
  avatar: "/images/authors/compare-team.jpg"
seo:
  canonical: "{canonical}"
  keywords: {keywords}
schema:
  type: "Article"
images:
  featured: "{featuredImage}"
---

{content}`;
  }

  getBestTemplate() {
    return `---
title: "{title}"
description: "{description}"
category: "best"
publishedAt: "{publishedAt}"
lastUpdated: "{publishedAt}"
author:
  name: "Trends Today Buying Guides"
  bio: "Expert buying guides and product recommendations."
  avatar: "/images/authors/buying-team.jpg"
seo:
  canonical: "{canonical}"
  keywords: {keywords}
schema:
  type: "Article"
images:
  featured: "{featuredImage}"
---

{content}`;
  }

  async run(args = []) {
    console.log('🚀 Starting smart content creator...');
    
    await this.ensureDirectories();

    // Parse command line arguments
    const type = this.getArgValue(args, '--type') || 'news';
    const count = parseInt(this.getArgValue(args, '--count') || '1');
    
    console.log(`Creating ${count} ${type} articles...`);

    const opportunities = await this.loadOpportunities();
    const results = [];

    try {
      if (type === 'news') {
        const newsItems = opportunities.news.slice(0, count);
        for (const item of newsItems) {
          const result = await this.createNewsArticle(item);
          if (result) results.push(result);
          
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } else if (type === 'howto') {
        const keywords = opportunities.seo.zeroVolumeKeywords
          .filter(kw => kw.contentType === 'how-to' || kw.keyword.includes('how to'))
          .slice(0, count);
          
        for (const keyword of keywords) {
          const result = await this.createHowToGuide(keyword);
          if (result) results.push(result);
          
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }

      console.log(`✅ Content creation completed. Created ${results.length} articles.`);
      
      // Output results
      results.forEach(result => {
        console.log(`📄 Created: ${result.type} - ${result.title}`);
      });

      return results;

    } catch (error) {
      console.error('Content creation failed:', error.message);
      process.exit(1);
    }
  }

  getArgValue(args, flag) {
    const index = args.indexOf(flag);
    return index !== -1 && index + 1 < args.length ? args[index + 1] : null;
  }
}

// Run if called directly
if (require.main === module) {
  const creator = new SmartContentCreator();
  creator.run(process.argv.slice(2)).catch(console.error);
}

module.exports = { SmartContentCreator };