import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

/**
 * GET /api/payment/sync-subscriptions
 * 
 * Fetches all active subscriptions from Razorpay and returns them.
 * The admin page will then match them against Firestore users and update their plans.
 */
export async function GET() {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: 'Razorpay keys not configured.' }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Fetch all subscriptions from Razorpay (max 100)
    const subscriptions = await razorpay.subscriptions.all({ count: 100 });

    // Extract relevant info from each subscription
    const activeSubs = (subscriptions.items || []).map((sub: any) => ({
      subscriptionId: sub.id,
      status: sub.status, // created, authenticated, active, pending, halted, cancelled, completed, expired
      planId: sub.plan_id,
      userId: sub.notes?.user_id || null,
      userEmail: sub.notes?.user_email || null,
      userName: sub.notes?.user_name || null,
      planType: sub.notes?.plan_type || null, // 'pro_monthly' or 'pro_yearly'
      createdAt: sub.created_at,
    }));

    return NextResponse.json({ subscriptions: activeSubs });
  } catch (error: any) {
    console.error('[sync-subscriptions] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
