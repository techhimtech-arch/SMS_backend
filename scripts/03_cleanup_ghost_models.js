const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, '../src/models');
const obsoleteModels = [
  'Student.js',
  'Exam.js',
  'MarksEntry.js',
  'Result.js',
  'ExamResult.js',
  'FeeStructure.js',
  'StudentFee.js'
];

function cleanupGhostModels() {
  console.log('Starting cleanup of obsolete models...');
  
  obsoleteModels.forEach(modelFile => {
    const filePath = path.join(modelsDir, modelFile);
    if (fs.existsSync(filePath)) {
      // We don't actually delete to be safe, but we can rename them to .deprecated
      fs.renameSync(filePath, `${filePath}.deprecated`);
      console.log(`Deprecated model: ${modelFile}`);
    } else {
      console.log(`Model ${modelFile} not found or already removed.`);
    }
  });

  console.log('\nNow renaming Refactored/Improved models to their standard names...');
  const renames = {
    'RefactoredExam.js': 'Exam.js',
    'RefactoredMark.js': 'MarksEntry.js',
    'ImprovedResult.js': 'Result.js',
    'ImprovedFeeStructure.js': 'FeeStructure.js',
    'ImprovedStudentFee.js': 'StudentFee.js'
  };

  for (const [oldName, newName] of Object.entries(renames)) {
    const oldPath = path.join(modelsDir, oldName);
    const newPath = path.join(modelsDir, newName);
    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
      console.log(`Renamed ${oldName} -> ${newName}`);
    }
  }

  console.log('\nCleanup and renaming complete!');
  console.log('NOTE: You will need to globally search and replace the import statements for the renamed models.');
}

cleanupGhostModels();
