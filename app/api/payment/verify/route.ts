import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { requireAuth } from '@/lib/auth-middleware';
import { adminDb } from '@/lib/firebase-admin';
import { isRateLimited } from '@/lib/rate-limit';
import { parseBodyWithLimit } from '@/lib/body-limit';

export async function POST(req: Request) {
  try {
    // 1. Authenticate
    const authResult = await requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    // 2. Rate limit: 5 verifications per minute per user
    if (await isRateLimited(`verify:${authResult.uid}`, 5, 60_000)) {
      return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
    }

    const body = await parseBodyWithLimit(req, '256kb');
    if (body instanceof NextResponse) return body;
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature, planType } = body;

    // SECURITY (VULN-14): Validate required payment fields exist and are strings
    if (!razorpay_payment_id || typeof razorpay_payment_id !== 'string' ||
        !razorpay_subscription_id || typeof razorpay_subscription_id !== 'string' ||
        !razorpay_signature || typeof razorpay_signature !== 'string') {
      return NextResponse.json({ success: false, message: 'Missing payment parameters.' }, { status: 400 });
    }

    // 3. Verify Razorpay signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error('[verify] RAZORPAY_KEY_SECRET is not configured');
      return NextResponse.json({ error: 'Payment service misconfigured.' }, { status: 500 });
    }

    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_payment_id + '|' + razorpay_subscription_id)
      .digest('hex');

    // Timing-safe comparison to prevent side-channel attacks
    // SECURITY (VULN-14): Validate hex format before Buffer.from to prevent crash
    const hexRegex = /^[0-9a-f]+$/i;
    if (!hexRegex.test(razorpay_signature) || razorpay_signature.length % 2 !== 0) {
      return NextResponse.json({ success: false, message: 'Invalid signature format.' }, { status: 400 });
    }
    const genBuffer = Buffer.from(generated_signature, 'hex');
    const sigBuffer = Buffer.from(razorpay_signature, 'hex');
    if (genBuffer.length !== sigBuffer.length || !crypto.timingSafeEqual(genBuffer, sigBuffer)) {
      return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 400 });
    }

    // 4. Server-side entitlement via Admin SDK (the critical fix)
    if (!adminDb) {
      console.error('[verify] Admin DB not initialized');
      return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    const selectedPlan = planType === 'yearly' ? 'Pro Yearly' : 'Pro Monthly';
    const userRef = adminDb.collection('users').doc(authResult.uid);

    // Idempotency: check if this payment was already processed
    const userSnap = await userRef.get();
    if (userSnap.exists) {
      const data = userSnap.data();
      if (data?.subscription?.razorpaySubscriptionId === razorpay_subscription_id
          && data?.subscription?.status === 'active') {
        // Already processed — return success without re-writing
        return NextResponse.json({ success: true, message: 'Already activated.' });
      }
    }

    // Write subscription entitlement server-side
    await userRef.update({
      'subscription.plan': selectedPlan,
      'subscription.status': 'active',
      'subscription.razorpaySubscriptionId': razorpay_subscription_id,
      'subscription.activatedAt': new Date().toISOString(),
      'subscription.paymentId': razorpay_payment_id,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error('[verify] Error:', err);
    return NextResponse.json({ success: false, message: 'Verification failed.' }, { status: 500 });
  }
}
