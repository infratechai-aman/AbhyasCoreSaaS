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

    // Fetch up to 500 subscriptions
    let allSubs: any[] = [];
    let hasMore = true;
    let skip = 0;
    while (hasMore && skip < 500) {
      const subs = await razorpay.subscriptions.all({ count: 100, skip });
      if (!subs.items || subs.items.length === 0) {
        hasMore = false;
      } else {
        allSubs = [...allSubs, ...subs.items];
        if (subs.items.length < 100) hasMore = false;
        skip += 100;
      }
    }

    // Extract relevant info from each subscription
    const activeSubs = allSubs.map((sub: any) => ({
      subscriptionId: sub.id,
      status: sub.status, // created, authenticated, active, pending, halted, cancelled, completed, expired
      planId: sub.plan_id,
      userId: sub.notes?.user_id || null,
      userEmail: sub.notes?.user_email || null,
      userName: sub.notes?.user_name || null,
      planType: sub.notes?.plan_type || null, // 'pro_monthly' or 'pro_yearly'
      createdAt: sub.created_at,
    }));

    // Fetch up to 500 payments
    let allPayments: any[] = [];
    hasMore = true;
    skip = 0;
    while (hasMore && skip < 500) {
      const pays = await razorpay.payments.all({ count: 100, skip });
      if (!pays.items || pays.items.length === 0) {
        hasMore = false;
      } else {
        allPayments = [...allPayments, ...pays.items];
        if (pays.items.length < 100) hasMore = false;
        skip += 100;
      }
    }

    // Extract captured payments
    const activePays = allPayments
      .filter((pay: any) => pay.status === 'captured')
      .map((pay: any) => {
        const amount = Number(pay.amount);
        let planType = "pro_monthly";
        if (amount >= 29900) planType = "pro_yearly";
        else if (amount <= 700) planType = "weekly_pass";

        return {
          subscriptionId: "legacy_payment_" + pay.id,
          status: "active",
          planId: null,
          userId: pay.notes?.user_id || null,
          userEmail: pay.notes?.user_email || pay.email || null,
          userName: pay.notes?.user_name || null,
          planType: planType,
          createdAt: pay.created_at,
        };
      });

    // Combine both sets (prioritizing subscriptions)
    const combined = [...activeSubs, ...activePays];

    return NextResponse.json({ subscriptions: combined });
  } catch (error: any) {
    console.error('[sync-subscriptions] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
