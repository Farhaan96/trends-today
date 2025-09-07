#!/usr/bin/env node

const CDPClient = require('../client.js');

async function collectRedditEarbuds() {
  const client = new CDPClient();
  
  try {
    console.log('🔍 Collecting Reddit earbuds data...');
    await client.connect();
    
    // Navigate to Google search directly with the query
    const query = 'site:reddit.com best budget earbuds 2025';
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    
    console.log('📡 Navigating directly to search results...');
    await client.open(searchUrl);
    
    // Wait for results to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('📊 Extracting Reddit results...');
    
    // Extract results with a simpler approach
    const results = await client.evaluate(`
      (function() {
        const results = [];
        
        // Try different selectors for search results
        const resultContainers = document.querySelectorAll('div.g, .g, [data-ved]');
        
        let count = 0;
        for (const container of resultContainers) {
          if (count >= 10) break;
          
          try {
            // Find title link
            const titleLink = container.querySelector('h3 a, a h3, [role="heading"] a, .LC20lb');
            if (!titleLink) continue;
            
            const title = titleLink.textContent.trim();
            const url = titleLink.href;
            
            if (!title || !url || !url.includes('reddit.com')) continue;
            
            // Find snippet
            let snippet = '';
            const snippetEl = container.querySelector('.VwiC3b, .s3v9rd, .st, span[data-content-feature="1"]');
            if (snippetEl) {
              snippet = snippetEl.textContent.trim();
            }
            
            results.push({
              position: count + 1,
              title: title,
              url: url,
              snippet: snippet
            });
            
            count++;
          } catch (e) {
            continue;
          }
        }
        
        return results;
      })();
    `);
    
    if (results.length === 0) {
      console.log('⚠️ No Reddit results found. Extracting any search results...');
      
      // Fallback: get any search results
      const fallbackResults = await client.evaluate(`
        (function() {
          const results = [];
          const links = document.querySelectorAll('a[href*="reddit.com"], h3 a, .g a');
          
          let count = 0;
          for (const link of links) {
            if (count >= 10) break;
            
            const title = link.textContent.trim();
            const url = link.href;
            
            if (title && url && title.length > 10) {
              results.push({
                position: count + 1,
                title: title,
                url: url,
                snippet: ''
              });
              count++;
            }
          }
          
          return results;
        })();
      `);
      
      if (fallbackResults.length > 0) {
        console.log(`✅ Found ${fallbackResults.length} search results!`);
        console.log(JSON.stringify({
          query: query,
          timestamp: new Date().toISOString(),
          resultsCount: fallbackResults.length,
          results: fallbackResults
        }, null, 2));
        return;
      }
    }
    
    console.log(`✅ Found ${results.length} Reddit results!`);
    
    // Output clean JSON
    console.log(JSON.stringify({
      query: query,
      timestamp: new Date().toISOString(),
      resultsCount: results.length,
      results: results
    }, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.disconnect();
  }
}

collectRedditEarbuds().catch(console.error);