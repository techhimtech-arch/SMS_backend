const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, '../src/models');

const toRestore = [
  'Exam.js',
  'Result.js',
  'MarksEntry.js',
  'FeeStructure.js',
  'StudentFee.js'
];

console.log('Restoring production models that were accidentally deprecated on the second run...');

toRestore.forEach(modelFile => {
  const deprecatedPath = path.join(modelsDir, `${modelFile}.deprecated`);
  const restorePath = path.join(modelsDir, modelFile);

  if (fs.existsSync(deprecatedPath)) {
    fs.renameSync(deprecatedPath, restorePath);
    console.log(`Successfully restored ${modelFile}`);
  } else {
    console.log(`Could not find ${deprecatedPath} to restore.`);
  }
});

console.log('Restore complete!');
