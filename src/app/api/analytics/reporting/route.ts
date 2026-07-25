import { NextRequest, NextResponse } from 'next/server';
import {
  getGoogleReportingSnapshot,
  hasValidReportingToken,
} from '@/lib/google-reporting.mjs';

export async function GET(request: NextRequest) {
  const expectedToken = process.env.ANALYTICS_REPORTING_TOKEN;

  if (!expectedToken?.trim()) {
    return NextResponse.json(
      {
        success: false,
        error: 'Analytics reporting access is not configured.',
      },
      { status: 503 }
    );
  }

  if (!hasValidReportingToken(request, expectedToken)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized.',
      },
      { status: 401 }
    );
  }

  const reporting = await getGoogleReportingSnapshot();

  return NextResponse.json(
    {
      success: true,
      data: reporting,
    },
    {
      headers: {
        'Cache-Control': 'private, no-store',
      },
    }
  );
}

export const dynamic = 'force-dynamic';
