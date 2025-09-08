#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

class QualityValidator {
  constructor() {
    this.contentDir = path.join(__dirname, '..', 'content');
    this.reportDir = path.join(__dirname, '..', 'reports');
    
    this.qualityRules = {
      minWordCount: 300,
      maxWordCount: 3000,
      minParagraphs: 3,
      requiredSections: ['##', '###'],
      maxHeadingLevel: 4,
      requiredFrontmatter: ['title', 'description', 'publishedAt', 'author'],
      maxTitleLength: 60,
      maxDescriptionLength: 160,
      minDescriptionLength: 120,
      duplicateThreshold: 0.8,
      readabilityTarget: 60 // Flesch reading ease score
    };

    this.qualityIssues = [];
  }

  async ensureReportDirectory() {
    try {
      await fs.mkdir(this.reportDir, { recursive: true });
    } catch (error) {
      // Directory exists
    }
  }

  async validateAllContent() {
    console.log('🔍 Starting quality validation...');
    
    await this.ensureReportDirectory();
    
    const results = {
      totalFiles: 0,
      validFiles: 0,
      issuesFound: 0,
      files: []
    };

    const contentTypes = ['news', 'reviews', 'compare', 'best', 'guides'];
    
    for (const type of contentTypes) {
      const typeDir = path.join(this.contentDir, type);
      
      try {
        const files = await fs.readdir(typeDir);
        const mdxFiles = files.filter(file => file.endsWith('.mdx'));
        
        console.log(`Validating ${mdxFiles.length} ${type} files...`);
        
        for (const file of mdxFiles) {
          const filePath = path.join(typeDir, file);
          const validation = await this.validateFile(filePath, type);
          
          results.totalFiles++;
          if (validation.isValid) results.validFiles++;
          results.issuesFound += validation.issues.length;
          results.files.push(validation);
        }
        
      } catch (error) {
        console.log(`No ${type} directory found or error reading: ${error.message}`);
      }
    }

    await this.generateQualityReport(results);
    
    console.log(`✅ Quality validation completed.`);
    console.log(`📊 Results: ${results.validFiles}/${results.totalFiles} files valid, ${results.issuesFound} total issues`);
    
    return results;
  }

  async validateFile(filePath, contentType) {
    const validation = {
      filePath,
      contentType,
      isValid: true,
      issues: [],
      warnings: [],
      score: 100
    };

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const { frontmatter, body } = this.parseFrontmatter(content);
      
      // Validate frontmatter
      this.validateFrontmatter(frontmatter, validation);
      
      // Validate content structure
      this.validateContentStructure(body, validation);
      
      // Validate content quality
      this.validateContentQuality(body, validation);
      
      // Validate readability
      this.validateReadability(body, validation);
      
      // Check for duplicates (simplified)
      this.validateUniqueness(body, validation);
      
      // Calculate final score
      validation.score = Math.max(0, 100 - (validation.issues.length * 10) - (validation.warnings.length * 5));
      validation.isValid = validation.issues.length === 0;
      
    } catch (error) {
      validation.issues.push(`File read error: ${error.message}`);
      validation.isValid = false;
      validation.score = 0;
    }

    return validation;
  }

  parseFrontmatter(content) {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);
    
    if (!match) {
      return { frontmatter: {}, body: content };
    }

    const frontmatterText = match[1];
    const body = match[2];
    
    // Simple YAML parsing for our needs
    const frontmatter = {};
    frontmatterText.split('\n').forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
        frontmatter[key] = value;
      }
    });

    return { frontmatter, body };
  }

  validateFrontmatter(frontmatter, validation) {
    // Check required fields
    this.qualityRules.requiredFrontmatter.forEach(field => {
      if (!frontmatter[field]) {
        validation.issues.push(`Missing required frontmatter field: ${field}`);
      }
    });

    // Validate title length
    if (frontmatter.title && frontmatter.title.length > this.qualityRules.maxTitleLength) {
      validation.issues.push(`Title too long: ${frontmatter.title.length} chars (max ${this.qualityRules.maxTitleLength})`);
    }

    // Validate description
    if (frontmatter.description) {
      if (frontmatter.description.length > this.qualityRules.maxDescriptionLength) {
        validation.issues.push(`Description too long: ${frontmatter.description.length} chars (max ${this.qualityRules.maxDescriptionLength})`);
      }
      if (frontmatter.description.length < this.qualityRules.minDescriptionLength) {
        validation.warnings.push(`Description might be too short: ${frontmatter.description.length} chars (min ${this.qualityRules.minDescriptionLength})`);
      }
    }

    // Validate date format
    if (frontmatter.publishedAt && !this.isValidDate(frontmatter.publishedAt)) {
      validation.issues.push('Invalid publishedAt date format');
    }
  }

  validateContentStructure(body, validation) {
    // Word count
    const words = this.countWords(body);
    if (words < this.qualityRules.minWordCount) {
      validation.issues.push(`Content too short: ${words} words (min ${this.qualityRules.minWordCount})`);
    }
    if (words > this.qualityRules.maxWordCount) {
      validation.warnings.push(`Content might be too long: ${words} words (max ${this.qualityRules.maxWordCount})`);
    }

    // Paragraph count
    const paragraphs = body.split('\n\n').filter(p => p.trim().length > 0);
    if (paragraphs.length < this.qualityRules.minParagraphs) {
      validation.issues.push(`Too few paragraphs: ${paragraphs.length} (min ${this.qualityRules.minParagraphs})`);
    }

    // Heading structure
    const headings = body.match(/^#{1,6}\s+.+$/gm) || [];
    if (headings.length === 0) {
      validation.issues.push('No headings found - content needs structure');
    }

    // Check heading levels
    headings.forEach(heading => {
      const level = heading.match(/^#{1,6}/)[0].length;
      if (level > this.qualityRules.maxHeadingLevel) {
        validation.warnings.push(`Deep heading level found: ${level} (max recommended ${this.qualityRules.maxHeadingLevel})`);
      }
    });

    // Check for required sections based on content type
    this.validateRequiredSections(body, validation);
  }

  validateRequiredSections(body, validation) {
    const headings = body.match(/^#{1,6}\s+(.+)$/gm) || [];
    const headingTexts = headings.map(h => h.replace(/^#{1,6}\s+/, '').toLowerCase());

    // Common sections that should exist
    const recommendedSections = ['introduction', 'conclusion', 'what', 'how', 'why'];
    const foundSections = recommendedSections.filter(section => 
      headingTexts.some(heading => heading.includes(section))
    );

    if (foundSections.length === 0) {
      validation.warnings.push('Consider adding standard sections (introduction, conclusion, etc.)');
    }
  }

  validateContentQuality(body, validation) {
    // Check for placeholder text
    const placeholderPatterns = [
      /lorem ipsum/i,
      /placeholder/i,
      /\{[^}]+\}/g,
      /TODO/i,
      /FIXME/i
    ];

    placeholderPatterns.forEach(pattern => {
      if (pattern.test(body)) {
        validation.issues.push('Placeholder or template text found');
      }
    });

    // Check for excessive repetition
    const sentences = body.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const repeatedSentences = this.findRepeatedContent(sentences);
    if (repeatedSentences.length > 0) {
      validation.warnings.push(`Potentially repeated content found: ${repeatedSentences.length} instances`);
    }

    // Check for external links (good for authority)
    const externalLinks = body.match(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/g) || [];
    if (externalLinks.length === 0) {
      validation.warnings.push('No external links found - consider adding authoritative sources');
    }

    // Check for images
    const images = body.match(/!\[([^\]]*)\]\([^)]+\)/g) || [];
    if (images.length === 0) {
      validation.warnings.push('No images found - visual content improves engagement');
    }
  }

  validateReadability(body, validation) {
    // Simplified readability check
    const sentences = body.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = this.countWords(body);
    const syllables = this.estimateSyllables(body);

    if (sentences.length === 0) return;

    // Flesch Reading Ease approximation
    const avgSentenceLength = words / sentences.length;
    const avgSyllablesPerWord = syllables / words;
    
    const readabilityScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);

    if (readabilityScore < this.qualityRules.readabilityTarget) {
      validation.warnings.push(`Readability might be difficult: ${Math.round(readabilityScore)} (target: ${this.qualityRules.readabilityTarget}+)`);
    }

    // Check sentence length
    const longSentences = sentences.filter(s => this.countWords(s) > 20);
    if (longSentences.length > sentences.length * 0.3) {
      validation.warnings.push('Many long sentences detected - consider breaking them up');
    }
  }

  validateUniqueness(body, validation) {
    // Check for potential duplicate content (simplified)
    const fingerprint = this.generateContentFingerprint(body);
    
    // In a real implementation, you'd check against a database of existing content
    // For now, just check for obviously duplicated paragraphs within the same article
    const paragraphs = body.split('\n\n').filter(p => p.trim().length > 50);
    const duplicates = this.findDuplicateParagraphs(paragraphs);
    
    if (duplicates.length > 0) {
      validation.issues.push(`Duplicate paragraphs found within article: ${duplicates.length}`);
    }
  }

  findRepeatedContent(sentences) {
    const repeated = [];
    const seen = new Set();
    
    sentences.forEach(sentence => {
      const normalized = sentence.trim().toLowerCase();
      if (normalized.length > 20) {
        if (seen.has(normalized)) {
          repeated.push(normalized);
        } else {
          seen.add(normalized);
        }
      }
    });
    
    return repeated;
  }

  findDuplicateParagraphs(paragraphs) {
    const duplicates = [];
    const seen = new Map();
    
    paragraphs.forEach((paragraph, index) => {
      const normalized = paragraph.replace(/\s+/g, ' ').trim().toLowerCase();
      if (seen.has(normalized)) {
        duplicates.push({ index, text: paragraph.substring(0, 100) + '...' });
      } else {
        seen.set(normalized, index);
      }
    });
    
    return duplicates;
  }

  generateContentFingerprint(content) {
    // Simple content fingerprinting (in production, use more sophisticated hashing)
    const normalized = content.replace(/\s+/g, ' ').toLowerCase();
    const words = normalized.split(' ').filter(w => w.length > 3);
    return words.slice(0, 20).join('');
  }

  countWords(text) {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  estimateSyllables(text) {
    // Very rough syllable estimation
    const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
    return words.reduce((total, word) => {
      // Simple syllable counting - count vowel groups
      const vowelGroups = word.match(/[aeiouy]+/g) || [];
      const syllableCount = Math.max(1, vowelGroups.length);
      return total + syllableCount;
    }, 0);
  }

  isValidDate(dateString) {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  async generateQualityReport(results) {
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalFiles: results.totalFiles,
        validFiles: results.validFiles,
        invalidFiles: results.totalFiles - results.validFiles,
        totalIssues: results.issuesFound,
        averageScore: results.files.reduce((sum, f) => sum + f.score, 0) / Math.max(results.files.length, 1)
      },
      issues: {
        critical: results.files.filter(f => f.score < 60).length,
        warning: results.files.filter(f => f.score >= 60 && f.score < 80).length,
        good: results.files.filter(f => f.score >= 80).length
      },
      files: results.files.map(file => ({
        path: path.relative(this.contentDir, file.filePath),
        contentType: file.contentType,
        isValid: file.isValid,
        score: file.score,
        issuesCount: file.issues.length,
        warningsCount: file.warnings.length,
        topIssues: file.issues.slice(0, 3)
      })),
      recommendations: this.generateRecommendations(results)
    };

    const reportPath = path.join(this.reportDir, 'quality-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');

    // Generate human-readable summary
    const summaryPath = path.join(this.reportDir, 'quality-summary.md');
    const summaryContent = this.generateSummaryMarkdown(report);
    await fs.writeFile(summaryPath, summaryContent, 'utf-8');

    console.log(`📊 Quality report saved: ${reportPath}`);
    console.log(`📋 Summary report saved: ${summaryPath}`);

    return report;
  }

  generateRecommendations(results) {
    const recommendations = [];
    
    const invalidFiles = results.files.filter(f => !f.isValid);
    if (invalidFiles.length > 0) {
      recommendations.push(`Fix ${invalidFiles.length} files with critical issues`);
    }

    const lowScoreFiles = results.files.filter(f => f.score < 70);
    if (lowScoreFiles.length > 0) {
      recommendations.push(`Improve ${lowScoreFiles.length} files with low quality scores`);
    }

    const commonIssues = this.findCommonIssues(results.files);
    if (commonIssues.length > 0) {
      recommendations.push(`Address common issues: ${commonIssues.slice(0, 3).join(', ')}`);
    }

    return recommendations;
  }

  findCommonIssues(files) {
    const issueCount = {};
    
    files.forEach(file => {
      file.issues.forEach(issue => {
        const key = issue.split(':')[0]; // Get issue type
        issueCount[key] = (issueCount[key] || 0) + 1;
      });
    });

    return Object.entries(issueCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([issue]) => issue);
  }

  generateSummaryMarkdown(report) {
    return `# Quality Report Summary

Generated: ${new Date(report.generatedAt).toLocaleString()}

## Overview

- **Total Files**: ${report.summary.totalFiles}
- **Valid Files**: ${report.summary.validFiles}
- **Invalid Files**: ${report.summary.invalidFiles}
- **Total Issues**: ${report.summary.totalIssues}
- **Average Score**: ${Math.round(report.summary.averageScore)}/100

## Quality Distribution

- 🟢 **Good (80+)**: ${report.issues.good} files
- 🟡 **Warning (60-79)**: ${report.issues.warning} files  
- 🔴 **Critical (<60)**: ${report.issues.critical} files

## Recommendations

${report.recommendations.map(rec => `- ${rec}`).join('\n')}

## Files Needing Attention

${report.files
  .filter(f => !f.isValid || f.score < 70)
  .slice(0, 10)
  .map(f => `- **${f.path}** (Score: ${f.score}) - ${f.issuesCount} issues`)
  .join('\n')}

---
*Generated by Quality Validator*`;
  }

  async run() {
    console.log('🚀 Starting quality validation...');

    try {
      const results = await this.validateAllContent();
      
      // Report critical issues but don't exit with error in automation
      const criticalIssues = results.files.filter(f => !f.isValid).length;
      if (criticalIssues > 0) {
        console.log(`⚠️ ${criticalIssues} files have critical issues that should be reviewed.`);
        console.log('📋 Quality report generated with recommendations for improvement.');
      } else {
        console.log('✅ All content files passed quality validation.');
      }

      return results;

    } catch (error) {
      console.error('Quality validation failed:', error.message);
      // Return partial results instead of crashing
      return {
        totalFiles: 0,
        validFiles: 0,
        issuesFound: 1,
        files: [],
        error: error.message
      };
    }
  }
}

// Run if called directly
if (require.main === module) {
  const validator = new QualityValidator();
  validator.run().catch(console.error);
}

module.exports = { QualityValidator };