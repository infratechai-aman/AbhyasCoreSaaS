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

// Utility to sample randomly
function sampleQuestions(questions: any[], count: number) {
  if (!questions) return [];
  const validQuestions = Array.isArray(questions) ? questions : [questions];
  const shuffled = shuffleArray(validQuestions);
  return shuffled.slice(0, count);
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
    .replace(/\*/g, "·"); // Replace asterisk with nice multiplication dot
}

function sanitizeOptionText(str: string) {
  let cleaned = formatMathText(str).trim();
  // Remove leading "Option X:" or "X)" prefixes
  cleaned = cleaned.replace(/^(Option\s*)?[A-Da-d][\.\)\:\-]\s*/i, "");
  const lower = cleaned.toLowerCase();
  // Empty, single-char, or meaningless options get replaced
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

// Pad options to exactly 4 if fewer exist
function padOptionsToFour(options: {id: string, text: string}[], answer: string) {
  const ids = ["A", "B", "C", "D"];
  const fillers = [
    "None of the above",
    "All of the above",
    "Cannot be determined",
    "Not applicable"
  ];
  
  while (options.length < 4) {
    const nextId = ids[options.length];
    // Pick a filler that doesn't duplicate existing options
    const existingTexts = options.map(o => o.text.toLowerCase());
    let fillerText = fillers.find(f => !existingTexts.includes(f.toLowerCase())) || "None of the above";
    options.push({ id: nextId, text: fillerText });
  }
  return options;
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
    
    // Format options cleanly - fast-xml-parser returns { "#text": "val", "@_id": "A" } per option
    drillQuestions = drillQuestions.map((q: any, i: number) => {
      // Ensure options is always an array (single option edge-case)
      const rawOptions = q.option 
        ? (Array.isArray(q.option) ? q.option : [q.option]) 
        : [];

      let formattedOptions = rawOptions.map((opt: any) => {
        // opt may be a primitive string or an object
        if (typeof opt === "string") return { id: "?", text: sanitizeOptionText(opt) };
        return {
          id: String(opt["@_id"] ?? ""),
          // #text holds the text content; fall back to string coercion
          text: sanitizeOptionText(String(opt["#text"] ?? opt ?? ""))
        };
      });

      // Pad to exactly 4 options if fewer exist (fixes "D shows as D" bug)
      formattedOptions = padOptionsToFour(formattedOptions, String(q.answer ?? ""));

      // Shuffle options so the correct answer isn't always A
      const originalAnswer = String(q.answer ?? "");
      const { options: shuffledOptions, answer: newAnswer } = shuffleOptionsAndAnswer(formattedOptions, originalAnswer);

      return {
        id: `q${i + 1}`,
        text: formatMathText(String(q.text ?? "")),
        options: shuffledOptions,
        answer: newAnswer,
        explanation: formatMathText(String(q.explanation ?? "")),
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
