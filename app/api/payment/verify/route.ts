import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = await req.json();

    const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_placeholder';

    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_payment_id + '|' + razorpay_subscription_id)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      // Payment is legit. 
      // In a real app we could trigger the firebase-admin db update here if we had service account keys.
      // But since we rely on the client for user context (unless we use cookies), we just return success
      // and allow the client to update Firestore (with security rules guarding the update ideally).
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 400 });
    }
  } catch (err: any) {
    console.error('Verify error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
