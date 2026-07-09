import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { adminDb } from "@/lib/firebase-admin";
import { isRateLimited } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * GET /api/institute/results/[examId]
 *
 * Returns all attempts for a specific exam, sorted by score descending.
 * Requires authentication + institute ownership verification.
 */
export async function GET(
  request: Request,
  { params }: { params: { examId: string } }
) {
  // 1. Authenticate
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  if (await isRateLimited(`inst-results:${authResult.uid}`, 30, 60_000)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  if (!adminDb) {
    return NextResponse.json({ error: "Server not configured." }, { status: 500 });
  }

  try {
    const { examId } = params;

    if (!examId || typeof examId !== "string") {
      return NextResponse.json({ error: "Missing exam ID." }, { status: 400 });
    }

    // 2. Verify exam exists and belongs to this institute owner
    const examSnap = await adminDb.collection("institute_exams").doc(examId).get();
    if (!examSnap.exists) {
      return NextResponse.json({ error: "Exam not found." }, { status: 404 });
    }

    const exam = examSnap.data()!;
    if (exam.ownerUid !== authResult.uid) {
      return NextResponse.json({ error: "Unauthorized. You don't own this exam." }, { status: 403 });
    }

    // 3. Query all attempts for this exam, sorted by score desc
    const attemptsSnap = await adminDb
      .collection("institute_attempts")
      .where("examId", "==", examId)
      .get();

    const rawAttempts = attemptsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sort by score desc, then by timeTaken asc (faster student ranks higher on tie)
    rawAttempts.sort((a: any, b: any) => {
      if (b.score !== a.score) return b.score - a.score;
      return (a.timeTaken || 0) - (b.timeTaken || 0);
    });

    const attempts = rawAttempts.map((a: any, index: number) => ({
      ...a,
      rank: index + 1,
    }));

    // 4. Calculate aggregate stats
    const totalAttempts = attempts.length;
    const avgScore =
      totalAttempts > 0
        ? Math.round(attempts.reduce((sum: number, a: any) => sum + a.percentage, 0) / totalAttempts)
        : 0;
    const topScore = totalAttempts > 0 ? Math.max(...attempts.map((a: any) => a.percentage)) : 0;
    const avgTimeTaken =
      totalAttempts > 0
        ? Math.round(attempts.reduce((sum: number, a: any) => sum + (a.timeTaken || 0), 0) / totalAttempts)
        : 0;

    return NextResponse.json({
      examId,
      examTitle: exam.title,
      targetExam: exam.targetExam,
      totalAttempts,
      avgScore,
      topScore,
      avgTimeTaken,
      attempts,
    });
  } catch (error: any) {
    console.error("[institute/results] Error:", error);
    return NextResponse.json({ error: "Failed to fetch results." }, { status: 500 });
  }
}
