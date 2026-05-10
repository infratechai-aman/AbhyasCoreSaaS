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
    if (await isRateLimited(`check-status:${authResult.uid}`, 5, 60_000)) {
      return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
    }

    // Use authenticated user's identity
    const userId = authResult.uid;
    const userEmail = authResult.email;

    // 2b. Check existing Firestore subscription first (fast path)
    if (adminDb) {
      const userSnap = await adminDb.collection('users').doc(userId).get();
      if (userSnap.exists) {
        const data = userSnap.data();
        const sub = data?.subscription;
        if (sub?.status === 'active' && sub?.plan && sub.plan !== 'Free') {
          // Check expiry for time-limited plans
          if (sub.expiryDate) {
            const now = new Date();
            const expiry = new Date(sub.expiryDate);
            if (now > expiry) {
              // Expired — downgrade in Firestore and continue to Razorpay check
              await adminDb.collection('users').doc(userId).update({
                'subscription.plan': 'Free',
                'subscription.status': 'none',
                'subscription.expiredAt': new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
              // Fall through to Razorpay check
            } else {
              // Still active
              return NextResponse.json({
                hasActiveSubscription: true,
                plan: sub.plan,
                subscriptionId: sub.razorpaySubscriptionId || sub.paymentId || 'firestore',
              });
            }
          } else {
            // No expiry = permanent subscription (monthly/yearly auto-renew)
            return NextResponse.json({
              hasActiveSubscription: true,
              plan: sub.plan,
              subscriptionId: sub.razorpaySubscriptionId || sub.paymentId || 'firestore',
            });
          }
        }
      }
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: 'Payment service not configured.' }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Check subscriptions first (up to 5 pages / 500 records)
    let activeSub = null;
    let hasMore = true;
    let skip = 0;
    
    while (hasMore && skip < 500) {
      const subs = await razorpay.subscriptions.all({ count: 100, skip });
      if (!subs.items || subs.items.length === 0) {
        hasMore = false;
        break;
      }
      
      const found = subs.items.find((sub: any) => {
        const isStatusValid = sub.status === 'active' || sub.status === 'authenticated';
        const isUserMatch = sub.notes?.user_email === userEmail || sub.notes?.user_id === userId;
        return isStatusValid && isUserMatch;
      });
      
      if (found) {
        activeSub = found;
        break;
      }
      
      if (subs.items.length < 100) hasMore = false;
      skip += 100;
    }

    if (activeSub) {
      const plan = activeSub.notes?.plan_type === 'pro_yearly' ? 'Pro Yearly' : 'Pro Monthly';
      return NextResponse.json({
        hasActiveSubscription: true,
        plan: plan,
        subscriptionId: activeSub.id,
      });
    }

    // No active Razorpay subscription found — do NOT re-grant from old payments
    // Weekly Pass payments are one-time and expire; they should not reactivate
    return NextResponse.json({ hasActiveSubscription: false });
  } catch (error: any) {
    console.error('[check-user-status] Error:', error);
    return NextResponse.json({ error: 'Status check failed.' }, { status: 500 });
  }
}
