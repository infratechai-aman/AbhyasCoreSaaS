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
                    const parsedQuestions = result?.questions?.question || [];
                    const qArray = Array.isArray(parsedQuestions) ? parsedQuestions : [parsedQuestions];
                    
                    const mapped = qArray.map((q: any) => ({
                        id: q["@_id"],
                        text: q.text,
                        options: [
                            { id: "A", text: q.option_a },
                            { id: "B", text: q.option_b },
                            { id: "C", text: q.option_c },
                            { id: "D", text: q.option_d }
                        ],
                        answer: q.answer,
                        explanation: q.explanation,
                        difficulty: q.difficulty || "medium",
                        chapterSource: chapter
                    }));

                    allQuestions = allQuestions.concat(mapped);
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
