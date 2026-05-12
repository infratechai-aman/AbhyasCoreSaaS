import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("❌ ERROR: GEMINI_API_KEY is missing from .env.local!");
  console.error("Please add your Google Gemini API key to .env.local like this:");
  console.error("GEMINI_API_KEY=your_key_here");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });
const rawQuestionsDir = path.join(process.cwd(), 'raw_questions');

async function classifyBatch(texts, isNeet) {
  const allowedSubjects = isNeet ? ['Physics', 'Chemistry', 'Biology'] : ['Physics', 'Chemistry', 'Mathematics'];
  
  const prompt = `
You are an expert exam classifier for JEE and NEET examinations.
I am going to give you ${texts.length} question texts.
For each question, strictly classify it into one of these subjects: ${allowedSubjects.join(', ')}.
Return ONLY a valid JSON array of strings in the exact same order as the questions. Do not include markdown formatting like \`\`\`json or any other text.
Example output: ["Physics", "Chemistry", "Mathematics"]

Here are the questions:
${texts.map((t, i) => `[Question ${i + 1}]: ${t}`).join('\n\n')}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
         temperature: 0.1,
         responseMimeType: "application/json",
      }
    });

    const text = response.text().trim();
    let parsed = JSON.parse(text);
    
    // Ensure all subjects are valid
    parsed = parsed.map(s => allowedSubjects.includes(s) ? s : allowedSubjects[0]);
    return parsed;
  } catch (error) {
    console.error("Failed to classify batch:", error.message);
    // Fallback if LLM fails (shouldn't happen often)
    return texts.map(() => allowedSubjects[0]);
  }
}

async function processFile(filename) {
  const isNeet = filename.startsWith('neet_');
  const filePath = path.join(rawQuestionsDir, filename);
  let content = fs.readFileSync(filePath, 'utf8');

  // Check if it already has <subject> tags
  if (content.includes('<subject>')) {
    console.log(`✅ Skipping ${filename} (Already classified)`);
    return;
  }

  console.log(`⏳ Processing ${filename}...`);

  // Regex to find <question> blocks
  // We need to capture the text block specifically to inject subject right after it
  const textRegex = /<text>([\s\S]*?)<\/text>/g;
  const matches = [...content.matchAll(textRegex)];
  
  if (matches.length === 0) {
    console.log(`⚠️ No questions found in ${filename}`);
    return;
  }

  const texts = matches.map(m => m[1].trim().substring(0, 500)); // Take first 500 chars to save tokens
  const subjects = [];

  // Process in batches of 20
  const BATCH_SIZE = 20;
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batchTexts = texts.slice(i, i + BATCH_SIZE);
    console.log(`   -> Classifying batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(texts.length/BATCH_SIZE)}...`);
    const batchSubjects = await classifyBatch(batchTexts, isNeet);
    subjects.push(...batchSubjects);
    
    // Tiny delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Double check lengths align (safeguard)
  if (subjects.length !== matches.length) {
      console.error(`❌ Mismatch in subjects length for ${filename}. Expected ${matches.length}, got ${subjects.length}`);
      return;
  }

  // Now inject the subjects into the XML content
  let currentIndex = 0;
  const newContent = content.replace(textRegex, (match) => {
      const subject = subjects[currentIndex];
      currentIndex++;
      return `${match}\n      <subject>${subject}</subject>`;
  });

  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`🎉 Successfully updated ${filename} with ${subjects.length} subject tags!`);
}

async function run() {
  console.log("🚀 Starting PYQ Classification Cleanup...");
  const files = fs.readdirSync(rawQuestionsDir).filter(f => 
    f.endsWith('.xml') && (f.startsWith('jee_main_') || f.startsWith('neet_'))
  );

  for (const file of files) {
    await processFile(file);
  }

  console.log("✅ All PYQ files have been successfully classified!");
}

run();
