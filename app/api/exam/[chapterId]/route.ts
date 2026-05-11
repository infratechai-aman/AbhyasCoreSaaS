import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";
import fs from "fs/promises";
import path from "path";
import { requireAuth } from "@/lib/auth-middleware";
import { isRateLimited } from "@/lib/rate-limit";
import { checkExamAccess } from "@/lib/subscription-middleware";
import { sanitizeChapterId } from "@/lib/sanitize";
import {
  shuffleArray,
  shuffleOptionsAndAnswer,
  sampleQuestions,
  formatMathText,
  sanitizeOptionText,
  padOptionsToFour,
  processQuestion,
  stripAnswersForClient,
  formatRawOptions,
} from "@/lib/exam-utils";



export async function GET(req: NextRequest, { params }: { params: { chapterId: string } }) {
  try {
    // Auth check
    const authResult = await requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    // Rate limit: 30 per minute per user
    if (await isRateLimited(`exam:${authResult.uid}`, 30, 60_000)) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    // Server-side subscription enforcement
    const subCheck = await checkExamAccess(authResult);
    if (subCheck instanceof NextResponse) return subCheck;

    // Sanitize chapterId to prevent path traversal (CRITICAL-17)
    const chapterId = sanitizeChapterId(params.chapterId);
    if (!chapterId) {
      return NextResponse.json({ error: "Invalid chapter ID." }, { status: 400 });
    }

    const rawDir = path.join(process.cwd(), "raw_questions");
    const filePath = path.join(rawDir, `${chapterId}.xml`);

    // Defense in depth: verify resolved path is within raw_questions
    const resolved = path.resolve(filePath);
    if (!resolved.startsWith(path.resolve(rawDir) + path.sep)) {
      return NextResponse.json({ error: "Invalid chapter ID." }, { status: 400 });
    }
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (e) {
      return NextResponse.json({ error: "Chapter data not found." }, { status: 404 });
    }

    const xmlData = await fs.readFile(filePath, "utf-8");
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_"
    });
    const result = parser.parse(xmlData);

    if (!result.chapter) {
      return NextResponse.json({ error: "Invalid XML structure." }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const examParam = searchParams.get("exam")?.toUpperCase() || "JEE";

    const easy = result.chapter.easy?.question || [];
    const medium = result.chapter.medium?.question || [];
    const hard = result.chapter.hard?.question || [];

    let countEasy = 10, countMed = 10, countHard = 10;
    if (examParam === "NEET") {
      countEasy = 15; countMed = 15; countHard = 15;
    } else if (examParam === "JEE") {
      countEasy = 8; countMed = 8; countHard = 9;
    }

    const sampledEasy = sampleQuestions(easy, countEasy).map(q => ({ ...q, difficulty: 'easy' }));
    const sampledMedium = sampleQuestions(medium, countMed).map(q => ({ ...q, difficulty: 'medium' }));
    const sampledHard = sampleQuestions(hard, countHard).map(q => ({ ...q, difficulty: 'hard' }));

    let drillQuestions = [...sampledEasy, ...sampledMedium, ...sampledHard];
    
    // Process questions and format options cleanly
    drillQuestions = drillQuestions
      .map((q: any, i: number) => processQuestion(q, i, q.difficulty))
      .filter(Boolean);

    // ── SECURITY: Store answer key server-side, send only questions to client ──
    const { adminDb } = await import("@/lib/firebase-admin");
    const examSessionId = crypto.randomUUID();

    // Build answer key map (server-side only)
    const answerKey: Record<string, { answer: string; explanation: string }> = {};
    drillQuestions.forEach((q: any) => {
      answerKey[q.id] = { answer: q.answer, explanation: q.explanation };
    });

    // Store answer key in Firestore (readable only by Admin SDK)
    if (adminDb) {
      await adminDb.collection("exam_sessions").doc(examSessionId).set({
        userId: authResult.uid,
        chapterId,
        chapterName: result.chapter["@_name"] || "Practice Drill",
        subject: result.chapter["@_subject"] || "Unknown",
        answerKey,
        questionCount: drillQuestions.length,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours
      });
    }

    // Strip answers and explanations from client response
    const clientQuestions = stripAnswersForClient(drillQuestions);

    return NextResponse.json({
      examSessionId,
      chapterName: result.chapter["@_name"] || "Practice Drill",
      subject: result.chapter["@_subject"] || "Unknown",
      questions: clientQuestions
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to generate drill." }, { status: 500 });
  }
}
