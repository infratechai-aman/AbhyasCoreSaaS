import { NextRequest, NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";
import fs from "fs/promises";
import path from "path";

// Utility to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Utility to sample randomly
function sampleQuestions(questions: any[], count: number) {
  if (!questions) return [];
  const validQuestions = Array.isArray(questions) ? questions : [questions];
  const shuffled = shuffleArray(validQuestions);
  return shuffled.slice(0, count);
}

export async function GET(req: NextRequest, { params }: { params: { chapterId: string } }) {
  try {
    const chapterId = params.chapterId;
    const filePath = path.join(process.cwd(), "raw_questions", `${chapterId}.xml`);
    
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

    const easy = result.chapter.easy?.question || [];
    const medium = result.chapter.medium?.question || [];
    const hard = result.chapter.hard?.question || [];

    // Randomly pluck exactly 10 from each difficulty to make a 30-question drill
    const sampledEasy = sampleQuestions(easy, 10).map(q => ({ ...q, difficulty: 'easy' }));
    const sampledMedium = sampleQuestions(medium, 10).map(q => ({ ...q, difficulty: 'medium' }));
    const sampledHard = sampleQuestions(hard, 10).map(q => ({ ...q, difficulty: 'hard' }));

    let drillQuestions = [...sampledEasy, ...sampledMedium, ...sampledHard];
    
    // Format options cleanly - fast-xml-parser returns { "#text": "val", "@_id": "A" } per option
    drillQuestions = drillQuestions.map((q: any, i: number) => {
      // Ensure options is always an array (single option edge-case)
      const rawOptions = q.option 
        ? (Array.isArray(q.option) ? q.option : [q.option]) 
        : [];

      const formattedOptions = rawOptions.map((opt: any) => {
        // opt may be a primitive string or an object
        if (typeof opt === "string") return { id: "?", text: opt };
        return {
          id: String(opt["@_id"] ?? ""),
          // #text holds the text content; fall back to string coercion
          text: String(opt["#text"] ?? opt ?? "")
        };
      });

      return {
        id: `q${i + 1}`,
        text: String(q.text ?? ""),
        options: formattedOptions,
        answer: String(q.answer ?? ""),
        explanation: String(q.explanation ?? ""),
        difficulty: q.difficulty
      };
    });

    return NextResponse.json({
      chapterName: result.chapter["@_name"] || "Practice Drill",
      subject: result.chapter["@_subject"] || "Unknown",
      questions: drillQuestions
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to generate drill." }, { status: 500 });
  }
}
