// Image quality assurance and SEO optimization system
// Validates image quality, SEO compliance, and performance optimization

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class ImageQualityAssurance {
  constructor(options = {}) {
    this.qualityThreshold = options.qualityThreshold || 85;
    this.performanceThreshold = options.performanceThreshold || 90;
    this.seoCompliance = options.seoCompliance || 95;

    // Quality validation rules
    this.qualityRules = {
      dimensions: {
        minWidth: 800,
        minHeight: 600,
        maxWidth: 2400,
        maxHeight: 1800,
        aspectRatios: ['16:9', '4:3', '3:2', '1:1'],
      },
      fileSize: {
        maxSize: 2 * 1024 * 1024, // 2MB
        optimalSize: 500 * 1024, // 500KB
        compressionRatio: 0.8,
      },
      formats: {
        preferred: ['webp', 'jpg', 'jpeg'],
        legacy: ['png', 'gif'],
        nextGen: ['avif', 'webp'],
      },
    };

    // SEO optimization rules
    this.seoRules = {
      altText: {
        minLength: 10,
        maxLength: 125,
        keywordDensity: 0.02,
        required: true,
      },
      filename: {
        maxLength: 50,
        descriptive: true,
        kebabCase: true,
        keywords: true,
      },
      structured: {
        schema: true,
        openGraph: true,
        twitter: true,
      },
    };

    // Performance optimization settings
    this.performanceRules = {
      compression: {
        quality: 85,
        progressive: true,
        optimizeHuffman: true,
      },
      responsive: {
        breakpoints: [480, 768, 1024, 1200, 1920],
        formats: ['webp', 'jpg'],
        lazy: true,
      },
      delivery: {
        cdn: true,
        caching: true,
        preload: ['hero', 'above-fold'],
      },
    };

    this.validationResults = [];
  }

  // Main quality assurance pipeline
  async validateImageQuality(imagePath, metadata = {}) {
    console.log(`🔍 Validating image quality: ${path.basename(imagePath)}`);

    const results = {
      imagePath,
      timestamp: new Date().toISOString(),
      scores: {},
      issues: [],
      recommendations: [],
      passed: false,
    };

    try {
      // Technical validation
      results.scores.technical = await this.validateTechnicalQuality(imagePath);

      // SEO validation
      results.scores.seo = await this.validateSEOCompliance(
        imagePath,
        metadata
      );

      // Performance validation
      results.scores.performance = await this.validatePerformance(imagePath);

      // Content relevance validation
      results.scores.relevance = await this.validateContentRelevance(
        imagePath,
        metadata
      );

      // Calculate overall score
      results.scores.overall = this.calculateOverallScore(results.scores);

      // Determine pass/fail
      results.passed = results.scores.overall >= this.qualityThreshold;

      // Generate recommendations
      results.recommendations = await this.generateRecommendations(results);

      this.validationResults.push(results);
      return results;
    } catch (error) {
      console.error(
        `Quality validation failed for ${imagePath}:`,
        error.message
      );
      results.issues.push({
        type: 'validation_error',
        severity: 'critical',
        message: error.message,
      });
      return results;
    }
  }

  // Validate technical image quality
  async validateTechnicalQuality(imagePath) {
    const issues = [];
    let score = 100;

    try {
      // Get image stats
      const stats = await fs.stat(imagePath);
      const fileSize = stats.size;
      const filename = path.basename(imagePath);
      const extension = path.extname(imagePath).toLowerCase();

      // File size validation
      if (fileSize > this.qualityRules.fileSize.maxSize) {
        issues.push({
          type: 'file_size',
          severity: 'high',
          message: `File too large: ${(fileSize / 1024 / 1024).toFixed(2)}MB (max: ${(this.qualityRules.fileSize.maxSize / 1024 / 1024).toFixed(2)}MB)`,
          current: fileSize,
          expected: this.qualityRules.fileSize.maxSize,
        });
        score -= 20;
      }

      // Format validation
      if (
        !this.qualityRules.formats.preferred.includes(
          extension.replace('.', '')
        )
      ) {
        issues.push({
          type: 'format',
          severity: 'medium',
          message: `Non-optimal format: ${extension}. Preferred: ${this.qualityRules.formats.preferred.join(', ')}`,
          current: extension,
          expected: this.qualityRules.formats.preferred,
        });
        score -= 10;
      }

      // Filename validation
      if (filename.length > this.qualityRules.filename?.maxLength) {
        issues.push({
          type: 'filename_length',
          severity: 'low',
          message: `Filename too long: ${filename.length} chars (max: ${this.qualityRules.filename.maxLength})`,
          current: filename.length,
          expected: this.qualityRules.filename.maxLength,
        });
        score -= 5;
      }

      // TODO: Add actual image dimension analysis using Sharp or similar
      // For now, we'll simulate based on file size
      const estimatedQuality = this.estimateImageQuality(fileSize, extension);
      if (estimatedQuality < 80) {
        issues.push({
          type: 'estimated_quality',
          severity: 'medium',
          message: `Estimated quality below threshold: ${estimatedQuality}%`,
          current: estimatedQuality,
          expected: 80,
        });
        score -= 15;
      }
    } catch (error) {
      issues.push({
        type: 'technical_analysis_error',
        severity: 'critical',
        message: error.message,
      });
      score = 0;
    }

    return { score: Math.max(0, score), issues };
  }

  // Estimate image quality based on file characteristics
  estimateImageQuality(fileSize, extension) {
    const sizeKB = fileSize / 1024;

    // Basic heuristics for quality estimation
    if (extension === '.jpg' || extension === '.jpeg') {
      if (sizeKB < 50) return 60; // Likely over-compressed
      if (sizeKB > 1000) return 95; // Likely high quality
      return Math.min(95, 60 + (sizeKB / 1000) * 35);
    } else if (extension === '.webp') {
      if (sizeKB < 30) return 70;
      if (sizeKB > 800) return 95;
      return Math.min(95, 70 + (sizeKB / 800) * 25);
    } else if (extension === '.png') {
      // PNG is lossless but larger
      if (sizeKB < 100) return 85;
      return 90;
    }

    return 75; // Default for unknown formats
  }

  // Validate SEO compliance
  async validateSEOCompliance(imagePath, metadata = {}) {
    const issues = [];
    let score = 100;
    const filename = path.basename(imagePath);

    try {
      // Alt text validation
      const altText = metadata.alt || metadata.altText || '';
      if (!altText) {
        issues.push({
          type: 'missing_alt_text',
          severity: 'critical',
          message: 'Missing alt text - critical for accessibility and SEO',
          recommendation:
            'Add descriptive alt text that explains the image content',
        });
        score -= 30;
      } else {
        if (altText.length < this.seoRules.altText.minLength) {
          issues.push({
            type: 'alt_text_too_short',
            severity: 'high',
            message: `Alt text too short: ${altText.length} chars (min: ${this.seoRules.altText.minLength})`,
            current: altText.length,
            expected: this.seoRules.altText.minLength,
          });
          score -= 15;
        }

        if (altText.length > this.seoRules.altText.maxLength) {
          issues.push({
            type: 'alt_text_too_long',
            severity: 'medium',
            message: `Alt text too long: ${altText.length} chars (max: ${this.seoRules.altText.maxLength})`,
            current: altText.length,
            expected: this.seoRules.altText.maxLength,
          });
          score -= 10;
        }
      }

      // Filename SEO validation
      const filenameScore = this.validateSEOFilename(filename);
      if (filenameScore.score < 80) {
        issues.push(...filenameScore.issues);
        score -= (100 - filenameScore.score) * 0.2;
      }

      // Structured data validation
      if (!metadata.schema && !metadata.structuredData) {
        issues.push({
          type: 'missing_structured_data',
          severity: 'low',
          message:
            'Missing structured data markup for better search visibility',
          recommendation: 'Add schema.org markup for images',
        });
        score -= 5;
      }

      // Open Graph validation
      if (!metadata.openGraph && !metadata.og) {
        issues.push({
          type: 'missing_og_data',
          severity: 'low',
          message: 'Missing Open Graph data for social media sharing',
          recommendation: 'Add og:image and related tags',
        });
        score -= 5;
      }
    } catch (error) {
      issues.push({
        type: 'seo_analysis_error',
        severity: 'critical',
        message: error.message,
      });
      score = 0;
    }

    return { score: Math.max(0, score), issues };
  }

  // Validate SEO-friendly filename
  validateSEOFilename(filename) {
    const issues = [];
    let score = 100;
    const nameWithoutExt = path.parse(filename).name;

    // Check for descriptive naming
    if (nameWithoutExt.length < 5) {
      issues.push({
        type: 'filename_too_short',
        severity: 'medium',
        message: 'Filename too short to be descriptive',
        recommendation: 'Use descriptive, keyword-rich filenames',
      });
      score -= 20;
    }

    // Check for kebab-case (SEO-friendly)
    if (!/^[a-z0-9-]+$/.test(nameWithoutExt)) {
      issues.push({
        type: 'filename_not_seo_friendly',
        severity: 'medium',
        message: 'Filename not in SEO-friendly format',
        recommendation: 'Use lowercase letters, numbers, and hyphens only',
      });
      score -= 15;
    }

    // Check for spaces or special characters
    if (/[\s_A-Z!@#$%^&*()+=\[\]{}|;':".,<>?]/.test(nameWithoutExt)) {
      issues.push({
        type: 'filename_special_chars',
        severity: 'high',
        message: 'Filename contains spaces or special characters',
        recommendation: 'Replace spaces with hyphens, use lowercase only',
      });
      score -= 25;
    }

    // Check for meaningful keywords
    const meaningfulWords = nameWithoutExt
      .split('-')
      .filter(
        (word) =>
          word.length > 2 && !['img', 'image', 'pic', 'photo'].includes(word)
      );

    if (meaningfulWords.length < 2) {
      issues.push({
        type: 'filename_lacks_keywords',
        severity: 'medium',
        message: 'Filename lacks descriptive keywords',
        recommendation: 'Include product names, features, or relevant keywords',
      });
      score -= 15;
    }

    return { score: Math.max(0, score), issues };
  }

  // Validate performance optimization
  async validatePerformance(imagePath) {
    const issues = [];
    let score = 100;

    try {
      const stats = await fs.stat(imagePath);
      const fileSize = stats.size;
      const extension = path.extname(imagePath).toLowerCase();

      // Compression efficiency
      const compressionScore = this.assessCompression(fileSize, extension);
      if (compressionScore < 80) {
        issues.push({
          type: 'poor_compression',
          severity: 'medium',
          message: `Compression could be improved (score: ${compressionScore})`,
          recommendation: 'Optimize compression settings or use modern formats',
        });
        score -= (80 - compressionScore) * 0.25;
      }

      // Format optimization
      if (
        !this.qualityRules.formats.nextGen.includes(extension.replace('.', ''))
      ) {
        issues.push({
          type: 'legacy_format',
          severity: 'low',
          message: 'Using legacy format instead of modern optimized format',
          recommendation: 'Consider WebP or AVIF for better compression',
        });
        score -= 10;
      }

      // Size optimization for web
      if (fileSize > this.qualityRules.fileSize.optimalSize * 2) {
        issues.push({
          type: 'large_file_size',
          severity: 'high',
          message: `File size impacts loading performance: ${(fileSize / 1024).toFixed(0)}KB`,
          recommendation: 'Reduce file size through compression or resizing',
        });
        score -= 20;
      }
    } catch (error) {
      issues.push({
        type: 'performance_analysis_error',
        severity: 'critical',
        message: error.message,
      });
      score = 0;
    }

    return { score: Math.max(0, score), issues };
  }

  // Assess compression efficiency
  assessCompression(fileSize, extension) {
    const sizeKB = fileSize / 1024;

    // Scoring based on file size and format efficiency
    if (extension === '.webp') {
      if (sizeKB < 100) return 95;
      if (sizeKB < 300) return 90;
      if (sizeKB < 500) return 85;
      return 75;
    } else if (extension === '.jpg' || extension === '.jpeg') {
      if (sizeKB < 150) return 90;
      if (sizeKB < 400) return 85;
      if (sizeKB < 600) return 80;
      return 70;
    } else if (extension === '.png') {
      // PNG is lossless, so different scoring
      if (sizeKB < 200) return 85;
      if (sizeKB < 500) return 80;
      return 70;
    }

    return 65; // Default for other formats
  }

  // Validate content relevance
  async validateContentRelevance(imagePath, metadata = {}) {
    const issues = [];
    let score = 100;
    const filename = path.basename(imagePath).toLowerCase();

    try {
      // Check filename relevance to content
      const contentContext = metadata.contentContext || metadata.context || '';
      const productHint = metadata.productHint || metadata.product || '';

      if (contentContext || productHint) {
        const relevanceScore = this.calculateContentRelevance(
          filename,
          contentContext,
          productHint
        );
        if (relevanceScore < 70) {
          issues.push({
            type: 'low_content_relevance',
            severity: 'medium',
            message: `Image may not be relevant to content (relevance: ${relevanceScore}%)`,
            recommendation:
              'Ensure image filename and content align with article topic',
          });
          score -= (70 - relevanceScore) * 0.5;
        }
      }

      // Check for generic/placeholder naming
      const genericTerms = [
        'image',
        'photo',
        'pic',
        'img',
        'default',
        'placeholder',
        'untitled',
      ];
      const hasGenericNaming = genericTerms.some((term) =>
        filename.includes(term)
      );

      if (hasGenericNaming) {
        issues.push({
          type: 'generic_naming',
          severity: 'medium',
          message: 'Generic image naming reduces content relevance',
          recommendation:
            'Use specific, descriptive filenames related to content',
        });
        score -= 15;
      }
    } catch (error) {
      issues.push({
        type: 'relevance_analysis_error',
        severity: 'low',
        message: error.message,
      });
      score -= 5;
    }

    return { score: Math.max(0, score), issues };
  }

  // Calculate content relevance score
  calculateContentRelevance(filename, contentContext, productHint) {
    const filenameWords = filename.replace(/[^a-z0-9\s-]/g, '').split(/[-\s]+/);
    const contextWords = (contentContext + ' ' + productHint)
      .toLowerCase()
      .split(/\s+/);

    let matches = 0;
    let totalWords = Math.max(filenameWords.length, 1);

    for (const word of filenameWords) {
      if (
        word.length > 2 &&
        contextWords.some((cw) => cw.includes(word) || word.includes(cw))
      ) {
        matches++;
      }
    }

    return Math.min(100, (matches / totalWords) * 100 + 40); // Base score of 40
  }

  // Calculate overall quality score
  calculateOverallScore(scores) {
    const weights = {
      technical: 0.3,
      seo: 0.3,
      performance: 0.25,
      relevance: 0.15,
    };

    let totalScore = 0;
    let totalWeight = 0;

    for (const [category, score] of Object.entries(scores)) {
      if (typeof score === 'object' && score.score !== undefined) {
        totalScore += score.score * (weights[category] || 0.1);
        totalWeight += weights[category] || 0.1;
      }
    }

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }

  // Generate optimization recommendations
  async generateRecommendations(results) {
    const recommendations = [];

    // Technical recommendations
    if (results.scores.technical?.score < 80) {
      recommendations.push({
        category: 'technical',
        priority: 'high',
        title: 'Improve Technical Quality',
        actions: [
          'Optimize file size and compression',
          'Use preferred image formats (WebP, JPEG)',
          'Ensure proper image dimensions',
        ],
      });
    }

    // SEO recommendations
    if (results.scores.seo?.score < 85) {
      recommendations.push({
        category: 'seo',
        priority: 'high',
        title: 'Enhance SEO Compliance',
        actions: [
          'Add descriptive alt text (10-125 characters)',
          'Use SEO-friendly filenames with keywords',
          'Implement structured data markup',
        ],
      });
    }

    // Performance recommendations
    if (results.scores.performance?.score < 85) {
      recommendations.push({
        category: 'performance',
        priority: 'medium',
        title: 'Optimize Performance',
        actions: [
          'Reduce file size through better compression',
          'Consider modern formats (WebP, AVIF)',
          'Implement responsive images and lazy loading',
        ],
      });
    }

    // Content relevance recommendations
    if (results.scores.relevance?.score < 80) {
      recommendations.push({
        category: 'content',
        priority: 'medium',
        title: 'Improve Content Relevance',
        actions: [
          'Use specific, descriptive filenames',
          'Ensure images align with article content',
          'Avoid generic placeholder naming',
        ],
      });
    }

    return recommendations;
  }

  // Batch validate multiple images
  async validateImageBatch(imagePaths, metadata = {}) {
    console.log(
      `🔍 Starting batch validation of ${imagePaths.length} images...`
    );

    const results = [];
    const batchMetadata = {
      startTime: Date.now(),
      totalImages: imagePaths.length,
      results: [],
    };

    for (const imagePath of imagePaths) {
      try {
        const imageMetadata = metadata[imagePath] || {};
        const result = await this.validateImageQuality(
          imagePath,
          imageMetadata
        );
        results.push(result);

        console.log(
          `✅ ${path.basename(imagePath)}: ${result.scores.overall}/100`
        );
      } catch (error) {
        console.error(`❌ Failed to validate ${imagePath}:`, error.message);
        results.push({
          imagePath,
          error: error.message,
          passed: false,
          scores: { overall: 0 },
        });
      }
    }

    batchMetadata.endTime = Date.now();
    batchMetadata.executionTime =
      batchMetadata.endTime - batchMetadata.startTime;
    batchMetadata.results = results;

    // Generate batch summary
    const summary = this.generateBatchSummary(results);

    console.log('\n📊 BATCH VALIDATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`Images validated: ${results.length}`);
    console.log(`Passed: ${summary.passed} (${summary.passRate}%)`);
    console.log(`Average score: ${summary.averageScore}/100`);
    console.log(
      `Execution time: ${(batchMetadata.executionTime / 1000).toFixed(2)}s`
    );

    return { results, metadata: batchMetadata, summary };
  }

  // Generate batch validation summary
  generateBatchSummary(results) {
    const total = results.length;
    const passed = results.filter((r) => r.passed).length;
    const totalScore = results.reduce(
      (sum, r) => sum + (r.scores?.overall || 0),
      0
    );

    return {
      total,
      passed,
      failed: total - passed,
      passRate: total > 0 ? Math.round((passed / total) * 100) : 0,
      averageScore: total > 0 ? Math.round(totalScore / total) : 0,
      categories: {
        technical: Math.round(
          results.reduce(
            (sum, r) => sum + (r.scores?.technical?.score || 0),
            0
          ) / total
        ),
        seo: Math.round(
          results.reduce((sum, r) => sum + (r.scores?.seo?.score || 0), 0) /
            total
        ),
        performance: Math.round(
          results.reduce(
            (sum, r) => sum + (r.scores?.performance?.score || 0),
            0
          ) / total
        ),
        relevance: Math.round(
          results.reduce(
            (sum, r) => sum + (r.scores?.relevance?.score || 0),
            0
          ) / total
        ),
      },
    };
  }

  // Generate quality report
  async generateQualityReport(outputPath) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.generateBatchSummary(this.validationResults),
      results: this.validationResults,
      recommendations: this.generateGlobalRecommendations(),
      statistics: this.generateStatistics(),
    };

    await fs.writeFile(outputPath, JSON.stringify(report, null, 2));
    console.log(`📄 Quality report saved: ${outputPath}`);

    return report;
  }

  // Generate global recommendations based on all validations
  generateGlobalRecommendations() {
    const commonIssues = {};

    for (const result of this.validationResults) {
      for (const scoreCategory of Object.values(result.scores)) {
        if (scoreCategory.issues) {
          for (const issue of scoreCategory.issues) {
            commonIssues[issue.type] = (commonIssues[issue.type] || 0) + 1;
          }
        }
      }
    }

    // Sort issues by frequency
    const sortedIssues = Object.entries(commonIssues)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    return {
      mostCommonIssues: sortedIssues,
      recommendations: [
        'Standardize image naming conventions',
        'Implement automated compression pipeline',
        'Create alt text guidelines for content creators',
        'Set up image optimization workflow',
        'Monitor image performance metrics',
      ],
    };
  }

  // Generate validation statistics
  generateStatistics() {
    const total = this.validationResults.length;
    if (total === 0) return {};

    return {
      totalValidations: total,
      averageScores: this.generateBatchSummary(this.validationResults)
        .categories,
      passRates: {
        overall: this.generateBatchSummary(this.validationResults).passRate,
        byThreshold: {
          excellent: this.validationResults.filter(
            (r) => (r.scores?.overall || 0) >= 90
          ).length,
          good: this.validationResults.filter(
            (r) => (r.scores?.overall || 0) >= 80
          ).length,
          fair: this.validationResults.filter(
            (r) => (r.scores?.overall || 0) >= 70
          ).length,
          poor: this.validationResults.filter(
            (r) => (r.scores?.overall || 0) < 70
          ).length,
        },
      },
    };
  }
}

module.exports = { ImageQualityAssurance };
