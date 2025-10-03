import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
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

    console.log('Starting Advanced flow for:', { name, email });

    // Step 1: Create test clock set to beginning of current day in London timezone (BST/GMT)
    
    const now = new Date();
    
    // Get today's date in London timezone  
    const londonDateString = now.toLocaleDateString('en-CA', { timeZone: 'Europe/London' });
    
    // Create midnight today in London timezone by constructing the ISO string and parsing it correctly
    const midnightLondonISO = `${londonDateString}T00:00:00`; 
    
    // Use Intl.DateTimeFormat to get the actual UTC offset for London today
    const formatter = new Intl.DateTimeFormat('en', {
      timeZone: 'Europe/London',
      timeZoneName: 'longOffset'
    });
    
    const londonOffsetString = formatter.formatToParts(now)
      .find(part => part.type === 'timeZoneName')?.value || '+00:00';
    
    // Parse the offset (e.g., "+01:00" for BST, "+00:00" for GMT)
    const offsetMatch = londonOffsetString.match(/([+-])(\d{2}):(\d{2})/);
    let offsetHours = 0;
    if (offsetMatch) {
      offsetHours = parseInt(offsetMatch[2]) * (offsetMatch[1] === '+' ? 1 : -1);
    }
    
    // Create the UTC timestamp: if London is +1 (BST), then midnight London is 23:00 UTC previous day
    const [year, month, day] = londonDateString.split('-').map(Number);
    const beginningOfDayUTC = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    
    const timezoneName = offsetHours === 1 ? 'BST' : 'GMT';
    
    console.log('Step 1: Creating test clock with beginning of current day in London timezone:');
    console.log(`London date: ${londonDateString} 00:00:00 ${timezoneName} (UTC${offsetHours >= 0 ? '+' : ''}${offsetHours})`);
    console.log(`UTC timestamp: ${beginningOfDayUTC.toISOString()}`);
    
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
    console.log('Test clock created:', testClock.id);

    // Step 2: Create customer with test clock
    console.log('Step 2: Creating customer with test clock');
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
        'metadata[created_via]': 'advanced_flow',
        'metadata[plan]': 'advanced_plan',
        'metadata[pricing_plan_id]': 'bpp_test_61TCaMaZ0UAUj0zMo16T5kls95SQJJF9DR1pbaQwqQDY',
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
    console.log('Customer created:', customer.id);

    // Step 3: Create checkout session for the customer
    console.log('Step 3: Creating checkout session for customer');
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   (process.env.NODE_ENV === 'development' 
                     ? 'http://localhost:3000' 
                     : 'https://your-domain.com');

    const session = await stripe.checkout.sessions.create({
      mode: 'setup',
      payment_method_types: ['card'],
      customer: customer.id, // Use the customer we just created
      success_url: `${baseUrl}/newhack/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/newhack?checkout=cancelled`,
      metadata: {
        customer_name: name,
        customer_email: email,
        plan: 'advanced_plan',
        pricing_plan_id: 'bpp_test_61TCaMaZ0UAUj0zMo16T5kls95SQJJF9DR1pbaQwqQDY',
        test_clock_id: testClock.id,
        flow_type: 'advanced_custom_flow' // Mark this as custom flow
      },
      custom_text: {
        submit: {
          message: 'Complete payment setup to activate your Advanced Plan subscription.'
        }
      }
    });

    console.log('Checkout session created:', {
      sessionId: session.id,
      customerId: customer.id,
      testClockId: testClock.id,
      url: session.url
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
      customerId: customer.id,
      testClockId: testClock.id,
      redirectUrl: `${baseUrl}/newhack/success?customerid=${customer.id}`
    });

  } catch (error) {
    console.error('Error in Advanced flow:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create Advanced flow',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 