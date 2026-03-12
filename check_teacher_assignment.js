/**
 * Check teacher assignment status
 */

require('dotenv').config();
const mongoose = require('mongoose');
const ClassTeacherAssignment = require('./src/models/ClassTeacherAssignment');
const User = require('./src/models/User');

async function checkTeacherAssignment() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sms', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Get all teachers
    const teachers = await User.find({ role: 'teacher' })
      .select('name email schoolId isActive')
      .limit(5);
    
    console.log('\n👨‍🏫 Teachers in database:');
    teachers.forEach((teacher, i) => {
      console.log(`${i+1}. ${teacher.name} (${teacher.email})`);
      console.log(`   School: ${teacher.schoolId} | Active: ${teacher.isActive}`);
      console.log('');
    });

    // Check class teacher assignments
    const assignments = await ClassTeacherAssignment.find({})
      .populate('teacherId', 'name email')
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('schoolId', 'name')
      .limit(10);

    console.log('\n📋 Class Teacher Assignments:');
    if (assignments.length > 0) {
      assignments.forEach((assignment, i) => {
        console.log(`${i+1}. ${assignment.teacherId?.name} → ${assignment.classId?.name} - ${assignment.sectionId?.name}`);
        console.log(`   Academic Year: ${assignment.academicYear}`);
        console.log(`   Active: ${assignment.isActive}`);
        console.log('');
      });
    } else {
      console.log('❌ No class teacher assignments found');
    }

    // Check if you have any assignments (by email)
    const yourEmail = 'teacher@example.com'; // Change this to your teacher email
    const yourAssignments = await ClassTeacherAssignment.find({})
      .populate('teacherId', 'name email')
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .then(assignments => assignments.filter(a => a.teacherId?.email === yourEmail));

    console.log(`\n🔍 Your assignments (${yourEmail}):`);
    if (yourAssignments.length > 0) {
      yourAssignments.forEach((assignment, i) => {
        console.log(`${i+1}. ${assignment.classId?.name} - ${assignment.sectionId?.name}`);
      });
    } else {
      console.log('❌ No assignments found for your email');
      console.log('💡 You need to be assigned as a class teacher first!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkTeacherAssignment();
