import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { isRateLimited } from "@/lib/rate-limit";

/**
 * POST /api/account/delete
 * 
 * Self-serve account deletion endpoint.
 * Deletes the user's Firestore data and Firebase Auth account.
 * Required for DPDP Act 2023 compliance (right to erasure).
 */
export async function POST(request: Request) {
  // 1. Authenticate
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  // 2. Rate limit: 2 per hour (prevent abuse)
  if (await isRateLimited(`delete-account:${authResult.uid}`, 2, 3600_000)) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  if (!adminDb || !adminAuth) {
    return NextResponse.json({ error: "Server not configured." }, { status: 500 });
  }

  try {
    const uid = authResult.uid;

    // 3. Delete user data from Firestore collections
    const batch = adminDb.batch();

    // Delete user profile
    batch.delete(adminDb.collection("users").doc(uid));

    // Delete user's test results
    const resultsSnap = await adminDb.collection("results")
      .where("userId", "==", uid).limit(500).get();
    resultsSnap.docs.forEach(doc => batch.delete(doc.ref));

    // Delete user's AI chat history
    const chatsSnap = await adminDb.collection("ai_chats")
      .where("userId", "==", uid).limit(500).get();
    chatsSnap.docs.forEach(doc => batch.delete(doc.ref));

    // Delete user's exam sessions
    const sessionsSnap = await adminDb.collection("exam_sessions")
      .where("userId", "==", uid).limit(500).get();
    sessionsSnap.docs.forEach(doc => batch.delete(doc.ref));

    await batch.commit();

    // 4. Delete Firebase Auth account
    await adminAuth.deleteUser(uid);

    // 5. Revoke all refresh tokens (invalidates all sessions)
    try {
      await adminAuth.revokeRefreshTokens(uid);
    } catch {} // May fail if user already deleted

    return NextResponse.json({
      success: true,
      message: "Your account and all associated data have been permanently deleted.",
    });
  } catch (error: any) {
    console.error("[account/delete] Error:", error);
    return NextResponse.json({ error: "Failed to delete account. Please contact support." }, { status: 500 });
  }
}
