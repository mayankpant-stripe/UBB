import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId } = body;

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // Get customer's default payment method
    const customer = await stripe.customers.retrieve(customerId);
    
    if (!customer || customer.deleted) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Get the customer's payment methods to find the default one
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    if (paymentMethods.data.length === 0) {
      return NextResponse.json(
        { error: 'No payment method found for customer' },
        { status: 400 }
      );
    }

    const defaultPaymentMethod = paymentMethods.data[0].id;

    // Calculate dates starting from the exact current time (not midnight)
    const now = new Date();
    const startDate = Math.floor(now.getTime() / 1000); // Start at exact current time
    
    // Calculate phase end dates by adding exactly 1 year to each phase start time
    // Each phase runs for exactly 1 calendar year from the exact signup time
    const phase1EndDateTime = new Date(now);
    phase1EndDateTime.setFullYear(phase1EndDateTime.getFullYear() + 1); // Add exactly 1 year
    const phase1EndDate = Math.floor(phase1EndDateTime.getTime() / 1000);
    
    const phase2EndDateTime = new Date(now);
    phase2EndDateTime.setFullYear(phase2EndDateTime.getFullYear() + 2); // Add exactly 2 years
    const phase2EndDate = Math.floor(phase2EndDateTime.getTime() / 1000);
    
    const phase3EndDateTime = new Date(now);  
    phase3EndDateTime.setFullYear(phase3EndDateTime.getFullYear() + 3); // Add exactly 3 years
    const phase3EndDate = Math.floor(phase3EndDateTime.getTime() / 1000);

    // Create subscription schedule
    const subscriptionSchedule = await stripe.subscriptionSchedules.create({
      customer: customerId,
      start_date: startDate, // Start at 00:00:00 of current day
      end_behavior: 'cancel', // Cancel at the end of the 3rd year
      phases: [
        {
          items: [{
            price: 'price_1Rf8NqERPgNNTZ29uhk0e6qd', // Year 1 price
          }],
          end_date: phase1EndDate,
          proration_behavior: 'none',
        },
        {
          items: [{
            price: 'price_1Rf8NqERPgNNTZ29CpKf2EKp', // Year 2 price
          }],
          end_date: phase2EndDate,
          proration_behavior: 'none',
        },
        {
          items: [{
            price: 'price_1Rf8NqERPgNNTZ29B3nYs90j', // Year 3 price
          }],
          end_date: phase3EndDate, // End after year 3
        //  proration_behavior: 'none',
        },
      ],
      default_settings: {
        default_payment_method: defaultPaymentMethod,
      },
      metadata: {
        course: '3_year_finance',
        created_via: 'finance_course_enrollment',
        customer_id: customerId,
      }
    });

    // Log detailed information for debugging
    console.log('Subscription Schedule Created:', {
      id: subscriptionSchedule.id,
      status: subscriptionSchedule.status,
      customer: customerId,
      phases: subscriptionSchedule.phases.length,
      startDate: new Date(startDate * 1000).toISOString(),
      phase1End: new Date(phase1EndDate * 1000).toISOString(),
      phase2End: new Date(phase2EndDate * 1000).toISOString(),
      phase3End: new Date(phase3EndDate * 1000).toISOString(),
      // Show local times for verification
      startDateLocal: now.toString(),
      phase1EndLocal: phase1EndDateTime.toString(),
      phase2EndLocal: phase2EndDateTime.toString(),
      phase3EndLocal: phase3EndDateTime.toString(),
    });

    return NextResponse.json({
      success: true,
      subscriptionScheduleId: subscriptionSchedule.id,
      customerId: customerId,
      phases: subscriptionSchedule.phases.length,
      status: subscriptionSchedule.status,
      startDate: new Date(startDate * 1000).toISOString(),
      phase1EndDate: new Date(phase1EndDate * 1000).toISOString(),
      phase2EndDate: new Date(phase2EndDate * 1000).toISOString(),
      phase3EndDate: new Date(phase3EndDate * 1000).toISOString(),
      message: '3-year Finance course subscription schedule created successfully. Each phase runs for exactly 1 calendar year from the signup time. Phase 1: Now to +1 year, Phase 2: +1 to +2 years, Phase 3: +2 to +3 years.'
    });

  } catch (error) {
    console.error('Error creating subscription schedule:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create subscription schedule',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 