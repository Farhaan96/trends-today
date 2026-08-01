import { NextResponse } from 'next/server';
import { inboxReadiness } from '@/lib/inbox-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const readiness = inboxReadiness();
  return NextResponse.json(
    { ready: readiness.ready },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}
