import { NextRequest, NextResponse } from 'next/server';

interface DealAlertRequest {
  email: string;
  productName: string;
  targetPrice: number;
  currentPrice: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: DealAlertRequest = await request.json();
    const { email, productName, targetPrice, currentPrice } = body;

    // Basic validation
    if (!email || !productName || !targetPrice || !currentPrice) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (targetPrice >= currentPrice) {
      return NextResponse.json(
        { error: 'Target price must be lower than current price' },
        { status: 400 }
      );
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Here you would typically:
    // 1. Save to database (PostgreSQL, MongoDB, etc.)
    // 2. Add to email marketing service (Mailchimp, ConvertKit, etc.)
    // 3. Set up price monitoring

    // For now, we'll simulate the process and log the data
    console.log('Deal Alert Signup:', {
      email,
      productName,
      targetPrice,
      currentPrice,
      savings: currentPrice - targetPrice,
      savingsPercentage: Math.round(((currentPrice - targetPrice) / currentPrice) * 100),
      timestamp: new Date().toISOString()
    });

    // Simulate API call to email service
    // await subscribeToMailingList(email, productName, targetPrice);

    // Simulate database save
    // await saveDealAlert({
    //   email,
    //   productName,
    //   targetPrice,
    //   currentPrice,
    //   isActive: true,
    //   createdAt: new Date()
    // });

    // Track the conversion for analytics
    const response = NextResponse.json({
      success: true,
      message: 'Deal alert created successfully',
      data: {
        email,
        productName,
        targetPrice,
        expectedSavings: `$${(currentPrice - targetPrice).toFixed(2)} (${Math.round(((currentPrice - targetPrice) / currentPrice) * 100)}%)`
      }
    });

    // Set tracking cookie for conversion attribution
    response.cookies.set('deal_alert_signup', 'true', {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });

    return response;

  } catch (error) {
    console.error('Deal alert signup error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // This endpoint could be used to check deal alert status
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json(
      { error: 'Email parameter required' },
      { status: 400 }
    );
  }

  // Simulate fetching user's active deal alerts
  // In a real implementation, you'd query your database
  const mockAlerts = [
    {
      id: '1',
      productName: 'iPhone 15 Pro',
      targetPrice: 899,
      currentPrice: 999,
      isActive: true,
      createdAt: '2024-09-07T00:00:00Z'
    }
  ];

  return NextResponse.json({
    success: true,
    alerts: mockAlerts
  });
}