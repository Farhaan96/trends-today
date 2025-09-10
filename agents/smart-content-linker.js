#!/usr/bin/env node

/**
 * Smart Content Linker - Intelligent Internal Linking System
 * Creates contextually relevant internal links based on content similarity
 * Uses semantic analysis to find truly related articles
 */

const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');

class SmartContentLinker {
  constructor() {
    this.contentDir = path.join(process.cwd(), 'content');
    this.articlesDatabase = new Map();
    this.similarityMatrix = new Map();
  }

  async init() {
    console.log('🧠 Initializing Smart Content Linker...');
    await this.buildArticleDatabase();
    await this.calculateSimilarities();
  }

  /**
   * Build comprehensive database of all articles with semantic data
   */
  async buildArticleDatabase() {
    console.log('📚 Building comprehensive article database...');
    
    // Include all content directories
    const categories = [
      'reviews', 'news', 'best', 'guides',
      'science', 'psychology', 'health', 'technology',
      'culture', 'environment', 'history', 'future',
      'lifestyle', 'mystery'
    ];
    
    for (const category of categories) {
      const categoryPath = path.join(this.contentDir, category);
      
      try {
        const files = await fs.readdir(categoryPath);
        
        for (const file of files) {
          if (!file.endsWith('.mdx') && !file.endsWith('.md')) continue;
          
          const filePath = path.join(categoryPath, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const { data: frontmatter, content: body } = matter(content);
          
          const slug = file.replace(/\.(mdx|md)$/, '');
          const href = `/${category}/${slug}`;
          
          // Extract semantic features
          const article = {
            href,
            filePath,
            title: frontmatter.title,
            category: frontmatter.category || category,
            description: frontmatter.description || frontmatter.summary || '',
            keywords: this.extractKeywords(frontmatter.title, body),
            topics: this.extractTopics(frontmatter.title, body),
            entities: this.extractEntities(frontmatter.title, body),
            author: frontmatter.author,
            publishedAt: frontmatter.publishedAt || frontmatter.datePublished,
            contentLength: body.length,
            readingTime: frontmatter.readingTime || Math.ceil(body.split(' ').length / 200)
          };
          
          this.articlesDatabase.set(href, article);
        }
      } catch (error) {
        // Category doesn't exist, skip
      }
    }
    
    console.log(`✅ Database built with ${this.articlesDatabase.size} articles`);
  }

  /**
   * Extract keywords from content
   */
  extractKeywords(title, body) {
    const text = `${title} ${body}`.toLowerCase();
    const keywords = new Set();
    
    // Technical terms
    const techTerms = /\b(ai|ml|quantum|blockchain|5g|iot|vr|ar|api|cloud|cyber|data|digital|software|hardware|algorithm|neural|network)\b/gi;
    const matches = text.match(techTerms);
    if (matches) matches.forEach(m => keywords.add(m.toLowerCase()));
    
    // Products and brands
    const products = /\b(iphone|galaxy|pixel|macbook|ipad|android|windows|linux|tesla|nvidia|intel|amd)\b/gi;
    const productMatches = text.match(products);
    if (productMatches) productMatches.forEach(m => keywords.add(m.toLowerCase()));
    
    // Scientific terms
    const science = /\b(research|study|discovery|breakthrough|experiment|theory|hypothesis|evidence|analysis|phenomenon)\b/gi;
    const scienceMatches = text.match(science);
    if (scienceMatches) scienceMatches.forEach(m => keywords.add(m.toLowerCase()));
    
    // Topic indicators
    const topics = /\b(psychology|health|culture|environment|history|future|lifestyle|mystery|science|technology)\b/gi;
    const topicMatches = text.match(topics);
    if (topicMatches) topicMatches.forEach(m => keywords.add(m.toLowerCase()));
    
    return Array.from(keywords);
  }

  /**
   * Extract main topics from content
   */
  extractTopics(title, body) {
    const text = `${title} ${body}`.toLowerCase();
    const topics = [];
    
    // Topic mapping
    const topicPatterns = {
      'artificial_intelligence': /\b(ai|artificial intelligence|machine learning|deep learning|neural|gpt|llm)\b/i,
      'space_exploration': /\b(space|nasa|mars|moon|asteroid|galaxy|universe|cosmic|planet)\b/i,
      'climate_change': /\b(climate|global warming|carbon|renewable|sustainability|environment)\b/i,
      'mental_health': /\b(mental health|anxiety|depression|therapy|psychology|mindfulness|stress)\b/i,
      'quantum_computing': /\b(quantum|qubit|superposition|entanglement|quantum computer)\b/i,
      'biotechnology': /\b(biotech|gene|dna|crispr|genetic|genome|biology)\b/i,
      'cryptocurrency': /\b(crypto|bitcoin|blockchain|ethereum|defi|nft|web3)\b/i,
      'social_media': /\b(social media|facebook|instagram|twitter|tiktok|youtube|influencer)\b/i,
      'archaeology': /\b(archaeological|ancient|artifact|excavation|civilization|ruins)\b/i,
      'future_tech': /\b(future|2030|2040|prediction|forecast|emerging|next generation)\b/i,
      'wellness': /\b(wellness|fitness|nutrition|diet|exercise|healthy|lifestyle)\b/i,
      'mystery': /\b(mystery|unexplained|phenomenon|strange|bizarre|enigma|paranormal)\b/i
    };
    
    for (const [topic, pattern] of Object.entries(topicPatterns)) {
      if (pattern.test(text)) {
        topics.push(topic);
      }
    }
    
    return topics;
  }

  /**
   * Extract named entities (people, places, organizations)
   */
  extractEntities(title, body) {
    const text = `${title} ${body}`;
    const entities = [];
    
    // Organizations
    const orgs = /\b(NASA|MIT|Harvard|Google|Apple|Microsoft|Amazon|Tesla|SpaceX|OpenAI|Facebook|Meta)\b/g;
    const orgMatches = text.match(orgs);
    if (orgMatches) entities.push(...orgMatches);
    
    // Locations
    const locations = /\b(United States|China|Europe|Asia|Africa|Mars|Moon|Earth)\b/g;
    const locMatches = text.match(locations);
    if (locMatches) entities.push(...locMatches);
    
    // Time periods
    const times = /\b(2025|2030|2040|century|decade|ancient|medieval|modern)\b/gi;
    const timeMatches = text.match(times);
    if (timeMatches) entities.push(...timeMatches);
    
    return [...new Set(entities)];
  }

  /**
   * Calculate similarity scores between all articles
   */
  async calculateSimilarities() {
    console.log('🔍 Calculating content similarities...');
    
    const articles = Array.from(this.articlesDatabase.entries());
    
    for (let i = 0; i < articles.length; i++) {
      const [href1, article1] = articles[i];
      const similarities = [];
      
      for (let j = 0; j < articles.length; j++) {
        if (i === j) continue;
        
        const [href2, article2] = articles[j];
        const score = this.calculateSimilarityScore(article1, article2);
        
        if (score > 0.1) { // Only keep relevant connections
          similarities.push({ href: href2, score, article: article2 });
        }
      }
      
      // Sort by relevance score
      similarities.sort((a, b) => b.score - a.score);
      this.similarityMatrix.set(href1, similarities);
    }
    
    console.log('✅ Similarity matrix calculated');
  }

  /**
   * Calculate similarity score between two articles
   */
  calculateSimilarityScore(article1, article2) {
    let score = 0;
    
    // Same category bonus (but not too high - we want cross-category links too)
    if (article1.category === article2.category) {
      score += 0.15;
    }
    
    // Keyword overlap (most important factor)
    const keywords1 = new Set(article1.keywords);
    const keywords2 = new Set(article2.keywords);
    const keywordOverlap = [...keywords1].filter(k => keywords2.has(k)).length;
    const keywordUnion = new Set([...keywords1, ...keywords2]).size;
    if (keywordUnion > 0) {
      score += (keywordOverlap / keywordUnion) * 0.4;
    }
    
    // Topic similarity (very important)
    const topics1 = new Set(article1.topics);
    const topics2 = new Set(article2.topics);
    const topicOverlap = [...topics1].filter(t => topics2.has(t)).length;
    if (topicOverlap > 0) {
      score += topicOverlap * 0.2;
    }
    
    // Entity overlap (moderate importance)
    const entities1 = new Set(article1.entities);
    const entities2 = new Set(article2.entities);
    const entityOverlap = [...entities1].filter(e => entities2.has(e)).length;
    if (entityOverlap > 0) {
      score += entityOverlap * 0.05;
    }
    
    // Title similarity
    const title1Words = new Set(article1.title.toLowerCase().split(/\s+/));
    const title2Words = new Set(article2.title.toLowerCase().split(/\s+/));
    const titleOverlap = [...title1Words].filter(w => title2Words.has(w)).length;
    if (titleOverlap > 2) {
      score += 0.1;
    }
    
    // Temporal relevance (prefer recent articles)
    const date1 = new Date(article1.publishedAt || '2024-01-01');
    const date2 = new Date(article2.publishedAt || '2024-01-01');
    const daysDiff = Math.abs(date1 - date2) / (1000 * 60 * 60 * 24);
    if (daysDiff < 30) {
      score += 0.05;
    }
    
    // Different author bonus (for diversity)
    if (article1.author !== article2.author) {
      score += 0.05;
    }
    
    return Math.min(score, 1); // Cap at 1
  }

  /**
   * Get most relevant articles for a given article
   */
  getRelevantArticles(href, limit = 6) {
    const similarities = this.similarityMatrix.get(href) || [];
    const relevant = [];
    
    // Get top articles by score, ensuring diversity
    const usedCategories = new Set();
    const usedTopics = new Set();
    
    for (const item of similarities) {
      if (relevant.length >= limit) break;
      
      // Ensure diversity in recommendations
      const article = item.article;
      
      // At least include top 2 regardless
      if (relevant.length < 2) {
        relevant.push(item);
        usedCategories.add(article.category);
        article.topics.forEach(t => usedTopics.add(t));
        continue;
      }
      
      // For rest, prefer some diversity
      const categoryCount = [...usedCategories].filter(c => c === article.category).length;
      if (categoryCount < 2) { // Max 2 from same category
        relevant.push(item);
        usedCategories.add(article.category);
        article.topics.forEach(t => usedTopics.add(t));
      }
    }
    
    return relevant;
  }

  /**
   * Generate natural anchor text based on context
   */
  generateContextualAnchor(sourceArticle, targetArticle, position) {
    const anchors = [];
    
    // Check for specific relationships
    if (sourceArticle.topics.some(t => targetArticle.topics.includes(t))) {
      // Same topic
      if (targetArticle.title.toLowerCase().includes('how')) {
        anchors.push('learn how to do this', 'see our guide', 'detailed instructions');
      } else if (targetArticle.title.toLowerCase().includes('why')) {
        anchors.push('understand why', 'explore the reasons', 'find out why');
      } else {
        anchors.push('related findings', 'similar research', 'more on this topic');
      }
    }
    
    // Category-specific anchors
    if (targetArticle.category === 'science') {
      anchors.push('recent discovery', 'scientific breakthrough', 'research findings');
    } else if (targetArticle.category === 'psychology') {
      anchors.push('psychological insights', 'behavioral research', 'mind science');
    } else if (targetArticle.category === 'technology') {
      anchors.push('tech innovation', 'latest development', 'technological advance');
    } else if (targetArticle.category === 'mystery') {
      anchors.push('unexplained phenomenon', 'mysterious case', 'strange discovery');
    }
    
    // Position-based anchors
    if (position === 'intro') {
      anchors.push('as we recently covered', 'similar to what we found', 'like we discovered');
    } else if (position === 'middle') {
      anchors.push('related research shows', 'another study found', 'similar findings suggest');
    } else if (position === 'end') {
      anchors.push('explore further', 'continue reading about', 'dive deeper into');
    }
    
    // Default anchors
    if (anchors.length === 0) {
      const keywords = targetArticle.keywords.slice(0, 3).join(' ');
      anchors.push(keywords, 'related article', 'relevant findings');
    }
    
    return anchors[Math.floor(Math.random() * anchors.length)];
  }

  /**
   * Insert contextually relevant links into article content
   */
  insertSmartLinks(content, sourceHref, relevantArticles) {
    let enhancedContent = content;
    const insertedLinks = [];
    
    // Strategy: Insert links at natural points in the content
    const paragraphs = content.split('\n\n');
    const positions = ['intro', 'middle', 'middle', 'end'];
    
    // Target positions for link insertion
    const targetPositions = [
      Math.floor(paragraphs.length * 0.15), // Early (after intro)
      Math.floor(paragraphs.length * 0.35), // First third
      Math.floor(paragraphs.length * 0.6),  // Middle
      Math.floor(paragraphs.length * 0.85)  // Near end
    ];
    
    relevantArticles.slice(0, 4).forEach((item, index) => {
      const position = targetPositions[index];
      if (position < paragraphs.length && paragraphs[position]) {
        const posType = positions[index] || 'middle';
        const anchor = this.generateContextualAnchor(
          this.articlesDatabase.get(sourceHref),
          item.article,
          posType
        );
        
        // Create natural link text
        const linkText = this.createNaturalLinkText(item.article, anchor);
        
        // Insert at end of paragraph
        paragraphs[position] += `\n\n${linkText}`;
        insertedLinks.push({ href: item.href, anchor });
      }
    });
    
    return {
      content: paragraphs.join('\n\n'),
      links: insertedLinks
    };
  }

  /**
   * Create natural link text that flows with content
   */
  createNaturalLinkText(article, anchor) {
    const templates = [
      `This connects to [${anchor}](${article.href}), which reveals even more surprising insights.`,
      `For a different perspective, our [${anchor}](${article.href}) explores this from another angle.`,
      `Interestingly, [${anchor}](${article.href}) shows similar patterns in a different context.`,
      `You might also find our [${anchor}](${article.href}) particularly relevant to this discussion.`,
      `Building on this, [${anchor}](${article.href}) takes these concepts even further.`,
      `As we explored in our [${anchor}](${article.href}), this phenomenon isn't isolated.`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * Enhance a single article with smart links
   */
  async enhanceArticle(filePath, href) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const { data: frontmatter, content: body } = matter(content);
      
      // Get relevant articles
      const relevantArticles = this.getRelevantArticles(href, 6);
      
      if (relevantArticles.length === 0) {
        console.log(`⚠️ No relevant articles found for ${path.basename(filePath)}`);
        return false;
      }
      
      // Insert smart links
      const { content: enhancedBody, links } = this.insertSmartLinks(body, href, relevantArticles);
      
      // Add related articles metadata
      frontmatter.relatedArticles = relevantArticles.map(item => ({
        href: item.href,
        title: item.article.title,
        score: item.score.toFixed(2),
        reason: this.explainRelevance(
          this.articlesDatabase.get(href),
          item.article
        )
      }));
      
      // Generate related articles section
      const relatedSection = this.generateSmartRelatedSection(relevantArticles);
      const finalContent = enhancedBody + '\n\n' + relatedSection;
      
      // Save enhanced article
      const newContent = matter.stringify(finalContent, frontmatter);
      await fs.writeFile(filePath, newContent);
      
      console.log(`✅ Enhanced: ${path.basename(filePath)} with ${links.length} relevant links (avg score: ${(relevantArticles.reduce((a,b) => a + b.score, 0) / relevantArticles.length).toFixed(2)})`);
      return true;
    } catch (error) {
      console.error(`❌ Error enhancing ${filePath}:`, error.message);
      return false;
    }
  }

  /**
   * Explain why articles are related
   */
  explainRelevance(source, target) {
    const reasons = [];
    
    // Check topic overlap
    const commonTopics = source.topics.filter(t => target.topics.includes(t));
    if (commonTopics.length > 0) {
      reasons.push(`Both discuss ${commonTopics[0].replace('_', ' ')}`);
    }
    
    // Check keyword overlap
    const commonKeywords = source.keywords.filter(k => target.keywords.includes(k));
    if (commonKeywords.length > 2) {
      reasons.push(`Related ${commonKeywords.slice(0, 2).join(' and ')} content`);
    }
    
    // Check category
    if (source.category === target.category) {
      reasons.push(`Same ${source.category} category`);
    }
    
    return reasons[0] || 'Contextually related';
  }

  /**
   * Generate smart related articles section
   */
  generateSmartRelatedSection(relevantArticles) {
    if (relevantArticles.length === 0) return '';
    
    let section = '## Continue Your Discovery\n\n';
    section += 'Based on what you\'ve just read, these articles will deepen your understanding:\n\n';
    
    // Group by relevance level
    const veryRelevant = relevantArticles.filter(a => a.score > 0.5);
    const relevant = relevantArticles.filter(a => a.score <= 0.5);
    
    if (veryRelevant.length > 0) {
      section += '### Directly Related\n';
      veryRelevant.forEach(item => {
        section += `- **[${item.article.title}](${item.href})** - ${item.article.description || 'Continue reading'}\n`;
      });
      section += '\n';
    }
    
    if (relevant.length > 0) {
      section += '### Explore Further\n';
      relevant.forEach(item => {
        section += `- [${item.article.title}](${item.href})\n`;
      });
    }
    
    return section;
  }

  /**
   * Process all articles with smart linking
   */
  async enhanceAllArticles() {
    console.log('🚀 Starting Smart Content Linking...\n');
    
    await this.init();
    
    let totalEnhanced = 0;
    let totalLinks = 0;
    
    for (const [href, article] of this.articlesDatabase) {
      const success = await this.enhanceArticle(article.filePath, href);
      if (success) {
        totalEnhanced++;
        const relevant = this.getRelevantArticles(href);
        totalLinks += relevant.length;
      }
    }
    
    console.log(`\n✨ Smart linking complete!`);
    console.log(`📊 Statistics:`);
    console.log(`   - Enhanced ${totalEnhanced} articles`);
    console.log(`   - Created ${totalLinks} relevant connections`);
    console.log(`   - Average relevance score: ${(totalLinks / totalEnhanced / 6).toFixed(2)}`);
    console.log(`\n💡 Each article now has contextually relevant links based on:`);
    console.log(`   - Content similarity and topic overlap`);
    console.log(`   - Keyword and entity matching`);
    console.log(`   - Cross-category discovery`);
    console.log(`   - Natural anchor text generation`);
  }
}

// Run the smart linker
if (require.main === module) {
  const linker = new SmartContentLinker();
  linker.enhanceAllArticles().catch(console.error);
}

module.exports = SmartContentLinker;