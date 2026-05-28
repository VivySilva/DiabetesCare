const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace bg-[#F7F9FB] with bg-[#F8F9FA] everywhere it appears
  content = content.replace(/bg-\[#F7F9FB\]/g, 'bg-[#F8F9FA]');

  // Replace bg-white or bg-gray-50 ONLY if it's next to min-h-screen
  content = content.replace(/min-h-screen\s+bg-white/g, 'min-h-screen bg-[#F8F9FA]');
  content = content.replace(/bg-white\s+min-h-screen/g, 'bg-[#F8F9FA] min-h-screen');
  
  content = content.replace(/min-h-screen\s+bg-gray-50/g, 'min-h-screen bg-[#F8F9FA]');
  content = content.replace(/bg-gray-50\s+min-h-screen/g, 'bg-[#F8F9FA] min-h-screen');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated: ' + filePath);
  }
}

function walkSync(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        walkSync(filePath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      replaceInFile(filePath);
    }
  }
}

walkSync(path.join(__dirname, 'app'));
walkSync(path.join(__dirname, 'components'));
