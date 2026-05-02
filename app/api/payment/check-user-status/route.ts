import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const { userId, userEmail } = await req.json();

    if (!userId || !userEmail) {
      return NextResponse.json({ error: 'Missing userId or userEmail' }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: 'Razorpay keys not configured.' }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Fetch recent subscriptions (max 100)
    // Note: If you have more than 100 subscriptions, you may need pagination.
    const subscriptions = await razorpay.subscriptions.all({ count: 100 });

    // Find if the user has any active or authenticated subscription
    const activeSub = (subscriptions.items || []).find((sub: any) => {
      const isStatusValid = sub.status === 'active' || sub.status === 'authenticated' || sub.status === 'created';
      const isUserMatch = sub.notes?.user_email === userEmail || sub.notes?.user_id === userId;
      return isStatusValid && isUserMatch;
    });

    if (activeSub) {
      const plan = activeSub.notes?.plan_type === 'pro_yearly' ? 'Pro Yearly' : 'Pro Monthly';
      return NextResponse.json({
        hasActiveSubscription: true,
        plan: plan,
        subscriptionId: activeSub.id,
      });
    }

    return NextResponse.json({ hasActiveSubscription: false });
  } catch (error: any) {
    console.error('[check-user-status] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
