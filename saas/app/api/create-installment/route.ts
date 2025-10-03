import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with standard API version first
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    // Create a new customer for the installment
    // In test mode, use team member email for actual email delivery
    const customerEmail = process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') 
      ? 'mayankpant@stripe.com' 
      : (email || `installment_${Date.now()}@bpp-education.co.uk`);
    
    const customer = await stripe.customers.create({
      email: customerEmail,
      name: name || 'BPP Finance Course Student',
      metadata: {
        subscription_type: 'finance_course_installment',
        created_via: 'installment_payment',
        timestamp: new Date().toISOString(),
        original_email: email // Store the user's actual email in metadata
      }
    });

    console.log('Customer created:', { 
      id: customer.id, 
      email: customer.email 
    });

    // Step 1: Create invoice item first
    const invoiceItem = await stripe.invoiceItems.create({
      customer: customer.id,
      price_data: {
        currency: 'gbp',
        product: 'prod_SaIzffYNQhy1RZ',
        unit_amount: 7500, // £75.00 total course amount
      },
      description: 'BPP Finance Course - Complete Programme (3 Installments)',
      metadata: {
        Policy: 'P-01',
        method: 'pplan',
        total_installments: '3'
      }
    });

    console.log('Invoice item created:', { 
      id: invoiceItem.id, 
      amount: invoiceItem.amount, 
      currency: invoiceItem.currency 
    });

    // Step 2: Create invoice with installment payment plan using beta API
    // Use raw fetch to properly handle beta headers
    const invoiceResponse = await fetch('https://api.stripe.com/v1/invoices', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Stripe-Version': '2020-08-27;invoice_partial_payments_beta=v1;invoice_payment_plans_beta=v1'
      },
      body: new URLSearchParams({
        customer: customer.id,
        collection_method: 'send_invoice',
        auto_advance: 'true',
        'amounts_due[0][amount]': '2500',
        'amounts_due[0][days_until_due]': '0',
        'amounts_due[0][description]': 'Deposit',
        'amounts_due[1][amount]': '2500',
        'amounts_due[1][days_until_due]': '30',
        'amounts_due[1][description]': 'Payment 1',
        'amounts_due[2][amount]': '2500',
        'amounts_due[2][days_until_due]': '60',
        'amounts_due[2][description]': 'Payment 2',
        'payment_settings[payment_method_types][0]': 'card',
        'payment_settings[payment_method_types][1]': 'bacs_debit',
        'metadata[Policy]': 'P-01',
        'metadata[method]': 'pplan',
        'metadata[installment_structure]': '3_payments',
        'metadata[payment_1]': '£25.00 - Due immediately',
        'metadata[payment_2]': '£25.00 - Due in 30 days',
        'metadata[payment_3]': '£25.00 - Due in 60 days',
        'metadata[total_amount]': '£75.00'
      })
    });

    if (!invoiceResponse.ok) {
      const errorText = await invoiceResponse.text();
      console.error('Invoice creation failed:', errorText);
      throw new Error(`Failed to create invoice: ${errorText}`);
    }

    const invoice = await invoiceResponse.json();

    console.log('Invoice with installment plan created:', {
      id: invoice.id,
      status: invoice.status,
      total: invoice.total,
      metadata: invoice.metadata
    });

    // Step 3: Finalize the invoice using standard Stripe client
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id!);

    console.log('Invoice finalized:', {
      id: finalizedInvoice.id,
      status: finalizedInvoice.status,
      total: finalizedInvoice.total,
      hostedInvoiceUrl: finalizedInvoice.hosted_invoice_url
    });

    // Step 4: Send the invoice email
    console.log('Sending invoice email:', {
      invoiceId: finalizedInvoice.id,
      customerEmail: customer.email,
      isTestMode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_'),
      invoiceStatus: finalizedInvoice.status
    });
    
    const sentInvoice = await stripe.invoices.sendInvoice(finalizedInvoice.id!);
    
    console.log('Invoice email sent:', {
      invoiceId: sentInvoice.id,
      status: sentInvoice.status,
      customerEmail: customer.email
    });

    return NextResponse.json({
      success: true,
      message: 'Finance Course invoice with 3 installments created successfully!',
      invoiceId: finalizedInvoice.id,
      invoiceUrl: finalizedInvoice.hosted_invoice_url,
      customerId: customer.id,
      customerEmail: customer.email,
      installmentDetails: {
        totalAmount: '£75.00',
        installment1: '£25.00 - Due immediately (Deposit)',
        installment2: '£25.00 - Due in 30 days (Payment 1)', 
        installment3: '£25.00 - Due in 60 days (Payment 2)',
        paymentStructure: 'Single invoice with 3 payment installments'
      }
    });

  } catch (error) {
    console.error('Error creating installment plan:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create installment plan',
      details: error instanceof Error && error.message ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 