import crypto from 'crypto';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';
import { requireAuth } from '@/lib/auth-middleware';
import { isRateLimited } from '@/lib/rate-limit';
import { getUserSubscription } from '@/lib/subscription-middleware';
import { sanitizeChapterId } from '@/lib/sanitize';
import {
  shuffleArray,
  shuffleOptionsAndAnswer,
  formatMathText,
  sanitizeOptionText,
  padOptionsToFour,
  processQuestion,
  stripAnswersForClient,
} from "@/lib/exam-utils";

export const dynamic = 'force-dynamic';



export async function GET(request: Request) {
    try {
        // Auth check
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) return authResult;

        // Rate limit
        if (await isRateLimited(`exam:${authResult.uid}`, 30, 60_000)) {
          return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
        }

        const { searchParams } = new URL(request.url);
        const chaptersParam = searchParams.get('c');
        const countParam = searchParams.get('q') || '30';
        
        if (!chaptersParam) {
            return NextResponse.json({ error: "No chapters provided" }, { status: 400 });
        }

        const chapters = chaptersParam.split(',').filter(Boolean);
        const limit = Math.min(parseInt(countParam, 10), 100); // Cap at 100

        // Server-side subscription enforcement
        const subInfo = await getUserSubscription(authResult);
        if (!subInfo) {
          return NextResponse.json({ error: 'Server error checking subscription.' }, { status: 500 });
        }
        // Free users: enforce weekly custom exam limit
        if (!subInfo.isPro && subInfo.usage.customExamsCreatedWeek >= subInfo.limits.customExamsPerWeek) {
          return NextResponse.json({ error: 'Weekly custom exam limit reached. Upgrade to Pro for more.' , limitReached: true }, { status: 403 });
        }
        // Pro users: enforce daily custom exam limit
        if (subInfo.isPro && subInfo.usage.customExamsCreatedToday >= subInfo.limits.customExamsPerDay) {
          return NextResponse.json({ error: 'Daily custom exam limit reached.' , limitReached: true }, { status: 403 });
        }
        
        const rawDir = path.join(process.cwd(), 'raw_questions');
        const resolvedRawDir = path.resolve(rawDir);
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "@_"
        });

        let allQuestions: any[] = [];

        for (const rawChapter of chapters) {
            // Sanitize each chapter ID to prevent path traversal (CRITICAL-17)
            const chapter = sanitizeChapterId(rawChapter);
            if (!chapter) continue;

            const filePath = path.join(rawDir, `${chapter}.xml`);

            // Defense in depth: verify resolved path is within raw_questions
            const resolvedPath = path.resolve(filePath);
            if (!resolvedPath.startsWith(resolvedRawDir + path.sep)) continue;

            if (fs.existsSync(filePath)) {
                try {
                    const xmlData = fs.readFileSync(filePath, 'utf-8');
                    const result = parser.parse(xmlData);
                    
                    if (result.chapter) {
                        const easyQs = result.chapter.easy?.question || [];
                        const mediumQs = result.chapter.medium?.question || [];
                        const hardQs = result.chapter.hard?.question || [];
                        
                        const easyArr = Array.isArray(easyQs) ? easyQs : [easyQs];
                        const mediumArr = Array.isArray(mediumQs) ? mediumQs : [mediumQs];
                        const hardArr = Array.isArray(hardQs) ? hardQs : [hardQs];
                        
                        // Combine handling difficulty tags
                        const combined = [
                            ...easyArr.map((q: any) => ({ ...q, difficulty: 'easy' })),
                            ...mediumArr.map((q: any) => ({ ...q, difficulty: 'medium' })),
                            ...hardArr.map((q: any) => ({ ...q, difficulty: 'hard' }))
                        ].filter((q: any) => q && q.text); // filter out empty

                        const mapped = combined
                            .map((q: any, i: number) => {
                                const processed = processQuestion(q, i, q.difficulty);
                                if (processed) {
                                    processed.chapterSource = chapter;
                                }
                                return processed;
                            })
                            .filter(Boolean);

                        allQuestions = allQuestions.concat(mapped);
                    }
                } catch (e) {
                    console.error(`Error parsing ${chapter}.xml:`, e);
                }
            }
        }

        if (allQuestions.length === 0) {
            return NextResponse.json({ error: "No valid questions found for the selected chapters" }, { status: 404 });
        }

        // Shuffle and slice
        const shuffled = shuffleArray(allQuestions);
        const finalQuestions = shuffled.slice(0, limit).map((q: any, i: number) => ({
          ...q,
          id: q.id || `q${i + 1}`,
        }));

        // ── SECURITY: Store answer key server-side, strip from client response ──
        const { adminDb } = await import("@/lib/firebase-admin");
        const examSessionId = crypto.randomUUID();

        const answerKey: Record<string, { answer: string; explanation: string }> = {};
        finalQuestions.forEach((q: any) => {
          answerKey[q.id] = { answer: q.answer, explanation: q.explanation };
        });

        if (adminDb) {
          const { FieldValue } = await import("firebase-admin/firestore");
          const today = new Date().toISOString().split("T")[0];
          const currentWeek = (() => {
            const now = new Date();
            const oneJan = new Date(now.getFullYear(), 0, 1);
            const days = Math.floor((now.getTime() - oneJan.getTime()) / 86_400_000);
            const weekNumber = Math.ceil((days + oneJan.getDay() + 1) / 7);
            return `${now.getFullYear()}-W${weekNumber.toString().padStart(2, "0")}`;
          })();

          // Store exam session + increment usage counter atomically
          const batch = adminDb.batch();

          batch.set(adminDb.collection("exam_sessions").doc(examSessionId), {
            userId: authResult.uid,
            chapterId: "custom",
            chapterName: "Custom Drill",
            subject: "Mixed",
            answerKey,
            questionCount: finalQuestions.length,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
          });

          // HIGH-04 FIX: Atomically increment custom exam usage counters
          batch.update(adminDb.collection("users").doc(authResult.uid), {
            "usage.customExamsCreatedToday": FieldValue.increment(1),
            "usage.customExamsCreatedWeek": FieldValue.increment(1),
            "usage.lastTrackedDate": today,
            "usage.lastTrackedWeek": currentWeek,
          });

          await batch.commit();
        }

        const clientQuestions = stripAnswersForClient(finalQuestions);

        return NextResponse.json({ 
            examSessionId,
            chapterName: "Custom Drill", 
            subject: "Mixed", 
            questions: clientQuestions,
            totalAvailable: allQuestions.length
        });

    } catch (error) {
         console.error("Custom API error:", error);
         return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
