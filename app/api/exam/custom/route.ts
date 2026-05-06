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
    .replace(/(^|\b|\d)phi(\b|$)/g, "$1φ$2")
    .replace(/(^|\b|\d)theta(\b|$)/g, "$1θ$2")
    .replace(/(^|\b|\d)alpha(\b|$)/g, "$1α$2")
    .replace(/(^|\b|\d)beta(\b|$)/g, "$1β$2")
    .replace(/(^|\b|\d)gamma(\b|$)/g, "$1γ$2")
    .replace(/(^|\b|\d)lambda(\b|$)/g, "$1λ$2")
    .replace(/(^|\b|\d)mu(\b|$)/g, "$1μ$2")
    .replace(/(^|\b|\d)pi(\b|$)/g, "$1π$2")
    .replace(/(^|\b|\d)omega(\b|$)/g, "$1ω$2")
    .replace(/(^|\b|\d)sigma(\b|$)/g, "$1σ$2")
    .replace(/(^|\b|\d)Delta(\b|$)/g, "$1Δ$2")
    .replace(/(^|\b|\d)infty(\b|$)/g, "$1∞$2")
    .replace(/\*/g, "·");
}

function sanitizeOptionText(str: string) {
  let cleaned = formatMathText(str).trim();
  cleaned = cleaned.replace(/^(Option\s*)?[A-Da-d][\.\)\:\-]\s*/i, "");
  const lower = cleaned.toLowerCase();
  if (
    cleaned.length === 0 || 
    /^[A-D]$/i.test(cleaned) || 
    lower === "none" || 
    lower === "phi" || 
    cleaned === "φ" ||
    lower === "null" ||
    lower === "undefined" ||
    lower === "n/a"
  ) {
    return "None of the above";
  }
  return cleaned;
}

function padOptionsToFour(options: {id: string, text: string}[]) {
  const ids = ["A", "B", "C", "D"];
  const fillers = ["None of the above", "All of the above", "Cannot be determined", "Not applicable"];
  while (options.length < 4) {
    const nextId = ids[options.length];
    const existingTexts = options.map(o => o.text.toLowerCase());
    let fillerText = fillers.find(f => !existingTexts.includes(f.toLowerCase())) || "None of the above";
    options.push({ id: nextId, text: fillerText });
  }
  return options;
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

                            let formattedOptions = rawOptions.map((opt: any) => {
                                if (typeof opt === "string") return { id: "?", text: sanitizeOptionText(opt) };
                                return {
                                    id: String(opt["@_id"] ?? ""),
                                    text: sanitizeOptionText(String(opt["#text"] ?? opt ?? ""))
                                };
                            });

                            formattedOptions = padOptionsToFour(formattedOptions);
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
