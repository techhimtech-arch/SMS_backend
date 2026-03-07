const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const Enrollment = require('../models/Enrollment');
const logger = require('../utils/logger');

class EnrollmentAttendanceService {
  /**
   * Get all enrollments for attendance marking
   */
  async getEnrollmentsForAttendance(academicYearId, classId, sectionId, schoolId) {
    try {
      const enrollments = await Enrollment.find({
        academicYearId,
        classId,
        sectionId,
        schoolId,
        status: 'enrolled'
      })
      .populate('studentId', 'firstName lastName admissionNumber')
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .sort({ rollNumber: 1 });

      return {
        success: true,
        data: enrollments
      };
    } catch (error) {
      logger.error('Failed to get enrollments for attendance', {
        error: error.message,
        academicYearId,
        classId,
        sectionId,
        schoolId
      });
      
      return {
        success: false,
        message: 'Failed to get enrollments for attendance',
        error: error.message
      };
    }
  }

  /**
   * Mark attendance for multiple students (enrollment-based)
   */
  async markAttendance(attendanceData, markedBy, schoolId) {
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        const { academicYearId, classId, sectionId, date, attendanceRecords } = attendanceData;
        
        // Validate date format
        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0); // Set to start of day
        
        // Get existing attendance for this date/class/section
        const existingAttendance = await Attendance.find({
          academicYearId,
          classId,
          sectionId,
          date: attendanceDate,
          schoolId
        }).session(session);

        const existingAttendanceMap = new Map();
        existingAttendance.forEach(record => {
          existingAttendanceMap.set(record.enrollmentId.toString(), record);
        });

        const attendanceOperations = [];
        const updatedRecords = [];

        for (const record of attendanceRecords) {
          const { enrollmentId, status } = record;
          
          // Validate status
          if (!['Present', 'Absent', 'Leave', 'Late'].includes(status)) {
            throw new Error(`Invalid status: ${status}. Must be Present, Absent, Leave, or Late`);
          }

          const existingRecord = existingAttendanceMap.get(enrollmentId);
          
          if (existingRecord) {
            // Update existing attendance
            existingRecord.status = status;
            existingRecord.markedBy = markedBy;
            attendanceOperations.push({
              updateOne: {
                filter: { _id: existingRecord._id },
                update: { 
                  status, 
                  markedBy,
                  updatedAt: new Date()
                }
              }
            });
            updatedRecords.push({
              ...existingRecord.toObject(),
              status,
              markedBy
            });
          } else {
            // Create new attendance record
            attendanceOperations.push({
              insertOne: {
                document: {
                  enrollmentId,
                  studentId: record.studentId, // Keep for backward compatibility
                  classId,
                  sectionId,
                  academicYearId,
                  schoolId,
                  date: attendanceDate,
                  status,
                  markedBy,
                  attendanceType: 'daily'
                }
              }
            });
            updatedRecords.push({
              enrollmentId,
              studentId: record.studentId,
              classId,
              sectionId,
              academicYearId,
              schoolId,
              date: attendanceDate,
              status,
              markedBy,
              attendanceType: 'daily'
            });
          }
        }

        // Execute bulk operations
        if (attendanceOperations.length > 0) {
          await Attendance.bulkWrite(attendanceOperations, { session });
        }

        logger.info('Attendance marked successfully', {
          academicYearId,
          classId,
          sectionId,
          date: attendanceDate,
          totalRecords: attendanceOperations.length,
          markedBy,
          schoolId
        });

        return {
          success: true,
          message: 'Attendance marked successfully',
          data: updatedRecords,
          totalMarked: attendanceOperations.length
        };
      });

    } catch (error) {
      logger.error('Failed to mark attendance', {
        error: error.message,
        attendanceData,
        markedBy,
        schoolId
      });
      
      await session.abortTransaction();
      
      return {
        success: false,
        message: 'Failed to mark attendance',
        error: error.message
      };
    } finally {
      await session.endSession();
    }
  }

  /**
   * Get attendance report by enrollment
   */
  async getAttendanceByEnrollment(enrollmentId, schoolId, startDate, endDate) {
    try {
      const query = {
        enrollmentId,
        schoolId
      };

      if (startDate && endDate) {
        query.date = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const attendance = await Attendance.find(query)
        .populate('markedBy', 'name')
        .sort({ date: 1 });

      // Calculate attendance statistics
      const totalDays = attendance.length;
      const presentDays = attendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
      const absentDays = attendance.filter(a => a.status === 'Absent').length;
      const leaveDays = attendance.filter(a => a.status === 'Leave').length;
      const lateDays = attendance.filter(a => a.status === 'Late').length;

      const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;

      return {
        success: true,
        data: {
          attendance,
          statistics: {
            totalDays,
            presentDays,
            absentDays,
            leaveDays,
            lateDays,
            attendancePercentage: parseFloat(attendancePercentage)
          }
        }
      };

    } catch (error) {
      logger.error('Failed to get attendance by enrollment', {
        error: error.message,
        enrollmentId,
        schoolId,
        startDate,
        endDate
      });
      
      return {
        success: false,
        message: 'Failed to get attendance',
        error: error.message
      };
    }
  }

  /**
   * Get class attendance summary
   */
  async getClassAttendanceSummary(academicYearId, classId, sectionId, schoolId, date) {
    try {
      const attendanceDate = new Date(date);
      attendanceDate.setHours(0, 0, 0, 0);

      const attendance = await Attendance.find({
        academicYearId,
        classId,
        sectionId,
        date: attendanceDate,
        schoolId
      })
      .populate({
        path: 'enrollmentId',
        populate: [
          { path: 'studentId', select: 'firstName lastName admissionNumber' }
        ]
      })
      .populate('markedBy', 'name')
      .sort({ 'enrollmentId.rollNumber': 1 });

      const summary = {
        totalStudents: attendance.length,
        present: attendance.filter(a => a.status === 'Present').length,
        absent: attendance.filter(a => a.status === 'Absent').length,
        leave: attendance.filter(a => a.status === 'Leave').length,
        late: attendance.filter(a => a.status === 'Late').length,
        attendanceDate: attendanceDate,
        attendance
      };

      return {
        success: true,
        data: summary
      };

    } catch (error) {
      logger.error('Failed to get class attendance summary', {
        error: error.message,
        academicYearId,
        classId,
        sectionId,
        schoolId,
        date
      });
      
      return {
        success: false,
        message: 'Failed to get class attendance summary',
        error: error.message
      };
    }
  }

  /**
   * Get attendance statistics for a class over a period
   */
  async getClassAttendanceStatistics(academicYearId, classId, sectionId, schoolId, startDate, endDate) {
    try {
      const matchStage = {
        academicYearId,
        classId,
        sectionId,
        schoolId,
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };

      const statistics = await Attendance.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalDays: { $addToSet: '$date' },
            totalAttendanceRecords: { $sum: 1 },
            presentCount: {
              $sum: { $cond: [{ $in: ['$status', ['Present', 'Late']] }, 1, 0] }
            },
            absentCount: {
              $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] }
            },
            leaveCount: {
              $sum: { $cond: [{ $eq: ['$status', 'Leave'] }, 1, 0] }
            },
            lateCount: {
              $sum: { $cond: [{ $eq: ['$status', 'Late'] }, 1, 0] }
            }
          }
        },
        {
          $project: {
            _id: 0,
            totalWorkingDays: { $size: '$totalDays' },
            totalAttendanceRecords: 1,
            presentCount: 1,
            absentCount: 1,
            leaveCount: 1,
            lateCount: 1,
            attendancePercentage: {
              $multiply: [
                { $divide: ['$presentCount', '$totalAttendanceRecords'] },
                100
              ]
            }
          }
        }
      ]);

      return {
        success: true,
        data: statistics[0] || {
          totalWorkingDays: 0,
          totalAttendanceRecords: 0,
          presentCount: 0,
          absentCount: 0,
          leaveCount: 0,
          lateCount: 0,
          attendancePercentage: 0
        }
      };

    } catch (error) {
      logger.error('Failed to get class attendance statistics', {
        error: error.message,
        academicYearId,
        classId,
        sectionId,
        schoolId,
        startDate,
        endDate
      });
      
      return {
        success: false,
        message: 'Failed to get class attendance statistics',
        error: error.message
      };
    }
  }
}

module.exports = new EnrollmentAttendanceService();
