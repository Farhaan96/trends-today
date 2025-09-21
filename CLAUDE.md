# CLAUDE.md - Trends Today: Optimized Content System v2.0

**Current Date:** 2025-09-21
**Last Updated:** 2025-09-21

## 🎯 CORE MISSION

Create high-quality, SEO-optimized content that naturally ranks for voice search and featured snippets while maintaining authenticity and reader value. Focus on user intent over rigid formulas.

**Platform:** Next.js 14 + TypeScript + MDX + GPT-Image-1
**Quality Standard:** Reader value first, SEO optimization second
**Target:** Quality over quantity - sustainable content production

## 🤖 STREAMLINED 3-AGENT SYSTEM

### 1. content-creator

**Purpose:** Research topics + create complete, engaging articles with natural SEO optimization
**Combines:** Former trending-content-creator + content-enhancer functionality
**Tools:** WebSearch, WebFetch, Write, Read, Edit, MultiEdit, Grep, Glob, Bash
**Output:** Complete MDX article with natural titles and organic keyword integration

### 2. quality-validator

**Purpose:** Comprehensive fact-checking + technical validation + SEO compliance
**Combines:** Former quality-factchecker + build-validator functionality
**Tools:** Read, Bash, TodoWrite, Edit, Glob, Grep, WebSearch, WebFetch
**Output:** Validated article with 100% technical compliance and fact accuracy

### 3. image-generator (Unchanged)

**Purpose:** Generate text-free, photorealistic hero images
**Tools:** Read, Bash, Glob, Edit
**Output:** AI-generated images with OCR validation

## 📝 NATURAL TITLE OPTIMIZATION

### Flexible Guidelines (50-70 Characters)

- **Optimal:** 55-65 characters
- **Acceptable:** 50-70 characters
- **Focus:** Search intent and click-through rate
- **Priority:** Natural language over formulas

### Title Best Practices (Guidelines, Not Rules):

- Include numbers when they add value (not forced)
- Use power words when authentic to the content
- Focus on answering the user's search query
- Create curiosity without clickbait
- Match content accurately

### Example Evolution:

❌ **Old (Forced):** "Scientists Discover Why 75% Sepsis Patients Die Twice" (54 chars)
✅ **New (Natural):** "New Immune Memory Research Could Save Sepsis Survivors" (55 chars)

❌ **Old (Formulaic):** "26-Gram Octopus Kills 26 Humans With 1000x Cyanide Venom" (57 chars)
✅ **New (Engaging):** "The Blue-Ringed Octopus: Nature's Most Venomous Marine Animal" (62 chars)

## 🎯 SEMANTIC SEO STRATEGY

### Natural Keyword Integration:

- **Primary keyword:** Once in title, once in first 100 words
- **Semantic variations:** Naturally throughout content
- **Related entities:** Mention when relevant
- **No keyword density targets** - write naturally

### Long-Tail Optimization:

- Focus on **user questions** not keyword stuffing
- Answer **search intent** comprehensively
- Use **natural language patterns**
- Include **conversational phrases**

### Voice Search Optimization:

- Write in **question-answer format** where appropriate
- Use **natural speech patterns**
- Include **"how," "what," "why," "when"** naturally
- Create **scannable answer blocks** (40-60 words)

## 🎨 FLEXIBLE CONTENT GUIDELINES

### Word Count Ranges (±20% Flexibility):

- **Science/Technology:** 500-900 words
- **Health/Psychology:** 400-800 words
- **Culture/News:** 250-600 words
- **Deep Dives:** 1000+ words when warranted

### Natural Formatting:

- **Bold for emphasis:** Use naturally, no counting
- **Em-dashes allowed:** Use for natural flow
- **Horizontal rules:** Optional for section breaks
- **Paragraph length:** 2-4 sentences as feels natural
- **Lists and bullets:** Use when they improve readability

### Content Structure (Flexible):

1. **Hook** (40-80 words): Capture attention
2. **Answer** (40-60 words): Direct response for featured snippets
3. **Body** (Variable): Comprehensive coverage
4. **Evidence** (As needed): Stats, quotes, research
5. **Conclusion** (20-50 words): Key takeaway

## 🔧 TECHNICAL REQUIREMENTS (Keep These Strict)

### File Standards:

- **Extension:** .mdx (required)
- **Filename:** SEO-friendly slug
- **Categories:** science, technology, space, health, psychology, culture
- **Authors:** Sarah Martinez, David Kim, Alex Chen, Emma Thompson

### Frontmatter (Flexible Ranges):

```yaml
title: '[Natural title 50-70 chars]'
description: >-
  [Compelling meta 150-170 chars]
category: [appropriate category]
publishedAt: [current ISO date]
author: [approved author]
tags: [relevant tags, no minimum]
image: ''
imageAlt: ''
readingTime: '[calculated] min read'
seo:
  primaryKeyword: '[main search query]'
  semanticKeywords: ['related', 'terms', 'entities']
  searchIntent: '[informational|transactional|navigational]'
```

## 📊 E-E-A-T OPTIMIZATION (Simplified)

### Experience:

- Include practical insights when relevant
- Share real-world applications
- Mention testing or analysis naturally

### Expertise:

- Cite credible sources
- Explain complex topics clearly
- Use appropriate technical language

### Authoritativeness:

- Reference institutions and experts
- Link to quality sources
- Build topic clusters

### Trustworthiness:

- Acknowledge limitations
- Provide balanced perspectives
- Keep content current

## 🚀 SIMPLIFIED WORKFLOW

### Content Creation Process:

1. **Research:** Find topics with genuine user interest
2. **Title:** Create natural, engaging titles (50-70 chars)
3. **Write:** Focus on value and natural flow
4. **Optimize:** Add keywords naturally, not forced
5. **Validate:** Check facts and technical requirements
6. **Enhance:** Polish for readability and engagement

### Quality Checks (Essentials Only):

- ✅ Factual accuracy
- ✅ Technical validation (build passes)
- ✅ Natural keyword presence
- ✅ Reader value delivered
- ✅ Image generated and validated

## 💡 NEW SEO UTILITIES

### Available Tools:

```bash
# Flexible title validation (suggests, doesn't enforce)
node utils/title-optimizer.js suggest "Your Title"

# Semantic keyword analysis
node utils/semantic-keywords.js analyze "content/[file].mdx"

# Readability scoring
node utils/readability-scorer.js check "content/[file].mdx"

# Content uniqueness checker
node utils/uniqueness-checker.js verify "content/[file].mdx"

# Author assignment (unchanged)
node utils/author-assignment.js assign "[category]" "[title]" "[description]" "[tags]"
```

## 🏆 SUCCESS METRICS (Balanced)

### Content Quality:

- **Reader engagement:** Time on page, bounce rate
- **Search performance:** Rankings, CTR, impressions
- **User satisfaction:** Comments, shares, return visits
- **Technical health:** Core Web Vitals, mobile performance

### SEO Performance:

- **Organic traffic growth:** Sustainable increases
- **Featured snippets:** Natural capture rate
- **Voice search rankings:** Conversational queries
- **Topic authority:** Entity recognition

## 🚨 CRITICAL REQUIREMENTS (Keep These)

### Must-Haves:

- Valid .mdx files with proper frontmatter
- Approved authors only
- AI-generated images (no stock photos)
- Build validation passes
- Factual accuracy verified

### Avoid:

- Keyword stuffing
- Clickbait titles that don't deliver
- Duplicate content
- Broken internal links
- Plagiarism or AI detection issues

## 📚 CONTENT PHILOSOPHY

> "Write for humans first, search engines second. Natural, valuable content that genuinely helps readers will always outperform over-optimized, formulaic articles. Quality and authenticity build lasting SEO success."

### Core Principles:

1. **User Intent > Keywords:** Answer what users actually want to know
2. **Natural Language > Formulas:** Write how people actually speak and search
3. **Value > Volume:** One great article beats ten mediocre ones
4. **Flexibility > Rigidity:** Guidelines that adapt to content needs
5. **Authenticity > Optimization:** Real insights rank better than SEO tricks

## 🔄 CONTINUOUS IMPROVEMENT

### Monitor and Adapt:

- Track which content performs best
- A/B test title styles
- Analyze user behavior
- Update strategies based on data
- Stay current with SEO trends

### Feedback Loop:

- Review search console data weekly
- Check user engagement metrics
- Monitor competitor strategies
- Adjust guidelines based on results

---

## Commands

```bash
npm run build              # Validate articles
npm run dev               # Development
npm run test:e2e          # Testing
node utils/title-optimizer.js suggest    # Title suggestions
node utils/semantic-keywords.js analyze  # Keyword analysis
node utils/readability-scorer.js check   # Readability check
```

**Success Formula:** User Value + Natural SEO + Quality Content = Sustainable Growth
