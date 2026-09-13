import { NextResponse } from 'next/server';
import Stripe from 'stripe';

let stripeClient: Stripe | null = null;
function getStripe(): Stripe | null {
  if (!stripeClient && process.env.STRIPE_SECRET_KEY) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' as any });
  }
  return stripeClient;
}

export async function POST(req: Request) {
  try {
    const { hostId, passType } = await req.json();
    if (!hostId || !passType) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }
    
    const stripe = getStripe();
    if (!stripe) {
      // Mock flow if no Stripe key is provided
      console.warn("STRIPE_SECRET_KEY is missing. Using simulated payment flow.");
      return NextResponse.json({ 
        success: true, 
        simulated: true,
        checkoutUrl: `/payment/simulate?hostId=${hostId}&passType=${passType}` 
      });
    }
    
    // Real flow
    let priceData: any;
    if (passType === '24_hour_pass') {
       priceData = {
         currency: 'usd',
         product_data: { name: '24-Hour Event Pass' },
         unit_amount: 199, // $1.99
       };
    } else if (passType === 'annual_pass') {
       priceData = {
         currency: 'usd',
         product_data: { name: 'Annual Elite Pass' },
         unit_amount: 2999, // $29.99
       };
    } else {
       return NextResponse.json({ error: 'Invalid pass type' }, { status: 400 });
    }
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price_data: priceData, quantity: 1 }],
      mode: 'payment',
      success_url: `${process.env.APP_URL || 'http://localhost:3000'}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/?payment=cancelled`,
      metadata: { hostId, passType }
    });
    
    return NextResponse.json({ success: true, checkoutUrl: session.url });
  } catch (err: any) {
    console.error("Payment error:", err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
