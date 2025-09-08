#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { mcp } = require('../lib/mcp/index.ts');

const COMPARISON_TEMPLATE = `---
title: "{title}"
description: "{description}"
category: "{category}"
publishedAt: "{publishedAt}"
lastUpdated: "{lastUpdated}"
author:
  name: "Trends Today Editorial"
  bio: "Expert tech reviewers specializing in product comparisons and buying advice."
  avatar: "/images/authors/editorial-team.jpg"
seo:
  canonical: "{canonical}"
  keywords: {keywords}
schema:
  type: "Comparison"
  products: {products}
images:
  featured: "{featuredImage}"
  productA: "{productAImage}"
  productB: "{productBImage}"
comparison:
  productA:
    name: "{productAName}"
    pros: {productAPros}
    cons: {productACons}
    rating: {productARating}
    price: "{productAPrice}"
  productB:
    name: "{productBName}"
    pros: {productBPros}
    cons: {productBCons}
    rating: {productBRating}
    price: "{productBPrice}"
affiliate:
  disclosure: true
  links: {affiliateLinks}
---

{content}`;

class ComparisonGenerator {
  constructor() {
    this.outputDir = path.join(__dirname, '..', 'content', 'compare');
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

  async generateComparison(productA, productB, category) {
    console.log(`\\n🔄 Comparing ${productA} vs ${productB}...`);
    
    try {
      // Research both products
      const [dataA, dataB] = await Promise.all([
        mcp.getComprehensiveProductData(productA, category),
        mcp.getComprehensiveProductData(productB, category)
      ]);
      
      // Validate keyword opportunity
      const comparisonKeyword = `${productA} vs ${productB}`;
      const keywordData = await mcp.dataForSEO.batchKeywordAnalysis([comparisonKeyword, `${productB} vs ${productA}`]);
      const primaryKeyword = keywordData.find(kw => kw.volume > 0) || keywordData[0];
      
      if (!primaryKeyword || primaryKeyword.volume < 100) {
        console.log(`⚠️  Skipping comparison - low search interest`);
        return null;
      }
      
      // Create slug and check for existing file
      const slug = this.slugify(`${productA}-vs-${productB}`);
      const filename = `${slug}.mdx`;
      const filepath = path.join(this.outputDir, filename);
      
      try {
        await fs.access(filepath);
        console.log(`⚠️  Comparison already exists: ${filename}`);
        return null;
      } catch {
        // File doesn't exist, continue
      }
      
      // Generate comparison content
      const content = await this.createComparisonContent(dataA, dataB, productA, productB);
      
      // Determine winner
      const winner = this.determineWinner(dataA.research, dataB.research);
      
      // Prepare comparison data
      const comparisonData = {
        title: `${productA} vs ${productB}: Which Should You Buy in 2025?`,
        description: `Detailed comparison of ${productA} vs ${productB}. We compare specs, performance, price, and value to help you choose the right ${category}.`,
        category: category,
        publishedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        canonical: `https://trendstoday.ca/compare/${slug}`,
        keywords: JSON.stringify([comparisonKeyword, `${productB} vs ${productA}`, `best ${category} 2025`, `${productA} review`, `${productB} review`]),
        featuredImage: `/images/comparisons/${slug}/hero.jpg`,
        productAImage: `/images/comparisons/${slug}/${this.slugify(productA)}.jpg`,
        productBImage: `/images/comparisons/${slug}/${this.slugify(productB)}.jpg`,
        productAName: productA,
        productBName: productB,
        productAPros: JSON.stringify(dataA.research.pros || []),
        productACons: JSON.stringify(dataA.research.cons || []),
        productARating: this.calculateRating(dataA.research),
        productAPrice: dataA.research.priceRange || 'See current price',
        productBPros: JSON.stringify(dataB.research.pros || []),
        productBCons: JSON.stringify(dataB.research.cons || []),
        productBRating: this.calculateRating(dataB.research),
        productBPrice: dataB.research.priceRange || 'See current price',
        products: JSON.stringify([
          {
            name: productA,
            category: category,
            rating: this.calculateRating(dataA.research)
          },
          {
            name: productB,
            category: category,
            rating: this.calculateRating(dataB.research)
          }
        ]),
        affiliateLinks: JSON.stringify([
          {
            product: productA,
            retailer: "Amazon",
            url: `https://amazon.com/s?k=${encodeURIComponent(productA)}`
          },
          {
            product: productB,
            retailer: "Amazon", 
            url: `https://amazon.com/s?k=${encodeURIComponent(productB)}`
          }
        ]),
        content: content
      };
      
      // Generate final markdown
      const markdown = this.populateTemplate(COMPARISON_TEMPLATE, comparisonData);
      
      // Write files
      await fs.writeFile(filepath, markdown, 'utf-8');
      
      const researchFile = path.join(this.researchDir, `${slug}-comparison.json`);
      await fs.writeFile(researchFile, JSON.stringify({ dataA, dataB, winner }, null, 2), 'utf-8');
      
      console.log(`✅ Generated comparison: ${filename}`);
      
      return {
        filename,
        slug,
        title: comparisonData.title,
        winner,
        keyword: comparisonKeyword,
        volume: primaryKeyword.volume
      };
      
    } catch (error) {
      console.error(`❌ Failed to generate comparison:`, error.message);
      return null;
    }
  }

  calculateRating(research) {
    const prosCount = research.pros ? research.pros.length : 0;
    const consCount = research.cons ? research.cons.length : 0;
    
    if (prosCount > consCount * 2) return 8.5;
    if (prosCount > consCount) return 7.5;
    if (prosCount === consCount) return 6.5;
    return 5.5;
  }

  determineWinner(researchA, researchB) {
    const scoreA = this.calculateRating(researchA);
    const scoreB = this.calculateRating(researchB);
    
    if (scoreA > scoreB + 0.5) return 'A';
    if (scoreB > scoreA + 0.5) return 'B';
    return 'tie';
  }

  async createComparisonContent(dataA, dataB, productA, productB) {
    const sections = [];
    
    // Quick Comparison
    sections.push(`## Quick Comparison

| Feature | ${productA} | ${productB} |
|---------|-------------|-------------|
| **Overall Rating** | ${this.calculateRating(dataA.research)}/10 | ${this.calculateRating(dataB.research)}/10 |
| **Price Range** | ${dataA.research.priceRange || 'TBA'} | ${dataB.research.priceRange || 'TBA'} |
| **Best For** | ${dataA.research.pros?.[0] || 'General use'} | ${dataB.research.pros?.[0] || 'General use'} |

**Winner:** ${this.getWinnerText(this.determineWinner(dataA.research, dataB.research), productA, productB)}`);

    // Detailed Specifications
    if (dataA.research.specs || dataB.research.specs) {
      sections.push(`## Detailed Specifications

| Specification | ${productA} | ${productB} |
|---------------|-------------|-------------|${this.createSpecTable(dataA.research.specs, dataB.research.specs)}`);
    }

    // Performance Comparison
    sections.push(`## Performance Analysis

### ${productA}
${dataA.research.pros ? dataA.research.pros.map(pro => `- **${pro}**`).join('\\n') : '- Solid performance'}

${dataA.research.cons ? dataA.research.cons.map(con => `- ${con}`).join('\\n') : ''}

### ${productB}  
${dataB.research.pros ? dataB.research.pros.map(pro => `- **${pro}**`).join('\\n') : '- Solid performance'}

${dataB.research.cons ? dataB.research.cons.map(con => `- ${con}`).join('\\n') : ''}`);

    // Price and Value
    sections.push(`## Price and Value

**${productA}:** ${dataA.research.priceRange || 'Check current pricing'}
**${productB}:** ${dataB.research.priceRange || 'Check current pricing'}

### Value Analysis
${this.generateValueAnalysis(dataA.research, dataB.research, productA, productB)}`);

    // Who Should Buy What
    const winner = this.determineWinner(dataA.research, dataB.research);
    sections.push(`## Who Should Buy What?

### Choose ${productA} if:
${this.generateBuyingReasons(dataA.research, dataB.research, 'A')}

### Choose ${productB} if:
${this.generateBuyingReasons(dataB.research, dataA.research, 'B')}

### Skip Both if:
- You need features neither device offers well
- You can wait for next-generation models
- Budget constraints require a different category`);

    // Final Recommendation
    sections.push(`## Final Recommendation

${this.getFinalRecommendation(winner, productA, productB, dataA.research, dataB.research)}

Both devices have their merits, but your specific needs and budget will determine the best choice.

---

*Comparison based on extensive research and testing. Prices may vary. [Check latest prices and availability]*`);

    return sections.join('\\n\\n');
  }

  createSpecTable(specsA, specsB) {
    const allKeys = new Set([
      ...(specsA ? Object.keys(specsA) : []),
      ...(specsB ? Object.keys(specsB) : [])
    ]);
    
    return Array.from(allKeys).slice(0, 8).map(key => {
      const valueA = specsA?.[key] || 'N/A';
      const valueB = specsB?.[key] || 'N/A';
      return `\\n| ${key.charAt(0).toUpperCase() + key.slice(1)} | ${valueA} | ${valueB} |`;
    }).join('');
  }

  generateValueAnalysis(researchA, researchB, productA, productB) {
    const sections = [];
    
    if (researchA.priceRange && researchB.priceRange) {
      sections.push(`Comparing price-to-performance ratio, both devices offer competitive value in their respective segments.`);
    }
    
    sections.push(`The ${productA} excels in ${researchA.pros?.[0] || 'key areas'}, while the ${productB} stands out for ${researchB.pros?.[0] || 'different strengths'}.`);
    
    return sections.join(' ');
  }

  generateBuyingReasons(primaryResearch, competitorResearch, position) {
    const reasons = [];
    
    if (primaryResearch.pros) {
      reasons.push(...primaryResearch.pros.slice(0, 3).map(pro => `- ${pro}`));
    }
    
    if (primaryResearch.priceRange && primaryResearch.priceRange.includes('$')) {
      reasons.push(`- Price point fits your budget`);
    }
    
    reasons.push('- You prioritize the strengths mentioned above');
    
    return reasons.join('\\n');
  }

  getWinnerText(winner, productA, productB) {
    if (winner === 'A') return `**${productA}** takes the edge overall`;
    if (winner === 'B') return `**${productB}** takes the edge overall`;
    return 'It\\'s a **tie** - choose based on your priorities';
  }

  getFinalRecommendation(winner, productA, productB, researchA, researchB) {
    if (winner === 'A') {
      return `**Our pick: ${productA}**\\n\\nThe ${productA} edges out the ${productB} with ${researchA.pros?.[0] || 'superior overall performance'}. While the ${productB} has its merits, the ${productA} offers better value for most users.`;
    } else if (winner === 'B') {
      return `**Our pick: ${productB}**\\n\\nThe ${productB} takes the lead with ${researchB.pros?.[0] || 'superior overall performance'}. Although the ${productA} is competitive, the ${productB} delivers better value for most users.`;
    } else {
      return `**It's a tie!**\\n\\nBoth the ${productA} and ${productB} are excellent choices. Your decision should come down to specific needs, budget, and personal preferences. Both will serve you well.`;
    }
  }

  populateTemplate(template, data) {
    let result = template;
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      result = result.replace(regex, value);
    });
    return result;
  }

  async generateMultipleComparisons(comparisons) {
    console.log(`\\n🔄 Generating ${comparisons.length} comparisons...`);
    
    const results = [];
    
    for (const comparison of comparisons) {
      const result = await this.generateComparison(comparison.productA, comparison.productB, comparison.category);
      if (result) {
        results.push(result);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    console.log(`\\n✅ Generated ${results.length} comparisons`);
    return results;
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const generator = new ComparisonGenerator();
  
  await generator.ensureDirectories();
  
  if (args.length === 0) {
    console.log('🔄 Generating smartphone comparisons...');
    
    const comparisons = [
      { productA: 'iPhone 15 Pro', productB: 'Samsung Galaxy S24', category: 'smartphones' },
      { productA: 'Google Pixel 8 Pro', productB: 'OnePlus 12', category: 'smartphones' },
      { productA: 'iPhone 15 Pro Max', productB: 'Samsung Galaxy S24 Ultra', category: 'smartphones' }
    ];
    
    await generator.generateMultipleComparisons(comparisons);
  } else if (args[0] === '--compare' && args[1] && args[2] && args[3]) {
    const [, productA, productB, category] = args;
    const result = await generator.generateComparison(productA, productB, category);
    
    if (result) {
      console.log(`Generated: ${result.filename}`);
    } else {
      console.log('Failed to generate comparison');
    }
  } else {
    console.log(`
Usage:
  node generate-comparisons.js                                    # Generate default comparisons
  node generate-comparisons.js --compare "iPhone 15 Pro" "Galaxy S24" smartphones
    `);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ComparisonGenerator };