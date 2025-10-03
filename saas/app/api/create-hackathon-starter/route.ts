import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, paymentMethodId, setupIntentId } = body;

    // Validate required fields
    if (!name || !email || !paymentMethodId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: name, email, and paymentMethodId are required'
      }, { status: 400 });
    }

    console.log('Creating customer with provided details:', { 
      name, 
      email, 
      paymentMethodId: typeof paymentMethodId === 'string' ? paymentMethodId : paymentMethodId.id,
      setupIntentId 
    });

    // Create customer with provided name and email
    const customer = await stripe.customers.create({
      name: name,
      email: email,
      metadata: {
        customer_type: 'hackathon_demo',
        plan: 'starter_pp3',
        created_via: 'hackathon_page_with_payment',
        timestamp: new Date().toISOString(),
        setup_intent_id: setupIntentId
      }
    });

    console.log('Customer created:', { 
      id: customer.id, 
      name: customer.name,
      email: customer.email 
    });

    // Attach payment method to customer
    const pmId = typeof paymentMethodId === 'string' ? paymentMethodId : paymentMethodId.id;
    
    await stripe.paymentMethods.attach(pmId, {
      customer: customer.id,
    });

    // Set as default payment method for the customer
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: pmId,
      },
    });

    console.log('Payment method attached and set as default:', { 
      paymentMethodId: pmId, 
      customerId: customer.id 
    });

    // Step 1 - Create billing cadence
    const cadenceOptions = {
      payer: {
        type: "customer",
        customer: customer.id
      },
      billing_cycle: {
        type: 'month',
        interval_count: 1,     
      }
    };

    console.log('Creating cadence with options:', cadenceOptions);

    const cadenceResponse = await fetch('https://api.stripe.com/v2/billing/cadences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Stripe-Version': 'unsafe-development'
      },
      body: JSON.stringify(cadenceOptions)
    });

    if (!cadenceResponse.ok) {
      const errorText = await cadenceResponse.text();
      console.error('Cadence creation failed:', errorText);
      throw new Error(`Cadence creation failed: ${cadenceResponse.status} - ${errorText}`);
    }

    const cadence = await cadenceResponse.json();
    console.log('Full cadence response:', cadence);
    
    if (!cadence || !cadence.id) {
      throw new Error(`Cadence creation failed: No ID returned. Response: ${JSON.stringify(cadence)}`);
    }
    
    console.log('Billing cadence created:', { id: cadence.id });

    // Step 2 - Get pricing plan details
    const pricingPlanId = 'bpp_test_61TCaMaZ0UAUj0zMo16T5kls95SQJJF9DR1pbaQwqQDY';
    console.log('Fetching pricing plan:', pricingPlanId);
    
    const pricingPlanResponse = await fetch(`https://api.stripe.com/v2/billing/pricing_plans/${pricingPlanId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Stripe-Version': 'unsafe-development'
      }
    });

    if (!pricingPlanResponse.ok) {
      const errorText = await pricingPlanResponse.text();
      console.error('Pricing plan retrieval failed:', errorText);
      throw new Error(`Pricing plan retrieval failed: ${pricingPlanResponse.status} - ${errorText}`);
    }

    const pricingPlan = await pricingPlanResponse.json();
    console.log('Full pricing plan response:', pricingPlan);
    
    if (!pricingPlan || !pricingPlan.id) {
      throw new Error(`Pricing plan retrieval failed: No ID returned. Response: ${JSON.stringify(pricingPlan)}`);
    }
    
    if (!pricingPlan.latest_version) {
      throw new Error(`Pricing plan retrieval failed: No latest_version returned. Response: ${JSON.stringify(pricingPlan)}`);
    }
    
    console.log('Pricing plan retrieved:', { id: pricingPlan.id, version: pricingPlan.latest_version });

    // Step 3 - Create billing intent
    const intentOptions = {
      currency: "usd",
      cadence: cadence.id,
      actions: [
        {
          type: "subscribe",
          subscribe: {
            type: "pricing_plan_subscription_details",
            pricing_plan_subscription_details: {
              pricing_plan: pricingPlanId,
              pricing_plan_version: pricingPlan.latest_version,
              component_configurations: []
            }
          }
        }
      ]
    };

    console.log('Creating billing intent with options:', intentOptions);

    const intentResponse = await fetch('https://api.stripe.com/v2/billing/intents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Stripe-Version': 'unsafe-development'
      },
      body: JSON.stringify(intentOptions)
    });

    if (!intentResponse.ok) {
      const errorText = await intentResponse.text();
      console.error('Billing intent creation failed:', errorText);
      throw new Error(`Billing intent creation failed: ${intentResponse.status} - ${errorText}`);
    }

    const billingIntent = await intentResponse.json();
    console.log('Full billing intent response:', billingIntent);
    
    if (!billingIntent || !billingIntent.id) {
      throw new Error(`Billing intent creation failed: No ID returned. Response: ${JSON.stringify(billingIntent)}`);
    }
    
    console.log('Billing intent created:', { id: billingIntent.id });

    // Step 4 - Reserve billing intent
    console.log('Reserving billing intent:', billingIntent.id);
    
    const reserveResponse = await fetch(`https://api.stripe.com/v2/billing/intents/${billingIntent.id}/reserve`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Stripe-Version': 'unsafe-development'
      }
    });

    if (!reserveResponse.ok) {
      const errorText = await reserveResponse.text();
      console.error('Billing intent reservation failed:', errorText);
      throw new Error(`Billing intent reservation failed: ${reserveResponse.status} - ${errorText}`);
    }

    const reservedIntent = await reserveResponse.json();
    console.log('Full reserve response:', reservedIntent);

    // If a PaymentIntent is required during reserve, confirm it using the provided payment method
    try {
      const possiblePaymentIntentId = (reservedIntent?.payment_intent?.id)
        || (typeof reservedIntent?.payment_intent === 'string' ? reservedIntent.payment_intent : undefined)
        || (reservedIntent?.payment?.payment_intent?.id)
        || (typeof reservedIntent?.payment?.payment_intent === 'string' ? reservedIntent.payment.payment_intent : undefined)
        || (reservedIntent?.required_payment_intent?.id)
        || (typeof reservedIntent?.required_payment_intent === 'string' ? reservedIntent.required_payment_intent : undefined);

      if (possiblePaymentIntentId) {
        console.log('Confirming required PaymentIntent for billing intent:', possiblePaymentIntentId);
        const confirmedPI = await stripe.paymentIntents.confirm(possiblePaymentIntentId, {
          payment_method: (typeof paymentMethodId === 'string' ? paymentMethodId : paymentMethodId.id),
          off_session: true
        });
        console.log('PaymentIntent confirmed:', { id: confirmedPI.id, status: confirmedPI.status });
        if (confirmedPI.status === 'requires_action') {
          throw new Error('Payment requires additional authentication. Please complete 3DS.');
        }
      } else {
        console.log('No PaymentIntent present on reserved billing intent; proceeding to commit.');
      }
    } catch (piError) {
      console.error('Failed to confirm PaymentIntent before commit:', piError);
      throw new Error(piError instanceof Error ? piError.message : 'Failed to confirm PaymentIntent');
    }
    
    if (!reservedIntent || !reservedIntent.id) {
      throw new Error(`Billing intent reservation failed: No ID returned. Response: ${JSON.stringify(reservedIntent)}`);
    }
    
    console.log('Billing intent reserved:', { id: reservedIntent.id, status: reservedIntent.status });

    // Step 5 - Commit billing intent
    console.log('Committing billing intent:', billingIntent.id);
    
    const commitResponse = await fetch(`https://api.stripe.com/v2/billing/intents/${billingIntent.id}/commit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Stripe-Version': 'unsafe-development'
      }
    });

    if (!commitResponse.ok) {
      const errorText = await commitResponse.text();
      console.error('Billing intent commit failed:', errorText);
      throw new Error(`Billing intent commit failed: ${commitResponse.status} - ${errorText}`);
    }

    const committedIntent = await commitResponse.json();
    console.log('Full commit response:', committedIntent);
    
    if (!committedIntent || !committedIntent.id) {
      throw new Error(`Billing intent commit failed: No ID returned. Response: ${JSON.stringify(committedIntent)}`);
    }
    
    console.log('Billing intent committed:', { id: committedIntent.id, status: committedIntent.status });

    return NextResponse.json({
      success: true,
      message: `Customer ${name} created and subscribed to PP3 plan via billing intent successfully!`,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        paymentMethodId: pmId
      },
      billing: {
        cadenceId: cadence.id,
        pricingPlanId: pricingPlan.id,
        pricingPlanVersion: pricingPlan.latest_version,
        billingIntentId: committedIntent.id,
        status: committedIntent.status
      }
    });

  } catch (error) {
    console.error('Error creating hackathon starter setup:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create customer and billing setup',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 