const mongoose = require('mongoose');
const { addSoftDeleteFilter } = require('../utils/softDelete');

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['superadmin', 'school_admin', 'teacher', 'accountant', 'parent', 'student'],
      required: true,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
    },
    isActive: { type: Boolean, default: true },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    
    // Profile fields
    phone: { type: String },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String }
    },
    profileImage: { type: String },
    
    // Soft delete fields
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    // Audit fields
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for full name
userSchema.virtual('name').get(function() {
  return `${this.firstName} ${this.lastName || ''}`.trim();
});

// Indexes for performance
userSchema.index({ email: 1 }, { unique: true });

// Apply soft delete filter
addSoftDeleteFilter(userSchema);

const User = mongoose.model('User', userSchema);

module.exports = User;