const { execSync } = require('child_process');
const path = require('path');

const scripts = [
  '01_standardize_academic_year.js',
  '02_standardize_class_teacher_controller.js',
  '03_cleanup_ghost_models.js',
  '04_fix_model_imports.js',
  '05_fix_student_imports.js'
];

console.log('Starting automated codebase cleanup and standardization...\n');

for (const script of scripts) {
  console.log(`=========================================`);
  console.log(`Running ${script}...`);
  console.log(`=========================================`);
  try {
    const scriptPath = path.join(__dirname, script);
    const output = execSync(`node "${scriptPath}"`, { encoding: 'utf8' });
    console.log(output);
  } catch (err) {
    console.error(`Error running ${script}:`, err.message);
    if (err.stdout) console.log(err.stdout);
    if (err.stderr) console.error(err.stderr);
    console.log('Stopping execution due to error.');
    process.exit(1);
  }
}

console.log('=========================================');
console.log('ALL FIXES COMPLETED SUCCESSFULLY!');
console.log('=========================================');
console.log('Next Steps:');
console.log('1. Review the changes using `git status` and `git diff`.');
console.log('2. Test the endpoints to ensure everything functions properly.');
