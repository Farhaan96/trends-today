#!/usr/bin/env node

/**
 * Smart Author Assignment System for Trends Today
 * Automatically assigns appropriate authors based on category and topic
 * Updates author article counts in authors.json
 */

const fs = require('fs').promises;
const path = require('path');

class AuthorAssignmentSystem {
  constructor() {
    this.authorsPath = path.join(__dirname, '..', 'data', 'authors.json');

    // Author expertise mapping based on their bios and specializations
    this.authorExpertise = {
      'Alex Chen': {
        categories: ['technology', 'culture'], // Tech + AI/culture intersection
        keywords: ['ai', 'artificial intelligence', 'mobile', 'smartphone', 'app', 'tech', 'innovation', 'startup', 'quantum', 'computing', 'silicon valley', 'venture capital', 'art', 'creativity', 'digital culture'],
        bio: 'Senior Mobile Technology Editor - AI, mobile tech, quantum computing'
      },
      'Sarah Martinez': {
        categories: ['science', 'culture', 'space', 'psychology'], // Audio/science crossover + diverse interests
        keywords: ['audio', 'music', 'sound', 'science', 'research', 'study', 'discovery', 'space', 'nasa', 'astronomy', 'culture', 'social', 'creator economy', 'content', 'media', 'psychology', 'brain', 'behavior'],
        bio: 'Audio & Gaming Technology Editor - Science, space, culture, psychology'
      },
      'David Kim': {
        categories: ['technology', 'health', 'space', 'science'], // Enterprise tech + technical health/space
        keywords: ['enterprise', 'business', 'productivity', 'laptop', 'computing', 'data', 'health tech', 'medical', 'ai', 'precision medicine', 'space technology', 'mars', 'rocket', 'satellite', 'crispr', 'genetics', 'biotech', 'superconductor', 'materials'],
        bio: 'Computing & Enterprise Technology Editor - Health tech, space tech, advanced computing'
      },
      'Emma Thompson': {
        categories: ['psychology', 'health', 'culture', 'technology'], // IoT/smart home + mental health + culture
        keywords: ['iot', 'smart home', 'connected', 'automation', 'psychology', 'mental health', 'behavior', 'cognitive', 'neuroscience', 'wellness', 'therapy', 'mindfulness', 'culture', 'neurodivergent', 'accessibility', 'privacy', 'security'],
        bio: 'Smart Home & IoT Technology Editor - Psychology, mental health, connected systems'
      }
    };
  }

  /**
   * Assign the most appropriate author based on category and content
   */
  assignAuthor(category, title, description = '', tags = []) {
    const content = `${title} ${description} ${tags.join(' ')}`.toLowerCase();

    let bestMatch = null;
    let highestScore = 0;

    for (const [authorName, expertise] of Object.entries(this.authorExpertise)) {
      let score = 0;

      // Category match (high weight)
      if (expertise.categories.includes(category)) {
        score += 10;
      }

      // Keyword matching
      for (const keyword of expertise.keywords) {
        if (content.includes(keyword)) {
          score += 2;
        }
      }

      // Additional category bonus for primary expertise
      if (this.isPrimaryCategory(authorName, category)) {
        score += 5;
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = authorName;
      }
    }

    // Fallback to round-robin if no good match
    if (!bestMatch || highestScore < 5) {
      bestMatch = this.getRoundRobinAuthor(category);
    }

    return bestMatch;
  }

  /**
   * Check if category is primary expertise for author
   */
  isPrimaryCategory(authorName, category) {
    const primaryCategories = {
      'Alex Chen': ['technology'],
      'Sarah Martinez': ['science', 'culture'],
      'David Kim': ['health', 'space'],
      'Emma Thompson': ['psychology']
    };

    return primaryCategories[authorName]?.includes(category) || false;
  }

  /**
   * Round-robin assignment by category
   */
  getRoundRobinAuthor(category) {
    const categoryDefaults = {
      'technology': 'Alex Chen',
      'science': 'Sarah Martinez',
      'culture': 'Sarah Martinez',
      'space': 'David Kim',
      'health': 'David Kim',
      'psychology': 'Emma Thompson'
    };

    return categoryDefaults[category] || 'Alex Chen';
  }

  /**
   * Update article count for an author
   */
  async updateAuthorCount(authorName, increment = 1) {
    try {
      const authorsData = JSON.parse(await fs.readFile(this.authorsPath, 'utf-8'));

      // Find author by name
      for (const [authorId, authorData] of Object.entries(authorsData)) {
        if (authorData.name === authorName) {
          authorData.reviewCount = (authorData.reviewCount || 0) + increment;

          // Write back to file
          await fs.writeFile(this.authorsPath, JSON.stringify(authorsData, null, 2));

          console.log(`✅ Updated ${authorName}: ${authorData.reviewCount} articles`);
          return authorData.reviewCount;
        }
      }

      console.warn(`⚠️  Author not found: ${authorName}`);
      return 0;
    } catch (error) {
      console.error(`❌ Error updating author count: ${error.message}`);
      return 0;
    }
  }

  /**
   * Get current article count for an author
   */
  async getAuthorCount(authorName) {
    try {
      const authorsData = JSON.parse(await fs.readFile(this.authorsPath, 'utf-8'));

      for (const [authorId, authorData] of Object.entries(authorsData)) {
        if (authorData.name === authorName) {
          return authorData.reviewCount || 0;
        }
      }

      return 0;
    } catch (error) {
      console.error(`❌ Error getting author count: ${error.message}`);
      return 0;
    }
  }

  /**
   * Get all authors with their current counts
   */
  async getAllAuthorCounts() {
    try {
      const authorsData = JSON.parse(await fs.readFile(this.authorsPath, 'utf-8'));
      const counts = {};

      for (const [authorId, authorData] of Object.entries(authorsData)) {
        counts[authorData.name] = authorData.reviewCount || 0;
      }

      return counts;
    } catch (error) {
      console.error(`❌ Error getting all author counts: ${error.message}`);
      return {};
    }
  }

  /**
   * Assign author and update count in one operation
   */
  async assignAndUpdateAuthor(category, title, description = '', tags = []) {
    const assignedAuthor = this.assignAuthor(category, title, description, tags);
    await this.updateAuthorCount(assignedAuthor, 1);

    console.log(`📝 Assigned "${title}" to ${assignedAuthor}`);
    return assignedAuthor;
  }
}

// CLI Usage
if (require.main === module) {
  const authorSystem = new AuthorAssignmentSystem();

  const args = process.argv.slice(2);

  if (args[0] === 'assign') {
    // node author-assignment.js assign "technology" "AI breakthrough" "description" "ai,tech"
    const [_, category, title, description, tags] = args;
    const tagArray = tags ? tags.split(',') : [];

    authorSystem.assignAndUpdateAuthor(category, title, description, tagArray)
      .then(author => {
        console.log(`Assigned author: ${author}`);
      });
  } else if (args[0] === 'counts') {
    // node author-assignment.js counts
    authorSystem.getAllAuthorCounts()
      .then(counts => {
        console.log('Current author article counts:');
        for (const [author, count] of Object.entries(counts)) {
          console.log(`  ${author}: ${count} articles`);
        }
      });
  } else {
    console.log(`
Usage:
  node author-assignment.js assign "category" "title" "description" "tag1,tag2"
  node author-assignment.js counts
    `);
  }
}

module.exports = AuthorAssignmentSystem;