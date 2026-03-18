const mongoose = require('mongoose');
const { addSoftDeleteFilter } = require('../utils/softDelete');

const enrollmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: true,
    },
    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
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
    rollNumber: {
      type: String,
      required: true,
      trim: true,
      maxlength: [20, 'Roll number cannot exceed 20 characters']
    },
    status: {
      type: String,
      enum: ['ENROLLED', 'PROMOTED', 'TRANSFERRED_OUT', 'COMPLETED', 'DROPPED_OUT'],
      default: 'ENROLLED',
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    promotionDate: {
      type: Date,
    },
    completionDate: {
      type: Date,
    },
    transferDate: {
      type: Date,
    },
    dropDate: {
      type: Date,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    
    // Academic performance summary for this enrollment
    academicSummary: {
      totalAttendance: { type: Number, default: 0 },
      presentDays: { type: Number, default: 0 },
      totalFees: { type: Number, default: 0 },
      paidFees: { type: Number, default: 0 },
      averageMarks: { type: Number, default: 0 },
      grade: { type: String, trim: true },
      rank: { type: Number },
      totalSubjects: { type: Number, default: 0 },
      passedSubjects: { type: Number, default: 0 },
      failedSubjects: { type: Number, default: 0 }
    },
    
    // For tracking class teacher during this enrollment
    classTeacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

// Compound indexes for unique constraints and performance
enrollmentSchema.index({ 
  studentId: 1, 
  academicYearId: 1 
}, { unique: true });

enrollmentSchema.index({ 
  classId: 1, 
  sectionId: 1, 
  academicYearId: 1, 
  rollNumber: 1, 
  schoolId: 1 
}, { unique: true });

enrollmentSchema.index({ 
  schoolId: 1, 
  academicYearId: 1 
});

enrollmentSchema.index({ 
  schoolId: 1, 
  isDeleted: 1 
});

enrollmentSchema.index({ 
  classId: 1, 
  sectionId: 1, 
  academicYearId: 1, 
  status: 1 
});

enrollmentSchema.index({ 
  createdBy: 1 
});

// Apply soft delete filter
addSoftDeleteFilter(enrollmentSchema);

// Static methods for common queries
enrollmentSchema.statics.getCurrentEnrollment = async function(studentId, schoolId) {
  const AcademicYear = mongoose.model('AcademicYear');
  const currentYear = await AcademicYear.getCurrentYear(schoolId);
  
  return this.findOne({
    studentId,
    academicYearId: currentYear._id,
    schoolId,
    status: 'ENROLLED',
    isDeleted: { $ne: true }
  })
  .populate('classId sectionId academicYearId');
};

enrollmentSchema.statics.getEnrollmentHistory = async function(studentId, schoolId) {
  return this.find({
    studentId,
    schoolId,
    isDeleted: { $ne: true }
  })
  .populate('classId sectionId academicYearId')
  .sort({ enrollmentDate: -1 });
};

enrollmentSchema.statics.getClassEnrollments = function(classId, sectionId, academicYearId, schoolId) {
  return this.find({
    classId,
    sectionId,
    academicYearId,
    schoolId,
    status: 'ENROLLED',
    isDeleted: { $ne: true }
  })
  .populate([
    { path: 'studentId', select: 'admissionNumber firstName lastName' },
    { path: 'classTeacherId', select: 'name email' }
  ])
  .sort({ rollNumber: 1 });
};

enrollmentSchema.statics.checkRollNumberUniqueness = function(rollNumber, classId, sectionId, academicYearId, schoolId, excludeId = null) {
  const query = {
    rollNumber,
    classId,
    sectionId,
    academicYearId,
    schoolId,
    isDeleted: { $ne: true }
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return this.findOne(query);
};

enrollmentSchema.statics.getEnrollmentStats = function(academicYearId, schoolId) {
  return this.aggregate([
    {
      $match: {
        academicYearId: new mongoose.Types.ObjectId(academicYearId),
        schoolId: new mongoose.Types.ObjectId(schoolId),
        isDeleted: { $ne: true }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$count' },
        statusBreakdown: {
          $push: {
            status: '$_id',
            count: '$count'
          }
        }
      }
    }
  ]);
};

// Pre-save middleware for consistency checks
enrollmentSchema.pre('save', async function(next) {
  try {
    if (this.isNew) {
      // Check for duplicate roll number in same class/section/session
      const existingEnrollment = await this.constructor.checkRollNumberUniqueness(
        this.rollNumber,
        this.classId,
        this.sectionId,
        this.academicYearId,
        this.schoolId
      );

      if (existingEnrollment) {
        return next(new Error(`Roll number '${this.rollNumber}' already exists in this class and section for this academic session`));
      }

      // Check if student is already enrolled in this academic year
      const currentEnrollment = await this.constructor.getCurrentEnrollment(
        this.studentId,
        this.schoolId
      );

      if (currentEnrollment) {
        return next(new Error(`Student is already enrolled in academic year ${currentEnrollment.academicYearId}`));
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Virtual for checking if enrollment is current
enrollmentSchema.virtual('isCurrent').get(function() {
  return this.status === 'ENROLLED';
});

// Virtual for checking if enrollment is active
enrollmentSchema.virtual('isActive').get(function() {
  return ['ENROLLED', 'PROMOTED'].includes(this.status);
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);
