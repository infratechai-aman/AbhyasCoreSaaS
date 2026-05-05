import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';

export const dynamic = 'force-dynamic';

function shuffleArray(array: any[]) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Shuffle options and remap the correct answer to the new position
function shuffleOptionsAndAnswer(options: {id: string, text: string}[], answer: string) {
  const shuffled = [...options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const ids = ["A", "B", "C", "D"];
  let newAnswer = answer;
  const reassigned = shuffled.map((opt, idx) => {
    const newId = ids[idx] || opt.id;
    if (opt.id === answer) newAnswer = newId;
    return { id: newId, text: opt.text };
  });
  return { options: reassigned, answer: newAnswer };
}

// Utility to format math symbols
function formatMathText(str: string) {
  if (!str) return "";
  return str
    .replace(/\bphi\b/g, "φ")
    .replace(/\btheta\b/g, "θ")
    .replace(/\balpha\b/g, "α")
    .replace(/\bbeta\b/g, "β")
    .replace(/\bgamma\b/g, "γ")
    .replace(/\blambda\b/g, "λ")
    .replace(/\bmu\b/g, "μ")
    .replace(/\bpi\b/g, "π")
    .replace(/\bomega\b/g, "ω")
    .replace(/\bsigma\b/g, "σ")
    .replace(/\bDelta\b/g, "Δ")
    .replace(/\binfty\b/g, "∞");
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const chaptersParam = searchParams.get('c');
        const countParam = searchParams.get('q') || '30';
        
        if (!chaptersParam) {
            return NextResponse.json({ error: "No chapters provided" }, { status: 400 });
        }

        const chapters = chaptersParam.split(',').filter(Boolean);
        const limit = parseInt(countParam, 10);
        
        const rawDir = path.join(process.cwd(), 'raw_questions');
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "@_"
        });

        let allQuestions: any[] = [];

        for (const chapter of chapters) {
            const filePath = path.join(rawDir, `${chapter}.xml`);
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

                        const mapped = combined.map((q: any) => {
                            const rawOptions = q.option 
                                ? (Array.isArray(q.option) ? q.option : [q.option]) 
                                : [];

                            const formattedOptions = rawOptions.map((opt: any) => {
                                if (typeof opt === "string") return { id: "?", text: formatMathText(opt) };
                                return {
                                    id: String(opt["@_id"] ?? ""),
                                    text: formatMathText(String(opt["#text"] ?? opt ?? ""))
                                };
                            });

                            const originalAnswer = String(q.answer ?? "");
                            const { options: shuffledOpts, answer: newAnswer } = shuffleOptionsAndAnswer(formattedOptions, originalAnswer);

                            return {
                                id: q["@_id"] || Math.random().toString(36).slice(2, 9),
                                text: formatMathText(String(q.text ?? "")),
                                options: shuffledOpts,
                                answer: newAnswer,
                                explanation: formatMathText(String(q.explanation ?? "")),
                                difficulty: q.difficulty || "medium",
                                chapterSource: chapter
                            };
                        });

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
        const finalQuestions = shuffled.slice(0, limit);

        return NextResponse.json({ 
            chapterName: "Custom Drill", 
            subject: "Mixed", 
            questions: finalQuestions,
            totalAvailable: allQuestions.length
        });

    } catch (error) {
         console.error("Custom API error:", error);
         return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
