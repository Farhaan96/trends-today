#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { getCachedOrFetch } = require('../utils/api-cache');

class NewsScanner {
  constructor() {
    this.sources = {
      rss: [
        'https://techcrunch.com/feed/',
        'https://www.theverge.com/rss/index.xml',
        'https://arstechnica.com/feed/',
        'https://www.engadget.com/rss.xml',
        'https://www.wired.com/feed/rss',
        'https://gizmodo.com/rss'
      ],
      newsrooms: [
        'https://newsroom.apple.com',
        'https://blog.google',
        'https://news.samsung.com/us/',
        'https://press.nvidia.com',
        'https://newsroom.intel.com'
      ],
      reddit: [
        'https://www.reddit.com/r/technology.json',
        'https://www.reddit.com/r/gadgets.json',
        'https://www.reddit.com/r/apple.json',
        'https://www.reddit.com/r/android.json'
      ]
    };
    this.dataDir = path.join(__dirname, '..', 'data');
    this.opportunitiesFile = path.join(this.dataDir, 'news-opportunities.json');
  }

  async ensureDataDirectory() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      console.log('Data directory already exists or created');
    }
  }

  async scanRSSFeeds() {
    console.log('🔍 Scanning RSS feeds for breaking tech news...');
    const opportunities = [];

    for (const feedUrl of this.sources.rss) {
      try {
        console.log(`Scanning ${feedUrl}...`);
        
        const response = await fetch(feedUrl, {
          headers: {
            'User-Agent': 'TrendsToday-NewsBot/1.0'
          }
        });

        if (!response.ok) {
          console.log(`Failed to fetch ${feedUrl}: ${response.status}`);
          continue;
        }

        const xmlText = await response.text();
        const articles = this.parseRSS(xmlText);
        
        // Filter for high-potential articles
        const filteredArticles = articles.filter(article => 
          this.isHighPotentialNews(article)
        ).slice(0, 5); // Top 5 per source

        opportunities.push(...filteredArticles.map(article => ({
          ...article,
          source: feedUrl,
          type: 'rss',
          scannedAt: new Date().toISOString(),
          potential: this.calculateNewsPotential(article)
        })));

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.log(`Error scanning ${feedUrl}: ${error.message}`);
      }
    }

    return opportunities;
  }

  parseRSS(xmlText) {
    const articles = [];
    
    // Simple RSS parsing - extract title, link, description, pubDate
    const itemRegex = /<item[^>]*>(.*?)<\/item>/gs;
    const items = xmlText.match(itemRegex) || [];

    items.forEach(item => {
      try {
        const title = this.extractTag(item, 'title');
        const link = this.extractTag(item, 'link');
        const description = this.extractTag(item, 'description');
        const pubDate = this.extractTag(item, 'pubDate');

        if (title && link) {
          articles.push({
            title: this.cleanText(title),
            link: link.trim(),
            description: this.cleanText(description || ''),
            publishedAt: pubDate || new Date().toISOString()
          });
        }
      } catch (error) {
        console.log('Error parsing RSS item:', error.message);
      }
    });

    return articles;
  }

  extractTag(text, tagName) {
    const regex = new RegExp(`<${tagName}[^>]*>(.*?)<\/${tagName}>`, 'is');
    const match = text.match(regex);
    return match ? match[1] : null;
  }

  cleanText(text) {
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&[^;]+;/g, ' ') // Remove HTML entities
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  async scanRedditTrending() {
    console.log('📱 Scanning Reddit for trending tech topics...');
    const opportunities = [];

    for (const subredditUrl of this.sources.reddit) {
      try {
        console.log(`Scanning ${subredditUrl}...`);
        
        const response = await fetch(subredditUrl, {
          headers: {
            'User-Agent': 'TrendsToday-NewsBot/1.0'
          }
        });

        if (!response.ok) continue;

        const data = await response.json();
        const posts = data.data.children.slice(0, 10); // Top 10 posts

        for (const post of posts) {
          const postData = post.data;
          
          if (this.isHighPotentialRedditPost(postData)) {
            opportunities.push({
              title: postData.title,
              link: `https://reddit.com${postData.permalink}`,
              description: postData.selftext?.substring(0, 300) || '',
              publishedAt: new Date(postData.created_utc * 1000).toISOString(),
              source: subredditUrl,
              type: 'reddit',
              upvotes: postData.ups,
              comments: postData.num_comments,
              scannedAt: new Date().toISOString(),
              potential: this.calculateRedditPotential(postData)
            });
          }
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.log(`Error scanning Reddit ${subredditUrl}: ${error.message}`);
      }
    }

    return opportunities;
  }

  isHighPotentialNews(article) {
    const title = article.title.toLowerCase();
    const description = article.description.toLowerCase();
    const content = `${title} ${description}`;

    // High-value keywords for tech news
    const highValueTerms = [
      'announce', 'launch', 'release', 'unveil', 'reveal',
      'new', 'latest', 'upcoming', 'first', 'breakthrough',
      'iphone', 'samsung', 'google', 'apple', 'microsoft',
      'ai', 'chatgpt', 'artificial intelligence', 'machine learning',
      'leak', 'rumor', 'exclusive', 'confirmed', 'official',
      'price drop', 'deal', 'sale', 'discount', 'cheaper',
      'review', 'hands-on', 'tested', 'comparison'
    ];

    // Exclude low-value content
    const excludeTerms = [
      'sponsored', 'advertisement', 'crypto', 'nft',
      'lawsuit', 'court', 'legal', 'stock', 'earnings'
    ];

    const hasHighValue = highValueTerms.some(term => content.includes(term));
    const hasExclusion = excludeTerms.some(term => content.includes(term));

    return hasHighValue && !hasExclusion;
  }

  isHighPotentialRedditPost(post) {
    const title = post.title.toLowerCase();
    
    // High engagement and recent
    const isRecent = (Date.now() - (post.created_utc * 1000)) < 24 * 60 * 60 * 1000; // 24 hours
    const hasEngagement = post.ups > 100 || post.num_comments > 20;
    
    // High-value content
    const hasNews = title.includes('just announced') || 
                   title.includes('breaking') || 
                   title.includes('leak') ||
                   title.includes('confirmed');

    return isRecent && hasEngagement && hasNews;
  }

  calculateNewsPotential(article) {
    const title = article.title.toLowerCase();
    let score = 5; // Base score

    // Boost for breaking news terms
    if (title.includes('breaking') || title.includes('just announced')) score += 3;
    if (title.includes('exclusive') || title.includes('first')) score += 2;
    if (title.includes('leak') || title.includes('rumor')) score += 2;

    // Boost for major brands
    const majorBrands = ['apple', 'samsung', 'google', 'microsoft', 'nvidia'];
    if (majorBrands.some(brand => title.includes(brand))) score += 2;

    // Boost for trending tech
    if (title.includes('ai') || title.includes('chatgpt')) score += 2;
    if (title.includes('iphone') || title.includes('android')) score += 1;

    return Math.min(score, 10); // Cap at 10
  }

  calculateRedditPotential(post) {
    let score = 5; // Base score

    // Engagement boost
    if (post.ups > 500) score += 2;
    if (post.ups > 1000) score += 1;
    if (post.num_comments > 100) score += 2;

    // Recency boost
    const hoursOld = (Date.now() - (post.created_utc * 1000)) / (1000 * 60 * 60);
    if (hoursOld < 6) score += 2;
    else if (hoursOld < 12) score += 1;

    return Math.min(score, 10);
  }

  async saveOpportunities(opportunities) {
    try {
      // Load existing opportunities
      let existing = [];
      try {
        const existingData = await fs.readFile(this.opportunitiesFile, 'utf-8');
        existing = JSON.parse(existingData);
      } catch (error) {
        // File doesn't exist yet
      }

      // Merge and deduplicate
      const allOpportunities = [...existing, ...opportunities];
      const unique = Array.from(
        new Map(allOpportunities.map(item => [item.link, item])).values()
      );

      // Sort by potential and keep recent ones
      const sorted = unique
        .sort((a, b) => b.potential - a.potential)
        .slice(0, 100); // Keep top 100

      await fs.writeFile(
        this.opportunitiesFile,
        JSON.stringify(sorted, null, 2),
        'utf-8'
      );

      console.log(`💾 Saved ${sorted.length} news opportunities`);
      return sorted;

    } catch (error) {
      console.error('Error saving opportunities:', error.message);
      return opportunities;
    }
  }

  async run() {
    console.log('🚀 Starting news scanner...');
    
    await this.ensureDataDirectory();

    try {
      // Scan RSS feeds
      const rssOpportunities = await this.scanRSSFeeds();
      console.log(`Found ${rssOpportunities.length} RSS opportunities`);

      // Scan Reddit
      const redditOpportunities = await this.scanRedditTrending();
      console.log(`Found ${redditOpportunities.length} Reddit opportunities`);

      // Combine and save
      const allOpportunities = [...rssOpportunities, ...redditOpportunities];
      const saved = await this.saveOpportunities(allOpportunities);

      console.log(`✅ News scanning completed. ${saved.length} total opportunities saved.`);
      
      // Output top opportunities for GitHub Actions
      const topOpportunities = saved.slice(0, 5);
      console.log('🔥 Top opportunities:');
      topOpportunities.forEach((opp, i) => {
        console.log(`${i + 1}. ${opp.title} (${opp.potential}/10)`);
      });

      return saved;

    } catch (error) {
      console.error('News scanner failed:', error.message);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const scanner = new NewsScanner();
  scanner.run().catch(console.error);
}

module.exports = { NewsScanner };