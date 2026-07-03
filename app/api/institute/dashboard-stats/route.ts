import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { adminDb } from "@/lib/firebase-admin";
import { isRateLimited } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * GET /api/institute/dashboard-stats
 *
 * Returns aggregated dashboard statistics for the institute owner.
 * Includes exam counts, total attempts, live exam count, average score,
 * recent exams, and top students.
 */
export async function GET(request: Request) {
  // 1. Authenticate
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  if (await isRateLimited(`inst-stats:${authResult.uid}`, 20, 60_000)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  if (!adminDb) {
    return NextResponse.json({ error: "Server not configured." }, { status: 500 });
  }

  try {
    // 2. Verify user is an institute owner
    const instSnap = await adminDb
      .collection("institutes")
      .where("ownerUid", "==", authResult.uid)
      .limit(1)
      .get();

    if (instSnap.empty) {
      return NextResponse.json({ error: "Not an institute owner." }, { status: 403 });
    }

    const institute = instSnap.docs[0];
    const instituteId = institute.id;
    const instData = institute.data();

    // 3. Fetch all exams for this institute
    const examsSnap = await adminDb
      .collection("institute_exams")
      .where("createdBy", "==", instituteId)
      .orderBy("createdAt", "desc")
      .get();

    const exams = examsSnap.docs.map((doc) => {
      const { passwordHash, ...safeData } = doc.data() as any;
      return { id: doc.id, ...safeData };
    });

    const totalExams = exams.length;
    const liveExams = exams.filter((e: any) => e.status === "live");
    const recentExams = exams.slice(0, 5); // Last 5 exams

    // 4. Fetch all attempts for this institute
    const attemptsSnap = await adminDb
      .collection("institute_attempts")
      .where("instituteId", "==", instituteId)
      .get();

    const attempts = attemptsSnap.docs.map((doc) => doc.data());
    const totalAttempts = attempts.length;

    // Average score across all attempts
    const avgScore =
      totalAttempts > 0
        ? Math.round(
            (attempts.reduce((sum, a: any) => sum + (a.percentage || 0), 0) / totalAttempts) * 10
          ) / 10
        : 0;

    // 5. Get attempt counts per exam for recent exams
    const examAttemptCounts: Record<string, number> = {};
    attempts.forEach((a: any) => {
      examAttemptCounts[a.examId] = (examAttemptCounts[a.examId] || 0) + 1;
    });

    const recentExamsWithStats = recentExams.map((exam: any) => {
      const examAttempts = attempts.filter((a: any) => a.examId === exam.id);
      const examAvg =
        examAttempts.length > 0
          ? Math.round(
              (examAttempts.reduce((s, a: any) => s + (a.percentage || 0), 0) / examAttempts.length) * 10
            ) / 10
          : 0;
      const examTop =
        examAttempts.length > 0
          ? Math.max(...examAttempts.map((a: any) => a.percentage || 0))
          : 0;

      return {
        ...exam,
        attemptCount: examAttempts.length,
        avgScore: examAvg,
        topScore: examTop,
      };
    });

    // 6. Top performing students (across all exams)
    const studentScores: Record<string, { name: string; rollNo: string; totalScore: number; count: number }> = {};
    attempts.forEach((a: any) => {
      const key = `${a.rollNo}`;
      if (!studentScores[key]) {
        studentScores[key] = { name: a.studentName, rollNo: a.rollNo, totalScore: 0, count: 0 };
      }
      studentScores[key].totalScore += a.percentage || 0;
      studentScores[key].count += 1;
    });

    const topStudents = Object.values(studentScores)
      .map((s) => ({
        ...s,
        avgScore: Math.round((s.totalScore / s.count) * 10) / 10,
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 10);

    // 7. Count live students (attempts in last 4 hours for live exams)
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
    const activeStudents = attempts.filter(
      (a: any) => a.submittedAt && a.submittedAt > fourHoursAgo
    ).length;

    return NextResponse.json({
      instituteName: instData.name,
      plan: instData.plan,
      maxAttempts: instData.maxAttempts,
      usedAttempts: instData.usedAttempts || 0,
      totalExams,
      totalAttempts,
      liveExamCount: liveExams.length,
      activeStudents,
      avgScore,
      recentExams: recentExamsWithStats,
      topStudents,
      allExams: exams,
    });
  } catch (error: any) {
    console.error("[institute/dashboard-stats] Error:", error);
    return NextResponse.json({ error: "Failed to fetch stats." }, { status: 500 });
  }
}
