#!/usr/bin/env node

/**
 * Readability Scorer v1.0
 * Analyzes content readability using multiple metrics
 * Provides actionable suggestions for improving content clarity
 */

const fs = require('fs');
const path = require('path');

class ReadabilityScorer {
  constructor() {
    // Common words that don't affect readability
    this.commonWords = new Set([
      'the',
      'be',
      'to',
      'of',
      'and',
      'a',
      'in',
      'that',
      'have',
      'i',
      'it',
      'for',
      'not',
      'on',
      'with',
      'he',
      'as',
      'you',
      'do',
      'at',
      'this',
      'but',
      'his',
      'by',
      'from',
      'they',
      'we',
      'say',
      'her',
      'she',
      'or',
      'an',
      'will',
      'my',
      'one',
      'all',
      'would',
      'there',
      'their',
      'what',
      'so',
      'up',
      'out',
      'if',
      'about',
      'who',
      'get',
      'which',
      'go',
      'me',
      'when',
    ]);

    // Complex word patterns (3+ syllables)
    this.complexWordPatterns = [
      /[a-z]{10,}/i, // Long words tend to be complex
      /tion$/, // Words ending in -tion
      /sion$/, // Words ending in -sion
      /ment$/, // Words ending in -ment
      /ence$/, // Words ending in -ence
      /ance$/, // Words ending in -ance
      /ity$/, // Words ending in -ity
      /ology$/, // Words ending in -ology
      /ography$/, // Words ending in -ography
    ];

    // Transition words that improve flow
    this.transitionWords = {
      addition: [
        'furthermore',
        'moreover',
        'additionally',
        'also',
        'besides',
        'plus',
      ],
      contrast: [
        'however',
        'nevertheless',
        'nonetheless',
        'conversely',
        'although',
        'yet',
      ],
      cause: ['because', 'since', 'therefore', 'thus', 'consequently', 'hence'],
      sequence: ['first', 'second', 'next', 'then', 'finally', 'subsequently'],
      example: [
        'for example',
        'for instance',
        'specifically',
        'namely',
        'particularly',
      ],
      conclusion: [
        'in conclusion',
        'ultimately',
        'overall',
        'in summary',
        'to sum up',
      ],
    };

    // Technical jargon by category
    this.technicalTerms = {
      technology: [
        'algorithm',
        'API',
        'framework',
        'infrastructure',
        'implementation',
        'architecture',
      ],
      health: [
        'pathophysiology',
        'pharmacokinetics',
        'contraindications',
        'comorbidity',
        'etiology',
      ],
      science: [
        'hypothesis',
        'methodology',
        'quantitative',
        'correlation',
        'empirical',
        'theoretical',
      ],
      psychology: [
        'cognitive',
        'behavioral',
        'neurotransmitter',
        'psychometric',
        'psychosocial',
      ],
      space: [
        'trajectory',
        'propulsion',
        'telemetry',
        'orbital',
        'astronomical',
        'cosmological',
      ],
    };
  }

  /**
   * Analyze content readability
   */
  analyzeReadability(content, metadata = {}) {
    const text = this.extractText(content);

    const analysis = {
      // Basic metrics
      wordCount: 0,
      sentenceCount: 0,
      paragraphCount: 0,
      avgWordsPerSentence: 0,
      avgSyllablesPerWord: 0,

      // Readability scores
      fleschReadingEase: 0,
      fleschKincaidGrade: 0,
      gunningFog: 0,
      smogIndex: 0,
      automatedReadabilityIndex: 0,
      colemanLiauIndex: 0,

      // Detailed analysis
      complexWordCount: 0,
      complexWordPercentage: 0,
      longSentenceCount: 0,
      veryLongSentenceCount: 0,
      shortSentenceCount: 0,
      passiveVoiceCount: 0,
      adverbCount: 0,

      // Content quality
      transitionWordUsage: 0,
      sentenceVariation: 0,
      paragraphStructure: '',
      vocabularyDiversity: 0,

      // Category-specific
      technicalDensity: 0,

      // Overall assessment
      readabilityLevel: '',
      targetAudience: '',
      recommendations: [],
    };

    // Calculate basic metrics
    const sentences = this.extractSentences(text);
    const words = this.extractWords(text);
    const paragraphs = this.extractParagraphs(text);

    analysis.wordCount = words.length;
    analysis.sentenceCount = sentences.length;
    analysis.paragraphCount = paragraphs.length;
    analysis.avgWordsPerSentence = words.length / Math.max(sentences.length, 1);

    // Calculate syllables
    const totalSyllables = words.reduce(
      (sum, word) => sum + this.countSyllables(word),
      0
    );
    analysis.avgSyllablesPerWord = totalSyllables / Math.max(words.length, 1);

    // Count complex words
    const complexWords = words.filter((word) => this.isComplexWord(word));
    analysis.complexWordCount = complexWords.length;
    analysis.complexWordPercentage =
      (complexWords.length / Math.max(words.length, 1)) * 100;

    // Analyze sentence lengths
    sentences.forEach((sentence) => {
      const wordCount = sentence.split(/\s+/).length;
      if (wordCount > 30) analysis.veryLongSentenceCount++;
      else if (wordCount > 20) analysis.longSentenceCount++;
      else if (wordCount < 8) analysis.shortSentenceCount++;
    });

    // Calculate readability scores
    analysis.fleschReadingEase = this.calculateFleschReadingEase(
      analysis.avgWordsPerSentence,
      analysis.avgSyllablesPerWord
    );

    analysis.fleschKincaidGrade = this.calculateFleschKincaidGrade(
      analysis.avgWordsPerSentence,
      analysis.avgSyllablesPerWord
    );

    analysis.gunningFog = this.calculateGunningFog(
      analysis.avgWordsPerSentence,
      analysis.complexWordPercentage
    );

    analysis.smogIndex = this.calculateSmogIndex(
      analysis.complexWordCount,
      analysis.sentenceCount
    );

    analysis.automatedReadabilityIndex = this.calculateARI(
      text,
      words.length,
      sentences.length
    );

    analysis.colemanLiauIndex = this.calculateColemanLiau(
      text,
      words.length,
      sentences.length
    );

    // Analyze content quality
    analysis.passiveVoiceCount = this.countPassiveVoice(sentences);
    analysis.adverbCount = this.countAdverbs(words);
    analysis.transitionWordUsage = this.analyzeTransitionWords(text);
    analysis.sentenceVariation = this.analyzeSentenceVariation(sentences);
    analysis.paragraphStructure = this.analyzeParagraphStructure(paragraphs);
    analysis.vocabularyDiversity = this.calculateVocabularyDiversity(words);

    // Category-specific analysis
    if (metadata.category) {
      analysis.technicalDensity = this.calculateTechnicalDensity(
        words,
        metadata.category
      );
    }

    // Determine readability level
    analysis.readabilityLevel = this.determineReadabilityLevel(
      analysis.fleschReadingEase
    );
    analysis.targetAudience = this.determineTargetAudience(
      analysis.fleschKincaidGrade
    );

    // Generate recommendations
    analysis.recommendations = this.generateRecommendations(analysis);

    return analysis;
  }

  /**
   * Extract clean text from MDX content
   */
  extractText(content) {
    // Remove frontmatter
    let text = content.replace(/^---[\s\S]+?---/, '');

    // Remove MDX components
    text = text.replace(/<[^>]+>/g, '');

    // Remove markdown formatting
    text = text.replace(/#{1,6}\s/g, '');
    text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
    text = text.replace(/\*([^*]+)\*/g, '$1');
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    text = text.replace(/```[\s\S]+?```/g, '');
    text = text.replace(/`([^`]+)`/g, '$1');
    text = text.replace(/^>\s/gm, '');
    text = text.replace(/^[-*+]\s/gm, '');

    return text.trim();
  }

  /**
   * Extract sentences from text
   */
  extractSentences(text) {
    // Split by sentence terminators
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    return sentences.map((s) => s.trim()).filter((s) => s.length > 0);
  }

  /**
   * Extract words from text
   */
  extractWords(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 0);
  }

  /**
   * Extract paragraphs from text
   */
  extractParagraphs(text) {
    return text
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }

  /**
   * Count syllables in a word (approximation)
   */
  countSyllables(word) {
    word = word.toLowerCase();
    let count = 0;
    let previousWasVowel = false;

    for (let i = 0; i < word.length; i++) {
      const isVowel = 'aeiouy'.includes(word[i]);
      if (isVowel && !previousWasVowel) {
        count++;
      }
      previousWasVowel = isVowel;
    }

    // Adjustments
    if (word.endsWith('e')) count--;
    if (word.endsWith('le') && word.length > 2) count++;
    if (count === 0) count = 1;

    return count;
  }

  /**
   * Check if word is complex (3+ syllables)
   */
  isComplexWord(word) {
    // Skip common words
    if (this.commonWords.has(word.toLowerCase())) return false;

    // Check syllable count
    const syllables = this.countSyllables(word);
    if (syllables >= 3) return true;

    // Check patterns
    return this.complexWordPatterns.some((pattern) => pattern.test(word));
  }

  /**
   * Calculate Flesch Reading Ease
   */
  calculateFleschReadingEase(avgWordsPerSentence, avgSyllablesPerWord) {
    return Math.max(
      0,
      Math.min(
        100,
        206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord
      )
    );
  }

  /**
   * Calculate Flesch-Kincaid Grade Level
   */
  calculateFleschKincaidGrade(avgWordsPerSentence, avgSyllablesPerWord) {
    return Math.max(
      0,
      0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59
    );
  }

  /**
   * Calculate Gunning Fog Index
   */
  calculateGunningFog(avgWordsPerSentence, complexWordPercentage) {
    return 0.4 * (avgWordsPerSentence + complexWordPercentage);
  }

  /**
   * Calculate SMOG Index
   */
  calculateSmogIndex(complexWordCount, sentenceCount) {
    if (sentenceCount < 30) {
      // Use simplified SMOG for short texts
      return Math.sqrt(complexWordCount * (30 / sentenceCount)) + 3;
    }
    return 1.043 * Math.sqrt(complexWordCount * (30 / sentenceCount)) + 3.1291;
  }

  /**
   * Calculate Automated Readability Index
   */
  calculateARI(text, wordCount, sentenceCount) {
    const characters = text.replace(/[^\w]/g, '').length;
    const avgCharsPerWord = characters / Math.max(wordCount, 1);
    const avgWordsPerSentence = wordCount / Math.max(sentenceCount, 1);

    return 4.71 * avgCharsPerWord + 0.5 * avgWordsPerSentence - 21.43;
  }

  /**
   * Calculate Coleman-Liau Index
   */
  calculateColemanLiau(text, wordCount, sentenceCount) {
    const characters = text.replace(/[^\w]/g, '').length;
    const L = (characters / wordCount) * 100; // Average letters per 100 words
    const S = (sentenceCount / wordCount) * 100; // Average sentences per 100 words

    return 0.0588 * L - 0.296 * S - 15.8;
  }

  /**
   * Count passive voice constructions
   */
  countPassiveVoice(sentences) {
    let count = 0;
    const passivePatterns = [
      /\b(is|are|was|were|been|being)\s+\w+ed\b/,
      /\b(is|are|was|were|been|being)\s+\w+en\b/,
      /\b(get|gets|got|gotten)\s+\w+ed\b/,
    ];

    sentences.forEach((sentence) => {
      if (
        passivePatterns.some((pattern) => pattern.test(sentence.toLowerCase()))
      ) {
        count++;
      }
    });

    return count;
  }

  /**
   * Count adverbs
   */
  countAdverbs(words) {
    return words.filter((word) => word.endsWith('ly') && word.length > 4)
      .length;
  }

  /**
   * Analyze transition word usage
   */
  analyzeTransitionWords(text) {
    const textLower = text.toLowerCase();
    let transitionCount = 0;

    Object.values(this.transitionWords)
      .flat()
      .forEach((transition) => {
        if (textLower.includes(transition)) {
          transitionCount++;
        }
      });

    return transitionCount;
  }

  /**
   * Analyze sentence variation
   */
  analyzeSentenceVariation(sentences) {
    if (sentences.length < 2) return 0;

    const lengths = sentences.map((s) => s.split(/\s+/).length);
    const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance =
      lengths.reduce((sum, len) => sum + Math.pow(len - avg, 2), 0) /
      lengths.length;
    const stdDev = Math.sqrt(variance);

    // Good variation is around 5-10 words standard deviation
    if (stdDev >= 5 && stdDev <= 10) return 100;
    if (stdDev < 5) return stdDev * 20;
    return Math.max(0, 100 - (stdDev - 10) * 5);
  }

  /**
   * Analyze paragraph structure
   */
  analyzeParagraphStructure(paragraphs) {
    const lengths = paragraphs.map((p) => p.split(/\s+/).length);
    const avg =
      lengths.reduce((a, b) => a + b, 0) / Math.max(lengths.length, 1);

    if (avg < 30) return 'Too short';
    if (avg > 150) return 'Too long';
    if (avg >= 50 && avg <= 100) return 'Optimal';
    return 'Acceptable';
  }

  /**
   * Calculate vocabulary diversity
   */
  calculateVocabularyDiversity(words) {
    const uniqueWords = new Set(words);
    return (uniqueWords.size / words.length) * 100;
  }

  /**
   * Calculate technical density
   */
  calculateTechnicalDensity(words, category) {
    if (!this.technicalTerms[category]) return 0;

    const technicalWords = words.filter((word) =>
      this.technicalTerms[category].some(
        (term) => term.toLowerCase() === word.toLowerCase()
      )
    );

    return (technicalWords.length / words.length) * 100;
  }

  /**
   * Determine readability level
   */
  determineReadabilityLevel(fleschScore) {
    if (fleschScore >= 90) return 'Very Easy';
    if (fleschScore >= 80) return 'Easy';
    if (fleschScore >= 70) return 'Fairly Easy';
    if (fleschScore >= 60) return 'Standard';
    if (fleschScore >= 50) return 'Fairly Difficult';
    if (fleschScore >= 30) return 'Difficult';
    return 'Very Difficult';
  }

  /**
   * Determine target audience
   */
  determineTargetAudience(gradeLevel) {
    if (gradeLevel <= 6) return 'Elementary School';
    if (gradeLevel <= 8) return 'Middle School';
    if (gradeLevel <= 12) return 'High School';
    if (gradeLevel <= 16) return 'College';
    return 'Graduate/Professional';
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(analysis) {
    const recommendations = [];

    // Sentence length issues
    if (analysis.avgWordsPerSentence > 20) {
      recommendations.push('Break up long sentences for better readability');
    }
    if (analysis.veryLongSentenceCount > 2) {
      recommendations.push(
        `${analysis.veryLongSentenceCount} sentences are over 30 words - consider splitting them`
      );
    }
    if (analysis.shortSentenceCount > analysis.sentenceCount * 0.5) {
      recommendations.push('Combine some short sentences for better flow');
    }

    // Complex word usage
    if (analysis.complexWordPercentage > 20) {
      recommendations.push('Simplify vocabulary - too many complex words');
    }

    // Passive voice
    if (analysis.passiveVoiceCount > analysis.sentenceCount * 0.2) {
      recommendations.push(
        'Reduce passive voice usage for more engaging writing'
      );
    }

    // Adverbs
    if (analysis.adverbCount > analysis.wordCount * 0.03) {
      recommendations.push('Consider removing unnecessary adverbs');
    }

    // Transitions
    if (analysis.transitionWordUsage < 3) {
      recommendations.push(
        'Add transition words to improve flow between ideas'
      );
    }

    // Sentence variation
    if (analysis.sentenceVariation < 50) {
      recommendations.push('Vary sentence lengths for better rhythm');
    }

    // Paragraph structure
    if (analysis.paragraphStructure === 'Too long') {
      recommendations.push('Break up long paragraphs for better scannability');
    }
    if (analysis.paragraphStructure === 'Too short') {
      recommendations.push('Develop paragraphs more fully');
    }

    // Grade level
    if (analysis.fleschKincaidGrade > 12) {
      recommendations.push('Content may be too complex for general audience');
    }
    if (analysis.fleschKincaidGrade < 6) {
      recommendations.push('Content may be too simple - consider adding depth');
    }

    // Technical density
    if (analysis.technicalDensity > 10) {
      recommendations.push(
        'High technical term density - consider adding explanations'
      );
    }

    // Vocabulary diversity
    if (analysis.vocabularyDiversity < 40) {
      recommendations.push(
        'Low vocabulary diversity - avoid repetitive word usage'
      );
    }

    return recommendations;
  }

  /**
   * Analyze file
   */
  analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');

      // Extract metadata
      const metadata = {};
      const categoryMatch = content.match(/^category:\s*(.+)$/m);
      if (categoryMatch) metadata.category = categoryMatch[1];

      return this.analyzeReadability(content, metadata);
    } catch (error) {
      throw new Error(`Error analyzing file: ${error.message}`);
    }
  }

  /**
   * Format score for display
   */
  formatScore(score, decimals = 1) {
    return score.toFixed(decimals);
  }

  /**
   * Get score interpretation
   */
  getScoreInterpretation(analysis) {
    const interpretations = [];

    // Flesch Reading Ease
    interpretations.push({
      metric: 'Flesch Reading Ease',
      score: analysis.fleschReadingEase,
      interpretation: analysis.readabilityLevel,
      ideal: '60-70',
      status:
        analysis.fleschReadingEase >= 60 && analysis.fleschReadingEase <= 70
          ? '✅'
          : '⚠️',
    });

    // Grade Level
    interpretations.push({
      metric: 'Grade Level',
      score: analysis.fleschKincaidGrade,
      interpretation: analysis.targetAudience,
      ideal: '8-10',
      status:
        analysis.fleschKincaidGrade >= 8 && analysis.fleschKincaidGrade <= 10
          ? '✅'
          : '⚠️',
    });

    return interpretations;
  }
}

// CLI Interface
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const scorer = new ReadabilityScorer();

  if (command === 'check' && args[1]) {
    const filePath = args[1];

    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      process.exit(1);
    }

    try {
      const analysis = scorer.analyzeFile(filePath);

      console.log('\n📊 READABILITY ANALYSIS\n' + '='.repeat(50));

      console.log('\n📈 Readability Scores:');
      console.log(
        `  • Flesch Reading Ease: ${scorer.formatScore(analysis.fleschReadingEase)}/100 (${analysis.readabilityLevel})`
      );
      console.log(
        `  • Flesch-Kincaid Grade: ${scorer.formatScore(analysis.fleschKincaidGrade)} (${analysis.targetAudience})`
      );
      console.log(
        `  • Gunning Fog: ${scorer.formatScore(analysis.gunningFog)}`
      );
      console.log(`  • SMOG Index: ${scorer.formatScore(analysis.smogIndex)}`);
      console.log(
        `  • Coleman-Liau: ${scorer.formatScore(analysis.colemanLiauIndex)}`
      );
      console.log(
        `  • ARI: ${scorer.formatScore(analysis.automatedReadabilityIndex)}`
      );

      console.log('\n📝 Content Metrics:');
      console.log(`  • Words: ${analysis.wordCount}`);
      console.log(`  • Sentences: ${analysis.sentenceCount}`);
      console.log(`  • Paragraphs: ${analysis.paragraphCount}`);
      console.log(
        `  • Avg Words/Sentence: ${scorer.formatScore(analysis.avgWordsPerSentence)}`
      );
      console.log(
        `  • Avg Syllables/Word: ${scorer.formatScore(analysis.avgSyllablesPerWord)}`
      );

      console.log('\n🔍 Detailed Analysis:');
      console.log(
        `  • Complex Words: ${analysis.complexWordCount} (${scorer.formatScore(analysis.complexWordPercentage)}%)`
      );
      console.log(
        `  • Very Long Sentences (30+ words): ${analysis.veryLongSentenceCount}`
      );
      console.log(
        `  • Long Sentences (20-30 words): ${analysis.longSentenceCount}`
      );
      console.log(
        `  • Short Sentences (<8 words): ${analysis.shortSentenceCount}`
      );
      console.log(`  • Passive Voice: ${analysis.passiveVoiceCount} sentences`);
      console.log(`  • Adverbs: ${analysis.adverbCount}`);

      console.log('\n✨ Quality Indicators:');
      console.log(`  • Transition Words: ${analysis.transitionWordUsage}`);
      console.log(
        `  • Sentence Variation: ${scorer.formatScore(analysis.sentenceVariation)}%`
      );
      console.log(`  • Paragraph Structure: ${analysis.paragraphStructure}`);
      console.log(
        `  • Vocabulary Diversity: ${scorer.formatScore(analysis.vocabularyDiversity)}%`
      );
      if (analysis.technicalDensity > 0) {
        console.log(
          `  • Technical Density: ${scorer.formatScore(analysis.technicalDensity)}%`
        );
      }

      if (analysis.recommendations.length > 0) {
        console.log('\n💡 Recommendations:');
        analysis.recommendations.forEach((rec) => {
          console.log(`  • ${rec}`);
        });
      } else {
        console.log('\n✅ Content readability is excellent!');
      }

      // Summary
      console.log('\n📋 Summary:');
      const interpretations = scorer.getScoreInterpretation(analysis);
      interpretations.forEach((interp) => {
        console.log(
          `  ${interp.status} ${interp.metric}: ${scorer.formatScore(interp.score)} - ${interp.interpretation} (ideal: ${interp.ideal})`
        );
      });
    } catch (error) {
      console.error(`Analysis failed: ${error.message}`);
      process.exit(1);
    }
  } else {
    console.log('Readability Scorer v1.0\n');
    console.log('Usage:');
    console.log('  node readability-scorer.js check <file.mdx>\n');
    console.log('Example:');
    console.log(
      '  node readability-scorer.js check content/technology/ai-article.mdx'
    );
    console.log('\nIdeal Scores:');
    console.log('  • Flesch Reading Ease: 60-70 (Standard)');
    console.log('  • Grade Level: 8-10 (High School)');
    console.log('  • Sentence Length: 15-20 words average');
  }
}

// Export for use as module
if (require.main === module) {
  main();
} else {
  module.exports = ReadabilityScorer;
}
