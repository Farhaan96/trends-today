// Enhanced Perplexity API Integration with Smart Caching and Fallbacks
// Optimized for automated blog content generation

require('dotenv').config({ path: '.env.local' });

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class PerplexityEnhanced {
  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY;
    this.cacheDir = path.join(__dirname, '..', '.cache', 'perplexity');
    this.cacheEnabled = true;
    this.cacheTTL = 3600000; // 1 hour in milliseconds

    // Model configurations for different use cases
    this.models = {
      quick: 'sonar', // Fast, lightweight searches
      standard: 'sonar-pro', // Standard research with citations
      deep: 'sonar-deep-research', // Comprehensive research reports
    };

    // Rate limiting
    this.requestQueue = [];
    this.lastRequestTime = 0;
    this.minRequestInterval = 500; // 2 requests per second max
  }

  async ensureCacheDir() {
    await fs.mkdir(this.cacheDir, { recursive: true }).catch(() => {});
  }

  getCacheKey(prompt, options = {}) {
    const hash = crypto.createHash('md5');
    hash.update(prompt);
    hash.update(JSON.stringify(options));
    return hash.digest('hex');
  }

  async getCached(cacheKey) {
    if (!this.cacheEnabled) return null;

    try {
      const cachePath = path.join(this.cacheDir, `${cacheKey}.json`);
      const stats = await fs.stat(cachePath);

      // Check if cache is expired
      if (Date.now() - stats.mtime.getTime() > this.cacheTTL) {
        await fs.unlink(cachePath).catch(() => {});
        return null;
      }

      const cached = await fs.readFile(cachePath, 'utf-8');
      return JSON.parse(cached);
    } catch {
      return null;
    }
  }

  async saveCache(cacheKey, data) {
    if (!this.cacheEnabled) return;

    try {
      await this.ensureCacheDir();
      const cachePath = path.join(this.cacheDir, `${cacheKey}.json`);
      await fs.writeFile(cachePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Cache save error:', error.message);
    }
  }

  async enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  async research(topic, options = {}) {
    const {
      type = 'standard', // quick, standard, or deep
      model = this.models.standard,
      maxTokens = 1200,
      temperature = 0.4,
      useCache = true,
      searchDomains = [], // Limit search to specific domains
      searchRecency = '', // month, week, day, hour
      returnSources = true,
      returnRelated = false,
    } = options;

    // Build the search prompt based on type
    let systemPrompt, userPrompt;

    switch (type) {
      case 'quick':
        systemPrompt =
          'You are a concise tech expert. Provide brief, factual answers with key points only.';
        userPrompt = `Quick facts about: ${topic}`;
        break;

      case 'deep':
        systemPrompt = `You are an investigative tech journalist conducting deep research. 
          Provide comprehensive analysis with multiple perspectives, data points, and expert insights.
          Focus on uncovering hidden details, controversies, and future implications.`;
        userPrompt = `Conduct deep research on: ${topic}
          Include: 1) Complete overview 2) Technical details 3) Market analysis 
          4) Expert opinions 5) Controversies 6) Future predictions 7) Competitive landscape`;
        break;

      default: // standard
        systemPrompt = `You are a professional tech journalist writing for a sophisticated audience.
          Provide well-researched, engaging content with unique insights and practical implications.`;
        userPrompt = `Research and analyze: ${topic}
          Focus on: Recent developments, key features, real-world impact, and expert perspectives.`;
    }

    // Check cache first
    if (useCache) {
      const cacheKey = this.getCacheKey(userPrompt, options);
      const cached = await this.getCached(cacheKey);
      if (cached) {
        console.log(`📦 Using cached research for: ${topic}`);
        return cached;
      }
    }

    // Prepare API request
    const requestBody = {
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature: temperature,
      return_citations: returnSources,
      return_related_questions: returnRelated,
    };

    // Add search filters if specified
    if (searchDomains.length > 0) {
      requestBody.search_domain_filter = searchDomains;
    }
    if (searchRecency) {
      requestBody.search_recency_filter = searchRecency;
    }

    try {
      await this.enforceRateLimit();

      console.log(`🔍 Researching with Perplexity (${type}): ${topic}`);

      const response = await fetch(
        'https://api.perplexity.ai/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(requestBody),
          timeout: 30000, // 30 second timeout
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      const result = {
        content: data.choices?.[0]?.message?.content || '',
        sources: data.choices?.[0]?.message?.citations || [],
        relatedQuestions: data.choices?.[0]?.message?.related_questions || [],
        model: model,
        timestamp: new Date().toISOString(),
      };

      // Save to cache
      if (useCache) {
        const cacheKey = this.getCacheKey(userPrompt, options);
        await this.saveCache(cacheKey, result);
      }

      return result;
    } catch (error) {
      console.error(`Perplexity API error: ${error.message}`);

      // Return fallback content
      return this.getFallbackContent(topic, type);
    }
  }

  async generateContent(topic, contentType = 'article', options = {}) {
    const {
      wordCount = 1500,
      tone = 'professional',
      style = 'engaging',
      includeStats = true,
      includeQuotes = true,
      includeSEO = true,
    } = options;

    const systemPrompt = `You are a world-class content writer for a leading tech blog.
      Write in a ${tone} tone with an ${style} style.
      Target word count: ${wordCount} words.
      ${includeStats ? 'Include relevant statistics and data.' : ''}
      ${includeQuotes ? 'Include expert quotes or industry perspectives.' : ''}
      ${includeSEO ? 'Optimize for SEO with natural keyword placement.' : ''}`;

    let userPrompt;
    switch (contentType) {
      case 'news':
        userPrompt = `Write a breaking news article about: ${topic}
          Structure: Compelling headline, lead paragraph with key facts, 
          detailed analysis, expert reactions, implications, and what's next.`;
        break;

      case 'review':
        userPrompt = `Write an in-depth product review of: ${topic}
          Structure: Overview, design & build, performance testing, 
          pros & cons, comparison with competitors, verdict, and recommendations.`;
        break;

      case 'guide':
        userPrompt = `Write a comprehensive how-to guide for: ${topic}
          Structure: Introduction, prerequisites, step-by-step instructions,
          pro tips, common mistakes, troubleshooting, and conclusion.`;
        break;

      case 'comparison':
        userPrompt = `Write a detailed comparison article about: ${topic}
          Structure: Overview of options, head-to-head comparisons,
          performance benchmarks, pricing analysis, use cases, and recommendations.`;
        break;

      default:
        userPrompt = `Write an engaging article about: ${topic}`;
    }

    const result = await this.research(userPrompt, {
      type: 'deep',
      maxTokens: 2000,
      temperature: 0.7,
      ...options,
    });

    return this.formatContent(result, contentType);
  }

  formatContent(result, contentType) {
    const content = result.content;

    // Add source citations if available
    let formattedContent = content;

    if (result.sources && result.sources.length > 0) {
      formattedContent += '\n\n## Sources\n\n';
      result.sources.forEach((source, index) => {
        formattedContent += `${index + 1}. [${source.title || 'Source'}](${source.url})\n`;
      });
    }

    // Add related topics if available
    if (result.relatedQuestions && result.relatedQuestions.length > 0) {
      formattedContent += '\n\n## Related Topics\n\n';
      result.relatedQuestions.forEach((question) => {
        formattedContent += `- ${question}\n`;
      });
    }

    return {
      content: formattedContent,
      metadata: {
        wordCount: content.split(/\s+/).length,
        sources: result.sources,
        generatedAt: result.timestamp,
        model: result.model,
        contentType: contentType,
      },
    };
  }

  getFallbackContent(topic, type) {
    const fallbacks = {
      quick: `${topic} represents a significant development in technology. Key aspects include innovation, market impact, and user adoption. Further research recommended for detailed insights.`,

      standard: `${topic} is transforming the technology landscape with innovative features and capabilities. 
        Industry experts highlight its potential to revolutionize user experiences and create new market opportunities. 
        Early adoption trends suggest strong market reception, though challenges remain in scaling and integration. 
        The technology's impact extends beyond immediate applications, potentially reshaping entire industry sectors.`,

      deep: `Comprehensive analysis of ${topic} reveals a complex technological ecosystem with far-reaching implications.
        
        Technical Overview: The technology leverages advanced algorithms and cutting-edge hardware to deliver unprecedented performance.
        
        Market Analysis: Current market conditions favor rapid adoption, with key players investing heavily in development and deployment.
        
        Expert Perspectives: Industry leaders express both excitement and caution, noting transformative potential alongside implementation challenges.
        
        Future Outlook: Long-term projections suggest significant market growth and technological evolution over the next decade.
        
        Competitive Landscape: Multiple companies are racing to establish market dominance, driving rapid innovation cycles.
        
        User Impact: End users can expect enhanced experiences, improved efficiency, and new capabilities previously unavailable.`,
    };

    return {
      content: fallbacks[type] || fallbacks.standard,
      sources: [],
      relatedQuestions: [],
      model: 'fallback',
      timestamp: new Date().toISOString(),
    };
  }

  async batchResearch(topics, options = {}) {
    console.log(`📚 Batch researching ${topics.length} topics...`);

    const results = [];
    for (const topic of topics) {
      const result = await this.research(topic, options);
      results.push({ topic, ...result });

      // Small delay between requests to be respectful
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return results;
  }

  async clearCache() {
    try {
      const files = await fs.readdir(this.cacheDir);
      for (const file of files) {
        await fs.unlink(path.join(this.cacheDir, file));
      }
      console.log('✅ Cache cleared successfully');
    } catch (error) {
      console.error('Error clearing cache:', error.message);
    }
  }

  async getCacheStats() {
    try {
      const files = await fs.readdir(this.cacheDir);
      let totalSize = 0;
      let oldestFile = Date.now();

      for (const file of files) {
        const filePath = path.join(this.cacheDir, file);
        const stats = await fs.stat(filePath);
        totalSize += stats.size;
        if (stats.mtime.getTime() < oldestFile) {
          oldestFile = stats.mtime.getTime();
        }
      }

      return {
        fileCount: files.length,
        totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
        oldestCache: new Date(oldestFile).toISOString(),
      };
    } catch {
      return { fileCount: 0, totalSize: '0 KB', oldestCache: 'N/A' };
    }
  }
}

// Export for use in other modules
module.exports = PerplexityEnhanced;

// CLI interface for testing
if (require.main === module) {
  const perplexity = new PerplexityEnhanced();

  const args = process.argv.slice(2);
  const command = args[0];
  const topic = args.slice(1).join(' ');

  async function run() {
    switch (command) {
      case 'research':
        const result = await perplexity.research(topic);
        console.log('\n' + result.content);
        break;

      case 'quick':
        const quick = await perplexity.research(topic, { type: 'quick' });
        console.log('\n' + quick.content);
        break;

      case 'deep':
        const deep = await perplexity.research(topic, { type: 'deep' });
        console.log('\n' + deep.content);
        break;

      case 'generate':
        const article = await perplexity.generateContent(topic);
        console.log('\n' + article.content);
        break;

      case 'cache-stats':
        const stats = await perplexity.getCacheStats();
        console.log('Cache Statistics:', stats);
        break;

      case 'clear-cache':
        await perplexity.clearCache();
        break;

      default:
        console.log(`
Usage: node perplexity-enhanced.js <command> <topic>

Commands:
  research <topic>  - Standard research on a topic
  quick <topic>     - Quick facts about a topic
  deep <topic>      - Deep comprehensive research
  generate <topic>  - Generate full article content
  cache-stats       - Show cache statistics
  clear-cache       - Clear all cached responses

Example:
  node perplexity-enhanced.js research "iPhone 17 Air features"
        `);
    }
  }

  run().catch(console.error);
}
