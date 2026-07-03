import crypto from "crypto";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { XMLParser } from "fast-xml-parser";
import bcrypt from "bcryptjs";
import { requireAuth } from "@/lib/auth-middleware";
import { isRateLimited } from "@/lib/rate-limit";
import { adminDb } from "@/lib/firebase-admin";
import { Syllabus } from "@/lib/syllabus";
import { sanitizeChapterId } from "@/lib/sanitize";
import {
  shuffleArray,
  processQuestion,
  stripAnswersForClient,
} from "@/lib/exam-utils";
import type { CreateExamRequest, InstituteExam } from "@/lib/institute-types";

export const dynamic = "force-dynamic";

/**
 * Generate a unique 8-character alphanumeric exam code
 */
function generateExamCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No I,O,0,1 to avoid confusion
  let code = "";
  const bytes = crypto.randomBytes(8);
  for (let i = 0; i < 8; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

/**
 * POST /api/institute/create-exam
 *
 * Creates a new institute exam, hashes the password, generates questions
 * from XML files, stores the answer key server-side, and returns the exam code + link.
 */
export async function POST(request: Request) {
  // 1. Authenticate
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  // 2. Rate limit: 5 exam creations per minute
  if (await isRateLimited(`inst-create:${authResult.uid}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  if (!adminDb) {
    return NextResponse.json({ error: "Server not configured." }, { status: 500 });
  }

  try {
    // 3. Verify user is an institute owner
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

    // 4. Parse request body
    const body: CreateExamRequest = await request.json();
    const {
      title,
      targetExam,
      examType,
      subjects,
      chapters,
      questionCount,
      difficulty,
      password,
      duration,
      allowRetake,
      resultVisibility,
    } = body;

    // 5. Validate required fields
    if (!title || typeof title !== "string" || title.trim().length < 3) {
      return NextResponse.json({ error: "Exam title must be at least 3 characters." }, { status: 400 });
    }
    if (!["JEE", "NEET"].includes(targetExam)) {
      return NextResponse.json({ error: "Invalid target exam." }, { status: 400 });
    }
    if (!["chapter", "subject", "full"].includes(examType)) {
      return NextResponse.json({ error: "Invalid exam type." }, { status: 400 });
    }
    if (!chapters || !Array.isArray(chapters) || chapters.length === 0) {
      return NextResponse.json({ error: "At least one chapter must be selected." }, { status: 400 });
    }
    if (!questionCount || questionCount < 5 || questionCount > 300) {
      return NextResponse.json({ error: "Question count must be between 5 and 300." }, { status: 400 });
    }
    if (!password || password.length < 4) {
      return NextResponse.json({ error: "Password must be at least 4 characters." }, { status: 400 });
    }
    if (!duration || duration < 5 || duration > 360) {
      return NextResponse.json({ error: "Duration must be between 5 and 360 minutes." }, { status: 400 });
    }

    // 5b. Validate subjects against target exam
    const validSubjects = targetExam === "NEET"
      ? ["Physics", "Chemistry", "Biology"]
      : ["Physics", "Chemistry", "Mathematics"];
    const filteredSubjects = (subjects || []).filter((s: string) => validSubjects.includes(s));
    if (subjects && subjects.length > 0 && filteredSubjects.length === 0) {
      return NextResponse.json(
        { error: `Invalid subjects for ${targetExam}. Valid: ${validSubjects.join(", ")}` },
        { status: 400 }
      );
    }

    // 6. Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    // 7. Generate unique exam code (retry if collision)
    let examCode = generateExamCode();
    let codeExists = true;
    let attempts = 0;
    while (codeExists && attempts < 5) {
      const codeSnap = await adminDb
        .collection("institute_exams")
        .where("examCode", "==", examCode)
        .limit(1)
        .get();
      codeExists = !codeSnap.empty;
      if (codeExists) {
        examCode = generateExamCode();
        attempts++;
      }
    }

    // 8. Pull questions from XML files (reuses existing logic)
    const rawDir = path.join(process.cwd(), "raw_questions");
    const resolvedRawDir = path.resolve(rawDir);
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
    });

    let allQuestions: any[] = [];

    for (const rawChapter of chapters) {
      const chapter = sanitizeChapterId(rawChapter);
      if (!chapter) continue;

      const filePath = path.join(rawDir, `${chapter}.xml`);
      const resolvedPath = path.resolve(filePath);
      if (!resolvedPath.startsWith(resolvedRawDir + path.sep)) continue;

      if (fs.existsSync(filePath)) {
        try {
          const xmlData = fs.readFileSync(filePath, "utf-8");
          const result = parser.parse(xmlData);

          if (result.chapter) {
            const easyQs = result.chapter.easy?.question || [];
            const mediumQs = result.chapter.medium?.question || [];
            const hardQs = result.chapter.hard?.question || [];

            const easyArr = Array.isArray(easyQs) ? easyQs : [easyQs];
            const mediumArr = Array.isArray(mediumQs) ? mediumQs : [mediumQs];
            const hardArr = Array.isArray(hardQs) ? hardQs : [hardQs];

            let combined: any[];
            // Filter by difficulty if not "mixed"
            if (difficulty === "easy") {
              combined = easyArr.map((q: any) => ({ ...q, difficulty: "easy" }));
            } else if (difficulty === "hard") {
              combined = hardArr.map((q: any) => ({ ...q, difficulty: "hard" }));
            } else if (difficulty === "medium") {
              combined = mediumArr.map((q: any) => ({ ...q, difficulty: "medium" }));
            } else {
              // "mixed" — combine all
              combined = [
                ...easyArr.map((q: any) => ({ ...q, difficulty: "easy" })),
                ...mediumArr.map((q: any) => ({ ...q, difficulty: "medium" })),
                ...hardArr.map((q: any) => ({ ...q, difficulty: "hard" })),
              ];
            }

            const filtered = combined.filter((q: any) => q && q.text);
            const mapped = filtered
              .map((q: any, i: number) => {
                const processed = processQuestion(q, i, q.difficulty);
                if (processed) {
                  processed.chapterSource = chapter;
                  // Infer subject from syllabus
                  let matchedSubject = "Physics";
                  Object.values(Syllabus).forEach((classData) => {
                    Object.entries(classData).forEach(([subject, chaps]) => {
                      if (chaps.some((c: any) => c.file === chapter + ".xml" || c.file === chapter)) {
                        matchedSubject = subject;
                      }
                    });
                  });
                  processed.inferredSubject = matchedSubject;
                }
                return processed;
              })
              .filter(Boolean);

            allQuestions = allQuestions.concat(mapped);
          }
        } catch (e) {
          console.error(`[institute/create-exam] Error parsing ${chapter}.xml:`, e);
        }
      }
    }

    if (allQuestions.length === 0) {
      return NextResponse.json(
        { error: "No questions found for the selected chapters and difficulty." },
        { status: 404 }
      );
    }

    // 9. Sample random questions up to the requested count
    const shuffled = shuffleArray(allQuestions);
    const finalQuestions = shuffled.slice(0, Math.min(questionCount, shuffled.length));

    // Assign stable IDs
    const questionsWithIds = finalQuestions.map((q: any, i: number) => ({
      ...q,
      id: q.id || `q${i + 1}`,
    }));

    // 10. Build answer key
    const answerKey: Record<string, { answer: string; explanation: string }> = {};
    questionsWithIds.forEach((q: any) => {
      answerKey[q.id] = { answer: q.answer, explanation: q.explanation };
    });

    // 11. Store everything in Firestore
    const examId = crypto.randomUUID();
    const sessionId = crypto.randomUUID();
    const now = new Date().toISOString();

    const batch = adminDb.batch();

    // Store exam document
    const examDoc: Omit<InstituteExam, never> = {
      title: title.trim(),
      targetExam,
      examType,
      subjects: subjects || [],
      chapters,
      questionCount: questionsWithIds.length,
      difficulty,
      passwordHash,
      duration,
      allowRetake: allowRetake ?? false,
      resultVisibility: resultVisibility || "immediate",
      createdBy: instituteId,
      ownerUid: authResult.uid,
      createdAt: now,
      status: "live", // Default to live on creation
      examCode,
    };

    batch.set(adminDb.collection("institute_exams").doc(examId), examDoc);

    // Store answer key + questions server-side
    const clientQuestions = stripAnswersForClient(questionsWithIds);
    batch.set(adminDb.collection("institute_exam_sessions").doc(sessionId), {
      examId,
      instituteId,
      answerKey,
      questionCount: questionsWithIds.length,
      questions: clientQuestions,
      createdAt: now,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    });

    await batch.commit();

    // 12. Return exam code and link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://abhyascore.com";
    const joinLink = `${baseUrl}/exam/join/${examCode}`;

    return NextResponse.json({
      examId,
      examCode,
      joinLink,
      questionCount: questionsWithIds.length,
      title: title.trim(),
      password, // Return plaintext for teacher to share (only on creation)
    });
  } catch (error: any) {
    console.error("[institute/create-exam] Error:", error);
    return NextResponse.json({ error: "Failed to create exam." }, { status: 500 });
  }
}
