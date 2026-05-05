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

function fixModelImports() {
  console.log('Starting to fix model imports globally...');
  const files = walk(srcDir);
  let changedFilesCount = 0;

  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    // The mapping of old occurrences to new occurrences
    const replacements = {
      // Imports
      "require('../models/RefactoredExam')": "require('../models/Exam')",
      "require('../models/RefactoredMark')": "require('../models/MarksEntry')",
      "require('../models/ImprovedResult')": "require('../models/Result')",
      "require('../models/ImprovedFeeStructure')": "require('../models/FeeStructure')",
      "require('../models/ImprovedStudentFee')": "require('../models/StudentFee')",
      
      // mongoose.model string references inside relations (e.g., ref: 'RefactoredExam')
      "ref: 'RefactoredExam'": "ref: 'Exam'",
      "ref: 'RefactoredMark'": "ref: 'MarksEntry'",
      "ref: 'ImprovedResult'": "ref: 'Result'",
      "ref: 'ImprovedFeeStructure'": "ref: 'FeeStructure'",
      "ref: 'ImprovedStudentFee'": "ref: 'StudentFee'",
      
      // Also update instances where they might be passing the string
      "'RefactoredExam'": "'Exam'",
      "'RefactoredMark'": "'MarksEntry'",
      "'ImprovedResult'": "'Result'",
      "'ImprovedFeeStructure'": "'FeeStructure'",
      "'ImprovedStudentFee'": "'StudentFee'",
    };

    for (const [oldStr, newStr] of Object.entries(replacements)) {
      if (content.includes(oldStr)) {
        // We use split-join for global replace of a plain string
        content = content.split(oldStr).join(newStr);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(file, content);
      changedFilesCount++;
      console.log(`Updated imports in: ${path.relative(srcDir, file)}`);
    }
  });

  console.log(`\nImport fixes complete. Updated ${changedFilesCount} files.`);
}

fixModelImports();
