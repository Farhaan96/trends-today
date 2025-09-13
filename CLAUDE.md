<!-- September 2025 Operations Update -->

## Operations Update — Images, Minimal Theme, Security

This update documents recent fixes and the plan to align the site with an ultra‑simple, ad‑friendly design similar to leravi.org.

### Image Reliability Fixes (Completed)
- Root cause: Next/Image blocked remote fallbacks and custom logic overrode local assets after 2s, causing placeholders.
- Changes implemented:
  - next.config.ts: allow `images.unsplash.com`, `images.pexels.com`, and `trendstoday.ca` as remote image hosts.
  - ImageWithFallback: no longer auto‑switches away from local `/images/...` unless an actual error occurs.
  - Safety remaps for known bad filenames so UI never points at zero‑byte files.
  - Content references updated to valid images (news and iPhone 15 Pro Max gallery).
- Known empty/tiny files to replace (recommended):
  - `public/images/products/iphone-15-pro-max-titanium.jpg`
  - `public/images/products/iphone-15-pro-max-usbc.jpg`
  - `public/images/products/nothing-phone-2-guide.jpg`
  - `public/images/news/ai-agents-revolution-hero.jpg`
  - `public/images/news/iphone-17-air-ultra-thin-hero.jpg`
- Verification: `npm run build && npm start` → hero/feed images render; remote Unsplash/Pexels load without errors.

### Minimal Theme (Planned) — leravi.org Style
Goal: ultra‑simple, click‑forward, ad‑friendly list.
- Feature flag: `NEXT_PUBLIC_THEME=minimal` to toggle minimal vs magazine layouts.
- Homepage (single column list):
  - 20–40 posts, title‑first, subtle meta; optional tiny thumbnail; numbered pagination.
  - Files to add: `src/components/minimal/PostListItem.tsx`, `src/components/minimal/Pager.tsx`, `src/app/(minimal)/page.tsx` (or branch inside `src/app/page.tsx`).
- Post page (clean reader):
  - Narrow column (max‑w ~ 700px), large H1, 1–2 key images with fixed ratios, TOC optional.
  - Simplify chrome in `src/components/article/*` when minimal theme is on.
- Performance budget:
  - Text‑based LCP (headline), thumbnails ≤ 40KB webp, images lazy, no gradients/overlays on feed.
- SEO:
  - CTR‑oriented titles, Article/NewsArticle schema, stable pagination links.

### Ads Strategy (Configurable)
- Placement (policy‑friendly):
  - In‑feed: 1 ad every 5–7 items (reserved height to avoid CLS).
  - In‑article: after first H2 and mid‑content (lazy). Optional sticky footer if allowed.
- Components:
  - `src/components/ads/AdSlot.tsx` (props: slot, width, height, lazy). Defer AdSense/GPT until user interaction/idle.
- Labels: “Advertisement” on each slot; ad density within guidelines.

### Security & Secrets (Important)
- `.env.local` must never be committed. Current `.gitignore` ignores `.env*`. Keep secrets in Vercel/host env.
- Rotate any keys that were shared in local files before production use.
- Pre‑commit guard (recommended): add `git-secrets` or a simple secret scan in CI.
  - Example scan: ripgrep for `sk-`, `pplx-`, `AIza`, etc.
- Verify history: `git log -p | rg -n "(sk-|pplx-|AIza|re_|fc-)"` in a clean environment before making repo public.

### Deployment Checklist
- [ ] Replace the listed zero/tiny image assets or keep the remaps.
- [ ] Set `NEXT_PUBLIC_THEME=minimal` for rollout (or test on preview).
- [ ] Validate Core Web Vitals (no CLS from ads; text LCP).
- [ ] Configure ads and enable behind `NEXT_PUBLIC_ADS=on`.
- [ ] Confirm no secrets in repo; use Vercel env vars for production.

---

# CLAUDE.md - Trends Today: Quality-First Content Strategy

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Trends Today is a premium tech blog platform built with Next.js 14, featuring AI-powered content generation, TechRadar-style design, and comprehensive SEO optimization. Our mission: Create the most engaging, high-quality tech content that readers actually want to consume and share.

## 🎯 CORE PHILOSOPHY: ULTRA-SHORT, HIGHLY READABLE CONTENT

**Primary Goal:** 30K monthly organic visitors through ultra-shareable, snackable content
**Strategy:** Target 2000+ ultra-short articles (400-500 words each)
**Approach:** 15-20 articles/day via 3 strategic batch runs (5-7 articles each)

### Ultra-Short Article Standards:
- ✅ **400-500 words maximum** - 2-minute read time for high completion rates
- ✅ **Engaging hooks** - Compelling story or surprising fact in first 80-100 words
- ✅ **Premium typography** - Bold statistics, blockquotes, generous white space
- ✅ **SEO-optimized** - Long-tail keywords, semantic search optimization
- ✅ **3-4 internal links** - Strategic cross-linking for 3+ pages per session
- ✅ **Visual hierarchy** - Short paragraphs (2-3 sentences), horizontal rules between sections

## 🤖 AGENT-DRIVEN AUTOMATION SYSTEM

### Core Content Agents (Optimized for Quality + Efficiency)

#### Production Agents ✅ DEPLOYED & OPTIMIZED
- **news-scanner.js** - Discovers trending topics from RSS, Reddit, industry sources
- **content-creator.js** - Generates engaging articles using cached research + Perplexity API
- **seo-finder.js** - Identifies low-competition, high-potential keywords
- **image-hunter.js** - Sources and optimizes unique images for each article
- **image-hunter-v2.js** - Enhanced image sourcing with content-aware analysis
- **enhanced-image-hunter.js** - Production-grade image system with 60+ curated sources
- **quality-check.js** - Validates content quality, engagement, and SEO compliance
- **trust-builder.js** - Adds author credentials, sources, and authority signals
- **content-refresher.js** - Updates outdated information and maintains freshness

#### Advanced Utility Modules ✅ NEW & ENHANCED
- **perplexity-enhanced.js** - Advanced Perplexity integration with caching and fallbacks
- **ai-image-generator.js** - OpenAI DALL-E 3 integration for custom image generation
- **comprehensive-image-system.js** - Multi-source image pipeline (stock + AI + fallbacks)
- **firecrawl-enhanced.js** - Advanced web scraping with smart content extraction

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

### 🚀 API ECOSYSTEM & CAPABILITIES (86% Success Rate)

#### ✅ WORKING APIS (7/9 Total)
**Content Generation & Research:**
- **Perplexity AI** - Real-time research with citations and source validation
- **OpenAI GPT-4** - Advanced content generation and editing
- **Google AI/Gemini 1.5** - Alternative content generation with latest knowledge

**Image & Visual Content:**
- **Unsplash API** - 3M+ professional stock photos with proper attribution
- **Pexels API** - Backup stock photo source with commercial licensing
- **OpenAI DALL-E 3** - Custom AI image generation (1024x1024, HD quality)
- **Firecrawl API** - Advanced web scraping with content extraction

#### ⚠️ REQUIRES SETUP (2/9 Total)
- **Google AI Images (Imagen)** - Requires Google Cloud Project configuration
- **News API** - Needs API key configuration for breaking news feeds

#### API Efficiency & Timeout Management ⚡
```javascript
// Production-ready timeout-resistant architecture
- HTTP timeouts: 30-60 seconds with exponential backoff retry
- API rate limiting: 2 req/sec Perplexity, 1 req/sec Firecrawl, 0.5 req/sec DALL-E
- Intelligent caching: 1-hour TTL for research, 24-hour for news, 7-day for images
- Demo mode fallbacks: High-quality templates when APIs unavailable
- Parallel processing: Promise.allSettled() for 4x faster execution
- Cost optimization: Stock photos first, AI generation as premium fallback
```

## 🎯 CONTENT STRATEGY: 2000+ ULTRA-SHORT ARTICLES

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

### 🔧 COMPREHENSIVE ENVIRONMENT CONFIGURATION

#### 🔑 Production API Keys (All Working)
```bash
# AI & Research APIs (86% Success Rate)
PERPLEXITY_API_KEY=pplx-xxx...           # ✅ Real-time research with citations
OPENAI_API_KEY=sk-proj-xxx...            # ✅ GPT-4 + DALL-E 3 generation  
GOOGLE_AI_API_KEY=AIzaSyBxxx...          # ✅ Gemini 1.5 + future Imagen
GOOGLE_GEMINI_API_KEY=AIzaSyBxxx...      # ✅ Same key as Google AI

# Web Scraping & Data APIs  
FIRECRAWL_API_KEY=fc-xxx...              # ✅ Advanced content extraction
DATAFORSEO_LOGIN=xxx                     # ⚠️ SEO keyword research (optional)
DATAFORSEO_PASSWORD=xxx                  # ⚠️ SEO keyword research (optional)

# Image & Media APIs
UNSPLASH_ACCESS_KEY=K64i6xxx...          # ✅ 3M+ professional stock photos
PEXELS_API_KEY=DCebKJ0xxx...             # ✅ Backup stock photo source

# News & Social APIs
NEWS_API_KEY=xxx                         # ⚠️ Breaking news feeds (needs setup)

# Google Services (Future Enhancement)
GOOGLE_SEARCH_API_KEY=xxx                # Custom search for competitor analysis
GOOGLE_YOUTUBE_API_KEY=xxx               # Video content analysis
GOOGLE_MAPS_API_KEY=xxx                  # Location-based reviews
```

#### ⚙️ Agent Performance Configuration
```bash
# Batch Optimization Settings
API_TIMEOUT_MS=30000                     # 30-second HTTP timeouts (60s for images)
CACHE_TTL_HOURS=1                        # 1-hour research cache
MAX_DAILY_API_CALLS=300                  # Budget for 15 articles/day
CONTENT_QUALITY_THRESHOLD=85             # Minimum quality score per batch
MAX_ARTICLES_PER_BATCH=5                 # 5 articles per batch run
BATCH_EXECUTION_LIMIT=90                 # 90 minutes per batch maximum

# Image System Configuration
ENABLE_AI_IMAGE_GENERATION=true          # Use DALL-E when stock unavailable
DALLE_QUALITY=hd                         # Standard or HD quality
DALLE_STYLE=vivid                        # Vivid or natural style
IMAGE_CACHE_DAYS=7                       # Cache images for 7 days
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
- **Completion Rate**: >85% article completion rate
- **Pages per Session**: 3+ through strategic internal linking
- **SEO Performance**: >50% articles ranking page 1 within 90 days
- **Social Sharing**: 50-60% increase (ultra-short = highly shareable)
- **Bounce Rate**: <30% through engaging hooks and cross-linking

### Traffic Growth Timeline (15-20 Articles/Day Strategy):
- **Week 1**: 105 premium articles → 2K visitors (19 visitors/article avg - new content)
- **Month 1**: 450 premium articles → 12K visitors (27 visitors/article avg)
- **Month 2**: 900 premium articles → 25K visitors (28 visitors/article avg)  
- **Month 3**: 1350 premium articles → 35K visitors (26 visitors/article avg)
- **Month 4**: 1800 premium articles → 50K visitors (28 visitors/article avg)

### Strategic Batch Production:
- **15-20 articles/day via 3 batches** - 5-7 ultra-short articles per batch run
- **400-500 words maximum** - Snackable content optimized for completion
- **60-minute batch cycles** - Research → Write → Typography → Links → Publish
- **Readability gates per batch** - 2-minute read time, 85% completion target
- **Engagement monitoring** - Track pages per session and social shares

## 🎯 DAILY WORKFLOW (3-Batch Strategy)

### Batch 1 - Morning (9 AM): First 5 Articles
```bash
npm run agents:discover     # Find 15-20 high-potential topics for day
npm run agents:morning      # Generate 5-7 ultra-short articles (Batch 1)
# Focus areas: Breaking news, trending topics, urgent reviews
# 90-minute execution limit with quality gates
# Topics: Mix of news (2) + reviews (2) + guides (1)
```

### Batch 2 - Midday (1 PM): Second 5 Articles  
```bash
npm run agents:midday       # Generate 5-7 ultra-short articles (Batch 2)
# Focus areas: Deep-dive reviews, comparison guides, how-tos
# 90-minute execution limit with quality gates
# Topics: Mix of reviews (3) + comparisons (1) + buying guide (1)
```

### Batch 3 - Evening (5 PM): Final 5 Articles
```bash
npm run agents:evening      # Generate 5-7 ultra-short articles (Batch 3)
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

## 🔧 AGENT INTEGRATION & TESTING

### 🧪 Testing & Validation Utilities
```bash
# API Testing (Current: 86% success rate)
node scripts/test-apis.js                # Test all configured APIs
node utils/perplexity-enhanced.js research "topic"    # Test Perplexity research
node utils/ai-image-generator.js generate "prompt"    # Test DALL-E generation
node utils/comprehensive-image-system.js find "query" # Test full image pipeline

# Content Quality Testing
node scripts/fix-yaml-errors.js         # Fix MDX frontmatter issues
node scripts/debug-mdx.js               # Debug MDX parsing errors
node scripts/fix-empty-images.js        # Fix 0-byte image files
```

### 🤖 Agent Integration Patterns
```javascript
// Modern agent architecture with enhanced capabilities
const PerplexityEnhanced = require('./utils/perplexity-enhanced');
const { ComprehensiveImageSystem } = require('./utils/comprehensive-image-system');
const { AIImageGenerator } = require('./utils/ai-image-generator');

// Example: Content generation with full pipeline
const perplexity = new PerplexityEnhanced();
const imageSystem = new ComprehensiveImageSystem();

async function generateArticle(topic) {
  // Research with citations
  const research = await perplexity.research(topic, { type: 'deep' });
  
  // Generate content
  const content = await perplexity.generateContent(topic, 'article');
  
  // Get perfect image (stock first, AI fallback)
  const image = await imageSystem.findBestImage(topic, { 
    type: 'auto',
    downloadImages: true 
  });
  
  return { content, image, research };
}
```

### 📁 Enhanced File Structure
```
/agents/                    # Core automation agents
  ├── enhanced-image-hunter.js      # Production image system
  ├── image-hunter-v2.js           # Enhanced version with analysis
  └── content-creator.js           # Article generation

/utils/                     # Advanced utility modules  
  ├── perplexity-enhanced.js       # Advanced research with caching
  ├── ai-image-generator.js        # DALL-E 3 integration
  ├── comprehensive-image-system.js # Multi-source image pipeline
  └── firecrawl-enhanced.js        # Advanced web scraping

/scripts/                   # Testing & maintenance
  ├── test-apis.js                 # Comprehensive API testing
  ├── fix-yaml-errors.js          # Content format fixes
  └── debug-mdx.js                # MDX parsing diagnostics

/.cache/                    # Performance optimization
  ├── /images/                    # Downloaded image cache
  ├── /perplexity/               # Research response cache
  └── image-path-mappings.json   # Path correction cache
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
- ❌ **Over 500 word articles** - Keep ultra-short for maximum engagement
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
