#!/usr/bin/env node

const CDPClient = require('../client.js');
const path = require('path');

class SERPCollector {
  constructor() {
    this.client = new CDPClient({
      rateLimitMs: 500, // Be respectful to Google
      defaultTimeoutMs: 30000,
    });
  }

  async collect(query, maxResults = 10) {
    try {
      console.error(`🔍 Collecting SERP data for: "${query}"`);

      // Connect to Chrome
      await this.client.connect();

      // Navigate to Google
      console.error('📡 Navigating to Google...');
      await this.client.open('https://www.google.com');

      // Wait for page to load and handle consent dialog
      console.error('⏳ Waiting for page to load...');
      await this.client.waitForLoad();

      // Handle consent dialog more aggressively
      try {
        console.error('🍪 Handling consent dialog...');
        await this.client.evaluate(`
          (function() {
            // Wait a bit for dialog to appear
            return new Promise(resolve => {
              setTimeout(() => {
                // Try multiple consent button selectors
                const selectors = [
                  'button[id*="reject"]',
                  'button[id*="accept"]', 
                  'button[aria-label*="Accept"]',
                  'button[aria-label*="Reject"]',
                  'button:contains("Accept all")',
                  'button:contains("Reject all")',
                  'button:contains("I agree")',
                  '#L2AGLb', // Google's "I agree" button
                  'button[jsname="higCR"]' // Another Google consent button
                ];
                
                for (const selector of selectors) {
                  const button = document.querySelector(selector);
                  if (button) {
                    console.log('Clicking consent button:', selector);
                    button.click();
                    resolve(true);
                    return;
                  }
                }
                resolve(false);
              }, 2000);
            });
          })();
        `);
      } catch (e) {
        console.error('Consent handling failed:', e.message);
      }

      // Wait for search box with multiple selectors
      console.error('🔍 Looking for search box...');
      const searchBoxFound = await this.client.evaluate(`
        (function() {
          return new Promise((resolve) => {
            const selectors = ['input[name="q"]', 'input[title="Search"]', 'textarea[name="q"]', '#APjFqb'];
            let attempts = 0;
            
            function checkForSearchBox() {
              attempts++;
              
              for (const selector of selectors) {
                const element = document.querySelector(selector);
                if (element) {
                  console.log('Found search box with selector:', selector);
                  resolve(selector);
                  return;
                }
              }
              
              if (attempts > 30) { // 15 seconds max
                resolve(null);
                return;
              }
              
              setTimeout(checkForSearchBox, 500);
            }
            
            checkForSearchBox();
          });
        })();
      `);

      if (!searchBoxFound) {
        throw new Error('Could not find Google search box after waiting');
      }

      // Type search query using the found selector
      console.error('💬 Entering search query...');
      await this.client.type(searchBoxFound, query, { clearFirst: true });

      // Submit search
      console.error('🚀 Submitting search...');
      await this.client.evaluate(`
        const searchBox = document.querySelector('${searchBoxFound}');
        if (searchBox && searchBox.form) {
          searchBox.form.submit();
        } else {
          // Try pressing Enter key
          const event = new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            which: 13,
            keyCode: 13,
            bubbles: true
          });
          searchBox.dispatchEvent(event);
        }
      `);

      // Wait for results
      console.error('⏳ Waiting for search results...');
      await this.client.waitForSelector('#search', { timeoutMs: 15000 });

      // Extract SERP data
      console.error('📊 Extracting results...');
      const results = await this.client.evaluate(`
        (function() {
          const results = [];
          const maxResults = ${maxResults};
        
        // Look for organic search results
        const resultSelectors = [
          'div[data-async-context] div.g',
          '.g:has(h3)',
          '[data-async-context] .g',
          '#search .g'
        ];
        
        let elements = [];
        for (const selector of resultSelectors) {
          elements = document.querySelectorAll(selector);
          if (elements.length > 0) break;
        }
        
        console.log('Found', elements.length, 'result elements');
        
        let count = 0;
        for (const element of elements) {
          if (count >= maxResults) break;
          
          try {
            // Try different selectors for title
            const titleSelectors = ['h3', '.LC20lb', '[role="heading"]', '.DKV0Md'];
            let titleElement = null;
            let title = '';
            
            for (const sel of titleSelectors) {
              titleElement = element.querySelector(sel);
              if (titleElement) {
                title = titleElement.textContent.trim();
                break;
              }
            }
            
            if (!title) continue;
            
            // Try different selectors for URL
            const urlSelectors = ['a[href]', '[data-ved] a', '.yuRUbf a'];
            let urlElement = null;
            let url = '';
            
            for (const sel of urlSelectors) {
              urlElement = element.querySelector(sel);
              if (urlElement && urlElement.href) {
                url = urlElement.href;
                break;
              }
            }
            
            if (!url || url.includes('google.com/search')) continue;
            
            // Try different selectors for snippet
            const snippetSelectors = ['.VwiC3b', '.s3v9rd', '.st', '[data-content-feature="1"] span'];
            let snippetElement = null;
            let snippet = '';
            
            for (const sel of snippetSelectors) {
              snippetElement = element.querySelector(sel);
              if (snippetElement) {
                snippet = snippetElement.textContent.trim();
                break;
              }
            }
            
            // Clean up URL (remove Google tracking)
            try {
              const urlObj = new URL(url);
              if (urlObj.pathname === '/url' && urlObj.searchParams.has('q')) {
                url = urlObj.searchParams.get('q');
              }
            } catch (e) {
              // Keep original URL if parsing fails
            }
            
            results.push({
              position: count + 1,
              title: title,
              url: url,
              snippet: snippet || ''
            });
            
            count++;
          } catch (error) {
            console.error('Error processing result element:', error);
            continue;
          }
        }
        
          return results;
        })();
      `);

      if (results.length === 0) {
        throw new Error(
          'No search results found. Google may have blocked the request or changed their layout.'
        );
      }

      console.error(`✅ Successfully extracted ${results.length} results`);
      return results;
    } catch (error) {
      console.error(`❌ Error collecting SERP data: ${error.message}`);
      throw error;
    } finally {
      await this.client.disconnect();
    }
  }
}

// Main execution
async function main() {
  const query = process.argv[2];

  if (!query) {
    console.error('Usage: node collect-serp.js "your search query"');
    console.error(
      'Example: node collect-serp.js "site:reddit.com best budget earbuds 2025"'
    );
    process.exit(1);
  }

  const collector = new SERPCollector();

  try {
    const results = await collector.collect(query, 10);

    // Output clean JSON to stdout (for piping/processing)
    console.log(
      JSON.stringify(
        {
          query: query,
          timestamp: new Date().toISOString(),
          resultsCount: results.length,
          results: results,
        },
        null,
        2
      )
    );
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

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

if (require.main === module) {
  main().catch(console.error);
}

module.exports = SERPCollector;
