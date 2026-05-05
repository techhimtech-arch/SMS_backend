const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.js') || file.endsWith('.md')) {
        results.push(file);
      }
    }
  });
  return results;
}

function fixStudentImports() {
  console.log('Starting to fix Student model imports globally...');
  const files = walk(srcDir);
  let changedFilesCount = 0;

  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    const replacements = {
      "require('../models/Student')": "require('../models/StudentProfile')",
      "require('../../models/Student')": "require('../../models/StudentProfile')",
      "ref: 'Student'": "ref: 'StudentProfile'",
      "'Student'": "'StudentProfile'", // This handles mongoose.model('Student') or refs
      '"Student"': '"StudentProfile"'
    };

    for (const [oldStr, newStr] of Object.entries(replacements)) {
      if (content.includes(oldStr)) {
        // Simple global replace
        content = content.split(oldStr).join(newStr);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(file, content);
      changedFilesCount++;
      console.log(`Updated Student imports in: ${path.relative(srcDir, file)}`);
    }
  });

  console.log(`\nStudent Import fixes complete. Updated ${changedFilesCount} files.`);
}

fixStudentImports();
