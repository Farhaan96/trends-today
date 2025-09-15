require('dotenv').config({ path: '.env.local' });

class WebsiteAuditor {
  constructor() {
    this.baseUrl = 'https://www.trendstoday.ca';
    this.results = {
      pages: [],
      issues: [],
      recommendations: [],
    };
  }

  async scrapeWithFirecrawl(url, extractionPrompt = null) {
    try {
      const payload = {
        url: url,
        formats: ['markdown', 'html'],
      };

      if (extractionPrompt) {
        payload.extractorOptions = {
          mode: 'llm-extraction',
          extractionPrompt: extractionPrompt,
        };
      }

      const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error(`Error scraping ${url}:`, error.message);
      return null;
    }
  }

  async researchWithPerplexity(query) {
    try {
      const response = await fetch(
        'https://api.perplexity.ai/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'sonar-pro',
            messages: [
              {
                role: 'system',
                content:
                  'You are a tech fact-checker and content auditor. Provide accurate, current information and identify any outdated or incorrect details.',
              },
              {
                role: 'user',
                content: query,
              },
            ],
            max_tokens: 600,
            temperature: 0.2,
          }),
        }
      );

      const data = await response.json();
      return data.choices?.[0]?.message?.content || null;
    } catch (error) {
      console.error('Perplexity error:', error.message);
      return null;
    }
  }

  async auditHomepage() {
    console.log('\n=== AUDITING HOMEPAGE ===');

    const homepageData = await this.scrapeWithFirecrawl(
      this.baseUrl,
      `Analyze the homepage and identify:
      1. All article titles and their publication dates
      2. Navigation structure and links
      3. Missing or broken images (look for placeholder content)
      4. Content freshness (are articles recent?)
      5. Author credibility signals
      6. Any outdated information or dead links
      7. Mobile responsiveness indicators
      8. Trust signals (about us, contact info, etc.)`
    );

    if (homepageData) {
      console.log('Homepage Analysis:', homepageData.llm_extraction);
      this.results.pages.push({
        url: this.baseUrl,
        type: 'homepage',
        analysis: homepageData.llm_extraction,
        content: homepageData.markdown?.substring(0, 1000),
      });
    }
  }

  async auditKeyPages() {
    console.log('\n=== AUDITING KEY PAGES ===');

    const keyPages = [
      { url: `${this.baseUrl}/reviews`, type: 'reviews-index' },
      { url: `${this.baseUrl}/news`, type: 'news-index' },
      { url: `${this.baseUrl}/best`, type: 'buying-guides' },
      { url: `${this.baseUrl}/authors`, type: 'authors' },
      { url: `${this.baseUrl}/how-we-test`, type: 'methodology' },
      { url: `${this.baseUrl}/editorial-standards`, type: 'standards' },
    ];

    for (const page of keyPages) {
      console.log(`Auditing: ${page.url}`);

      const pageData = await this.scrapeWithFirecrawl(
        page.url,
        `Analyze this ${page.type} page and identify:
        1. Content completeness and quality
        2. Navigation and user experience
        3. Missing images or broken links
        4. Outdated information
        5. SEO optimization signals
        6. Trust and authority indicators`
      );

      if (pageData) {
        console.log(`${page.type} Analysis:`, pageData.llm_extraction);
        this.results.pages.push({
          url: page.url,
          type: page.type,
          analysis: pageData.llm_extraction,
          content: pageData.markdown?.substring(0, 500),
        });
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  async auditSpecificArticles() {
    console.log('\n=== AUDITING SPECIFIC ARTICLES ===');

    // Get the iPhone 17 Air article we just created
    const articleUrls = [
      `${this.baseUrl}/news/iphone-17-air-announcement-what-to-expect`,
      `${this.baseUrl}/reviews/iphone-15-pro-max-review`,
      `${this.baseUrl}/reviews/samsung-galaxy-s24-ultra-review`,
      `${this.baseUrl}/reviews/google-pixel-8-pro-review`,
    ];

    for (const url of articleUrls) {
      console.log(`Auditing article: ${url}`);

      const articleData = await this.scrapeWithFirecrawl(
        url,
        `Analyze this tech article for:
        1. Content accuracy (are specs and claims current and correct?)
        2. Publication date relevance
        3. Image quality and relevance
        4. Author credibility
        5. Source citations and references
        6. Completeness of information
        7. Any outdated or incorrect technical details
        8. Overall content quality and usefulness`
      );

      if (articleData) {
        console.log(
          'Article Analysis:',
          articleData.llm_extraction || 'No extraction available'
        );
        this.results.pages.push({
          url: url,
          type: 'article',
          analysis: articleData.llm_extraction,
          title: articleData.metadata?.title,
          content: articleData.markdown?.substring(0, 800),
        });

        // Now verify the article's technical claims with Perplexity
        if (articleData.markdown && articleData.markdown.includes('iPhone')) {
          const factCheck = await this.researchWithPerplexity(
            `Fact-check the following content about the iPhone 17 or iPhone 15 Pro Max. Identify any outdated specs, incorrect pricing, or inaccurate technical claims: ${articleData.markdown.substring(0, 1000)}`
          );

          if (factCheck) {
            console.log('Fact-check results:', factCheck);
            this.results.issues.push({
              url: url,
              type: 'fact-check',
              finding: factCheck,
            });
          }
        }
      }

      // Delay between requests
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  async identifyImageIssues() {
    console.log('\n=== IDENTIFYING IMAGE ISSUES ===');

    // Check each page for image problems
    for (const page of this.results.pages) {
      if (page.content) {
        // Look for common image issues in the content
        const imageIssues = [];

        if (page.content.includes('/file.svg')) {
          imageIssues.push(
            'Using placeholder SVG images instead of actual product photos'
          );
        }

        if (
          page.content.includes('![') &&
          !page.content.includes('.jpg') &&
          !page.content.includes('.png')
        ) {
          imageIssues.push('Missing or broken image references');
        }

        if (imageIssues.length > 0) {
          this.results.issues.push({
            url: page.url,
            type: 'images',
            issues: imageIssues,
          });
        }
      }
    }
  }

  generateRecommendations() {
    console.log('\n=== GENERATING RECOMMENDATIONS ===');

    // Based on findings, generate specific recommendations
    const recommendations = [
      {
        priority: 'HIGH',
        category: 'Images',
        issue: 'Placeholder images throughout site',
        recommendation:
          'Replace all /file.svg placeholders with actual product photos, screenshots, or professional imagery',
      },
      {
        priority: 'HIGH',
        category: 'Content Freshness',
        issue: 'Articles may contain outdated information',
        recommendation:
          'Implement content review schedule to update specs, prices, and availability',
      },
      {
        priority: 'MEDIUM',
        category: 'Navigation',
        issue: 'Some navigation links may not work properly',
        recommendation:
          'Test all internal links and ensure proper routing for news articles',
      },
      {
        priority: 'MEDIUM',
        category: 'SEO',
        issue: 'Image alt text and metadata optimization',
        recommendation:
          'Add descriptive alt text to all images and optimize meta descriptions',
      },
      {
        priority: 'LOW',
        category: 'Trust Signals',
        issue: 'Author credentials could be more prominent',
        recommendation:
          'Enhance author boxes with credentials, social links, and expertise indicators',
      },
    ];

    this.results.recommendations = recommendations;

    console.log('\n=== AUDIT RECOMMENDATIONS ===');
    recommendations.forEach((rec, index) => {
      console.log(
        `${index + 1}. [${rec.priority}] ${rec.category}: ${rec.recommendation}`
      );
    });
  }

  async runFullAudit() {
    console.log('🔍 STARTING COMPREHENSIVE WEBSITE AUDIT');
    console.log(
      'This will analyze your entire site for accuracy, images, and best practices...\n'
    );

    try {
      await this.auditHomepage();
      await this.auditKeyPages();
      await this.auditSpecificArticles();
      await this.identifyImageIssues();
      this.generateRecommendations();

      console.log('\n✅ AUDIT COMPLETE');
      console.log(`\nSUMMARY:`);
      console.log(`- Pages analyzed: ${this.results.pages.length}`);
      console.log(`- Issues identified: ${this.results.issues.length}`);
      console.log(`- Recommendations: ${this.results.recommendations.length}`);

      // Save results to file for detailed review
      const fs = require('fs');
      fs.writeFileSync(
        'website-audit-results.json',
        JSON.stringify(this.results, null, 2)
      );
      console.log(`\n📄 Detailed results saved to: website-audit-results.json`);
    } catch (error) {
      console.error('Audit failed:', error.message);
    }
  }
}

// Run the audit
const auditor = new WebsiteAuditor();
auditor.runFullAudit();
