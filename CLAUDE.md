# CLAUDE.md - Trends Today: Quality-First Content Strategy

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Trends Today is a premium tech blog platform built with Next.js 14, featuring AI-powered content generation, TechRadar-style design, and comprehensive SEO optimization. Our mission: Create the most engaging, high-quality tech content that readers actually want to consume and share.

## 🎯 CORE PHILOSOPHY: QUALITY OVER QUANTITY

**Primary Goal:** 30K monthly organic visitors through exceptional content quality
**Strategy:** Target 1000 premium articles (30 visitors/page average)
**Approach:** 15 high-quality articles/day via 3 strategic batch runs (5 articles each)

### Quality Standards for Every Article:
- ✅ **Engaging from first sentence** - Hooks that make readers want to continue
- ✅ **SEO-optimized throughout** - Title, meta, headers, images, content structure  
- ✅ **1500+ words minimum** - Comprehensive coverage that beats competitors
- ✅ **Unique insights** - Something readers can't find elsewhere
- ✅ **Professional images** - Custom graphics, not generic stock photos
- ✅ **Expert voice** - Authoritative, opinionated, personality-driven writing

## 🤖 AGENT-DRIVEN AUTOMATION SYSTEM

### Core Content Agents (Optimized for Quality + Efficiency)

#### Production Agents ✅ DEPLOYED & OPTIMIZED
- **news-scanner.js** - Discovers trending topics from RSS, Reddit, industry sources
- **content-creator.js** - Generates engaging articles using cached research + Perplexity API
- **seo-finder.js** - Identifies low-competition, high-potential keywords
- **image-hunter.js** - Sources and optimizes unique images for each article
- **quality-check.js** - Validates content quality, engagement, and SEO compliance
- **trust-builder.js** - Adds author credentials, sources, and authority signals
- **content-refresher.js** - Updates outdated information and maintains freshness

#### Master Orchestration
- **orchestrator.js** - Coordinates all agents with timeout management and API efficiency

### Agent Execution Commands (Batch-Optimized)
```bash
# Strategic batch content creation (5 articles per run)
npm run agents:batch        # Generate 5 premium articles with full quality checks
npm run agents:discover     # Find high-potential topics and keywords  
npm run agents:enhance      # Improve existing content with images/trust signals

# Daily workflow commands
npm run agents:morning      # Batch 1: 5 articles (9 AM run)
npm run agents:midday       # Batch 2: 5 articles (1 PM run)
npm run agents:evening      # Batch 3: 5 articles (5 PM run)

# Maintenance and optimization
npm run agents:maintenance  # Update content, fix links, optimize images
npm run agents:emergency    # Quick fixes for critical issues
```

### API Efficiency & Timeout Management ⚡
```javascript
// New timeout-resistant architecture
- HTTP timeouts: 30 seconds with exponential backoff retry
- API rate limiting: 2 req/sec Perplexity, 1 req/sec Firecrawl  
- Intelligent caching: 1-hour TTL for research, 24-hour for news
- Demo mode fallbacks: High-quality templates when APIs unavailable
- Parallel processing: Promise.allSettled() for 4x faster execution
```

## 🎯 CONTENT STRATEGY: 1000 PREMIUM ARTICLES

### Niche Targeting Strategy (Quality-First Approach)
Focus on **20 micro-niches** with deep, authoritative coverage:

1. **Budget Tech Excellence** - "Best [Product] Under $[Price]" with real testing
2. **Gaming Hardware Deep Dives** - Performance analysis, not just specs
3. **Smart Home Solutions** - Practical setup guides with real-world testing
4. **Mobile Tech Mastery** - Beyond reviews: optimization, hidden features, comparisons
5. **Audio Equipment Analysis** - Technical deep-dives for audiophiles and casual users
6. **Productivity Power Tools** - Software reviews with workflow integration guides
7. **Content Creator Tools** - Camera gear, editing software, streaming equipment
8. **Fitness Tech Reality** - Honest reviews of wearables and health apps
9. **Remote Work Solutions** - Home office setups, collaboration tools, ergonomics
10. **Travel Tech Essentials** - Real-world testing in various conditions
11. **Car Tech Innovation** - Dashboard tech, safety systems, connectivity
12. **Kitchen Tech Reviews** - Smart appliances with cooking performance tests
13. **Parenting Tech Guide** - Safety-focused reviews with real parent perspectives  
14. **Senior-Friendly Tech** - Accessibility reviews with usability testing
15. **Student Tech Value** - Budget analysis with academic use cases
16. **Small Business Tools** - ROI-focused reviews with implementation guides
17. **Maker & DIY Tech** - Project-based reviews with build tutorials
18. **Sustainable Tech** - Environmental impact analysis with performance reviews
19. **Privacy & Security** - Technical analysis with real-world threat modeling
20. **Emerging Tech Analysis** - Early adopter reviews with future implications

### Article Quality Framework

#### 5 Premium Article Types (50+ articles per niche):
1. **Ultimate Buyer's Guides** - "Complete Guide to [Category]: What Experts Actually Recommend"
2. **Honest Review Deep-Dives** - "[Product] After 3 Months: The Unfiltered Truth"  
3. **Head-to-Head Comparisons** - "[Product A] vs [Product B]: The Definitive Analysis"
4. **Expert How-To Guides** - "How to [Task]: The Professional Method"
5. **Industry Analysis** - "Why [Trend] Changes Everything (Or Doesn't)"

#### Content Quality Checklist (Every Article Must Pass):
- 🎯 **Hook-driven opening** - Controversial, surprising, or story-based first paragraph
- 📊 **Unique data/insights** - Something competitors don't have  
- 🔍 **SEO optimization** - Long-tail keywords, semantic search optimization
- 📸 **Custom visuals** - Product photos, comparison charts, infographics
- ✍️ **Engaging voice** - Opinionated, authoritative, personality-driven
- 🔗 **Authority signals** - Expert quotes, testing methodology, source citations
- 💡 **Actionable value** - Readers leave with specific knowledge/decisions
- 📱 **Mobile optimization** - Readable and engaging on all devices

## 🛠️ TECHNICAL IMPLEMENTATION

### Agent Configuration (.claude folder)
- **Agent Definitions**: `.claude/agents/*.md` with YAML frontmatter
- **Quality Templates**: `.claude/templates/*.md` for consistent excellence
- **API Configs**: `.claude/config.yaml` with timeout and rate limiting
- **Performance Metrics**: `reports/*.json` for quality tracking

### Environment Configuration (API-Efficient)
```bash
# Required APIs (with intelligent fallbacks)
PERPLEXITY_API_KEY=pplx-xxx...    # Real-time research (cached for efficiency)  
FIRECRAWL_API_KEY=fc-xxx...       # Web scraping (rate-limited)
DATAFORSEO_LOGIN=xxx              # SEO keyword data (batch processing)
DATAFORSEO_PASSWORD=xxx           # SEO keyword data (batch processing)

# Batch Optimization Settings
API_TIMEOUT_MS=30000              # 30-second HTTP timeouts
CACHE_TTL_HOURS=1                 # 1-hour research cache
MAX_DAILY_API_CALLS=300           # Budget for 15 articles/day
CONTENT_QUALITY_THRESHOLD=85      # Minimum quality score per batch
MAX_ARTICLES_PER_BATCH=5          # 5 articles per batch run
BATCH_EXECUTION_LIMIT=90          # 90 minutes per batch maximum
```

### Content Quality Controls
- **Pre-publication review** - Quality score must exceed 85/100
- **Engagement optimization** - A/B test headlines and openings
- **SEO validation** - Technical SEO audit before publishing
- **Image quality check** - Custom graphics, proper alt text, compression
- **Mobile readability** - Test on multiple devices and screen sizes
- **Loading performance** - Sub-2-second page load times required

## 📊 SUCCESS METRICS (Quality-Focused)

### Content Quality KPIs:
- **Engagement Rate**: >60% time on page, <40% bounce rate
- **Content Quality Score**: >85/100 average across all articles
- **SEO Performance**: >50% articles ranking page 1 within 90 days  
- **Social Sharing**: >10 shares per article average
- **Reader Feedback**: >4.2/5.0 average article rating

### Traffic Growth Timeline (15 Articles/Day Strategy):
- **Week 1**: 105 premium articles → 2K visitors (19 visitors/article avg - new content)
- **Month 1**: 450 premium articles → 12K visitors (27 visitors/article avg)
- **Month 2**: 900 premium articles → 25K visitors (28 visitors/article avg)  
- **Month 3**: 1350 premium articles → 35K visitors (26 visitors/article avg)
- **Month 4**: 1800 premium articles → 50K visitors (28 visitors/article avg)

### Strategic Batch Production:
- **15 articles/day via 3 batches** - 5 high-quality articles per batch run
- **1500+ words minimum** - Comprehensive coverage beats thin content
- **90-minute batch cycles** - Research → Write → Review → Optimize → Publish
- **Quality gates per batch** - Each batch must pass 85/100 quality threshold
- **Performance monitoring** - Track engagement and adjust strategy based on data

## 🎯 DAILY WORKFLOW (3-Batch Strategy)

### Batch 1 - Morning (9 AM): First 5 Articles
```bash
npm run agents:discover     # Find 15-20 high-potential topics for day
npm run agents:morning      # Generate 5 premium articles (Batch 1)
# Focus areas: Breaking news, trending topics, urgent reviews
# 90-minute execution limit with quality gates
# Topics: Mix of news (2) + reviews (2) + guides (1)
```

### Batch 2 - Midday (1 PM): Second 5 Articles  
```bash
npm run agents:midday       # Generate 5 premium articles (Batch 2)
# Focus areas: Deep-dive reviews, comparison guides, how-tos
# 90-minute execution limit with quality gates
# Topics: Mix of reviews (3) + comparisons (1) + buying guide (1)
```

### Batch 3 - Evening (5 PM): Final 5 Articles
```bash
npm run agents:evening      # Generate 5 premium articles (Batch 3)
# Focus areas: Analysis pieces, niche topics, evergreen content
# 90-minute execution limit with quality gates  
# Topics: Mix of analysis (2) + niche reviews (2) + how-to (1)
```

### End of Day (8 PM): Enhancement & Publishing
```bash
npm run agents:enhance      # Polish all 15 articles with images/trust signals
npm run agents:deploy       # Publish to production with full SEO
# Final quality assurance across all daily content
# Performance monitoring and analytics setup
```

## 🚨 QUALITY ASSURANCE PROTOCOLS

### Never Compromise On:
- ✅ **Article depth and insight** - Better to publish 3 great articles than 10 mediocre ones
- ✅ **Original research and data** - Use APIs efficiently but always add unique value
- ✅ **Visual quality** - Custom images, proper compression, engaging graphics
- ✅ **Technical accuracy** - Fact-check all specifications and claims
- ✅ **User experience** - Mobile-first design, fast loading, intuitive navigation
- ✅ **Editorial standards** - Consistent voice, proper citations, ethical disclosure

### Red Flags to Avoid:
- ❌ **Generic, templated content** - Every article must have unique insights
- ❌ **Thin, sub-1000 word articles** - Comprehensive coverage required
- ❌ **Stock photos and placeholder images** - Custom visuals only
- ❌ **Keyword stuffing** - Natural language optimization over density
- ❌ **Rushed publication** - Quality review required before going live
- ❌ **API overuse** - Smart caching and demo modes prevent budget drain

## 🎯 COMPETITIVE ADVANTAGE

### What Makes Us Different:
1. **Quality-First Automation** - AI efficiency meets human editorial standards
2. **Deep Niche Expertise** - 20+ micro-niches with authoritative coverage
3. **Engagement Optimization** - Every article designed to hook and retain readers  
4. **Technical Excellence** - Superior SEO, performance, and user experience
5. **Authentic Voice** - Opinionated, personality-driven content that builds trust
6. **Visual Storytelling** - Custom graphics and images that enhance understanding

### Success Philosophy:
> "One exceptional article that gets 100 engaged readers is infinitely more valuable than 10 generic articles that get 10 visitors each. Quality compounds - mediocrity disappears."

This strategy transforms Trends Today into a destination publication where readers come for insights they can't find anywhere else, ensuring sustainable growth to 30K+ monthly visitors through content excellence.