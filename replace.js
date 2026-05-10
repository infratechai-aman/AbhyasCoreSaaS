const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('c:\\Users\\Aman Talukdar\\Downloads\\AbhyasCoreSaaS-main\\app\\api', function(filePath) {
  if (filePath.endsWith('route.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('if (isRateLimited(')) {
      content = content.replace(/if \(isRateLimited\(/g, 'if (await isRateLimited(');
      fs.writeFileSync(filePath, content);
      console.log('Updated', filePath);
    }
  }
});
