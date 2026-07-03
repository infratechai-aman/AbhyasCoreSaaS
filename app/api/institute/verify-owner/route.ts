import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { adminDb } from "@/lib/firebase-admin";

/**
 * POST /api/institute/verify-owner
 * 
 * Checks if the authenticated user owns an institute.
 * Used by auth-context to set the abhyas_institute cookie.
 */
export async function POST(request: Request) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  if (!adminDb) {
    return NextResponse.json({ error: "Server not configured." }, { status: 500 });
  }

  try {
    // Query institutes collection for this user
    const snapshot = await adminDb
      .collection("institutes")
      .where("ownerUid", "==", authResult.uid)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ isInstitute: false });
    }

    const institute = snapshot.docs[0];
    return NextResponse.json({
      isInstitute: true,
      instituteId: institute.id,
      instituteName: institute.data().name,
    });
  } catch (error) {
    console.error("[institute/verify-owner] Error:", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
