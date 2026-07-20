import { NextRequest, NextResponse } from 'next/server';

interface TrackingEvent {
  eventType:
    | 'affiliate_click'
    | 'premium_signup'
    | 'deal_alert_signup'
    | 'newsletter_signup';
  productName?: string;
  provider?: string;
  value?: number;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    const body: TrackingEvent = await request.json();
    const {
      eventType,
      productName,
      provider,
      value,
      userId,
      sessionId,
      metadata,
    } = body;

    // Basic validation
    if (!eventType) {
      return NextResponse.json(
        { error: 'Event type is required' },
        { status: 400 }
      );
    }

    // Get user's IP for analytics (respect privacy laws)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const userAgent = request.headers.get('user-agent');
    const referer = request.headers.get('referer');

    // Create tracking record
    const trackingData = {
      eventType,
      productName,
      provider,
      value: value || 0,
      userId,
      sessionId,
      metadata,
      timestamp: new Date().toISOString(),
      userAgent,
      referer,
      ip: forwardedFor?.split(',')[0]?.trim() || 'unknown',
    };

    // In a real implementation, you would:
    // 1. Save to analytics database
    // 2. Send to Google Analytics 4
    // 3. Send to Facebook Pixel
    // 4. Update revenue dashboards
    // 5. Trigger webhooks for important events

    console.log('Revenue Tracking Event:', trackingData);

    // Simulate different responses based on event type
    switch (eventType) {
      case 'affiliate_click':
        // Track affiliate click for revenue attribution
        console.log(
          `Affiliate click tracked: ${provider} - ${productName} - $${value}`
        );
        break;

      case 'premium_signup':
        // Track premium subscription conversion
        console.log(`Premium signup: $${value} MRR`);
        break;

      case 'deal_alert_signup':
        // Track deal alert signup (lead generation)
        console.log(`Deal alert signup: ${productName} at $${value}`);
        break;

      case 'newsletter_signup':
        // Track newsletter subscription
        console.log(`Newsletter signup from ${referer}`);
        break;
    }

    // Return success response
    const response = NextResponse.json({
      success: true,
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: 'Event tracked successfully',
    });

    // Set tracking cookies for attribution
    if (eventType === 'affiliate_click') {
      response.cookies.set(
        'last_affiliate_click',
        JSON.stringify({
          provider,
          productName,
          timestamp: Date.now(),
        }),
        {
          maxAge: 60 * 60 * 24 * 30, // 30 days
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
        }
      );
    }

    return response;
  } catch (error) {
    console.error('Revenue tracking error:', error);

    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || '30d';
  const metric = searchParams.get('metric') || 'all';

  return NextResponse.json({
    success: false,
    status: 'unavailable',
    metrics: null,
    metric,
    period,
    reason:
      'No verified revenue provider is connected. Missing revenue metrics are unavailable, not zero.',
  });
}
