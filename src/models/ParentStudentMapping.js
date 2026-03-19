const mongoose = require('mongoose');
const { addSoftDeleteFilter } = require('../utils/softDelete');

const parentStudentMappingSchema = new mongoose.Schema({
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Parent ID is required'],
    index: true
  },
  studentIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'At least one student ID is required']
  }],
  relationship: {
    type: String,
    enum: ['FATHER', 'MOTHER', 'GUARDIAN', 'STEP_FATHER', 'STEP_MOTHER', 'GRANDFATHER', 'GRANDMOTHER', 'OTHER'],
    required: [true, 'Relationship is required']
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  isEmergencyContact: {
    type: Boolean,
    default: true
  },
  canPickup: {
    type: Boolean,
    default: true
  },
  occupation: {
    type: String,
    trim: true,
    maxlength: [100, 'Occupation cannot exceed 100 characters']
  },
  employer: {
    type: String,
    trim: true,
    maxlength: [100, 'Employer cannot exceed 100 characters']
  },
  annualIncome: {
    type: Number,
    min: [0, 'Annual income cannot be negative']
  },
  qualification: {
    type: String,
    trim: true,
    maxlength: [100, 'Qualification cannot exceed 100 characters']
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
    index: true
  },

  // Audit fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Soft delete fields
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
parentStudentMappingSchema.index({ parentId: 1, schoolId: 1 }, { unique: true });
parentStudentMappingSchema.index({ studentIds: 1 });
parentStudentMappingSchema.index({ parentId: 1 });
parentStudentMappingSchema.index({ isDeleted: 1 });

// Apply soft delete filter
addSoftDeleteFilter(parentStudentMappingSchema);

// Pre-save middleware to validate parent role
parentStudentMappingSchema.pre('save', async function(next) {
  try {
    const User = mongoose.model('User');
    const parent = await User.findById(this.parentId);

    if (!parent) {
      throw new Error('Parent not found');
    }

    if (parent.role !== 'parent') {
      throw new Error('User must have parent role');
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to add student
parentStudentMappingSchema.methods.addStudent = async function(studentId) {
  if (!this.studentIds.includes(studentId)) {
    this.studentIds.push(studentId);
    return this.save();
  }
  return this;
};

// Instance method to remove student
parentStudentMappingSchema.methods.removeStudent = async function(studentId) {
  this.studentIds = this.studentIds.filter(id => id.toString() !== studentId.toString());

  // If no students left, soft delete the mapping
  if (this.studentIds.length === 0) {
    this.isDeleted = true;
    this.deletedAt = new Date();
  }

  return this.save();
};

// Static method to find by parent
parentStudentMappingSchema.statics.findByParent = function(parentId) {
  return this.findOne({
    parentId,
    isDeleted: { $ne: true }
  }).populate('studentIds');
};

// Static method to find by student
parentStudentMappingSchema.statics.findByStudent = function(studentId) {
  return this.find({
    studentIds: studentId,
    isDeleted: { $ne: true }
  }).populate('parentId', 'name email phone');
};

// Static method to get all students for a parent
parentStudentMappingSchema.statics.getStudentsForParent = async function(parentId) {
  const mapping = await this.findOne({
    parentId,
    isDeleted: { $ne: true }
  }).populate({
    path: 'studentIds',
    populate: [
      { path: 'classId', select: 'name' },
      { path: 'sectionId', select: 'name' }
    ]
  });

  return mapping?.studentIds || [];
};

// Static method to check if parent has access to student
parentStudentMappingSchema.statics.hasAccess = async function(parentId, studentId) {
  const mapping = await this.findOne({
    parentId,
    studentIds: studentId,
    isDeleted: { $ne: true }
  });

  return !!mapping;
};

module.exports = mongoose.model('ParentStudentMapping', parentStudentMappingSchema);
