import Stripe from 'stripe';
import { handleSubscriptionChange, stripe } from '@/lib/payments/stripe';
import { NextRequest, NextResponse } from 'next/server';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed.' },
      { status: 400 }
    );
  }

  switch (event.type) {
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionChange(subscription);
      break;
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('🎉 CHECKOUT SESSION COMPLETED 🎉');
      console.log('Customer ID:', session.customer);
      console.log('Subscription ID:', session.subscription);
      console.log('Session ID:', session.id);
      console.log('Payment Status:', session.payment_status);
      console.log('Session Mode:', session.mode);
      
      // Skip processing for setup mode sessions (Core, Advanced, Pro plans)
      // These are processed by /api/process-checkout-success instead
      if (session.mode === 'setup') {
        console.log('⏭️  Skipping webhook processing for setup mode session');
        console.log('⏭️  This session will be processed by /api/process-checkout-success');
        break;
      }
      
      // Only process subscription mode sessions (Free plan)
      if (!session.subscription) {
        console.log('⏭️  Skipping webhook processing - no subscription found');
        break;
      }
      
      // Define and initialize custid variable
      let custid: string | null = null;
      
      // Store the customer id in custid variable
      if (typeof session.customer === 'string') {
        custid = session.customer;
      } else if (session.customer && typeof session.customer === 'object') {
        custid = session.customer.id;
      }
      
      console.log('Stored Customer ID in custid:', custid);
      
      // Check if the session contains the specific product before creating credit grant and invoice
      if (custid) {
        try {
          // Retrieve the session with expanded line_items to get product information
          const expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ['line_items', 'line_items.data.price.product']
          });
          
          console.log('🔍 DEBUG: Checking products in checkout session...');
          console.log('🔍 DEBUG: Session ID:', session.id);
          console.log('🔍 DEBUG: Expanded session line items count:', expandedSession.line_items?.data?.length || 0);
          
          // Check if any line item contains the target product
          const targetProductId = 'prod_SXHoJbqMIwzgzz';
          let hasTargetProduct = false;
          let allProductIds: string[] = [];
          
          if (expandedSession.line_items?.data) {
            console.log('🔍 DEBUG: Processing line items...');
            for (let i = 0; i < expandedSession.line_items.data.length; i++) {
              const lineItem = expandedSession.line_items.data[i];
              const product = lineItem.price?.product;
              const productId = typeof product === 'string' ? product : product?.id;
              
              console.log(`🔍 DEBUG: Line item ${i + 1}:`, {
                productId: productId,
                priceId: lineItem.price?.id,
                quantity: lineItem.quantity,
                description: lineItem.description
              });
              
              if (productId) {
                allProductIds.push(productId);
              }
              
              if (productId === targetProductId) {
                hasTargetProduct = true;
                console.log('✅ Target product found:', targetProductId);
                break;
              }
            }
            
            console.log('🔍 DEBUG: All product IDs found:', allProductIds);
            console.log('🔍 DEBUG: Looking for target product ID:', targetProductId);
            console.log('🔍 DEBUG: Target product found?', hasTargetProduct);
          } else {
            console.log('🔍 DEBUG: No line items found in expanded session');
          }
          
          if (!hasTargetProduct) {
            console.log('❌ DEBUG: Target product not found. Skipping credit grant and invoice creation.');
            console.log('❌ DEBUG: Required product ID:', targetProductId);
            console.log('❌ DEBUG: Found product IDs:', allProductIds);
            console.log('❌ DEBUG: Session contains different products - no additional processing needed.');
            console.log('❌ DEBUG: To fix this, update the targetProductId in the webhook to match one of the found product IDs');
          } else {
            console.log('🎯 Processing credit grant and invoice for target product:', targetProductId);
            
            // Create credit grant if target product is found
            try {
              // Get subscription details to determine the credit grant amount
              const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
              const subscriptionPrice = subscription.items.data[0].price.unit_amount || 0;
              const subscriptionCurrency = subscription.items.data[0].price.currency;
              
              // Get flow type from session metadata to determine credit grant amount
              const flowType = session.metadata?.flow_type || '';
              let creditGrantAmount: number;
              
              // Core plan: constant $100 (10000 cents)
              if (flowType === 'core_custom_credits_flow') {
                creditGrantAmount = 10000; // $100 in cents
                console.log('Core Plan: Using constant credit grant amount');
              } else {
                // Other plans: 10x the subscription price
                creditGrantAmount = subscriptionPrice * 10;
                console.log('Other Plan: Calculating credit grant as 10x subscription price');
              }
              
              console.log('Subscription price:', subscriptionPrice, subscriptionCurrency.toUpperCase());
              console.log('Credit grant amount:', creditGrantAmount, subscriptionCurrency.toUpperCase());
              
              const options = {
                amount: {
                  monetary: {
                    currency: subscriptionCurrency,
                    value: creditGrantAmount,
                  },
                  type: "monetary",
                },
                applicability_config: {
                  scope: {
                    price_type: "metered"
                  }
                },
                category: "paid",
                customer: custid,
                name: "Purchased Credits",
              };
              
              console.log('Creating credit grant with options:', JSON.stringify(options, null, 2));
              
              // Create credit grant using the real API endpoint
              // Convert options to URL-encoded format for Stripe API
              const formData = new URLSearchParams();
              formData.append('amount[monetary][currency]', options.amount.monetary.currency);
              formData.append('amount[monetary][value]', options.amount.monetary.value.toString());
              formData.append('amount[type]', options.amount.type);
              formData.append('applicability_config[scope][price_type]', options.applicability_config.scope.price_type);
              formData.append('category', options.category);
              formData.append('customer', options.customer);
              formData.append('name', options.name);
              
              const response = await fetch('https://api.stripe.com/v1/billing/credit_grants', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`
                },
                body: formData.toString()
              });
              
              if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Credit grant API failed: ${response.status} ${response.statusText} - ${errorText}`);
              }
              
              const creditGrantResult = await response.json();
              console.log('✅ Credit grant created successfully:', creditGrantResult);
              console.log('Credit Grant ID:', creditGrantResult.id);
              console.log('Credit Grant Amount:', creditGrantResult.amount.monetary.value, creditGrantResult.amount.monetary.currency.toUpperCase());
              
            } catch (error) {
              console.error('❌ Error creating credit grant:', error);
            }
            
            // Create invoice of 10x subscription price against the customer (independent of credit grant success)
            try {
              console.log('Creating invoice for customer:', custid);
              
              // Get subscription details to determine the invoice amount (same logic as credit grant)
              const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
              const subscriptionPrice = subscription.items.data[0].price.unit_amount || 0;
              const subscriptionCurrency = subscription.items.data[0].price.currency;
              
              // Get flow type from session metadata to determine invoice amount
              const flowType = session.metadata?.flow_type || '';
              let invoiceAmount: number;
              
              // Core plan: constant $100 (10000 cents)
              if (flowType === 'core_custom_credits_flow') {
                invoiceAmount = 10000; // $100 in cents
                console.log('Core Plan: Using constant invoice amount of $100');
              } else {
                // Other plans: 10x the subscription price
                invoiceAmount = subscriptionPrice * 10;
                console.log('Other Plan: Calculating invoice as 10x subscription price');
              }
              
              console.log('Subscription price:', subscriptionPrice, subscriptionCurrency.toUpperCase());
              console.log('Invoice amount:', invoiceAmount, subscriptionCurrency.toUpperCase());
              
              // Get the customer's payment methods to find the one used in checkout
              const paymentMethods = await stripe.paymentMethods.list({
                customer: custid,
                type: 'card',
              });
              
              const defaultPaymentMethod = paymentMethods.data[0]?.id; // Use the most recent payment method
              console.log('Using payment method:', defaultPaymentMethod);
              
              const invoice = await stripe.invoices.create({
                customer: custid,
                currency: subscriptionCurrency, // Use same currency as subscription
                collection_method: 'charge_automatically',
                default_payment_method: defaultPaymentMethod, // Specify the payment method
                description: 'Credit Purchase Invoice',
              });
              
              // Add invoice item with the specified product
              await stripe.invoiceItems.create({
                customer: custid,
                invoice: invoice.id,
                price_data: {
                  currency: subscriptionCurrency, // Use same currency as subscription
                  product: 'prod_SYaDpTidRPW4bE',
                  unit_amount: invoiceAmount, // 10x subscription price
                },
                quantity: 1,
              });
              
              // Finalize the invoice
              const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id!);
              
              // Attempt to pay the invoice automatically with the specified payment method
              const paidInvoice = await stripe.invoices.pay(finalizedInvoice.id!, {
                payment_method: defaultPaymentMethod
              });
              
              console.log('✅ Invoice created and charged successfully:');
              console.log('Invoice ID:', paidInvoice.id);
              console.log('Invoice Number:', paidInvoice.number);
              console.log('Invoice Amount:', paidInvoice.amount_due / 100, subscriptionCurrency.toUpperCase());
              console.log('Invoice Status:', paidInvoice.status);
              console.log('Invoice Payment Status:', paidInvoice.status === 'paid' ? 'PAID' : 'UNPAID');
              console.log('Invoice URL:', paidInvoice.hosted_invoice_url);
              
            } catch (invoiceError) {
              console.error('❌ Error creating invoice:', invoiceError);
            }
          }
          
        } catch (error) {
          console.error('❌ Error checking session products:', error);
        }
        
      } else {
        console.error('❌ No customer ID available for credit grant or invoice');
      }
      
      console.log('Full session data:', JSON.stringify(session, null, 2));
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
