import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { adminDb } from "@/lib/firebase-admin";
import { isRateLimited } from "@/lib/rate-limit";
import { parseBodyWithLimit } from "@/lib/body-limit";
import type { ExamSessionTokenPayload } from "@/lib/institute-types";

export const dynamic = "force-dynamic";

const JWT_SECRET = process.env.INSTITUTE_JWT_SECRET || process.env.JWT_SECRET || "abhyas-institute-exam-secret-key";
const IS_PROD = process.env.NODE_ENV === "production";

/**
 * POST /api/institute/verify-exam
 *
 * Public endpoint — students use this to join an exam.
 * Accepts examCode + password + studentName + rollNo.
 * Verifies the password hash, checks exam status, and returns
 * a JWT session token + exam questions (answers stripped).
 */
export async function POST(request: Request) {
  // Rate limit by IP to prevent brute-force password guessing
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  if (await isRateLimited(`inst-verify:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Please wait a minute." }, { status: 429 });
  }

  if (!adminDb) {
    return NextResponse.json({ error: "Server not configured." }, { status: 500 });
  }

  try {
    const body = await parseBodyWithLimit(request, "256kb");
    if (body instanceof NextResponse) return body;

    const { examCode, password, studentName, rollNo } = body;

    // Validate inputs
    if (!examCode || typeof examCode !== "string") {
      return NextResponse.json({ error: "Exam code is required." }, { status: 400 });
    }
    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Password is required." }, { status: 400 });
    }
    if (!studentName || typeof studentName !== "string" || studentName.trim().length < 2) {
      return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
    }
    if (!rollNo || typeof rollNo !== "string" || rollNo.trim().length < 1) {
      return NextResponse.json({ error: "Roll number is required." }, { status: 400 });
    }

    // 1. Look up exam by code
    const examSnap = await adminDb
      .collection("institute_exams")
      .where("examCode", "==", examCode.toUpperCase().trim())
      .limit(1)
      .get();

    if (examSnap.empty) {
      return NextResponse.json({ error: "Invalid exam code. Please check and try again." }, { status: 404 });
    }

    const examDoc = examSnap.docs[0];
    const exam = examDoc.data();
    const examId = examDoc.id;

    // 2. Check exam status
    if (exam.status === "ended") {
      return NextResponse.json({ error: "This exam has already ended." }, { status: 410 });
    }
    if (exam.status === "scheduled") {
      return NextResponse.json({ error: "This exam has not started yet." }, { status: 403 });
    }

    // 3. Verify password with bcrypt
    const passwordMatch = await bcrypt.compare(password, exam.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    // 4. Check retake policy
    if (!exam.allowRetake) {
      const existingAttempt = await adminDb
        .collection("institute_attempts")
        .where("examId", "==", examId)
        .where("rollNo", "==", rollNo.trim())
        .limit(1)
        .get();

      if (!existingAttempt.empty) {
        return NextResponse.json(
          { error: "You have already attempted this exam. Retakes are not allowed." },
          { status: 409 }
        );
      }
    }

    // 5. Fetch exam session (questions + answer key)
    const sessionSnap = await adminDb
      .collection("institute_exam_sessions")
      .where("examId", "==", examId)
      .limit(1)
      .get();

    if (sessionSnap.empty) {
      return NextResponse.json({ error: "Exam data not found." }, { status: 404 });
    }

    const session = sessionSnap.docs[0];
    const sessionData = session.data();

    // 6. Create JWT session token (4 hour expiry)
    const tokenPayload: ExamSessionTokenPayload = {
      examId,
      instituteId: exam.createdBy,
      sessionId: session.id,
      studentName: studentName.trim(),
      rollNo: rollNo.trim(),
    };

    // In production, refuse to issue tokens if using the hardcoded fallback secret
    if (IS_PROD && JWT_SECRET === "abhyas-institute-exam-secret-key") {
      console.error("[institute/verify-exam] CRITICAL: INSTITUTE_JWT_SECRET not set in production!");
      return NextResponse.json({ error: "Server misconfiguration." }, { status: 500 });
    }

    const examSessionToken = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: "4h",
    });

    // 7. Return questions (answers already stripped in session) + token
    return NextResponse.json({
      examSessionToken,
      examTitle: exam.title,
      targetExam: exam.targetExam,
      duration: exam.duration,
      questionCount: sessionData.questionCount,
      questions: sessionData.questions,
    });
  } catch (error: any) {
    console.error("[institute/verify-exam] Error:", error);
    return NextResponse.json({ error: "Failed to verify exam." }, { status: 500 });
  }
}
