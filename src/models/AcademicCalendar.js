const mongoose = require('mongoose');
const { addSoftDeleteFilter } = require('../utils/softDelete');

const academicCalendarSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['HOLIDAY', 'EXAM', 'EVENT', 'MEETING'],
      default: 'EVENT'
    },
    subType: {
      type: String,
      enum: {
        HOLIDAY: ['NATIONAL', 'RELIGIOUS', 'WEEKEND', 'SCHOOL_DECLARED'],
        EXAM: ['MID_TERM', 'FINAL_TERM', 'UNIT_TEST', 'PRACTICAL', 'VIVA'],
        EVENT: ['CULTURAL', 'SPORTS', 'COMPETITION', 'SEMINAR', 'WORKSHOP', 'PARENTS_MEETING', 'STUDENT_ACTIVITY'],
        MEETING: ['FACULTY', 'DEPARTMENT', 'SCHOOL_COMMITTEE', 'PARENT_TEACHER']
      }
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM'
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'CANCELLED'],
      default: 'DRAFT'
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringPattern: {
      type: String,
      enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'],
      default: null
    },
    recurringEndDate: {
      type: Date,
      default: null
    },
    applicableClasses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class'
    }],
    applicableSections: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section'
    }],
    applicableRoles: [{
      type: String,
      enum: ['ALL', 'STUDENTS', 'TEACHERS', 'PARENTS', 'ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'ACCOUNTANT']
    }],
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
    venue: {
      type: String,
      trim: true,
      maxlength: [200, 'Venue cannot exceed 200 characters']
    },
    startTime: {
      type: String,
      validate: {
        validator: function(v) {
          return v === null || v === '' || /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/.test(v);
        },
        message: 'Start time must be in HH:MM format (24-hour) or empty'
      }
    },
    endTime: {
      type: String,
      validate: {
        validator: function(v) {
          return v === null || v === '' || /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/.test(v);
        },
        message: 'End time must be in HH:MM format (24-hour) or empty'
      }
    },
    attachments: [{
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
    sendNotifications: {
      type: Boolean,
      default: true,
    },
    notificationSent: {
      type: Boolean,
      default: false,
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

// Indexes for performance
academicCalendarSchema.index({ 
  schoolId: 1, 
  academicSessionId: 1, 
  date: 1 
});

academicCalendarSchema.index({ 
  schoolId: 1, 
  academicSessionId: 1, 
  type: 1, 
  status: 1 
});

academicCalendarSchema.index({ 
  schoolId: 1, 
  academicSessionId: 1, 
  date: 1, 
  isActive: 1 
});

academicCalendarSchema.index({ 
  schoolId: 1, 
  isDeleted: 1 
});

academicCalendarSchema.index({ 
  applicableClasses: 1 
});

academicCalendarSchema.index({ 
  applicableRoles: 1 
});

academicCalendarSchema.index({ 
  createdBy: 1 
});

// Apply soft delete filter
addSoftDeleteFilter(academicCalendarSchema);

// Static methods for common queries
academicCalendarSchema.statics.findByDateRange = function(startDate, endDate, academicSessionId, schoolId, options = {}) {
  const query = {
    date: { $gte: startDate, $lte: endDate },
    academicSessionId,
    schoolId,
    isActive: true,
    isDeleted: { $ne: true }
  };

  if (options.type) {
    query.type = options.type;
  }

  if (options.status) {
    query.status = options.status;
  }

  if (options.applicableRoles) {
    query.applicableRoles = { $in: options.applicableRoles };
  }

  return this.find(query)
    .populate([
      { path: 'applicableClasses', select: 'name' },
      { path: 'applicableSections', select: 'name' },
      { path: 'createdBy', select: 'name email' }
    ])
    .sort({ date: 1, priority: -1 });
};

academicCalendarSchema.statics.findByMonth = function(year, month, academicSessionId, schoolId, options = {}) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // Last day of month

  return this.findByDateRange(startDate, endDate, academicSessionId, schoolId, options);
};

academicCalendarSchema.statics.getUpcomingEvents = function(days = 30, academicSessionId, schoolId, options = {}) {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + days);

  return this.findByDateRange(startDate, endDate, academicSessionId, schoolId, options);
};

academicCalendarSchema.statics.getHolidays = function(academicSessionId, schoolId, year) {
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31);

  return this.find({
    date: { $gte: yearStart, $lte: yearEnd },
    type: 'HOLIDAY',
    academicSessionId,
    schoolId,
    isActive: true,
    isDeleted: { $ne: true }
  })
  .populate([
    { path: 'applicableClasses', select: 'name' },
    { path: 'createdBy', select: 'name email' }
  ])
  .sort({ date: 1 });
};

academicCalendarSchema.statics.getExams = function(academicSessionId, schoolId, year) {
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31);

  return this.find({
    date: { $gte: yearStart, $lte: yearEnd },
    type: 'EXAM',
    academicSessionId,
    schoolId,
    isActive: true,
    isDeleted: { $ne: true }
  })
  .populate([
    { path: 'applicableClasses', select: 'name' },
    { path: 'applicableSections', select: 'name' },
    { path: 'createdBy', select: 'name email' }
  ])
  .sort({ date: 1 });
};

// Virtual for checking if event is upcoming
academicCalendarSchema.virtual('isUpcoming').get(function() {
  return this.date > new Date();
});

// Virtual for checking if event is today
academicCalendarSchema.virtual('isToday').get(function() {
  const today = new Date();
  return this.date.toDateString() === today.toDateString();
});

// Virtual for checking if event is multi-day
academicCalendarSchema.virtual('isMultiDay').get(function() {
  return this.startTime && this.endTime && this.startTime !== this.endTime;
});

module.exports = mongoose.model('AcademicCalendar', academicCalendarSchema);
