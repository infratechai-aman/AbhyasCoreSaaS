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
 * recent exams, top students, score distribution, and subject performance.
 */
export async function GET(request: Request) {
  const isDemo = new URL(request.url).searchParams.get("demo") === "true";
  
  if (isDemo) {
    return NextResponse.json({
      instituteName: "Demo Institute",
      plan: "coaching",
      maxAttempts: 5000,
      usedAttempts: 1250,
      totalExams: 42,
      totalAttempts: 3248,
      liveExamCount: 2,
      activeStudents: 96,
      avgScore: 64.8,
      scoreDistribution: [
        { label: "80% and above", value: 390, color: "#10b981" },
        { label: "60% - 80%", value: 909, color: "#4f46e5" },
        { label: "40% - 60%", value: 1104, color: "#f59e0b" },
        { label: "Below 40%", value: 845, color: "#ef4444" },
      ],
      subjectPerformance: [
        { name: "Physics", accuracy: 62, attempts: 1200 },
        { name: "Chemistry", accuracy: 58, attempts: 1100 },
        { name: "Mathematics", accuracy: 71, attempts: 948 },
      ],
      recentExams: [
        { id: "1", title: "JEE Main Full Mock Test - 04", targetExam: "JEE", examType: "full", status: "ended", createdAt: new Date().toISOString(), duration: 180, questionCount: 90, attemptCount: 256, avgScore: 63.2, topScore: 98.5, examCode: "DEMO0001" },
        { id: "2", title: "NEET 2026 Full Mock Test - 03", targetExam: "NEET", examType: "full", status: "ended", createdAt: new Date(Date.now() - 86400000).toISOString(), duration: 200, questionCount: 90, attemptCount: 180, avgScore: 65.7, topScore: 97.0, examCode: "DEMO0002" },
        { id: "3", title: "JEE Advanced Sectional - Physics", targetExam: "JEE", examType: "chapter", status: "ended", createdAt: new Date(Date.now() - 172800000).toISOString(), duration: 60, questionCount: 30, attemptCount: 120, avgScore: 59.1, topScore: 94.0, examCode: "DEMO0003" },
      ],
      allExams: [
        { id: "1", title: "JEE Main Full Mock Test - 04", targetExam: "JEE", examType: "full", status: "ended", createdAt: new Date().toISOString(), duration: 180, questionCount: 90, attemptCount: 256, avgScore: 63.2, topScore: 98.5, examCode: "DEMO0001" },
        { id: "2", title: "NEET 2026 Full Mock Test - 03", targetExam: "NEET", examType: "full", status: "ended", createdAt: new Date(Date.now() - 86400000).toISOString(), duration: 200, questionCount: 90, attemptCount: 180, avgScore: 65.7, topScore: 97.0, examCode: "DEMO0002" },
      ],
      topStudents: [
        { name: "Aman Verma", rollNo: "101", avgScore: 98.5, count: 5 },
        { name: "Rohan Gupta", rollNo: "102", avgScore: 97.0, count: 4 },
        { name: "Ishita Sharma", rollNo: "103", avgScore: 96.2, count: 5 },
        { name: "Aditya Singh", rollNo: "104", avgScore: 95.1, count: 3 },
        { name: "Nandini Patel", rollNo: "105", avgScore: 94.3, count: 5 },
      ]
    });
  }

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
      .get();

    const exams = examsSnap.docs.map((doc) => {
      const { passwordHash, ...safeData } = doc.data() as any;
      return { id: doc.id, ...safeData };
    }).sort((a: any, b: any) => (b.createdAt || "").localeCompare(a.createdAt || ""));

    const totalExams = exams.length;
    const liveExams = exams.filter((e: any) => e.status === "live");

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

    // 5. Compute per-exam stats for ALL exams (not just recent)
    const allExamsWithStats = exams.map((exam: any) => {
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

    const recentExamsWithStats = allExamsWithStats.slice(0, 5);

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

    // 7. Active students = unique roll numbers across all attempts
    const uniqueRollNos = new Set(attempts.map((a: any) => a.rollNo).filter(Boolean));
    const activeStudents = uniqueRollNos.size;

    // 8. Score distribution — bucket attempts by percentage
    let above80 = 0, between60and80 = 0, between40and60 = 0, below40 = 0;
    attempts.forEach((a: any) => {
      const pct = a.percentage || 0;
      if (pct >= 80) above80++;
      else if (pct >= 60) between60and80++;
      else if (pct >= 40) between40and60++;
      else below40++;
    });

    const scoreDistribution = [
      { label: "80% and above", value: above80, color: "#10b981" },
      { label: "60% - 80%", value: between60and80, color: "#4f46e5" },
      { label: "40% - 60%", value: between40and60, color: "#f59e0b" },
      { label: "Below 40%", value: below40, color: "#ef4444" },
    ];

    // 9. Subject-wise performance — aggregate from exam subjects + attempt scores
    // Group exams by subject, then compute average score per subject
    const subjectStats: Record<string, { totalScore: number; count: number }> = {};
    
    for (const exam of exams as any[]) {
      const examSubjects: string[] = exam.subjects || [];
      const examAttempts = attempts.filter((a: any) => a.examId === exam.id);
      
      if (examAttempts.length === 0 || examSubjects.length === 0) continue;
      
      // Distribute attempt scores across the exam's subjects
      for (const subject of examSubjects) {
        if (!subjectStats[subject]) {
          subjectStats[subject] = { totalScore: 0, count: 0 };
        }
        examAttempts.forEach((a: any) => {
          subjectStats[subject].totalScore += a.percentage || 0;
          subjectStats[subject].count += 1;
        });
      }
    }

    const subjectPerformance = Object.entries(subjectStats)
      .map(([name, stats]) => ({
        name,
        accuracy: stats.count > 0 ? Math.round(stats.totalScore / stats.count) : 0,
        attempts: stats.count,
      }))
      .sort((a, b) => b.attempts - a.attempts);

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
      scoreDistribution,
      subjectPerformance,
      recentExams: recentExamsWithStats,
      topStudents,
      allExams: allExamsWithStats,
    });
  } catch (error: any) {
    console.error("[institute/dashboard-stats] Error:", error);
    return NextResponse.json({ error: "Failed to fetch stats." }, { status: 500 });
  }
}
