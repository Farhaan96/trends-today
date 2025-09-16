# CLAUDE.md - Trends Today: Premium AI-Powered Editorial System

This file provides comprehensive guidance to Claude Code (claude.ai/code) when working with our advanced AI-powered content generation and image creation system.

## 🎯 PROJECT OVERVIEW

Trends Today is a premium tech journalism platform powered by advanced AI systems, featuring photorealistic image generation, ultra-short content strategy, and comprehensive quality validation. Our mission: Create the most engaging, professional-grade content that meets serious journalism standards.

**Current Date:** 2025-09-15T04:39:19.000Z

### Core Technical Architecture

- **Platform:** Next.js 14 with TypeScript
- **Content:** MDX-based articles with AI-powered generation
- **Images:** GPT-Image-1 photorealistic professional photography
- **Quality:** National Geographic/Scientific American publication standards
- **SEO:** Comprehensive optimization with real-time validation

## 🤖 AI AGENT PIPELINE SYSTEM

**IMPORTANT:** Claude Code acts as the batch orchestrator and coordinates all specialized agents directly. The batch-orchestrator agent is not needed since Claude Code itself manages the pipeline workflow.

### Core Content Generation Agents

#### ultra-short-content-creator

- **Purpose:** Creates 400-500 word articles optimized for 2-minute read time
- **Capabilities:** Real-time research using WebSearch and WebFetch
- **Quality Standards:** Engaging hooks, premium typography, fact-checked content
- **Output:** Professional .mdx files with proper frontmatter
- **CRITICAL IMAGE RULE:**
  - NEVER generate images or call image generation utilities
  - Set image: '' and imageAlt: '' in frontmatter
  - Image generation is handled ONLY by dedicated image-generator agent later in pipeline

#### trending-topics-discovery

- **Purpose:** Identifies emerging topics across multiple sources
- **CRITICAL:** MUST check existing content first to avoid duplicates
- **Sources:** Reddit, Twitter, tech blogs, scientific journals, news sites
- **Algorithm:** Sentiment analysis + engagement metrics + novelty scoring + uniqueness check
- **Categories:** Science, Technology, Space, Health, Psychology, Culture
- **Requirements:**
  - Search existing content/ directory before topic selection
  - Avoid similar themes (e.g., no more blood test articles if already covered)
  - Find genuinely surprising, counterintuitive, or mind-blowing topics
  - Prioritize weird, controversial, or shocking discoveries over generic breakthroughs

#### fact-checker

- **Purpose:** Validates content accuracy using real-time web research
- **Threshold:** >80% accuracy required for publication
- **Method:** Cross-references multiple authoritative sources
- **Sources:** Academic papers, official reports, verified news outlets

#### typography-enhancer

- **Purpose:** Applies professional formatting for maximum readability
- **Features:** Bold statistics, expert blockquotes, visual hierarchy
- **Standards:** Short paragraphs (2-3 sentences), horizontal rule sections
- **Typography:** Premium editorial formatting for engagement

#### smart-content-linker

- **Purpose:** Adds strategic internal links for 3+ pages per session
- **Algorithm:** Semantic similarity + category relevance + engagement potential
- **Target:** 3-4 strategic internal links per article
- **Optimization:** Cross-category linking for content discovery

#### quality-validator

- **Purpose:** Ensures all content meets publication standards
- **Checks:** Word count, reading time, engagement score, SEO optimization
- **Requirements:** 400-500 words, 2-minute read, proper .mdx format
- **Gate:** Must pass before publication

#### build-validator

- **Purpose:** Prevents technical errors from reaching production
- **Validation:** YAML frontmatter, TypeScript compilation, file extensions
- **Error Prevention:** Wrong extensions (.md instead of .mdx), invalid dates
- **Integration:** Automatic validation after content creation

### 🎨 ENHANCED AI IMAGE GENERATION SYSTEM

#### Professional Photorealistic Standards (GPT-Image-1)

**Technical Specifications:**

- **Model:** GPT-Image-1 (latest OpenAI) with enhanced professional prompting
- **Quality:** High-resolution (1536x1024) optimized for editorial headers
- **Cost:** ~$0.19 per image for premium quality
- **Speed:** 3-second rate limiting for optimal quality

**Photography Grade Standards:**

- **Camera Equipment:** Canon EOS R5, medium format, specialized lenses
- **Lighting:** Professional studio, museum archival, scientific documentation
- **Composition:** Editorial standards, rule of thirds, maximum detail preservation
- **Style:** National Geographic / Scientific American / Nature publication quality

**Category-Specific Expertise:**

1. **Science/Archaeological**
   - Museum quality archival presentation
   - Ancient artifacts, cuneiform tablets, excavation sites
   - Academic research documentation standards
   - Natural diffused museum lighting

2. **Technology**
   - Clean product photography, minimalist design
   - Professional corporate aesthetic
   - Commercial photography standards
   - Controlled studio lighting setup

3. **Space**
   - NASA photography style, astronomical imaging
   - Scientific space mission documentation
   - Cosmic phenomena visualization
   - Dramatic cosmic lighting effects

4. **Health**
   - Medical photography, clinical documentation
   - Professional healthcare presentation
   - Precision medicine visualization
   - Soft clinical lighting standards

5. **Psychology**
   - Professional study photography
   - Human-centered research documentation
   - Cognitive science visualization
   - Empathetic professional setup

6. **Culture**
   - Documentary photojournalism style
   - Cultural anthropology documentation
   - Authentic social media/creator economy visualization
   - Natural golden hour lighting

**Absolute Editorial Restrictions:**

- ❌ NO text, numbers, words, letters, or readable characters
- ❌ NO logos, watermarks, brand names, corporate identifiers
- ❌ NO cartoon, illustration, CGI, artistic interpretation styles
- ❌ NO amateur photography or social media filter aesthetics
- ✅ ONLY photorealistic, professional documentary-style photography
- ✅ Must meet serious journalism and scientific publication standards

## 📝 CONTENT STRATEGY: ULTRA-SHORT EXCELLENCE

### Article Standards (400-500 Words Maximum)

**Structure Template:**

1. **Hook (80-100 words)** - Compelling story, surprising fact, or controversial statement
2. **Core Discovery (150-200 words)** - Main insights with evidence and expert quotes
3. **Real Examples (100-150 words)** - Concrete examples with specific statistics
4. **Practical Application (50-75 words)** - What this means for readers
5. **Conclusion (20-30 words)** - Strong call-to-action or thought-provoking question

**Quality Requirements:**

- ✅ **Engaging hook** - Must grab attention within first 10 seconds
- ✅ **3-5 statistics** - Bold formatted, specific and impactful
- ✅ **Expert quotes** - Blockquote format with proper attribution
- ✅ **Internal links** - 3-4 strategic cross-links per article
- ✅ **Sources section** - 3-5 real, verifiable sources with working URLs
- ✅ **Professional images** - AI-generated photorealistic visuals
- ✅ **2-minute read time** - Optimized for high completion rates

### Content Categories & Niches

**Primary Categories:**

- **Science** - Archaeological discoveries, research breakthroughs, lab studies
- **Technology** - AI advances, quantum computing, product innovations
- **Space** - NASA missions, astronomical discoveries, space exploration
- **Health** - Medical breakthroughs, precision medicine, clinical trials
- **Psychology** - Cognitive research, mental health innovations, behavioral studies
- **Culture** - Digital culture, creator economy, social media trends

**Micro-Niche Strategy (20+ specialized areas):**

- Budget Tech Excellence
- Gaming Hardware Deep Dives
- Smart Home Solutions
- Mobile Tech Mastery
- Audio Equipment Analysis
- Productivity Power Tools
- Content Creator Tools
- Fitness Tech Reality
- Remote Work Solutions
- Travel Tech Essentials

## 🔧 TECHNICAL IMPLEMENTATION

### File Structure & Organization

```
/utils/
  ├── ai-image-generator.js        # Enhanced GPT-Image-1 system
  ├── perplexity-enhanced.js       # Real-time research with citations
  ├── comprehensive-image-system.js # Multi-source image pipeline
  └── firecrawl-enhanced.js        # Advanced web scraping

/content/
  ├── science/                     # Archaeological, research content
  ├── technology/                  # AI, quantum, product reviews
  ├── space/                       # NASA, astronomy, missions
  ├── health/                      # Medical, precision medicine
  ├── psychology/                  # Cognitive, mental health
  └── culture/                     # Digital culture, creator economy

/public/images/
  ├── ai-generated/               # GPT-Image-1 professional photos
  ├── products/                   # Product review images
  └── news/                       # Breaking news visuals
```

### API Integration & Performance

**Working APIs (86% Success Rate):**

- **Perplexity AI** - Real-time research with citations
- **OpenAI GPT-4** - Content generation and image creation
- **Google Gemini 1.5** - Alternative content generation
- **Unsplash API** - 3M+ professional stock photos
- **Pexels API** - Backup stock photo source
- **Firecrawl API** - Advanced web scraping

**Performance Optimization:**

- HTTP timeouts: 30-60 seconds with exponential backoff
- Rate limiting: Optimized for quality over speed
- Intelligent caching: 1-hour research, 24-hour news, 7-day images
- Parallel processing: Promise.allSettled() for efficiency

### Environment Configuration

```bash
# AI & Research APIs
PERPLEXITY_API_KEY=pplx-xxx...           # Real-time research
OPENAI_API_KEY=sk-proj-xxx...            # GPT-4 + GPT-Image-1
GOOGLE_AI_API_KEY=AIzaSyBxxx...          # Gemini 1.5

# Image & Media APIs
UNSPLASH_ACCESS_KEY=K64i6xxx...          # Professional stock photos
PEXELS_API_KEY=DCebKJ0xxx...             # Backup images

# Web Scraping & Data
FIRECRAWL_API_KEY=fc-xxx...              # Content extraction

# Performance Settings
API_TIMEOUT_MS=30000                     # 30-second timeouts
CACHE_TTL_HOURS=1                        # Research cache duration
MAX_DAILY_API_CALLS=300                  # Budget management
CONTENT_QUALITY_THRESHOLD=85             # Minimum quality score
```

## 🚀 DAILY WORKFLOW & BATCH OPERATIONS

### 3-Batch Daily Strategy (15-20 Articles/Day)

**Batch 1 - Morning (9 AM): Breaking News & Trends**

```bash
# Generate 5-7 ultra-short articles on trending topics
npm run ultra:morning
npm run ultra:typography    # Apply professional formatting
npm run ultra:factcheck     # Verify accuracy >80%
npm run build              # Validate before deployment
```

**Batch 2 - Midday (1 PM): Analysis & Reviews**

```bash
# Generate 5-7 in-depth analysis articles
npm run ultra:midday
npm run ultra:typography    # Visual enhancements
npm run ultra:factcheck     # Source validation
npm run build              # Technical validation
```

**Batch 3 - Evening (5 PM): Evergreen & How-Tos**

```bash
# Generate 5-7 evergreen content pieces
npm run ultra:evening
npm run ultra:typography    # Premium formatting
npm run ultra:factcheck     # Final accuracy check
npm run build              # Pre-deployment validation
```

### Quality Assurance Gates

**Pre-Publication Checklist:**

- [ ] **Build validation** - Must compile without errors
- [ ] **Fact-checking** - >80% accuracy threshold
- [ ] **Typography** - Professional formatting applied
- [ ] **Image generation** - Photorealistic AI image created
- [ ] **Internal linking** - 3-4 strategic cross-links added
- [ ] **SEO optimization** - Meta descriptions, keywords optimized
- [ ] **Reading time** - 2-minute maximum confirmed

**File Format Requirements:**

- ✅ **Extension:** MUST use .mdx (NOT .md)
- ✅ **Authors:** Only Sarah Martinez, David Kim, Alex Chen, Emma Thompson
- ✅ **Date format:** ISO 8601 (YYYY-MM-DDTHH:MM:SS.000Z)
- ✅ **Current date:** Use actual current date, not hardcoded
- ✅ **Image path:** /images/ai-generated/ai-generated-[timestamp].png

## 📊 SUCCESS METRICS & PERFORMANCE TRACKING

### Content Quality KPIs

**Engagement Metrics:**

- **Article completion rate:** >85% target
- **Pages per session:** 3+ through strategic linking
- **Bounce rate:** <30% through engaging hooks
- **Social sharing:** 50-60% increase with ultra-short format

**SEO Performance:**

- **Ranking target:** >50% articles on page 1 within 90 days
- **Organic traffic:** 30K monthly visitors goal
- **Search visibility:** Long-tail keyword dominance
- **Click-through rate:** Optimized meta descriptions

**Production Efficiency:**

- **Article generation:** 15-20 articles/day via 3 batches
- **Quality threshold:** 85/100 minimum score
- **Fact-checking accuracy:** >80% required
- **Build success rate:** 100% technical validation

### Image Generation Performance

**Technical Metrics:**

- **Generation success rate:** >95% with GPT-Image-1
- **Quality consistency:** Professional photography standards
- **Cost efficiency:** ~$0.19 per high-quality image
- **Processing time:** 3-second rate limiting optimization

**Quality Standards:**

- **Resolution:** 1536x1024 optimized for editorial headers
- **Style consistency:** Category-specific professional photography
- **Editorial compliance:** No text/logos, photorealistic only
- **Publication readiness:** National Geographic quality standards

## 🛡️ QUALITY ASSURANCE PROTOCOLS

### Never Compromise On

**Content Excellence:**

- ✅ **Factual accuracy** - Multiple source verification required
- ✅ **Editorial standards** - Professional journalism quality
- ✅ **Visual quality** - Photorealistic AI-generated images only
- ✅ **User experience** - Mobile-first, fast loading, intuitive
- ✅ **Technical standards** - Valid MDX, proper frontmatter, build success

**Editorial Integrity:**

- ✅ **Source attribution** - Proper citations and links
- ✅ **Fact verification** - Cross-reference authoritative sources
- ✅ **Professional voice** - Authoritative, engaging, trustworthy
- ✅ **Visual authenticity** - No stock photos, custom AI imagery
- ✅ **Accuracy gates** - 80% fact-checking threshold minimum

### Red Flags to Avoid

**Content Quality Issues:**

- ❌ **Generic content** - Template-driven or AI-obvious writing
- ❌ **Over-length articles** - Must stay under 500 words
- ❌ **Poor image quality** - Stock photos or amateur visuals
- ❌ **Inaccurate information** - Unverified claims or outdated data
- ❌ **Technical errors** - Build failures, YAML errors, wrong extensions

**Editorial Standards Violations:**

- ❌ **Keyword stuffing** - Unnatural SEO optimization
- ❌ **Rushed publication** - Bypassing quality validation
- ❌ **API overuse** - Budget drain without quality gates
- ❌ **Fact-checking failures** - Below 80% accuracy threshold

## 🎯 COMPETITIVE ADVANTAGE STRATEGY

### What Sets Us Apart

**Technical Innovation:**

1. **AI-First Editorial Pipeline** - Fully automated quality assurance
2. **Photorealistic Image Generation** - Professional photography standards
3. **Ultra-Short Content Mastery** - 400-500 word engagement optimization
4. **Real-Time Fact Verification** - Live web research integration
5. **Category-Specific Expertise** - Specialized AI prompting per domain

**Editorial Excellence:**

1. **Professional Photography Standards** - National Geographic quality
2. **Serious Journalism Approach** - Academic and scientific rigor
3. **Authentic Voice Development** - Opinionated, authoritative content
4. **Strategic Content Linking** - 3+ pages per session optimization
5. **Mobile-First Design** - Optimized for modern consumption

**Content Strategy Differentiation:**

1. **Micro-Niche Dominance** - 20+ specialized coverage areas
2. **Engagement-First Design** - 2-minute read time optimization
3. **Quality Over Quantity** - Premium content standards
4. **Real-Time Research** - Latest information integration
5. **Professional Visual Standards** - AI-generated photorealistic imagery

### Success Philosophy

> "One exceptional 400-word article that achieves 90% completion rate and 3 page views per session is infinitely more valuable than 10 generic articles that readers abandon after 30 seconds. Quality compounds exponentially - mediocrity disappears into the noise."

This comprehensive AI system transforms Trends Today into a premium destination publication where readers come for insights and professional standards they can't find anywhere else, ensuring sustainable growth to 30K+ monthly visitors through content excellence rather than volume alone.

## 📋 CRITICAL REMINDERS

### File Management

- **NEVER create files unless absolutely necessary**
- **ALWAYS prefer editing existing files over creating new ones**
- **NEVER proactively create documentation files unless explicitly requested**
- **Use absolute file paths only - no relative paths**

### Agent Usage

- Use `/agents` command to see available agents
- Proper invocation: `> Use the [agent-name] subagent to [task]`
- Each agent should appear with colored box when properly invoked
- If no colored box appears, the agent is NOT actually running

### Image Generation

- **MANDATORY:** Every article must have AI-generated image using GPT-Image-1
- **NO stock photos, Unsplash, or reused images for articles**
- **Process:** Save article first, then generate image with utils/ai-image-generator.js
- **Path format:** /images/ai-generated/ai-generated-[timestamp].png

### Content Standards

- **File extension:** MUST be .mdx (NOT .md)
- **Word count:** 400-500 words maximum
- **Authors:** Only Sarah Martinez, David Kim, Alex Chen, Emma Thompson
- **Date:** Current ISO 8601 format, not hardcoded dates
- **Quality gate:** Must pass build validation and fact-checking before publication

---

## 🚨 CLAUDE CODE AGENT SYSTEM - USAGE NOTES

### ⚠️ Agent Invocation Issues

**PROBLEM:** Agents may not appear with colored boxes when invoked, meaning they're not being triggered as separate entities.

**CORRECT INVOCATION:**

- Use the `/agents` command first to see available agents
- Use `> Use the [agent-name] subagent to [task]` format
- Each agent should appear with its own colored box
- If no colored box appears, the agent is NOT actually running

**CURRENT STATUS:**

- Agents are defined in `.claude/agents/` but may not be properly registered
- The Task tool simulates agents but doesn't actually invoke them
- Need to use proper Claude Code subagent invocation syntax

### Available Agents in `.claude/agents/`

1. `batch-orchestrator` - Orchestrates the pipeline
2. `trending-topics-discovery` - Finds topics using WebSearch
3. `ultra-short-content-creator` - Creates articles using AI (now with .mdx support)
4. `build-validator` - Validates builds and fixes YAML/file errors
5. `fact-checker` - Verifies facts using WebSearch/WebFetch
6. `typography-enhancer` - Applies formatting
7. `quality-validator` - Ensures standards
8. `smart-content-linker` - Adds internal links
9. `publication-reviewer` - Final approval

**Tools Agents Use:**

- `WebSearch` - Real-time information
- `WebFetch` - Deep dive into sources
- `Write/Edit` - Content creation/modification
- `Read` - Analyze existing content
- NO direct API access (use utilities for that)

### Hybrid Approach for API Access

Since pure Claude agents can't use API keys directly:

- **Content/Research:** Use Claude agents (WebSearch/WebFetch)
- **Image Generation:** Use `utils/ai-image-generator.js` with OpenAI API
- **Other APIs:** Keep utility files in `utils/` for API access

### Testing Agent Invocation

**Test Command:**

```
> Use the trending-topics-discovery subagent to find 2 trending tech topics
```

**Expected Result:**

- Agent name appears in a colored box
- Agent operates as separate entity with its own context
- Agent uses its defined tools (WebSearch, WebFetch, etc.)

**If This Doesn't Work:**

1. Try `/agents` command to list available agents
2. Check `.claude/agents/` folder for agent files
3. Ensure each agent has proper YAML frontmatter
4. Try restarting Claude Code session
5. May need to manually register agents

### Current Workaround

Until proper agent invocation works:

- Use Task tool to simulate agent behavior
- Use JavaScript utilities for API access (`utils/` folder)
- Manually follow agent pipeline steps
