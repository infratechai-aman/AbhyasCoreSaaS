const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'raw_questions');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.xml'));

let totalRemovedQuestions = 0;
let totalRemovedOptions = 0;

for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    let questionsRemoved = 0;
    content = content.replace(/<question>[\s\S]*?<\/question>/g, (match) => {
        if (match.includes('Option A (Correct)')) {
            questionsRemoved++;
            return '';
        }
        if (/<text>\s*Question \d+\s*\(.*?\)[\s\S]*?<\/text>/.test(match)) {
            questionsRemoved++;
            return '';
        }
        return match;
    });

    let optionsRemoved = 0;
    content = content.replace(/<option[^>]*>\s*(phi|None|A|B|C|D)\s*<\/option>/ig, (match) => {
        optionsRemoved++;
        return '';
    });
    
    // Clean up excessive blank lines
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

    if (questionsRemoved > 0 || optionsRemoved > 0) {
        fs.writeFileSync(filePath, content, 'utf-8');
        totalRemovedQuestions += questionsRemoved;
        totalRemovedOptions += optionsRemoved;
    }
}

console.log(`Finished! Removed ${totalRemovedQuestions} placeholder questions and ${totalRemovedOptions} dummy options.`);
