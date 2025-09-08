import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    
    if (!apiKey || apiKey.includes('your-api-key')) {
      return NextResponse.json({
        success: false,
        error: 'Perplexity API key not configured',
        environment: 'missing'
      });
    }

    // Test basic connection with a simple tech query
    console.log('Testing Perplexity API...');
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: 'You are a tech research assistant. Provide brief, factual information about technology products and trends.'
          },
          {
            role: 'user',
            content: 'What are the latest smartphone releases in 2025? Just give me 3 key recent releases with brief details.'
          }
        ],
        max_tokens: 150,
        temperature: 0.2,
        top_p: 0.9
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'Perplexity API is working!',
      keyStatus: 'configured',
      testQuery: 'Latest smartphone releases 2025',
      response: data.choices?.[0]?.message?.content || 'No response content',
      usage: data.usage || {},
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Perplexity test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      keyStatus: process.env.PERPLEXITY_API_KEY ? 'configured' : 'missing'
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';