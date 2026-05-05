// Script to auto-generate replacement questions using OpenAI
// Run this carefully with: node generate_replacements.js
// Make sure OPENAI_API_KEY is in your environment variables.

const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

const dir = path.join(__dirname, 'raw_questions');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.xml'));

async function generateMissingQuestions() {
  console.log("Scanning XML files to find where questions were removed...");
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Simple heuristic: If a file has less than 20 questions, we can assume it needs top-up.
    // In a real scenario, we'd specifically target files that lost questions.
    const qCount = (content.match(/<question>/g) || []).length;
    if (qCount < 30 && qCount > 0) {
       console.log(`\nFile ${file} has only ${qCount} questions. Generating 5 new high-quality questions...`);
       
       const subjectNameMatch = content.match(/name="([^"]+)"/);
       const subjectName = subjectNameMatch ? subjectNameMatch[1] : file.replace('.xml', '');
       
       try {
           const response = await openai.chat.completions.create({
              model: "gpt-4o",
              messages: [
                  { 
                      role: "system", 
                      content: `You are an expert JEE/NEET examiner. Generate 5 highly accurate, original multiple-choice questions on the topic: ${subjectName}. 
                      Return ONLY valid XML format. Each question must strictly have 4 valid options (A, B, C, D) without using placeholder text.
                      Format:
                      <question>
                          <text>Actual question text</text>
                          <option id="A">Valid Option 1</option><option id="B">Valid Option 2</option><option id="C">Valid Option 3</option><option id="D">Valid Option 4</option>
                          <answer>A</answer><explanation>Educational explanation.</explanation>
                      </question>`
                  }
              ]
           });
           
           const newQuestionsXML = response.choices[0].message.content.replace(/```xml|```/g, '').trim();
           
           // Inject into the <medium> tag for simplicity
           content = content.replace(/<medium>/, `<medium>\n${newQuestionsXML}\n`);
           fs.writeFileSync(filePath, content, 'utf-8');
           console.log(`✅ Successfully added 5 original questions to ${file}.`);
           
           // Sleep to prevent rate-limiting
           await new Promise(r => setTimeout(r, 2000));
       } catch (e) {
           console.error(`Failed to generate for ${file}:`, e.message);
       }
    }
  }
  console.log("\nFinished generating replacement questions!");
}

generateMissingQuestions();
