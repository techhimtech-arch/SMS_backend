const mongoose = require('mongoose');
const Student = require('./src/models/Student');
const User = require('./src/models/User');

async function testStudentsAPI() {
  try {
    await mongoose.connect('mongodb+srv://techhimtech_db_user:7kWRGlcUpVDFE6uE@cluster0.9uenbsu.mongodb.net/?appName=Cluster0&tls=true');
    
    console.log('=== Database Analysis ===');
    
    // Check all students with their schoolId
    const students = await Student.find({}).select('admissionNumber firstName schoolId isActive').limit(5);
    console.log('\nSample Students:');
    students.forEach(student => {
      console.log(`- ${student.admissionNumber}: ${student.firstName}, School: ${student.schoolId}, Active: ${student.isActive}`);
    });
    
    // Check all users with their roles and schoolId
    const users = await User.find({}).select('name role schoolId isActive').limit(5);
    console.log('\nSample Users:');
    users.forEach(user => {
      console.log(`- ${user.name}: Role: ${user.role}, School: ${user.schoolId}, Active: ${user.isActive}`);
    });
    
    // Test the exact query that studentService.getStudents uses
    console.log('\n=== Testing Query ===');
    const schoolId = '699d8617f70f792501a8401b'; // This is the schoolId from students
    const query = { 
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isActive: true 
    };
    
    const count = await Student.countDocuments(query);
    console.log(`Students with schoolId ${schoolId}: ${count}`);
    
    const foundStudents = await Student.find(query).limit(3);
    console.log('\nStudents found with query:');
    foundStudents.forEach(student => {
      console.log(`- ${student.admissionNumber}: ${student.firstName} ${student.lastName}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

testStudentsAPI();
