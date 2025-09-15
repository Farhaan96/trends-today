#!/usr/bin/env node

const CDPClient = require('../client.js');

class EnhancedSERPCollector {
  constructor() {
    this.client = new CDPClient({
      rateLimitMs: 600, // Slower to avoid detection
      defaultTimeoutMs: 30000,
    });
  }

  async collect(query, maxResults = 10) {
    try {
      console.error(`🔍 Enhanced SERP collection for: "${query}"`);

      // Connect to Chrome
      await this.client.connect();

      // Navigate directly to search results (bypass consent/typing issues)
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=${maxResults + 5}`;
      console.error('📡 Navigating directly to search results...');
      await this.client.open(searchUrl);

      // Wait for initial page load
      await this.client.waitForLoad();
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Handle consent dialog if present
      await this.handleConsentDialog();

      // Wait for search results container
      console.error('⏳ Waiting for search results...');
      await this.waitForSearchResults();

      // Extract results using multiple strategies
      console.error('📊 Extracting search results...');
      const results = await this.extractSearchResults(maxResults);

      if (results.length === 0) {
        throw new Error(
          'No search results found - Google may have blocked the request'
        );
      }

      console.error(`✅ Successfully extracted ${results.length} results`);
      return {
        query: query,
        timestamp: new Date().toISOString(),
        resultsCount: results.length,
        results: results,
      };
    } catch (error) {
      console.error(`❌ Error collecting SERP data: ${error.message}`);
      throw error;
    } finally {
      await this.client.disconnect();
    }
  }

  async handleConsentDialog() {
    try {
      console.error('🍪 Checking for consent dialog...');

      // Wait a moment for dialog to appear
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 2024 Google consent selectors (from research)
      const consentSelectors = [
        '#L2AGLb', // "I agree" button
        '[aria-label*="Accept"]',
        '[aria-label*="Agree"]',
        'button[jsname="higCR"]',
        '#W0wltc', // "Reject all" button
        'button:contains("Accept all")',
        'button:contains("I agree")',
      ];

      for (const selector of consentSelectors) {
        try {
          const nodeId = await this.client.domQuerySelector(selector);
          if (nodeId) {
            console.error(`✓ Found consent button: ${selector}`);
            await this.client.click(selector);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            break;
          }
        } catch (e) {
          // Continue to next selector
          continue;
        }
      }
    } catch (error) {
      console.error(
        'Consent dialog handling failed (non-critical):',
        error.message
      );
    }
  }

  async waitForSearchResults() {
    // Multiple selectors for search results container (2024 compatible)
    const containerSelectors = [
      '#search',
      '#center_col',
      '[data-async-context]',
      '#rso',
      '.g',
    ];

    for (const selector of containerSelectors) {
      try {
        await this.client.waitForSelector(selector, { timeoutMs: 10000 });
        console.error(`✓ Found results container: ${selector}`);
        return;
      } catch (e) {
        continue;
      }
    }

    // If no container found, continue anyway
    console.error('⚠️ No specific results container found, proceeding...');
  }

  async extractSearchResults(maxResults) {
    const results = [];

    // Strategy 1: Use enhanced DOM methods with 2024 selectors
    const strategy1Results = await this.extractWithDOMMethod();
    if (strategy1Results.length > 0) {
      return strategy1Results.slice(0, maxResults);
    }

    // Strategy 2: Fallback to JavaScript evaluation with stable selectors
    const strategy2Results = await this.extractWithEvaluate();
    if (strategy2Results.length > 0) {
      return strategy2Results.slice(0, maxResults);
    }

    // Strategy 3: Last resort - extract any links
    const strategy3Results = await this.extractAnyLinks();
    return strategy3Results.slice(0, maxResults);
  }

  async extractWithDOMMethod() {
    const results = [];

    try {
      // 2024 stable selectors (based on research)
      const resultSelectors = [
        'div[data-async-context] h3 a', // Data attributes are more stable
        'h3 a[href][data-ved]', // Links with data-ved
        '.yuRUbf h3 a', // If yuRUbf still works
        '[data-ved] h3 a', // Any element with data-ved containing h3 link
        'h3 a[href*="/url?"]', // Google's URL format
      ];

      for (const selector of resultSelectors) {
        try {
          const nodeIds = await this.client.domQuerySelectorAll(selector);

          if (nodeIds.length > 0) {
            console.error(
              `✓ Found ${nodeIds.length} results with: ${selector}`
            );

            for (let i = 0; i < Math.min(nodeIds.length, 15); i++) {
              try {
                const nodeId = nodeIds[i];
                const attributes = await this.client.domGetAttributes(nodeId);

                if (!attributes.href) continue;

                let url = attributes.href;
                let title = '';

                // Extract title from link text
                try {
                  title = await this.client.evaluate(`
                    (function() {
                      const links = document.querySelectorAll('${selector}');
                      if (links[${i}]) {
                        return links[${i}].textContent?.trim() || '';
                      }
                      return '';
                    })();
                  `);
                } catch (e) {
                  title = attributes.title || 'No title';
                }

                // Clean up Google URL redirects
                if (url.includes('/url?')) {
                  try {
                    const urlObj = new URL(url);
                    if (urlObj.searchParams.has('url')) {
                      url = urlObj.searchParams.get('url');
                    } else if (urlObj.searchParams.has('q')) {
                      url = urlObj.searchParams.get('q');
                    }
                  } catch (e) {
                    // Keep original URL if parsing fails
                  }
                }

                // Skip Google internal links
                if (
                  url.includes('google.com/search') ||
                  url.includes('accounts.google.com')
                ) {
                  continue;
                }

                // Extract snippet (try multiple approaches)
                let snippet = '';
                try {
                  snippet = await this.extractSnippetForResult(i, selector);
                } catch (e) {
                  snippet = '';
                }

                results.push({
                  position: results.length + 1,
                  title: title,
                  url: url,
                  snippet: snippet,
                });
              } catch (elementError) {
                continue; // Skip this element, continue with next
              }
            }

            if (results.length > 0) break; // Found results, stop trying selectors
          }
        } catch (selectorError) {
          continue; // Try next selector
        }
      }
    } catch (error) {
      console.error('DOM method extraction failed:', error.message);
    }

    return results;
  }

  async extractSnippetForResult(index, titleSelector) {
    // Snippet selectors for 2024 (based on research)
    const snippetSelectors = [
      '.VwiC3b',
      '.s3v9rd',
      '.lEBKkf span',
      '[data-content-feature="1"] span',
      '.st',
      '.IsZvec',
    ];

    for (const snippetSelector of snippetSelectors) {
      try {
        const snippet = await this.client.evaluate(`
          (function() {
            const titleLinks = document.querySelectorAll('${titleSelector}');
            if (titleLinks[${index}]) {
              const container = titleLinks[${index}].closest('div, article, .g, [data-ved]');
              if (container) {
                const snippetEl = container.querySelector('${snippetSelector}');
                if (snippetEl) {
                  return snippetEl.textContent?.trim() || '';
                }
              }
            }
            return '';
          })();
        `);

        if (snippet && snippet.length > 10) {
          return snippet;
        }
      } catch (e) {
        continue;
      }
    }

    return '';
  }

  async extractWithEvaluate() {
    try {
      console.error('🔄 Trying fallback extraction method...');

      const results = await this.client.evaluate(`
        (function() {
          const results = [];
          
          // Try multiple approaches for 2024
          const approaches = [
            // Approach 1: Data attributes
            () => document.querySelectorAll('a[href][data-ved]'),
            // Approach 2: H3 links
            () => document.querySelectorAll('h3 a[href]'),
            // Approach 3: Any links in result-like containers
            () => document.querySelectorAll('[data-async-context] a[href], [data-ved] a[href]'),
          ];
          
          let links = [];
          for (const approach of approaches) {
            try {
              const found = Array.from(approach());
              if (found.length > 0) {
                links = found;
                break;
              }
            } catch (e) {
              continue;
            }
          }
          
          for (let i = 0; i < Math.min(links.length, 15); i++) {
            const link = links[i];
            let href = link.href;
            const title = link.textContent?.trim() || '';
            
            if (!href || !title || title.length < 3) continue;
            
            // Skip Google internal links
            if (href.includes('google.com/search') || 
                href.includes('accounts.google.com') ||
                href.includes('/preferences') ||
                href.includes('/advanced_search')) {
              continue;
            }
            
            // Clean Google redirects
            if (href.includes('/url?')) {
              try {
                const url = new URL(href);
                if (url.searchParams.has('url')) {
                  href = url.searchParams.get('url');
                } else if (url.searchParams.has('q')) {
                  href = url.searchParams.get('q');
                }
              } catch (e) {
                // Keep original
              }
            }
            
            // Find snippet in parent container
            let snippet = '';
            try {
              const container = link.closest('div, article, [data-ved]');
              if (container) {
                const snippetSelectors = ['.VwiC3b', '.s3v9rd', '.lEBKkf span', '.st'];
                for (const sel of snippetSelectors) {
                  const snippetEl = container.querySelector(sel);
                  if (snippetEl) {
                    snippet = snippetEl.textContent?.trim() || '';
                    if (snippet.length > 10) break;
                  }
                }
              }
            } catch (e) {
              snippet = '';
            }
            
            results.push({
              position: results.length + 1,
              title: title,
              url: href,
              snippet: snippet
            });
          }
          
          return results;
        })();
      `);

      return results || [];
    } catch (error) {
      console.error('Evaluate extraction failed:', error.message);
      return [];
    }
  }

  async extractAnyLinks() {
    try {
      console.error('🔄 Trying last resort link extraction...');

      const results = await this.client.evaluate(`
        (function() {
          const results = [];
          const links = document.querySelectorAll('a[href]');
          
          for (const link of links) {
            const href = link.href;
            const title = link.textContent?.trim() || '';
            
            if (!href || !title) continue;
            
            // Only include external links with reasonable titles
            if (!href.includes('google.com') && 
                title.length > 5 && 
                title.length < 200 &&
                !title.includes('Sign in') &&
                !title.includes('Settings')) {
              
              results.push({
                position: results.length + 1,
                title: title,
                url: href,
                snippet: ''
              });
              
              if (results.length >= 10) break;
            }
          }
          
          return results;
        })();
      `);

      return results || [];
    } catch (error) {
      console.error('Last resort extraction failed:', error.message);
      return [];
    }
  }
}

// Main execution
async function main() {
  const query = process.argv[2];

  if (!query) {
    console.error('Usage: node collect-serp-v2.js "your search query"');
    console.error(
      'Example: node collect-serp-v2.js "site:reddit.com best budget earbuds 2025"'
    );
    process.exit(1);
  }

  const collector = new EnhancedSERPCollector();

  try {
    const results = await collector.collect(query, 10);

    // Output clean JSON to stdout
    console.log(JSON.stringify(results, null, 2));
  } catch (error) {
    console.error(`Fatal error: ${error.message}`);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.error('\n🛑 Received interrupt signal, shutting down...');
  process.exit(0);
});

if (require.main === module) {
  main().catch(console.error);
}

module.exports = EnhancedSERPCollector;
