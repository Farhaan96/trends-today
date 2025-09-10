#!/usr/bin/env node

/**
 * Universal Content Generator
 * Creates engaging content across all trending topics
 * Optimized for long-tail keywords and AI image generation
 */

const fs = require('fs').promises;
const path = require('path');
const categories = require('../config/content-categories');

class UniversalContentGenerator {
  constructor() {
    this.perplexityApiKey = process.env.PERPLEXITY_API_KEY;
    this.openaiApiKey = process.env.OPENAI_API_KEY;
  }

  /**
   * Generate content for any topic with Le Ravi style
   */
  async generateArticle(topic, category) {
    console.log(`\n📝 Generating article: ${topic.title}`);
    
    const article = {
      title: topic.title,
      category: category,
      slug: this.generateSlug(topic.title),
      author: this.selectAuthor(category),
      publishedAt: new Date().toISOString(),
      content: await this.generateContent(topic),
      metadata: this.generateMetadata(topic),
      images: await this.generateImagePrompts(topic, category),
      internalLinks: []  // Will be added by content enhancer
    };

    return article;
  }

  /**
   * Generate slug from title
   */
  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 60);
  }

  /**
   * Select appropriate author based on category
   */
  selectAuthor(category) {
    const authors = {
      science: { name: 'Dr. Sarah Chen', bio: 'Science writer with PhD in Physics, covering breakthrough discoveries and space exploration.' },
      psychology: { name: 'Emma Rodriguez', bio: 'Psychology researcher and writer, exploring human behavior and mental wellness.' },
      health: { name: 'Dr. Michael Park', bio: 'Medical journalist with background in public health and wellness research.' },
      technology: { name: 'Alex Thompson', bio: 'Tech futurist covering AI, quantum computing, and digital transformation.' },
      culture: { name: 'Maya Patel', bio: 'Cultural anthropologist writing about social trends and generational shifts.' },
      environment: { name: 'David Green', bio: 'Environmental scientist covering climate solutions and sustainability.' },
      history: { name: 'Prof. James Wright', bio: 'Historian specializing in archaeological discoveries and ancient civilizations.' },
      mystery: { name: 'Sophie Black', bio: 'Investigative writer exploring unexplained phenomena and scientific mysteries.' },
      future: { name: 'Dr. Lisa Future', bio: 'Futurist and trend forecaster analyzing emerging technologies and societal changes.' },
      lifestyle: { name: 'Jordan Lee', bio: 'Lifestyle journalist covering modern living, productivity, and wellness trends.' }
    };

    return authors[category] || authors.technology;
  }

  /**
   * Generate article content structure
   */
  async generateContent(topic) {
    const structure = `
# ${topic.title}

## The Discovery That Changes Everything

[Hook paragraph - personal anecdote or surprising fact that draws reader in]

Have you ever wondered why [relatable question]? Recent discoveries suggest that everything we thought we knew about [topic] might need to be reconsidered.

## What Scientists/Researchers Found

[Main discovery explained in accessible terms]

According to [credible source], the findings reveal that [key insight]. This breakthrough came after [context about the research].

"[Compelling quote from expert]," explains [expert name and credentials]. "[Additional context quote]."

## Why This Matters Now

[Relevance to readers' lives]

The implications extend far beyond [immediate field]. This could affect:
- [Impact point 1]
- [Impact point 2]
- [Impact point 3]

## The Deeper Implications

[Analysis and expert perspectives]

What makes this particularly fascinating is [unique angle]. Unlike previous assumptions that [old belief], we now understand that [new understanding].

[Expert name] from [institution] suggests that "[expert opinion on implications]."

## What Happens Next

[Future developments and predictions]

Researchers are now investigating [next steps]. Within [timeframe], we could see [potential developments].

The potential applications include:
1. [Application 1]
2. [Application 2]
3. [Application 3]

## The Bottom Line

[Summary and call to action]

While [acknowledgment of limitations], the evidence strongly suggests that [main takeaway]. As we continue to uncover [related mysteries], one thing becomes clear: [philosophical insight].

What do you think about [engaging question]? Share your thoughts in the comments below.
`;

    return structure;
  }

  /**
   * Generate SEO metadata
   */
  generateMetadata(topic) {
    return {
      description: `Discover ${topic.title.toLowerCase()}. ${topic.hooks[0]} Explore the latest findings and what they mean for the future.`,
      keywords: this.extractKeywords(topic.title),
      readingTime: Math.floor(Math.random() * 4) + 5, // 5-9 minutes
      seoTitle: `${topic.title} | Trends Today`,
      ogImage: topic.imagePrompt
    };
  }

  /**
   * Extract keywords from title
   */
  extractKeywords(title) {
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'];
    return title
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.includes(word))
      .slice(0, 8);
  }

  /**
   * Generate AI image prompts
   */
  async generateImagePrompts(topic, category) {
    const categoryPrompt = categories.imagePromptTemplates[category];
    
    return {
      hero: {
        prompt: `${categoryPrompt}, ${topic.imagePrompt}, cinematic lighting, hero image composition`,
        alt: `Visualization of ${topic.title}`,
        size: '1792x1024'
      },
      body1: {
        prompt: `${categoryPrompt}, abstract representation, minimalist style, scientific accuracy`,
        alt: `Concept illustration for ${topic.title}`,
        size: '1024x1024'
      },
      body2: {
        prompt: `${categoryPrompt}, infographic style, data visualization, clean modern design`,
        alt: `Data visualization related to ${topic.title}`,
        size: '1024x1024'
      }
    };
  }

  /**
   * Save article to content directory
   */
  async saveArticle(article) {
    const categoryDir = path.join(process.cwd(), 'content', article.category);
    
    // Ensure directory exists
    await fs.mkdir(categoryDir, { recursive: true });
    
    // Create MDX content
    const mdxContent = `---
title: "${article.title}"
description: "${article.metadata.description}"
category: "${article.category}"
publishedAt: "${article.publishedAt}"
author:
  name: "${article.author.name}"
  bio: "${article.author.bio}"
image: "/images/${article.category}/${article.slug}-hero.jpg"
keywords: ${JSON.stringify(article.metadata.keywords)}
readingTime: ${article.metadata.readingTime}
seoTitle: "${article.metadata.seoTitle}"
images:
  hero: "${article.images.hero.prompt}"
  body1: "${article.images.body1.prompt}"
  body2: "${article.images.body2.prompt}"
---

${article.content}
`;

    const fileName = `${article.slug}.mdx`;
    const filePath = path.join(categoryDir, fileName);
    
    await fs.writeFile(filePath, mdxContent);
    console.log(`✅ Saved: ${fileName}`);
    
    return filePath;
  }

  /**
   * Generate batch of articles
   */
  async generateBatch(topics) {
    console.log('🚀 Starting universal content generation...\n');
    
    const articles = [];
    
    for (const topic of topics) {
      try {
        const article = await this.generateArticle(topic, topic.category);
        const filePath = await this.saveArticle(article);
        articles.push({ ...article, filePath });
        
        // Add delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Error generating ${topic.title}:`, error.message);
      }
    }
    
    console.log(`\n✨ Generated ${articles.length} articles across multiple categories`);
    return articles;
  }
}

// Run generator
if (require.main === module) {
  const generator = new UniversalContentGenerator();
  
  // Load trending topics
  const trendingTopics = require('../trending-topics.json');
  const topPicks = trendingTopics.topPicks || [];
  
  generator.generateBatch(topPicks.slice(0, 5)).catch(console.error);
}

module.exports = UniversalContentGenerator;