import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { adminDb } from "@/lib/firebase-admin";
import { isRateLimited } from "@/lib/rate-limit";
import { parseBodyWithLimit } from "@/lib/body-limit";
import { FieldValue } from "firebase-admin/firestore";
import type { ExamSessionTokenPayload } from "@/lib/institute-types";

export const dynamic = "force-dynamic";

const JWT_SECRET = process.env.INSTITUTE_JWT_SECRET || process.env.JWT_SECRET || (() => {
  const fbKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (fbKey) return "abhyas-inst-" + fbKey.slice(0, 32);
  return "abhyas-institute-exam-secret-key";
})();

/**
 * POST /api/institute/submit-attempt
 *
 * Grades an institute exam attempt. Accepts a JWT exam session token + answers.
 * Verifies the token, grades against the server-side answer key (same +4/−1 marking),
 * and saves the attempt to institute_attempts.
 */
export async function POST(request: Request) {
  // Rate limit by IP
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  if (await isRateLimited(`inst-submit:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  if (!adminDb) {
    return NextResponse.json({ error: "Server not configured." }, { status: 500 });
  }

  try {
    const body = await parseBodyWithLimit(request, "1mb");
    if (body instanceof NextResponse) return body;

    const { examSessionToken, answers, timeTaken } = body;

    // 1. Validate inputs
    if (!examSessionToken || typeof examSessionToken !== "string") {
      return NextResponse.json({ error: "Missing exam session token." }, { status: 400 });
    }
    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ error: "Missing answers." }, { status: 400 });
    }
    if (typeof timeTaken !== "number" || timeTaken < 0) {
      return NextResponse.json({ error: "Invalid time." }, { status: 400 });
    }

    // 2. Verify JWT token
    let decoded: ExamSessionTokenPayload;
    try {
      decoded = jwt.verify(examSessionToken, JWT_SECRET) as ExamSessionTokenPayload;
    } catch (jwtErr: any) {
      if (jwtErr.name === "TokenExpiredError") {
        return NextResponse.json({ error: "Exam session expired." }, { status: 410 });
      }
      return NextResponse.json({ error: "Invalid session token." }, { status: 401 });
    }

    const { examId, instituteId, sessionId, studentName, rollNo } = decoded;

    // 3. Fetch answer key from institute_exam_sessions
    const sessionSnap = await adminDb.collection("institute_exam_sessions").doc(sessionId).get();
    if (!sessionSnap.exists) {
      return NextResponse.json({ error: "Exam session not found." }, { status: 404 });
    }

    const sessionData = sessionSnap.data()!;
    const answerKey: Record<string, { answer: string; explanation: string }> = sessionData.answerKey;

    // Fetch exam to check retake policy and status
    const examSnap = await adminDb.collection("institute_exams").doc(examId).get();
    if (!examSnap.exists) {
      return NextResponse.json({ error: "Exam not found." }, { status: 404 });
    }

    const examData = examSnap.data()!;

    // Check if exam has ended — reject late submissions
    if (examData.status === "ended") {
      return NextResponse.json({ error: "This exam has ended. Submissions are no longer accepted." }, { status: 410 });
    }

    // 4. Check if already submitted (prevent double submission)
    const existingAttempt = await adminDb
      .collection("institute_attempts")
      .where("examId", "==", examId)
      .where("rollNo", "==", rollNo)
      .where("studentName", "==", studentName)
      .limit(1)
      .get();

    if (!examData.allowRetake && !existingAttempt.empty) {
      return NextResponse.json({ error: "You have already submitted this exam." }, { status: 409 });
    }

    // 5. Grade the exam (same +4/−1 marking as existing exam/submit)
    const totalQuestions = sessionData.questionCount || Object.keys(answerKey).length;
    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;

    const gradedQuestions: Array<{
      id: string;
      userAnswer: string | null;
      correctAnswer: string;
      explanation: string;
      isCorrect: boolean;
    }> = [];

    for (const qId of Object.keys(answerKey)) {
      const userAnswer = answers[qId] || null;
      const correct = answerKey[qId].answer;
      const isCorrect = userAnswer === correct;

      if (!userAnswer) {
        skippedCount++;
      } else if (isCorrect) {
        correctCount++;
      } else {
        wrongCount++;
      }

      gradedQuestions.push({
        id: qId,
        userAnswer,
        correctAnswer: correct,
        explanation: answerKey[qId].explanation,
        isCorrect,
      });
    }

    const score = correctCount * 4 - wrongCount * 1;
    const maxScore = totalQuestions * 4;
    const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    // 6. Save attempt to Firestore
    const attemptRef = adminDb.collection("institute_attempts").doc();
    const now = new Date().toISOString();

    const batch = adminDb.batch();

    batch.set(attemptRef, {
      examId,
      instituteId,
      studentName,
      rollNo,
      answers,
      score,
      maxScore,
      percentage,
      correct: correctCount,
      wrong: wrongCount,
      skipped: skippedCount,
      timeTaken,
      submittedAt: now,
    });

    // Increment used attempts on institute doc
    const instSnap = await adminDb.collection("institutes").doc(instituteId).get();
    if (instSnap.exists) {
      batch.update(adminDb.collection("institutes").doc(instituteId), {
        usedAttempts: FieldValue.increment(1),
      });
    }

    await batch.commit();

    // 7. Check result visibility
    let showResults = true;
    if (examSnap.exists) {
      const examData = examSnap.data()!;
      if (examData.resultVisibility === "after_exam_ends" && examData.status !== "ended") {
        showResults = false;
      } else if (examData.resultVisibility === "manual") {
        showResults = false;
      }
    }

    // 8. Return graded results
    return NextResponse.json({
      attemptId: attemptRef.id,
      studentName,
      rollNo,
      totalQuestions,
      correctCount,
      wrongCount,
      skippedCount,
      score,
      maxScore,
      percentage,
      timeTaken,
      ...(showResults ? { gradedQuestions } : {}),
      resultAvailable: showResults,
    });
  } catch (error: any) {
    console.error("[institute/submit-attempt] Error:", error);
    return NextResponse.json({ error: "Failed to submit exam." }, { status: 500 });
  }
}
