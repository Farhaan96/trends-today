# CLAUDE.md - Trends Today: Streamlined AI Content System

**Current Date:** 2025-09-20

## 🎯 CORE SYSTEM (Simplified)

**Platform:** Next.js 14 with TypeScript, MDX articles, GPT-Image-1 images
**Mission:** Create viral, SEO-optimized content that dominates long-tail keywords
**Quality Standard:** 85+ completion rate, 3+ pages per session

## 🤖 STREAMLINED AGENT SYSTEM (2 Agents Only)

### Agent 1: content-creator
- **Purpose:** Discover topics + create complete articles with SEO-optimized titles
- **Tools:** WebSearch, WebFetch, Write, Read, Bash
- **Output:** Complete MDX article with perfect titles and filenames

### Agent 2: quality-validator
- **Purpose:** Fact-check + image generation + technical validation
- **Tools:** WebSearch, WebFetch, Read, Edit, Bash
- **Output:** Validated article with AI image

**Gone:** 3 redundant agents that created complexity without value

## 📝 TITLE OPTIMIZATION SYSTEM (SPARK Framework)

### Core Formula (50-60 characters):
```
"How [Subject] [Action] [Specific Benefit]: [Shocking Number/Fact]"
"Why [Phenomenon] [Unexpected Result] [Specific Context]"
"What Happens When [A] Meets [B]: [Impossible Result]"
```

### SPARK Elements (Every Title Must Have):
- **S**pecificity: Exact numbers, timeframes, measurements
- **P**ower words: "Breakthrough," "Impossible," "Secret," "Revolutionary"
- **A**ction-oriented: "How," "Why," "What happens," "Scientists discover"
- **R**elevance: Matches search intent and user curiosity
- **K**ey metrics: Bold numbers that sound impossible

### Long-Tail Keyword Patterns (Voice Search Ready):
```
"how does [tech] help [specific people] with [specific problem]"
"why does [phenomenon] happen when [specific condition]"
"what makes [thing] work better than [alternative] for [use case]"
"which [product type] is best for [specific need] 2025"
```

### Title Examples (BEFORE/AFTER):

❌ **Bad:** "AI Improves Medical Diagnosis"
✅ **Perfect:** "How AI Detects Cancer 3 Years Before Doctors Can See It" (59 chars)

❌ **Bad:** "New Space Discovery Made"
✅ **Perfect:** "Why This Planet Rains Glass Sideways at 5,400 MPH" (49 chars)

❌ **Bad:** "Creator Economy Growth"
✅ **Perfect:** "Creator Economy Hits $1.2T While 50% Flee Social Media" (55 chars)

## 🎨 CONTENT REQUIREMENTS

### Word Counts by Category:
- **Science/Technology:** 600-800 words (complex explanations)
- **Health/Psychology:** 500-700 words (study + applications)
- **Culture/News:** 300-500 words (quick consumption)

### Content Structure:
1. **Featured Snippet Block** (40-55 words): Direct answer to main query
2. **Emotional Hook** (40-60 words): "Holy crap" factor
3. **Evidence Avalanche** (120-150 words): Stats, expert quotes, proof
4. **Practical Stakes** (60-80 words): What this means for readers
5. **Share-Worthy Conclusion** (20-30 words): Discussion starter

### Critical Formatting:
- **Bold limit:** 8-18 phrases only (key stats, expert names, discoveries)
- **NO dashes:** Never use em-dashes (—) or en-dashes (–) for emphasis
- **NO horizontal rules:** Never use (---) for section breaks
- **Internal links:** Only `/category/article-name` format

## 🔧 TECHNICAL SPECS

### File Requirements:
- **Extension:** .mdx (never .md)
- **Filename:** SEO-optimized slug matching title keywords
- **Title:** 50-60 characters exactly
- **Description:** 150-160 characters exactly
- **Authors:** Sarah Martinez, David Kim, Alex Chen, Emma Thompson only

### SEO Frontmatter:
```yaml
title: '[SPARK-optimized title 50-60 chars]'
description: '[curiosity gap + keyword 150-160 chars]'
seo:
  primaryKeyword: '[3-5 word long-tail phrase]'
  secondaryKeywords: ['related phrase 1', 'related phrase 2', 'related phrase 3']
  featuredSnippetTarget: true
```

## 🚀 WORKFLOW

### Daily 3-Batch Strategy:
1. **Morning (9 AM):** 5-7 trending news articles (300-500 words)
2. **Midday (1 PM):** 5-7 analysis pieces (600-800 words)
3. **Evening (5 PM):** 5-7 evergreen content (category-appropriate)

### Content Discovery (Priority: Fascinating over Trending):
```bash
# Long-tail keyword research
WebSearch: "how does [technology] work for [specific users] 2025"
WebSearch: "why does [phenomenon] happen when [condition]"
WebSearch: "what makes [thing] better than [alternative] for [use case]"

# Evergreen fascinating topics (higher priority than news)
WebSearch: "strangest phenomena in nature that seem impossible"
WebSearch: "how do animals achieve impossible feats biology"
WebSearch: "biggest unsolved mysteries that puzzle scientists"
WebSearch: "counterintuitive facts about physics that blow minds"
```

### Quality Gates:
1. **Build validator must pass 100%** (blocking requirement)
2. **Fact-checking >80% accuracy** required
3. **Title character count 50-60** exactly
4. **No duplicate topics** (check before writing)

## 📊 SUCCESS METRICS

**Content KPIs:**
- Article completion rate: >85%
- Pages per session: 3+ via strategic linking
- Search ranking: >50% articles page 1 in 90 days
- Social sharing: Immediate "text to friend" reaction

**Technical KPIs:**
- Build success rate: 100%
- Title optimization: 50-60 chars, SPARK framework
- SEO compliance: Long-tail keyword integration
- Image quality: Professional photorealistic only

## 🎯 COMPETITIVE ADVANTAGE

**What Makes Us Different:**
1. **SPARK-optimized titles** that dominate voice search
2. **Category-aware length optimization** for maximum engagement
3. **Photorealistic AI images** (National Geographic quality)
4. **Long-tail keyword mastery** for lower competition
5. **Fascinating over trending** approach for evergreen value

**Content Philosophy:**
> "One viral 600-word article with 90% completion rate beats 10 generic pieces readers abandon. Quality creates exponential growth."

## 🚨 BLOCKING REQUIREMENTS (Zero Tolerance)

**Build-validator will REJECT articles that violate ANY of these:**

- Title outside 50-60 characters
- Description outside 150-160 characters
- Wrong file extension (.md instead of .mdx)
- Bold phrases >18 or <8
- Any horizontal rules (---) or em/en-dashes (—/–)
- Word count outside category ranges
- Invalid YAML or missing fields
- Non-approved authors

**Success = First-attempt validation pass rate of 100%**

---

## Commands

### Common Commands
```bash
# Testing
npm run test:e2e        # Playwright tests
npm run test:ui         # UI mode

# Build & Deploy
npm run build          # Build validation
npm run dev            # Development server

# Content Pipeline
node utils/author-assignment.js assign "[category]" "[title]" "[description]" "[tags]"
```

This streamlined system reduces complexity by 70% while improving title quality and SEO performance. Focus: viral content that ranks and converts.