/**
 * Shared exam utilities used across all exam API routes.
 * Eliminates ~400 lines of duplicated code.
 */

// ── Array Shuffle ──
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ── Shuffle Options & Remap Correct Answer ──
export function shuffleOptionsAndAnswer(
  options: { id: string; text: string }[],
  answer: string
) {
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

// ── Math Symbol Formatting ──
export function formatMathText(str: string): string {
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

// ── Option Text Sanitization ──
export function sanitizeOptionText(str: string): string {
  let cleaned = formatMathText(str).trim();
  // Remove leading "Option X:" or "X)" prefixes
  cleaned = cleaned.replace(/^(Option\s*)?[A-Da-d][\.)\:\-]\s*/i, "");
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

// ── Pad Options to Exactly 4 ──
export function padOptionsToFour(
  options: { id: string; text: string }[]
): { id: string; text: string }[] {
  const ids = ["A", "B", "C", "D"];
  const fillers = [
    "None of the above",
    "All of the above",
    "Cannot be determined",
    "Not applicable",
  ];
  while (options.length < 4) {
    const nextId = ids[options.length];
    const existingTexts = options.map((o) => o.text.toLowerCase());
    const fillerText =
      fillers.find((f) => !existingTexts.includes(f.toLowerCase())) ||
      "None of the above";
    options.push({ id: nextId, text: fillerText });
  }
  return options;
}

// ── Sample Random Questions ──
export function sampleQuestions(questions: any[], count: number): any[] {
  if (!questions) return [];
  const validQuestions = Array.isArray(questions) ? questions : [questions];
  const shuffled = shuffleArray(validQuestions);
  return shuffled.slice(0, count);
}

// ── Format Raw XML Options Into Structured Array ──
export function formatRawOptions(rawOptions: any[]): { id: string; text: string }[] {
  return rawOptions.map((opt: any) => {
    if (typeof opt === "string") return { id: "?", text: sanitizeOptionText(opt) };
    return {
      id: String(opt["@_id"] ?? ""),
      text: sanitizeOptionText(String(opt["#text"] ?? opt ?? "")),
    };
  });
}

// ── Process a Single Raw Question From XML ──
export function processQuestion(q: any, index: number, difficulty?: string): any | null {
  if (!q || !q.text) return null;

  const rawOptions = q.option
    ? Array.isArray(q.option)
      ? q.option
      : [q.option]
    : [];

  let formattedOptions = formatRawOptions(rawOptions);
  formattedOptions = padOptionsToFour(formattedOptions);
  const originalAnswer = String(q.answer ?? "");
  const { options: shuffledOpts, answer: newAnswer } = shuffleOptionsAndAnswer(
    formattedOptions,
    originalAnswer
  );

  return {
    id: q["@_id"] || `q${index + 1}`,
    text: formatMathText(String(q.text ?? "")),
    options: shuffledOpts,
    answer: newAnswer,
    explanation: formatMathText(String(q.explanation ?? "")),
    difficulty: difficulty || q.difficulty || "medium",
    ...(q.subject && { subject: String(q.subject) }),
  };
}

// ── Strip Answers for Client Response ──
export function stripAnswersForClient(questions: any[]): any[] {
  return questions.map((q: any) => ({
    id: q.id,
    text: q.text,
    options: q.options,
    difficulty: q.difficulty,
    ...(q.chapterSource && { chapterSource: q.chapterSource }),
    ...(q.inferredSubject && { inferredSubject: q.inferredSubject }),
  }));
}

// ── Calculate Per-Subject Question Quotas ──
/**
 * Distributes `totalQuestions` across subjects.
 * - NEET special case: Biology gets 2× weight (Botany + Zoology combined).
 *   e.g. 180 total with 3 subjects → Physics: 45, Chemistry: 45, Biology: 90
 * - General case: equal split with remainder distributed round-robin.
 *   e.g. 45 total with 3 subjects → 15 each
 */
export function calculateSubjectQuotas(
  subjects: string[],
  totalQuestions: number,
  targetExam?: string
): Record<string, number> {
  if (subjects.length === 0) return {};
  if (subjects.length === 1) return { [subjects[0]]: totalQuestions };

  const quotas: Record<string, number> = {};

  if (targetExam === "NEET" && subjects.includes("Biology")) {
    // NEET: Biology gets double weight
    // totalWeight = (number of non-Bio subjects × 1) + (Bio × 2)
    const totalWeight = subjects.length + 1; // Bio counts as 2
    const baseShare = Math.floor(totalQuestions / totalWeight);
    let remainder = totalQuestions % totalWeight;

    for (const sub of subjects) {
      const weight = sub === "Biology" ? 2 : 1;
      quotas[sub] = baseShare * weight;
    }
    // Distribute remainder: Biology first (since it has double weight), then others
    const orderedForRemainder = [...subjects].sort((a, b) =>
      a === "Biology" ? -1 : b === "Biology" ? 1 : 0
    );
    for (const sub of orderedForRemainder) {
      if (remainder <= 0) break;
      quotas[sub]++;
      remainder--;
    }
  } else {
    // General: equal split
    const perSubject = Math.floor(totalQuestions / subjects.length);
    let remainder = totalQuestions % subjects.length;
    for (const sub of subjects) {
      quotas[sub] = perSubject + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;
    }
  }

  return quotas;
}

// ── Distribute Questions Across Subjects Using Quotas ──
/**
 * Takes a flat list of questions (each with `inferredSubject`), groups by subject,
 * applies quotas from `calculateSubjectQuotas`, shuffles within each subject,
 * and returns a flat list ordered by subject.
 * If a subject has fewer questions than its quota, the surplus is redistributed.
 */
export function distributeQuestionsBySubject(
  allQuestions: any[],
  totalRequested: number,
  targetExam?: string
): any[] {
  // Group by subject
  const subjectGroups: Record<string, any[]> = {};
  allQuestions.forEach((q) => {
    const sub = q.inferredSubject || "Unknown";
    if (!subjectGroups[sub]) subjectGroups[sub] = [];
    subjectGroups[sub].push(q);
  });

  const subjectNames = Object.keys(subjectGroups);
  if (subjectNames.length <= 1) {
    // Single subject — just shuffle and slice
    return shuffleArray(allQuestions).slice(0, totalRequested);
  }

  // Calculate initial quotas
  const quotas = calculateSubjectQuotas(subjectNames, totalRequested, targetExam);

  // First pass: pick min(quota, available) from each subject
  const picked: Record<string, any[]> = {};
  let totalPicked = 0;
  let deficit = 0;

  for (const sub of subjectNames) {
    const pool = shuffleArray(subjectGroups[sub]);
    const quota = quotas[sub] || 0;
    const take = Math.min(quota, pool.length);
    picked[sub] = pool.slice(0, take);
    totalPicked += take;
    deficit += quota - take; // how many we couldn't fill
  }

  // Second pass: redistribute deficit to subjects that have surplus
  if (deficit > 0) {
    for (const sub of subjectNames) {
      if (deficit <= 0) break;
      const alreadyPicked = picked[sub].length;
      const available = subjectGroups[sub].length;
      const extra = Math.min(deficit, available - alreadyPicked);
      if (extra > 0) {
        const pool = shuffleArray(subjectGroups[sub]);
        picked[sub] = picked[sub].concat(
          pool.filter((q) => !picked[sub].includes(q)).slice(0, extra)
        );
        deficit -= extra;
      }
    }
  }

  // Combine in subject order (Physics → Chemistry → Maths/Bio)
  const subjectOrder = ["Physics", "Chemistry", "Mathematics", "Biology", "Unknown"];
  const ordered = subjectOrder.filter((s) => picked[s]?.length > 0);
  // Add any subjects not in the predefined order
  for (const s of subjectNames) {
    if (!ordered.includes(s) && picked[s]?.length > 0) ordered.push(s);
  }

  let result: any[] = [];
  for (const sub of ordered) {
    result = result.concat(picked[sub] || []);
  }

  return result;
}
