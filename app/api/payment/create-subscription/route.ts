import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const body = await req.json();
    const { userId, userName, userEmail, planType = 'monthly', isReferred } = body;

    if (!userId || !userEmail) {
      return NextResponse.json({ error: 'Missing required user fields.' }, { status: 400 });
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
      // No trial, no addon — subscription starts immediately at full plan price
      const subscription = await razorpay.subscriptions.create({
        plan_id: planId,
        customer_notify: 1,
        total_count: 120,
        notes: {
          user_id: userId,
          user_name: userName || '',
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
      total_count: 120, // 10 years max auto-renewal
      start_at: trialEndTimestamp, // Delayed next charge
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
        user_name: userName || '',
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
