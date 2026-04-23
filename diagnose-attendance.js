const mongoose = require('mongoose');
require('dotenv').config();

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sms';

async function diagnoseAttendance() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB Connected\n');

    const StudentProfile = require('./src/models/StudentProfile');
    const Attendance = require('./src/models/Attendance');
    const Enrollment = require('./src/models/Enrollment');
    const User = require('./src/models/User');

    // Get the student from the response
    const studentId = '69ccd8a39d6620cd255635dc';
    
    console.log('🔍 Searching for student...\n');
    const student = await StudentProfile.findById(studentId);
    
    if (!student) {
      console.log('❌ Student not found with ID:', studentId);
      process.exit(1);
    }

    console.log('✅ Student Found:');
    console.log(`   Name: ${student.firstName} ${student.lastName}`);
    console.log(`   StudentProfile._id: ${student._id}`);
    console.log(`   userId: ${student.userId}`);
    console.log(`   schoolId: ${student.schoolId}\n`);

    // Get enrollment
    console.log('🔍 Searching for enrollment...\n');
    const enrollment = await Enrollment.findOne({
      studentId: student._id,
      schoolId: student.schoolId
    }).populate('classId', 'name');

    if (!enrollment) {
      console.log('❌ No enrollment found for this student');
    } else {
      console.log('✅ Enrollment Found:');
      console.log(`   Enrollment._id: ${enrollment._id}`);
      console.log(`   Class: ${enrollment.classId?.name}`);
      console.log(`   Status: ${enrollment.status}\n`);
    }

    // Check TODAY's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    console.log('🔍 Searching for TODAY\'s attendance...\n');
    console.log(`   Date range: ${today.toISOString()} to ${tomorrow.toISOString()}\n`);

    // Try different query combinations
    const queries = [
      {
        label: 'Query 1: studentId only',
        query: {
          studentId: student._id,
          date: { $gte: today, $lt: tomorrow }
        }
      },
      {
        label: 'Query 2: enrollmentId (student._id)',
        query: {
          enrollmentId: student._id,
          date: { $gte: today, $lt: tomorrow }
        }
      },
      {
        label: 'Query 3: enrollmentId (enrollment._id)',
        query: enrollment ? {
          enrollmentId: enrollment._id,
          date: { $gte: today, $lt: tomorrow }
        } : null
      },
      {
        label: 'Query 4: Any attendance for today',
        query: {
          date: { $gte: today, $lt: tomorrow }
        }
      }
    ];

    for (const { label, query } of queries) {
      if (!query) continue;
      
      const count = await Attendance.countDocuments(query);
      const records = await Attendance.find(query).limit(1);
      
      console.log(`${label}`);
      console.log(`   Found: ${count} records`);
      if (records.length > 0) {
        console.log(`   Sample: studentId=${records[0].studentId}, enrollmentId=${records[0].enrollmentId}, status=${records[0].status}`);
      }
      console.log('');
    }

    // Check THIS MONTH's attendance
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const monthEnd = new Date();

    console.log('\n🔍 Searching for THIS MONTH\'s attendance...\n');
    console.log(`   Date range: ${monthStart.toISOString()} to ${monthEnd.toISOString()}\n`);

    const monthQueries = [
      {
        label: 'studentId + month range',
        query: {
          studentId: student._id,
          date: { $gte: monthStart, $lte: monthEnd }
        }
      },
      {
        label: 'enrollmentId (student._id) + month range',
        query: {
          enrollmentId: student._id,
          date: { $gte: monthStart, $lte: monthEnd }
        }
      },
      {
        label: 'enrollmentId (enrollment._id) + month range',
        query: enrollment ? {
          enrollmentId: enrollment._id,
          date: { $gte: monthStart, $lte: monthEnd }
        } : null
      }
    ];

    for (const { label, query } of monthQueries) {
      if (!query) continue;
      
      const count = await Attendance.countDocuments(query);
      const records = await Attendance.find(query).limit(3);
      
      console.log(`${label}`);
      console.log(`   Found: ${count} records`);
      if (records.length > 0) {
        records.forEach((r, i) => {
          console.log(`   Record ${i+1}: ${r.date.toLocaleDateString()} (${r.status})`);
        });
      }
      console.log('');
    }

    // Show total attendance records for this student
    console.log('\n🔍 Total attendance records in database...\n');
    const totalAll = await Attendance.countDocuments({
      $or: [
        { studentId: student._id },
        { enrollmentId: student._id },
        ...(enrollment ? [{ enrollmentId: enrollment._id }] : [])
      ]
    });

    console.log(`   Total (all queries combined): ${totalAll}\n`);

    if (totalAll === 0) {
      console.log('⚠️  REASON: No attendance records found for this student');
      console.log('   This could mean:');
      console.log('   1. Attendance hasn\'t been marked yet');
      console.log('   2. Mark attendance from the teacher panel first\n');
    }

    // Check if ANY attendance exists in database
    const totalInDB = await Attendance.countDocuments({});
    console.log(`📊 Total attendance records in entire database: ${totalInDB}\n`);

    if (totalInDB === 0) {
      console.log('⚠️  Database is empty - no attendance records exist at all!');
      console.log('   Mark some attendance from the teacher panel first.\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️  MongoDB connection failed');
    console.log('   Make sure MongoDB is running: mongod');
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

diagnoseAttendance();
