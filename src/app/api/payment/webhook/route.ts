import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/core/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

let stripeClient: Stripe | null = null;
function getStripe(): Stripe | null {
  if (!stripeClient && process.env.STRIPE_SECRET_KEY) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' as any });
  }
  return stripeClient;
}

export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 400 });
  }

  const payload = await req.text();
  const sig = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { hostId, passType } = session.metadata || {};

    if (hostId && passType) {
      // Grant entitlement
      try {
        const hostRef = doc(db, 'hosts', hostId);
        const expiresAt = passType === '24_hour_pass' 
            ? Date.now() + 24 * 60 * 60 * 1000 
            : Date.now() + 365 * 24 * 60 * 60 * 1000;
            
        await updateDoc(hostRef, {
          tier: passType,
          activeEntitlements: arrayUnion({
            type: passType,
            expiresAt
          })
        });
        console.log(`Granted ${passType} to ${hostId}`);
      } catch (err) {
        console.error("Failed to grant entitlement in Firestore:", err);
      }
    }
  }

  return NextResponse.json({ received: true });
}
