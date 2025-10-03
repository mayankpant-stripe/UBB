import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const customerId: string | undefined = body?.customerId;
    if (!customerId) {
      return NextResponse.json({ success: false, error: 'customerId is required' }, { status: 400 });
    }

    const customer = await stripe.customers.retrieve(customerId, {
      expand: ['invoice_settings.default_payment_method']
    });

    // Retrieve a sensible payment method identifier if possible
    let paymentMethodId: string | undefined;
    const anyCustomer: any = customer as any;
    const defaultPm = anyCustomer?.invoice_settings?.default_payment_method;
    if (typeof defaultPm === 'string') {
      paymentMethodId = defaultPm;
    } else if (defaultPm && typeof defaultPm?.id === 'string') {
      paymentMethodId = defaultPm.id;
    } else {
      const pms = await stripe.paymentMethods.list({ customer: customerId, type: 'card', limit: 1 });
      paymentMethodId = pms.data?.[0]?.id;
    }

    return NextResponse.json({
      success: true,
      customer: {
        id: (customer as any).id,
        name: (customer as any).name,
        email: (customer as any).email,
        paymentMethodId
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}


