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

    console.log('Starting Starter flow for:', { name, email });

    // Step 1: Store customer info and create checkout session for payment method collection
    console.log('Step 1: Creating checkout session for payment method collection');
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   (process.env.NODE_ENV === 'development' 
                     ? 'http://localhost:3000' 
                     : 'https://your-domain.com');

    const session = await stripe.checkout.sessions.create({
      mode: 'setup',
      payment_method_types: ['card'],
      customer_email: email,
      success_url: `${baseUrl}/hackathonpage?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/hackathonpage?checkout=cancelled`,
      locale: 'en-GB',
      metadata: {
        customer_name: name,
        customer_email: email,
        plan: 'starter_invoice_flow',
        flow_type: 'starter_invoice_custom_flow' // Mark this as new invoice-based flow
      },
      customer_creation: 'always',
      custom_text: {
        submit: {
          message: 'Complete setup to activate your Starter Plan. You will be charged £100 after setup.'
        }
      }
    });

    console.log('Checkout session created:', {
      sessionId: session.id,
      url: session.url
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id
    });

  } catch (error) {
    console.error('Error in Starter flow:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create Starter flow',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 