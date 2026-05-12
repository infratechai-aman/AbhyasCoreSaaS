import fs from 'fs';
import path from 'path';

const rawQuestionsDir = path.join(process.cwd(), 'raw_questions');

function getPlaceholderQuestion(subject, index) {
  return `    <question>
      <text>Placeholder ${subject} Question ${index}. Please update this with real content later.</text>
      <subject>${subject}</subject>
      <option id="A">Placeholder Option A</option>
      <option id="B">Placeholder Option B</option>
      <option id="C">Placeholder Option C</option>
      <option id="D">Placeholder Option D</option>
      <answer>A</answer>
      <explanation>Placeholder explanation.</explanation>
    </question>`;
}

function processFile(filename) {
  const isNeet = filename.startsWith('neet_');
  const filePath = path.join(rawQuestionsDir, filename);
  let content = fs.readFileSync(filePath, 'utf8');

  // Extract all questions
  const qRegex = /<question>[\s\S]*?<\/question>/g;
  const questions = [...content.matchAll(qRegex)].map(m => m[0]);

  // Group by subject
  const grouped = {
    Physics: [],
    Chemistry: [],
    Mathematics: [],
    Biology: []
  };

  questions.forEach(q => {
    let subject = 'Physics'; // fallback
    const subjMatch = q.match(/<subject>(.*?)<\/subject>/);
    if (subjMatch) {
        subject = subjMatch[1].trim();
    }
    if (grouped[subject]) {
        grouped[subject].push(q);
    } else {
        // Fallback for invalid tags
        grouped['Physics'].push(q);
    }
  });

  const quotas = isNeet 
    ? { Physics: 45, Chemistry: 45, Biology: 90 }
    : { Physics: 30, Chemistry: 30, Mathematics: 30 };

  let newQuestions = [];

  for (const [subject, quota] of Object.entries(quotas)) {
    let subjectQs = grouped[subject];
    
    // Truncate if excess
    if (subjectQs.length > quota) {
      console.log(`  - ${subject}: Truncating from ${subjectQs.length} to ${quota}`);
      subjectQs = subjectQs.slice(0, quota);
    } 
    // Pad if missing
    else if (subjectQs.length < quota) {
      const missing = quota - subjectQs.length;
      console.log(`  - ${subject}: Padding ${missing} missing questions to hit ${quota}`);
      for (let i = 0; i < missing; i++) {
        subjectQs.push(getPlaceholderQuestion(subject, subjectQs.length + 1));
      }
    } else {
      console.log(`  - ${subject}: Perfect quota (${quota})`);
    }
    
    newQuestions.push(...subjectQs);
  }

  // Rewrite the file
  // Keep the chapter wrapper but replace the inner questions
  const header = `<?xml version="1.0" encoding="UTF-8"?>\n<chapter>\n  <easy>\n`;
  const footer = `\n  </easy>\n</chapter>`;
  
  const finalContent = header + newQuestions.join('\n') + footer;
  fs.writeFileSync(filePath, finalContent, 'utf8');
  
  console.log(`✅ Normalized ${filename} to ${newQuestions.length} questions.`);
}

function run() {
  console.log("🚀 Starting PYQ Quota Normalization...");
  const files = fs.readdirSync(rawQuestionsDir).filter(f => 
    f.endsWith('.xml') && (f.startsWith('jee_main_') || f.startsWith('neet_'))
  );

  for (const file of files) {
    console.log(`\nProcessing ${file}...`);
    processFile(file);
  }

  console.log("\n✅ All PYQ files have been strictly normalized to their exact quotas!");
}

run();
