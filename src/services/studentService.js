const Student = require('../models/Student');
const Class = require('../models/Class');
const Section = require('../models/Section');
const ClassTeacherAssignment = require('../models/ClassTeacherAssignment');
const mongoose = require('mongoose');
const logger = require('../utils/logger');
const emailService = require('./emailService');
const StudentProfile = require('../models/StudentProfile');
const Attendance = require('../models/Attendance');
const ExamResult = require('../models/ExamResult');
const Fee = require('../models/Fee');
const StudyMaterial = require('../models/StudyMaterial');
const Assignment = require('../models/Assignment');
const Announcement = require('../models/Announcement');
const Timetable = require('../models/Timetable');
const Certificate = require('../models/Certificate');

class StudentService {
  /**
   * Create a new student
   */
  async createStudent(studentData, schoolId, userInfo = {}) {
    const { role, userId } = userInfo;

    // If teacher, verify they are class teacher of this section
    if (role === 'teacher') {
      const classTeacherAssignment = await ClassTeacherAssignment.findOne({
        teacherId: userId,
        classId: studentData.classId,
        sectionId: studentData.sectionId,
        schoolId,
        isActive: true
      });

      if (!classTeacherAssignment) {
        throw { 
          status: 403, 
          message: 'You can only add students to sections where you are the class teacher' 
        };
      }
    }

    // Verify class exists and belongs to school
    const classExists = await Class.findOne({ 
      _id: studentData.classId, 
      schoolId, 
      isActive: true 
    });
    if (!classExists) {
      throw { status: 404, message: 'Class not found' };
    }

    // Verify section exists and belongs to school
    const sectionExists = await Section.findOne({ 
      _id: studentData.sectionId, 
      schoolId, 
      isActive: true 
    });
    if (!sectionExists) {
      throw { status: 404, message: 'Section not found' };
    }

    // Check duplicate admission number
    const existingStudent = await Student.findOne({
      admissionNumber: studentData.admissionNumber,
      schoolId,
      isActive: true
    });
    if (existingStudent) {
      throw { status: 400, message: 'Admission number already exists' };
    }

    const student = await Student.create({
      ...studentData,
      schoolId,
      createdBy: userId,
    });

    // Send admission confirmation email (async - don't wait)
    if (studentData.parentEmail) {
      emailService.sendAdmissionConfirmation(student, studentData.parentEmail).catch(err => {
        logger.error('Failed to send admission email', { error: err.message });
      });
    }

    return student;
  }

  /**
   * Get all students with pagination and filters
   */
  async getStudents(schoolId, options = {}) {
    const { page = 1, limit = 10, role, userId, classId, sectionId, search } = options;

    const skip = (Math.max(1, page) - 1) * Math.min(100, Math.max(1, limit));
    const limitNum = Math.min(100, Math.max(1, limit));

    // Build query
    let query = { 
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isActive: true 
    };

    // Parent data isolation - only see their own children
    if (role === 'parent') {
      query.parentUserId = new mongoose.Types.ObjectId(userId);
    }

    // Teacher data isolation - only see their class teacher assigned sections
    if (role === 'teacher') {
      const classTeacherAssignments = await ClassTeacherAssignment.find({
        teacherId: userId,
        schoolId,
        isActive: true
      });

      if (classTeacherAssignments.length > 0) {
        // Teacher can see students from sections where they are class teacher
        const sectionConditions = classTeacherAssignments.map(a => ({
          classId: a.classId,
          sectionId: a.sectionId
        }));
        query.$or = sectionConditions;
      } else {
        // Teacher is not class teacher of any section - show no students
        return {
          students: [],
          pagination: { total: 0, page: 1, totalPages: 0, limit: limitNum }
        };
      }
    }

    // Optional filters (for admin or further filtering)
    if (classId && role !== 'teacher') query.classId = new mongoose.Types.ObjectId(classId);
    if (sectionId && role !== 'teacher') query.sectionId = new mongoose.Types.ObjectId(sectionId);
    
    // Search by name or admission number
    if (search) {
      const searchCondition = {
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { admissionNumber: { $regex: search, $options: 'i' } }
        ]
      };
      // Combine with existing query
      if (query.$or) {
        query = { $and: [{ $or: query.$or }, searchCondition] };
        query.$and[0].schoolId = new mongoose.Types.ObjectId(schoolId);
        query.$and[0].isActive = true;
      } else {
        query.$or = searchCondition.$or;
      }
    }

    const [totalCount, students] = await Promise.all([
      Student.countDocuments(query),
      Student.find(query)
        .populate('classId', 'name')
        .populate('sectionId', 'name')
        .populate('parentUserId', 'name email')
        .populate('createdBy', 'name')
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 })
    ]);

    return {
      students,
      pagination: {
        total: totalCount,
        page: Math.max(1, page),
        totalPages: Math.ceil(totalCount / limitNum),
        limit: limitNum
      }
    };
  }

  /**
   * Get student by ID
   */
  async getStudentById(id, schoolId) {
    const student = await Student.findOne({ _id: id, schoolId, isActive: true })
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('parentUserId', 'name email');

    if (!student) {
      throw { status: 404, message: 'Student not found' };
    }

    return student;
  }

  /**
   * Update student
   */
  async updateStudent(id, schoolId, updates) {
    const student = await Student.findOne({ _id: id, schoolId, isActive: true });
    if (!student) {
      throw { status: 404, message: 'Student not found' };
    }

    const allowedUpdates = [
      'firstName', 'lastName', 'gender', 'dateOfBirth',
      'classId', 'sectionId', 'parentName', 'parentPhone',
      'address', 'rollNumber', 'parentEmail'
    ];

    allowedUpdates.forEach((field) => {
      if (updates[field] !== undefined) {
        student[field] = updates[field];
      }
    });

    await student.save();
    return student;
  }

  /**
   * Soft delete student
   */
  async deleteStudent(id, schoolId) {
    const student = await Student.findOne({ _id: id, schoolId, isActive: true });
    if (!student) {
      throw { status: 404, message: 'Student not found' };
    }

    student.isActive = false;
    await student.save();
    
    return { message: 'Student deleted successfully' };
  }

  /**
   * Bulk import students from CSV data
   */
  async bulkImportStudents(studentsData, schoolId) {
    const results = {
      success: [],
      failed: []
    };

    for (const data of studentsData) {
      try {
        // Validate required fields
        if (!data.admissionNumber || !data.firstName || !data.classId || !data.sectionId) {
          throw new Error('Missing required fields: admissionNumber, firstName, classId, sectionId');
        }

        const student = await this.createStudent({
          admissionNumber: data.admissionNumber,
          firstName: data.firstName,
          lastName: data.lastName || '',
          gender: data.gender,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
          classId: data.classId,
          sectionId: data.sectionId,
          parentName: data.parentName,
          parentPhone: data.parentPhone,
          parentEmail: data.parentEmail,
          address: data.address,
          rollNumber: data.rollNumber
        }, schoolId);

        results.success.push({
          admissionNumber: data.admissionNumber,
          studentId: student._id
        });
      } catch (error) {
        results.failed.push({
          admissionNumber: data.admissionNumber || 'Unknown',
          error: error.message || 'Unknown error'
        });
      }
    }

    return results;
  }
}

// Export class instance and utility functions
module.exports = Object.assign(new StudentService(), {
  fetchStudentDashboard: async (user) => {
    const student = await StudentProfile.findOne({ userId: user.userId, schoolId: user.schoolId })
      .populate('currentEnrollment.classId', 'name')
      .populate('currentEnrollment.sectionId', 'name');

    const attendance = await Attendance.find({ studentId: user.userId }).select('date status');
    const upcomingExams = await ExamResult.find({ studentId: user.userId, examDate: { $gte: new Date() } })
      .select('subject examDate totalMarks').limit(5);
    const pendingAssignments = await Assignment.find({ studentId: user.userId, status: { $ne: 'completed' } })
      .select('title deadline subject').limit(5);
    const recentAnnouncements = await Announcement.find({ schoolId: user.schoolId })
      .select('title message createdAt').limit(5).sort({ createdAt: -1 });

    return {
      profile: student,
      attendanceSummary: { total: attendance.length, present: attendance.filter(a => a.status === 'present').length },
      upcomingExams,
      pendingAssignments,
      recentAnnouncements,
    };
  },

  fetchStudentAttendance: async (user) => {
    const attendance = await Attendance.find({ studentId: user.userId })
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('subjectId', 'name')
      .sort({ date: -1 });

    return {
      studentId: user.userId,
      dailyAttendance: attendance,
      monthlySummary: {
        totalDays: attendance.length,
        presentDays: attendance.filter(a => a.status === 'present').length,
        absentDays: attendance.filter(a => a.status === 'absent').length
      }
    };
  },

  fetchStudentExamResults: async (user) => {
    const results = await ExamResult.find({ studentId: user.userId })
      .populate('subjectId', 'name')
      .sort({ examDate: -1 });

    const totalMarks = results.reduce((sum, r) => sum + r.marksObtained, 0);
    const maxMarks = results.reduce((sum, r) => sum + r.totalMarks, 0);

    return {
      studentId: user.userId,
      results,
      overallPerformance: {
        totalMarks: maxMarks,
        marksObtained: totalMarks,
        averagePercentage: maxMarks > 0 ? ((totalMarks / maxMarks) * 100).toFixed(2) : 0
      }
    };
  },

  fetchStudentFeeDetails: async (user) => {
    const fee = await Fee.findOne({ studentId: user.userId });
    return fee || { studentId: user.userId, totalFee: 0, paidAmount: 0, dueAmount: 0, installments: [] };
  },

  fetchStudyMaterials: async (user) => {
    const student = await StudentProfile.findOne({ userId: user.userId });
    const classId = student?.currentEnrollment?.classId;
    if (!classId) return { materials: [] };
    
    const materials = await StudyMaterial.find({ classId })
      .populate('subjectId', 'name')
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });

    return { classId, materials };
  },

  fetchStudentAssignments: async (user) => {
    const assignments = await Assignment.find({ studentId: user.userId })
      .populate('subjectId', 'name')
      .sort({ deadline: 1 });

    return {
      studentId: user.userId,
      pendingAssignments: assignments.filter(a => a.status !== 'completed'),
      submittedAssignments: assignments.filter(a => a.status === 'completed')
    };
  },

  fetchStudentAnnouncements: async (user) => {
    const student = await StudentProfile.findOne({ userId: user.userId });
    const classId = student?.currentEnrollment?.classId;

    const announcements = await Announcement.find({
      $or: [
        { schoolId: user.schoolId },
        classId ? { classId } : { _id: null }
      ]
    }).populate('createdBy', 'name').sort({ createdAt: -1 }).limit(20);

    return { studentId: user.userId, announcements };
  },

  fetchStudentTimetable: async (user) => {
    const student = await StudentProfile.findOne({ userId: user.userId });
    const classId = student?.currentEnrollment?.classId;
    if (!classId) return { dailyTimetable: [] };

    const timetable = await Timetable.findOne({ classId })
      .populate('periods.subjectId', 'name')
      .populate('periods.teacherId', 'name');

    return { classId, dailyTimetable: timetable?.periods || [] };
  },

  fetchStudentCertificates: async (user) => {
    const certificates = await Certificate.find({ studentId: user.userId })
      .sort({ issuedDate: -1 });

    return { studentId: user.userId, certificates };
  }
});
