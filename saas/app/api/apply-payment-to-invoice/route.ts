import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export async function POST(request: NextRequest) {
  try {
    const { invoiceId, customerId, paymentAmount } = await request.json();

    console.log('Applying payment to invoice:', {
      invoiceId,
      customerId,
      paymentAmount
    });

    // Get the current invoice
    const invoice = await stripe.invoices.retrieve(invoiceId);

    console.log('Current invoice status:', {
      id: invoice.id,
      status: invoice.status,
      amountPaid: invoice.amount_paid,
      amountDue: invoice.amount_due,
      total: invoice.total
    });

    // Apply payment as a credit to the invoice
    // Create a credit note for the payment amount
    const creditNote = await stripe.creditNotes.create({
      invoice: invoiceId,
      amount: paymentAmount,
      reason: 'order_change',
      metadata: {
        payment_type: 'installment_payment',
        installment_number: '1_of_3',
        applied_amount: paymentAmount.toString()
      }
    });

    console.log('Credit note created:', {
      id: creditNote.id,
      amount: creditNote.amount,
      status: creditNote.status
    });

    // Get the updated invoice
    const updatedInvoice = await stripe.invoices.retrieve(invoiceId);

    console.log('Updated invoice after credit:', {
      id: updatedInvoice.id,
      status: updatedInvoice.status,
      amountPaid: updatedInvoice.amount_paid,
      amountDue: updatedInvoice.amount_due,
      total: updatedInvoice.total
    });

    return NextResponse.json({
      success: true,
      message: 'Payment applied to invoice successfully',
      invoiceId: updatedInvoice.id,
      invoiceStatus: updatedInvoice.status,
      remainingBalance: updatedInvoice.amount_due,
      totalAmount: updatedInvoice.total,
      amountPaid: updatedInvoice.amount_paid,
      creditNoteId: creditNote.id,
      appliedAmount: paymentAmount
    });

  } catch (error) {
    console.error('Error applying payment to invoice:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to apply payment to invoice',
      details: error instanceof Error && error.message ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 