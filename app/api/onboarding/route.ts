import { NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth-middleware";
import { adminDb } from "@/lib/firebase-admin";
import { parseBodyWithLimit } from "@/lib/body-limit";

/**
 * POST /api/onboarding
 * Saves onboarding profile data via Admin SDK, bypassing Firestore
 * security rules that block unverified-email users from writing.
 */
export async function POST(request: Request) {
  // Use verifyAuthToken directly (not requireAuth) to allow unverified emails
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { adminAuth } = await import("@/lib/firebase-admin");
  if (!adminAuth || !adminDb) {
    return NextResponse.json({ error: "Server not configured." }, { status: 500 });
  }

  let uid: string;
  let email: string | undefined;

  try {
    const token = authHeader.slice(7);
    const decoded = await adminAuth.verifyIdToken(token);
    if (!decoded.uid) {
      return NextResponse.json({ error: "Invalid token." }, { status: 401 });
    }
    uid = decoded.uid;
    email = decoded.email;
  } catch {
    return NextResponse.json({ error: "Invalid token." }, { status: 401 });
  }

  try {
    const body = await parseBodyWithLimit(request, '16kb');
    if (body instanceof NextResponse) return body;

    const { name, academicClass, targetExam } = body;

    // Validate inputs
    if (!name || typeof name !== "string" || name.trim().length < 2 || name.trim().length > 50) {
      return NextResponse.json({ error: "Name must be 2-50 characters." }, { status: 400 });
    }
    if (!academicClass || !["Class 11", "Class 12", "Dropper"].includes(academicClass)) {
      return NextResponse.json({ error: "Invalid academic class." }, { status: 400 });
    }
    if (!targetExam || !["JEE", "NEET"].includes(targetExam)) {
      return NextResponse.json({ error: "Invalid target exam." }, { status: 400 });
    }

    const sanitizedName = name.trim().replace(/<[^>]*>/g, "");
    const now = new Date();

    await adminDb.collection("users").doc(uid).set({
      name: sanitizedName,
      email: email || null,
      academicClass,
      targetExam,
      usage: {
        lastTrackedDate: now.toISOString().split("T")[0],
        examsAttemptedToday: 0,
        aiTokensUsedToday: 0,
        customExamsCreatedToday: 0,
        lastTrackedWeek: "",
        customExamsCreatedWeek: 0,
        completedExamIds: [],
      }
    }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[onboarding] Error:", err);
    return NextResponse.json({ error: "Failed to save onboarding data." }, { status: 500 });
  }
}
