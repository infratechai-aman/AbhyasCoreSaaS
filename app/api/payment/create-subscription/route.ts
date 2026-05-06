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
    if (isRateLimited(`create-sub:${authResult.uid}`, 5, 60_000)) {
      return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const body = await req.json();
    const { planType = 'monthly' } = body;

    // Use authenticated user's identity — ignore client-supplied userId/email
    const userId = authResult.uid;
    const userEmail = authResult.email;

    // Validate isReferred SERVER-SIDE from Firestore (don't trust client)
    let isReferred = false;
    if (adminDb) {
      const userSnap = await adminDb.collection('users').doc(userId).get();
      if (userSnap.exists) {
        const data = userSnap.data();
        isReferred = !!data?.referredBy;
      }
    }

    const planId = planType === 'yearly' 
      ? process.env.RAZORPAY_PLAN_YEARLY_399 
      : process.env.RAZORPAY_PLAN_MONTHLY_49;

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID not configured. Contact support.' },
        { status: 500 }
      );
    }

    // Referred users: skip trial entirely, go straight to full plan with autopay
    // Non-referred users: ₹7 upfront for 7-day trial, then auto-renew at plan price
    if (isReferred) {
      const subscription = await razorpay.subscriptions.create({
        plan_id: planId,
        customer_notify: 1,
        total_count: 120,
        notes: {
          user_id: userId,
          user_email: userEmail,
          plan_type: planType === 'yearly' ? 'pro_yearly' : 'pro_monthly',
          referral: 'true',
        },
      });

      return NextResponse.json({
        subscriptionId: subscription.id,
        status: subscription.status,
      });
    }

    // Non-referred flow: 7-day trial with ₹7 upfront
    const trialDays = 7;
    const upfrontAmount = 700; // ₹7 in paise
    const upfrontName = "7-Day Pro Trial";
    const trialEndTimestamp = Math.floor(Date.now() / 1000) + trialDays * 24 * 60 * 60;

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 120,
      start_at: trialEndTimestamp,
      addons: [
        {
          item: {
            name: upfrontName,
            amount: upfrontAmount,
            currency: 'INR',
          },
        },
      ],
      notes: {
        user_id: userId,
        user_email: userEmail,
        plan_type: planType === 'yearly' ? 'pro_yearly' : 'pro_monthly',
      },
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      status: subscription.status,
    });
  } catch (error: any) {
    console.error('[create-subscription] Error:', error);
    return NextResponse.json({ error: 'Failed to create subscription.' }, { status: 500 });
  }
}
