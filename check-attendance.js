const mongoose = require('mongoose');
require('dotenv').config();

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sms';

mongoose.connect(mongoUri).then(async () => {
  console.log('✅ Connected to MongoDB\n');

  try {
    const StudentProfile = require('./src/models/StudentProfile');
    const Attendance = require('./src/models/Attendance');
    const Enrollment = require('./src/models/Enrollment');

    // Get first student
    const student = await StudentProfile.findOne();
    if (!student) {
      console.log('❌ No students found');
      process.exit(1);
    }

    console.log(`📚 Student: ${student.firstName} ${student.lastName}`);
    console.log(`   StudentProfile ID: ${student._id}`);
    console.log(`   User ID: ${student.userId}\n`);

    // Get student's enrollment
    const enrollment = await Enrollment.findOne({
      studentId: student._id
    }).populate('classId', 'name');

    if (!enrollment) {
      console.log('❌ No enrollment found for this student\n');
    } else {
      console.log(`📍 Enrollment: ${enrollment.classId.name}`);
      console.log(`   Enrollment ID: ${enrollment._id}\n`);
    }

    // Get today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    console.log(`📅 Checking attendance for date range:`);
    console.log(`   From: ${today.toISOString()}`);
    console.log(`   To:   ${tomorrow.toISOString()}\n`);

    const todayAttendance = await Attendance.findOne({
      $or: [
        { studentId: student._id },
        { enrollmentId: student._id },
        ...(enrollment ? [{ enrollmentId: enrollment._id }] : [])
      ],
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    if (todayAttendance) {
      console.log(`✅ Found TODAY's attendance:`);
      console.log(`   Status: ${todayAttendance.status}`);
      console.log(`   Date: ${todayAttendance.date.toISOString()}`);
      console.log(`   Created: ${todayAttendance.createdAt}\n`);
    } else {
      console.log(`⚠️  No attendance marked for today\n`);
    }

    // Get this month's attendance
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const monthEnd = new Date();

    console.log(`📆 Checking entire month's attendance:`);
    console.log(`   From: ${monthStart.toISOString()}`);
    console.log(`   To:   ${monthEnd.toISOString()}\n`);

    const monthAttendance = await Attendance.find({
      $or: [
        { studentId: student._id },
        { enrollmentId: student._id },
        ...(enrollment ? [{ enrollmentId: enrollment._id }] : [])
      ],
      date: {
        $gte: monthStart,
        $lte: monthEnd
      }
    }).sort({ date: 1 });

    console.log(`📊 Total records: ${monthAttendance.length}`);
    if (monthAttendance.length > 0) {
      console.log(`\n   Date Range:`);
      console.log(`   First: ${monthAttendance[0].date.toLocaleDateString()} (${monthAttendance[0].status})`);
      console.log(`   Last:  ${monthAttendance[monthAttendance.length - 1].date.toLocaleDateString()} (${monthAttendance[monthAttendance.length - 1].status})`);
      
      // Count by status
      const counts = {};
      monthAttendance.forEach(a => {
        counts[a.status] = (counts[a.status] || 0) + 1;
      });
      console.log(`\n   Summary:`);
      Object.entries(counts).forEach(([status, count]) => {
        console.log(`   ${status}: ${count}`);
      });
    }

    console.log('\n✅ Diagnostic complete\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}).catch(err => {
  console.error('❌ MongoDB Connection Error:', err.message);
  console.log('\n⚠️  Make sure MongoDB is running:');
  console.log('   Windows: mongod.exe');
  console.log('   Mac/Linux: mongod');
  process.exit(1);
});
