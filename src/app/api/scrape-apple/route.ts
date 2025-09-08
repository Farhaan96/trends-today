import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    
    if (!apiKey || apiKey.includes('your-api-key')) {
      return NextResponse.json({
        success: false,
        error: 'Firecrawl API key not configured'
      });
    }

    console.log('🍎 Scraping Apple.com for iPhone 15 Pro...');
    
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url: 'https://www.apple.com/iphone-15-pro/',
        formats: ['markdown'],
        onlyMainContent: true,
        timeout: 30000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.success || !data.data?.markdown) {
      throw new Error('No content returned from Apple.com');
    }

    // Extract key information from the scraped content
    const markdown = data.data.markdown;
    const specs = extractSpecs(markdown);
    const pricing = extractPricing(markdown);
    const features = extractFeatures(markdown);

    return NextResponse.json({
      success: true,
      url: 'https://www.apple.com/iphone-15-pro/',
      title: data.data.metadata?.title || 'iPhone 15 Pro',
      contentLength: markdown.length,
      specs,
      pricing,
      features,
      scrapedAt: new Date().toISOString(),
      // Include first 1000 chars of content for preview
      preview: markdown.substring(0, 1000) + '...'
    });

  } catch (error) {
    console.error('Apple scraping failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

function extractSpecs(markdown: string) {
  const specs: { [key: string]: string } = {};
  
  // Look for common iPhone specs patterns
  const patterns = [
    { key: 'display', regex: /(\d+\.?\d*-?inch.*?(?:Super Retina|OLED|display))/i },
    { key: 'chip', regex: /(A\d+\s+Pro\s+chip)/i },
    { key: 'camera', regex: /(\d+MP.*?(?:camera|telephoto|ultra wide))/i },
    { key: 'battery', regex: /(up to \d+.*?hours.*?(?:video|playback))/i },
    { key: 'storage', regex: /(\d+GB.*?(?:storage|capacity))/i },
    { key: 'materials', regex: /(titanium|aluminum|ceramic)/i }
  ];

  patterns.forEach(pattern => {
    const match = markdown.match(pattern.regex);
    if (match) {
      specs[pattern.key] = match[1].trim();
    }
  });

  return specs;
}

function extractPricing(markdown: string) {
  const prices: string[] = [];
  
  // Look for pricing patterns
  const priceRegex = /\$\d{3,4}(?:,\d{3})*/g;
  const matches = markdown.match(priceRegex);
  
  if (matches) {
    // Remove duplicates and sort
    const uniquePrices = [...new Set(matches)].sort();
    prices.push(...uniquePrices);
  }

  return {
    found: prices,
    range: prices.length > 1 ? `${prices[0]} - ${prices[prices.length - 1]}` : prices[0] || 'Price not found'
  };
}

function extractFeatures(markdown: string) {
  const features: string[] = [];
  
  // Look for key feature bullets or highlights
  const featurePatterns = [
    /Action Button/i,
    /USB-C/i,
    /5G/i,
    /Face ID/i,
    /Wireless charging/i,
    /Water resistant/i,
    /Crash Detection/i,
    /Emergency SOS/i
  ];

  featurePatterns.forEach(pattern => {
    if (pattern.test(markdown)) {
      const match = markdown.match(new RegExp(`[^.]*${pattern.source}[^.]*`, 'i'));
      if (match) {
        features.push(match[0].trim());
      }
    }
  });

  return features.slice(0, 8); // Limit to top 8 features
}

export const dynamic = 'force-dynamic';