#!/usr/bin/env node

/**
 * Smart Topic Discovery System
 * Proactively finds unique topics by analyzing gaps in existing coverage
 *
 * Uses semantic analysis to:
 * 1. Identify what topics are already covered
 * 2. Find trending/emerging topics in target category
 * 3. Filter out semantically similar content
 * 4. Rank by uniqueness and potential
 * 5. Generate specific angles that differ from existing content
 *
 * Usage:
 *   node utils/smart-topic-discovery.js discover health 5
 *   node utils/smart-topic-discovery.js gaps technology
 *   node utils/smart-topic-discovery.js trending science
 */

const fs = require('fs');
const path = require('path');
const SemanticSimilarityChecker = require('./semantic-similarity-checker.js');
const ContentDiversityManager = require('./content-diversity-manager.js');

class SmartTopicDiscovery {
  constructor() {
    this.semanticChecker = new SemanticSimilarityChecker();
    this.diversityManager = new ContentDiversityManager();
    this.contentPath = path.join(__dirname, '..', 'content');

    // Curated emerging topics by category (updated for 2025)
    this.emergingTopics = {
      health: [
        'Bioelectric medicine replacing pharmaceuticals chronic pain',
        'Organ-on-chip technology drug testing personalized medicine',
        'Phage therapy antibiotic resistance superbug treatment',
        'Epigenetic clock reversal aging biomarkers longevity',
        'Vagus nerve stimulation autoimmune disease inflammation',
        'Nanotechnology targeted drug delivery cancer treatment',
        'Senolytic drugs clearing zombie cells anti-aging',
        'Brown fat activation obesity metabolic health',
        'Gut-brain axis manipulation depression anxiety microbiome',
        'Mitochondrial transplantation organ preservation revival',
        'CAR-NK cells next generation immunotherapy',
        'Exosome therapy regenerative medicine cell communication',
        'Optogenetics pain management neural control light',
        'Biosensor implants continuous health monitoring diagnostics',
        'Stem cell tooth regeneration dental medicine future',
      ],
      psychology: [
        'Digital phenotyping mental health smartphone passive monitoring',
        'Psychedelic integration therapy post-trip therapeutic framework',
        'Metacognition training improving thinking about thinking',
        'Collective intelligence group decision making emergent behavior',
        'Embodied cognition physical movement shapes thinking',
        'Predictive processing brain prediction machine perception',
        'Social contagion emotional viral spread networks',
        'Cognitive enhancement nootropics brain optimization ethics',
        'Temporal discounting delay gratification brain mechanisms',
        'Affective forecasting predicting future emotions happiness',
        'Choice architecture nudging behavior design ethics',
        'Stereotype threat performance anxiety identity pressure',
        'Flow state neuroscience peak performance triggers',
        'Episodic future thinking mental time travel planning',
        'Compassion fatigue burnout healthcare workers empathy',
      ],
      science: [
        'Programmable matter shape-shifting materials 4D printing',
        'Synthetic photosynthesis artificial chlorophyll energy capture',
        'Time crystals quantum phases matter perpetual motion',
        'Magnetoreception biological magnetic sense navigation',
        'Extremophile enzymes industrial applications harsh conditions',
        'Mycoremediation fungi cleaning pollution soil restoration',
        'Electroceuticals bioelectronic medicine nerve stimulation',
        'Sonoluminescence sound creating light bubble collapse',
        'Ferrofluid applications magnetic liquid technology',
        'Quantum biology photosynthesis bird navigation enzymes',
        'Bacterial computing living circuits biological processors',
        'Glass battery solid-state lithium breakthrough energy',
        'Atmospheric water harvesting desert hydration technology',
        'Perovskite solar cells efficiency breakthrough cost',
        'Direct air capture carbon removal climate technology',
      ],
      technology: [
        'Neuromorphic computing brain-inspired chips energy efficient',
        'Liquid neural networks continuous learning adaptable AI',
        'Swarm robotics collective behavior emergent intelligence',
        'Computational photography smartphone cameras AI enhancement',
        'Edge AI inference devices privacy local processing',
        'Quantum sensors ultra-precise measurement navigation',
        'Brain-computer interfaces non-invasive thought control',
        'Synthetic biology engineered organisms custom cells',
        'Molecular electronics single-molecule transistors computing',
        'Optical computing photonic processors light-speed calculations',
        'Reversible computing zero-energy information processing',
        'DNA data storage biological information archives',
        'Ambient computing invisible seamless integration',
        'Haptic holography touchable mid-air projections',
        'Electroadhesion controllable surface grip technology',
      ],
      space: [
        'Pulsar navigation GPS for deep space spacecraft',
        'Asteroid redirect missions planetary defense testing',
        'In-situ resource utilization Moon Mars local materials',
        'Space elevator carbon nanotube megastructure orbit',
        'Lagrange point colonies stable orbital habitats',
        'Magnetic sail propulsion interstellar travel concept',
        'Atmospheric mining gas giants helium-3 fusion',
        'Cosmic web mapping dark matter galaxy filaments',
        'Rogue planets detection orphan worlds interstellar',
        'Magnetosphere harvesting Earth radiation belt energy',
        'Orbital debris remediation space junk cleanup',
        'Solar gravitational lens telescope deep space imaging',
        'Nuclear pulse propulsion Project Orion spacecraft',
        'Space-based solar power orbital energy transmission',
        'Biosignature detection technosignatures alien search',
      ],
      culture: [
        'Solarpunk movement climate optimism sustainable futures',
        'Digital nomad cities remote work urban planning',
        'Decentralized social media federated networks ownership',
        'Neurodiversity workplace design autism-friendly offices',
        'Intergenerational housing shared living community models',
        'Right to disconnect work-life boundaries legislation',
        'Digital minimalism intentional technology use philosophy',
        'Creator burnout prevention sustainable content production',
        'Attention economy ethics engagement manipulation awareness',
        'Cultural algorithm preservation indigenous knowledge AI',
        'Virtual reality therapy exposure treatment PTSD',
        'Slow media movement quality over speed journalism',
        'Circular fashion economy rental resale sustainable',
        'Urban rewilding cities nature biodiversity integration',
        'Community land trusts affordable housing cooperative',
      ],
    };

    // Topic quality indicators
    this.qualityKeywords = {
      high: [
        'breakthrough',
        'discovery',
        'revolutionary',
        'unprecedented',
        'first-time',
        'milestone',
        'clinical-trial',
        'peer-reviewed',
        'published',
      ],
      medium: [
        'new',
        'emerging',
        'innovative',
        'advanced',
        'improved',
        'novel',
      ],
      low: ['might', 'could', 'speculative', 'theoretical', 'concept', 'idea'],
    };
  }

  /**
   * Analyze current coverage to understand what's already written
   */
  async analyzeCurrentCoverage(category) {
    const articles = this.semanticChecker.loadArticles(category);

    // Extract key concepts from existing articles
    const coverage = {
      totalArticles: articles.length,
      topics: articles.map((a) => ({
        title: a.title,
        description: a.description,
        primaryKeyword: a.primaryKeyword,
        file: a.file,
      })),
      keywords: new Set(),
      concepts: new Set(),
    };

    // Extract keywords and concepts
    articles.forEach((article) => {
      const text = `${article.title} ${article.description}`.toLowerCase();
      const words = text
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter((word) => word.length > 4);

      words.forEach((word) => coverage.keywords.add(word));

      if (article.primaryKeyword) {
        coverage.concepts.add(article.primaryKeyword.toLowerCase());
      }
    });

    return coverage;
  }

  /**
   * Get trending topics for category (curated list + diversity manager)
   */
  async getTrendingTopics(category) {
    const trending = [];

    // 1. Get curated emerging topics
    const emergingList = this.emergingTopics[category] || [];
    emergingList.forEach((topic) => {
      trending.push({
        title: topic,
        source: 'curated',
        quality: this.assessTopicQuality(topic),
      });
    });

    // 2. Get diverse queries from diversity manager
    const diverseQueries = this.diversityManager.generateDiverseQueries(
      category,
      10
    );
    diverseQueries.forEach((query) => {
      trending.push({
        title: query,
        source: 'diversity-manager',
        quality: 'medium',
      });
    });

    return trending;
  }

  /**
   * Filter out topics that are too similar to existing coverage
   */
  async filterUncovered(trendingTopics, existingCoverage) {
    const uncovered = [];

    for (const topic of trendingTopics) {
      const topicEmb = await this.semanticChecker.getEmbedding(topic.title);

      // Check semantic similarity against all existing articles
      let maxSimilarity = 0;
      let mostSimilarArticle = null;

      for (const existing of existingCoverage.topics) {
        const existingEmb = await this.semanticChecker.getEmbedding(
          `${existing.title} ${existing.description}`
        );
        const similarity = this.semanticChecker.cosineSimilarity(
          topicEmb,
          existingEmb
        );

        if (similarity > maxSimilarity) {
          maxSimilarity = similarity;
          mostSimilarArticle = existing.title;
        }
      }

      // Only include if < 70% similar to any existing article
      if (maxSimilarity < 0.7) {
        uncovered.push({
          ...topic,
          similarityToExisting: Math.round(maxSimilarity * 100),
          uniqueness: Math.round((1 - maxSimilarity) * 100),
          mostSimilarTo: mostSimilarArticle,
        });
      }
    }

    return uncovered;
  }

  /**
   * Rank topics by potential (uniqueness + quality)
   */
  async rankByPotential(uncoveredTopics) {
    return uncoveredTopics
      .map((topic) => {
        // Calculate potential score (0-100)
        let score = topic.uniqueness; // Base score from uniqueness (0-100)

        // Quality bonus
        if (topic.quality === 'high') score += 20;
        else if (topic.quality === 'medium') score += 10;

        // Diversity bonus (prefer topics with diverse keywords)
        const words = topic.title.split(/\s+/).length;
        score += Math.min(words * 2, 15);

        // Specificity bonus (topics with numbers, measurements)
        if (/\d+/.test(topic.title)) score += 10;

        return {
          ...topic,
          potentialScore: Math.min(Math.round(score), 100),
        };
      })
      .sort((a, b) => b.potentialScore - a.potentialScore);
  }

  /**
   * Generate 3 specific angles for each topic
   */
  async generateUniqueAngles(topics) {
    return topics.map((topic) => {
      const angles = this.generateAnglesForTopic(topic.title);

      return {
        ...topic,
        suggestedAngles: angles,
      };
    });
  }

  /**
   * Generate specific angles for a topic
   */
  generateAnglesForTopic(topicTitle) {
    const words = topicTitle.toLowerCase().split(/\s+/);

    const angleTemplates = [
      `How ${topicTitle} could change treatment approaches`,
      `Why ${topicTitle} matters for clinical practice`,
      `The science behind ${topicTitle} explained`,
      `Real-world applications of ${topicTitle}`,
      `Latest breakthrough in ${topicTitle}`,
      `Unexpected benefits of ${topicTitle} discovered`,
      `Challenges facing ${topicTitle} adoption`,
    ];

    // Select 3 most relevant angles
    const relevantAngles = angleTemplates.slice(0, 3).map((template, i) => {
      // Make more specific based on topic keywords
      if (words.includes('therapy') || words.includes('treatment')) {
        return i === 0
          ? `How ${topicTitle} transforms patient outcomes`
          : i === 1
            ? `${topicTitle}: From research to clinical practice`
            : `Breaking down the mechanisms of ${topicTitle}`;
      }

      if (words.includes('technology') || words.includes('computing')) {
        return i === 0
          ? `${topicTitle}: Practical applications emerging`
          : i === 1
            ? `Why ${topicTitle} solves long-standing challenges`
            : `The breakthrough that makes ${topicTitle} possible`;
      }

      return template;
    });

    return relevantAngles;
  }

  /**
   * Assess topic quality based on keywords
   */
  assessTopicQuality(topicText) {
    const lower = topicText.toLowerCase();

    if (this.qualityKeywords.high.some((kw) => lower.includes(kw))) {
      return 'high';
    }

    if (this.qualityKeywords.low.some((kw) => lower.includes(kw))) {
      return 'low';
    }

    return 'medium';
  }

  /**
   * Main discovery workflow
   */
  async discoverUniqueTopics(category, count = 5) {
    console.log(
      `\n🔍 SMART TOPIC DISCOVERY - ${category.toUpperCase()} CATEGORY\n`
    );
    console.log('─'.repeat(60));

    // 1. Analyze current coverage
    console.log('📊 Analyzing current coverage...');
    const coverage = await this.analyzeCurrentCoverage(category);
    console.log(`   Found ${coverage.totalArticles} existing articles`);

    // 2. Get trending topics
    console.log('\n🔥 Fetching trending topics...');
    const trending = await this.getTrendingTopics(category);
    console.log(`   Retrieved ${trending.length} potential topics`);

    // 3. Filter uncovered topics
    console.log('\n🎯 Filtering for unique opportunities...');
    const uncovered = await this.filterUncovered(trending, coverage);
    console.log(
      `   Found ${uncovered.length} unique topics (< 70% similarity)`
    );

    // 4. Rank by potential
    console.log('\n📈 Ranking by potential...');
    const ranked = await this.rankByPotential(uncovered);

    // 5. Generate angles
    console.log('\n💡 Generating specific angles...');
    const topicsWithAngles = await this.generateUniqueAngles(ranked);

    // 6. Return top N
    const topTopics = topicsWithAngles.slice(0, count);

    console.log('\n' + '─'.repeat(60));
    console.log(`\n✨ TOP ${count} UNIQUE TOPIC OPPORTUNITIES:\n`);

    topTopics.forEach((topic, i) => {
      console.log(`${i + 1}. ${topic.title}`);
      console.log(
        `   Uniqueness: ${topic.uniqueness}% | Quality: ${topic.quality} | Potential Score: ${topic.potentialScore}/100`
      );

      if (topic.mostSimilarTo) {
        console.log(
          `   Most similar to: "${topic.mostSimilarTo}" (${topic.similarityToExisting}%)`
        );
      }

      console.log(`   Suggested angles:`);
      topic.suggestedAngles.forEach((angle, j) => {
        console.log(`     ${String.fromCharCode(97 + j)}) ${angle}`);
      });
      console.log('');
    });

    return topTopics;
  }

  /**
   * Identify gaps in current coverage
   */
  async identifyGaps(category) {
    console.log(`\n🕳️  CONTENT GAP ANALYSIS - ${category.toUpperCase()}\n`);
    console.log('─'.repeat(60));

    const coverage = await this.analyzeCurrentCoverage(category);
    const allTopics = this.emergingTopics[category] || [];

    console.log(`\nExisting coverage: ${coverage.totalArticles} articles`);
    console.log(`\nKey concepts covered:`);
    Array.from(coverage.concepts)
      .slice(0, 15)
      .forEach((concept) => {
        console.log(`  • ${concept}`);
      });

    // Identify completely uncovered emerging topics
    console.log(`\n\n🎯 COMPLETELY UNCOVERED TOPICS:\n`);

    const gaps = [];
    for (const topic of allTopics) {
      const topicEmb = await this.semanticChecker.getEmbedding(topic);
      let maxSim = 0;

      for (const article of coverage.topics) {
        const articleEmb = await this.semanticChecker.getEmbedding(
          `${article.title} ${article.description}`
        );
        const sim = this.semanticChecker.cosineSimilarity(topicEmb, articleEmb);
        maxSim = Math.max(maxSim, sim);
      }

      if (maxSim < 0.5) {
        gaps.push({
          topic,
          similarity: Math.round(maxSim * 100),
        });
      }
    }

    gaps.sort((a, b) => a.similarity - b.similarity);

    gaps.slice(0, 10).forEach((gap, i) => {
      console.log(`${i + 1}. ${gap.topic}`);
      console.log(`   Coverage gap: ${100 - gap.similarity}%\n`);
    });

    return gaps;
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const discovery = new SmartTopicDiscovery();

  try {
    switch (command) {
      case 'discover': {
        const category = args[1];
        const count = parseInt(args[2]) || 5;

        if (!category) {
          console.error(
            '\nUsage: node smart-topic-discovery.js discover <category> [count]'
          );
          console.error(
            '\nCategories: science, technology, space, health, psychology, culture'
          );
          console.error('\nExample:');
          console.error('  node smart-topic-discovery.js discover health 5\n');
          process.exit(1);
        }

        await discovery.discoverUniqueTopics(category, count);
        break;
      }

      case 'gaps': {
        const category = args[1];

        if (!category) {
          console.error(
            '\nUsage: node smart-topic-discovery.js gaps <category>'
          );
          console.error(
            '\nCategories: science, technology, space, health, psychology, culture\n'
          );
          process.exit(1);
        }

        await discovery.identifyGaps(category);
        break;
      }

      case 'trending': {
        const category = args[1];

        if (!category) {
          console.error(
            '\nUsage: node smart-topic-discovery.js trending <category>\n'
          );
          process.exit(1);
        }

        const trending = await discovery.getTrendingTopics(category);
        console.log(`\n🔥 TRENDING TOPICS - ${category.toUpperCase()}\n`);
        trending.slice(0, 15).forEach((topic, i) => {
          console.log(`${i + 1}. ${topic.title} (${topic.quality} quality)`);
        });
        console.log('');
        break;
      }

      default:
        console.log(`
Smart Topic Discovery System - Proactive unique topic finder
──────────────────────────────────────────────────────────────

Automatically discovers unique topics by:
  1. Analyzing what's already covered (semantic analysis)
  2. Finding trending/emerging topics in category
  3. Filtering out similar content (< 70% semantic match)
  4. Ranking by uniqueness and quality
  5. Generating specific angles

Usage:
  node smart-topic-discovery.js discover <category> [count]
  node smart-topic-discovery.js gaps <category>
  node smart-topic-discovery.js trending <category>

Examples:
  node smart-topic-discovery.js discover health 5
  node smart-topic-discovery.js gaps technology
  node smart-topic-discovery.js trending science

Categories: science, technology, space, health, psychology, culture
        `);
        break;
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = SmartTopicDiscovery;
