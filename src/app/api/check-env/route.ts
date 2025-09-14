import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  return NextResponse.json({
    environment: {
      firecrawl: {
        present: !!process.env.FIRECRAWL_API_KEY,
        starts_with_fc: process.env.FIRECRAWL_API_KEY?.startsWith('fc-') || false,
        length: process.env.FIRECRAWL_API_KEY?.length || 0
      },
      perplexity: {
        present: !!process.env.PERPLEXITY_API_KEY,
        starts_with_pplx: process.env.PERPLEXITY_API_KEY?.startsWith('pplx-') || false,
        length: process.env.PERPLEXITY_API_KEY?.length || 0
      }
    },
    timestamp: new Date().toISOString()
  });
}

export const dynamic = 'force-dynamic';