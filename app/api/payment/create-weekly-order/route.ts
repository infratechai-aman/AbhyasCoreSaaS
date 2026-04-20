import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const body = await req.json();
    const { userId, userName, userEmail } = body;

    if (!userId || !userEmail) {
      return NextResponse.json({ error: 'Missing required user fields.' }, { status: 400 });
    }

    // Enforce one-time-per-account rule using Firestore
    if (db) {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        if (data?.weeklyPassUsed === true) {
          return NextResponse.json(
            { error: 'Weekly Pass has already been used on this account. Upgrade to Pro Monthly.' },
            { status: 403 }
          );
        }
      }
    }

    const order = await razorpay.orders.create({
      amount: 700, // ₹7 in paise
      currency: 'INR',
      receipt: `weekly_${userId}_${Date.now()}`,
      notes: {
        user_id: userId,
        user_name: userName || '',
        user_email: userEmail,
        plan_type: 'weekly_pass',
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    console.error('[create-weekly-order] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
