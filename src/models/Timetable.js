const mongoose = require('mongoose');
const { addSoftDeleteFilter } = require('../utils/softDelete');

const timetableSchema = new mongoose.Schema(
  {
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
    day: {
      type: String,
      required: true,
      enum: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
      uppercase: true
    },
    periodNumber: {
      type: Number,
      required: true,
      min: [1, 'Period number must be at least 1'],
      max: [12, 'Period number cannot exceed 12']
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startTime: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/.test(v);
        },
        message: 'Start time must be in HH:MM format (24-hour)'
      }
    },
    endTime: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/.test(v);
        },
        message: 'End time must be in HH:MM format (24-hour)'
      }
    },
    room: {
      type: String,
      trim: true,
      maxlength: [50, 'Room cannot exceed 50 characters']
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
    semester: {
      type: String,
      enum: ['FIRST', 'SECOND'],
      default: 'FIRST'
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

// Unique index to prevent duplicate timetable entries
timetableSchema.index({ 
  classId: 1, 
  sectionId: 1, 
  day: 1, 
  periodNumber: 1, 
  academicSessionId: 1, 
  schoolId: 1 
}, { unique: true });

// Performance indexes
timetableSchema.index({ schoolId: 1, isActive: 1 });
timetableSchema.index({ schoolId: 1, isDeleted: 1 });
timetableSchema.index({ academicSessionId: 1, schoolId: 1 });
timetableSchema.index({ classId: 1, sectionId: 1, academicSessionId: 1, isActive: 1 });
timetableSchema.index({ teacherId: 1, day: 1, academicSessionId: 1, isActive: 1 });
timetableSchema.index({ subjectId: 1, academicSessionId: 1, isActive: 1 });
timetableSchema.index({ createdBy: 1 });

// Apply soft delete filter
addSoftDeleteFilter(timetableSchema);

// Static methods for conflict checking
timetableSchema.statics.checkTeacherConflict = function(teacherId, day, periodNumber, academicSessionId, schoolId, excludeId = null) {
  const query = {
    teacherId,
    day,
    periodNumber,
    academicSessionId,
    schoolId,
    isActive: true,
    isDeleted: { $ne: true }
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return this.findOne(query);
};

timetableSchema.statics.checkClassConflict = function(classId, sectionId, day, periodNumber, academicSessionId, schoolId, excludeId = null) {
  const query = {
    classId,
    sectionId,
    day,
    periodNumber,
    academicSessionId,
    schoolId,
    isActive: true,
    isDeleted: { $ne: true }
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return this.findOne(query);
};

timetableSchema.statics.getClassTimetable = function(classId, sectionId, academicSessionId, schoolId) {
  return this.find({
    classId,
    sectionId,
    academicSessionId,
    schoolId,
    isActive: true,
    isDeleted: { $ne: true }
  })
  .populate([
    { path: 'subjectId', select: 'name code department' },
    { path: 'teacherId', select: 'name email' }
  ])
  .sort({ periodNumber: 1 });
};

timetableSchema.statics.getTeacherTimetable = function(teacherId, academicSessionId, schoolId) {
  return this.find({
    teacherId,
    academicSessionId,
    schoolId,
    isActive: true,
    isDeleted: { $ne: true }
  })
  .populate([
    { path: 'classId', select: 'name' },
    { path: 'sectionId', select: 'name' },
    { path: 'subjectId', select: 'name code department' }
  ])
  .sort({ day: 1, periodNumber: 1 });
};

timetableSchema.statics.getWeeklyTimetable = function(classId, sectionId, academicSessionId, schoolId) {
  return this.aggregate([
    {
      $match: {
        classId: new mongoose.Types.ObjectId(classId),
        sectionId: new mongoose.Types.ObjectId(sectionId),
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
        from: 'users',
        localField: 'teacherId',
        foreignField: '_id',
        as: 'teacher'
      }
    },
    {
      $group: {
        _id: { day: '$day', periodNumber: '$periodNumber' },
        timetableEntry: { $first: '$$ROOT' },
        subject: { $first: '$subject' },
        teacher: { $first: '$teacher' }
      }
    },
    {
      $group: {
        _id: '$day',
        periods: {
          $push: {
            periodNumber: '$_id.periodNumber',
            subject: { $ifNull: ['$$ROOT.subject', null] },
            teacher: { $ifNull: ['$$ROOT.teacher', null] },
            startTime: '$timetableEntry.startTime',
            endTime: '$timetableEntry.endTime',
            room: '$timetableEntry.room'
          }
        }
      }
    },
    {
      $sort: { 
        '_id': { 
          $switch: {
            branches: [
              { case: 'MONDAY', then: 1 },
              { case: 'TUESDAY', then: 2 },
              { case: 'WEDNESDAY', then: 3 },
              { case: 'THURSDAY', then: 4 },
              { case: 'FRIDAY', then: 5 },
              { case: 'SATURDAY', then: 6 },
              { case: 'SUNDAY', then: 7 }
            ],
            default: 8
          }
        }
      }
    }
  ]);
};

// Pre-save middleware for conflict validation
timetableSchema.pre('save', async function(next) {
  try {
    if (!this.isNew) {
      // Check for teacher conflict
      const teacherConflict = await this.constructor.checkTeacherConflict(
        this.teacherId,
        this.day,
        this.periodNumber,
        this.academicSessionId,
        this.schoolId,
        this._id
      );

      if (teacherConflict) {
        return next(new Error(`Teacher conflict: Teacher is already assigned to another class during ${this.day} period ${this.periodNumber}`));
      }

      // Check for class conflict
      const classConflict = await this.constructor.checkClassConflict(
        this.classId,
        this.sectionId,
        this.day,
        this.periodNumber,
        this.academicSessionId,
        this.schoolId,
        this._id
      );

      if (classConflict) {
        return next(new Error(`Class conflict: Class already has another subject assigned during ${this.day} period ${this.periodNumber}`));
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Pre-insertMany middleware for bulk operations
timetableSchema.pre('insertMany', async function(next, docs) {
  try {
    for (const doc of docs) {
      // Check for teacher conflict
      const teacherConflict = await this.constructor.checkTeacherConflict(
        doc.teacherId,
        doc.day,
        doc.periodNumber,
        doc.academicSessionId,
        doc.schoolId
      );

      if (teacherConflict) {
        return next(new Error(`Teacher conflict in bulk insert: Teacher is already assigned during ${doc.day} period ${doc.periodNumber}`));
      }

      // Check for class conflict
      const classConflict = await this.constructor.checkClassConflict(
        doc.classId,
        doc.sectionId,
        doc.day,
        doc.periodNumber,
        doc.academicSessionId,
        doc.schoolId
      );

      if (classConflict) {
        return next(new Error(`Class conflict in bulk insert: Class already has another subject assigned during ${doc.day} period ${doc.periodNumber}`));
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Timetable', timetableSchema);
