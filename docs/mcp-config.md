# MCP Configuration for TechPulse Pro

This document outlines the Model Context Protocol (MCP) server configurations required for TechPulse Pro's content generation and SEO workflows.

## Required MCP Servers

### 1. Firecrawl MCP Server
**Purpose**: Web scraping, content research, and SEO audits

**Installation**: 
```bash
npm install @firecrawl/mcp-server
```

**Configuration**:
```json
{
  "name": "firecrawl",
  "command": "node",
  "args": ["node_modules/@firecrawl/mcp-server/dist/index.js"],
  "env": {
    "FIRECRAWL_API_KEY": "your_firecrawl_api_key_here"
  }
}
```

**Environment Variables Required**:
```env
FIRECRAWL_API_KEY=fc-your-api-key-here
```

**Use Cases**:
- Scrape official tech company newsroom pages
- Extract product specifications from manufacturer sites
- Audit live site performance and SEO metrics
- Monitor competitor content strategies

---

### 2. Perplexity MCP Server
**Purpose**: Topic research, keyword ideation, and content strategy

**Installation**:
```bash
npm install @perplexity/mcp-server
```

**Configuration**:
```json
{
  "name": "perplexity", 
  "command": "node",
  "args": ["node_modules/@perplexity/mcp-server/dist/index.js"],
  "env": {
    "PERPLEXITY_API_KEY": "your_perplexity_api_key_here"
  }
}
```

**Environment Variables Required**:
```env
PERPLEXITY_API_KEY=pplx-your-api-key-here
```

**Use Cases**:
- Generate seed keyword clusters for content categories
- Research trending tech topics and pain points
- Validate content angles and user intent
- Discover related topics for content expansion

---

### 3. DataForSEO MCP Server
**Purpose**: SEO metrics, keyword data, and search volume analysis

**Installation**:
```bash
npm install @dataforseo/mcp-server
```

**Configuration**:
```json
{
  "name": "dataforseo",
  "command": "node", 
  "args": ["node_modules/@dataforseo/mcp-server/dist/index.js"],
  "env": {
    "DATAFORSEO_LOGIN": "your_dataforseo_login",
    "DATAFORSEO_PASSWORD": "your_dataforseo_password"
  }
}
```

**Environment Variables Required**:
```env
DATAFORSEO_LOGIN=your_login_here
DATAFORSEO_PASSWORD=your_password_here
```

**Use Cases**:
- Validate keyword search volumes and difficulty scores
- Analyze competitor keyword strategies
- Track keyword rankings over time
- Calculate keyword cost-per-click for commercial intent

---

## MCP Client Configuration

Create or update your MCP client configuration file (typically `mcp-config.json`):

```json
{
  "servers": [
    {
      "name": "firecrawl",
      "command": "node",
      "args": ["node_modules/@firecrawl/mcp-server/dist/index.js"],
      "env": {
        "FIRECRAWL_API_KEY": "${FIRECRAWL_API_KEY}"
      }
    },
    {
      "name": "perplexity",
      "command": "node", 
      "args": ["node_modules/@perplexity/mcp-server/dist/index.js"],
      "env": {
        "PERPLEXITY_API_KEY": "${PERPLEXITY_API_KEY}"
      }
    },
    {
      "name": "dataforseo",
      "command": "node",
      "args": ["node_modules/@dataforseo/mcp-server/dist/index.js"], 
      "env": {
        "DATAFORSEO_LOGIN": "${DATAFORSEO_LOGIN}",
        "DATAFORSEO_PASSWORD": "${DATAFORSEO_PASSWORD}"
      }
    }
  ]
}
```

## Environment Variables Setup

Create a `.env.local` file in your project root with the following variables:

```env
# Firecrawl API Configuration
FIRECRAWL_API_KEY=fc-your-api-key-here

# Perplexity API Configuration  
PERPLEXITY_API_KEY=pplx-your-api-key-here

# DataForSEO API Configuration
DATAFORSEO_LOGIN=your_login_here
DATAFORSEO_PASSWORD=your_password_here

# Database Configuration (Already configured)
DATABASE_URL="file:./dev.db"

# Next.js Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME="TechPulse Pro"
```

## API Keys and Accounts

### Firecrawl API
1. Sign up at: https://firecrawl.dev
2. Create an API key in your dashboard
3. Free tier: 500 pages/month, Paid: $29+/month

### Perplexity API  
1. Sign up at: https://docs.perplexity.ai
2. Generate API key in settings
3. Pay-per-use pricing: ~$0.50-2.00 per 1k tokens

### DataForSEO API
1. Sign up at: https://dataforseo.com
2. Create API credentials (login/password)
3. Pricing: $0.0025-0.25 per API call depending on endpoint

## Usage in Content Generators

The MCP servers are integrated into our content generation scripts:

```javascript
// Example usage in generator script
const firecrawl = await connectMCP('firecrawl');
const perplexity = await connectMCP('perplexity');
const dataforseo = await connectMCP('dataforseo');

// Research phase
const topics = await perplexity.generateTopics(category);
const metrics = await dataforseo.getKeywordMetrics(keywords);
const sources = await firecrawl.scrapeOfficialSources(productUrls);

// Content generation with quality gates
if (metrics.searchVolume < 200) {
  throw new Error('Search volume too low - skipping generation');
}
```

## Quality Gates and Limits

### Content Generation Limits
- **Max pages per run**: 8 (prevents spam)
- **Min search volume**: 200/month
- **Required sources**: 3+ authoritative sources
- **Human review**: Required before publish

### API Rate Limits
- **Firecrawl**: 10 requests/minute (free), 100/minute (paid)
- **Perplexity**: 10 requests/minute (free), 60/minute (paid)  
- **DataForSEO**: 2000 requests/hour (standard)

## Testing MCP Integration

Run the test script to verify all MCP servers are working:

```bash
npm run test:mcp
```

This will:
1. Test connectivity to all MCP servers
2. Validate API credentials  
3. Run sample queries to ensure proper responses
4. Check rate limits and error handling

## Troubleshooting

### Common Issues

**Connection Errors**: 
- Verify API keys are correct and active
- Check network connectivity and firewall settings
- Ensure MCP server processes are running

**Rate Limiting**:
- Implement exponential backoff in generators
- Monitor usage across all scripts
- Consider upgrading API plans if needed

**Data Quality**:
- Always validate API responses before using
- Implement fallbacks for critical data points
- Log all API calls for debugging

### Debug Commands

```bash
# Test individual MCP servers
npm run debug:firecrawl
npm run debug:perplexity  
npm run debug:dataforseo

# View MCP server logs
npm run logs:mcp

# Reset MCP connections
npm run reset:mcp
```

---

**Next Steps**:
1. Set up API accounts and obtain keys
2. Configure environment variables
3. Test MCP connections  
4. Run first content generation test
5. Monitor usage and costs