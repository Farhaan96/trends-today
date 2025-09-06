import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const firecrawlKey = process.env.FIRECRAWL_API_KEY;
    const perplexityKey = process.env.PERPLEXITY_API_KEY;
    
    if (!firecrawlKey || !perplexityKey) {
      return NextResponse.json({
        success: false,
        error: 'API keys not configured',
        missing: {
          firecrawl: !firecrawlKey,
          perplexity: !perplexityKey
        }
      });
    }

    const { productName, category, researchType = 'review' } = await request.json();
    
    if (!productName) {
      return NextResponse.json({
        success: false,
        error: 'Product name is required'
      }, { status: 400 });
    }

    console.log(`🔍 Enhanced research for: ${productName}`);

    // Step 1: Use Perplexity for real-time research
    console.log('📊 Getting latest info from Perplexity...');
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${perplexityKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: `You are a tech research expert. Provide comprehensive, up-to-date information about technology products. Focus on specifications, pricing, pros/cons, and comparisons. Always include current market information and recent developments.`
          },
          {
            role: 'user',
            content: `Research the ${productName} for a comprehensive ${researchType}. I need:
            1. Current specifications and key features
            2. Latest pricing and availability 
            3. Main advantages and disadvantages
            4. How it compares to key competitors
            5. Recent news or updates about this product
            6. Current market reception and reviews
            
            Provide factual, detailed information that would be useful for writing a professional tech review.`
          }
        ],
        max_tokens: 1000,
        temperature: 0.2,
        top_p: 0.9
      }),
    });

    let perplexityData = null;
    if (perplexityResponse.ok) {
      const perplexityResult = await perplexityResponse.json();
      perplexityData = {
        content: perplexityResult.choices?.[0]?.message?.content,
        usage: perplexityResult.usage
      };
      console.log('✅ Perplexity research completed');
    } else {
      console.log('⚠️ Perplexity failed, continuing with Firecrawl only');
    }

    // Step 2: Use Firecrawl to scrape manufacturer website
    console.log('🌐 Scraping manufacturer data with Firecrawl...');
    let firecrawlData = null;
    
    // Determine manufacturer URL based on product name
    const manufacturerUrl = getManufacturerUrl(productName);
    
    if (manufacturerUrl) {
      const firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${firecrawlKey}`,
        },
        body: JSON.stringify({
          url: manufacturerUrl,
          formats: ['markdown'],
          onlyMainContent: true,
          timeout: 30000
        }),
      });

      if (firecrawlResponse.ok) {
        const firecrawlResult = await firecrawlResponse.json();
        if (firecrawlResult.success) {
          firecrawlData = {
            url: manufacturerUrl,
            content: firecrawlResult.data.markdown?.substring(0, 2000) + '...',
            metadata: firecrawlResult.data.metadata
          };
          console.log('✅ Firecrawl scraping completed');
        }
      }
    }

    // Step 3: Combine and analyze the research
    const combinedResearch = combineResearchData(perplexityData, firecrawlData, productName);

    return NextResponse.json({
      success: true,
      productName,
      category,
      researchType,
      research: combinedResearch,
      sources: {
        perplexity: !!perplexityData,
        firecrawl: !!firecrawlData,
        manufacturerUrl
      },
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Enhanced research failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

function getManufacturerUrl(productName: string): string | null {
  const product = productName.toLowerCase();
  
  if (product.includes('iphone') || product.includes('macbook') || product.includes('ipad') || product.includes('apple')) {
    if (product.includes('iphone 16')) return 'https://www.apple.com/iphone-16/';
    if (product.includes('iphone 15')) return 'https://www.apple.com/iphone-15/';
    if (product.includes('macbook')) return 'https://www.apple.com/macbook-air/';
    return 'https://www.apple.com/';
  }
  
  if (product.includes('galaxy') || product.includes('samsung')) {
    if (product.includes('s24') || product.includes('s25')) return 'https://www.samsung.com/us/smartphones/galaxy-s/';
    return 'https://www.samsung.com/us/smartphones/';
  }
  
  if (product.includes('pixel') || product.includes('google')) {
    return 'https://store.google.com/category/phones';
  }
  
  if (product.includes('oneplus')) {
    return 'https://www.oneplus.com/';
  }
  
  return null;
}

function combineResearchData(perplexityData: any, firecrawlData: any, productName: string) {
  const research: any = {
    productName,
    summary: 'Research data compiled from multiple sources',
    keyFindings: [],
    specifications: {},
    pricing: {},
    pros: [],
    cons: [],
    competitors: [],
    sources: []
  };

  // Extract data from Perplexity
  if (perplexityData?.content) {
    research.perplexityInsights = perplexityData.content;
    research.sources.push('Perplexity AI - Real-time web search');
    
    // Parse key information from Perplexity content
    const content = perplexityData.content.toLowerCase();
    
    // Extract pricing patterns
    const priceMatches = perplexityData.content.match(/\$[\d,]+/g);
    if (priceMatches) {
      research.pricing.found = priceMatches;
      research.pricing.range = `${priceMatches[0]} - ${priceMatches[priceMatches.length - 1]}`;
    }
    
    // Extract competitor mentions
    const competitors = ['samsung', 'apple', 'google', 'oneplus', 'xiaomi', 'sony'];
    competitors.forEach(competitor => {
      if (content.includes(competitor) && !productName.toLowerCase().includes(competitor)) {
        research.competitors.push(competitor.charAt(0).toUpperCase() + competitor.slice(1));
      }
    });
  }

  // Extract data from Firecrawl
  if (firecrawlData?.content) {
    research.manufacturerData = firecrawlData.content;
    research.sources.push(`Official manufacturer page - ${firecrawlData.url}`);
    
    // Extract specifications from scraped content
    const specs = extractSpecifications(firecrawlData.content);
    research.specifications = { ...research.specifications, ...specs };
  }

  // Generate summary
  if (research.sources.length > 0) {
    research.summary = `Comprehensive research combining real-time data from ${research.sources.length} source(s)`;
  }

  return research;
}

function extractSpecifications(content: string) {
  const specs: any = {};
  
  // Extract common tech specs patterns
  const patterns = [
    { key: 'display', regex: /(\d+\.?\d*[-"]?\s?inch.*?(?:display|screen|oled|lcd))/i },
    { key: 'processor', regex: /(a\d+\s+(?:pro\s+)?chip|snapdragon\s+\d+|tensor\s+g\d+)/i },
    { key: 'camera', regex: /(\d+mp.*?camera)/i },
    { key: 'battery', regex: /(up to \d+.*?hours|^\d+mah)/i },
    { key: 'storage', regex: /(\d+gb.*?storage)/i },
    { key: 'memory', regex: /(\d+gb\s+ram)/i }
  ];

  patterns.forEach(pattern => {
    const match = content.match(pattern.regex);
    if (match) {
      specs[pattern.key] = match[1].trim();
    }
  });

  return specs;
}

export const dynamic = 'force-dynamic';