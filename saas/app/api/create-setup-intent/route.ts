import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    // Create a new customer
    const customer = await stripe.customers.create({
      email: email || `customer_${Date.now()}@bpp-education.co.uk`,
      name: name || 'BPP Finance Course Student',
      metadata: {
        course: '3_year_finance',
        created_via: 'finance_course_setup',
        timestamp: new Date().toISOString()
      }
    });

    // Get the base URL for redirects
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   (process.env.NODE_ENV === 'development' 
                     ? 'http://localhost:3000' 
                     : 'https://your-domain.com');

    // Create a checkout session for setup intent (payment method collection)
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'setup',
      payment_method_types: ['card'],
      customer_update: {
        name: 'auto',  // Allow customer to update name in checkout
        address: 'auto'  // Allow customer to update address
      },
      success_url: `${baseUrl}/pricing-misc?setup=success&customer=${customer.id}`,
      cancel_url: `${baseUrl}/pricing-misc?setup=cancelled`,
      metadata: {
        type: 'finance_course_setup',
        course: '3_year_finance',
        policy: 'P-02',
        customer_id: customer.id
      }
    });

    return NextResponse.json({ 
      url: session.url,
      sessionId: session.id,
      customerId: customer.id,
      customerEmail: customer.email
    });

  } catch (error) {
    console.error('Error creating setup intent checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 