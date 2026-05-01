const Enrollment = require('../models/Enrollment');
const StudentProfile = require('../models/StudentProfile');
const AcademicYear = require('../models/AcademicYear');
const logger = require('../utils/logger');

const apiResponse = {
  success: (message, data) => ({ success: true, statusCode: 200, message, data }),
  created: (message, data) => ({ success: true, statusCode: 201, message, data }),
  error: (message, error) => ({ success: false, statusCode: 500, message, error }),
  notFound: (message) => ({ success: false, statusCode: 404, message }),
  validationError: (message) => ({ success: false, statusCode: 400, message })
};

class EnrollmentService {
  // Enroll student in academic year
  async enrollStudent(enrollmentData) {
    try {
      const { studentId, academicYearId, classId, sectionId, rollNumber, schoolId } = enrollmentData;

      logger.info(`Enrollment attempt - StudentID: ${studentId}, AcademicYearID: ${academicYearId}, SchoolID: ${schoolId}`);

      // Check if student profile exists
      const studentProfile = await StudentProfile.findById(studentId);
      if (!studentProfile) {
        logger.warn(`Student profile not found - StudentID: ${studentId}. Checking available students for school: ${schoolId}`);
        // Log total count of students for debugging
        const totalStudents = await StudentProfile.countDocuments();
        const schoolStudents = await StudentProfile.countDocuments({ schoolId });
        logger.info(`Total students in DB: ${totalStudents}, Students in school ${schoolId}: ${schoolStudents}`);
        return apiResponse.notFound('Student profile not found');
      }

      logger.info(`Student found - ${studentProfile.firstName} ${studentProfile.lastName} (${studentProfile.admissionNumber})`);

      // Check if academic year exists
      const academicYear = await AcademicYear.findById(academicYearId);
      if (!academicYear) {
        logger.warn(`Academic year not found - AcademicYearID: ${academicYearId}`);
        return apiResponse.notFound('Academic year not found');
      }

      // Check if already enrolled
      const existingEnrollment = await Enrollment.findOne({
        studentId,
        academicYearId,
        status: 'ENROLLED'
      });

      if (existingEnrollment) {
        logger.info(`Student already enrolled - StudentID: ${studentId}, AcademicYearID: ${academicYearId}`);
        return apiResponse.validationError('Student already enrolled for this academic year');
      }

      // Create enrollment
      const enrollment = await Enrollment.create({
        studentId,
        academicYearId,
        classId,
        sectionId,
        rollNumber,
        schoolId,
        status: 'ENROLLED',
        admissionDate: new Date()
      });

      logger.info(`Student enrolled successfully - StudentID: ${studentId}, EnrollmentID: ${enrollment._id}`);
      return apiResponse.created('Student enrolled successfully', enrollment);
    } catch (error) {
      logger.error(`Enrollment error: ${error.message}`, { stack: error.stack });
      return apiResponse.error('Enrollment failed', error.message);
    }
  }

  // Get current enrollment for student
  async getCurrentEnrollment(studentId, schoolId) {
    try {
      const enrollment = await Enrollment.getCurrentEnrollment(studentId, schoolId);
      if (!enrollment) {
        return apiResponse.notFound('No current enrollment found');
      }
      return apiResponse.success('Current enrollment retrieved', enrollment);
    } catch (error) {
      return apiResponse.error('Failed to get current enrollment', error.message);
    }
  }

  // Get student enrollment history
  async getStudentHistory(studentId, schoolId) {
    try {
      const history = await Enrollment.getStudentHistory(studentId, schoolId);
      return apiResponse.success('Enrollment history retrieved', history);
    } catch (error) {
      return apiResponse.error('Failed to get enrollment history', error.message);
    }
  }

  // Promote student to next class
  async promoteStudent(studentId, currentEnrollmentId, newClassId, newSectionId, newRollNumber) {
    try {
      const enrollment = await Enrollment.findById(currentEnrollmentId);
      if (!enrollment) {
        return apiResponse.notFound('Current enrollment not found');
      }

      // Get next academic year
      const AcademicYear = require('../models/AcademicYear');
      const nextYear = await AcademicYear.getCurrentYear(enrollment.schoolId);
      
      if (!nextYear) {
        return apiResponse.validationError('No current academic year found');
      }

      // Promote current enrollment
      const newEnrollment = await enrollment.promote(newClassId, newSectionId, newRollNumber);

      return apiResponse.success('Student promoted successfully', newEnrollment);
    } catch (error) {
      return apiResponse.error('Promotion failed', error.message);
    }
  }

  // Get enrollments by class and section
  async getClassEnrollments(classId, sectionId, academicYearId, schoolId) {
    try {
      // Build query dynamically based on provided parameters
      const query = {
        academicYearId,
        schoolId,
        status: 'ENROLLED'
      };

      // Add classId if provided
      if (classId) {
        query.classId = classId;
      }

      // Add sectionId if provided
      if (sectionId) {
        query.sectionId = sectionId;
      }

      const enrollments = await Enrollment.find(query)
        .populate('studentId', 'firstName lastName admissionNumber')
        .populate('classId', 'name')
        .populate('sectionId', 'name')
        .sort({ rollNumber: 1 });

      let message = 'Enrollments retrieved';
      if (classId && sectionId) {
        message = 'Class/Section enrollments retrieved';
      } else if (classId) {
        message = 'Class enrollments retrieved';
      } else if (sectionId) {
        message = 'Section enrollments retrieved';
      } else {
        message = 'Academic year enrollments retrieved';
      }

      return apiResponse.success(message, enrollments);
    } catch (error) {
      logger.error(`Failed to get enrollments: ${error.message}`, { stack: error.stack });
      return apiResponse.error('Failed to get enrollments', error.message);
    }
  }

  // Bulk enroll students
  async bulkEnrollStudents(enrollments) {
    try {
      const results = await Enrollment.insertMany(enrollments);
      return apiResponse.created('Bulk enrollment completed', results);
    } catch (error) {
      return apiResponse.error('Bulk enrollment failed', error.message);
    }
  }
}

module.exports = new EnrollmentService();
