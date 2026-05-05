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

function refactorAcademicYear() {
  console.log('Starting refactor of academicSessionId to academicYearId...');
  const files = walk(srcDir);
  let changedFilesCount = 0;

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('academicSessionId')) {
      const newContent = content.replace(/academicSessionId/g, 'academicYearId');
      fs.writeFileSync(file, newContent);
      changedFilesCount++;
      console.log(`Updated: ${path.relative(srcDir, file)}`);
    }
  });

  console.log(`\nRefactor complete. Updated ${changedFilesCount} files.`);
}

refactorAcademicYear();
