import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_placeholder',
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { plan } = body; // 'Pro Monthly' or 'Pro Yearly'

    let planId = '';
    if (plan === 'Pro Monthly') {
        planId = process.env.RAZORPAY_PLAN_MONTHLY || '';
    } else if (plan === 'Pro Yearly') {
        planId = process.env.RAZORPAY_PLAN_YEARLY || '';
    } else {
        return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    if (!planId) {
        return NextResponse.json({ error: 'Plan IDs pending from admin configuration' }, { status: 500 });
    }

    // Creating Autopay Subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 120, // Example: 10 years of auto-renewal if monthly
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      status: subscription.status
    });
  } catch (error: any) {
    console.error('Error creating subscription', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
