// API Rate Limiting and Cost Control Configuration
module.exports = {
  // API rate limits (requests per second)
  rateLimits: {
    perplexity: {
      requestsPerSecond: 0.5, // 1 request every 2 seconds
      dailyLimit: 100,        // Max 100 requests per day
      costPerRequest: 0.005   // Estimated cost per request
    },
    openai: {
      requestsPerSecond: 0.5,
      dailyLimit: 50,
      costPerRequest: 0.02    // GPT-4 + DALL-E costs
    },
    unsplash: {
      requestsPerSecond: 2,
      dailyLimit: 500,        // Free tier limit
      costPerRequest: 0
    },
    pexels: {
      requestsPerSecond: 2,
      dailyLimit: 500,
      costPerRequest: 0
    },
    firecrawl: {
      requestsPerSecond: 0.2,  // 1 request every 5 seconds
      dailyLimit: 20,
      costPerRequest: 0.01
    }
  },
  
  // Cache configuration
  cache: {
    enabled: true,
    ttl: {
      research: 3600000,      // 1 hour for research data
      images: 604800000,      // 7 days for images
      content: 86400000       // 24 hours for generated content
    }
  },
  
  // Fallback modes when limits reached
  fallbacks: {
    useCache: true,           // Use cached data when available
    usePlaceholders: true,    // Use placeholder content/images
    demoMode: true           // Use demo/mock data as last resort
  },
  
  // Cost tracking
  budgets: {
    daily: 5.00,             // $5 per day max
    monthly: 100.00          // $100 per month max
  }
};