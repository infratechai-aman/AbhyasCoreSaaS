import crypto from 'crypto';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';
import { requireAuth } from '@/lib/auth-middleware';
import { isRateLimited } from '@/lib/rate-limit';
import { getUserSubscription } from '@/lib/subscription-middleware';
import { Syllabus } from '@/lib/syllabus';
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
        const limit = Math.min(parseInt(countParam, 10), 300); // Cap at 300 to allow full NEET papers

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

        // --- EQUAL DISTRIBUTION BY SUBJECT LOGIC ---
        function getSubjectForChapter(chapterFile: string, questionObj: any = {}) {
          // If the XML has an explicit <subject> tag (added by our cleanup script)
          if (questionObj.subject) {
             return questionObj.subject;
          }

          let matchedSubject = "Physics"; // fallback
          let found = false;
          
          Object.values(Syllabus).forEach((classData) => {
            Object.entries(classData).forEach(([subject, chapters]) => {
              if (chapters.some((c: any) => c.file === chapterFile + ".xml" || c.file === chapterFile)) {
                matchedSubject = subject;
                found = true;
              }
            });
          });
          
          // NEET specialization
          if (matchedSubject === "Biology") {
            return "Biology"; // No longer split into Botany/Zoology per previous fix
          }
          if (!found) return "Mixed";
          return matchedSubject;
        }

        const questionsBySubject: Record<string, any[]> = {};
        for (const q of allQuestions) {
           const subject = getSubjectForChapter(q.chapterSource, q);
           if (!questionsBySubject[subject]) questionsBySubject[subject] = [];
           // Attach the classified subject so the frontend can use it!
           q.inferredSubject = subject;
           questionsBySubject[subject].push(q);
        }

        const subjects = Object.keys(questionsBySubject).sort((a,b) => {
            const order = ["Physics", "Chemistry", "Botany", "Zoology", "Biology", "Mathematics"];
            return order.indexOf(a) - order.indexOf(b);
        });

        const isPyq = chapters.length === 1 && (chapters[0].startsWith("jee_") || chapters[0].startsWith("neet_"));
        const finalQuestionsArray: any[] = [];
        
        if (isPyq) {
            // For PYQs, do not apply quotas. Just sort them by subject and push them all.
            subjects.forEach(subject => {
                finalQuestionsArray.push(...questionsBySubject[subject]);
            });
            // Cap at the requested limit just in case
            if (finalQuestionsArray.length > limit) {
                finalQuestionsArray.length = limit;
            }
        } else {
            // 1. Determine strict quota based on weight
            const totalWeight = subjects.reduce((sum, s) => sum + (s === "Biology" ? 2 : 1), 0);
            const baseUnit = Math.floor(limit / totalWeight);
            let remainder = limit % totalWeight;
    
            const quotas: Record<string, number> = {};
            
            // Assign weighted quota
            subjects.forEach((s) => {
                let weight = s === "Biology" ? 2 : 1;
                let target = baseUnit * weight;
                
                // Distribute remainder one by one
                while (remainder > 0 && weight > 0) {
                   target += 1;
                   remainder -= 1;
                   weight -= 1;
                }
                
                // Cap at available questions
                quotas[s] = Math.min(target, questionsBySubject[s].length);
            });
    
            subjects.forEach(subject => {
                const shuffled = shuffleArray(questionsBySubject[subject]);
                finalQuestionsArray.push(...shuffled.slice(0, quotas[subject]));
            });
        }

        const finalQuestions = finalQuestionsArray.map((q: any, i: number) => ({
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

          // Store exam session 
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
            isCustom: true,
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
