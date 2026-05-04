const mongoose = require('mongoose');
const User = require('./src/models/User');
const Student = require('./src/models/Student');
const StudentProfile = require('./src/models/StudentProfile');

async function checkAdmin11User() {
  try {
    await mongoose.connect('mongodb+srv://techhimtech_db_user:7kWRGlcUpVDFE6uE@cluster0.9uenbsu.mongodb.net/?appName=Cluster0&tls=true');
    
    console.log('=== Checking admin11@abc.com User ===');
    
    // Find the user
    const user = await User.findOne({ email: 'admin11@abc.com' });
    
    if (!user) {
      console.log('❌ User admin11@abc.com not found');
      return;
    }
    
    console.log('✅ User Found:');
    console.log(`- Name: ${user.name}`);
    console.log(`- Email: ${user.email}`);
    console.log(`- Role: ${user.role}`);
    console.log(`- SchoolId: ${user.schoolId}`);
    console.log(`- Active: ${user.isActive}`);
    
    // Check students in this user's school
    console.log('\n=== Students in this School ===');
    const students = await Student.find({ schoolId: user.schoolId, isActive: true });
    const studentProfiles = await StudentProfile.find({ schoolId: user.schoolId, isActive: true });
    
    console.log(`Student model records: ${students.length}`);
    console.log(`StudentProfile model records: ${studentProfiles.length}`);
    
    if (students.length > 0) {
      console.log('\nStudents from Student model:');
      students.forEach((student, i) => {
        console.log(`${i+1}. ${student.admissionNumber}: ${student.firstName} ${student.lastName}`);
      });
    }
    
    if (studentProfiles.length > 0) {
      console.log('\nStudents from StudentProfile model:');
      studentProfiles.forEach((profile, i) => {
        console.log(`${i+1}. ${profile.admissionNumber || 'No admission number'}: ${profile.firstName} ${profile.lastName}`);
        if (profile.currentEnrollment) {
          console.log(`   - Enrolled: Class ${profile.currentEnrollment.classId}, Section ${profile.currentEnrollment.sectionId}`);
        }
      });
    }
    
    // Test the exact query the API would use
    console.log('\n=== Testing API Query ===');
    const query = { 
      schoolId: new mongoose.Types.ObjectId(user.schoolId),
      isActive: true 
    };
    
    const count = await Student.countDocuments(query);
    console.log(`API query would return ${count} students`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

checkAdmin11User();
