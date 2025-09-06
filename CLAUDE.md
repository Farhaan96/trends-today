# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Trends Today is a production-ready tech blog platform built with Next.js 14, featuring live content generation through API integrations, TechRadar-style design, and comprehensive SEO optimization. The platform generates reviews, comparisons, buying guides, and news articles using real-time data sources.

## Common Commands

### Development
```bash
npm run dev              # Start development server with Turbopack
npm run build            # Build for production with Turbopack
npm run start            # Start production server
```

### Code Quality
```bash
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues automatically
npm run typecheck        # Run TypeScript type checking
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
```

### Content Generation
```bash
npm run gen:reviews      # Generate tech product reviews
npm run gen:comparisons  # Generate product comparisons
npm run gen:best         # Generate buying guides
npm run gen:news-digest  # Generate news articles
npm run gen:all          # Generate all content types
```

### Testing & Monitoring
```bash
npm run test:mcp         # Test MCP API integrations
npm run audit:seo        # Run SEO audit on generated content
```

### SEO & Deployment
```bash
npm run sitemaps         # Generate XML sitemaps
npm run postbuild        # Runs automatically after build (generates sitemaps)
```

## Architecture Overview

### API Integration System
The platform uses a Model Context Protocol (MCP) architecture with three main APIs:

1. **Firecrawl API** - Web scraping for manufacturer data (Apple.com, Samsung.com, etc.)
2. **Perplexity API** - Real-time research and market intelligence  
3. **DataForSEO API** - Keyword research and SEO metrics

**Key Files:**
- `lib/mcp/demo.js` - MCP client with fallback demo mode
- `src/app/api/enhanced-research/route.ts` - Combines multiple APIs for comprehensive research
- `src/app/api/test-perplexity/route.ts` - Perplexity API connectivity testing
- `src/app/api/scrape-apple/route.ts` - Live Apple product data scraping

### Content Generation Pipeline
Content generators located in `scripts/` use the MCP system to create SEO-optimized articles:

- **Reviews** (`scripts/generate-reviews.js`) - Product reviews with real specs and testing methodology
- **Comparisons** (`scripts/generate-comparisons.js`) - Head-to-head product comparisons
- **Best Lists** (`scripts/generate-best.js`) - Ranked buying guides with detailed analysis
- **News** (`scripts/generate-news.js`) - Tech news articles with proper sourcing

### Design System
The UI implements a TechRadar-inspired design with:

- **Header** (`src/components/layout/Header.tsx`) - Multi-level navigation with search
- **Homepage** (`src/app/page.tsx`) - Hero grid layout with sidebar and trending topics
- **Color Scheme** - Professional blue-gray palette matching TechRadar
- **Typography** - Open Sans font family throughout
- **Components** - Article cards with star ratings, category tags, newsletter signup

### Environment Configuration
Required environment variables for full functionality:

```bash
FIRECRAWL_API_KEY=fc-xxx...     # For web scraping
PERPLEXITY_API_KEY=pplx-xxx...  # For real-time research
DATAFORSEO_LOGIN=xxx            # For SEO keyword data
DATAFORSEO_PASSWORD=xxx         # For SEO keyword data
```

**Demo Mode:** The system automatically falls back to demo data when APIs aren't configured, allowing development without API keys.

### Content Structure
All content follows E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) guidelines:

- **MDX Format** - All content in `/content/` directory with frontmatter
- **Structured Data** - JSON-LD schema markup for all content types  
- **Source Citations** - Minimum 3 sources per article
- **Testing Methodology** - "How we test" sections for credibility
- **Author Credentials** - Author boxes with expertise signals

### SEO Infrastructure
Automated SEO features:
- **Sitemaps** - XML sitemaps for all content (`next-sitemap` config)
- **News Sitemap** - Google News compliant sitemap
- **Robots.txt** - SEO-friendly crawler directives
- **Meta Tags** - Optimized for social sharing and search
- **Structured Data** - Rich snippets for enhanced SERP display

## Important Implementation Notes

### API Integration Patterns
- All API calls include proper error handling with fallback to demo data
- Rate limiting implemented with 2-second delays between requests
- Manufacturer URL detection automatically routes to correct product pages
- Content extraction patterns handle multiple product specification formats

### Content Quality Controls
- Keyword volume minimum thresholds (configurable in `config/programmatic.yml`)
- Duplicate content detection prevents overwriting existing articles
- Human review flags for quality assurance
- Source validation requires official manufacturer or trusted tech publication URLs

### Production Deployment
- Deployed on Vercel with automatic GitHub integration
- Environment variables stored securely in Vercel dashboard
- Custom domain configured at trendstoday.ca
- TechRadar-style professional design matching industry standards

The platform is designed for scalable, high-quality tech content generation with proper SEO optimization and industry-standard design patterns.