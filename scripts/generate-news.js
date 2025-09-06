#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { mcp } = require('../lib/mcp/index.ts');

const NEWS_TEMPLATE = `---
title: "{title}"
description: "{description}"
category: "{category}"
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
  sources: {sources}
  relatedStories: {relatedStories}
---

{content}`;

class NewsGenerator {
  constructor() {
    this.outputDir = path.join(__dirname, '..', 'content', 'news');
    this.researchDir = path.join(__dirname, '..', 'research');
  }

  async ensureDirectories() {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
      await fs.mkdir(this.researchDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create directories:', error);
    }
  }

  slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async generateNewsDigest() {
    console.log(`\\n📰 Generating tech news digest...`);
    
    try {
      // Define news sources and topics
      const sources = [
        'techcrunch.com',
        'theverge.com',
        'engadget.com',
        'arstechnica.com',
        'wired.com',
        'zdnet.com',
        'cnet.com'
      ];
      
      const topics = [
        'smartphone launches',
        'AI developments',
        'tech earnings',
        'startup funding',
        'product recalls',
        'security breaches',
        'Apple news',
        'Google news',
        'Microsoft news',
        'Tesla news'
      ];
      
      // Get latest news from Perplexity
      const newsData = await mcp.perplexity.generateNewsDigest(sources, topics);
      
      if (!newsData.articles || newsData.articles.length === 0) {
        console.log('⚠️  No recent news articles found');
        return [];
      }
      
      console.log(`Found ${newsData.articles.length} news articles`);
      
      const results = [];
      
      // Process each article
      for (const article of newsData.articles.slice(0, 6)) {
        try {
          const result = await this.createNewsArticle(article);
          if (result) {
            results.push(result);
          }
        } catch (error) {
          console.error(`Failed to create article for "${article.title}":`, error.message);
        }
      }
      
      console.log(`\\n✅ Generated ${results.length} news articles`);
      return results;
      
    } catch (error) {
      console.error(`❌ Failed to generate news digest:`, error.message);
      return [];
    }
  }

  async createNewsArticle(articleData) {
    const slug = this.slugify(articleData.title);
    const filename = `${slug}.mdx`;
    const filepath = path.join(this.outputDir, filename);
    
    // Check if article already exists
    try {
      await fs.access(filepath);
      console.log(`⚠️  Article already exists: ${filename}`);
      return null;
    } catch {
      // File doesn't exist, continue
    }
    
    // Validate article data
    if (!articleData.title || !articleData.summary) {
      console.log(`⚠️  Skipping incomplete article data`);
      return null;
    }
    
    // Generate expanded content
    const expandedContent = await this.expandNewsContent(articleData);
    
    // Prepare article data
    const newsData = {
      title: articleData.title,
      description: articleData.summary,
      category: articleData.category || 'Tech News',
      publishedAt: articleData.publishedAt || new Date().toISOString(),
      canonical: `https://trendstoday.ca/news/${slug}`,
      keywords: JSON.stringify([
        articleData.category || 'tech news',
        ...this.extractKeywords(articleData.title),
        'breaking news',
        'tech industry'
      ]),
      featuredImage: `/images/news/${slug}/hero.jpg`,
      breaking: this.isBreakingNews(articleData),
      sources: JSON.stringify([{
        name: articleData.source || 'Tech Industry',
        url: articleData.url || '#',
        publishedAt: articleData.publishedAt || new Date().toISOString()
      }]),
      relatedStories: JSON.stringify([]),
      content: expandedContent
    };
    
    // Generate final markdown
    const markdown = this.populateTemplate(NEWS_TEMPLATE, newsData);
    
    // Write files
    await fs.writeFile(filepath, markdown, 'utf-8');
    
    console.log(`✅ Generated news article: ${filename}`);
    
    return {
      filename,
      slug,
      title: newsData.title,
      category: newsData.category,
      publishedAt: newsData.publishedAt,
      breaking: newsData.breaking
    };
  }

  extractKeywords(title) {
    const commonTechTerms = [
      'iPhone', 'Android', 'Apple', 'Google', 'Microsoft', 'Samsung',
      'AI', 'artificial intelligence', 'machine learning', 'ChatGPT',
      'smartphone', 'laptop', 'tablet', 'smartwatch', 'headphones',
      'electric vehicle', 'Tesla', 'autonomous', 'cybersecurity',
      'blockchain', 'cryptocurrency', 'Bitcoin', 'Ethereum',
      'cloud computing', 'AWS', 'Azure', 'streaming', 'gaming'
    ];
    
    const keywords = [];
    const titleLower = title.toLowerCase();
    
    commonTechTerms.forEach(term => {
      if (titleLower.includes(term.toLowerCase())) {
        keywords.push(term);
      }
    });
    
    return keywords.slice(0, 5);
  }

  isBreakingNews(articleData) {
    const breakingKeywords = [
      'breaking', 'urgent', 'alert', 'announced', 'launches', 'recall',
      'hack', 'breach', 'acquisition', 'merger', 'lawsuit', 'investigation'
    ];
    
    const titleLower = articleData.title.toLowerCase();
    return breakingKeywords.some(keyword => titleLower.includes(keyword));
  }

  async expandNewsContent(articleData) {
    const sections = [];
    
    // Lead paragraph
    sections.push(articleData.summary);
    
    // Key details section
    sections.push(`## Key Details

${this.generateKeyDetails(articleData)}`);
    
    // Background context
    sections.push(`## Background

${this.generateBackground(articleData)}`);
    
    // Industry impact
    sections.push(`## Industry Impact

${this.generateImpact(articleData)}`);
    
    // What's next
    sections.push(`## What's Next

${this.generateNextSteps(articleData)}`);
    
    // Source attribution
    sections.push(`---

**Source:** ${articleData.source || 'Industry Reports'}  
**Published:** ${new Date(articleData.publishedAt || Date.now()).toLocaleDateString()}

*This story is developing. We'll update as more information becomes available.*`);
    
    return sections.join('\\n\\n');
  }

  generateKeyDetails(articleData) {
    const details = [
      `- **Company/Product:** ${this.extractMainEntity(articleData.title)}`,
      `- **Category:** ${articleData.category || 'Technology'}`,
      `- **Impact Level:** ${this.assessImpact(articleData)}`,
      `- **Timeline:** ${this.extractTimeline(articleData)}`
    ];
    
    return details.join('\\n');
  }

  extractMainEntity(title) {
    const entities = ['Apple', 'Google', 'Microsoft', 'Amazon', 'Meta', 'Tesla', 'Samsung', 'Netflix', 'OpenAI'];
    const found = entities.find(entity => title.includes(entity));
    return found || 'Tech Industry';
  }

  assessImpact(articleData) {
    const highImpactKeywords = ['acquisition', 'merger', 'lawsuit', 'recall', 'hack', 'breach'];
    const titleLower = articleData.title.toLowerCase();
    
    if (highImpactKeywords.some(keyword => titleLower.includes(keyword))) {
      return 'High - Industry-wide implications';
    }
    
    if (titleLower.includes('launch') || titleLower.includes('announce')) {
      return 'Medium - Market positioning';
    }
    
    return 'Low to Medium - Company specific';
  }

  extractTimeline(articleData) {
    const titleLower = articleData.title.toLowerCase();
    
    if (titleLower.includes('2025')) return '2025';
    if (titleLower.includes('2024')) return '2024';
    if (titleLower.includes('next year')) return 'Next 12 months';
    if (titleLower.includes('soon') || titleLower.includes('coming')) return 'Near term';
    
    return 'Immediate';
  }

  generateBackground(articleData) {
    const category = articleData.category || 'technology';
    
    return `This development comes as the ${category} sector continues to evolve rapidly, with companies competing for market share and technological advantage.

Recent trends in the industry have shown increasing focus on innovation, user experience, and market expansion. This news fits within the broader context of ongoing technological advancement and competitive dynamics.`;
  }

  generateImpact(articleData) {
    return `The announcement is expected to have several implications:

- **Consumers:** May see new options and features in the marketplace
- **Competitors:** Could respond with similar initiatives or strategic shifts  
- **Industry:** Reinforces ongoing trends toward innovation and competition
- **Market:** Potential effects on stock prices and investor sentiment

Analysts will be watching closely for market reaction and competitive responses.`;
  }

  generateNextSteps(articleData) {
    return `Key things to watch for:

- Official statements and additional details from the company
- Market and analyst reactions
- Competitive responses from rivals
- Regulatory or industry body reactions if applicable
- Consumer and media reception

We'll continue monitoring this story and provide updates as new information emerges.`;
  }

  populateTemplate(template, data) {
    let result = template;
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      result = result.replace(regex, value);
    });
    return result;
  }

  async generateBreakingNews(headline, summary, source) {
    console.log(`\\n🚨 Generating breaking news: ${headline}`);
    
    const articleData = {
      title: headline,
      summary: summary,
      source: source,
      category: 'Breaking News',
      publishedAt: new Date().toISOString()
    };
    
    return await this.createNewsArticle(articleData);
  }

  async cleanupOldNews(daysOld = 30) {
    console.log(`\\n🧹 Cleaning up news older than ${daysOld} days...`);
    
    try {
      const files = await fs.readdir(this.outputDir);
      const cutoffDate = new Date(Date.now() - (daysOld * 24 * 60 * 60 * 1000));
      
      let cleaned = 0;
      
      for (const file of files) {
        if (!file.endsWith('.mdx')) continue;
        
        const filepath = path.join(this.outputDir, file);
        const stats = await fs.stat(filepath);
        
        if (stats.mtime < cutoffDate) {
          await fs.unlink(filepath);
          cleaned++;
          console.log(`Deleted: ${file}`);
        }
      }
      
      console.log(`✅ Cleaned up ${cleaned} old articles`);
      
    } catch (error) {
      console.error('Failed to cleanup old news:', error);
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const generator = new NewsGenerator();
  
  await generator.ensureDirectories();
  
  if (args.length === 0) {
    console.log('📰 Generating tech news digest...');
    await generator.generateNewsDigest();
  } else if (args[0] === '--breaking' && args[1] && args[2]) {
    const headline = args[1];
    const summary = args[2];
    const source = args[3] || 'Tech Industry';
    
    const result = await generator.generateBreakingNews(headline, summary, source);
    if (result) {
      console.log(`Generated breaking news: ${result.filename}`);
    }
  } else if (args[0] === '--cleanup') {
    const days = args[1] ? parseInt(args[1]) : 30;
    await generator.cleanupOldNews(days);
  } else {
    console.log(`
Usage:
  node generate-news.js                                    # Generate news digest
  node generate-news.js --breaking "headline" "summary"   # Generate breaking news
  node generate-news.js --cleanup [days]                  # Cleanup old articles
    `);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { NewsGenerator };