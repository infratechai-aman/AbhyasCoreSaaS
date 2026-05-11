import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { isRateLimited } from "@/lib/rate-limit";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { parseBodyWithLimit } from "@/lib/body-limit";

/**
 * POST /api/exam/submit
 * 
 * Server-side exam grading. The client sends their answers + examSessionId.
 * The server retrieves the answer key from Firestore, grades it, stores the result,
 * and returns the scored results with answers and explanations.
 * 
 * This fixes:
 * - Finding #2: Answers no longer exposed before submission
 * - Finding #3: Score validated server-side (no client-side fabrication)
 * - Finding #4: Usage counter incremented atomically in same transaction
 */
export async function POST(request: Request) {
  // 1. Authenticate
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  // 2. Rate limit: 10 submissions per minute
  if (await isRateLimited(`submit:${authResult.uid}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  if (!adminDb) {
    return NextResponse.json({ error: "Server not configured." }, { status: 500 });
  }

  try {
    const body = await parseBodyWithLimit(request, "1mb");
    if (body instanceof NextResponse) return body;
    const { examSessionId, answers, timeTaken } = body;

    // Validate input
    if (!examSessionId || typeof examSessionId !== "string") {
      return NextResponse.json({ error: "Missing exam session ID." }, { status: 400 });
    }
    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ error: "Missing answers." }, { status: 400 });
    }
    if (typeof timeTaken !== "number" || timeTaken < 0) {
      return NextResponse.json({ error: "Invalid time." }, { status: 400 });
    }

    // 3. Fetch the exam session (answer key) from Firestore
    const sessionRef = adminDb.collection("exam_sessions").doc(examSessionId);
    const sessionSnap = await sessionRef.get();

    if (!sessionSnap.exists) {
      return NextResponse.json({ error: "Exam session not found or expired." }, { status: 404 });
    }

    const session = sessionSnap.data()!;

    // Verify the session belongs to this user
    if (session.userId !== authResult.uid) {
      return NextResponse.json({ error: "Unauthorized exam session." }, { status: 403 });
    }

    // Check expiry (4 hours)
    if (new Date() > new Date(session.expiresAt)) {
      return NextResponse.json({ error: "Exam session expired." }, { status: 410 });
    }

    // Check if already submitted
    if (session.submitted) {
      return NextResponse.json({ error: "Exam already submitted." }, { status: 409 });
    }

    // 4. Grade the exam server-side
    const answerKey: Record<string, { answer: string; explanation: string }> = session.answerKey;
    const totalQuestions = session.questionCount || Object.keys(answerKey).length;

    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;

    // Build graded results with answers + explanations (now safe to send)
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

    // JEE/NEET marking scheme: +4 correct, -1 wrong
    const score = correctCount * 4 - wrongCount * 1;
    const maxScore = totalQuestions * 4;
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    // 5. Atomically: mark session as submitted + increment usage counter + save result
    const today = new Date().toISOString().split("T")[0];
    const userRef = adminDb.collection("users").doc(authResult.uid);

    // Use a batch for atomic writes
    const batch = adminDb.batch();

    // Mark session as submitted (prevents double submission)
    batch.update(sessionRef, { submitted: true, submittedAt: new Date().toISOString() });

    // Save the test result
    const resultRef = adminDb.collection("results").doc();
    batch.set(resultRef, {
      userId: authResult.uid,
      examSessionId,
      chapterId: session.chapterId,
      chapterName: session.chapterName,
      subject: session.subject,
      correctCount,
      wrongCount,
      skippedCount,
      totalQuestions,
      score,
      maxScore,
      percentage,
      timeTaken,
      timestamp: FieldValue.serverTimestamp(),
    });

    // Increment daily exam counter atomically (Fix #4: TOCTOU race prevention)
    batch.update(userRef, {
      "usage.examsAttemptedToday": FieldValue.increment(1),
      "usage.lastTrackedDate": today,
      [`usage.completedExamIds`]: FieldValue.arrayUnion(session.chapterId),
    });

    await batch.commit();

    // 6. Return graded results (answers are now safe to reveal)
    return NextResponse.json({
      resultId: resultRef.id,
      chapterName: session.chapterName,
      subject: session.subject,
      totalQuestions,
      correctCount,
      wrongCount,
      skippedCount,
      score,
      maxScore,
      percentage,
      timeTaken,
      gradedQuestions,
    });
  } catch (error: any) {
    console.error("[exam/submit] Error:", error);
    return NextResponse.json({ error: "Failed to submit exam." }, { status: 500 });
  }
}
