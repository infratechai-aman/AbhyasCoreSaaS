import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const body = await req.json();
    const { userId, userName, userEmail, planType = 'monthly' } = body;

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

    // The recurring ₹49/month subscription starts 7 days from now.
    const trialEndTimestamp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 120, // 10 years max auto-renewal
      start_at: trialEndTimestamp, // First ₹49 charge on Day 7
      addons: [
        {
          item: {
            name: '7-Day Pro Trial',
            amount: 700, // ₹7 in paise
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
