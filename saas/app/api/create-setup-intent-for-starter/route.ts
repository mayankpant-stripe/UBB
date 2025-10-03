import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    // Create a setup intent for payment method collection
    const setupIntent = await stripe.setupIntents.create({
      payment_method_types: ['card'],
      usage: 'off_session', // For future payments
      metadata: {
        purpose: 'starter_plan_payment_method',
        plan: 'pp3_starter'
      }
    });

    console.log('Setup intent created for starter plan:', {
      id: setupIntent.id,
      client_secret: setupIntent.client_secret?.substring(0, 20) + '...',
      status: setupIntent.status
    });

    return NextResponse.json({
      success: true,
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id
    });

  } catch (error) {
    console.error('Error creating setup intent:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create setup intent',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 