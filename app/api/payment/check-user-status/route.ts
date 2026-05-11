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

    // SECURITY (VULN-16): Do not fallback to iterating all Razorpay subscriptions.
    // Trust Firestore as the strict source of truth for scalable performance.
    return NextResponse.json({ hasActiveSubscription: false });
  } catch (error: any) {
    // SECURITY (VULN-25): Sanitize error message
    console.error('[check-user-status] Error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
