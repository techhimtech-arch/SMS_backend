const asyncHandler = require('express-async-handler');
const Class = require('../models/Class');
const Section = require('../models/Section');
const Subject = require('../models/Subject');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const logger = require('../utils/logger');
const { sendSuccess, sendError } = require('../utils/response');
const { authorizePermissions } = require('../middlewares/roleAuthorization');
const { PERMISSIONS } = require('../utils/rbac');

/**
 * @desc    Get academic summary for dashboard
 * @route    GET /api/v1/academic/summary
 * @access   Private/School Admin
 */
const getAcademicSummary = asyncHandler(async (req, res) => {
  try {
    const { academicSessionId } = req.query;

    if (!academicSessionId) {
      return sendError(res, 400, 'Academic session ID is required');
    }

    const schoolId = req.user.schoolId;

    // Get total counts in parallel
    const [
      totalClasses,
      totalSections,
      totalSubjects,
      totalEnrollments,
      totalTeachers,
      enrollmentStats
    ] = await Promise.all([
      // Total classes
      Class.countDocuments({
        schoolId,
        academicSessionId,
        isDeleted: { $ne: true }
      }),

      // Total sections
      Section.countDocuments({
        schoolId,
        academicSessionId,
        isDeleted: { $ne: true }
      }),

      // Total subjects
      Subject.countDocuments({
        schoolId,
        academicSessionId,
        isDeleted: { $ne: true }
      }),

      // Total enrollments
      Enrollment.countDocuments({
        schoolId,
        academicSessionId,
        status: 'ENROLLED',
        isDeleted: { $ne: true }
      }),

      // Total teachers assigned to subjects
      User.countDocuments({
        schoolId,
        role: { $in: ['teacher', 'school_admin'] },
        isActive: true,
        isDeleted: { $ne: true }
      }),

      // Enrollment statistics
      Enrollment.getEnrollmentStats(academicSessionId, schoolId)
    ]);

    // Get class-wise distribution
    const classWiseStats = await Class.aggregate([
      {
        $match: {
          schoolId,
          academicSessionId,
          isDeleted: { $ne: true }
        }
      },
      {
        $lookup: {
          from: 'sections',
          localField: '_id',
          foreignField: 'classId',
          as: 'sections'
        }
      },
      {
        $lookup: {
          from: 'enrollments',
          localField: '_id',
          foreignField: 'classId',
          as: 'enrollments'
        }
      },
      {
        $project: {
          name: 1,
          totalSections: { $size: '$sections' },
          totalEnrollments: {
            $size: {
              $filter: {
                input: '$enrollments',
                cond: { 
                  $eq: ['$$academicSessionId', academicSessionId],
                  $eq: ['$$status', 'ENROLLED'],
                  $eq: ['$$isDeleted', { $ne: true }]
                }
              }
            }
          },
          activeStudents: {
            $size: {
              $filter: {
                input: '$enrollments',
                cond: { 
                  $eq: ['$$academicSessionId', academicSessionId],
                  $eq: ['$$status', 'ENROLLED'],
                  $eq: ['$$isDeleted', { $ne: true }]
                }
              }
            }
          }
        }
      },
      {
        $sort: { name: 1 }
      }
    ]);

    // Get subject distribution by department
    const subjectDistribution = await Subject.aggregate([
      {
        $match: {
          schoolId,
          academicSessionId,
          isDeleted: { $ne: true }
        }
      },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          subjects: {
            $push: {
              name: '$name',
              code: '$code',
              credits: '$credits'
            }
          }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get teacher workload summary
    const teacherWorkload = await Enrollment.aggregate([
      {
        $match: {
          schoolId,
          academicSessionId,
          status: 'ENROLLED',
          isDeleted: { $ne: true }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'classTeacherId',
          foreignField: '_id',
          as: 'teacher'
        }
      },
      {
        $group: {
          _id: '$classTeacherId',
          teacherName: { $first: '$teacher.name' },
          teacherEmail: { $first: '$teacher.email' },
          totalClasses: { $addToSet: '$classId' },
          totalStudents: { $sum: 1 }
        }
      },
      {
        $sort: { totalStudents: -1 }
      },
      {
        $limit: 10
      }
    ]);

    const summary = {
      overview: {
        totalClasses,
        totalSections,
        totalSubjects,
        totalEnrollments,
        totalTeachers,
        enrollmentStatusBreakdown: enrollmentStats
      },
      classWiseStats,
      subjectDistribution,
      topTeachers: teacherWorkload,
      sessionInfo: {
        academicSessionId,
        generatedAt: new Date()
      }
    };

    logger.info('Academic summary retrieved successfully', {
      academicSessionId,
      schoolId,
      userId: req.user.userId
    });

    return sendSuccess(res, 200, 'Academic summary retrieved successfully', summary);

  } catch (error) {
    logger.error('Failed to get academic summary', {
      error: error.message,
      academicSessionId: req.query.academicSessionId,
      userId: req.user.userId,
      schoolId: req.user.schoolId
    });

    return sendError(res, 500, 'Failed to get academic summary');
  }
});

/**
 * @desc    Get class-wise detailed statistics
 * @route    GET /api/v1/academic/class-stats/:classId
 * @access   Private/School Admin
 */
const getClassStats = asyncHandler(async (req, res) => {
  try {
    const { classId } = req.params;
    const { academicSessionId } = req.query;

    if (!academicSessionId) {
      return sendError(res, 400, 'Academic session ID is required');
    }

    // Get detailed class statistics
    const classStats = await Class.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(classId),
          schoolId: req.user.schoolId,
          isDeleted: { $ne: true }
        }
      },
      {
        $lookup: {
          from: 'sections',
          localField: '_id',
          foreignField: 'classId',
          as: 'sections'
        }
      },
      {
        $lookup: {
          from: 'subjects',
          localField: '_id',
          foreignField: 'classId',
          as: 'subjects'
        }
      },
      {
        $lookup: {
          from: 'enrollments',
          localField: '_id',
          foreignField: 'classId',
          as: 'enrollments'
        }
      },
      {
        $project: {
          name: 1,
          totalSections: { $size: '$sections' },
          totalSubjects: { $size: '$subjects' },
          totalEnrollments: {
            $size: {
              $filter: {
                input: '$enrollments',
                cond: { 
                  $eq: ['$$academicSessionId', new mongoose.Types.ObjectId(academicSessionId)],
                  $eq: ['$$status', 'ENROLLED'],
                  $eq: ['$$isDeleted', { $ne: true }]
                }
              }
            }
          },
          maleStudents: {
            $size: {
              $filter: {
                input: '$enrollments',
                cond: { 
                  $eq: ['$$academicSessionId', new mongoose.Types.ObjectId(academicSessionId)],
                  $eq: ['$$status', 'ENROLLED'],
                  $eq: ['$$isDeleted', { $ne: true }],
                  $eq: ['$$studentId.gender', 'Male']
                }
              }
            }
          },
          femaleStudents: {
            $size: {
              $filter: {
                input: '$enrollments',
                cond: { 
                  $eq: ['$$academicSessionId', new mongoose.Types.ObjectId(academicSessionId)],
                  $eq: ['$$status', 'ENROLLED'],
                  $eq: ['$$isDeleted', { $ne: true }],
                  $eq: ['$$studentId.gender', 'Female']
                }
              }
            }
        }
      }
    ]);

    if (!classStats || classStats.length === 0) {
      return sendError(res, 404, 'Class not found');
    }

    const stats = classStats[0];

    return sendSuccess(res, 200, 'Class statistics retrieved successfully', stats);

  } catch (error) {
    logger.error('Failed to get class statistics', {
      error: error.message,
      classId: req.params.classId,
      academicSessionId: req.query.academicSessionId,
      userId: req.user.userId
    });

    return sendError(res, 500, 'Failed to get class statistics');
  }
});

/**
 * @desc    Get enrollment trends
 * @route    GET /api/v1/academic/enrollment-trends
 * @access   Private/School Admin
 */
const getEnrollmentTrends = asyncHandler(async (req, res) => {
  try {
    const { academicSessionId, years = 3 } = req.query;

    if (!academicSessionId) {
      return sendError(res, 400, 'Academic session ID is required');
    }

    // Get enrollment trends over multiple years
    const trends = await Enrollment.aggregate([
      {
        $match: {
          schoolId: req.user.schoolId,
          isDeleted: { $ne: true }
        }
      },
      {
        $lookup: {
          from: 'academicyears',
          localField: 'academicYearId',
          foreignField: '_id',
          as: 'academicYear'
        }
      },
      {
        $group: {
          _id: '$academicYear.year',
          totalEnrollments: {
            $sum: {
              $cond: {
                if: { $eq: ['$$status', 'ENROLLED'] },
                then: 1,
                else: 0
              }
            }
          },
          newEnrollments: {
            $sum: {
              $cond: {
                if: { 
                  $and: [
                    { $eq: ['$$status', 'ENROLLED'] },
                    { $gte: ['$$enrollmentDate', new Date(new Date().getFullYear() - 1, 0, 1)] }
                  ]
                },
                then: 1,
                else: 0
              }
            }
          },
          promotedStudents: {
            $sum: {
              $cond: {
                if: { $eq: ['$$status', 'PROMOTED'] },
                then: 1,
                else: 0
              }
            }
          },
          droppedStudents: {
            $sum: {
              $cond: {
                if: { $eq: ['$$status', 'DROPPED_OUT'] },
                then: 1,
                else: 0
              }
            }
          }
        }
      },
      {
        $sort: { '_id': -1 }
      },
      {
        $limit: parseInt(years)
      }
    ]);

    return sendSuccess(res, 200, 'Enrollment trends retrieved successfully', trends);

  } catch (error) {
    logger.error('Failed to get enrollment trends', {
      error: error.message,
      userId: req.user.userId,
      schoolId: req.user.schoolId
    });

    return sendError(res, 500, 'Failed to get enrollment trends');
  }
});

module.exports = {
  getAcademicSummary: [
    authorizePermissions([PERMISSIONS.REPORT_READ]),
    getAcademicSummary
  ],
  getClassStats: [
    authorizePermissions([PERMISSIONS.REPORT_READ]),
    getClassStats
  ],
  getEnrollmentTrends: [
    authorizePermissions([PERMISSIONS.REPORT_READ]),
    getEnrollmentTrends
  ]
};
