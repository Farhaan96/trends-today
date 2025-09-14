import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  try {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    
    if (!apiKey || apiKey.includes('your-api-key')) {
      return NextResponse.json({
        success: false,
        error: 'Firecrawl API key not configured',
        environment: 'missing'
      });
    }

    // Test basic connection
    console.log('Testing Firecrawl API...');
    
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url: 'https://example.com',
        formats: ['markdown'],
        timeout: 10000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'Firecrawl API is working!',
      keyStatus: 'configured',
      testUrl: 'https://example.com',
      contentLength: data.data?.markdown?.length || 0,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Firecrawl test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      keyStatus: process.env.FIRECRAWL_API_KEY ? 'configured' : 'missing'
    });
  }
}

export const dynamic = 'force-dynamic';