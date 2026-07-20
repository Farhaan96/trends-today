import { NextResponse } from 'next/server';

const unavailableResponse = () =>
  NextResponse.json(
    {
      success: false,
      status: 'unavailable',
      alerts: null,
      reason:
        'Deal alerts are not connected. No email or alert has been saved, and no notification will be sent.',
    },
    { status: 503 }
  );

export async function POST() {
  return unavailableResponse();
}

export async function GET() {
  return unavailableResponse();
}
