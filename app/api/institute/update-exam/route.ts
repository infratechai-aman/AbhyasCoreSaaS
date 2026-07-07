import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { adminDb } from "@/lib/firebase-admin";
import { isRateLimited } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/institute/update-exam
 *
 * Updates an institute exam's status (live/ended).
 * Requires authentication + institute ownership verification.
 */
export async function PATCH(request: Request) {
  // 1. Authenticate
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  if (await isRateLimited(`inst-update:${authResult.uid}`, 20, 60_000)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  if (!adminDb) {
    return NextResponse.json({ error: "Server not configured." }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { examId, status } = body;

    // 2. Validate inputs
    if (!examId || typeof examId !== "string") {
      return NextResponse.json({ error: "Missing exam ID." }, { status: 400 });
    }
    if (!status || !["live", "ended", "scheduled"].includes(status)) {
      return NextResponse.json({ error: "Invalid status. Must be 'live', 'ended', or 'scheduled'." }, { status: 400 });
    }

    // 3. Verify exam exists and belongs to this user
    const examSnap = await adminDb.collection("institute_exams").doc(examId).get();
    if (!examSnap.exists) {
      return NextResponse.json({ error: "Exam not found." }, { status: 404 });
    }

    const examData = examSnap.data()!;
    if (examData.ownerUid !== authResult.uid) {
      return NextResponse.json({ error: "Unauthorized. You don't own this exam." }, { status: 403 });
    }

    // 4. Update the status
    await adminDb.collection("institute_exams").doc(examId).update({ status });

    return NextResponse.json({
      examId,
      status,
      message: `Exam status updated to '${status}'.`,
    });
  } catch (error: any) {
    console.error("[institute/update-exam] Error:", error);
    return NextResponse.json({ error: "Failed to update exam." }, { status: 500 });
  }
}
