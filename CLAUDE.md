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
**CRITICAL:** NEVER generate images - leave `image: ''` and `imageAlt: ''` empty for image-generator agent

**MANDATORY DUPLICATE PREVENTION:**

- MUST run `node utils/topic-validator.js check "title"` before writing
- MUST perform grep search for main keywords before starting
- MUST stop if duplicate confidence > 70%
- MUST include validation results in article creation report
- MUST suggest alternative angles if duplication detected

### 2. quality-validator

**Purpose:** Comprehensive fact-checking + technical validation + SEO compliance
**Combines:** Former quality-factchecker + build-validator functionality
**Tools:** Read, Bash, TodoWrite, Edit, Glob, Grep, WebSearch, WebFetch
**Output:** Validated article with 100% technical compliance and fact accuracy
**CRITICAL:** Do not modify image fields - leave image generation to image-generator agent

### 3. image-generator (Enhanced 2025)

**Purpose:** Generate unique, article-specific photorealistic hero images using dynamic content analysis
**Tools:** Read, Bash, Glob, Edit
**Enhanced Features:**

- AI semantic analysis extracts specific visual elements from article content
- 10+ custom visual plans for common topics (brain organoids, AI avatars, space missions)
- Content-specific keyword and measurement extraction
- Smart fallback system (category templates only when content analysis fails)
  **Output:** Unique AI-generated images tailored to each article's specific content with OCR validation
  **CRITICAL:** ONLY agent authorized to generate and assign images to articles

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
- **Em-dash usage:** MAXIMUM 2 per article (ideally 0-1)
- **Horizontal rules:** Optional for section breaks
- **Paragraph length:** 2-4 sentences as feels natural
- **Lists and bullets:** Use when they improve readability

### ❌ AI Writing Patterns to AVOID (MANDATORY):

**Em-Dash Overuse (CRITICAL):**

- ❌ NEVER use more than 2 em-dashes (—) per article
- ❌ AVOID: "concept—definition—continues" patterns
- ❌ AVOID: Multiple em-dashes in one paragraph
- ✅ Instead use: periods, commas, parentheses, or rewrite sentences

**Examples of Em-Dash Fixes:**

- ❌ BAD: "Sleep deprivation—a common problem—affects millions"
- ✅ GOOD: "Sleep deprivation, a common problem, affects millions"
- ❌ BAD: "The brain rewires itself—creating new pathways"
- ✅ GOOD: "The brain rewires itself. It creates new pathways."
- ❌ BAD: "Research shows—surprisingly—that gratitude works"
- ✅ GOOD: "Research shows that gratitude works (surprisingly)."

**Alternatives to Em-Dashes:**

1. **Periods** for strong breaks → 50% of replacements
2. **Commas** for mild pauses → 30% of replacements
3. **Parentheses** for true asides → 15% of replacements
4. **Rewrite** to avoid the need → 5% of replacements

**Other Formulaic Patterns to Avoid:**

- Excessive use of "here's the thing" or "here's why"
- Starting multiple sentences with "The truth is"
- Overuse of power words like "groundbreaking" or "revolutionary"
- Repetitive sentence structures throughout article

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
publishedAt: [use new Date().toISOString() - actual current timestamp]
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

## 🔍 DUPLICATE PREVENTION PROTOCOL (MANDATORY)

**CRITICAL: Every content creation MUST start with duplicate checking**

### Pre-Creation Validation (Required):

1. **Topic Validator Check:**

   ```bash
   node utils/topic-validator.js check "Proposed Article Title"
   ```

   - Auto-checks title similarity vs existing articles
   - Returns confidence score (>70% = duplicate)
   - Provides alternative angle suggestions

2. **Keyword Validation:**

   ```bash
   node utils/topic-validator.js keywords "main,keywords,here"
   ```

   - Checks overlap with existing content keywords
   - Prevents topical saturation

3. **Manual Grep Verification:**

   ```bash
   grep -i "main topic keywords" content/**/*.mdx
   ```

   - Final verification for partial coverage
   - Check if topic already covered from different angle

### Agent Integration Requirements:

**content-creator agents MUST:**

- Run topic validation BEFORE writing
- Include validation results in initial assessment
- STOP if duplicate confidence > 70%
- Suggest alternative angles if duplication detected
- **LIMIT em-dashes to maximum 2 per article (count and verify)**
- **Use variety in punctuation: periods, commas, parentheses**
- **Avoid formulaic AI writing patterns (see ❌ AI Patterns section)**
- **Self-check final article for em-dash count before submission**

**Validation Report Format:**

```
✅ UNIQUE TOPIC - Proceed with creation
❌ DUPLICATE DETECTED - Confidence: 85%
⚠️ SIMILAR CONTENT - Review: [list similar articles]
```

### Inventory Management:

- **existing-articles.txt** - Auto-updated after each batch
- **CLAUDE.md inventory** - Weekly sync with actual content
- **Topic validation cache** - Speeds up repeat checks

## 🚀 ENHANCED WORKFLOW (With Duplicate Prevention)

### Content Creation Process:

1. **Validate:** Run duplicate prevention protocol (MANDATORY)
2. **Research:** Find topics with genuine user interest (if unique)
3. **Title:** Create natural, engaging titles (50-70 chars)
4. **Write:** Focus on value and natural flow
5. **Optimize:** Add keywords naturally, not forced
6. **Quality Check:** Technical validation and fact verification
7. **Enhance:** Polish for readability and engagement
8. **Update Inventory:** Add new article to tracking system

### 📦 PARALLEL BATCH EXECUTION (CRITICAL FOR EFFICIENCY)

**MANDATORY: Run agents in parallel whenever creating multiple articles**

#### Batch Creation Protocol:

1. **Phase 1 - Content Creation (Parallel)**

   ```
   Run ALL content-creator agents simultaneously in single message
   - Agent 1: Topic A (leaves image: '' empty)
   - Agent 2: Topic B (leaves image: '' empty)
   - Agent 3: Topic C (leaves image: '' empty)
   ```

2. **Phase 2 - Quality Validation (Parallel)**

   ```
   Run ALL quality-validator agents simultaneously in single message
   - Validator 1: Article A fact-check/build validation
   - Validator 2: Article B fact-check/build validation
   - Validator 3: Article C fact-check/build validation
   ```

3. **Phase 3 - Image Generation (Parallel) - CRITICAL FILE TARGETING**

   ```
   Run ALL image-generator agents simultaneously in single message
   - Generator 1: SPECIFIC FILE PATH for Article A (e.g., content/science/article-1.mdx)
   - Generator 2: SPECIFIC FILE PATH for Article B (e.g., content/technology/article-2.mdx)
   - Generator 3: SPECIFIC FILE PATH for Article C (e.g., content/health/article-3.mdx)
   ```

   **CRITICAL IMAGE ASSIGNMENT RULES:**
   - Each image-generator agent must receive EXACT file path as parameter
   - Agent must ONLY read and modify the specified file path
   - NO cross-contamination between parallel agents
   - Each agent validates image applied to correct article before completing

#### Performance Benefits:

- **3x faster execution** vs sequential processing
- **Consistent quality** across all articles in batch
- **Resource optimization** with parallel API calls
- **Scalable** to any batch size (3, 5, 10+ articles)

#### Agent Separation Enforcement:

- ❌ **content-creator** NEVER touches images (leaves fields empty)
- ❌ **quality-validator** NEVER generates images (validates only)
- ✅ **image-generator** ONLY agent that creates/assigns images

#### Image Assignment Prevention Rules:

**CRITICAL FILE TARGETING:** Each image-generator agent MUST:

1. **Receive exact file path** in task prompt (e.g., "Generate image for content/science/fusion-article.mdx")
2. **Read ONLY the specified file** to analyze content
3. **Apply image ONLY to that specific file**
4. **Validate correct file modified** before marking complete
5. **Never touch other article files** even if running in parallel

**PREVENTION:** This stops wrong images being applied when agents run simultaneously

**CRITICAL:** Always use single message with multiple Task tool calls for parallel execution

### Quality Checks (Essentials Only):

- ✅ Factual accuracy
- ✅ Technical validation (build passes)
- ✅ Natural keyword presence
- ✅ Reader value delivered
- ✅ **Em-dash count ≤ 2 (MANDATORY validation)**
- ✅ No formulaic AI writing patterns
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

# Em-dash counter (MANDATORY check - must be ≤ 2)
grep -c "—" content/[file].mdx

# Em-dash validator script
node utils/em-dash-validator.js "content/[file].mdx"

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
- **Em-dash overuse (>2 per article) - dead giveaway of AI writing**
- **Formulaic sentence structures that repeat patterns**
- **Excessive power words without substance**

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

## 🎨 ENHANCED IMAGE GENERATION SYSTEM (2025)

### Dynamic Content Analysis

The image generation system now creates **unique, article-specific images** instead of generic category templates:

**Priority System:**

1. **AI Semantic Analysis**: GPT-4 analyzes article content to extract specific visual elements
2. **Custom Visual Plans**: 10+ predefined patterns for common topics
3. **Content-Specific Extraction**: Identifies visual keywords, measurements, unique descriptors
4. **Category Templates**: Only used as last resort fallback

### Custom Visual Plans Available

- `brain.*organoid|lab.*grown.*brain` → Lab-grown neural tissue in petri dishes
- `ai.*avatar|virtual.*influencer` → Holographic AI interfaces with virtual personas
- `quantum.*batter|instant.*charg` → Advanced quantum energy storage with crystalline structures
- `tree.*stone|fig.*calcium` → Cross-section of tree showing mineral deposits
- `creator.*economy|creator.*burnout` → Balanced creative workspace with wellness elements
- `parker.*probe|solar.*corona` → NASA spacecraft approaching sun's corona
- `materials.*defy.*physics` → Crystalline structures with impossible properties
- `cognitive.*disengagement|brain.*shutdown` → Neural network switching patterns

### Testing Results (Verified Unique Images)

**Before Enhancement:**

- Culture articles → Generic "person at laptop"
- Psychology articles → Generic brain imagery
- Technology articles → Abstract tech elements
- Health articles → Microscopes and lab equipment

**After Enhancement:**

- Brain organoids article → Lab-grown neural tissue with brain-like structures
- AI workplace productivity → Professional office with AI-powered dashboards
- Parker Solar Probe → Spacecraft with heat shield flying through corona

### Command Usage

```bash
# Generate content-specific image
node utils/ai-image-generator.js generate-from-article --file="content/health/article.mdx"

# The system automatically:
# 1. Analyzes article content with AI
# 2. Extracts visual elements and unique details
# 3. Matches against custom visual plans
# 4. Generates unique, article-specific image
# 5. Validates text-free with OCR
```

## 📚 EXISTING CONTENT INVENTORY (As of 2025-09-21)

### TECHNOLOGY (16 Articles)

- AI Agents: Revolution, workplace productivity, $7.9B market
- Quantum Computing: Google Willow, quantum batteries that charge instantly
- Edge Computing: IoT revolution, 8x faster than humans, microseconds
- Cybersecurity: AI detects threats 63% faster, 99.6% accuracy
- Brain-Computer Interface: UCLA paralyzed patients control robots 4x faster
- Living Computers: Human brain cells compute 100,000x faster
- Blockchain: Unexpected problem-solving applications
- Web3: Passkeys replacing passwords, 15 billion accounts
- Humanoid Robots: BMW tests, Figure-02, 400% faster
- AI Copyright: Anthropic $1.5B settlement
- Smart Factories: 40% cost reduction, $5/hour AI robots
- Google AI Mode: Hindi, Japanese, Korean - 2 billion users
- Solar Storm Prediction: NYU Abu Dhabi 45% better accuracy

### HEALTH (17 Articles)

- Cancer: AI blood tests detect 3 years early, RNA vaccines cut 44%
- Gene Therapy: CRISPR cures sickle cell (97% crisis-free), custom edits for babies
- HIV: Lenacapavir 99.9% prevention with 2 shots/year
- Mental Health: Apps proven in 176 studies, blood test for depression
- Microbiome: Reverses autism 80%, boosts athletic performance 13%
- Precision Medicine: CAR-T therapy 93% response rate, AI 94% cancer detection
- Consciousness: AI detects in coma patients 8 days before doctors
- Sepsis: Macrophage memory stops 75% relapses
- FDA Breakthroughs: Fast-tracked Huntington's gene therapy
- Fiji Medicine: Ancient healers cut diabetes 17.7%, kava vs placebo study

### PSYCHOLOGY (11 Articles)

- Memory: Formation in 100ms, decoded in real-time, secret language revealed
- Consciousness: 256-person study shows it lives in eyes
- Cognitive Biases: Cost 2x on decisions, smart people turn stupid in groups
- Procrastination: 20% chronic due to larger amygdala
- Psychedelics: LSD cures anxiety 12 weeks (48%), 75% depression success
- Multitasking: Brain shuts down 40%
- Introverts: 40% deep work advantage
- Depression: Revolutionary blood test ends misdiagnosis

### SPACE (11 Articles)

- Mars: NASA biosignature discovery, smoking gun evidence, emergency conference
- Exoplanets: TOI-2431 b 5.4-hour year, glass rain planet 5400mph winds
- Webb Telescope: Alpha Centauri planet found then lost
- Parker Probe: Touches sun at 430,000 MPH on Christmas
- Asteroid Mining: AstroForge launches January 2025
- Space Tourism: Virgin Galactic sold out through 2027
- Ancient Astronomy: 500-year manuscript, Hipparchus catalog hidden 1000 years
- Space Debris: Revolutionary cleanup technologies
- Satellites: Find lost Maya cities, track elephants

### SCIENCE (14 Articles)

- Materials Science: MIT 2D material 2x stronger than steel, 4D metamaterials
- Quantum Physics: Visible perpetual motion crystal, materials defy physics
- Biology: Blue-ring octopus 1000x cyanide venom, trees turn to stone capturing CO2
- Ancient History: Anunnaki 4400-year tablet, Stone Age girl with weapons
- Ecology: 138 new species found, Fiji's tabu system restores reefs in 3 years
- Health Studies: 11,000-person walking study prevents back pain, 13-year rule for mental health
- Water Research: Testing for memory and intelligence
- Digital Universe: Evidence we're living in simulation
- Biodiversity: 45 million years hidden evolution discovered

### CULTURE (11 Articles)

- Creator Economy: Hits $1.2T while 50% flee social media, 96% below minimum wage
- AI Art: Christie's $728K sale, millennials buy 48%, wins competitions
- Social Media: Mass exodus to microcommunities, viral fame dying, 60% better engagement
- Neurodivergent Culture: 5M TikTok posts, $1.4B workplace revolution
- Digital Wellness: Tech sabbaticals cut stress 50%, anxiety 23%
- Music & Intelligence: Instrumental fans score higher
- Fiji Digital Sovereignty: Preserving ancient culture with technology
- Sacred Objects: Rudraksha beads emit electromagnetic fields
- AI Avatars: Replace 60% of creators, end burnout crisis

### KEY INSIGHTS FOR NEW CONTENT:

1. **Avoid These Covered Topics:**
   - AI agents (extensively covered)
   - CRISPR/gene editing (multiple articles)
   - Quantum computing basics (covered)
   - Mental health apps (covered)
   - Space debris (covered)
   - Creator economy challenges (well covered)

2. **Potential Gaps to Fill:**
   - Renewable energy breakthroughs
   - Climate tech innovations
   - Robotics in healthcare
   - Synthetic biology applications
   - Nuclear fusion progress
   - Brain organoids ethics
   - Vertical farming tech
   - Carbon capture breakthroughs
   - Longevity research
   - Augmented reality in education
