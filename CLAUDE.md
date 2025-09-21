# CLAUDE.md - Trends Today: Premium AI-Powered Editorial System

This file provides comprehensive guidance to Claude Code (claude.ai/code) when working with our advanced AI-powered content generation and image creation system.

## 🎯 PROJECT OVERVIEW

Trends Today is a premium tech journalism platform powered by advanced AI systems, featuring photorealistic image generation, ultra-short content strategy, and comprehensive quality validation. Our mission: Create the most engaging, professional-grade content that meets serious journalism standards.

**Current Date:** 2025-09-18T16:00:00.000Z

### Core Technical Architecture

- **Platform:** Next.js 14 with TypeScript
- **Content:** MDX-based articles with AI-powered generation
- **Images:** GPT-Image-1 photorealistic professional photography
- **Quality:** National Geographic/Scientific American publication standards
- **SEO:** Comprehensive optimization with real-time validation

## 🤖 ENHANCED AI AGENT PIPELINE SYSTEM - ZERO-WASTE DUPLICATE PREVENTION

**REVOLUTIONARY UPDATE:** Claude Code now acts as the intelligent orchestrator, managing a streamlined pipeline of 5 consolidated agents with **mandatory pre-creation duplicate prevention** and parallel execution capabilities for 3x performance improvement while achieving 100% content creation success rate.

**🎯 CRITICAL UPDATE - PIPELINE QUALITY FIXES (2025-01-17):**
Following comprehensive quality audit of 71 articles revealing 70/71 non-compliance issues, root cause analysis identified and eliminated three critical agent pipeline failures:

1. **Conflicting Instructions Fixed**: Removed contradictory dash/horizontal rule guidance between agents
2. **Complete Coverage Implemented**: Added explicit prohibition of horizontal rules (---) alongside em/en-dash restrictions
3. **Prominent Standards**: Moved critical 12-18 bold phrase limits from buried checklists to main workflow sections
   **Result**: Pipeline now produces 100% compliant articles on first creation, eliminating post-generation correction workflows.

### Enhanced Zero-Waste Pipeline Architecture

**Pre-Phase 0: Topic Validation & Duplicate Prevention (2 minutes)**

```
Claude Code (Orchestrator)
    ├─→ Generate diversity-aware research queries per category
    ├─→ Pre-validate topic uniqueness BEFORE any content creation
    ├─→ Mandatory duplicate checking: utils/content-diversity-manager.js
    └─→ Only approve verified unique topics for Phase 1
```

**Phase 1: Guaranteed Unique Content Creation (Parallel Execution)**

```
Claude Code (Orchestrator)
    ├─→ trending-content-creator (pre-validated topics only)
    ├─→ trending-content-creator (parallel instance 2)
    └─→ trending-content-creator (parallel instance 3)
```

**Phase 2: Enhancement & Validation (Parallel Execution)**

```
Claude Code (Orchestrator)
    ├─→ content-enhancer (NEW: typography + linking merged)
    ├─→ quality-factchecker (NEW: fact-check + quality merged)
    └─→ image-generator (specialized API usage)
```

**Phase 3: MANDATORY BLOCKING VALIDATION (Sequential)**

```
Claude Code (Orchestrator)
    └─→ build-validator (MANDATORY BLOCKING GATE - ALL issues must be fixed)
```

**🚨 CRITICAL: Phase 3 is a BLOCKING GATE. Articles are NOT complete until build-validator gives 100% clean validation. ALL warnings and errors are MANDATORY fixes that prevent publication.**

### Consolidated Agent Specifications

#### trending-content-creator (ENHANCED + ZERO-WASTE DUPLICATE PREVENTION)

- **Consolidates:** trending-topics-discovery + ultra-short-content-creator + mandatory pre-creation duplicate validation
- **Purpose:** End-to-end workflow from pre-validated topic research to guaranteed unique article creation
- **Capabilities:** Pre-creation duplicate validation, real-time research, content generation with category-aware word limits
- **CRITICAL ENHANCEMENT:** Mandatory duplicate checking BEFORE content creation to eliminate wasted writing time
- **Benefits:**
  - **100% content creation success rate** - zero rejected articles after writing
  - **Eliminates wasted writing time** - prevents 15-20 minutes of work per duplicate
  - Preserves research context throughout writing process
  - 40% faster execution through context preservation
  - Adapts content length to category requirements automatically
  - **Zero orphaned files** - no cleanup required for rejected content
- **Tools:** WebSearch, WebFetch, Write, Read, Grep, Glob, Bash
- **Content-Type Aware Standards:**
  - **Scientific/Research:** 600-800 words with clear explanations and accessible findings
  - **Technology Deep Dives:** 600-800 words with technical specifications and comparisons
  - **Quick News/Trends:** 300-500 words optimized for rapid consumption
  - **Psychology/Health:** 500-700 words with study methodology and applications
- **Universal Quality:** Engaging hooks, fact-checked content, evidence-based analysis
- **CRITICAL FORMATTING RULES (2025-01-17 COMPLIANCE UPDATE):**
  - **Strategic Bolding LIMIT**: Maximum 12-18 bold phrases per article (key statistics, expert names first mention, major discoveries, institutions first mention)
  - **NEVER use horizontal rules (---)** for section breaks - use natural paragraph breaks instead
  - **NEVER use em-dashes (—) or en-dashes (–)** for emphasis - convert to periods, commas, or parentheses
  - **NO complex data tables or charts** - use narrative explanations with key numbers bolded
- **CRITICAL IMAGE RULE:**
  - NEVER generate images or call image generation utilities
  - Set image: '' and imageAlt: '' in frontmatter
  - Image generation handled by dedicated image-generator agent
- **Parallel Capability:** 3-5 instances can run simultaneously for batch generation

#### content-enhancer (CONSOLIDATED)

- **Consolidates:** typography-enhancer + smart-content-linker + text cleanup
- **Purpose:** Single-pass content enhancement for typography and strategic linking
- **Capabilities:** Strategic bold formatting, expert quotes, internal linking, text cleanup
- **Benefits:**
  - Single pass through content eliminates redundant file operations
  - Unified enhancement reduces processing time by 60%
  - Consistent formatting and linking strategy
  - Applies strategic bolding guidelines to remove excessive formatting
- **Tools:** Read, Edit, MultiEdit, Glob, Grep
- **Standards:** Visual hierarchy, 3-4 strategic links, premium typography with selective bolding
- **CRITICAL FORMATTING COMPLIANCE (2025-01-17 FIXES):**
  - **Strategic Bolding LIMIT**: Maximum 12-18 bold phrases per article focusing on breakthrough moments, key measurements, and scientific discoveries
  - **Horizontal Rule Prohibition**: NEVER use horizontal rules (---) - use natural paragraph breaks instead
  - **Dash Elimination**: NEVER use em-dashes (—) or en-dashes (–) for emphasis - convert to periods, commas, or parentheses
  - **Internal Link Format**: ONLY use `/category/article-name` format (NEVER `../category/` relative paths or full URLs like vercel.app)
  - **Bold only**: key researchers (first mention), critical statistics, major discoveries, important institutions
  - **Never bold**: common terms, repeated mentions, adjectives, general descriptions
- **Optimization:** All text enhancements applied in one MultiEdit operation

#### quality-factchecker (CONSOLIDATED)

- **Consolidates:** fact-checker + quality-validator + publication-reviewer
- **Purpose:** Comprehensive accuracy and quality validation in unified workflow
- **Capabilities:** Real-time fact verification, quality scoring, publication readiness with category-specific standards
- **Benefits:**
  - Unified quality assessment eliminates multiple validation rounds
  - Parallel fact-checking across multiple sources
  - Single comprehensive quality report
  - Category-appropriate validation depth
- **Tools:** Read, WebSearch, WebFetch, TodoWrite, Grep, Glob
- **Category-Specific Standards:**
  - **Scientific/Research:** >90% accuracy, extensive source verification, accessible explanation validation
  - **Technology:** >85% accuracy, technical specification verification, product claim validation
  - **Quick News:** >80% accuracy, rapid fact verification, trending topic validation
  - **Psychology/Health:** >85% accuracy, study methodology verification, clinical claim validation
- **Universal Standards:** SEO compliance, proper attribution, working source links
- **Efficiency:** Parallel research and validation reduce processing time by 50%

#### build-validator (ENHANCED)

- **Enhanced from:** Original build-validator with comprehensive technical checks
- **Purpose:** Complete technical validation including TypeScript, builds, and deployment readiness
- **Capabilities:** YAML validation, build testing, TypeScript compilation, SEO checks
- **New Features:**
  - Advanced date and timestamp validation
  - Image path and AI-generation verification
  - Static asset validation
  - Automated fix implementation for common issues
- **Tools:** Read, Bash, TodoWrite, Edit, Glob, Grep
- **Standards:** Zero tolerance for technical errors, automated fixing where possible

#### image-generator (UNCHANGED)

- **Purpose:** Professional photorealistic image generation using GPT-Image-1
- **Integration:** Utilizes utils/ai-image-generator.js for API access
- **Standards:** National Geographic quality, no text/logos, category-specific prompting
- **Tools:** Read, Bash, Glob, Edit
- **Performance:** 3-second rate limiting for optimal quality

### Parallel Execution Strategy

#### Orchestration Patterns

**Morning Batch (Parallel Content Creation):**

```javascript
// Claude Code executes simultaneously:
Task('trending-content-creator', {
  topic: 'AI breakthrough',
  category: 'technology',
});
Task('trending-content-creator', {
  topic: 'Space discovery',
  category: 'space',
});
Task('trending-content-creator', {
  topic: 'Health innovation',
  category: 'health',
});
```

**Enhancement Phase (Parallel Processing):**

```javascript
// Claude Code executes simultaneously:
Task('content-enhancer', {
  files: ['batch1_article1.mdx', 'batch1_article2.mdx'],
});
Task('quality-factchecker', {
  files: ['batch1_article3.mdx', 'batch1_article4.mdx'],
});
```

**Image Generation Phase (After Fact-Checking):**

```javascript
// Only after facts are verified:
Task('image-generator', { files: ['fact_checked_articles.mdx'] });
```

#### Performance Improvements

**Before Optimization:**

- 10 sequential agents × 3 minutes = **30 minutes per batch**
- High context switching overhead
- Redundant file operations

**After Optimization:**

- 5 agents with parallel execution = **10 minutes per batch**
- 3x faster processing
- 50% reduction in context usage
- 60% fewer file operations

### Agent Invocation Best Practices

#### Proper Task Tool Usage

**Correct Orchestration Syntax:**

```
Use the trending-content-creator subagent to discover and create an article about [topic]
Use the content-enhancer subagent to apply typography and linking to [files]
Use the quality-factchecker subagent to validate accuracy of [articles]
```

**Parallel Execution Example:**

```
Launch 3 trending-content-creator instances in parallel to generate morning batch
Process enhancement and fact-checking simultaneously for efficiency
```

#### Quality Assurance Integration

**Validation Gates:**

- Phase 1: Content creation with built-in duplicate checking
- Phase 2: Enhancement and fact-checking run in parallel
- Phase 3: Image generation (AFTER fact-checking)
- Phase 4: **MANDATORY BLOCKING BUILD VALIDATION** - NO EXCEPTIONS
- **🚨 CRITICAL: Articles are INCOMPLETE until build-validator approves 100% clean validation**

**BLOCKING CRITERIA (Zero Tolerance):**
- Word count outside category limits (Science/Tech: 600-800, Health: 500-700, Culture: 300-500)
- SEO title >60 chars or <50 chars
- Meta description >160 chars or <150 chars
- Strategic bolding >18 or <8 bold phrases
- Any horizontal rules (---) or em/en-dashes (—/–)
- Technical errors (YAML, file extensions, build failures)

**Error Handling:**

- Automatic retry logic for failed agents
- TodoWrite integration for tracking fixes
- Comprehensive error reporting at each phase

### Removed Legacy Agents

**Deprecated and Consolidated:**

- ❌ `batch-orchestrator` → Claude Code orchestration
- ❌ `trending-topics-discovery` → Merged into trending-content-creator
- ❌ `ultra-short-content-creator` → Merged into trending-content-creator
- ❌ `typography-enhancer` → Merged into content-enhancer
- ❌ `smart-content-linker` → Merged into content-enhancer
- ❌ `fact-checker` → Merged into quality-factchecker
- ❌ `quality-validator` → Merged into quality-factchecker
- ❌ `publication-reviewer` → Merged into quality-factchecker

### Success Metrics

**Performance Targets:**

- **Batch Processing Time:** 8 minutes (down from 30 - includes 2 min pre-validation)
- **Content Creation Success Rate:** 100% (zero rejected articles after writing)
- **Wasted Writing Time:** 0 minutes (eliminated through pre-creation validation)
- **Parallel Agent Utilization:** Up to 10 concurrent tasks
- **Context Efficiency:** 50% reduction in token usage
- **Quality Maintenance:** 100% of original standards preserved

**Quality Assurance:**

- **Accuracy Threshold:** >80% maintained across all consolidations
- **Content Standards:** Category-appropriate length, 85+ quality score
- **Technical Compliance:** Zero build failures, comprehensive validation
- **Reader Engagement:** 3+ pages per session through strategic linking

This optimized pipeline represents a breakthrough in AI content generation efficiency while maintaining the premium quality standards that define Trends Today's editorial excellence.

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

## 📝 CONTENT STRATEGY: CATEGORY-OPTIMIZED EXCELLENCE

### Content-Type Aware Word Count Strategy

**Scientific & Research Articles (600-800 words):**

- **Purpose:** Research findings, technical breakthroughs, scientific discoveries
- **Why moderate length:** Complex topics need explanation but must remain accessible and readable
- **Structure:** Hook → Research Context → Key Findings → Real-world Implications → Conclusion
- **Examples:** "Scientists Found Evidence We're Living in a Digital Universe" (entropy/energy research)
- **Key features:** Clear explanations, strategic statistics, accessible language, expert quotes

**Technology Deep Dives (600-800 words):**

- **Purpose:** Product reviews, technical analysis, comparative studies
- **Why longer:** Technical specifications, performance metrics, detailed comparisons require space
- **Structure:** Hook → Technical Overview → Performance Analysis → Comparison Data → Practical Implications
- **Examples:** Quantum computing breakthroughs, AI model comparisons, hardware reviews

**Quick News & Trends (300-500 words):**

- **Purpose:** Breaking news, viral trends, rapid updates, cultural moments
- **Why shorter:** Immediate consumption, social sharing, rapid engagement
- **Structure:** Hook → Core Story → Key Statistics → Quick Analysis → Call-to-action
- **Examples:** Tech company announcements, trending topics, market updates

**Psychology & Health Insights (500-700 words):**

- **Purpose:** Research studies, behavioral analysis, health discoveries
- **Why moderate:** Sufficient space for study methodology and practical applications
- **Structure:** Hook → Study Context → Research Findings → Real-world Applications → Takeaways

### Universal Quality Requirements (All Categories)

- ✅ **Compelling hook** - Must grab attention within first 10 seconds
- ✅ **Evidence-based content** - Key statistics and findings strategically emphasized
- ✅ **Expert quotes** - Blockquote format with proper attribution
- ✅ **Strategic internal links** - 3-5 cross-links per article
- ✅ **Comprehensive sources** - 3-6 real, verifiable sources with working URLs
- ✅ **Professional AI images** - Category-appropriate photorealistic visuals
- ✅ **Optimized completion rates** - Length appropriate to content complexity

### Strategic Bolding Guidelines (CRITICAL)

**Use Bold Sparingly - Maximum 8-12 bold phrases per article:**

✅ **DO Bold:**

- Key researcher names (first mention only): **Dr. Sarah Johnson**
- Critical statistics/findings: **decreased by 13.7%**, **10^109 more energy**
- Important discoveries: **Second Law of Infodynamics**
- Major institutions (first mention): **University of Portsmouth**
- Section headers and key conclusions
- Most impactful 2-3 takeaways for readers

❌ **DON'T Bold:**

- Common technical terms (entropy, quantum, simulation)
- Repeated mentions of same people/concepts
- Every adjective or modifier (avoid **super complex**)
- General descriptions (avoid **crushing numbers**)
- Regular nouns (avoid **information systems**)
- Obvious phrases (avoid **traditional physics**)
- Data tables, charts, or heavy numerical presentations

**Goal:** Guide reader's eye to only the most critical information. Excessive bolding reduces impact and looks spammy.

### Critical Content Guidelines

**AVOID Heavy Data Presentations:**

- ❌ NO complex data tables with multiple rows and columns
- ❌ NO extensive numerical breakdowns that overwhelm readers
- ❌ NO chart-like text presentations that look like spreadsheets
- ❌ NO data visualization charts or graphs of any kind
- ✅ USE narrative explanations with strategically placed key numbers
- ✅ USE accessible language that makes complex concepts clear
- ✅ USE storytelling to convey data insights without overwhelming detail

**Readability First:** Complex scientific topics must be accessible. Present findings through clear narrative rather than data dumps.

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

## 🚨 MANDATORY DUPLICATE PREVENTION SYSTEM

**CRITICAL UPDATE:** Comprehensive duplicate detection system implemented to prevent topic oversaturation across ALL categories.

### Content Diversity Manager

**Core Functionality:**

- **Real-time duplicate detection** - Scans existing content before creation
- **Topic saturation analysis** - Identifies oversaturated themes per category
- **Diverse query generation** - Generates research queries that avoid saturated topics
- **Title similarity detection** - Prevents similar headlines (>70% match blocked)

**Usage Commands:**

```bash
# Full diversity analysis across all categories
node utils/content-diversity-manager.js report

# Check if proposed article would be duplicate
node utils/content-diversity-manager.js check health "CRISPR Baby Treatment" "Gene editing saves infant"

# Generate diverse research queries avoiding saturated topics
node utils/content-diversity-manager.js queries psychology 3

# Analyze specific category saturation
node utils/content-diversity-manager.js analyze health
```

### Duplicate Detection Patterns (Per Category)

**Health:**

- CRISPR/gene editing (OVERSATURATED: 3+ articles)
- Precision medicine (OVERSATURATED: 2+ articles)
- Cancer breakthroughs (OVERSATURATED: 2+ articles)
- AI medical diagnosis
- Mental health treatments

**Psychology:**

- Brain research/neuroscience (OVERSATURATED: 4+ articles)
- Consciousness studies
- Procrastination research
- Meditation/mindfulness
- Decision making/cognitive bias

**Science:**

- Quantum physics breakthroughs
- Archaeological discoveries
- Climate change research
- Biological phenomena
- Materials science

**Technology:**

- AI breakthroughs
- Robotics/automation
- Quantum computing
- Cybersecurity
- Autonomous vehicles

**Space:**

- Exoplanet discoveries (OVERSATURATED: 3+ articles)
- NASA missions
- Mars exploration
- Black hole research
- Asteroid/comet studies

**Culture:**

- Social media trends (OVERSATURATED: 3+ articles)
- Creator economy (OVERSATURATED: 3+ articles)
- AI art/digital creativity
- Gaming/esports
- Privacy/digital rights

### Enhanced Batch Orchestrator

**Integration:**

- **Mandatory duplicate checking** before topic assignment
- **Oversaturation warnings** displayed in batch plans
- **Diverse query generation** replaces generic searches
- **Category-specific avoidance** of saturated topics

**Example Enhanced Output:**

```
Article 1: HEALTH
Target: 500-700 words
Recent articles: 9
🚨 AVOID these oversaturated topics: crispr, precision medicine, cancer breakthrough
Primary Query: "rare disease breakthrough treatments 2025"
Secondary Query: "biomarker discovery revolutionizing diagnostics"
```

### Mandatory Workflow Integration

**ENHANCED AGENT INSTRUCTIONS - ZERO-WASTE PROTOCOL:**

1. **Claude Code Orchestrator MUST:**
   - Generate diversity-aware queries: `node utils/content-diversity-manager.js queries [category] 1`
   - Provide pre-approved unique research queries to agents
   - Never assign generic topics that risk duplication

2. **trending-content-creator MUST:**
   - **MANDATORY PRE-CHECK:** Before writing ANY content, run: `node utils/content-diversity-manager.js check [category] "[proposed title]" "[proposed description]"`
   - ONLY proceed if `isDuplicate: false` in response
   - If `isDuplicate: true`, request new pre-approved query from orchestrator
   - **NEVER write content** that hasn't passed pre-creation duplicate validation

3. **balanced-batch-orchestrator MUST:**
   - Include oversaturation warnings in all batch plans
   - Generate diversity-aware research queries
   - Display recent article counts per category
   - Provide explicit avoidance instructions

### Success Metrics

**Duplicate Prevention KPIs:**

- **Zero HIGH risk duplicates** - System must reject >70% similar articles
- **Topic diversity score** - Max 2 articles per topic pattern in 30 days
- **Category balance** - No category >3 articles ahead of others
- **Research diversity** - Unique research angles per batch

**Quality Assurance:**

- All article creation must pass duplicate detection
- Batch plans must show oversaturation warnings
- Agents must use diversity-aware queries only
- Manual override requires explicit user approval

## 🔧 TECHNICAL IMPLEMENTATION

### File Structure & Organization

```
/utils/
  ├── ai-image-generator.js        # Enhanced GPT-Image-1 system
  ├── perplexity-enhanced.js       # Real-time research with citations
  ├── comprehensive-image-system.js # Multi-source image pipeline
  ├── content-diversity-manager.js  # NEW: Comprehensive duplicate prevention system
  ├── balanced-batch-orchestrator.js # Enhanced with diversity checking
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

### Content Type Decision Framework

**Use this decision tree to determine content approach:**

1. **Is this breaking news or trending topic?** → **Quick News/Trends (300-500 words)**
   - Social media buzz, tech announcements, viral phenomena
   - Fast consumption, high sharing potential

2. **Does this involve complex scientific research or data?** → **Scientific/Research (600-800 words)**
   - Studies with clear explanations, accessible findings, expert insights
   - Examples: Clinical trials, physics discoveries, research papers

3. **Is this a product review or technical analysis?** → **Technology Deep Dive (600-800 words)**
   - Specifications, performance metrics, comparisons
   - Examples: Hardware reviews, software analysis, tool comparisons

4. **Is this psychology/health research with practical applications?** → **Psychology/Health (500-700 words)**
   - Study findings with real-world implications
   - Examples: Behavioral research, medical discoveries, wellness studies

**Remember:** Quality and comprehensive coverage trump arbitrary word limits. The goal is optimal value for readers.

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
- ❌ **Wrong-length articles** - Must match category requirements (Science/Tech: 600-800, Health: 500-700, Culture: 300-500)
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
3. **Category-Optimized Content Mastery** - Category-appropriate length optimization (Science/Tech: 600-800, Health: 500-700, Culture: 300-500)
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

### Agent Pipeline Order (CRITICAL)

**CORRECT SEQUENCE FOR ARTICLES:**

1. **trending-content-creator** - Create article with image: '' and imageAlt: ''
2. **content-enhancer** - Apply typography and internal linking
3. **quality-factchecker** - Verify all facts and research accuracy
4. **image-generator** - Generate AI image after content is finalized
5. **build-validator** - 🚨 **MANDATORY BLOCKING VALIDATION GATE** 🚨

**🚨 CRITICAL RULES:**
- Images must come AFTER fact-checking to ensure accuracy
- **Articles are NOT complete until build-validator gives 100% clean pass**
- **ALL build-validator findings are BLOCKING issues, not optional suggestions**
- **Must fix ALL warnings/errors before articles can be considered finished**

### Image Generation

- **MANDATORY:** Every article must have AI-generated image using GPT-Image-1
- **NO stock photos, Unsplash, or reused images for articles**
- **Process:** Generate image AFTER fact-checking and content finalization
- **Path format:** /images/ai-generated/ai-generated-[timestamp].png

### Content Standards (BLOCKING REQUIREMENTS)

**🚨 THESE ARE MANDATORY BLOCKING CRITERIA - Build-validator will REJECT articles that violate ANY of these:**

- **File extension:** MUST be .mdx (NOT .md) - BLOCKING
- **Word count:** Category-appropriate length (Science/Tech: 600-800, Health: 500-700, Culture: 300-500) - BLOCKING
- **SEO Title:** 50-60 characters ONLY - BLOCKING
- **Meta Description:** 150-160 characters ONLY - BLOCKING
- **Strategic Bolding:** 8-18 bold phrases ONLY - BLOCKING
- **NO horizontal rules (---)** anywhere in content - BLOCKING
- **NO em-dashes (—) or en-dashes (–)** for emphasis - BLOCKING
- **Authors:** Only Sarah Martinez, David Kim, Alex Chen, Emma Thompson - BLOCKING
- **Date:** Current ISO 8601 format, not hardcoded dates - BLOCKING
- **Quality gate:** Must pass 100% clean build validation before publication - BLOCKING

**CRITICAL:** Articles are INCOMPLETE until ALL standards are met and build-validator approves.

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

### Active Agents in `.claude/agents/` (5 Consolidated Agents)

1. `trending-content-creator` - Discovers topics and creates articles (consolidated discovery + creation)
2. `content-enhancer` - Applies typography, linking, and text cleanup (consolidated enhancement)
3. `quality-factchecker` - Comprehensive fact-checking and quality validation (consolidated validation)
4. `image-generator` - Enhanced 2025 text-free image generation with OCR validation
5. `build-validator` - Technical validation, builds, YAML, and deployment readiness

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
> Use the trending-content-creator subagent to discover and create an article about fascinating space phenomena
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
