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
      email: email || `student_${Date.now()}@bpp-education.co.uk`,
      name: name || 'BPP Student Subscriber',
      metadata: {
        subscription_type: 'pay_per_student',
        created_via: 'student_subscription',
        timestamp: new Date().toISOString()
      }
    });

    // Get the base URL for redirects
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   (process.env.NODE_ENV === 'development' 
                     ? 'http://localhost:3002' 
                     : 'https://your-domain.com');

    // Create a checkout session for subscription
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1Rfgt5ERPgNNTZ29aI3PORXh', // Pay per Student price (metered)
        },
      ],
      customer_update: {
        name: 'auto',
        address: 'auto'
      },
      success_url: `${baseUrl}/pricing-misc?subscription=success&customer=${customer.id}&type=student`,
      cancel_url: `${baseUrl}/pricing-misc?subscription=cancelled`,
      metadata: {
        type: 'student_subscription',
        subscription_type: 'pay_per_student',
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
    console.error('Error creating student subscription checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 