# 🤖 Claude Code Agent Pipeline Guide

## Overview

This guide explains how to use the Claude Code agent pipeline system for automated content generation with critical thinking and quality assurance at every step.

## Architecture

### Agent-Based Pipeline vs JavaScript Commands

**❌ OLD WAY (JavaScript Commands)**

```bash
npm run ultra:generate  # Just runs a JS script
```

- No critical thinking
- No quality gates
- No error recovery
- No context awareness

**✅ NEW WAY (Claude Code Agents)**

```bash
# Each step is handled by an intelligent agent
claude "Use batch-orchestrator to run the morning content batch"
```

- Critical thinking at each step
- Quality validation
- Error recovery
- Context-aware decisions

## 📁 Agent Definitions

All agents are defined in `.claude/agents/` as Markdown files with YAML frontmatter:

```
.claude/
└── agents/
    ├── batch-orchestrator.md           # Main pipeline orchestrator
    ├── trending-topics-discovery.md     # Topic research and discovery
    ├── ultra-short-content-creator.md   # Content generation (400-500 words)
    ├── image-generator.md               # AI image generation (gpt-image-1)
    ├── typography-enhancer.md           # Visual formatting
    ├── fact-checker.md                  # Fact verification (>80% accuracy)
    ├── smart-content-linker.md          # Internal linking
    ├── quality-validator.md             # Quality assurance (85+ score)
    ├── build-validator.md               # Build validation and error checking
    └── publication-reviewer.md          # Final review before publishing
```

## 🚀 How to Run Content Batches

### Method 1: Full Pipeline Orchestration (Recommended)

```bash
# Morning batch (5-7 trending articles)
claude "Use batch-orchestrator to execute the morning content batch"

# Midday batch (5-7 analysis articles)
claude "Use batch-orchestrator to execute the midday content batch"

# Evening batch (5-7 evergreen articles)
claude "Use batch-orchestrator to execute the evening content batch"
```

The orchestrator will:

1. Create a todo list for tracking
2. Execute each agent in sequence:
   - Topic discovery → Content creation → Image generation → Typography → Fact-checking → Linking → Quality validation → Build validation → Final review
3. Validate outputs between stages
4. Handle errors gracefully
5. Generate a comprehensive report

### Method 2: Individual Agent Execution

For testing or specific tasks, you can run agents individually:

```bash
# Discover trending topics
claude "Use trending-topics-discovery to find 5 high-potential topics"

# Create an article
claude "Use ultra-short-content-creator to write about [topic]"

# Generate hero image for article
claude "Use image-generator to add editorial gpt-image-1 hero image to [article]"

# Fact-check existing articles
claude "Use fact-checker to verify all articles in content/technology"

# Enhance typography
claude "Use typography-enhancer to improve formatting in [article]"

# Validate quality
claude "Use quality-validator to check [article] meets standards"

# Add internal links
claude "Use smart-content-linker to add links to [article]"

# Final review
claude "Use publication-reviewer to approve [article] for publishing"
```

---

## 📅 Daily Workflow

### The 3-Batch Strategy (15-20 Articles/Day)

#### **Morning Batch (9 AM)**

```bash
# Generate 5-7 morning articles focusing on breaking news
npm run ultra:morning

# Enhance formatting
npm run ultra:typography

# Fact-check for accuracy
npm run ultra:factcheck
```

#### **Midday Batch (1 PM)**

```bash
# Generate 5-7 midday articles focusing on analysis
npm run ultra:midday

# Apply typography enhancements
npm run ultra:typography

# Verify facts and sources
npm run ultra:factcheck
```

#### **Evening Batch (5 PM)**

```bash
# Generate 5-7 evening articles focusing on evergreen content
npm run ultra:evening

# Final formatting pass
npm run ultra:typography

# Final fact-checking
npm run ultra:factcheck
```

#### **End of Day Review (8 PM)**

```bash
# Validate all articles meet quality standards
npm run ultra:validate

# Build and test the site
npm run build
npm start

# Push to production
git add -A
git commit -m "Add daily batch of ultra-short articles"
git push origin main
```

---

## 🔧 Individual Agents

### Content Generation Agents

#### **Ultra-Short Content Creator**

Creates 400-500 word articles with engaging hooks and SEO optimization.

```bash
# Run directly
node agents/ultra-short-content-creator.js

# Features:
- 400-500 word limit enforced
- 2-minute read time
- SEO-optimized titles
- Long-tail keywords
- Engaging hooks
```

#### **Batch Category Generator**

Generates multiple articles across all categories in one run.

```bash
# Generate batch of 6 articles (one per category)
npm run ultra:generate

# Generate specific batch timing
npm run ultra:morning   # Morning topics
npm run ultra:midday    # Midday analysis
npm run ultra:evening   # Evening evergreen
```

#### **Leravi Content Creator**

Alternative content generator following leravi.org style.

```bash
node agents/leravi-content-creator.js

# Features:
- Ultra-simple format
- Ad-friendly layout
- Minimal design focus
```

### Enhancement Agents

#### **Typography Enhancer** ✨ NEW

Formats articles with bold statistics, blockquotes, and visual hierarchy.

```bash
# Enhance all articles
npm run ultra:typography

# Enhance specific category
npm run ultra:typography:category technology

# Enhance single file
node agents/typography-enhancer.js file content/science/article.mdx

# What it does:
- Bolds all statistics (percentages, numbers, years)
- Converts quotes to blockquotes
- Adds horizontal rules between sections
- Ensures 2-3 sentence paragraphs
- Adds generous white space
```

#### **Fact Checker** 🔍 CRITICAL

Verifies facts and sources to prevent SEO penalties.

```bash
# Check all articles
npm run ultra:factcheck

# Check specific category
npm run ultra:factcheck:category science

# Check single file
npm run ultra:factcheck:file content/technology/ai-article.mdx

# What it checks:
- Statistics accuracy
- Claim verification
- Source link validity
- Expert quote attribution
- Year and date accuracy

# Output:
- Accuracy score (must be >80%)
- List of issues found
- Broken source links
- Suggested corrections
```

#### **Smart Content Linker**

Adds strategic internal links to boost pages-per-session.

```bash
node agents/smart-content-linker.js

# Features:
- Adds 3-4 internal links per article
- Cross-category linking
- Natural anchor text
- Related content suggestions
```

### Quality Validation

#### **Ultra-Short Quality Validator**

Ensures articles meet all quality standards.

```bash
npm run ultra:validate

# Checks:
- Word count (400-500 words)
- Reading time (2 minutes)
- Typography formatting
- Internal links (3-4 minimum)
- SEO optimization
- Fact accuracy
```

#### **Article Quality Enhancer**

Improves existing articles that don't meet standards.

```bash
node agents/article-quality-enhancer.js

# Enhancements:
- Improves hooks
- Adds missing statistics
- Enhances SEO
- Fixes formatting issues
```

### Discovery & Research

#### **SEO Keyword Researcher**

Finds high-potential, low-competition keywords.

```bash
node agents/seo-keyword-researcher.js

# Discovers:
- Long-tail keywords
- Trending topics
- Low competition terms
- Question-based queries
```

#### **Trending Topics Discovery**

Identifies trending topics for content creation.

```bash
node agents/trending-topics-discovery.js

# Sources:
- Reddit discussions
- Industry news
- Social media trends
- Google Trends data
```

---

## ✅ Quality Control

### Pre-Publication Checklist

1. **Word Count Compliance**

```bash
# Verify all articles are 400-500 words
npm run ultra:validate
```

2. **Typography Check**

```bash
# Ensure proper formatting
npm run ultra:typography
```

3. **Fact Verification** 🔴 CRITICAL

```bash
# Must pass with >80% accuracy
npm run ultra:factcheck
```

4. **SEO Validation**

```bash
# Check meta descriptions, keywords
npm run audit:seo
```

5. **Image Quality**

```bash
# Verify all images are optimized
npm run validate:images
```

### Red Flags to Fix Immediately

- ❌ Articles over 500 words
- ❌ Missing bold statistics
- ❌ No internal links
- ❌ Broken source links
- ❌ Unverified facts (<80% accuracy)
- ❌ Generic hooks
- ❌ Long paragraphs (>3 sentences)

---

## 🛠️ Troubleshooting

### Common Issues & Solutions

#### "Articles are too long"

```bash
# Re-run with strict word limit
node agents/ultra-short-content-creator.js --max-words 450
```

#### "Fact-checking fails"

```bash
# Check Perplexity API key
echo $PERPLEXITY_API_KEY

# Run with debug mode
DEBUG=true npm run ultra:factcheck
```

#### "Typography not applying"

```bash
# Force re-enhancement
rm -rf .cache/typography
npm run ultra:typography
```

#### "Broken source links"

```bash
# Auto-fix sources
node agents/fact-checker.js all --auto-fix
```

---

## 📊 Best Practices

### 1. **Always Fact-Check**

```bash
# After every batch generation
npm run ultra:factcheck

# Fix issues before publishing
# SEO penalties for false info are severe!
```

### 2. **Maintain Consistency**

```bash
# Use same workflow daily
Morning → Generate → Enhance → Fact-check → Validate
```

### 3. **Monitor Performance**

```bash
# Check engagement metrics weekly
- Completion rate (target: >85%)
- Pages per session (target: 3+)
- Bounce rate (target: <30%)
```

### 4. **Batch Processing**

```bash
# Process in batches for efficiency
npm run ultra:morning    # 5-7 articles
npm run ultra:typography # Enhance all at once
npm run ultra:factcheck  # Verify batch together
```

### 5. **Cache Management**

```bash
# Clear cache weekly for fresh data
rm -rf .cache/
rm -rf node_modules/.cache/
```

---

## 📈 Performance Metrics

### Track These KPIs

1. **Content Production**
   - Articles per day: 15-20
   - Words per article: 400-500
   - Batches completed: 3/day

2. **Quality Scores**
   - Fact accuracy: >80%
   - SEO score: >85/100
   - Readability: 2-minute average

3. **Engagement Metrics**
   - Completion rate: >85%
   - Social shares: >10/article
   - Internal link CTR: >20%

---

## 🚨 Emergency Commands

### When Things Go Wrong

```bash
# Rollback bad content
git revert HEAD
git push origin main

# Fix all broken images
npm run fix:images:all

# Emergency fact-checking
npm run ultra:factcheck -- --critical-only

# Validate everything
npm run qa:site
```

---

## 📅 Sample Daily Schedule

```bash
# 9:00 AM - Morning Batch
npm run ultra:morning
npm run ultra:typography
npm run ultra:factcheck

# 1:00 PM - Midday Batch
npm run ultra:midday
npm run ultra:typography
npm run ultra:factcheck

# 5:00 PM - Evening Batch
npm run ultra:evening
npm run ultra:typography
npm run ultra:factcheck

# 8:00 PM - Review & Deploy
npm run ultra:validate
npm run build
git add -A && git commit -m "Daily content batch" && git push
```

---

## 💡 Pro Tips

1. **Run fact-checking BEFORE publishing** - SEO penalties are harsh
2. **Use typography enhancer on ALL articles** - Improves engagement
3. **Batch similar tasks** - More efficient than one-by-one
4. **Monitor accuracy scores** - Below 80% = fix immediately
5. **Keep articles at 400-450 words** - Leave buffer for edits

---

## 📞 Need Help?

- Check error logs: `npm run logs`
- Test individual agents: `node agents/[agent-name].js --help`
- Validate configuration: `npm run validate:config`
- Review this guide: `AGENT-PIPELINE-GUIDE.md`

---

_Remember: Quality > Quantity. Better to publish 10 perfect ultra-short articles than 20 with errors._

_Last Updated: January 2025_

---

## 🎨 Image Generation Workflow

**Pipeline Position:** After content creation, before typography enhancement

```bash
# Generate professional photorealistic hero image
claude "Use image-generator to create editorial image for [article-path]"
```

**Process:**
1. Analyzes article content for visual concepts
2. Generates GPT-Image-1 professional photography
3. Saves to /images/ai-generated/ with timestamp
4. Updates frontmatter image path automatically
5. Validates file exists and meets quality standards

**Quality Standards:** National Geographic publication quality, photorealistic only, no text/logos.

---


### Image Generation (Between content creation and build validation)

Use the image-generator agent to produce a photorealistic hero image and update frontmatter:

`ash
claude "Use image-generator to add an editorial gpt-image-1 hero image to content/[category]/[slug].mdx"
# The subagent will run:
node utils/ai-image-generator.js generate-from-article --file="content/[category]/[slug].mdx"
`

Ensure the frontmatter points to /images/ai-generated/<file>.png and not a remote URL.
