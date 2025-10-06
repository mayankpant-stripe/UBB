import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: name and email are required'
      }, { status: 400 });
    }

    console.log('Starting Perlego-Monthly flow for:', { name, email });

    // Step 1: Create test clock set to beginning of current day in London timezone (BST/GMT)
    const now = new Date();
    const londonDateString = now.toLocaleDateString('en-CA', { timeZone: 'Europe/London' });
    const formatter = new Intl.DateTimeFormat('en', { timeZone: 'Europe/London', timeZoneName: 'longOffset' });
    const londonOffsetString = formatter.formatToParts(now).find(part => part.type === 'timeZoneName')?.value || '+00:00';
    const offsetMatch = londonOffsetString.match(/([+-])(\d{2}):(\d{2})/);
    let offsetHours = 0;
    if (offsetMatch) {
      offsetHours = parseInt(offsetMatch[2]) * (offsetMatch[1] === '+' ? 1 : -1);
    }
    const [year, month, day] = londonDateString.split('-').map(Number);
    const beginningOfDayUTC = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));

    const testClockResponse = await fetch('https://api.stripe.com/v1/test_helpers/test_clocks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`
      },
      body: new URLSearchParams({
        'frozen_time': Math.floor(beginningOfDayUTC.getTime() / 1000).toString()
      })
    });

    if (!testClockResponse.ok) {
      const errorText = await testClockResponse.text();
      console.error('Test clock creation failed:', errorText);
      throw new Error(`Test clock creation failed: ${testClockResponse.status} - ${errorText}`);
    }

    const testClock = await testClockResponse.json();
    console.log('Perlego-Monthly flow: Test clock created:', testClock.id);

    // Step 2: Create customer with test clock
    const customerResponse = await fetch('https://api.stripe.com/v1/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`
      },
      body: new URLSearchParams({
        'name': name,
        'email': email,
        'test_clock': testClock.id,
        'metadata[created_via]': 'perlego_monthly_flow',
        'metadata[plan]': 'perlego-monthly',
        'metadata[pricing_plan_id]': 'bpp_test_61TOd12oNrKP9NFMe16T5kls95SQJJF9DR1pbaQwqV7w',
        'metadata[test_clock_id]': testClock.id,
        'metadata[timestamp]': new Date().toISOString()
      })
    });

    if (!customerResponse.ok) {
      const errorText = await customerResponse.text();
      console.error('Customer creation failed:', errorText);
      throw new Error(`Customer creation failed: ${customerResponse.status} - ${errorText}`);
    }

    const customer = await customerResponse.json();
    console.log('Perlego-Monthly flow: Customer created:', customer.id);

    // Step 3: Create checkout session for the customer
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://your-domain.com');

    const session = await stripe.checkout.sessions.create({
      mode: 'setup',
      payment_method_types: ['card'],
      customer: customer.id,
      success_url: `${baseUrl}/Perlego/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/Perlego?checkout=cancelled`,
      metadata: {
        customer_name: name,
        customer_email: email,
        plan: 'perlego-monthly',
        pricing_plan_id: 'bpp_test_61TOd12oNrKP9NFMe16T5kls95SQJJF9DR1pbaQwqV7w',
        test_clock_id: testClock.id,
        flow_type: 'perlego_monthly_flow'
      },
      custom_text: {
        submit: {
          message: 'Complete payment setup to activate your Perlego Monthly subscription.'
        }
      }
    });

    console.log('Perlego-Monthly flow: Checkout session created:', { id: session.id, customerId: customer.id, testClockId: testClock.id });

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
      customerId: customer.id,
      testClockId: testClock.id
    });

  } catch (error) {
    console.error('Error in Perlego-Monthly flow:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create Perlego-Monthly flow',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
