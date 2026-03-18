const mongoose = require('mongoose');
const { addSoftDeleteFilter } = require('../utils/softDelete');

const teacherSubjectAssignmentSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: true,
    },
    academicSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: true,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    role: {
      type: String,
      enum: ['PRIMARY_TEACHER', 'ASSISTANT_TEACHER', 'SUBSTITUTE_TEACHER'],
      default: 'PRIMARY_TEACHER'
    },
    assignedDate: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    
    // Audit fields
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    
    // Soft delete fields
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  },
  {
    timestamps: true,
  }
);

// Indexes for performance and uniqueness
teacherSubjectAssignmentSchema.index({ 
  teacherId: 1, 
  subjectId: 1, 
  classId: 1, 
  sectionId: 1, 
  academicSessionId: 1, 
  schoolId: 1 
}, { unique: true });

// Performance indexes
teacherSubjectAssignmentSchema.index({ schoolId: 1, isActive: 1 });
teacherSubjectAssignmentSchema.index({ schoolId: 1, isDeleted: 1 });
teacherSubjectAssignmentSchema.index({ academicSessionId: 1, schoolId: 1 });
teacherSubjectAssignmentSchema.index({ teacherId: 1, academicSessionId: 1, isActive: 1 });
teacherSubjectAssignmentSchema.index({ classId: 1, sectionId: 1, academicSessionId: 1, isActive: 1 });
teacherSubjectAssignmentSchema.index({ subjectId: 1, academicSessionId: 1, isActive: 1 });
teacherSubjectAssignmentSchema.index({ createdBy: 1 });

// Apply soft delete filter
addSoftDeleteFilter(teacherSubjectAssignmentSchema);

// Static methods for common queries
teacherSubjectAssignmentSchema.statics.findByTeacher = function(teacherId, academicSessionId, schoolId) {
  return this.find({
    teacherId,
    academicSessionId,
    schoolId,
    isActive: true,
    isDeleted: { $ne: true }
  }).populate([
    { path: 'subjectId', select: 'name code department credits' },
    { path: 'classId', select: 'name' },
    { path: 'sectionId', select: 'name' }
  ]);
};

teacherSubjectAssignmentSchema.statics.findBySubject = function(subjectId, academicSessionId, schoolId) {
  return this.find({
    subjectId,
    academicSessionId,
    schoolId,
    isActive: true,
    isDeleted: { $ne: true }
  }).populate([
    { path: 'teacherId', select: 'name email' },
    { path: 'classId', select: 'name' },
    { path: 'sectionId', select: 'name' }
  ]);
};

teacherSubjectAssignmentSchema.statics.findByClassSection = function(classId, sectionId, academicSessionId, schoolId) {
  return this.find({
    classId,
    sectionId,
    academicSessionId,
    schoolId,
    isActive: true,
    isDeleted: { $ne: true }
  }).populate([
    { path: 'teacherId', select: 'name email' },
    { path: 'subjectId', select: 'name code department' }
  ]);
};

teacherSubjectAssignmentSchema.statics.getTeacherWorkload = function(teacherId, academicSessionId, schoolId) {
  return this.aggregate([
    {
      $match: {
        teacherId: new mongoose.Types.ObjectId(teacherId),
        academicSessionId: new mongoose.Types.ObjectId(academicSessionId),
        schoolId: new mongoose.Types.ObjectId(schoolId),
        isActive: true,
        isDeleted: { $ne: true }
      }
    },
    {
      $lookup: {
        from: 'subjects',
        localField: 'subjectId',
        foreignField: '_id',
        as: 'subject'
      }
    },
    {
      $lookup: {
        from: 'classes',
        localField: 'classId',
        foreignField: '_id',
        as: 'class'
      }
    },
    {
      $lookup: {
        from: 'sections',
        localField: 'sectionId',
        foreignField: '_id',
        as: 'section'
      }
    },
    {
      $group: {
        _id: '$teacherId',
        totalSubjects: { $sum: 1 },
        totalCredits: { $sum: '$subject.credits' },
        totalWeeklyHours: { $sum: '$subject.weeklyHours' },
        primaryAssignments: {
          $sum: {
            $cond: [{ $eq: ['$role', 'PRIMARY_TEACHER'] }, 1, 0]
          }
        },
        assignments: {
          $push: {
            subject: '$subject.name',
            subjectCode: '$subject.code',
            className: '$class.name',
            sectionName: '$section.name',
            role: '$role',
            credits: '$subject.credits',
            weeklyHours: '$subject.weeklyHours'
          }
        }
      }
    }
  ]);
};

// Instance methods
teacherSubjectAssignmentSchema.methods.deactivate = function(userId) {
  this.isActive = false;
  this.updatedBy = userId;
  return this.save();
};

module.exports = mongoose.model('TeacherSubjectAssignment', teacherSubjectAssignmentSchema);
