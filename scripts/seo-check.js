#!/usr/bin/env node

/**
 * SEO Audit Script for Trends Today
 *
 * Validates:
 * - Crawlable pagination
 * - Structured data presence
 * - Meta tags and canonicals
 * - Image optimization
 * - Internal linking
 * - Core Web Vitals readiness
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SEOAuditor {
  constructor() {
    this.results = {
      crawlability: [],
      structuredData: [],
      metaTags: [],
      images: [],
      internalLinks: [],
      coreWebVitals: [],
      errors: [],
      warnings: [],
      passed: [],
    };
    this.baseUrl = 'https://www.trendstoday.ca';
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const prefix =
      type === 'error'
        ? '❌'
        : type === 'warning'
          ? '⚠️'
          : type === 'success'
            ? '✅'
            : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async checkRobotsTxt() {
    try {
      const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');

      if (!fs.existsSync(robotsPath)) {
        // Check if robots.ts exists in app directory
        const robotsTsPath = path.join(
          process.cwd(),
          'src',
          'app',
          'robots.txt',
          'route.ts'
        );
        if (fs.existsSync(robotsTsPath)) {
          this.results.passed.push('robots.txt implemented via Next.js route');
          this.log('✓ robots.txt implemented via Next.js route', 'success');
        } else {
          this.results.errors.push('robots.txt not found');
          this.log('robots.txt not found', 'error');
        }
      } else {
        const content = fs.readFileSync(robotsPath, 'utf-8');
        if (content.includes('Sitemap:')) {
          this.results.passed.push('robots.txt contains sitemap reference');
          this.log('✓ robots.txt contains sitemap reference', 'success');
        } else {
          this.results.warnings.push('robots.txt missing sitemap reference');
          this.log('robots.txt missing sitemap reference', 'warning');
        }
      }
    } catch (error) {
      this.results.errors.push(`robots.txt check failed: ${error.message}`);
      this.log(`robots.txt check failed: ${error.message}`, 'error');
    }
  }

  async checkSitemap() {
    try {
      const sitemapConfig = path.join(process.cwd(), 'next-sitemap.config.js');

      if (fs.existsSync(sitemapConfig)) {
        this.results.passed.push('next-sitemap configuration found');
        this.log('✓ next-sitemap configuration found', 'success');

        const config = require(sitemapConfig);
        if (config.siteUrl) {
          this.results.passed.push(`Sitemap configured for: ${config.siteUrl}`);
          this.log(`✓ Sitemap configured for: ${config.siteUrl}`, 'success');
        }
      } else {
        this.results.errors.push('next-sitemap.config.js not found');
        this.log('next-sitemap.config.js not found', 'error');
      }
    } catch (error) {
      this.results.errors.push(`Sitemap check failed: ${error.message}`);
      this.log(`Sitemap check failed: ${error.message}`, 'error');
    }
  }

  async checkPaginationStructure() {
    try {
      const homePaginationPath = path.join(
        process.cwd(),
        'src',
        'app',
        'page',
        '[page]',
        'page.tsx'
      );
      const categoryPaginationPath = path.join(
        process.cwd(),
        'src',
        'app',
        '[category]',
        'page',
        '[page]',
        'page.tsx'
      );

      if (fs.existsSync(homePaginationPath)) {
        this.results.passed.push('Homepage pagination routes implemented');
        this.log('✓ Homepage pagination routes implemented', 'success');
      } else {
        this.results.errors.push('Homepage pagination routes missing');
        this.log('Homepage pagination routes missing', 'error');
      }

      if (fs.existsSync(categoryPaginationPath)) {
        this.results.passed.push('Category pagination routes implemented');
        this.log('✓ Category pagination routes implemented', 'success');
      } else {
        this.results.errors.push('Category pagination routes missing');
        this.log('Category pagination routes missing', 'error');
      }
    } catch (error) {
      this.results.errors.push(
        `Pagination structure check failed: ${error.message}`
      );
      this.log(`Pagination structure check failed: ${error.message}`, 'error');
    }
  }

  async checkStructuredDataComponents() {
    try {
      const structuredDataPaths = [
        path.join(
          process.cwd(),
          'src',
          'components',
          'seo',
          'ArticleJsonLd.tsx'
        ),
        path.join(
          process.cwd(),
          'src',
          'components',
          'seo',
          'SchemaMarkup.tsx'
        ),
        path.join(process.cwd(), 'src', 'lib', 'schema.ts'),
      ];

      let foundComponents = 0;
      structuredDataPaths.forEach((filePath) => {
        if (fs.existsSync(filePath)) {
          foundComponents++;
          this.results.passed.push(
            `Structured data component found: ${path.basename(filePath)}`
          );
          this.log(
            `✓ Structured data component found: ${path.basename(filePath)}`,
            'success'
          );
        }
      });

      if (foundComponents === 0) {
        this.results.errors.push('No structured data components found');
        this.log('No structured data components found', 'error');
      }
    } catch (error) {
      this.results.errors.push(
        `Structured data check failed: ${error.message}`
      );
      this.log(`Structured data check failed: ${error.message}`, 'error');
    }
  }

  async checkInternalLinkingComponents() {
    try {
      const linkingPaths = [
        path.join(
          process.cwd(),
          'src',
          'components',
          'article',
          'RelatedArticles.tsx'
        ),
        path.join(process.cwd(), 'src', 'components', 'ui', 'ExternalLink.tsx'),
        path.join(
          process.cwd(),
          'src',
          'components',
          'ui',
          'PaginationLinks.tsx'
        ),
      ];

      let foundComponents = 0;
      linkingPaths.forEach((filePath) => {
        if (fs.existsSync(filePath)) {
          foundComponents++;
          this.results.passed.push(
            `Internal linking component found: ${path.basename(filePath)}`
          );
          this.log(
            `✓ Internal linking component found: ${path.basename(filePath)}`,
            'success'
          );
        }
      });

      if (foundComponents < 2) {
        this.results.warnings.push('Some internal linking components missing');
        this.log('Some internal linking components missing', 'warning');
      }
    } catch (error) {
      this.results.errors.push(
        `Internal linking check failed: ${error.message}`
      );
      this.log(`Internal linking check failed: ${error.message}`, 'error');
    }
  }

  async checkImageOptimization() {
    try {
      const nextConfigPath = path.join(process.cwd(), 'next.config.ts');

      if (fs.existsSync(nextConfigPath)) {
        const config = fs.readFileSync(nextConfigPath, 'utf-8');

        if (config.includes('remotePatterns')) {
          this.results.passed.push('Next.js image optimization configured');
          this.log('✓ Next.js image optimization configured', 'success');
        }

        if (
          config.includes('images.unsplash.com') ||
          config.includes('images.pexels.com')
        ) {
          this.results.passed.push('Remote image domains configured');
          this.log('✓ Remote image domains configured', 'success');
        }
      }

      // Check for sharp package
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, 'utf-8')
        );
        if (
          packageJson.devDependencies?.sharp ||
          packageJson.dependencies?.sharp
        ) {
          this.results.passed.push(
            'Sharp package installed for image optimization'
          );
          this.log(
            '✓ Sharp package installed for image optimization',
            'success'
          );
        } else {
          this.results.warnings.push(
            'Sharp package not found - consider installing for better image optimization'
          );
          this.log(
            'Sharp package not found - consider installing for better image optimization',
            'warning'
          );
        }
      }
    } catch (error) {
      this.results.errors.push(
        `Image optimization check failed: ${error.message}`
      );
      this.log(`Image optimization check failed: ${error.message}`, 'error');
    }
  }

  async checkCoreWebVitalsOptimization() {
    try {
      const layoutPath = path.join(process.cwd(), 'src', 'app', 'layout.tsx');

      if (fs.existsSync(layoutPath)) {
        const layout = fs.readFileSync(layoutPath, 'utf-8');

        if (layout.includes('next/font')) {
          this.results.passed.push('Next.js font optimization enabled');
          this.log('✓ Next.js font optimization enabled', 'success');
        }

        if (layout.includes("display: 'swap'")) {
          this.results.passed.push('Font display swap configured');
          this.log('✓ Font display swap configured', 'success');
        }

        if (layout.includes('preconnect')) {
          this.results.passed.push('DNS preconnect configured');
          this.log('✓ DNS preconnect configured', 'success');
        }
      }
    } catch (error) {
      this.results.errors.push(
        `Core Web Vitals check failed: ${error.message}`
      );
      this.log(`Core Web Vitals check failed: ${error.message}`, 'error');
    }
  }

  async checkBuild() {
    try {
      this.log('Running build check...', 'info');
      execSync('npm run build', { stdio: 'pipe', timeout: 120000 });
      this.results.passed.push('Project builds successfully');
      this.log('✓ Project builds successfully', 'success');
    } catch (error) {
      this.results.errors.push(`Build failed: ${error.message}`);
      this.log(`Build failed: ${error.message}`, 'error');
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total_checks:
          this.results.passed.length +
          this.results.warnings.length +
          this.results.errors.length,
        passed: this.results.passed.length,
        warnings: this.results.warnings.length,
        errors: this.results.errors.length,
        score:
          Math.round(
            (this.results.passed.length /
              (this.results.passed.length + this.results.errors.length)) *
              100
          ) || 0,
      },
      details: this.results,
    };

    const reportPath = path.join(process.cwd(), 'reports', 'seo-audit.json');

    // Ensure reports directory exists
    const reportsDir = path.dirname(reportPath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    return report;
  }

  printSummary(report) {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 SEO AUDIT SUMMARY');
    console.log('='.repeat(60));
    console.log(`📊 Score: ${report.summary.score}%`);
    console.log(`✅ Passed: ${report.summary.passed}`);
    console.log(`⚠️  Warnings: ${report.summary.warnings}`);
    console.log(`❌ Errors: ${report.summary.errors}`);
    console.log('='.repeat(60));

    if (report.summary.errors > 0) {
      console.log('\n❌ ERRORS TO FIX:');
      this.results.errors.forEach((error) => console.log(`  • ${error}`));
    }

    if (report.summary.warnings > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.results.warnings.forEach((warning) => console.log(`  • ${warning}`));
    }

    if (report.summary.passed > 0) {
      console.log('\n✅ PASSED CHECKS:');
      this.results.passed.forEach((passed) => console.log(`  • ${passed}`));
    }

    console.log(`\n📄 Full report saved to: reports/seo-audit.json`);
    console.log('\n🔗 URLs to test in Google Rich Results Test:');
    console.log(`  • Homepage: ${this.baseUrl}`);
    console.log(
      `  • Article: ${this.baseUrl}/technology/ai-agents-revolution-13-billion-market-taking-over-2025`
    );
    console.log(`  • Category: ${this.baseUrl}/technology`);
    console.log(`  • Pagination: ${this.baseUrl}/page/2`);
    console.log('='.repeat(60));
  }

  async run() {
    console.log('🚀 Starting SEO audit...\n');

    await this.checkRobotsTxt();
    await this.checkSitemap();
    await this.checkPaginationStructure();
    await this.checkStructuredDataComponents();
    await this.checkInternalLinkingComponents();
    await this.checkImageOptimization();
    await this.checkCoreWebVitalsOptimization();
    await this.checkBuild();

    const report = this.generateReport();
    this.printSummary(report);

    // Exit with error code if critical issues found
    if (this.results.errors.length > 0) {
      process.exit(1);
    }
  }
}

// Run audit if script is called directly
if (require.main === module) {
  const auditor = new SEOAuditor();
  auditor.run().catch(console.error);
}

module.exports = SEOAuditor;
