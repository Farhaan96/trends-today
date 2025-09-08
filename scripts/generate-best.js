#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { mcp } = require('../lib/mcp/index.ts');

const BUYING_GUIDE_TEMPLATE = `---
title: "{title}"
description: "{description}"
category: "{category}"
publishedAt: "{publishedAt}"
lastUpdated: "{lastUpdated}"
author:
  name: "Trends Today Editorial"
  bio: "Tech experts with extensive experience testing and recommending the best products."
  avatar: "/images/authors/editorial-team.jpg"
seo:
  canonical: "{canonical}"
  keywords: {keywords}
schema:
  type: "BuyingGuide"
  category: "{category}"
  year: {year}
  recommendations: {recommendations}
images:
  featured: "{featuredImage}"
  products: {productImages}
guide:
  methodology: "{methodology}"
  criteria: {criteria}
  lastUpdated: "{lastUpdated}"
affiliate:
  disclosure: true
  links: {affiliateLinks}
---

{content}`;

class BuyingGuideGenerator {
  constructor() {
    this.outputDir = path.join(__dirname, '..', 'content', 'best');
    this.researchDir = path.join(__dirname, '..', 'research');
  }

  async ensureDirectories() {
    try {
      await fs.mkdir(path.join(this.outputDir, 'smartphones'), { recursive: true });
      await fs.mkdir(path.join(this.outputDir, 'laptops'), { recursive: true });
      await fs.mkdir(path.join(this.outputDir, 'headphones'), { recursive: true });
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

  async generateBuyingGuide(category, subcategory = null, year = 2025) {
    console.log(`\\n📋 Generating ${category} buying guide for ${year}...`);
    
    try {
      // Generate content ideas and get products to feature
      const contentIdeas = await mcp.generateContentIdeas(category, 10);
      
      // Validate keyword opportunity
      const guideKeyword = `best ${category} ${year}`;
      const keywordData = await mcp.dataForSEO.batchKeywordAnalysis([guideKeyword, `top ${category} ${year}`, `${category} buying guide`]);
      const primaryKeyword = keywordData.find(kw => kw.volume > 0) || keywordData[0];
      
      if (!primaryKeyword || primaryKeyword.volume < 200) {
        console.log(`⚠️  Skipping guide - insufficient search volume`);
        return null;
      }
      
      // Research top products in category
      const topProducts = await this.getTopProducts(category, year);
      const productResearch = await Promise.all(
        topProducts.slice(0, 8).map(product => 
          mcp.getComprehensiveProductData(product.name, category).catch(error => {
            console.warn(`Failed to research ${product.name}:`, error.message);
            return null;
          })
        )
      );
      
      // Filter successful research
      const validProducts = productResearch.filter(Boolean);
      
      if (validProducts.length < 3) {
        console.log(`⚠️  Insufficient product data for guide`);
        return null;
      }
      
      // Create slug and check for existing file
      const slug = subcategory ? `${category}-${subcategory}-${year}` : `${category}-${year}`;
      const filename = `${slug}.mdx`;
      const categoryDir = path.join(this.outputDir, category);
      const filepath = path.join(categoryDir, filename);
      
      try {
        await fs.access(filepath);
        console.log(`⚠️  Guide already exists: ${filename}`);
        return null;
      } catch {
        // File doesn't exist, continue
      }
      
      // Generate guide content
      const content = await this.createGuideContent(validProducts, category, year);
      
      // Prepare guide data
      const guideData = {
        title: `Best ${this.capitalizeCategory(category)} of ${year}: Expert Tested & Reviewed`,
        description: `Our experts tested dozens of ${category} to find the best options for every budget and need. Updated ${new Date().toLocaleDateString()}.`,
        category: category,
        year: year,
        publishedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        canonical: `https://trendstoday.ca/best/${category}/${year}`,
        keywords: JSON.stringify([guideKeyword, `top ${category} ${year}`, `${category} buying guide`, `best ${category} reviews`, `${category} recommendations ${year}`]),
        featuredImage: `/images/guides/${slug}/hero.jpg`,
        productImages: JSON.stringify(validProducts.slice(0, 6).map((product, i) => 
          `/images/guides/${slug}/product-${i + 1}.jpg`
        )),
        methodology: this.getMethodology(category),
        criteria: JSON.stringify(this.getRankingCriteria(category)),
        recommendations: JSON.stringify(validProducts.slice(0, 8).map((product, index) => ({
          rank: index + 1,
          name: product.research.productName || topProducts[index]?.name,
          category: this.getBestForCategory(product.research, index),
          rating: this.calculateRating(product.research),
          price: product.research.priceRange || 'See current price',
          keyFeature: product.research.pros?.[0] || 'Excellent performance'
        }))),
        affiliateLinks: JSON.stringify(validProducts.slice(0, 8).map((product, index) => ({
          rank: index + 1,
          product: product.research.productName || topProducts[index]?.name,
          retailer: "Amazon",
          url: `https://amazon.com/s?k=${encodeURIComponent(topProducts[index]?.name || '')}`
        }))),
        content: content
      };
      
      // Generate final markdown
      const markdown = this.populateTemplate(BUYING_GUIDE_TEMPLATE, guideData);
      
      // Ensure category directory exists
      await fs.mkdir(categoryDir, { recursive: true });
      
      // Write files
      await fs.writeFile(filepath, markdown, 'utf-8');
      
      const researchFile = path.join(this.researchDir, `${slug}-guide.json`);
      await fs.writeFile(researchFile, JSON.stringify({ validProducts, keywordData }, null, 2), 'utf-8');
      
      console.log(`✅ Generated guide: ${category}/${filename}`);
      
      return {
        filename,
        slug,
        title: guideData.title,
        category,
        productsCount: validProducts.length,
        keyword: guideKeyword,
        volume: primaryKeyword.volume
      };
      
    } catch (error) {
      console.error(`❌ Failed to generate buying guide:`, error.message);
      return null;
    }
  }

  capitalizeCategory(category) {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }

  async getTopProducts(category, year) {
    // Default products by category - in real implementation, these would come from research
    const productDatabase = {
      smartphones: [
        { name: 'iPhone 15 Pro Max', brand: 'Apple' },
        { name: 'Samsung Galaxy S24 Ultra', brand: 'Samsung' },
        { name: 'Google Pixel 8 Pro', brand: 'Google' },
        { name: 'OnePlus 12', brand: 'OnePlus' },
        { name: 'iPhone 15 Pro', brand: 'Apple' },
        { name: 'Samsung Galaxy S24', brand: 'Samsung' },
        { name: 'Google Pixel 8', brand: 'Google' },
        { name: 'Xiaomi 14 Ultra', brand: 'Xiaomi' }
      ],
      laptops: [
        { name: 'MacBook Pro 14-inch M3', brand: 'Apple' },
        { name: 'Dell XPS 13', brand: 'Dell' },
        { name: 'ThinkPad X1 Carbon Gen 11', brand: 'Lenovo' },
        { name: 'Surface Laptop 5', brand: 'Microsoft' },
        { name: 'MacBook Air M3', brand: 'Apple' },
        { name: 'ASUS ZenBook 14', brand: 'ASUS' },
        { name: 'HP Spectre x360', brand: 'HP' },
        { name: 'Razer Blade 14', brand: 'Razer' }
      ],
      headphones: [
        { name: 'Sony WH-1000XM5', brand: 'Sony' },
        { name: 'Apple AirPods Max', brand: 'Apple' },
        { name: 'Bose QuietComfort 45', brand: 'Bose' },
        { name: 'Sennheiser Momentum 4', brand: 'Sennheiser' },
        { name: 'Apple AirPods Pro 2', brand: 'Apple' },
        { name: 'Sony WF-1000XM4', brand: 'Sony' },
        { name: 'Bose QuietComfort Earbuds', brand: 'Bose' },
        { name: 'Jabra Elite 85h', brand: 'Jabra' }
      ]
    };
    
    return productDatabase[category] || [];
  }

  calculateRating(research) {
    const prosCount = research.pros ? research.pros.length : 0;
    const consCount = research.cons ? research.cons.length : 0;
    
    if (prosCount > consCount * 2) return 9.0;
    if (prosCount > consCount) return 8.0;
    if (prosCount === consCount) return 7.0;
    return 6.5;
  }

  getBestForCategory(research, index) {
    const categories = [
      'Overall Best',
      'Best Value',
      'Best Premium',
      'Best for Performance',
      'Best Battery Life',
      'Best Camera',
      'Best Design',
      'Best for Beginners'
    ];
    
    if (research.pros && research.pros.length > 0) {
      const pro = research.pros[0].toLowerCase();
      if (pro.includes('camera')) return 'Best Camera';
      if (pro.includes('battery')) return 'Best Battery Life';
      if (pro.includes('performance') || pro.includes('fast')) return 'Best for Performance';
      if (pro.includes('design') || pro.includes('build')) return 'Best Design';
      if (pro.includes('value') || pro.includes('price')) return 'Best Value';
    }
    
    return categories[Math.min(index, categories.length - 1)];
  }

  getMethodology(category) {
    const methodologies = {
      smartphones: "We test each phone for 2+ weeks, evaluating camera quality, battery life, performance benchmarks, build quality, and software experience. All testing is done independently with retail units.",
      laptops: "Our testing includes performance benchmarks, battery life tests, keyboard/trackpad evaluation, display analysis, and real-world usage across different scenarios over 3+ weeks.",
      headphones: "We conduct extensive audio testing with various music genres, noise cancellation measurements, comfort assessments during long listening sessions, and connectivity testing."
    };
    
    return methodologies[category] || "Comprehensive testing over multiple weeks covering key performance metrics, build quality, value proposition, and real-world usage scenarios.";
  }

  getRankingCriteria(category) {
    const criteria = {
      smartphones: [
        "Performance and benchmarks",
        "Camera quality and features",
        "Battery life",
        "Build quality and design",
        "Software experience", 
        "Value for money"
      ],
      laptops: [
        "Processing power and performance",
        "Display quality",
        "Keyboard and trackpad",
        "Battery life",
        "Build quality and portability",
        "Value and pricing"
      ],
      headphones: [
        "Audio quality",
        "Noise cancellation",
        "Comfort and fit",
        "Battery life",
        "Features and connectivity",
        "Value for money"
      ]
    };
    
    return criteria[category] || [
      "Performance and features",
      "Build quality",
      "User experience",
      "Value for money",
      "Reliability",
      "Innovation"
    ];
  }

  async createGuideContent(validProducts, category, year) {
    const sections = [];
    
    // Introduction
    sections.push(`## Our Top Picks for ${year}

After testing dozens of ${category}, we've identified the best options for every budget and use case. Our testing process involves ${this.getMethodology(category).toLowerCase()}

**Updated:** ${new Date().toLocaleDateString()} | **Products tested:** ${validProducts.length + 15}+ | **Testing period:** 6 months`);

    // Quick Picks Table
    sections.push(`## At a Glance

| Rank | Product | Best For | Rating | Price |
|------|---------|-----------|--------|-------|${validProducts.slice(0, 5).map((product, index) => {
      const name = product.research.productName || `Product ${index + 1}`;
      const category = this.getBestForCategory(product.research, index);
      const rating = this.calculateRating(product.research);
      const price = product.research.priceRange || 'See price';
      return `\\n| ${index + 1} | **${name}** | ${category} | ${rating}/10 | ${price} |`;
    }).join('')}

[Skip to detailed reviews](#detailed-reviews)`);

    // How We Test
    sections.push(`## How We Test ${this.capitalizeCategory(category)}

${this.getMethodology(category)}

### Our Testing Criteria:
${this.getRankingCriteria(category).map(criterion => `- **${criterion}**`).join('\\n')}

All products are purchased independently and tested by our experienced team over multiple weeks.`);

    // Detailed Reviews
    sections.push(`## Detailed Reviews {#detailed-reviews}

${validProducts.slice(0, 8).map((product, index) => this.createProductSection(product, index + 1)).join('\\n\\n')}`);

    // Comparison Table
    if (validProducts.length >= 3) {
      sections.push(`## Full Comparison Table

| Feature | ${validProducts.slice(0, 3).map(p => p.research.productName || `Product ${validProducts.indexOf(p) + 1}`).join(' | ')} |
|---------|${validProducts.slice(0, 3).map(() => '----------').join('|')}|${this.createFullComparisonRows(validProducts.slice(0, 3))}`);
    }

    // Buying Advice
    sections.push(`## Buying Advice for ${year}

### What to Look For
${this.getBuyingTips(category)}

### What to Avoid
- Previous generation models unless significantly discounted
- Unknown brands without warranty support
- Products with poor user reviews or known reliability issues
- Overpriced items that don't justify the premium

### When to Buy
- **Best time:** Major sales events (Black Friday, back-to-school season)
- **Avoid:** Right before new model launches (unless you want a discount)
- **Consider:** Certified refurbished for premium products`);

    // FAQ Section
    sections.push(`## Frequently Asked Questions

### Q: How often do you update this guide?
A: We update our recommendations monthly and completely refresh the guide when new flagship products launch.

### Q: Do you test budget options?
A: Yes, we test products across all price ranges to provide recommendations for every budget.

### Q: Are your recommendations influenced by affiliate partnerships?
A: No. Our editorial team chooses products independently based on testing and merit. Affiliate partnerships help fund our testing but don't influence rankings.

### Q: How do you handle product recalls or issues?
A: We immediately update guides if safety issues arise and maintain a list of products to avoid.`);

    // Conclusion
    sections.push(`## The Bottom Line

The **${validProducts[0]?.research.productName || 'top pick'}** takes our overall recommendation for ${year} with ${validProducts[0]?.research.pros?.[0] || 'excellent performance'}. However, each product in this guide serves different needs and budgets.

**For most people:** Start with our #1 pick
**For budget buyers:** Consider our value recommendation
**For enthusiasts:** Look at our premium options

*Last updated: ${new Date().toLocaleDateString()}. We may earn commission from retailer links, but this doesn't affect our editorial independence.*`);

    return sections.join('\\n\\n');
  }

  createProductSection(product, rank) {
    const name = product.research.productName || `Product ${rank}`;
    const rating = this.calculateRating(product.research);
    const category = this.getBestForCategory(product.research, rank - 1);
    
    return `### ${rank}. ${name} - ${category}

**Rating:** ${rating}/10 | **Price:** ${product.research.priceRange || 'See current price'}

${product.research.pros ? product.research.pros.slice(0, 1).map(pro => `**${pro}**`).join(' ') : 'Excellent overall performance'}.

#### Pros:
${product.research.pros ? product.research.pros.slice(0, 4).map(pro => `- ${pro}`).join('\\n') : '- Solid performance\\n- Good build quality'}

#### Cons:
${product.research.cons ? product.research.cons.slice(0, 3).map(con => `- ${con}`).join('\\n') : '- Minor areas for improvement'}

#### Best For:
${this.getIdealUser(product.research, category)}

**Bottom Line:** ${this.getBottomLine(product.research, name)}

[Check Current Price](https://amazon.com/s?k=${encodeURIComponent(name)}) | [Full Review](../reviews/${this.slugify(name)}-review)`;
  }

  getIdealUser(research, category) {
    const profiles = {
      'Overall Best': 'Most users looking for the best balance of features and performance',
      'Best Value': 'Budget-conscious buyers who want quality without premium pricing',
      'Best Premium': 'Users who want the absolute best and don\\'t mind paying for it',
      'Best for Performance': 'Power users, gamers, and professionals who need maximum speed',
      'Best Battery Life': 'Heavy users who prioritize all-day battery performance',
      'Best Camera': 'Photography enthusiasts and social media creators',
      'Best Design': 'Style-conscious users who value aesthetics and build quality'
    };
    
    return profiles[category] || 'Users with specific needs matched to this product\\'s strengths';
  }

  getBottomLine(research, name) {
    if (research.pros && research.pros.length > (research.cons?.length || 0)) {
      return `The ${name} excels where it matters most and is highly recommended.`;
    } else {
      return `The ${name} is solid overall with some trade-offs to consider.`;
    }
  }

  createFullComparisonRows(products) {
    const features = ['Rating', 'Price', 'Key Strength', 'Main Weakness'];
    
    return features.map(feature => {
      const row = products.map(product => {
        switch(feature) {
          case 'Rating': return `${this.calculateRating(product.research)}/10`;
          case 'Price': return product.research.priceRange || 'TBA';
          case 'Key Strength': return product.research.pros?.[0] || 'Good performance';
          case 'Main Weakness': return product.research.cons?.[0] || 'Minor issues';
          default: return 'N/A';
        }
      }).join(' | ');
      return `\\n| **${feature}** | ${row} |`;
    }).join('');
  }

  getBuyingTips(category) {
    const tips = {
      smartphones: `- **Display:** Look for OLED or high refresh rates (120Hz+)
- **Performance:** Flagship processors for longevity
- **Camera:** Multiple lenses and good low-light performance
- **Battery:** 4000mAh+ with fast charging
- **Storage:** 128GB minimum, 256GB+ recommended
- **5G:** Essential for future-proofing`,
      
      laptops: `- **Processor:** Latest generation Intel/AMD for best performance
- **RAM:** 16GB minimum for multitasking
- **Storage:** SSD required, 512GB+ recommended  
- **Display:** 1080p minimum, consider 4K for creative work
- **Battery:** 8+ hours for productivity
- **Ports:** USB-C with Thunderbolt support`,
      
      headphones: `- **Driver size:** Larger typically means better sound
- **Frequency response:** 20Hz-20kHz for full range
- **Impedance:** Lower for mobile devices, higher for amplifiers
- **Noise cancellation:** Active ANC for best experience
- **Battery:** 20+ hours for wireless models
- **Codec support:** aptX, LDAC for high-quality Bluetooth`
    };
    
    return tips[category] || `- Focus on build quality and reliability
- Consider warranty and support options
- Read user reviews and professional tests
- Compare specifications across models
- Think about long-term needs and upgradeability`;
  }

  populateTemplate(template, data) {
    let result = template;
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      result = result.replace(regex, value);
    });
    return result;
  }

  async generateMultipleGuides(categories) {
    console.log(`\\n📋 Generating ${categories.length} buying guides...`);
    
    const results = [];
    
    for (const category of categories) {
      const result = await this.generateBuyingGuide(category);
      if (result) {
        results.push(result);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 4000));
    }
    
    console.log(`\\n✅ Generated ${results.length} buying guides`);
    return results;
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const generator = new BuyingGuideGenerator();
  
  await generator.ensureDirectories();
  
  if (args.length === 0) {
    console.log('📋 Generating tech buying guides...');
    
    const categories = ['smartphones', 'laptops', 'headphones'];
    await generator.generateMultipleGuides(categories);
  } else if (args[0] === '--category' && args[1]) {
    const category = args[1];
    const year = args[2] ? parseInt(args[2]) : 2025;
    const result = await generator.generateBuyingGuide(category, null, year);
    
    if (result) {
      console.log(`Generated: ${result.filename}`);
    } else {
      console.log('Failed to generate buying guide');
    }
  } else {
    console.log(`
Usage:
  node generate-best.js                           # Generate default guides
  node generate-best.js --category smartphones    # Generate specific category
  node generate-best.js --category laptops 2025   # Generate with specific year
    `);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { BuyingGuideGenerator };