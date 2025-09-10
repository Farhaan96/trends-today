#!/usr/bin/env node

/**
 * Trending Topics Discovery Agent
 * Finds trending long-tail keywords across diverse topics
 * Mimics Le Ravi's approach to content discovery
 */

const categories = require('../config/content-categories');

class TrendingTopicsDiscovery {
  constructor() {
    this.topics = [];
    this.longTailKeywords = [];
  }

  /**
   * Generate long-tail keywords for each category
   */
  generateLongTailKeywords() {
    const keywords = [];
    const currentYear = new Date().getFullYear();
    const timeframes = ['2025', '2030', '2035', 'next decade', 'this century'];
    const percentages = ['73%', '85%', '91%', '67%', '94%'];
    
    // Science topics
    keywords.push(
      `500-year-old manuscript reveals ancient knowledge about astronomy`,
      `Scientists discover planet that shouldn't exist according to physics`,
      `New quantum breakthrough could revolutionize computing by ${currentYear + 2}`,
      `Archaeological find in Egypt changes understanding of ancient civilization`,
      `Mysterious signal from space has scientists baffled`
    );

    // Psychology topics
    keywords.push(
      `The psychology behind why we procrastinate even when we know better`,
      `What your sleep position says about your personality type`,
      `${percentages[0]} of people have this cognitive bias without knowing`,
      `New study reveals surprising link between music taste and intelligence`,
      `Why introverts are actually better at this one crucial skill`
    );

    // Health topics
    keywords.push(
      `The unexpected health benefits of spending 10 minutes in nature`,
      `Scientists discover new organ in human body after centuries`,
      `Why Mediterranean diet might not work for everyone`,
      `The morning habit that could add 5 years to your life`,
      `Hidden dangers of popular wellness trend revealed by new study`
    );

    // Technology topics
    keywords.push(
      `AI achieves consciousness according to new research paper`,
      `Quantum internet successfully tested between cities`,
      `The technology that will replace smartphones by ${currentYear + 5}`,
      `Why tech giants are secretly investing billions in this`,
      `The programming language that's taking over Silicon Valley`
    );

    // Culture topics
    keywords.push(
      `How Gen Alpha is completely redefining social media`,
      `The cultural phenomenon that's bigger than TikTok`,
      `Why Nordic countries do education completely differently`,
      `The rise of digital nomads is changing entire cities`,
      `Ancient tradition makes unexpected comeback among millennials`
    );

    // Environment topics
    keywords.push(
      `Scientists find way to reverse climate damage in breakthrough`,
      `The plant that could solve world hunger grows in your backyard`,
      `Ocean discovery changes everything we knew about marine life`,
      `City becomes carbon negative using revolutionary technique`,
      `Why this renewable energy source beats solar and wind`
    );

    // History topics
    keywords.push(
      `1000-year-old Viking settlement found in unexpected location`,
      `Lost Leonardo da Vinci invention finally built and it works`,
      `Ancient Roman concrete mystery finally solved by MIT`,
      `Hidden chamber in Great Pyramid reveals new secrets`,
      `Medieval manuscript contains blueprint for modern technology`
    );

    // Mystery topics
    keywords.push(
      `The Bermuda Triangle mystery might finally be solved`,
      `Scientists can't explain this phenomenon happening worldwide`,
      `Ancient structure predates known civilization by 5000 years`,
      `The mathematical pattern found in nature that shouldn't exist`,
      `Declassified documents reveal truth about mysterious event`
    );

    // Future topics
    keywords.push(
      `10 predictions about 2030 that experts agree on`,
      `The job that will be most valuable in ${currentYear + 10}`,
      `Why futurists think this decade changes everything`,
      `The technology that makes aging optional by 2040`,
      `Countries racing to build first city on Mars`
    );

    // Lifestyle topics
    keywords.push(
      `The morning routine of highly successful people revealed`,
      `Why minimalism is evolving into something unexpected`,
      `The productivity hack that Silicon Valley doesn't want you to know`,
      `How remote work is creating new type of inequality`,
      `The lifestyle trend that's actually backed by science`
    );

    return keywords;
  }

  /**
   * Create article ideas from long-tail keywords
   */
  generateArticleIdeas(keyword) {
    const ideas = [];
    
    // Extract key elements
    const hasNumber = keyword.match(/\d+/);
    const hasLocation = keyword.match(/\b(Egypt|Rome|Viking|Mars|Silicon Valley|Nordic)\b/i);
    const hasTimeframe = keyword.match(/\b(2025|2030|2040|century|decade|year)\b/i);
    
    // Generate variations
    ideas.push({
      title: keyword,
      angle: 'discovery',
      category: this.categorizeKeyword(keyword),
      hooks: [
        `What scientists found will shock you`,
        `The implications are staggering`,
        `This changes everything we thought we knew`,
        `Experts are calling it revolutionary`
      ],
      imagePrompt: this.generateImagePrompt(keyword)
    });

    return ideas;
  }

  /**
   * Categorize keyword into appropriate content category
   */
  categorizeKeyword(keyword) {
    const lowerKeyword = keyword.toLowerCase();
    
    if (lowerKeyword.includes('quantum') || lowerKeyword.includes('space') || lowerKeyword.includes('scientist')) {
      return 'science';
    } else if (lowerKeyword.includes('psychology') || lowerKeyword.includes('personality') || lowerKeyword.includes('cognitive')) {
      return 'psychology';
    } else if (lowerKeyword.includes('health') || lowerKeyword.includes('diet') || lowerKeyword.includes('wellness')) {
      return 'health';
    } else if (lowerKeyword.includes('ai') || lowerKeyword.includes('tech') || lowerKeyword.includes('digital')) {
      return 'technology';
    } else if (lowerKeyword.includes('gen') || lowerKeyword.includes('cultural') || lowerKeyword.includes('social')) {
      return 'culture';
    } else if (lowerKeyword.includes('climate') || lowerKeyword.includes('ocean') || lowerKeyword.includes('renewable')) {
      return 'environment';
    } else if (lowerKeyword.includes('ancient') || lowerKeyword.includes('viking') || lowerKeyword.includes('medieval')) {
      return 'history';
    } else if (lowerKeyword.includes('mystery') || lowerKeyword.includes('unexplained') || lowerKeyword.includes('phenomenon')) {
      return 'mystery';
    } else if (lowerKeyword.includes('future') || lowerKeyword.includes('2030') || lowerKeyword.includes('prediction')) {
      return 'future';
    } else {
      return 'lifestyle';
    }
  }

  /**
   * Generate AI image prompt for article
   */
  generateImagePrompt(keyword) {
    const category = this.categorizeKeyword(keyword);
    const basePrompt = categories.imagePromptTemplates[category] || categories.imagePromptTemplates.technology;
    
    // Add specific elements based on keyword
    let specificElements = '';
    
    if (keyword.includes('space') || keyword.includes('planet')) {
      specificElements = ', cosmic vista, distant galaxies, celestial bodies';
    } else if (keyword.includes('ancient') || keyword.includes('archaeological')) {
      specificElements = ', ancient ruins, weathered stone, mysterious artifacts';
    } else if (keyword.includes('quantum')) {
      specificElements = ', quantum particles, wave functions, subatomic visualization';
    } else if (keyword.includes('brain') || keyword.includes('mind')) {
      specificElements = ', neural networks, synaptic connections, consciousness waves';
    } else if (keyword.includes('ocean') || keyword.includes('marine')) {
      specificElements = ', underwater scene, bioluminescence, deep sea mystery';
    }
    
    return `${basePrompt}${specificElements}, ultra detailed, trending on artstation, 8k resolution`;
  }

  /**
   * Discover trending topics for content generation
   */
  async discoverTrendingTopics() {
    console.log('🔍 Discovering trending topics across all categories...\n');
    
    const keywords = this.generateLongTailKeywords();
    const articleIdeas = [];
    
    for (const keyword of keywords) {
      const ideas = this.generateArticleIdeas(keyword);
      articleIdeas.push(...ideas);
    }
    
    // Group by category
    const categorizedIdeas = {};
    for (const idea of articleIdeas) {
      if (!categorizedIdeas[idea.category]) {
        categorizedIdeas[idea.category] = [];
      }
      categorizedIdeas[idea.category].push(idea);
    }
    
    // Display results
    console.log('📊 Trending Topics by Category:\n');
    for (const [category, ideas] of Object.entries(categorizedIdeas)) {
      console.log(`\n📁 ${category.toUpperCase()} (${ideas.length} topics)`);
      ideas.slice(0, 3).forEach(idea => {
        console.log(`   • ${idea.title}`);
      });
    }
    
    // Save to file for content generation
    const fs = require('fs').promises;
    const output = {
      generated: new Date().toISOString(),
      totalTopics: articleIdeas.length,
      categories: categorizedIdeas,
      topPicks: this.selectTopPicks(articleIdeas)
    };
    
    await fs.writeFile(
      'trending-topics.json',
      JSON.stringify(output, null, 2)
    );
    
    console.log(`\n✅ Generated ${articleIdeas.length} trending topic ideas`);
    console.log('📄 Saved to trending-topics.json');
    
    return output;
  }

  /**
   * Select top picks for immediate content generation
   */
  selectTopPicks(ideas) {
    // Select diverse mix of topics
    const picks = [];
    const categories = [...new Set(ideas.map(i => i.category))];
    
    for (const category of categories) {
      const categoryIdeas = ideas.filter(i => i.category === category);
      if (categoryIdeas.length > 0) {
        picks.push(categoryIdeas[0]);
      }
    }
    
    return picks.slice(0, 15); // Top 15 for daily batch
  }
}

// Run discovery
if (require.main === module) {
  const discovery = new TrendingTopicsDiscovery();
  discovery.discoverTrendingTopics().catch(console.error);
}

module.exports = TrendingTopicsDiscovery;