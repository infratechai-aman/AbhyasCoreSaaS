import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-middleware";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { isRateLimited } from "@/lib/rate-limit";
import { logAdminAction } from "@/lib/admin-audit";

/**
 * POST /api/admin/create-promo-account
 * Creates a new Firebase Auth user + Firestore doc with Pro Yearly.
 * Body: { email: string, password: string, name: string, targetExam: string }
 */
export async function POST(request: Request) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  if (isRateLimited(`admin:${authResult.uid}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  if (!adminDb || !adminAuth) {
    return NextResponse.json({ error: "Server not configured." }, { status: 500 });
  }

  try {
    const { email, password, name, targetExam } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Missing email, password, or name." },
        { status: 400 }
      );
    }

    // Validate inputs
    const trimmedName = name.trim().replace(/<[^>]*>/g, "");
    if (trimmedName.length < 2 || trimmedName.length > 50) {
      return NextResponse.json({ error: "Name must be 2-50 characters." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    // Create Firebase Auth user via Admin SDK (doesn't affect current admin session)
    const userRecord = await adminAuth.createUser({
      email: email.trim().toLowerCase(),
      password,
      displayName: trimmedName,
      emailVerified: true, // Promo accounts skip verification
    });

    // Create Firestore user doc via Admin SDK
    await adminDb.collection("users").doc(userRecord.uid).set({
      name: trimmedName,
      email: email.trim().toLowerCase(),
      targetExam: targetExam || "JEE",
      createdAt: new Date().toISOString(),
      streak: 0,
      questionsSolved: 0,
      mocksCompleted: 0,
      subscription: {
        plan: "Pro Yearly",
        status: "active",
        razorpaySubscriptionId: `ADMIN_PROMO_${Date.now()}`,
      },
      maxTierPassed: 10,
      isPromo: true,
    });

    // Audit log
    logAdminAction({
      adminUid: authResult.uid,
      action: "create_promo_account",
      targetUserId: userRecord.uid,
      details: { email: userRecord.email, name: trimmedName },
    });

    return NextResponse.json({
      success: true,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        name: trimmedName,
      },
      message: `Account created & granted Lifetime Pro!`,
    });
  } catch (err: any) {
    console.error("[admin/create-promo-account] Error:", err);

    // Return user-friendly Firebase Auth errors
    if (err.code === "auth/email-already-exists") {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }
    if (err.code === "auth/invalid-email") {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    return NextResponse.json(
      { error: err.message || "Failed to create account." },
      { status: 500 }
    );
  }
}
