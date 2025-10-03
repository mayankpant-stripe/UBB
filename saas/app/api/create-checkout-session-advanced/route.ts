import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: name and email are required'
      }, { status: 400 });
    }

    console.log('Creating checkout session for advanced plan:', { name, email });

    // Get the base URL for redirects
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   (process.env.NODE_ENV === 'development' 
                     ? 'http://localhost:3000' 
                     : 'https://your-domain.com');

    // Create a checkout session for one-time setup
    const session = await stripe.checkout.sessions.create({
      mode: 'setup',
      payment_method_types: ['card'],
      customer_email: email,
      success_url: `${baseUrl}/hackathonpage?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/hackathonpage?checkout=cancelled`,
      metadata: {
        customer_name: name,
        customer_email: email,
        plan: 'advanced_plan',
        pricing_plan_id: 'bpp_test_61TCaMaZ0UAUj0zMo16T5kls95SQJJF9DR1pbaQwqQDY'
      },
      customer_creation: 'always',
      custom_text: {
        submit: {
          message: 'We\'ll create your account and start your Advanced Plan subscription after payment setup.'
        }
      }
    });

    console.log('Checkout session created:', {
      id: session.id,
      url: session.url,
      customer_email: email
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create checkout session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 