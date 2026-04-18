const fs = require('fs');
const content = fs.readFileSync('lib/syllabus.ts', 'utf8');
const fileRegex = /file:\s*['"]([^'"]+\.xml)['"]/g;
const chapters = new Set();
let match;
while ((match = fileRegex.exec(content)) !== null) {
  chapters.add(match[1]);
}
let missing = [];
let existing = 0;
for (const file of chapters) {
  if (fs.existsSync('raw_questions/' + file)) {
    existing++;
  } else {
    missing.push(file);
  }
}
console.log('Total required chapters in syllabus.ts:', chapters.size);
console.log('Existing chapters in raw_questions:', existing);
console.log('Missing chapters:', missing.length);
if (missing.length > 0) {
  console.log('Missing files:', missing.join(', '));
} else {
  console.log('The syllabus is 100% complete! No chapters are missing.');
}
