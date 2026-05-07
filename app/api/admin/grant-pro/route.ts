import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-middleware";
import { adminDb } from "@/lib/firebase-admin";
import { isRateLimited } from "@/lib/rate-limit";
import { logAdminAction } from "@/lib/admin-audit";

/**
 * POST /api/admin/grant-pro
 * Grants Pro subscription to a user via Admin SDK.
 * Body: { userId: string, plan?: string }
 */
export async function POST(request: Request) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  if (isRateLimited(`admin:${authResult.uid}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  if (!adminDb) {
    return NextResponse.json({ error: "Server not configured." }, { status: 500 });
  }

  try {
    const { userId, plan } = await request.json();

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "Missing userId." }, { status: 400 });
    }

    const selectedPlan = plan || "Pro Yearly";
    const userRef = adminDb.collection("users").doc(userId);
    const snap = await userRef.get();

    if (!snap.exists) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    await userRef.update({
      "subscription.plan": selectedPlan,
      "subscription.status": "active",
      "subscription.razorpaySubscriptionId": `ADMIN_GRANT_${Date.now()}`,
      maxTierPassed: 10,
      isPromo: true,
      updatedAt: new Date().toISOString(),
    });

    // Audit log
    logAdminAction({
      adminUid: authResult.uid,
      action: "grant_pro",
      targetUserId: userId,
      details: { plan: selectedPlan, email: snap.data()?.email },
    });

    return NextResponse.json({
      success: true,
      message: `Upgraded ${snap.data()?.email || userId} to ${selectedPlan}`,
    });
  } catch (err: any) {
    console.error("[admin/grant-pro] Error:", err);
    return NextResponse.json({ error: "Failed to grant Pro." }, { status: 500 });
  }
}
