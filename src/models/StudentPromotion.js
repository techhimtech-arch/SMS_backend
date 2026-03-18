const mongoose = require('mongoose');
const { addSoftDeleteFilter } = require('../utils/softDelete');

const studentPromotionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    fromAcademicSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: true,
    },
    toAcademicSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: true,
    },
    fromClassId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    fromSectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: true,
    },
    toClassId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    toSectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: true,
    },
    fromRollNumber: {
      type: String,
      required: true,
      trim: true
    },
    toRollNumber: {
      type: String,
      required: true,
      trim: true
    },
    promotionDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'],
      default: 'PENDING'
    },
    promotionCriteria: {
      type: String,
      enum: ['AUTOMATIC', 'MANUAL', 'MERIT_BASED', 'ATTENDANCE_BASED'],
      default: 'MANUAL'
    },
    finalGrades: {
      type: String,
      trim: true,
      maxlength: [1000, 'Final grades cannot exceed 1000 characters']
    },
    attendancePercentage: {
      type: Number,
      min: [0, 'Attendance percentage cannot be negative'],
      max: [100, 'Attendance percentage cannot exceed 100']
    },
    behaviorConduct: {
      type: String,
      trim: true,
      maxlength: [500, 'Behavior conduct cannot exceed 500 characters']
    },
    teacherRemarks: {
      type: String,
      trim: true,
      maxlength: [1000, 'Teacher remarks cannot exceed 1000 characters']
    },
    principalApproval: {
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      approvedAt: {
        type: Date
      },
      comments: {
        type: String,
        trim: true,
        maxlength: [500, 'Principal comments cannot exceed 500 characters']
      }
    },
    parentAcknowledgment: {
      acknowledgedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      acknowledgedAt: {
        type: Date
      },
      comments: {
        type: String,
        trim: true,
        maxlength: [500, 'Parent comments cannot exceed 500 characters']
      }
    },
    documents: [{
      type: {
        type: String,
        enum: ['REPORT_CARD', 'TRANSFER_CERTIFICATE', 'CHARACTER_CERTIFICATE', 'PROGRESS_REPORT', 'OTHER']
      },
      filename: {
        type: String,
        required: true
      },
      originalName: {
        type: String,
        required: true
      },
      mimetype: {
        type: String,
        required: true
      },
      size: {
        type: Number,
        required: true
      },
      url: {
        type: String,
        required: true
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
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
studentPromotionSchema.index({ 
  studentId: 1, 
  fromAcademicSessionId: 1, 
  toAcademicSessionId: 1 
}, { unique: true });

studentPromotionSchema.index({ 
  fromClassId: 1, 
  fromSectionId: 1, 
  fromAcademicSessionId: 1 
});

studentPromotionSchema.index({ 
  toClassId: 1, 
  toSectionId: 1, 
  toAcademicSessionId: 1 
});

studentPromotionSchema.index({ 
  schoolId: 1, 
  status: 1 
});

studentPromotionSchema.index({ 
  promotionDate: 1 
});

studentPromotionSchema.index({ 
  createdBy: 1 
});

// Apply soft delete filter
addSoftDeleteFilter(studentPromotionSchema);

// Static methods for common queries
studentPromotionSchema.statics.getStudentPromotionHistory = async function(studentId, schoolId) {
  return this.find({
    studentId,
    schoolId,
    isDeleted: { $ne: true }
  })
  .populate([
    { path: 'fromClassId', select: 'name' },
    { path: 'toClassId', select: 'name' },
    { path: 'fromSectionId', select: 'name' },
    { path: 'toSectionId', select: 'name' },
    { path: 'fromAcademicSessionId', select: 'name year' },
    { path: 'toAcademicSessionId', select: 'name year' },
    { path: 'createdBy', select: 'name email' },
    { path: 'principalApproval.approvedBy', select: 'name email' },
    { path: 'parentAcknowledgment.acknowledgedBy', select: 'name email' }
  ])
  .sort({ promotionDate: -1 });
};

studentPromotionSchema.statics.getClassPromotions = async function(fromClassId, fromSectionId, fromAcademicSessionId, schoolId) {
  return this.find({
    fromClassId,
    fromSectionId,
    fromAcademicSessionId,
    schoolId,
    isDeleted: { $ne: true }
  })
  .populate([
    { path: 'studentId', select: 'admissionNumber firstName lastName' },
    { path: 'toClassId', select: 'name' },
    { path: 'toSectionId', select: 'name' },
    { path: 'toAcademicSessionId', select: 'name year' },
    { path: 'createdBy', select: 'name email' }
  ])
  .sort({ promotionDate: -1 });
};

studentPromotionSchema.statics.getPendingPromotions = async function(schoolId, toAcademicSessionId) {
  return this.find({
    schoolId,
    toAcademicSessionId,
    status: 'PENDING',
    isDeleted: { $ne: true }
  })
  .populate([
    { path: 'studentId', select: 'admissionNumber firstName lastName' },
    { path: 'fromClassId', select: 'name' },
    { path: 'toClassId', select: 'name' },
    { path: 'fromSectionId', select: 'name' },
    { path: 'toSectionId', select: 'name' },
    { path: 'fromAcademicSessionId', select: 'name year' },
    { path: 'toAcademicSessionId', select: 'name year' },
    { path: 'createdBy', select: 'name email' }
  ])
  .sort({ promotionDate: 1 });
};

// Virtual for checking if promotion is approved
studentPromotionSchema.virtual('isApproved').get(function() {
  return this.status === 'APPROVED';
});

// Virtual for checking if promotion is pending
studentPromotionSchema.virtual('isPending').get(function() {
  return this.status === 'PENDING';
});

// Virtual for checking if promotion is completed
studentPromotionSchema.virtual('isCompleted').get(function() {
  return this.status === 'COMPLETED';
});

module.exports = mongoose.model('StudentPromotion', studentPromotionSchema);
