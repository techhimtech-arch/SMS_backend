const fs = require('fs');
const path = require('path');

const classTeacherControllerPath = path.join(__dirname, '../src/controllers/classTeacherController.js');

function refactorClassTeacher() {
  if (fs.existsSync(classTeacherControllerPath)) {
    const content = fs.readFileSync(classTeacherControllerPath, 'utf8');
    // Replace 'academicYear:' and 'academicYear,' with 'academicYearId:' and 'academicYearId,'
    const newContent = content
      .replace(/academicYear\s*:/g, 'academicYearId:')
      .replace(/academicYear\s*,/g, 'academicYearId,')
      .replace(/req\.body\.academicYear/g, 'req.body.academicYearId')
      .replace(/req\.query\.academicYear/g, 'req.query.academicYearId');
      
    fs.writeFileSync(classTeacherControllerPath, newContent);
    console.log('Successfully refactored classTeacherController.js');
  } else {
    console.log('classTeacherController.js not found.');
  }
}

refactorClassTeacher();
