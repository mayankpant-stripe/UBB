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

    console.log('Starting Free flow for:', { name, email });

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
    console.log('Free flow: Test clock created:', testClock.id);

    // Step 2: Create customer with test clock and addresses
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
        'address[line1]': '1 West Main Street',
        'address[city]': 'Marshalltown',
        'address[state]': 'Iowa',
        'address[postal_code]': '50158',
        'address[country]': 'US',
        'shipping[name]': 'Ship',
        'shipping[address][line1]': '1 West Main Street',
        'shipping[address][city]': 'Marshalltown',
        'shipping[address][state]': 'Iowa',
        'shipping[address][postal_code]': '50158',
        'shipping[address][country]': 'US', 
        'metadata[created_via]': 'free_flow',
        'metadata[plan]': 'free_plan',
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
    console.log('Free flow: Customer created:', customer.id);

    // Step 3: Create checkout session to collect payment information and subscribe to price
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : 'https://your-domain.com');

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: customer.id,
      line_items: [
        {
          price: 'price_1S0gTH9geAvQAmidisTN1O3w',
        },
      ],
      success_url: `${baseUrl}/newhack/success_pay_as_you_go?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/newhack?checkout=cancelled`,
      metadata: {
        customer_name: name,
        customer_email: email,
        plan: 'free_plan',
        test_clock_id: testClock.id,
        flow_type: 'free_flow'
      },
      custom_text: {
        submit: {
          message: 'Complete payment to activate your Free Plan subscription.'
        }
      }
    });

    console.log('Free flow: Checkout session created:', { id: session.id, customerId: customer.id, testClockId: testClock.id });

    // Return checkout URL for user to complete payment
    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
      customerId: customer.id,
      testClockId: testClock.id
    });

  } catch (error) {
    console.error('Error in Free flow:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create Free flow',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
