import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { requireAuth } from '@/lib/auth-middleware';
import { isRateLimited } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    // 1. Authenticate
    const authResult = await requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    // 2. Rate limit
    if (isRateLimited(`check-status:${authResult.uid}`, 5, 60_000)) {
      return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
    }

    // Use authenticated user's identity
    const userId = authResult.uid;
    const userEmail = authResult.email;

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
        const isStatusValid = sub.status === 'active' || sub.status === 'authenticated' || sub.status === 'created';
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

    // If not found in subscriptions, check standard payments (for Weekly Pass or old legacy payments)
    let activePayment = null;
    hasMore = true;
    skip = 0;
    
    while (hasMore && skip < 500) {
      const payments = await razorpay.payments.all({ count: 100, skip });
      if (!payments.items || payments.items.length === 0) {
        hasMore = false;
        break;
      }
      
      const found = payments.items.find((pay: any) => {
        const isCaptured = pay.status === 'captured';
        const isUserMatch = pay.notes?.user_email === userEmail || pay.notes?.user_id === userId || pay.email === userEmail;
        return isCaptured && isUserMatch;
      });
      
      if (found) {
        activePayment = found;
        break;
      }
      
      if (payments.items.length < 100) hasMore = false;
      skip += 100;
    }

    if (activePayment) {
      const amount = Number(activePayment.amount);
      let plan = "Pro Monthly";
      if (amount >= 29900) plan = "Pro Yearly";
      else if (amount <= 700) plan = "Weekly Pass";
      
      return NextResponse.json({
        hasActiveSubscription: true,
        plan: plan,
        subscriptionId: "legacy_payment_" + activePayment.id,
      });
    }

    return NextResponse.json({ hasActiveSubscription: false });
  } catch (error: any) {
    console.error('[check-user-status] Error:', error);
    return NextResponse.json({ error: 'Status check failed.' }, { status: 500 });
  }
}
