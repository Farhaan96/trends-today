/**
 * Internal Link Manager
 * Intelligent internal linking system following Le Ravi's strategy
 * Creates natural, contextual links between related content
 */

const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');

class InternalLinkManager {
  constructor() {
    this.contentDir = path.join(process.cwd(), 'content');
    this.articleDatabase = new Map();
    this.linkGraph = new Map();
    this.initialized = false;
    
    // Le Ravi linking guidelines
    this.linkingRules = {
      linksPerArticle: { min: 4, max: 8, optimal: 6 },
      linkDensity: '2-3 links per 500 words',
      placement: {
        introduction: 1,
        bodyContent: '2-3',
        conclusion: 1,
        relatedSection: '2-3'
      },
      anchorTextRules: {
        maxLength: 6, // words
        naturalPhrases: true,
        avoidKeywordStuffing: true,
        useDescriptive: true
      }
    };

    // Categories for cross-linking
    this.categories = ['science', 'culture', 'psychology', 'technology', 'health', 'space'];
  }

  /**
   * Initialize the article database
   */
  async initialize() {
    if (this.initialized) return;
    
    console.log('🔗 Initializing Internal Link Manager...');
    await this.scanContentDirectory();
    this.buildLinkGraph();
    this.initialized = true;
    console.log(`  ✅ Loaded ${this.articleDatabase.size} articles into link database`);
  }

  /**
   * Scan content directory and build article database
   */
  async scanContentDirectory() {
    for (const category of this.categories) {
      const categoryPath = path.join(this.contentDir, category);
      
      try {
        const files = await fs.readdir(categoryPath);
        const mdxFiles = files.filter(f => f.endsWith('.mdx'));
        
        for (const file of mdxFiles) {
          const filePath = path.join(categoryPath, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const { data, content: body } = matter(content);
          
          const articleId = `${category}/${file.replace('.mdx', '')}`;
          
          this.articleDatabase.set(articleId, {
            id: articleId,
            category,
            title: data.title,
            slug: file.replace('.mdx', ''),
            keywords: this.extractKeywords(data, body),
            description: data.description,
            publishedAt: data.publishedAt,
            wordCount: body.split(' ').length,
            topics: this.extractTopics(body),
            url: `/${category}/${file.replace('.mdx', '')}`
          });
        }
      } catch (error) {
        // Category directory might not exist yet
        continue;
      }
    }
  }

  /**
   * Extract keywords from article metadata and content
   */
  extractKeywords(metadata, content) {
    const keywords = new Set();
    
    // Add SEO keywords if present
    if (metadata.seo && metadata.seo.keywords) {
      metadata.seo.keywords.forEach(kw => keywords.add(kw.toLowerCase()));
    }
    
    // Add title words (excluding common words)
    if (metadata.title) {
      this.extractImportantWords(metadata.title).forEach(word => keywords.add(word));
    }
    
    // Extract important phrases from content
    const importantPhrases = this.extractImportantPhrases(content);
    importantPhrases.forEach(phrase => keywords.add(phrase));
    
    return Array.from(keywords);
  }

  /**
   * Extract important words from text
   */
  extractImportantWords(text) {
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
      'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might'
    ]);
    
    return text
      .toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 3 && !commonWords.has(word));
  }

  /**
   * Extract important phrases from content
   */
  extractImportantPhrases(content) {
    const phrases = [];
    
    // Extract headers (H2, H3)
    const headerMatches = content.match(/^#{2,3}\s+(.+)$/gm) || [];
    headerMatches.forEach(header => {
      const cleanHeader = header.replace(/^#+\s+/, '').toLowerCase();
      phrases.push(cleanHeader);
    });
    
    // Extract bold/emphasized text
    const boldMatches = content.match(/\*\*(.+?)\*\*/g) || [];
    boldMatches.forEach(bold => {
      const cleanBold = bold.replace(/\*\*/g, '').toLowerCase();
      if (cleanBold.split(' ').length <= 4) {
        phrases.push(cleanBold);
      }
    });
    
    return phrases;
  }

  /**
   * Extract topics from content
   */
  extractTopics(content) {
    const topics = new Set();
    
    // Technology topics
    const techTerms = ['AI', 'artificial intelligence', 'machine learning', 'blockchain', 'quantum', 'robot', 'algorithm', 'software', 'hardware'];
    
    // Science topics
    const scienceTerms = ['physics', 'chemistry', 'biology', 'research', 'study', 'experiment', 'discovery', 'theory', 'hypothesis'];
    
    // Health topics
    const healthTerms = ['health', 'wellness', 'medical', 'disease', 'treatment', 'therapy', 'nutrition', 'exercise', 'mental health'];
    
    // Psychology topics
    const psychTerms = ['psychology', 'behavior', 'mind', 'cognitive', 'emotional', 'personality', 'mental', 'consciousness'];
    
    // Culture topics
    const cultureTerms = ['culture', 'society', 'trend', 'generation', 'social', 'community', 'tradition', 'movement'];
    
    // Space topics
    const spaceTerms = ['space', 'NASA', 'planet', 'star', 'galaxy', 'universe', 'astronomy', 'cosmic', 'satellite'];
    
    const allTerms = [...techTerms, ...scienceTerms, ...healthTerms, ...psychTerms, ...cultureTerms, ...spaceTerms];
    
    const contentLower = content.toLowerCase();
    allTerms.forEach(term => {
      if (contentLower.includes(term.toLowerCase())) {
        topics.add(term);
      }
    });
    
    return Array.from(topics);
  }

  /**
   * Build a link graph for intelligent linking
   */
  buildLinkGraph() {
    for (const [articleId, article] of this.articleDatabase) {
      const relatedArticles = this.findRelatedArticles(article);
      this.linkGraph.set(articleId, relatedArticles);
    }
  }

  /**
   * Find related articles using multiple signals
   */
  findRelatedArticles(article) {
    const scores = new Map();
    
    for (const [otherId, other] of this.articleDatabase) {
      if (otherId === article.id) continue;
      
      let score = 0;
      
      // Same category bonus
      if (article.category === other.category) {
        score += 10;
      }
      
      // Cross-category linking (Le Ravi style)
      const crossCategoryBonus = this.getCrossCategoryBonus(article.category, other.category);
      score += crossCategoryBonus;
      
      // Keyword overlap
      const keywordOverlap = this.calculateOverlap(article.keywords, other.keywords);
      score += keywordOverlap * 20;
      
      // Topic overlap
      const topicOverlap = this.calculateOverlap(article.topics, other.topics);
      score += topicOverlap * 15;
      
      // Temporal relevance (prefer newer content)
      const ageDiff = Math.abs(new Date(article.publishedAt) - new Date(other.publishedAt));
      const daysDiff = ageDiff / (1000 * 60 * 60 * 24);
      if (daysDiff < 30) score += 5;
      if (daysDiff < 7) score += 10;
      
      scores.set(otherId, score);
    }
    
    // Sort by score and return top related articles
    return Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([id, score]) => ({ id, score, article: this.articleDatabase.get(id) }));
  }

  /**
   * Get cross-category linking bonus (Le Ravi style)
   */
  getCrossCategoryBonus(cat1, cat2) {
    const crossLinks = {
      'science-technology': 8,
      'science-space': 10,
      'science-health': 7,
      'technology-space': 8,
      'technology-culture': 6,
      'health-psychology': 9,
      'psychology-culture': 8,
      'culture-technology': 7,
      'space-technology': 9
    };
    
    const key = [cat1, cat2].sort().join('-');
    return crossLinks[key] || 3;
  }

  /**
   * Calculate overlap between two arrays
   */
  calculateOverlap(arr1, arr2) {
    if (!arr1 || !arr2 || arr1.length === 0 || arr2.length === 0) return 0;
    
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
    const intersection = Array.from(set1).filter(x => set2.has(x));
    
    return intersection.length / Math.max(set1.size, set2.size);
  }

  /**
   * Add internal links to article content
   */
  async addInternalLinks(content, currentArticle, options = {}) {
    await this.initialize();
    
    const {
      maxLinks = 6,
      preferSameCategory = false,
      includeRelatedSection = true
    } = options;
    
    // Find related articles
    const relatedArticles = this.linkGraph.get(currentArticle.id) || 
                           this.findRelatedArticles(currentArticle);
    
    // Select articles for linking
    const selectedForBody = relatedArticles.slice(0, maxLinks - 2);
    const selectedForRelated = relatedArticles.slice(maxLinks - 2, maxLinks + 3);
    
    // Add contextual links within content
    let linkedContent = content;
    let linksAdded = 0;
    
    for (const related of selectedForBody) {
      if (linksAdded >= maxLinks - 2) break;
      
      const linkText = this.generateNaturalAnchorText(related.article);
      const linkPattern = this.findLinkablePhrase(linkedContent, related.article);
      
      if (linkPattern) {
        const link = `[${linkPattern}](${related.article.url})`;
        linkedContent = linkedContent.replace(linkPattern, link);
        linksAdded++;
      }
    }
    
    // Add related articles section
    if (includeRelatedSection && selectedForRelated.length > 0) {
      const relatedSection = this.generateRelatedSection(selectedForRelated);
      linkedContent += '\n\n' + relatedSection;
    }
    
    return {
      content: linkedContent,
      linksAdded,
      relatedArticles: selectedForRelated.map(r => r.article)
    };
  }

  /**
   * Generate natural anchor text for a link
   */
  generateNaturalAnchorText(article) {
    // Extract key phrase from title
    const titleWords = article.title.split(' ');
    
    // Prefer 2-4 word phrases
    if (titleWords.length <= 4) {
      return article.title.toLowerCase();
    }
    
    // Find the most important phrase
    const importantWords = this.extractImportantWords(article.title);
    if (importantWords.length >= 2 && importantWords.length <= 4) {
      return importantWords.join(' ');
    }
    
    // Use first few words
    return titleWords.slice(0, 3).join(' ').toLowerCase();
  }

  /**
   * Find a linkable phrase in content
   */
  findLinkablePhrase(content, targetArticle) {
    // Look for mentions of keywords
    for (const keyword of targetArticle.keywords) {
      if (keyword.split(' ').length <= 4) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'i');
        if (regex.test(content) && !content.includes(`[${keyword}]`)) {
          return keyword;
        }
      }
    }
    
    // Look for topic mentions
    for (const topic of targetArticle.topics) {
      const regex = new RegExp(`\\b${topic}\\b`, 'i');
      if (regex.test(content) && !content.includes(`[${topic}]`)) {
        return topic;
      }
    }
    
    return null;
  }

  /**
   * Generate related articles section
   */
  generateRelatedSection(relatedArticles) {
    let section = '## Related Articles You Might Enjoy\n\n';
    
    for (const related of relatedArticles) {
      const article = related.article;
      section += `- **[${article.title}](${article.url})**: ${this.generateTeaser(article)}\n`;
    }
    
    section += '\n---\n\n*Explore more fascinating discoveries in our [';
    
    // Add category links
    const categories = [...new Set(relatedArticles.map(r => r.article.category))];
    const categoryLinks = categories.map(cat => `[${cat}](/${cat})`).join(', ');
    section += categoryLinks + '] sections.*';
    
    return section;
  }

  /**
   * Generate article teaser
   */
  generateTeaser(article) {
    if (article.description) {
      // Truncate to first sentence or 100 chars
      const firstSentence = article.description.match(/^[^.!?]+[.!?]/);
      if (firstSentence) {
        return firstSentence[0];
      }
      return article.description.substring(0, 100) + '...';
    }
    
    // Generate from keywords
    const keywords = article.keywords.slice(0, 3).join(', ');
    return `Discover insights about ${keywords}`;
  }

  /**
   * Analyze existing content for link opportunities
   */
  async analyzeContentForLinks(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    const { data, content: body } = matter(content);
    
    // Extract article info
    const article = {
      id: path.basename(filePath, '.mdx'),
      category: path.basename(path.dirname(filePath)),
      title: data.title,
      keywords: this.extractKeywords(data, body),
      topics: this.extractTopics(body)
    };
    
    // Find link opportunities
    await this.initialize();
    const opportunities = this.findRelatedArticles(article);
    
    // Analyze current links
    const currentLinks = (body.match(/\[([^\]]+)\]\(([^)]+)\)/g) || []).length;
    const wordCount = body.split(' ').length;
    const idealLinks = Math.floor(wordCount / 500) * 2.5; // 2-3 links per 500 words
    
    return {
      currentLinks,
      idealLinks: Math.round(idealLinks),
      deficit: Math.max(0, Math.round(idealLinks) - currentLinks),
      opportunities: opportunities.slice(0, 10),
      wordCount
    };
  }

  /**
   * Batch process multiple articles for link optimization
   */
  async optimizeLinksForCategory(category) {
    await this.initialize();
    
    const categoryPath = path.join(this.contentDir, category);
    const files = await fs.readdir(categoryPath);
    const mdxFiles = files.filter(f => f.endsWith('.mdx'));
    
    const results = [];
    
    for (const file of mdxFiles) {
      const filePath = path.join(categoryPath, file);
      const analysis = await this.analyzeContentForLinks(filePath);
      
      results.push({
        file,
        ...analysis
      });
    }
    
    return results;
  }
}

module.exports = InternalLinkManager;

// Example usage
if (require.main === module) {
  const manager = new InternalLinkManager();
  
  async function test() {
    console.log('\n🔗 Internal Link Manager - Test Run\n');
    
    // Initialize the manager
    await manager.initialize();
    
    // Test article
    const testArticle = {
      id: 'technology/ai-breakthrough-2025',
      category: 'technology',
      title: 'AI Breakthrough Changes Everything in 2025',
      keywords: ['artificial intelligence', 'machine learning', 'neural networks', 'AI breakthrough'],
      topics: ['AI', 'technology', 'innovation'],
      publishedAt: new Date().toISOString()
    };
    
    // Find related articles
    console.log('Finding related articles for:', testArticle.title);
    const related = manager.findRelatedArticles(testArticle);
    
    console.log('\nTop 5 related articles:');
    related.slice(0, 5).forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.article?.title || 'Unknown'} (Score: ${r.score})`);
    });
    
    // Test content linking
    const testContent = `
# AI Breakthrough Changes Everything in 2025

The world of artificial intelligence has reached a turning point. Recent developments in machine learning 
have shown that neural networks can now achieve what was thought impossible just a year ago.

## The Discovery

Scientists at MIT have discovered a new approach to AI that could revolutionize technology as we know it. 
This breakthrough in quantum computing paired with advanced algorithms has opened doors we didn't know existed.

## What This Means

The implications for healthcare, education, and space exploration are profound. As we continue to explore 
these possibilities, one thing becomes clear: the future is arriving faster than expected.
`;
    
    console.log('\n\nAdding internal links to test content...');
    const result = await manager.addInternalLinks(testContent, testArticle);
    
    console.log(`  ✅ Links added: ${result.linksAdded}`);
    console.log(`  ✅ Related articles section included: ${result.relatedArticles.length} articles`);
  }
  
  test().catch(console.error);
}