const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    classTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate sections
sectionSchema.index({ name: 1, classId: 1, schoolId: 1 }, { unique: true });

module.exports = mongoose.model('Section', sectionSchema);