import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

/**
 * POST /api/payment/create-subscription
 *
 * Creates a Razorpay subscription for the Pro Monthly plan.
 * Billing flow:
 *   - Day 0  : ₹7 upfront add-on (paid trial)
 *   - Day 7  : ₹49 charged (Month 1 — first recurring cycle)
 *   - Monthly: ₹49 auto-charged every month thereafter
 *
 * The Razorpay plan referenced here (RAZORPAY_PLAN_MONTHLY_49) must be
 * set up in the dashboard at ₹49/month with no trial configured there —
 * we handle the 7-day trial via `start_at` (7 days from now) and
 * the ₹7 upfront amount via the `addons` field.
 */
export async function POST(req: Request) {
  try {
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
