// scripts/enrollStudentToClass.js
// Purpose: Student ko enrollment record se link karna

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
const User = require('../src/models/User');
const StudentProfile = require('../src/models/StudentProfile');
const Enrollment = require('../src/models/Enrollment');
const Class = require('../src/models/Class');
const Section = require('../src/models/Section');
const AcademicYear = require('../src/models/AcademicYear');
const School = require('../src/models/School');

const enrollStudent = async () => {
  try {
    console.log('🔄 Enrollment script started...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sms_dev');
    console.log('✅ Database connected\n');

    // **CHANGE THESE VALUES FOR YOUR STUDENT:**
    const USER_ID = '69ccd8a39d6620cd255635dc'; // Student user ID (from logs)
    const CLASS_NAME = 'Class 5'; // Jinsi class mein enroll karna hai
    const SECTION_NAME = 'A'; // Section
    const ROLL_NUMBER = '1'; // Roll number

    console.log(`📝 Enrolling student with User ID: ${USER_ID}`);
    console.log(`   Class: ${CLASS_NAME}, Section: ${SECTION_NAME}\n`);

    // Step 1: Check if user exists
    const user = await User.findById(USER_ID);
    if (!user) {
      console.log(`❌ User not found with ID: ${USER_ID}`);
      process.exit(1);
    }
    console.log(`✅ User found: ${user.firstName} ${user.lastName}`);
    console.log(`   School ID: ${user.schoolId}\n`);

    // Step 2: Get school ID from user
    const schoolId = user.schoolId;

    // Step 3: Check if StudentProfile exists
    let studentProfile = await StudentProfile.findOne({
      userId: USER_ID,
      schoolId
    });

    if (!studentProfile) {
      console.log(`❌ Student profile not found for this user`);
      process.exit(1);
    }
    console.log(`✅ Student profile found: ${studentProfile.firstName} ${studentProfile.lastName}`);
    console.log(`   Admission #: ${studentProfile.admissionNumber}\n`);

    // Step 4: Get current Academic Year
    const currentAcademicYear = await AcademicYear.findOne({
      schoolId,
      isActive: true,
      isCurrent: true
    });

    if (!currentAcademicYear) {
      console.log(`❌ No active academic year found!`);
      console.log(`   Please set up academic year first`);
      process.exit(1);
    }
    console.log(`✅ Academic Year: ${currentAcademicYear.name}`);
    console.log(`   Duration: ${currentAcademicYear.startDate.toLocaleDateString()} - ${currentAcademicYear.endDate.toLocaleDateString()}\n`);

    // Step 5: Find Class
    const classRecord = await Class.findOne({
      name: CLASS_NAME,
      schoolId,
      isActive: true
    });

    if (!classRecord) {
      console.log(`❌ Class not found: ${CLASS_NAME}`);
      const allClasses = await Class.find({ schoolId, isActive: true }).select('name');
      console.log(`\n   Available classes:`);
      allClasses.forEach(c => console.log(`   - ${c.name}`));
      process.exit(1);
    }
    console.log(`✅ Class found: ${classRecord.name}\n`);

    // Step 6: Find Section
    const sectionRecord = await Section.findOne({
      name: SECTION_NAME,
      classId: classRecord._id,
      schoolId,
      isActive: true
    });

    if (!sectionRecord) {
      console.log(`❌ Section not found: ${SECTION_NAME}`);
      const allSections = await Section.find({ classId: classRecord._id, isActive: true }).select('name');
      console.log(`\n   Available sections for ${classRecord.name}:`);
      allSections.forEach(s => console.log(`   - ${s.name}`));
      process.exit(1);
    }
    console.log(`✅ Section found: ${sectionRecord.name}\n`);

    // Step 7: Check if enrollment already exists
    const existingEnrollment = await Enrollment.findOne({
      studentId: studentProfile._id,
      academicYearId: currentAcademicYear._id,
      classId: classRecord._id,
      sectionId: sectionRecord._id,
      schoolId
    });

    if (existingEnrollment) {
      console.log(`⚠️  Student already enrolled!`);
      console.log(`   Enrollment ID: ${existingEnrollment._id}`);
      console.log(`   Status: ${existingEnrollment.status}`);
      console.log(`   Enrollment Date: ${existingEnrollment.enrollmentDate}`);
      process.exit(0);
    }

    // Step 8: Create enrollment record
    const enrollment = new Enrollment({
      studentId: studentProfile._id,
      academicYearId: currentAcademicYear._id,
      classId: classRecord._id,
      sectionId: sectionRecord._id,
      rollNumber: ROLL_NUMBER,
      status: 'ENROLLED',
      enrollmentDate: new Date(),
      schoolId: schoolId,
      createdBy: USER_ID, // Admin or system user
      academicSummary: {
        totalAttendance: 0,
        presentDays: 0,
        totalFees: 0,
        paidFees: 0,
        averageMarks: 0,
        totalSubjects: 0,
        passedSubjects: 0,
        failedSubjects: 0
      }
    });

    await enrollment.save();

    console.log(`\n✅✅✅ ENROLLMENT SUCCESSFUL! ✅✅✅\n`);
    console.log(`📋 Enrollment Details:`);
    console.log(`   ID: ${enrollment._id}`);
    console.log(`   Student: ${studentProfile.firstName} ${studentProfile.lastName}`);
    console.log(`   Admission #: ${studentProfile.admissionNumber}`);
    console.log(`   Class: ${classRecord.name}`);
    console.log(`   Section: ${sectionRecord.name}`);
    console.log(`   Roll Number: ${ROLL_NUMBER}`);
    console.log(`   Academic Year: ${currentAcademicYear.name}`);
    console.log(`   Status: ${enrollment.status}`);
    console.log(`   Enrollment Date: ${enrollment.enrollmentDate}\n`);

    console.log(`✅ Now student can:`);
    console.log(`   - See dashboard with class & section info`);
    console.log(`   - Access quizzes from teachers`);
    console.log(`   - View attendance records`);
    console.log(`   - Check fee status`);
    console.log(`   - View results and exams\n`);

    process.exit(0);

  } catch (error) {
    console.error('❌ Error occurred:');
    console.error(error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

// Run the script
enrollStudent();
