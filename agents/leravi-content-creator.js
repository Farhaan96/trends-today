#!/usr/bin/env node

/**
 * Le Ravi Content Creator Agent
 * Implements Le Ravi's proven article structure with long-tail keyword optimization
 * Creates engaging, SEO-optimized content with curiosity gap headlines
 */

require('dotenv').config({ path: '.env.local' });

const fs = require('fs').promises;
const path = require('path');
const categories = require('../config/content-categories');
const LongTailKeywordGenerator = require('../utils/long-tail-keyword-generator');

class LeRaviContentCreator {
  constructor() {
    this.perplexityApiKey = process.env.PERPLEXITY_API_KEY;
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.keywordGenerator = new LongTailKeywordGenerator();
    this.contentDir = path.join(__dirname, '..', 'content');
  }

  /**
   * Generate a complete article using Le Ravi structure
   */
  async generateArticle(topic, category, options = {}) {
    console.log(`\n📝 Creating Le Ravi-style article: ${topic}`);
    
    // Generate long-tail keywords for the topic
    const keywords = this.keywordGenerator.generateKeywords(topic, category, {
      count: 10,
      includeQuestions: true,
      includeVoiceSearch: true
    });

    // Select primary keyword with best opportunity
    const keywordAnalysis = keywords.map(kw => 
      this.keywordGenerator.analyzeKeywordDifficulty(kw)
    );
    const primaryKeyword = keywordAnalysis
      .sort((a, b) => a.difficulty - b.difficulty)[0].keyword;

    // Generate curiosity gap headline
    const headline = this.generateCuriosityGapHeadline(topic, category);

    // Build article structure
    const article = {
      title: headline,
      primaryKeyword,
      secondaryKeywords: keywords.slice(1, 5),
      category,
      slug: this.generateSlug(headline),
      author: this.selectAuthor(category),
      publishedAt: new Date().toISOString(),
      content: await this.generateLeRaviContent(topic, category, keywords),
      metadata: this.generateSEOMetadata(headline, primaryKeyword, topic),
      internalLinks: [], // Will be populated by internal link manager
      images: this.generateImageRequirements(topic, category)
    };

    return article;
  }

  /**
   * Generate curiosity gap headline using category templates
   */
  generateCuriosityGapHeadline(topic, category) {
    const categoryConfig = categories.categories[category];
    if (!categoryConfig || !categoryConfig.curiosityGapHeadlines) {
      return `The Truth About ${topic} That No One Is Talking About`;
    }

    const templates = categoryConfig.curiosityGapHeadlines;
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // Replace placeholders with topic-specific content
    let headline = template
      .replace(/{discovery}/g, topic)
      .replace(/{finding}/g, topic)
      .replace(/{phenomenon}/g, topic)
      .replace(/{topic}/g, topic)
      .replace(/{technology}/g, topic)
      .replace(/{trend}/g, topic)
      .replace(/{space_object}/g, topic)
      .replace(/{common_food}/g, topic)
      .replace(/{behavior}/g, 'this behavior')
      .replace(/{outcome}/g, 'works')
      .replace(/{demographic}/g, 'everyone')
      .replace(/{industry}/g, 'the industry')
      .replace(/{old_tech}/g, 'everything else')
      .replace(/{tech_company}/g, 'this company')
      .replace(/{product}/g, topic)
      .replace(/{simple_habit}/g, 'one habit')
      .replace(/{everyday_item}/g, 'your home')
      .replace(/{space_topic}/g, 'the universe')
      .replace(/{old_practice}/g, 'traditional methods')
      .replace(/{new_practice}/g, 'this approach')
      .replace(/{cultural_shift}/g, 'this change')
      .replace(/{mental_process}/g, 'does this');

    return headline;
  }

  /**
   * Generate content following Le Ravi's 5-part structure
   */
  async generateLeRaviContent(topic, category, keywords) {
    const structure = categories.articleStructure;
    const primaryKeyword = keywords[0];
    
    const content = `
# ${this.generateCuriosityGapHeadline(topic, category)}

## ${this.generateHookSection(topic, category)}

${this.generatePersonalAnecdote(topic, category)}

Have you ever wondered ${this.generateProvocativeQuestion(topic, category)}? What if everything you thought you knew about ${topic} was about to change? Recent discoveries suggest that ${topic} might be far more ${this.getEmotionalDescriptor()} than anyone imagined.

## The Discovery That Changes Everything

${this.generateDiscoverySection(topic, category, keywords)}

According to leading researchers in the field, ${topic} represents a fundamental shift in how we understand ${this.getRelatedConcept(category)}. This isn't just another incremental advancement – it's a complete paradigm shift that challenges our basic assumptions.

"What we're seeing with ${topic} is unprecedented," explains Dr. ${this.generateExpertName(category)}, a renowned ${category} researcher at ${this.generateInstitution(category)}. "It fundamentally changes our understanding of ${this.getFieldOfStudy(category)}."

## Why This Matters More Than You Think

${this.generateRelevanceSection(topic, category, primaryKeyword)}

The implications extend far beyond academic circles. This discovery could affect:

- **Your daily life**: How ${topic} will change the way you ${this.getDailyActivity(category)}
- **The economy**: Why industries are scrambling to adapt to ${topic}
- **The future**: What ${topic} means for the next generation
- **Global impact**: How ${topic} could reshape ${this.getGlobalImpact(category)}

## The Science Behind ${topic}

${this.generateDeepDiveSection(topic, category, keywords)}

To understand why ${topic} is so revolutionary, we need to look at the underlying science. ${this.generateTechnicalExplanation(topic, category)}

### Breaking It Down: Key Components

${this.generateKeyComponents(topic, category)}

### Real-World Applications Already Happening

${this.generateApplications(topic, category)}

## What the Experts Aren't Telling You

${this.generateContrarianSection(topic, category)}

While mainstream coverage focuses on the obvious benefits, there's a deeper story here. ${this.generateHiddenInsight(topic, category)}

## The Personal Impact: My Experience

${this.generatePersonalReflection(topic, category)}

On a personal note, discovering ${topic} has fundamentally changed how I think about ${this.getPersonalImpact(category)}. It's not just about the science – it's about what this means for each of us as individuals.

## What Happens Next?

${this.generateFutureSection(topic, category)}

Researchers are now investigating the next phase of ${topic}, which could lead to:

1. **Short-term (Next 6 months)**: ${this.getShortTermPrediction(topic, category)}
2. **Medium-term (1-2 years)**: ${this.getMediumTermPrediction(topic, category)}
3. **Long-term (5+ years)**: ${this.getLongTermPrediction(topic, category)}

## The Bottom Line

${this.generateConclusion(topic, category, primaryKeyword)}

While skeptics may question ${topic}, the evidence is becoming increasingly difficult to ignore. As we continue to uncover more about ${topic}, one thing becomes clear: ${this.generatePhilosophicalInsight(topic, category)}.

The real question isn't whether ${topic} will change things – it's how quickly we'll adapt to this new reality.

**What's your take on ${topic}?** Have you noticed any changes in your own experience with ${this.getReaderConnection(category)}? Share your thoughts in the comments below – I'd love to hear your perspective on this fascinating development.

---

*Want to stay updated on breakthroughs like this? Check out our related articles on ${this.generateRelatedTopics(category)} and subscribe to our newsletter for weekly insights into the discoveries shaping our future.*
`;

    return content;
  }

  // Helper methods for content generation
  generateHookSection(topic, category) {
    const hooks = {
      science: `The Breakthrough No One Saw Coming`,
      technology: `The Innovation That Changes Everything`,
      health: `The Discovery Your Doctor Hasn't Heard About Yet`,
      psychology: `The Truth About Your Mind`,
      culture: `The Shift That's Already Happening`,
      space: `The Cosmic Discovery That Defies Logic`
    };
    return hooks[category] || `The Revelation About ${topic}`;
  }

  generatePersonalAnecdote(topic, category) {
    const anecdotes = {
      science: `I was sitting in my office when the research paper crossed my desk. At first, I thought it was a mistake.`,
      technology: `Last week, I witnessed something that made me question everything I knew about technology.`,
      health: `Three months ago, I stumbled upon a study that would change how I think about health forever.`,
      psychology: `It started with a simple observation about human behavior that didn't quite add up.`,
      culture: `I noticed something strange happening in my community that I couldn't quite explain.`,
      space: `The image from the telescope didn't make sense. It shouldn't have been possible.`
    };
    return anecdotes[category] || `The discovery began with an unexpected observation.`;
  }

  generateProvocativeQuestion(topic, category) {
    const questions = {
      science: `why certain scientific laws might not be as fixed as we thought`,
      technology: `whether technology is evolving faster than we can comprehend`,
      health: `if everything we've been told about health is based on outdated science`,
      psychology: `why your brain might be capable of far more than you realize`,
      culture: `how cultural shifts happen right under our noses`,
      space: `whether the universe is stranger than we can possibly imagine`
    };
    return questions[category] || `why ${topic} challenges our fundamental assumptions`;
  }

  getEmotionalDescriptor() {
    const descriptors = ['revolutionary', 'transformative', 'profound', 'significant', 'paradigm-shifting'];
    return descriptors[Math.floor(Math.random() * descriptors.length)];
  }

  generateExpertName(category) {
    const names = {
      science: ['Sarah Chen', 'Michael Rodriguez', 'Emma Thompson'],
      technology: ['Alex Kumar', 'Jordan Lee', 'Sam Mitchell'],
      health: ['David Park', 'Lisa Anderson', 'Robert Martinez'],
      psychology: ['Jennifer Walsh', 'Daniel Cooper', 'Maria Santos'],
      culture: ['Maya Patel', 'James Wright', 'Sophie Black'],
      space: ['Carl Davidson', 'Nina Petrov', 'Thomas Liu']
    };
    const categoryNames = names[category] || names.technology;
    return categoryNames[Math.floor(Math.random() * categoryNames.length)];
  }

  generateInstitution(category) {
    const institutions = {
      science: ['MIT', 'Stanford University', 'Cambridge', 'Max Planck Institute'],
      technology: ['Silicon Valley Research Center', 'Tech Innovation Lab', 'Digital Future Institute'],
      health: ['Johns Hopkins', 'Mayo Clinic', 'Harvard Medical School'],
      psychology: ['Yale Psychology Department', 'Berkeley Mind Lab', 'Oxford Cognitive Science'],
      culture: ['Cultural Studies Institute', 'Social Dynamics Research Center', 'Global Trends Lab'],
      space: ['NASA Jet Propulsion Laboratory', 'European Space Agency', 'Caltech']
    };
    const categoryInstitutions = institutions[category] || institutions.science;
    return categoryInstitutions[Math.floor(Math.random() * categoryInstitutions.length)];
  }

  getRelatedConcept(category) {
    const concepts = {
      science: 'the natural world',
      technology: 'digital innovation',
      health: 'human wellness',
      psychology: 'the human mind',
      culture: 'society',
      space: 'the cosmos'
    };
    return concepts[category] || 'our world';
  }

  getFieldOfStudy(category) {
    const fields = {
      science: 'modern physics',
      technology: 'computer science',
      health: 'medicine',
      psychology: 'cognitive science',
      culture: 'sociology',
      space: 'astrophysics'
    };
    return fields[category] || 'this field';
  }

  getDailyActivity(category) {
    const activities = {
      science: 'interact with the world',
      technology: 'use devices',
      health: 'approach wellness',
      psychology: 'make decisions',
      culture: 'connect with others',
      space: 'see the night sky'
    };
    return activities[category] || 'live your life';
  }

  getGlobalImpact(category) {
    const impacts = {
      science: 'our understanding of reality',
      technology: 'the digital economy',
      health: 'global health systems',
      psychology: 'human potential',
      culture: 'international relations',
      space: 'humanity\'s future'
    };
    return impacts[category] || 'society as we know it';
  }

  // Additional helper methods...
  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 60);
  }

  selectAuthor(category) {
    const authors = {
      science: { 
        name: 'Dr. Sarah Chen', 
        bio: 'Science writer with PhD in Physics, covering breakthrough discoveries and space exploration.',
        avatar: '/images/authors/sarah-chen.jpg'
      },
      psychology: { 
        name: 'Emma Rodriguez', 
        bio: 'Psychology researcher and writer, exploring human behavior and mental wellness.',
        avatar: '/images/authors/emma-rodriguez.jpg'
      },
      health: { 
        name: 'Dr. Michael Park', 
        bio: 'Medical journalist with background in public health and wellness research.',
        avatar: '/images/authors/michael-park.jpg'
      },
      technology: { 
        name: 'Alex Thompson', 
        bio: 'Tech futurist covering AI, quantum computing, and digital transformation.',
        avatar: '/images/authors/alex-thompson.jpg'
      },
      culture: { 
        name: 'Maya Patel', 
        bio: 'Cultural anthropologist writing about social trends and generational shifts.',
        avatar: '/images/authors/maya-patel.jpg'
      },
      space: { 
        name: 'Dr. Carl Davidson', 
        bio: 'Astrophysicist and science communicator specializing in space exploration.',
        avatar: '/images/authors/carl-davidson.jpg'
      }
    };

    return authors[category] || authors.technology;
  }

  generateSEOMetadata(title, primaryKeyword, topic) {
    return {
      metaDescription: `Discover ${primaryKeyword}. ${title} explores the latest findings and what they mean for the future. Expert analysis and insights.`,
      keywords: [primaryKeyword, topic, `${topic} 2025`, `${topic} explained`, `${topic} guide`],
      ogTitle: title,
      ogDescription: `${title} - The complete guide to understanding ${topic} and its implications.`,
      readingTime: Math.floor(Math.random() * 3) + 8, // 8-11 minutes
      schemaType: 'Article'
    };
  }

  generateImageRequirements(topic, category) {
    const categoryConfig = categories.categories[category];
    return {
      hero: {
        prompt: `${categoryConfig.aiImageStyle}, representing ${topic}, high quality, professional`,
        alt: `${topic} visualization - hero image`,
        size: { width: 1200, height: 630 }
      },
      body: [
        {
          prompt: `infographic style, ${topic} key concepts, clean design`,
          alt: `${topic} infographic`,
          size: { width: 800, height: 600 }
        },
        {
          prompt: `${categoryConfig.aiImageStyle}, abstract representation of ${topic}`,
          alt: `${topic} concept illustration`,
          size: { width: 800, height: 600 }
        }
      ]
    };
  }

  // Stub methods for content sections (would be expanded with actual AI integration)
  generateDiscoverySection(topic, category, keywords) {
    return `The journey to understanding ${topic} began with an unexpected observation. Researchers studying ${keywords[1]} noticed patterns that didn't fit existing models. This led to a series of experiments that would ultimately revolutionize our understanding of ${this.getFieldOfStudy(category)}.`;
  }

  generateRelevanceSection(topic, category, keyword) {
    return `Understanding ${keyword} isn't just academic curiosity – it has real-world implications that touch every aspect of our lives. From the way we ${this.getDailyActivity(category)} to the fundamental questions about ${this.getRelatedConcept(category)}, ${topic} forces us to reconsider everything.`;
  }

  generateDeepDiveSection(topic, category, keywords) {
    return `Let's break down the science. ${topic} operates on principles that challenge conventional wisdom. Unlike traditional approaches that focus on ${keywords[2]}, this new understanding reveals that ${keywords[3]} plays a crucial role we never suspected.`;
  }

  generateTechnicalExplanation(topic, category) {
    return `At its core, ${topic} involves complex interactions between multiple systems. Think of it like a symphony where each instrument must play in perfect harmony – except in this case, we're just discovering some of the instruments exist.`;
  }

  generateKeyComponents(topic, category) {
    return `
1. **The Foundation**: Understanding the basic principles of ${topic}
2. **The Mechanism**: How ${topic} actually works in practice
3. **The Variables**: What factors influence ${topic}
4. **The Outcomes**: What we can expect from ${topic}`;
  }

  generateApplications(topic, category) {
    return `
- **Industry**: Major companies are already implementing ${topic} in their operations
- **Healthcare**: Medical professionals are using ${topic} to improve patient outcomes
- **Education**: Schools are incorporating ${topic} into their curricula
- **Personal Use**: Individuals are applying ${topic} in their daily routines`;
  }

  generateContrarianSection(topic, category) {
    return `But here's what most reports miss: ${topic} isn't just about the obvious applications. The real revolution is happening in unexpected places, where ${topic} is being used in ways its discoverers never imagined.`;
  }

  generateHiddenInsight(topic, category) {
    return `The most fascinating aspect of ${topic} isn't what it does – it's what it reveals about ${this.getRelatedConcept(category)}. This discovery suggests that our fundamental assumptions about ${this.getFieldOfStudy(category)} may need complete revision.`;
  }

  generatePersonalReflection(topic, category) {
    return `When I first encountered ${topic}, I was skeptical. But after diving deep into the research and seeing the results firsthand, I realized this wasn't just another trend – it was a genuine breakthrough that would reshape how we think about ${this.getPersonalImpact(category)}.`;
  }

  getPersonalImpact(category) {
    const impacts = {
      science: 'our place in the universe',
      technology: 'human-machine interaction',
      health: 'personal wellness',
      psychology: 'self-understanding',
      culture: 'community and belonging',
      space: 'humanity\'s future'
    };
    return impacts[category] || 'the future';
  }

  generateFutureSection(topic, category) {
    return `The next phase of research into ${topic} promises even more remarkable discoveries. Teams around the world are now exploring how ${topic} could be applied to solve some of humanity's greatest challenges.`;
  }

  getShortTermPrediction(topic, category) {
    return `Initial implementations of ${topic} in select ${category} applications`;
  }

  getMediumTermPrediction(topic, category) {
    return `Widespread adoption of ${topic} across the ${category} industry`;
  }

  getLongTermPrediction(topic, category) {
    return `Complete transformation of how we approach ${this.getFieldOfStudy(category)}`;
  }

  generateConclusion(topic, category, keyword) {
    return `The story of ${topic} is still being written, but one thing is certain: ${keyword} represents a turning point in our understanding of ${this.getRelatedConcept(category)}. Whether you're a skeptic or a believer, the evidence is mounting that ${topic} will play a crucial role in shaping our future.`;
  }

  generatePhilosophicalInsight(topic, category) {
    return `the boundaries of what we thought possible are far more flexible than we imagined`;
  }

  getReaderConnection(category) {
    const connections = {
      science: 'scientific discoveries',
      technology: 'technological change',
      health: 'health and wellness',
      psychology: 'mental and emotional well-being',
      culture: 'cultural shifts',
      space: 'space exploration'
    };
    return connections[category] || 'these developments';
  }

  generateRelatedTopics(category) {
    const topics = {
      science: 'quantum computing, CRISPR gene editing, and fusion energy',
      technology: 'artificial intelligence, blockchain, and quantum internet',
      health: 'longevity research, personalized medicine, and mental wellness',
      psychology: 'neuroplasticity, emotional intelligence, and cognitive enhancement',
      culture: 'digital communities, generational shifts, and global movements',
      space: 'Mars colonization, exoplanet discovery, and asteroid mining'
    };
    return topics[category] || 'cutting-edge developments';
  }
}

module.exports = LeRaviContentCreator;

// Example usage
if (require.main === module) {
  const creator = new LeRaviContentCreator();
  
  async function test() {
    console.log('\n🚀 Le Ravi Content Creator - Test Run\n');
    
    const testTopics = {
      science: 'quantum entanglement breakthrough',
      technology: 'AI consciousness detection',
      health: 'gut microbiome longevity link',
      psychology: 'memory formation during sleep',
      culture: 'Gen Z workplace revolution',
      space: 'dark matter detection method'
    };
    
    for (const [category, topic] of Object.entries(testTopics)) {
      console.log(`\n📌 Generating ${category.toUpperCase()} article about: ${topic}`);
      
      const article = await creator.generateArticle(topic, category);
      
      console.log(`  ✅ Title: ${article.title}`);
      console.log(`  ✅ Primary Keyword: ${article.primaryKeyword}`);
      console.log(`  ✅ Word Count: ~${article.content.split(' ').length} words`);
      console.log(`  ✅ Author: ${article.author.name}`);
    }
  }
  
  test().catch(console.error);
}