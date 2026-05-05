import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';

export const dynamic = 'force-dynamic';

// Seeded pseudo-random number generator (Mulberry32)
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(array: T[], seed: number): T[] {
  const arr = [...array];
  const rand = mulberry32(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Get today's date string in IST (UTC+5:30)
function getISTDateString(): string {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // 5h30m in ms
  const istDate = new Date(now.getTime() + istOffset);
  return istDate.toISOString().split('T')[0]; // YYYY-MM-DD
}

// Simple string hash → stable numeric seed
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    hash = (hash << 5) - hash + c;
    hash |= 0;
  return Math.abs(hash);
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

const JEE_CHAPTERS = [
  "kinematics","laws_of_motion","work_energy_power","gravitation",
  "current_electricity","electrostatic_potential_and_capacitance",
  "moving_charges_and_magnetism","ray_optics_and_optical_instruments",
  "some_basic_concepts_of_chemistry","equilibrium","chemical_kinetics",
  "electrochemistry","organic_chemistry_some_basic_principles_and_techniques",  
  "complex_numbers_and_quadratic_equations","sequences_and_series",
  "application_of_derivatives","integrals","probability_12"
];

const NEET_CHAPTERS = [
  "cell_the_unit_of_life","biological_classification","plant_kingdom",
  "human_health_and_disease","molecular_basis_of_inheritance",
  "evolution","neural_control_and_coordination",
  "human_reproduction","reproductive_health",
  "photosynthesis_in_higher_plants","respiration_in_plants",
  "current_electricity","electrostatic_potential_and_capacitance",
  "dual_nature_of_radiation","atoms",
  "some_basic_concepts_of_chemistry","equilibrium","chemical_kinetics",
  "coordination_compounds"
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const exam = (searchParams.get('exam') || 'JEE').toUpperCase();
    const userId = searchParams.get('uid') || 'anonymous';
    const count = parseInt(searchParams.get('q') || '10', 10);

    const dateStr = getISTDateString();
    // Seed = hash of "userId + date" → same user gets same questions all day, resets next day
    const seed = hashString(`${userId}-${dateStr}-${exam}`);

    const chapters = exam === 'NEET' ? NEET_CHAPTERS : JEE_CHAPTERS;
    const shuffledChapters = seededShuffle(chapters, seed);

    const rawDir = path.join(process.cwd(), 'raw_questions');
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

    let allQuestions: any[] = [];

    for (const chapter of shuffledChapters) {
      const filePath = path.join(rawDir, `${chapter}.xml`);
      if (!fs.existsSync(filePath)) continue;
      try {
        const xmlData = fs.readFileSync(filePath, 'utf-8');
        const result = parser.parse(xmlData);
        if (result.chapter) {
          const easyQs   = result.chapter.easy?.question   || [];
          const mediumQs = result.chapter.medium?.question || [];
          const hardQs   = result.chapter.hard?.question   || [];
          const easyArr   = Array.isArray(easyQs)   ? easyQs   : [easyQs];
          const mediumArr = Array.isArray(mediumQs) ? mediumQs : [mediumQs];
          const hardArr   = Array.isArray(hardQs)   ? hardQs   : [hardQs];
          const combined  = [...easyArr, ...mediumArr, ...hardArr].filter((q: any) => q && q.text);
          const mapped = combined.map((q: any, qIdx: number) => {
            const rawOptions = q.option ? (Array.isArray(q.option) ? q.option : [q.option]) : [];
            const formattedOptions = rawOptions.map((opt: any) =>
              typeof opt === "string"
                ? { id: "?", text: formatMathText(opt) }
                : { id: String(opt["@_id"] ?? ""), text: formatMathText(String(opt["#text"] ?? opt ?? "")) }
            );

            // Shuffle options using seeded RNG so order is consistent per day
            const optSeed = seed + qIdx + hashString(String(q.text ?? ""));
            const originalAnswer = String(q.answer ?? "");
            const shuffledOpts = seededShuffle(formattedOptions, optSeed);
            const ids = ["A", "B", "C", "D"];
            let newAnswer = originalAnswer;
            const reassigned = shuffledOpts.map((opt: any, idx: number) => {
              const newId = ids[idx] || opt.id;
              if (opt.id === originalAnswer) newAnswer = newId;
              return { id: newId, text: opt.text };
            });

            return {
              id: q["@_id"] || Math.random().toString(36).slice(2, 9),
              text: formatMathText(String(q.text ?? "")),
              options: reassigned,
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
      if (allQuestions.length >= count * 5) break; // enough pool collected
    }

    if (allQuestions.length === 0) {
      return NextResponse.json({ error: "No questions found" }, { status: 404 });
    }

    // Deterministic selection using same seed → same 10 questions all day
    const seededPool = seededShuffle(allQuestions, seed + 1);
    const finalQuestions = seededPool.slice(0, count);

    // Calculate seconds until next midnight IST
    const nowUTC = Date.now();
    const istNow = nowUTC + 5.5 * 60 * 60 * 1000;
    const istMidnightToday = new Date(dateStr + 'T00:00:00+05:30').getTime();
    const istMidnightNext  = istMidnightToday + 24 * 60 * 60 * 1000;
    const secondsUntilReset = Math.floor((istMidnightNext - nowUTC) / 1000);

    return NextResponse.json({
      chapterName: `Daily ${exam} Target`,
      subject: "Mixed",
      questions: finalQuestions,
      date: dateStr,
      exam,
      secondsUntilReset,
      resetAt: new Date(istMidnightNext).toISOString()
    });

  } catch (err) {
    console.error("Daily target API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
