#!/usr/bin/env node

/**
 * Production-grade image sourcing and path fixing system
 * Integrates all components for comprehensive image problem resolution
 */

require('dotenv').config({ path: '.env.local' });

const fs = require('fs').promises;
const path = require('path');

// Import our custom modules
const { EnhancedImageHunter } = require('../agents/enhanced-image-hunter');
const { ImageSourceManager } = require('../lib/image-sources');
const { ImagePathMapper } = require('../lib/image-path-mapper');
const { ImageCacheManager } = require('../lib/image-cache');
const { ImageQualityAssurance } = require('../lib/image-quality-seo');

class ComprehensiveImageFixer {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.reportDir = path.join(this.projectRoot, 'reports');
    
    // Initialize all subsystems
    this.imageHunter = new EnhancedImageHunter();
    this.sourceManager = new ImageSourceManager({
      unsplashAccessKey: process.env.UNSPLASH_ACCESS_KEY,
      shutterStockApiKey: process.env.SHUTTERSTOCK_API_KEY
    });
    this.pathMapper = new ImagePathMapper({
      contentDir: path.join(this.projectRoot, 'content'),
      publicDir: path.join(this.projectRoot, 'public')
    });
    this.cacheManager = new ImageCacheManager({
      cacheDir: path.join(this.projectRoot, '.cache', 'images')
    });
    this.qualityAssurance = new ImageQualityAssurance();
    
    // Execution tracking
    this.executionStats = {
      startTime: Date.now(),
      articlesProcessed: 0,
      imagesFixed: 0,
      imagesDownloaded: 0,
      pathsMapped: 0,
      qualityIssues: 0,
      errors: []
    };
    
    // Configuration
    this.config = {
      dryRun: process.argv.includes('--dry-run'),
      verbose: process.argv.includes('--verbose'),
      skipQuality: process.argv.includes('--skip-quality'),
      maxConcurrent: parseInt(process.argv.find(arg => arg.startsWith('--concurrent='))?.split('=')[1]) || 3,
      quality: process.argv.find(arg => arg.startsWith('--quality='))?.split('=')[1] || 'high'
    };
  }

  async run() {
    console.log('🚀 COMPREHENSIVE IMAGE FIXING SYSTEM');
    console.log('=====================================');
    console.log(`Mode: ${this.config.dryRun ? 'DRY RUN' : 'PRODUCTION'}`);
    console.log(`Quality: ${this.config.quality}`);
    console.log(`Concurrency: ${this.config.maxConcurrent}`);
    console.log('');
    
    try {
      // Step 1: Initialize and validate environment
      await this.initializeSystem();
      
      // Step 2: Analyze current state
      const analysisResults = await this.analyzeCurrentState();
      
      // Step 3: Map and fix image paths
      const pathResults = await this.fixImagePaths(analysisResults);
      
      // Step 4: Download missing images
      const downloadResults = await this.downloadMissingImages(pathResults);
      
      // Step 5: Quality assurance (optional)
      let qualityResults = null;
      if (!this.config.skipQuality) {
        qualityResults = await this.performQualityAssurance(downloadResults);
      }
      
      // Step 6: Generate comprehensive report
      const finalReport = await this.generateFinalReport(
        analysisResults, pathResults, downloadResults, qualityResults
      );
      
      console.log('\n🎉 COMPREHENSIVE IMAGE FIXING COMPLETED!');
      console.log('========================================');
      console.log(`📊 Articles processed: ${this.executionStats.articlesProcessed}`);
      console.log(`🖼️  Images fixed: ${this.executionStats.imagesFixed}`);
      console.log(`📥 Images downloaded: ${this.executionStats.imagesDownloaded}`);
      console.log(`🗺️  Paths mapped: ${this.executionStats.pathsMapped}`);
      console.log(`⏱️  Execution time: ${((Date.now() - this.executionStats.startTime) / 1000).toFixed(2)}s`);
      console.log(`📄 Report: ${finalReport.reportPath}`);
      
      if (this.config.dryRun) {
        console.log('\n⚠️  DRY RUN MODE - No actual changes were made');
        console.log('Remove --dry-run flag to apply changes');
      }
      
    } catch (error) {
      console.error('\n❌ Image fixing failed:', error.message);
      console.error('Stack trace:', error.stack);
      process.exit(1);
    }
  }

  async initializeSystem() {
    console.log('🔧 Initializing system...');
    
    // Ensure directories exist
    await fs.mkdir(this.reportDir, { recursive: true });
    await this.cacheManager.ensureCacheDirectory();
    
    // Validate environment
    const requiredDirs = ['content', 'public/images'];
    for (const dir of requiredDirs) {
      const dirPath = path.join(this.projectRoot, dir);
      try {
        await fs.access(dirPath);
      } catch (error) {
        throw new Error(`Required directory not found: ${dir}`);
      }
    }
    
    // Load existing path mappings
    await this.pathMapper.loadExistingMappings();
    
    console.log('✅ System initialized successfully');
  }

  async analyzeCurrentState() {
    console.log('\n📊 Analyzing current image state...');
    
    try {
      // Analyze articles for image requirements
      const imageRequirements = await this.imageHunter.analyzeContentForImages();
      
      // Count missing vs existing images
      let missingCount = 0;
      let existingCount = 0;
      
      for (const req of imageRequirements) {
        for (const imgSpec of req.imageSpecs) {
          try {
            await fs.access(path.join(this.projectRoot, 'public', imgSpec.originalPath));
            existingCount++;
          } catch (error) {
            missingCount++;
          }
        }
      }
      
      this.executionStats.articlesProcessed = imageRequirements.length;
      
      const analysis = {
        totalArticles: imageRequirements.length,
        totalImages: missingCount + existingCount,
        missingImages: missingCount,
        existingImages: existingCount,
        requirements: imageRequirements,
        coverageRate: ((existingCount / (missingCount + existingCount)) * 100).toFixed(1)
      };
      
      console.log(`📄 Articles analyzed: ${analysis.totalArticles}`);
      console.log(`🖼️  Total images referenced: ${analysis.totalImages}`);
      console.log(`❌ Missing images: ${analysis.missingImages}`);
      console.log(`✅ Existing images: ${analysis.existingImages}`);
      console.log(`📈 Coverage rate: ${analysis.coverageRate}%`);
      
      return analysis;
      
    } catch (error) {
      console.error('Analysis failed:', error.message);
      this.executionStats.errors.push({
        phase: 'analysis',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async fixImagePaths(analysisResults) {
    console.log('\n🗺️  Mapping and fixing image paths...');
    
    try {
      // Generate intelligent mappings for all paths
      const mappingResults = await this.pathMapper.mapAllImagePaths();
      
      // Apply mappings to fix actual files
      let pathFixes = [];
      if (!this.config.dryRun) {
        pathFixes = await this.pathMapper.applyPathMappings(false);
        this.executionStats.pathsFixed = pathFixes.length;
      } else {
        pathFixes = await this.pathMapper.applyPathMappings(true); // dry run
        console.log(`🔍 Would fix ${pathFixes.length} path references`);
      }
      
      this.executionStats.pathsMapped = mappingResults.summary.totalMappings;
      
      console.log(`🗺️  Total mappings created: ${mappingResults.summary.totalMappings}`);
      console.log(`🔧 Path fixes applied: ${pathFixes.length}`);
      
      return {
        mappings: mappingResults,
        fixes: pathFixes
      };
      
    } catch (error) {
      console.error('Path mapping failed:', error.message);
      this.executionStats.errors.push({
        phase: 'path_mapping',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async downloadMissingImages(pathResults) {
    console.log('\n📥 Downloading missing images...');
    
    try {
      // Process image requirements with intelligent sourcing
      const imageRequirements = await this.imageHunter.analyzeContentForImages();
      const downloadResults = [];
      
      // Process in batches to avoid overwhelming APIs
      const batchSize = this.config.maxConcurrent;
      for (let i = 0; i < imageRequirements.length; i += batchSize) {
        const batch = imageRequirements.slice(i, i + batchSize);
        
        console.log(`📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(imageRequirements.length/batchSize)}`);
        
        const batchPromises = batch.map(async (req) => {
          const reqResults = [];
          
          for (const imageSpec of req.imageSpecs) {
            try {
              // Check if image already exists
              const targetPath = path.join(this.projectRoot, 'public', imageSpec.originalPath);
              try {
                await fs.access(targetPath);
                reqResults.push({
                  path: imageSpec.originalPath,
                  status: 'exists',
                  action: 'skipped'
                });
                continue;
              } catch (error) {
                // Image doesn't exist, need to download
              }
              
              if (this.config.dryRun) {
                reqResults.push({
                  path: imageSpec.originalPath,
                  status: 'would_download',
                  action: 'dry_run'
                });
                continue;
              }
              
              // Get image URL from source manager
              const imageUrl = await this.sourceManager.getImageUrl(
                path.basename(imageSpec.originalPath),
                {
                  searchQuery: imageSpec.searchQuery,
                  category: req.product.category,
                  quality: this.config.quality,
                  dimensions: imageSpec.dimensions
                }
              );
              
              if (imageUrl) {
                // Download and cache
                const cachedImage = await this.cacheManager.downloadAndCache(imageUrl, {
                  dimensions: imageSpec.dimensions,
                  quality: this.config.quality
                });
                
                if (cachedImage) {
                  // Copy from cache to target location
                  await this.copyImageToTarget(cachedImage.localPath, targetPath);
                  
                  reqResults.push({
                    path: imageSpec.originalPath,
                    status: 'downloaded',
                    action: 'success',
                    sourceUrl: imageUrl,
                    size: cachedImage.size
                  });
                  
                  this.executionStats.imagesDownloaded++;
                }
              } else {
                reqResults.push({
                  path: imageSpec.originalPath,
                  status: 'no_source',
                  action: 'failed'
                });
              }
              
            } catch (error) {
              console.warn(`Failed to process ${imageSpec.originalPath}:`, error.message);
              reqResults.push({
                path: imageSpec.originalPath,
                status: 'error',
                action: 'failed',
                error: error.message
              });
            }
          }
          
          return {
            article: req.file,
            results: reqResults
          };
        });
        
        const batchResults = await Promise.allSettled(batchPromises);
        downloadResults.push(...batchResults.map(r => r.status === 'fulfilled' ? r.value : { error: r.reason }));
        
        // Rate limiting delay between batches
        if (i + batchSize < imageRequirements.length) {
          await this.sleep(2000); // 2 second delay
        }
      }
      
      const successCount = downloadResults.reduce((count, result) => {
        return count + (result.results?.filter(r => r.status === 'downloaded').length || 0);
      }, 0);
      
      console.log(`✅ Successfully downloaded: ${successCount} images`);
      
      return downloadResults;
      
    } catch (error) {
      console.error('Image downloading failed:', error.message);
      this.executionStats.errors.push({
        phase: 'download',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async copyImageToTarget(sourcePath, targetPath) {
    // Ensure target directory exists
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    
    // Copy file
    await fs.copyFile(sourcePath, targetPath);
  }

  async performQualityAssurance(downloadResults) {
    console.log('\n🔍 Performing quality assurance...');
    
    try {
      // Get all existing images for validation
      const existingImages = await this.getAllImagePaths();
      
      // Validate batch of images
      const qualityResults = await this.qualityAssurance.validateImageBatch(existingImages);
      
      // Count quality issues
      this.executionStats.qualityIssues = qualityResults.results.filter(r => !r.passed).length;
      
      console.log(`📊 Images validated: ${qualityResults.results.length}`);
      console.log(`✅ Passed quality check: ${qualityResults.summary.passed}`);
      console.log(`❌ Quality issues: ${this.executionStats.qualityIssues}`);
      console.log(`📈 Average score: ${qualityResults.summary.averageScore}/100`);
      
      return qualityResults;
      
    } catch (error) {
      console.warn('Quality assurance failed:', error.message);
      // Don't fail the entire process for QA issues
      return null;
    }
  }

  async getAllImagePaths() {
    const imagePaths = [];
    const imagesDir = path.join(this.projectRoot, 'public', 'images');
    
    async function scanDir(dir) {
      try {
        const items = await fs.readdir(dir, { withFileTypes: true });
        
        for (const item of items) {
          const fullPath = path.join(dir, item.name);
          
          if (item.isDirectory()) {
            await scanDir(fullPath);
          } else if (/\.(jpg|jpeg|png|webp)$/i.test(item.name)) {
            imagePaths.push(fullPath);
          }
        }
      } catch (error) {
        // Skip inaccessible directories
      }
    }
    
    await scanDir(imagesDir);
    return imagePaths;
  }

  async generateFinalReport(analysisResults, pathResults, downloadResults, qualityResults) {
    console.log('\n📄 Generating comprehensive report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      config: this.config,
      execution: {
        ...this.executionStats,
        totalTime: Date.now() - this.executionStats.startTime,
        success: this.executionStats.errors.length === 0
      },
      analysis: analysisResults,
      pathMapping: pathResults,
      downloads: downloadResults,
      quality: qualityResults,
      recommendations: this.generateRecommendations(analysisResults, pathResults, downloadResults, qualityResults)
    };
    
    const reportPath = path.join(this.reportDir, `image-fixing-report-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    // Also create a human-readable summary
    const summaryPath = path.join(this.reportDir, `image-fixing-summary-${Date.now()}.md`);
    await this.generateMarkdownSummary(report, summaryPath);
    
    console.log(`📊 Detailed report: ${reportPath}`);
    console.log(`📝 Summary report: ${summaryPath}`);
    
    return { report, reportPath, summaryPath };
  }

  generateRecommendations(analysis, paths, downloads, quality) {
    const recommendations = [];
    
    // Analysis-based recommendations
    if (analysis.coverageRate < 80) {
      recommendations.push({
        category: 'coverage',
        priority: 'high',
        title: 'Improve Image Coverage',
        description: `Only ${analysis.coverageRate}% of referenced images exist`,
        actions: [
          'Run image sourcing system regularly',
          'Update content creation workflow to include image planning',
          'Consider automated image generation for placeholders'
        ]
      });
    }
    
    // Path mapping recommendations
    if (paths.mappings.summary.errors > 0) {
      recommendations.push({
        category: 'paths',
        priority: 'medium',
        title: 'Fix Path Mapping Issues',
        description: `${paths.mappings.summary.errors} path mapping errors occurred`,
        actions: [
          'Review and standardize image naming conventions',
          'Update article templates to use consistent paths',
          'Implement path validation in content workflow'
        ]
      });
    }
    
    // Download recommendations
    const failedDownloads = downloads?.filter(d => d.results?.some(r => r.status === 'error')).length || 0;
    if (failedDownloads > 0) {
      recommendations.push({
        category: 'downloads',
        priority: 'medium',
        title: 'Improve Download Success Rate',
        description: `${failedDownloads} image downloads failed`,
        actions: [
          'Check API credentials and rate limits',
          'Review fallback image sources',
          'Implement retry logic with backoff'
        ]
      });
    }
    
    // Quality recommendations
    if (quality && quality.summary.passRate < 80) {
      recommendations.push({
        category: 'quality',
        priority: 'high',
        title: 'Address Quality Issues',
        description: `Only ${quality.summary.passRate}% of images meet quality standards`,
        actions: [
          'Implement automated image optimization',
          'Create quality guidelines for content creators',
          'Set up pre-publication image validation'
        ]
      });
    }
    
    return recommendations;
  }

  async generateMarkdownSummary(report, outputPath) {
    const summary = `# Image Fixing Report

Generated: ${report.timestamp}
Mode: ${report.config.dryRun ? 'DRY RUN' : 'PRODUCTION'}

## Executive Summary

- **Articles Processed**: ${report.execution.articlesProcessed}
- **Images Fixed**: ${report.execution.imagesFixed}
- **Images Downloaded**: ${report.execution.imagesDownloaded}
- **Paths Mapped**: ${report.execution.pathsMapped}
- **Execution Time**: ${(report.execution.totalTime / 1000).toFixed(2)}s
- **Success**: ${report.execution.success ? '✅ Yes' : '❌ No'}

## Analysis Results

- **Total Images Referenced**: ${report.analysis.totalImages}
- **Missing Images**: ${report.analysis.missingImages}
- **Coverage Rate**: ${report.analysis.coverageRate}%

## Path Mapping

- **Total Mappings**: ${report.pathMapping.mappings.summary.totalMappings}
- **Path Fixes Applied**: ${report.pathMapping.fixes.length}

## Quality Assurance

${report.quality ? `
- **Images Validated**: ${report.quality.results.length}
- **Pass Rate**: ${report.quality.summary.passRate}%
- **Average Score**: ${report.quality.summary.averageScore}/100
` : 'Quality assurance was skipped'}

## Recommendations

${report.recommendations.map(rec => `
### ${rec.title} (${rec.priority} priority)

${rec.description}

Actions:
${rec.actions.map(action => `- ${action}`).join('\n')}
`).join('\n')}

## Next Steps

${report.config.dryRun ? `
This was a dry run. To apply changes:
1. Review this report
2. Run the command without --dry-run flag
3. Monitor the results
` : `
Changes have been applied. Next steps:
1. Verify images are displaying correctly
2. Run npm run build to test production build
3. Deploy changes to production
4. Monitor image loading performance
`}
`;

    await fs.writeFile(outputPath, summary);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run the comprehensive image fixer
if (require.main === module) {
  const fixer = new ComprehensiveImageFixer();
  fixer.run().catch(console.error);
}

module.exports = { ComprehensiveImageFixer };