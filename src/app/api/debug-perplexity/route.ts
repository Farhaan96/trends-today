import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  
  return NextResponse.json({
    debug: {
      keyExists: !!apiKey,
      keyLength: apiKey?.length || 0,
      keyPrefix: apiKey?.substring(0, 5) || 'none',
      startsWithPplx: apiKey?.startsWith('pplx-') || false,
      allEnvKeys: Object.keys(process.env).filter(key => 
        key.toLowerCase().includes('perplexity') || 
        key.toLowerCase().includes('pplx')
      ),
      timestamp: new Date().toISOString()
    }
  });
}

export const dynamic = 'force-dynamic';