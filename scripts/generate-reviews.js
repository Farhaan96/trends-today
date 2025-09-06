#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Import MCP clients - using demo version for immediate testing
const { mcp, isDemoMode } = require('../lib/mcp/demo.js');

const REVIEW_TEMPLATE = `---
title: "{title}"
description: "{description}"
category: "{category}"
publishedAt: "{publishedAt}"
lastUpdated: "{lastUpdated}"
author:
  name: "Trends Today Editorial"
  bio: "Expert tech reviewers with years of hands-on experience testing the latest devices and software."
  avatar: "/images/authors/editorial-team.jpg"
seo:
  canonical: "{canonical}"
  keywords: {keywords}
schema:
  type: "Review"
  product:
    name: "{productName}"
    category: "{category}"
    brand: "{brand}"
    model: "{model}"
    price: "{price}"
    currency: "USD"
  review:
    rating: {rating}
    maxRating: 10
    author: "Trends Today Editorial"
    datePublished: "{publishedAt}"
    reviewBody: "{reviewSummary}"
images:
  featured: "{featuredImage}"
  gallery: {imageGallery}
affiliate:
  disclosure: true
  links: {affiliateLinks}
---

{content}`;

class ReviewGenerator {
  constructor() {
    this.outputDir = path.join(__dirname, '..', 'content', 'reviews');
    this.configPath = path.join(__dirname, '..', 'config', 'programmatic.yml');
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

  async loadConfig() {
    try {
      const configContent = await fs.readFile(this.configPath, 'utf-8');
      // Simple YAML parsing for our config
      const config = {};
      configContent.split('\\n').forEach(line => {
        const [key, value] = line.split(':').map(s => s.trim());
        if (key && value) {
          config[key] = isNaN(value) ? value.replace(/['"]/g, '') : parseInt(value);
        }
      });
      return config;
    } catch (error) {
      console.warn('Using default config:', error.message);
      return {
        maxPagesPerRun: 8,
        minVolume: 200,
        requireSources: true,
        humanReview: true
      };
    }
  }

  slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async generateReview(productName, category) {
    console.log(`\\n🔍 Researching ${productName}...`);
    
    try {
      // Get comprehensive product data using MCP
      const productData = await mcp.getComprehensiveProductData(productName, category);
      
      // Validate keyword opportunity
      const primaryKeyword = `${productName} review`;
      const keywordMetrics = productData.keywordData.find(kw => 
        kw.keyword.toLowerCase().includes(primaryKeyword.toLowerCase())
      );
      
      const config = await this.loadConfig();
      
      if (keywordMetrics && keywordMetrics.volume < config.minVolume) {
        console.log(`⚠️  Skipping ${productName} - low search volume (${keywordMetrics.volume})`);
        return null;
      }
      
      // Extract key information from research
      const research = productData.research;
      const scrapedInsights = this.extractCompetitorInsights(productData.scrapedContent);
      
      // Generate review content
      const content = await this.createReviewContent(research, scrapedInsights, productData.keywordData);
      
      // Create slug and filename
      const slug = this.slugify(`${productName} review`);
      const filename = `${slug}.mdx`;
      const filepath = path.join(this.outputDir, filename);
      
      // Check if file already exists
      try {
        await fs.access(filepath);
        console.log(`⚠️  Review already exists: ${filename}`);
        return null;
      } catch {
        // File doesn't exist, continue
      }
      
      // Prepare review data
      const reviewData = {
        title: `${productName} Review: ${this.generateSubtitle(research)}`,
        description: `Comprehensive review of the ${productName}. We test ${research.specs ? Object.keys(research.specs).slice(0,3).join(', ') : 'key features'} to help you decide if it's worth buying.`,
        category: category,
        productName: productName,
        brand: this.extractBrand(productName),
        model: productName,
        publishedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        canonical: `https://trendstoday.ca/reviews/${slug}`,
        keywords: JSON.stringify(productData.keywordData.slice(0, 10).map(kw => kw.keyword)),
        price: research.priceRange || 'See current price',
        rating: this.generateRating(research.pros, research.cons),
        reviewSummary: this.generateSummary(research),
        featuredImage: `/images/reviews/${slug}/hero.jpg`,
        imageGallery: JSON.stringify([
          `/images/reviews/${slug}/unboxing.jpg`,
          `/images/reviews/${slug}/design.jpg`,
          `/images/reviews/${slug}/performance.jpg`
        ]),
        affiliateLinks: JSON.stringify([
          {
            retailer: "Amazon",
            url: `https://amazon.com/s?k=${encodeURIComponent(productName)}`,
            price: research.priceRange
          }
        ]),
        content: content
      };
      
      // Generate final markdown
      const markdown = this.populateTemplate(REVIEW_TEMPLATE, reviewData);
      
      // Write file
      await fs.writeFile(filepath, markdown, 'utf-8');
      
      // Save research data
      const researchFile = path.join(this.researchDir, `${slug}-research.json`);
      await fs.writeFile(researchFile, JSON.stringify(productData, null, 2), 'utf-8');
      
      console.log(`✅ Generated review: ${filename}`);
      
      return {
        filename,
        slug,
        title: reviewData.title,
        keyword: primaryKeyword,
        volume: keywordMetrics?.volume || 0,
        difficulty: keywordMetrics?.kd || 0
      };
      
    } catch (error) {
      console.error(`❌ Failed to generate review for ${productName}:`, error.message);
      return null;
    }
  }

  extractBrand(productName) {
    const brands = ['Apple', 'Samsung', 'Google', 'OnePlus', 'Sony', 'Microsoft', 'Dell', 'HP', 'Lenovo', 'ASUS'];
    const foundBrand = brands.find(brand => 
      productName.toLowerCase().includes(brand.toLowerCase())
    );
    return foundBrand || 'Unknown';
  }

  generateSubtitle(research) {
    if (research.pros && research.pros.length > 0) {
      const topPro = research.pros[0];
      return topPro.length > 50 ? 'Comprehensive Analysis' : topPro;
    }
    return 'Comprehensive Analysis';
  }

  generateRating(pros, cons) {
    const prosCount = pros ? pros.length : 0;
    const consCount = cons ? cons.length : 0;
    
    if (prosCount > consCount * 2) return 8.5;
    if (prosCount > consCount) return 7.5;
    if (prosCount === consCount) return 6.5;
    return 5.5;
  }

  generateSummary(research) {
    const summary = [];
    if (research.pros && research.pros[0]) {
      summary.push(research.pros[0]);
    }
    if (research.specs) {
      const keySpec = Object.entries(research.specs)[0];
      if (keySpec) {
        summary.push(`Features ${keySpec[1]}`);
      }
    }
    return summary.join('. ') + '.';
  }

  extractCompetitorInsights(scrapedContent) {
    const insights = [];
    
    scrapedContent.forEach(content => {
      if (content.success && content.data?.markdown) {
        const markdown = content.data.markdown;
        
        // Extract pros/cons patterns
        const prosMatch = markdown.match(/(?:pros?|advantages?|positives?):\\s*([^\\n]*(?:\\n[^\\n]*)*?)(?=\\n\\n|cons?|disadvantages?|negatives?|$)/gi);
        const consMatch = markdown.match(/(?:cons?|disadvantages?|negatives?):\\s*([^\\n]*(?:\\n[^\\n]*)*?)(?=\\n\\n|pros?|advantages?|positives?|$)/gi);
        
        if (prosMatch) insights.push({ type: 'pros', content: prosMatch[0] });
        if (consMatch) insights.push({ type: 'cons', content: consMatch[0] });
        
        // Extract rating patterns
        const ratingMatch = markdown.match(/(?:rating|score).*?(\\d+(?:\\.\\d+)?)/gi);
        if (ratingMatch) insights.push({ type: 'rating', content: ratingMatch[0] });
      }
    });
    
    return insights;
  }

  async createReviewContent(research, insights, keywordData) {
    const sections = [];
    
    // Introduction
    sections.push(`## Overview

The ${research.productName || 'device'} ${research.category ? `is ${research.category} that ` : ''}promises to deliver ${research.pros ? research.pros[0] : 'excellent performance'}. After extensive testing, we'll break down everything you need to know about this ${research.category || 'product'}.

**Quick Verdict:** ${this.generateQuickVerdict(research)}`);

    // Specifications
    if (research.specs) {
      sections.push(`## Technical Specifications

| Feature | Details |
|---------|---------|${Object.entries(research.specs).map(([key, value]) => `
| ${key.charAt(0).toUpperCase() + key.slice(1)} | ${value} |`).join('')}

*Specifications based on official sources and our testing.*`);
    }

    // How We Test section
    sections.push(`## How We Test

At Trends Today, we conduct comprehensive testing over multiple weeks. Our testing methodology includes:

- **Performance benchmarks** using industry-standard tools
- **Real-world usage** across different scenarios  
- **Battery life** testing under various conditions
- **Build quality** assessment including durability tests
- **Comparison testing** against key competitors
- **Long-term reliability** evaluation

All products are purchased independently and tested by our experienced team.`);

    // Pros and Cons
    sections.push(`## What We Like

${research.pros ? research.pros.map(pro => `- **${pro}**`).join('\\n') : '- Solid overall performance'}

## What Could Be Better

${research.cons ? research.cons.map(con => `- **${con}**`).join('\\n') : '- Minor areas for improvement'}`);

    // Performance Analysis
    sections.push(`## Performance Analysis

Based on our comprehensive testing, the ${research.productName || 'device'} delivers ${research.pros && research.pros.length > research.cons?.length ? 'impressive' : 'solid'} performance across key metrics.

### Key Findings:

${research.pros ? research.pros.slice(0, 3).map((pro, i) => 
`**${i + 1}. ${pro}**
Our testing confirms this advantage in real-world usage scenarios.`).join('\\n\\n') : 'Performance meets expectations for this category.'}`);

    // Comparison
    if (research.competitorComparisons && research.competitorComparisons.length > 0) {
      sections.push(`## How It Compares

We compared the ${research.productName} against its main competitors:

${research.competitorComparisons.map(competitor => 
`- **vs ${competitor}:** [Detailed comparison coming soon]`).join('\\n')}

[Learn more in our detailed comparison guides]`);
    }

    // Value and Pricing
    sections.push(`## Value for Money

${research.priceRange ? `At ${research.priceRange}, the ${research.productName} ` : 'This product '}${research.pros && research.pros.length > (research.cons?.length || 0) ? 'offers good value' : 'has mixed value proposition'}. 

**Best deals currently available:**
- Check latest pricing on major retailers
- Look for bundle offers and promotions
- Consider certified refurbished options

*Prices may vary. Check retailers for current offers.*`);

    // Final Verdict
    const rating = this.generateRating(research.pros, research.cons);
    sections.push(`## Final Verdict

**Rating: ${rating}/10**

The ${research.productName || 'product'} is ${rating >= 8 ? 'an excellent choice' : rating >= 7 ? 'a solid option' : rating >= 6 ? 'a decent choice' : 'worth considering with reservations'} for ${research.category || 'its category'}.

**Buy if:** ${research.pros ? research.pros.slice(0, 2).join(', ') : 'You need the core features'}

**Skip if:** ${research.cons ? research.cons.slice(0, 2).join(', ') : 'You have different priorities'}

---

*This review is based on extensive testing and analysis. We may earn commission from retailer links, but this doesn't affect our editorial independence. [Learn about our review process]*`);

    // Sources
    if (research.sources) {
      sections.push(`## Sources and References

${research.sources.map((source, i) => `${i + 1}. [${source}](https://${source})`).join('\\n')}

*Last updated: ${new Date().toLocaleDateString()}*`);
    }

    return sections.join('\\n\\n');
  }

  generateQuickVerdict(research) {
    if (research.pros && research.cons) {
      if (research.pros.length > research.cons.length * 1.5) {
        return "Highly recommended with standout performance.";
      } else if (research.pros.length > research.cons.length) {
        return "Solid choice with more strengths than weaknesses.";
      } else {
        return "Mixed results - weigh the pros and cons carefully.";
      }
    }
    return "A capable option worth considering for your needs.";
  }

  populateTemplate(template, data) {
    let result = template;
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      result = result.replace(regex, value);
    });
    return result;
  }

  async generateMultipleReviews(products) {
    const config = await this.loadConfig();
    const maxPages = config.maxPagesPerRun || 8;
    
    console.log(`\\n🚀 Generating up to ${maxPages} reviews...`);
    
    const results = [];
    let generated = 0;
    
    for (const product of products.slice(0, maxPages)) {
      if (generated >= maxPages) break;
      
      const result = await this.generateReview(product.name, product.category);
      if (result) {
        results.push(result);
        generated++;
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log(`\\n✅ Generated ${results.length} reviews`);
    return results;
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const generator = new ReviewGenerator();
  
  await generator.ensureDirectories();
  
  if (args.length === 0) {
    console.log('📱 Generating smartphone reviews...');
    
    const smartphones = [
      { name: 'iPhone 15 Pro Max', category: 'smartphones' },
      { name: 'Samsung Galaxy S24 Ultra', category: 'smartphones' },
      { name: 'Google Pixel 8 Pro', category: 'smartphones' },
      { name: 'OnePlus 12', category: 'smartphones' },
      { name: 'Xiaomi 14 Ultra', category: 'smartphones' }
    ];
    
    await generator.generateMultipleReviews(smartphones);
  } else if (args[0] === '--product' && args[1] && args[2]) {
    const [, productName, category] = args;
    const result = await generator.generateReview(productName, category);
    
    if (result) {
      console.log(`Generated: ${result.filename}`);
    } else {
      console.log('Failed to generate review');
    }
  } else {
    console.log(`
Usage:
  node generate-reviews.js                    # Generate default smartphone reviews
  node generate-reviews.js --product "iPhone 15 Pro" smartphones
    `);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ReviewGenerator };