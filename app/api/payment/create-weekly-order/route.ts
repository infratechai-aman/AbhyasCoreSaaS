import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { requireAuth } from '@/lib/auth-middleware';
import { adminDb } from '@/lib/firebase-admin';
import { isRateLimited } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    // 1. Authenticate
    const authResult = await requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    // 2. Rate limit
    if (isRateLimited(`weekly:${authResult.uid}`, 3, 60_000)) {
      return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
    }

    const userId = authResult.uid;
    const userEmail = authResult.email;

    // 3. Enforce one-time-per-account rule using Admin SDK
    if (adminDb) {
      const userSnap = await adminDb.collection('users').doc(userId).get();
      if (userSnap.exists) {
        const data = userSnap.data();
        if (data?.weeklyPassUsed === true) {
          return NextResponse.json(
            { error: 'Weekly Pass has already been used on this account. Upgrade to Pro Monthly.' },
            { status: 403 }
          );
        }
      }
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const order = await razorpay.orders.create({
      amount: 700, // ₹7 in paise
      currency: 'INR',
      receipt: `weekly_${userId}_${Date.now()}`,
      notes: {
        user_id: userId,
        user_email: userEmail,
        plan_type: 'weekly_pass',
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    console.error('[create-weekly-order] Error:', error);
    return NextResponse.json({ error: 'Failed to create order.' }, { status: 500 });
  }
}
