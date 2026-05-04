const mongoose = require('mongoose');
const Student = require('./src/models/Student');

async function testAPIFix() {
  try {
    await mongoose.connect('mongodb+srv://techhimtech_db_user:7kWRGlcUpVDFE6uE@cluster0.9uenbsu.mongodb.net/?appName=Cluster0&tls=true');
    
    const studentId = '69f87fcc8c9f3c424c526fb7';
    
    console.log('=== Testing Student Existence ===');
    
    // Check if student exists
    const student = await Student.findOne({ _id: studentId, isActive: true });
    
    if (student) {
      console.log('✅ Student Found:');
      console.log(`- Name: ${student.firstName} ${student.lastName}`);
      console.log(`- Admission Number: ${student.admissionNumber}`);
      console.log(`- SchoolId: ${student.schoolId}`);
      
      console.log('\n=== Correct API URLs ===');
      console.log('1. Admission Details:');
      console.log(`   GET /api/v1/admission/${studentId}`);
      console.log('2. Parent Linking:');
      console.log(`   GET /api/v1/parent-linking/student/${studentId}/parents`);
      
    } else {
      console.log('❌ Student not found with ID:', studentId);
      
      // Show available students
      const students = await Student.find({ isActive: true }).limit(5);
      console.log('\nAvailable Student IDs:');
      students.forEach(s => {
        console.log(`- ${s.admissionNumber}: ${s._id}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

testAPIFix();
