/**
 * Ultra-Short Quality Validator
 * Validates articles against Ultra-Short, Highly Readable Content Strategy
 * Ensures 400-500 words, proper formatting, and engagement elements
 */

const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');

class UltraShortQualityValidator {
  constructor() {
    this.criteria = {
      wordCount: { min: 400, max: 500 },
      readingTime: 2,
      requiredElements: {
        boldText: 3,        // Minimum bold emphasis
        blockquotes: 2,     // Minimum expert quotes
        horizontalRules: 3, // Section separators
        bulletPoints: 1,    // At least one list
        internalLinks: 3    // 3-4 internal links
      },
      sectionCount: { min: 4, max: 5 },
      paragraphLength: { max: 3 } // Max sentences per paragraph
    };
  }

  /**
   * Validate a single article
   */
  async validateArticle(filePath) {
    console.log(`\n🔍 Validating: ${path.basename(filePath)}`);
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const { data: metadata, content: body } = matter(content);
      
      const validation = {
        filePath,
        passed: true,
        score: 100,
        issues: [],
        warnings: [],
        metrics: {}
      };
      
      // Run all validation checks
      this.validateWordCount(body, validation);
      this.validateReadingTime(metadata, validation);
      this.validateFormatting(body, validation);
      this.validateStructure(body, validation);
      this.validateSEO(metadata, validation);
      this.validateEngagement(body, validation);
      
      // Calculate final score
      validation.score = this.calculateScore(validation);
      validation.passed = validation.score >= 85;
      
      return validation;
      
    } catch (error) {
      return {
        filePath,
        passed: false,
        score: 0,
        error: error.message
      };
    }
  }

  /**
   * Validate word count (400-500 words)
   */
  validateWordCount(content, validation) {
    const words = content.split(/\s+/).filter(w => w.length > 0).length;
    validation.metrics.wordCount = words;
    
    if (words < this.criteria.wordCount.min) {
      validation.issues.push(`❌ Too short: ${words} words (minimum: ${this.criteria.wordCount.min})`);
      validation.score -= 20;
    } else if (words > this.criteria.wordCount.max) {
      validation.issues.push(`❌ Too long: ${words} words (maximum: ${this.criteria.wordCount.max})`);
      validation.score -= 15;
    } else {
      console.log(`  ✅ Word count: ${words} words`);
    }
  }

  /**
   * Validate reading time (must be 2 minutes)
   */
  validateReadingTime(metadata, validation) {
    if (!metadata.readingTime || metadata.readingTime !== this.criteria.readingTime) {
      validation.warnings.push(`⚠️ Reading time should be ${this.criteria.readingTime} minutes`);
      validation.score -= 5;
    } else {
      console.log(`  ✅ Reading time: ${metadata.readingTime} minutes`);
    }
  }

  /**
   * Validate typography and formatting
   */
  validateFormatting(content, validation) {
    // Check for bold text
    const boldMatches = content.match(/\*\*[^*]+\*\*/g) || [];
    validation.metrics.boldCount = boldMatches.length;
    
    if (boldMatches.length < this.criteria.requiredElements.boldText) {
      validation.issues.push(`❌ Insufficient bold emphasis: ${boldMatches.length} (minimum: ${this.criteria.requiredElements.boldText})`);
      validation.score -= 10;
    } else {
      console.log(`  ✅ Bold emphasis: ${boldMatches.length} instances`);
    }
    
    // Check for blockquotes
    const blockquoteMatches = content.match(/^>/gm) || [];
    validation.metrics.blockquoteCount = blockquoteMatches.length;
    
    if (blockquoteMatches.length < this.criteria.requiredElements.blockquotes) {
      validation.issues.push(`❌ Insufficient blockquotes: ${blockquoteMatches.length} (minimum: ${this.criteria.requiredElements.blockquotes})`);
      validation.score -= 10;
    } else {
      console.log(`  ✅ Blockquotes: ${blockquoteMatches.length} expert quotes`);
    }
    
    // Check for horizontal rules
    const hrMatches = content.match(/^---$/gm) || [];
    validation.metrics.horizontalRuleCount = hrMatches.length;
    
    if (hrMatches.length < this.criteria.requiredElements.horizontalRules) {
      validation.warnings.push(`⚠️ Few section separators: ${hrMatches.length} (recommended: ${this.criteria.requiredElements.horizontalRules})`);
      validation.score -= 5;
    } else {
      console.log(`  ✅ Section separators: ${hrMatches.length} horizontal rules`);
    }
    
    // Check for bullet points
    const bulletMatches = content.match(/^[*\-+]\s/gm) || [];
    validation.metrics.bulletCount = bulletMatches.length;
    
    if (bulletMatches.length < this.criteria.requiredElements.bulletPoints) {
      validation.warnings.push(`⚠️ No bullet points for easy scanning`);
      validation.score -= 5;
    } else {
      console.log(`  ✅ Bullet points: ${bulletMatches.length} lists`);
    }
  }

  /**
   * Validate article structure
   */
  validateStructure(content, validation) {
    // Check section count
    const sections = content.split(/^##\s/m).length - 1;
    validation.metrics.sectionCount = sections;
    
    if (sections < this.criteria.sectionCount.min || sections > this.criteria.sectionCount.max) {
      validation.warnings.push(`⚠️ Section count: ${sections} (recommended: ${this.criteria.sectionCount.min}-${this.criteria.sectionCount.max})`);
      validation.score -= 5;
    } else {
      console.log(`  ✅ Structure: ${sections} sections`);
    }
    
    // Check paragraph length
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
    let longParagraphs = 0;
    
    paragraphs.forEach(para => {
      const sentences = para.split(/[.!?]+/).filter(s => s.trim().length > 0);
      if (sentences.length > this.criteria.paragraphLength.max) {
        longParagraphs++;
      }
    });
    
    if (longParagraphs > 2) {
      validation.warnings.push(`⚠️ ${longParagraphs} paragraphs too long (max ${this.criteria.paragraphLength.max} sentences)`);
      validation.score -= 5;
    }
  }

  /**
   * Validate SEO elements
   */
  validateSEO(metadata, validation) {
    const seoChecks = [];
    
    if (!metadata.title || metadata.title.length < 30) {
      seoChecks.push('Title too short');
    }
    
    if (!metadata.description || metadata.description.length < 120) {
      seoChecks.push('Description too short');
    }
    
    if (!metadata.seo || !metadata.seo.keywords || metadata.seo.keywords.length < 3) {
      seoChecks.push('Insufficient keywords');
    }
    
    if (!metadata.image) {
      seoChecks.push('Missing hero image');
    }
    
    if (seoChecks.length > 0) {
      validation.warnings.push(`⚠️ SEO issues: ${seoChecks.join(', ')}`);
      validation.score -= seoChecks.length * 2;
    } else {
      console.log(`  ✅ SEO: All elements present`);
    }
  }

  /**
   * Validate engagement elements
   */
  validateEngagement(content, validation) {
    const engagementElements = [];
    
    // Check for hook opening
    if (!content.match(/^##\s*(The|What|Why|How|Imagine)/m)) {
      engagementElements.push('Weak hook opening');
    }
    
    // Check for call to action
    if (!content.match(/\*[^*]+\*$/m)) {
      engagementElements.push('Missing call to action');
    }
    
    // Check for internal links
    const linkMatches = content.match(/\[([^\]]+)\]\(\/[^)]+\)/g) || [];
    validation.metrics.internalLinks = linkMatches.length;
    
    if (linkMatches.length < this.criteria.requiredElements.internalLinks) {
      engagementElements.push(`Only ${linkMatches.length} internal links (need ${this.criteria.requiredElements.internalLinks})`);
    }
    
    if (engagementElements.length > 0) {
      validation.warnings.push(`⚠️ Engagement: ${engagementElements.join(', ')}`);
      validation.score -= engagementElements.length * 3;
    } else {
      console.log(`  ✅ Engagement: Hook, CTA, and internal links present`);
    }
  }

  /**
   * Calculate final quality score
   */
  calculateScore(validation) {
    // Ensure score doesn't go below 0
    return Math.max(0, validation.score);
  }

  /**
   * Validate all articles in a directory
   */
  async validateDirectory(dirPath) {
    console.log('\n📊 Ultra-Short Quality Validation Report');
    console.log('=' .repeat(60));
    
    const files = await this.getAllMdxFiles(dirPath);
    const results = [];
    
    for (const file of files) {
      const validation = await this.validateArticle(file);
      results.push(validation);
      
      // Print summary for each file
      const status = validation.passed ? '✅' : '❌';
      console.log(`\n${status} ${path.basename(file)}: Score ${validation.score}/100`);
      
      if (validation.issues.length > 0) {
        console.log('  Issues:');
        validation.issues.forEach(issue => console.log(`    ${issue}`));
      }
      
      if (validation.warnings.length > 0) {
        console.log('  Warnings:');
        validation.warnings.forEach(warning => console.log(`    ${warning}`));
      }
    }
    
    // Generate summary report
    await this.generateReport(results);
    
    return results;
  }

  /**
   * Get all MDX files in directory
   */
  async getAllMdxFiles(dirPath) {
    const files = [];
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        const subFiles = await this.getAllMdxFiles(fullPath);
        files.push(...subFiles);
      } else if (entry.name.endsWith('.mdx') && !entry.name.includes('.backup')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  /**
   * Generate validation report
   */
  async generateReport(results) {
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    const avgScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);
    
    const report = `
╔════════════════════════════════════════════════════════════╗
║        ULTRA-SHORT QUALITY VALIDATION REPORT               ║
╚════════════════════════════════════════════════════════════╝

📊 OVERALL STATISTICS
├─ Total Articles: ${results.length}
├─ Passed: ${passed} (${Math.round(passed/results.length*100)}%)
├─ Failed: ${failed} (${Math.round(failed/results.length*100)}%)
└─ Average Score: ${avgScore}/100

📈 QUALITY METRICS
├─ Word Count Compliance: ${this.getComplianceRate(results, 'wordCount')}%
├─ Formatting Standards: ${this.getFormattingScore(results)}%
├─ SEO Optimization: ${this.getSEOScore(results)}%
└─ Engagement Elements: ${this.getEngagementScore(results)}%

🏆 TOP PERFORMERS
${this.getTopPerformers(results, 3)}

⚠️ NEEDS ATTENTION
${this.getNeedsAttention(results, 3)}

📋 RECOMMENDATIONS
${this.getRecommendations(results)}

Generated at: ${new Date().toLocaleString()}
════════════════════════════════════════════════════════════
`;
    
    console.log(report);
    
    // Save report
    const reportPath = path.join(__dirname, '../reports', `quality-validation-${Date.now()}.txt`);
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, report);
    console.log(`\n📄 Report saved: ${reportPath}`);
    
    return report;
  }

  /**
   * Calculate compliance rates
   */
  getComplianceRate(results, metric) {
    const compliant = results.filter(r => {
      if (metric === 'wordCount') {
        return r.metrics && r.metrics.wordCount >= 400 && r.metrics.wordCount <= 500;
      }
      return false;
    });
    
    return Math.round(compliant.length / results.length * 100);
  }

  getFormattingScore(results) {
    const scores = results.map(r => {
      if (!r.metrics) return 0;
      const hasAllElements = 
        (r.metrics.boldCount >= 3) &&
        (r.metrics.blockquoteCount >= 2) &&
        (r.metrics.horizontalRuleCount >= 3);
      return hasAllElements ? 100 : 50;
    });
    
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  getSEOScore(results) {
    const withoutSEOWarnings = results.filter(r => 
      !r.warnings.some(w => w.includes('SEO'))
    );
    return Math.round(withoutSEOWarnings.length / results.length * 100);
  }

  getEngagementScore(results) {
    const withGoodEngagement = results.filter(r => 
      !r.warnings.some(w => w.includes('Engagement'))
    );
    return Math.round(withGoodEngagement.length / results.length * 100);
  }

  getTopPerformers(results, count) {
    const sorted = [...results].sort((a, b) => b.score - a.score);
    return sorted.slice(0, count).map(r => 
      `├─ ${path.basename(r.filePath)}: ${r.score}/100`
    ).join('\n');
  }

  getNeedsAttention(results, count) {
    const sorted = [...results].sort((a, b) => a.score - b.score);
    return sorted.slice(0, count).map(r => 
      `├─ ${path.basename(r.filePath)}: ${r.score}/100`
    ).join('\n');
  }

  getRecommendations(results) {
    const recommendations = [];
    
    // Check common issues
    const tooLong = results.filter(r => r.metrics && r.metrics.wordCount > 500).length;
    const tooShort = results.filter(r => r.metrics && r.metrics.wordCount < 400).length;
    const needsBold = results.filter(r => r.metrics && r.metrics.boldCount < 3).length;
    const needsQuotes = results.filter(r => r.metrics && r.metrics.blockquoteCount < 2).length;
    
    if (tooLong > 0) {
      recommendations.push(`├─ Reduce word count in ${tooLong} articles`);
    }
    if (tooShort > 0) {
      recommendations.push(`├─ Expand content in ${tooShort} articles`);
    }
    if (needsBold > 0) {
      recommendations.push(`├─ Add bold emphasis to ${needsBold} articles`);
    }
    if (needsQuotes > 0) {
      recommendations.push(`├─ Add expert quotes to ${needsQuotes} articles`);
    }
    
    if (recommendations.length === 0) {
      recommendations.push('├─ All articles meet quality standards!');
    }
    
    return recommendations.join('\n');
  }
}

module.exports = UltraShortQualityValidator;

// CLI interface
if (require.main === module) {
  const validator = new UltraShortQualityValidator();
  const contentDir = path.join(__dirname, '../content');
  
  validator.validateDirectory(contentDir)
    .then(results => {
      const passed = results.filter(r => r.passed).length;
      const total = results.length;
      
      if (passed === total) {
        console.log('\n✅ All articles pass quality validation!');
        process.exit(0);
      } else {
        console.log(`\n⚠️ ${total - passed} articles need improvement`);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    });
}