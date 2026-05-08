const fs = require('fs');
const path = require('path');

const filesToDelete = [
  'src/controllers/improvedUserController.js',
  'src/controllers/enhancedSubjectController.js',
  'src/controllers/refactoredExamController.js',
  'src/controllers/examsResultsController.js',
  'src/controllers/feesController.js',
  'src/routes/improvedUserRoutes.js',
  'src/routes/enhancedSubjectRoutes.js',
  'src/routes/refactoredExamRoutes.js',
  'src/routes/examsResultsRoutes.js',
  'src/routes/feesRoutes.js'
];

const dirsToDelete = [
  'src/middleware'
];

filesToDelete.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    console.log(`Deleted file: ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});

dirsToDelete.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (fs.existsSync(fullPath)) {
    fs.rmSync(fullPath, { recursive: true, force: true });
    console.log(`Deleted directory: ${dir}`);
  } else {
    console.log(`Directory not found: ${dir}`);
  }
});
