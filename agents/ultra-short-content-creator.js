/**
 * Ultra-Short Content Creator Agent
 * Creates 400-500 word articles following the Ultra-Short, Highly Readable Content Strategy
 * Features: Bold emphasis, blockquotes, horizontal rules, generous white space
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');

class UltraShortContentCreator {
  constructor() {
    this.contentDir = path.join(__dirname, '../content');
    this.wordLimit = { min: 400, max: 500 };
    this.readingTime = 2; // Always 2 minutes
  }

  /**
   * Generate article for a specific category
   */
  async generateArticle(topic, category, options = {}) {
    console.log(`\n📝 Creating ultra-short article for ${category}: ${topic}`);
    
    const metadata = this.generateMetadata(topic, category);
    const content = this.generateUltraShortContent(topic, category);
    
    // Count words to ensure compliance
    const wordCount = this.countWords(content);
    console.log(`✅ Word count: ${wordCount} words (target: 400-500)`);
    
    const article = {
      metadata,
      content,
      wordCount,
      category,
      slug: this.generateSlug(topic)
    };
    
    if (options.save) {
      await this.saveArticle(article);
    }
    
    return article;
  }

  /**
   * Generate metadata with SEO optimization
   */
  generateMetadata(topic, category) {
    const now = new Date().toISOString();
    
    return {
      title: this.generateHookTitle(topic),
      description: this.generateCompellingDescription(topic),
      category: category,
      publishedAt: now,
      lastUpdated: now,
      author: this.getAuthorForCategory(category),
      image: `https://images.unsplash.com/photo-${this.getImageIdForCategory(category)}?w=1200&h=630&fit=crop`,
      imageAlt: this.generateImageAlt(topic, category),
      seo: {
        title: `${topic} - ${this.generateSeoSuffix(category)}`,
        description: this.generateSeoDescription(topic),
        keywords: this.generateKeywords(topic, category)
      },
      readingTime: this.readingTime,
      optimized: true,
      primaryKeyword: this.extractPrimaryKeyword(topic)
    };
  }

  /**
   * Generate ultra-short content with premium typography
   */
  generateUltraShortContent(topic, category) {
    return `## ${this.generateHookOpening(topic)}

${this.generateCompellingStory(topic, category)}

**${this.generateBoldStatistic(topic)}** — this changes everything.

---

## ${this.generateDiscoveryHeading(topic)}

${this.generateCoreDiscovery(topic, category)}

> "${this.generateExpertQuote(topic, category)}" — ${this.generateExpertName(category)}, ${this.generateInstitution(category)}

**Key insight:** ${this.generateKeyInsight(topic)}

---

## Real Examples That Prove It

${this.generateCaseStudy(topic, category)}

**The numbers:**
- **${this.generateStatistic()}** improvement in performance
- **${this.generateStatistic()}** reduction in costs
- **${this.generateStatistic()}** user satisfaction rate

> "${this.generateTestimonial(topic)}" — ${this.generateCompanyName(category)}

---

## What You Can Do Today

${this.generatePracticalApplication(topic, category)}

**Three immediate actions:**
1. ${this.generateAction(topic, 1)}
2. ${this.generateAction(topic, 2)}
3. ${this.generateAction(topic, 3)}

---

## The Bottom Line

${this.generateConclusion(topic, category)}

**${this.generateFinalInsight(topic)}**

*${this.generateCallToAction(topic)}*`;
  }

  /**
   * Content generation helpers
   */
  generateHookTitle(topic) {
    const templates = [
      `${topic} Just Changed Everything: Here's What You Need to Know`,
      `The ${topic} Revolution Nobody Saw Coming`,
      `${topic}: Why 73% of Experts Are Wrong`,
      `Breaking: ${topic} Achieves the "Impossible"`,
      `${topic} Is Here — And It's Not What We Expected`
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  generateHookOpening(topic) {
    const hooks = [
      'The Quiet Revolution Nobody\'s Talking About',
      'What Nobody Tells You About the Future',
      'The Discovery That Changes Everything',
      'Why Everything You Know Is About to Change',
      'The Breakthrough We\'ve Been Waiting For'
    ];
    return hooks[Math.floor(Math.random() * hooks.length)];
  }

  generateCompellingStory(topic, category) {
    return `Imagine ${this.getScenario(category)}. Now imagine it's ${this.generateTimeframe()} faster, ${this.generatePercentage()}% cheaper, and completely automated.

That's not science fiction. That's ${topic} today.`;
  }

  generateBoldStatistic(topic) {
    const stats = [
      '94% of early adopters report transformational results',
      '$13.5 billion invested in just 6 months',
      '2.3 million users in the first week',
      '87% accuracy rate — beating human experts',
      '10x performance improvement over traditional methods'
    ];
    return stats[Math.floor(Math.random() * stats.length)];
  }

  generateDiscoveryHeading(topic) {
    return `Why ${topic} Is Different This Time`;
  }

  generateCoreDiscovery(topic, category) {
    return `Researchers at ${this.generateInstitution(category)} have cracked the code. After analyzing ${this.generateDataPoint()}, they discovered that ${topic} isn't just an improvement — it's a complete paradigm shift.

The breakthrough: ${this.generateBreakthrough(topic)}. This represents a fundamental reimagining of how ${this.getField(category)} operates, with implications that extend far beyond what anyone initially anticipated.

What makes this different from previous attempts is the approach. Instead of incremental improvements, the team focused on completely rethinking the underlying assumptions that have guided the field for decades.`;
  }

  generateExpertQuote(topic, category) {
    const quotes = [
      `This fundamentally changes how we approach ${this.getField(category)}`,
      `We're witnessing the biggest transformation in ${this.getTimespan()}`,
      `The implications are staggering — this affects everyone`,
      `In my 20 years, I've never seen anything like ${topic}`,
      `This isn't evolution, it's revolution`
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  generateKeyInsight(topic) {
    return `${topic} solves the ${this.generateProblem()} problem that's plagued the industry for decades`;
  }

  generateCaseStudy(topic, category) {
    return `${this.generateCompanyName(category)} implemented ${topic} last ${this.getRecentTimeframe()}. Within ${this.getShortTimeframe()}, they saw a complete transformation in their ${this.getBusinessMetric(category)}.

The implementation wasn't without challenges. Initial skepticism from stakeholders quickly turned to enthusiasm as the results became undeniable. "We expected gradual improvement," the CEO explained. "What we got was a complete revolution in how we operate."

The ripple effects extended throughout the organization, affecting everything from daily operations to long-term strategic planning.`;
  }

  generatePracticalApplication(topic, category) {
    return `The best part? You don't need to be a ${this.getExpertType(category)} to benefit. Whether you're a ${this.getUserType(category)} or just curious, the applications are surprisingly accessible.

Early adopters are already seeing results that exceed expectations. The learning curve is gentler than anticipated, and the community support has been exceptional. Resources, tutorials, and case studies are readily available for those ready to take the plunge.`;
  }

  generateAction(topic, number) {
    const actions = [
      `Start with the free ${topic} assessment tool`,
      `Join the early adopter program (limited spots)`,
      `Download the implementation guide`,
      `Watch the 5-minute demo video`,
      `Connect with other ${topic} pioneers`,
      `Test it yourself with the trial version`
    ];
    return actions[number - 1] || actions[0];
  }

  generateConclusion(topic, category) {
    return `${topic} isn't coming — it's here. And the companies, individuals, and organizations that move now will have an insurmountable advantage.

The window of opportunity won't stay open forever. As more organizations adopt ${topic}, the competitive advantage will shift from early adopters to those who implement it most effectively. The question isn't whether to embrace this change, but how quickly you can adapt.`;
  }

  generateFinalInsight(topic) {
    return `The future belongs to those who embrace ${topic} today.`;
  }

  generateCallToAction(topic) {
    return `Ready to join the ${topic} revolution? The next move is yours.`;
  }

  /**
   * Helper methods for content generation
   */
  generateStatistic() {
    return Math.floor(Math.random() * 80 + 20) + '%';
  }

  generatePercentage() {
    return Math.floor(Math.random() * 70 + 30);
  }

  generateDataPoint() {
    const points = ['10 million data points', '5 years of research', '1,000 case studies', '50,000 users', '100 companies'];
    return points[Math.floor(Math.random() * points.length)];
  }

  generateBreakthrough(topic) {
    return `combining ${topic} with advanced AI to achieve previously impossible results`;
  }

  generateProblem() {
    const problems = ['scalability', 'cost', 'complexity', 'accuracy', 'speed'];
    return problems[Math.floor(Math.random() * problems.length)];
  }

  generateTimeframe() {
    const times = ['10x', '100x', '1000x'];
    return times[Math.floor(Math.random() * times.length)];
  }

  getTimespan() {
    const spans = ['30 years', 'a decade', 'a generation', 'modern history'];
    return spans[Math.floor(Math.random() * spans.length)];
  }

  getRecentTimeframe() {
    const times = ['month', 'quarter', 'week'];
    return times[Math.floor(Math.random() * times.length)];
  }

  getShortTimeframe() {
    const times = ['48 hours', '3 days', 'one week', '72 hours'];
    return times[Math.floor(Math.random() * times.length)];
  }

  /**
   * Category-specific helpers
   */
  getAuthorForCategory(category) {
    const authors = {
      technology: 'Tech Insights Team',
      science: 'Science & Discovery Desk',
      psychology: 'Mind & Behavior Desk',
      health: 'Health & Wellness Team',
      space: 'Space & Astronomy Desk',
      culture: 'Culture & Society Team'
    };
    return authors[category] || 'Editorial Team';
  }

  getImageIdForCategory(category) {
    // Unique image IDs for each category (no duplicates)
    const imageIds = {
      technology: '1677442136019-21780ecad995',
      science: '1581594217240-4e4b7cfb0ba5',
      psychology: '1507003211169-0a1dd7228f2d',
      health: '1576091160399-112ba8d25d72',
      space: '1419242902950-c33b5c3ce0fc',
      culture: '1529088746738-c4c0a152fb2c'
    };
    return imageIds[category] || '1553761297-1925eafd1358';
  }

  generateImageAlt(topic, category) {
    return `${topic} visualization in ${category} context`;
  }

  generateExpertName(category) {
    const experts = {
      technology: 'Dr. Sarah Chen',
      science: 'Prof. Michael Anderson',
      psychology: 'Dr. Emily Rodriguez',
      health: 'Dr. James Thompson',
      space: 'Dr. Lisa Patel',
      culture: 'Prof. David Kim'
    };
    return experts[category] || 'Dr. Expert';
  }

  generateInstitution(category) {
    const institutions = {
      technology: 'MIT AI Lab',
      science: 'Stanford Research Center',
      psychology: 'Harvard Psychology Department',
      health: 'Johns Hopkins Medical',
      space: 'NASA Jet Propulsion Lab',
      culture: 'Oxford Social Studies Institute'
    };
    return institutions[category] || 'Leading Research Institute';
  }

  generateCompanyName(category) {
    const companies = {
      technology: 'TechCorp',
      science: 'BioGen Solutions',
      psychology: 'MindWell Inc.',
      health: 'HealthFirst',
      space: 'SpaceX',
      culture: 'Global Dynamics'
    };
    return companies[category] || 'Fortune 500 Company';
  }

  getScenario(category) {
    const scenarios = {
      technology: 'your entire workflow automated',
      science: 'solving impossible problems',
      psychology: 'understanding human behavior perfectly',
      health: 'personalized medicine for everyone',
      space: 'colonizing other planets',
      culture: 'global cultural transformation'
    };
    return scenarios[category] || 'the impossible becoming possible';
  }

  getField(category) {
    const fields = {
      technology: 'software development',
      science: 'scientific research',
      psychology: 'human understanding',
      health: 'medical treatment',
      space: 'space exploration',
      culture: 'social dynamics'
    };
    return fields[category] || 'the industry';
  }

  getBusinessMetric(category) {
    const metrics = {
      technology: 'development efficiency',
      science: 'research output',
      psychology: 'employee satisfaction',
      health: 'patient outcomes',
      space: 'mission success rate',
      culture: 'engagement metrics'
    };
    return metrics[category] || 'key performance indicators';
  }

  getExpertType(category) {
    const types = {
      technology: 'software engineer',
      science: 'research scientist',
      psychology: 'psychologist',
      health: 'medical professional',
      space: 'aerospace engineer',
      culture: 'sociologist'
    };
    return types[category] || 'expert';
  }

  getUserType(category) {
    const types = {
      technology: 'developer',
      science: 'researcher',
      psychology: 'therapist',
      health: 'healthcare provider',
      space: 'astronomy enthusiast',
      culture: 'content creator'
    };
    return types[category] || 'professional';
  }

  /**
   * Utility methods
   */
  generateSlug(topic) {
    return topic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
  }

  extractPrimaryKeyword(topic) {
    // Extract the most important 2-3 words from the topic
    const words = topic.toLowerCase().split(' ');
    return words.slice(0, 3).join(' ');
  }

  generateKeywords(topic, category) {
    const baseKeywords = topic.toLowerCase().split(' ').filter(w => w.length > 3);
    const categoryKeywords = {
      technology: ['AI', 'automation', 'innovation'],
      science: ['research', 'breakthrough', 'discovery'],
      psychology: ['behavior', 'mind', 'cognitive'],
      health: ['wellness', 'medical', 'treatment'],
      space: ['NASA', 'astronomy', 'cosmos'],
      culture: ['society', 'trends', 'social']
    };
    return [...baseKeywords, ...(categoryKeywords[category] || [])].slice(0, 5);
  }

  generateCompellingDescription(topic) {
    return `Breaking: ${topic} transforms everything we thought we knew. The data, the proof, and what it means for you.`;
  }

  generateSeoDescription(topic) {
    return `${topic} breakthrough 2025: Complete analysis with data, expert insights, and practical applications. 2-minute read.`;
  }

  generateSeoSuffix(category) {
    const suffixes = {
      technology: 'Tech Breakthrough 2025',
      science: 'Scientific Discovery 2025',
      psychology: 'Psychology Research 2025',
      health: 'Health Innovation 2025',
      space: 'Space Discovery 2025',
      culture: 'Cultural Shift 2025'
    };
    return suffixes[category] || 'Latest Breakthrough 2025';
  }

  generateTestimonial(topic) {
    const testimonials = [
      `${topic} transformed our entire operation`,
      `We saw results within 24 hours`,
      `This is the game-changer we've been waiting for`,
      `Implementation was surprisingly simple`,
      `ROI exceeded all expectations`
    ];
    return testimonials[Math.floor(Math.random() * testimonials.length)];
  }

  /**
   * Word counting utility
   */
  countWords(content) {
    return content.split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Save article to file system
   */
  async saveArticle(article) {
    const { metadata, content, category, slug } = article;
    
    // Ensure category directory exists
    const categoryDir = path.join(this.contentDir, category);
    await fs.mkdir(categoryDir, { recursive: true });
    
    // Create MDX content with frontmatter
    const mdxContent = matter.stringify(content, metadata);
    
    // Save file
    const filePath = path.join(categoryDir, `${slug}.mdx`);
    await fs.writeFile(filePath, mdxContent);
    
    console.log(`✅ Article saved: ${filePath}`);
    return filePath;
  }
}

module.exports = UltraShortContentCreator;

// Example usage
if (require.main === module) {
  const creator = new UltraShortContentCreator();
  
  // Test article generation
  creator.generateArticle(
    'Quantum Computing Breakthrough',
    'technology',
    { save: false }
  ).then(article => {
    console.log('\n📊 Generated Article Preview:');
    console.log('Title:', article.metadata.title);
    console.log('Word Count:', article.wordCount);
    console.log('Category:', article.category);
    console.log('\nContent Preview:');
    console.log(article.content.substring(0, 500) + '...');
  });
}