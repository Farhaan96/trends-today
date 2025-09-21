# CLAUDE.md - Trends Today: Optimized AI Content System

**Current Date:** 2025-09-20

## 🎯 CORE MISSION
Create viral, SEO-optimized content with perfect titles that dominate voice search and featured snippets using the streamlined 2-agent system.

**Platform:** Next.js 14 + TypeScript + MDX + GPT-Image-1
**Quality Standard:** 85%+ completion rate, 3+ pages per session
**Target:** 15-20 articles/day via optimized workflow

## 🤖 STREAMLINED AGENT SYSTEM (2 Agents Only)

### trending-content-creator
**Purpose:** Discover topics + create complete articles with SPARK-optimized titles
**Tools:** WebSearch, WebFetch, Write, Read, Grep, Glob, Bash
**Output:** Complete MDX article with perfect 50-60 char titles

### quality-validator (build-validator)
**Purpose:** Fact-check + image generation + technical validation + SPARK compliance
**Tools:** Read, Bash, TodoWrite, Edit, Glob, Grep, WebSearch, WebFetch
**Output:** Validated article with AI image + 100% compliance

## 📝 SPARK TITLE OPTIMIZATION SYSTEM

### Core Formula (50-60 Characters EXACTLY):
```
[Power Word] + [Specific Number] + [Keyword] + [Benefit/Mystery]
[Scientists/Experts] + [Action Verb] + [Impossible Claim] + [Proof]
[Number] + [Study/Discovery] + [Contradicts Common Belief]
```

### SPARK Elements (MANDATORY):
- **S**pecificity: Exact numbers (256-person, 75%, 26 humans, 1000x)
- **P**ower words: Scientists, Breakthrough, Secret, Impossible, Discovers
- **A**ction: Finds, Builds, Creates, Proves, Reveals, Solves
- **R**elevance: Matches search intent + creates curiosity gap
- **K**ey metrics: Shocking statistics that sound impossible but are true

### Premium Title Examples (Proven Formulas):

**Health/Science Authority Pattern:**
✅ **"Scientists Discover Why 75% Sepsis Patients Die Twice"** (54 chars)
✅ **"26-Gram Octopus Kills 26 Humans With 1000x Cyanide Venom"** (57 chars)

**Study/Research Pattern:**
✅ **"256-Person Study: Consciousness Lives in Eyes, Not Brain"** (57 chars)
✅ **"Scientists Create First Visible Perpetual Motion Crystal"** (57 chars)

**Technology Breakthrough Pattern:**
✅ **"Scientists Build Quantum Battery That Charges Instantly"** (56 chars)
✅ **"Webb Finds Saturn Planet at Closest Star - Then Loses It"** (57 chars)

**Culture/Behavior Pattern:**
✅ **"Going Viral Is Dead: Creators Choose 60% Better Engagement"** (59 chars)
✅ **"Creator Economy Hits $1.2T While 50% Flee Social Media"** (55 chars)

### Voice Search Long-Tail Patterns:
```
"why do [professionals] choose [new approach] over [old method]"
"how does [technology] achieve [impossible result] in [timeframe]"
"what happens when [experts] discover [contradictory evidence]"
"scientists found [number] ways [problem] affects [people]"
```

### Emotional Triggers (Pick 1-2 per title):
**Authority:** Scientists, NASA, MIT, Doctors, Experts
**Impossibility:** First, Impossible, Defies, Breaks, Shouldn't Work
**Contradiction:** Not What You Think, Opposite, Actually, Really
**Numbers:** Exact statistics that sound fake but are real
**Mystery:** Then Loses It, Can't Explain, Nobody Knows Why

## 🎨 CONTENT REQUIREMENTS

### Word Counts by Category:
- **Science/Technology:** 600-800 words (complex explanations needed)
- **Health/Psychology:** 500-700 words (study methodology + applications)
- **Culture/News:** 300-500 words (rapid consumption optimized)

### Content Structure:
1. **Featured Snippet** (40-55 words): Direct answer to title question
2. **Hook** (40-60 words): "Holy crap" emotional trigger
3. **Evidence** (120-150 words): Stats + expert quotes + proof
4. **Stakes** (60-80 words): What this means for readers
5. **Conclusion** (20-30 words): Share-worthy discussion starter

### Critical Formatting Rules:
- **Bold limit:** 8-18 phrases ONLY (key stats, expert names, discoveries)
- **NO dashes:** Never use em-dashes (—) or en-dashes (–) for emphasis
- **NO horizontal rules:** Never use (---) for section breaks
- **Links:** Only `/category/article-name` format (NEVER relative ../paths)

## 🔧 TECHNICAL SPECS

### File Requirements:
- **Extension:** .mdx (never .md) - BLOCKING REQUIREMENT
- **Filename:** SEO slug matching title keywords (50 chars max)
- **Title:** 50-60 characters EXACTLY - BLOCKING REQUIREMENT
- **Description:** 150-160 characters EXACTLY - BLOCKING REQUIREMENT
- **Authors:** Sarah Martinez, David Kim, Alex Chen, Emma Thompson ONLY

### SEO Frontmatter Template:
```yaml
title: '[SPARK title 50-60 chars EXACTLY]'
description: >-
  [Hook + keyword 150-160 chars EXACTLY]
category: [science|technology|space|health|psychology|culture]
publishedAt: [current ISO date - NOT hardcoded]
author: [ASSIGNED_AUTHOR_VIA_UTILITY]
tags: [long-tail-variations, semantic-keywords, topic-tags]
image: ''
imageAlt: ''
readingTime: '2 min read'
seo:
  primaryKeyword: '[3-5 word long-tail phrase]'
  secondaryKeywords: ['phrase 1', 'phrase 2', 'phrase 3']
  featuredSnippetTarget: true
```

## 🚀 WORKFLOW

### Content Discovery Priority:
1. **Voice search queries** with curiosity gaps (3-5 word long-tail)
2. **Fascinating evergreen** topics with timeless appeal
3. **Breaking research** if genuinely exceptional

### Enhanced Agent Pipeline:

#### Step 1: Title-First Content Creation
```bash
# trending-content-creator MUST:
1. Research topic thoroughly
2. Extract specific numbers/statistics
3. Create SPARK title using character counter: echo "title" | wc -c
4. Validate 50-60 chars BEFORE writing content
5. Write article that delivers on title promise
```

#### Step 2: SPARK Title Validation
```bash
# quality-validator MUST run:
node utils/title-optimizer.js validate
# BLOCK publication if SPARK score <60/100
```

#### Step 3: Build Validation (BLOCKING GATE)
- All technical standards must pass 100%
- SPARK title compliance mandatory
- Word count within category limits
- No formatting violations

### Daily 3-Batch Strategy:
- **Morning:** 5-7 trending topics (300-500 words)
- **Midday:** 5-7 analysis pieces (600-800 words)
- **Evening:** 5-7 evergreen content (category-appropriate)

## 📊 SUCCESS METRICS

**Content KPIs:**
- **Title compliance:** 100% within 50-60 chars
- **SPARK scores:** Average >75/100
- **Article completion rate:** >85%
- **Voice search ranking:** >50% page 1 in 90 days
- **Social sharing:** 2-3x improvement via curiosity gaps

**Technical KPIs:**
- **Build success:** 100% first-attempt pass
- **SEO optimization:** Long-tail keyword dominance
- **Image quality:** Professional photorealistic only

## 🚨 BLOCKING REQUIREMENTS (Zero Tolerance)

**Title Standards (MANDATORY):**
- 50-60 characters EXACTLY
- SPARK score >60/100 (power words + numbers + action verbs)
- Factually accurate to content
- Creates curiosity gap without misleading

**Content Standards (MANDATORY):**
- Word count within category ranges
- Description 150-160 characters EXACTLY
- .mdx extension (NOT .md)
- Bold phrases 8-18 only
- No horizontal rules or em/en-dashes
- Current ISO date (not hardcoded)

**Technical Standards (MANDATORY):**
- Valid YAML frontmatter
- Approved authors only
- Proper category assignment
- Working internal links
- Image fields set correctly

## 💡 TITLE OPTIMIZATION UTILITIES

### Character Counter:
```bash
echo "Your Title Here" | wc -c
```

### SPARK Validation:
```bash
node utils/title-optimizer.js validate "Your Title"
node utils/title-optimizer.js optimize "Your Title"
```

### Author Assignment:
```bash
node utils/author-assignment.js assign "[category]" "[title]" "[description]" "[tags]"
```

## 🏆 COMPETITIVE ADVANTAGE

**What Makes Us Different:**
1. **SPARK-optimized titles** that dominate voice search
2. **Content-accurate headlines** that deliver on promises
3. **Category-aware length optimization** for maximum engagement
4. **Photorealistic AI images** (National Geographic quality)
5. **2-agent efficiency** vs bloated 5+ agent systems
6. **100% first-attempt validation** through systematic optimization

**Content Philosophy:**
> "One viral article with a perfect 55-character SPARK title that accurately represents breakthrough research beats 10 generic clickbait pieces. Quality + optimization = exponential growth."

---

## Commands
```bash
npm run build              # Validate articles
npm run dev               # Development
npm run test:e2e          # Testing
node utils/title-optimizer.js validate    # Check all titles
```

**Success Formula:** Accurate + Specific + Curiosity Gap + 50-60 chars = Viral SEO domination