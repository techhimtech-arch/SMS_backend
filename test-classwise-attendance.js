const mongoose = require('mongoose');
require('dotenv').config();

const Attendance = require('./src/models/Attendance');
const Student = require('./src/models/Student');

const testAttendanceAnalytics = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get a sample schoolId from database
    const attendance = await Attendance.findOne();
    if (!attendance) {
      console.log('❌ No attendance records found');
      return;
    }

    const schoolId = new mongoose.Types.ObjectId(attendance.schoolId);
    console.log('📍 Using schoolId:', schoolId);

    // Check attendance records
    const attendanceCount = await Attendance.countDocuments({ schoolId });
    console.log('📊 Total attendance records:', attendanceCount);

    // Check if students have classId
    const studentWithClass = await Student.findOne({ _id: { $in: await Attendance.distinct('studentId', { schoolId }) } });
    console.log('👤 Sample student with attendance:', {
      id: studentWithClass._id,
      name: studentWithClass.name,
      classId: studentWithClass.classId
    });

    // Run the aggregation
    const months = 6;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    console.log('\n🔍 Testing classWiseData aggregation...');
    const classWiseData = await Attendance.aggregate([
      {
        $match: {
          schoolId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $lookup: {
          from: 'classes',
          localField: 'student.classId',
          foreignField: '_id',
          as: 'class'
        }
      },
      { $unwind: '$class' },
      {
        $group: {
          _id: '$class._id',
          className: { $first: '$class.name' },
          totalAttendance: { $sum: 1 },
          presentAttendance: {
            $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          className: 1,
          attendancePercentage: {
            $multiply: [
              {
                $divide: ['$presentAttendance', '$totalAttendance']
              },
              100
            ]
          }
        }
      },
      { $sort: { attendancePercentage: -1 } }
    ]);

    console.log('✅ classWiseData result:', JSON.stringify(classWiseData, null, 2));

    // Debug: Check stages
    console.log('\n🔧 Debug stages...');
    
    // Stage 1: Check matched attendance
    const matched = await Attendance.aggregate([
      {
        $match: {
          schoolId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      { $limit: 5 }
    ]);
    console.log('After $match:', matched.length);

    // Stage 2: After student lookup
    const afterStudentLookup = await Attendance.aggregate([
      {
        $match: {
          schoolId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $limit: 5 }
    ]);
    console.log('After student $lookup:', afterStudentLookup.length);
    console.log('Student data sample:', afterStudentLookup[0]?.student?.length);

    // Stage 3: After unwind student
    const afterUnwindStudent = await Attendance.aggregate([
      {
        $match: {
          schoolId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      { $limit: 5 }
    ]);
    console.log('After $unwind student:', afterUnwindStudent.length);
    console.log('Student classId present:', afterUnwindStudent[0]?.student?.classId);

    // Stage 4: After class lookup
    const afterClassLookup = await Attendance.aggregate([
      {
        $match: {
          schoolId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $lookup: {
          from: 'classes',
          localField: 'student.classId',
          foreignField: '_id',
          as: 'class'
        }
      },
      { $limit: 5 }
    ]);
    console.log('After class $lookup:', afterClassLookup.length);
    console.log('Class data sample:', afterClassLookup[0]?.class?.length);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

testAttendanceAnalytics();
