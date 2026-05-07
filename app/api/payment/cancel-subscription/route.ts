import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { requireAuth } from "@/lib/auth-middleware";
import { adminDb } from "@/lib/firebase-admin";
import { isRateLimited } from "@/lib/rate-limit";

/**
 * POST /api/payment/cancel-subscription
 * Self-serve subscription cancellation.
 * Cancels the user's active Razorpay subscription and updates Firestore.
 */
export async function POST(req: Request) {
  try {
    // 1. Authenticate
    const authResult = await requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    // 2. Rate limit: 3 cancellation attempts per hour
    if (isRateLimited(`cancel:${authResult.uid}`, 3, 3600_000)) {
      return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: "Server not configured." }, { status: 500 });
    }

    // 3. Get user's current subscription from Firestore
    const userRef = adminDb.collection("users").doc(authResult.uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const userData = userSnap.data();
    const sub = userData?.subscription;

    if (!sub || sub.status !== "active" || sub.plan === "Free") {
      return NextResponse.json({ error: "No active subscription to cancel." }, { status: 400 });
    }

    const razorpaySubId = sub.razorpaySubscriptionId;

    // 4. Cancel on Razorpay if it's a real subscription (not a manual/promo grant)
    if (razorpaySubId && !razorpaySubId.startsWith("ADMIN_") && !razorpaySubId.startsWith("MANUAL_")) {
      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      if (keyId && keySecret) {
        try {
          const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
          // cancel_at_cycle_end = true: user keeps access until billing cycle ends
          await razorpay.subscriptions.cancel(razorpaySubId, true);
        } catch (rpErr: any) {
          // If subscription is already cancelled or not found, proceed with Firestore update
          if (rpErr.statusCode !== 400 && rpErr.statusCode !== 404) {
            console.error("[cancel-subscription] Razorpay error:", rpErr);
            return NextResponse.json({ error: "Failed to cancel subscription with payment provider." }, { status: 500 });
          }
        }
      }
    }

    // 5. Update Firestore
    await userRef.update({
      "subscription.status": "cancelled",
      "subscription.cancelledAt": new Date().toISOString(),
      "subscription.cancelReason": "user_self_serve",
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Subscription cancelled. You will retain access until the end of your current billing period.",
    });
  } catch (err: any) {
    console.error("[cancel-subscription] Error:", err);
    return NextResponse.json({ error: "Cancellation failed. Please try again." }, { status: 500 });
  }
}
