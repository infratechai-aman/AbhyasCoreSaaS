import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { XMLParser } from "fast-xml-parser";
import { requireAuth } from "@/lib/auth-middleware";
import { isRateLimited } from "@/lib/rate-limit";
import { adminDb } from "@/lib/firebase-admin";
import { Syllabus } from "@/lib/syllabus";
import { sanitizeChapterId } from "@/lib/sanitize";
import { shuffleArray, processQuestion, distributeQuestionsBySubject } from "@/lib/exam-utils";

export const dynamic = "force-dynamic";

/**
 * POST /api/institute/preview-questions
 *
 * Generates a preview of questions based on selected chapters, difficulty,
 * and question count. Does NOT save anything to Firestore.
 * Used by the exam builder's Review step (Step 4).
 */
export async function POST(request: Request) {
  // 1. Authenticate
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  // 2. Rate limit
  if (await isRateLimited(`inst-preview:${authResult.uid}`, 10, 60_000)) {
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

    // 4. Parse request body
    const body = await request.json();
    const { chapters, difficulty, questionCount, targetExam } = body;

    if (!chapters || !Array.isArray(chapters) || chapters.length === 0) {
      return NextResponse.json({ error: "No chapters selected." }, { status: 400 });
    }

    const count = questionCount || 30;

    // 5. Pull questions from XML files (same logic as create-exam)
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
            if (difficulty === "easy") {
              combined = easyArr.map((q: any) => ({ ...q, difficulty: "easy" }));
            } else if (difficulty === "hard") {
              combined = hardArr.map((q: any) => ({ ...q, difficulty: "hard" }));
            } else if (difficulty === "medium") {
              combined = mediumArr.map((q: any) => ({ ...q, difficulty: "medium" }));
            } else {
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
          console.error(`[institute/preview-questions] Error parsing ${chapter}.xml:`, e);
        }
      }
    }

    if (allQuestions.length === 0) {
      return NextResponse.json(
        { error: "No questions found for the selected chapters and difficulty." },
        { status: 404 }
      );
    }

    // 6. Distribute questions equally across subjects and return preview
    const previewQuestions = distributeQuestionsBySubject(allQuestions, count, targetExam);

    const questionsWithIds = previewQuestions.map((q: any, i: number) => ({
      id: q.id || `q${i + 1}`,
      text: q.text,
      options: q.options,
      answer: q.answer,
      explanation: q.explanation,
      difficulty: q.difficulty,
      chapterSource: q.chapterSource,
      inferredSubject: q.inferredSubject,
    }));

    return NextResponse.json({
      questions: questionsWithIds,
      totalAvailable: allQuestions.length,
      selected: questionsWithIds.length,
    });
  } catch (error: any) {
    console.error("[institute/preview-questions] Error:", error);
    return NextResponse.json({ error: "Failed to generate preview." }, { status: 500 });
  }
}
