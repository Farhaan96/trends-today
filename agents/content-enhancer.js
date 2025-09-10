#!/usr/bin/env node

/**
 * Content Enhancer Agent - Le Ravi Style Internal Linking
 * 
 * This agent enhances existing content with:
 * - Strategic internal links (4-6 per article)
 * - Natural anchor text
 * - Cross-topic linking
 * - Author attribution
 * - Related content sections
 */

const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');

class ContentEnhancer {
  constructor() {
    this.contentDir = path.join(process.cwd(), 'content');
    this.linksDatabase = new Map();
  }

  async init() {
    // Build database of all articles for linking
    await this.buildLinksDatabase();
  }

  async buildLinksDatabase() {
    console.log('📚 Building content database for internal linking...');
    
    const categories = ['reviews', 'news', 'best', 'guides'];
    
    for (const category of categories) {
      const categoryPath = path.join(this.contentDir, category);
      
      try {
        const files = await fs.readdir(categoryPath);
        
        for (const file of files) {
          if (!file.endsWith('.mdx') && !file.endsWith('.md')) continue;
          
          const filePath = path.join(categoryPath, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const { data: frontmatter } = matter(content);
          
          const slug = file.replace(/\.(mdx|md)$/, '');
          const href = `/${category}/${slug}`;
          
          this.linksDatabase.set(href, {
            title: frontmatter.title,
            category: frontmatter.category || category,
            description: frontmatter.description || frontmatter.summary,
            keywords: this.extractKeywords(frontmatter.title),
            author: frontmatter.author,
            publishedAt: frontmatter.publishedAt || frontmatter.datePublished
          });
        }
      } catch (error) {
        console.log(`⚠️ Category ${category} not found, skipping...`);
      }
    }
    
    console.log(`✅ Database built with ${this.linksDatabase.size} articles`);
  }

  extractKeywords(title) {
    // Extract meaningful keywords for matching
    const keywords = [];
    
    // Product names
    const products = title.match(/iPhone \d+|Galaxy S\d+|Pixel \d+|MacBook \w+|iPad \w+/gi);
    if (products) keywords.push(...products.map(p => p.toLowerCase()));
    
    // Key terms
    const terms = ['review', 'guide', 'best', 'vs', 'comparison', 'how to', 'tips'];
    terms.forEach(term => {
      if (title.toLowerCase().includes(term)) {
        keywords.push(term);
      }
    });
    
    return keywords;
  }

  findRelatedArticles(currentHref, category, limit = 6) {
    const related = [];
    const current = this.linksDatabase.get(currentHref);
    if (!current) return related;
    
    // Strategy 1: Same category articles
    const sameCategory = Array.from(this.linksDatabase.entries())
      .filter(([href, article]) => 
        href !== currentHref && 
        article.category === category
      )
      .slice(0, Math.floor(limit / 2));
    
    related.push(...sameCategory);
    
    // Strategy 2: Cross-topic with keyword matches
    const crossTopic = Array.from(this.linksDatabase.entries())
      .filter(([href, article]) => {
        if (href === currentHref || article.category === category) return false;
        
        // Check for keyword overlaps
        const hasKeywordMatch = current.keywords.some(kw => 
          article.keywords.includes(kw) ||
          article.title.toLowerCase().includes(kw)
        );
        
        return hasKeywordMatch;
      })
      .slice(0, Math.ceil(limit / 2));
    
    related.push(...crossTopic);
    
    return related.slice(0, limit).map(([href, article]) => ({
      href,
      text: this.generateAnchorText(article.title, article.category),
      title: article.title,
      context: article.description
    }));
  }

  generateAnchorText(title, category) {
    // Generate natural anchor text variations
    const patterns = [
      { match: /review/i, anchors: ['our detailed analysis', 'comprehensive review', 'in-depth look'] },
      { match: /best/i, anchors: ['top recommendations', 'curated selection', 'expert picks'] },
      { match: /vs|versus/i, anchors: ['comparison guide', 'head-to-head analysis', 'detailed comparison'] },
      { match: /how to/i, anchors: ['step-by-step guide', 'complete tutorial', 'practical guide'] },
      { match: /guide/i, anchors: ['comprehensive guide', 'ultimate resource', 'complete overview'] }
    ];
    
    for (const pattern of patterns) {
      if (pattern.match.test(title)) {
        const anchor = pattern.anchors[Math.floor(Math.random() * pattern.anchors.length)];
        return anchor;
      }
    }
    
    // Extract key product/topic
    const productMatch = title.match(/iPhone \d+|Galaxy S\d+|Pixel \d+|MacBook \w+/i);
    if (productMatch) {
      return productMatch[0].toLowerCase() + ' coverage';
    }
    
    // Fallback: use first few significant words
    const words = title.split(' ').filter(w => w.length > 3);
    return words.slice(0, 3).join(' ').toLowerCase();
  }

  insertInternalLinks(content, links) {
    // Insert links naturally throughout the content
    let enhancedContent = content;
    let linksInserted = 0;
    const maxLinks = 4;
    
    // Strategy: Find good insertion points
    const paragraphs = content.split('\n\n');
    const targetPositions = [
      Math.floor(paragraphs.length * 0.25), // 25% through
      Math.floor(paragraphs.length * 0.5),  // 50% through
      Math.floor(paragraphs.length * 0.75), // 75% through
      paragraphs.length - 2                  // Near end
    ];
    
    links.forEach((link, index) => {
      if (linksInserted >= maxLinks) return;
      
      const position = targetPositions[index] || Math.floor(paragraphs.length / 2);
      if (position < paragraphs.length && paragraphs[position]) {
        // Add contextual link at end of paragraph
        const linkText = `For more insights, check out our [${link.text}](${link.href}).`;
        paragraphs[position] += `\n\n${linkText}`;
        linksInserted++;
      }
    });
    
    return paragraphs.join('\n\n');
  }

  async enhanceArticle(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const { data: frontmatter, content: body } = matter(content);
      
      // Determine article href
      const category = path.basename(path.dirname(filePath));
      const slug = path.basename(filePath).replace(/\.(mdx|md)$/, '');
      const href = `/${category}/${slug}`;
      
      // Find related articles
      const relatedArticles = this.findRelatedArticles(href, category);
      
      // Add internal links metadata to frontmatter
      frontmatter.internalLinks = relatedArticles.map(r => ({
        href: r.href,
        title: r.title
      }));
      
      // Add author bio if missing
      if (typeof frontmatter.author === 'string' && !frontmatter.authorBio) {
        frontmatter.authorBio = this.generateAuthorBio(frontmatter.author);
      }
      
      // Insert links into content
      const enhancedBody = this.insertInternalLinks(body, relatedArticles);
      
      // Add related articles section at the end
      const relatedSection = this.generateRelatedSection(relatedArticles);
      const finalContent = enhancedBody + '\n\n' + relatedSection;
      
      // Rebuild the file
      const newContent = matter.stringify(finalContent, frontmatter);
      await fs.writeFile(filePath, newContent);
      
      console.log(`✅ Enhanced: ${path.basename(filePath)} with ${relatedArticles.length} internal links`);
      return true;
    } catch (error) {
      console.error(`❌ Error enhancing ${filePath}:`, error.message);
      return false;
    }
  }

  generateAuthorBio(authorName) {
    const bios = {
      'Alex Chen': 'Tech enthusiast with over 10 years of experience reviewing consumer electronics. Specializes in smartphones, laptops, and emerging technologies.',
      'Sarah Martinez': 'Senior technology writer focusing on smart home devices, wearables, and fitness tech. Passionate about how technology improves daily life.',
      'David Kim': 'Gaming and PC hardware expert. Builds custom rigs and benchmarks the latest components to help readers make informed decisions.',
      'Emma Thompson': 'Digital lifestyle journalist covering productivity tools, creative software, and remote work solutions.'
    };
    
    return bios[authorName] || `${authorName} is a technology writer at Trends Today, covering the latest in consumer electronics and digital innovation.`;
  }

  generateRelatedSection(relatedArticles) {
    if (relatedArticles.length === 0) return '';
    
    let section = '## Related Articles\n\n';
    section += "Based on your interest in this article, we recommend checking out:\n\n";
    
    relatedArticles.slice(0, 3).forEach(article => {
      section += `- [${article.title}](${article.href}) - ${article.context || 'Read more'}\n`;
    });
    
    return section;
  }

  async enhanceAllContent() {
    console.log('🚀 Starting content enhancement with Le Ravi-style internal linking...\n');
    
    await this.init();
    
    const categories = ['reviews', 'news', 'best', 'guides'];
    let totalEnhanced = 0;
    
    for (const category of categories) {
      const categoryPath = path.join(this.contentDir, category);
      
      try {
        const files = await fs.readdir(categoryPath);
        console.log(`\n📁 Processing ${category} (${files.length} files)...`);
        
        for (const file of files) {
          if (!file.endsWith('.mdx') && !file.endsWith('.md')) continue;
          
          const filePath = path.join(categoryPath, file);
          const success = await this.enhanceArticle(filePath);
          if (success) totalEnhanced++;
        }
      } catch (error) {
        console.log(`⚠️ Category ${category} not found, skipping...`);
      }
    }
    
    console.log(`\n✨ Enhancement complete! Enhanced ${totalEnhanced} articles with internal links.`);
    console.log('💡 Each article now includes:');
    console.log('   - 4-6 strategic internal links');
    console.log('   - Natural anchor text variations');
    console.log('   - Cross-topic discovery links');
    console.log('   - Related articles section');
    console.log('   - Author attribution');
  }
}

// Run the enhancer
if (require.main === module) {
  const enhancer = new ContentEnhancer();
  enhancer.enhanceAllContent().catch(console.error);
}

module.exports = ContentEnhancer;