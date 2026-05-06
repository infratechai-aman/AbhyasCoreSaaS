import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '@/lib/firebase-admin';

/**
 * POST /api/payment/webhook
 * 
 * Razorpay sends webhook events here for server-side payment confirmation.
 * This is the AUTHORITATIVE source for subscription status — not the client.
 * 
 * Setup: Go to Razorpay Dashboard → Webhooks → Add New Webhook
 * URL: https://abhyascore.com/api/payment/webhook
 * Events: payment.captured, subscription.activated, subscription.cancelled,
 *         subscription.halted, subscription.completed, payment.failed
 * Secret: Set RAZORPAY_WEBHOOK_SECRET in your .env.local and Vercel
 */
export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // If webhook secret is not configured, log but don't crash
    if (!secret) {
      console.warn('[webhook] RAZORPAY_WEBHOOK_SECRET not configured. Skipping signature verification.');
      // Still process the event but log a warning
    }

    // Verify webhook signature
    if (secret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

      if (expectedSignature !== signature) {
        console.error('[webhook] Invalid signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    }

    const event = JSON.parse(body);
    const eventType = event.event;
    const payload = event.payload;

    if (!adminDb) {
      console.error('[webhook] Admin DB not initialized');
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }

    // Idempotency: check if we already processed this event
    const eventId = event.event_id || `${eventType}_${Date.now()}`;
    const webhookRef = adminDb.collection('webhook_events').doc(eventId);
    const existingEvent = await webhookRef.get();
    if (existingEvent.exists) {
      return NextResponse.json({ status: 'already_processed' });
    }

    // Process different event types
    switch (eventType) {
      case 'payment.captured': {
        const payment = payload.payment?.entity;
        if (!payment) break;

        const userId = payment.notes?.user_id;
        const planType = payment.notes?.plan_type;

        if (userId && planType) {
          let plan = 'Pro Monthly';
          if (planType === 'pro_yearly') plan = 'Pro Yearly';
          else if (planType === 'weekly_pass') plan = 'Weekly Pass';

          const userRef = adminDb.collection('users').doc(userId);
          const userSnap = await userRef.get();
          
          if (userSnap.exists) {
            await userRef.update({
              'subscription.plan': plan,
              'subscription.status': 'active',
              'subscription.paymentId': payment.id,
              'subscription.activatedAt': new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });

            // Mark weekly pass as used
            if (planType === 'weekly_pass') {
              await userRef.update({ weeklyPassUsed: true });
            }
          }
        }
        break;
      }

      case 'subscription.activated': {
        const subscription = payload.subscription?.entity;
        if (!subscription) break;

        const userId = subscription.notes?.user_id;
        const planType = subscription.notes?.plan_type;

        if (userId) {
          let plan = 'Pro Monthly';
          if (planType === 'pro_yearly') plan = 'Pro Yearly';

          const userRef = adminDb.collection('users').doc(userId);
          const userSnap = await userRef.get();

          if (userSnap.exists) {
            await userRef.update({
              'subscription.plan': plan,
              'subscription.status': 'active',
              'subscription.razorpaySubscriptionId': subscription.id,
              'subscription.activatedAt': new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        }
        break;
      }

      case 'subscription.cancelled':
      case 'subscription.completed':
      case 'subscription.expired': {
        const subscription = payload.subscription?.entity;
        if (!subscription) break;

        const userId = subscription.notes?.user_id;
        if (userId) {
          const userRef = adminDb.collection('users').doc(userId);
          const userSnap = await userRef.get();

          if (userSnap.exists) {
            await userRef.update({
              'subscription.plan': 'Free',
              'subscription.status': 'none',
              'subscription.cancelledAt': new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        }
        break;
      }

      case 'subscription.halted': {
        const subscription = payload.subscription?.entity;
        if (!subscription) break;

        const userId = subscription.notes?.user_id;
        if (userId) {
          const userRef = adminDb.collection('users').doc(userId);
          const userSnap = await userRef.get();

          if (userSnap.exists) {
            await userRef.update({
              'subscription.status': 'past_due',
              updatedAt: new Date().toISOString(),
            });
          }
        }
        break;
      }

      case 'payment.failed': {
        const payment = payload.payment?.entity;
        console.warn('[webhook] Payment failed:', payment?.id, payment?.notes?.user_email);
        break;
      }

      default:
        console.log('[webhook] Unhandled event type:', eventType);
    }

    // Record that we processed this event (idempotency)
    await webhookRef.set({
      eventType,
      processedAt: new Date().toISOString(),
      userId: payload.payment?.entity?.notes?.user_id 
           || payload.subscription?.entity?.notes?.user_id 
           || null,
    });

    return NextResponse.json({ status: 'ok' });
  } catch (err: any) {
    console.error('[webhook] Error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
