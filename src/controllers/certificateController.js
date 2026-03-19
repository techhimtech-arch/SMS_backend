const asyncHandler = require('express-async-handler');
const Certificate = require('../models/Certificate');
const Student = require('../models/Student');
const auditLogger = require('../utils/auditLogger');

/**
 * @desc    Generate certificate
 * @route   POST /api/v1/certificates/generate
 * @access  Private (Admin, Principal, Clerk)
 */
const generateCertificate = asyncHandler(async (req, res) => {
  const {
    studentId,
    certificateType,
    dataPayload,
    purpose,
    expiryDate
  } = req.body;

  // Get student info
  const student = await Student.findById(studentId);
  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  // Prepare data payload with student info
  const enrichedDataPayload = {
    ...dataPayload,
    studentName: student.name,
    admissionNumber: student.admissionNumber,
    className: student.classId?.name || dataPayload.className,
    sectionName: student.sectionId?.name || dataPayload.sectionName,
    dateOfBirth: student.dateOfBirth,
    fatherName: student.fatherName || dataPayload.fatherName,
    motherName: student.motherName || dataPayload.motherName,
    generatedAt: new Date()
  };

  const certificate = new Certificate({
    studentId,
    certificateType,
    dataPayload: enrichedDataPayload,
    purpose,
    expiryDate: expiryDate ? new Date(expiryDate) : null,
    schoolId: req.user.schoolId,
    academicSessionId: req.user.currentAcademicYear,
    generatedBy: req.user.id,
    createdBy: req.user.id
  });

  const saved = await certificate.save();

  // Log audit
  await auditLogger.log({
    action: 'CERTIFICATE_GENERATE',
    userId: req.user.id,
    userType: req.user.role,
    schoolId: req.user.schoolId,
    targetId: saved._id,
    targetType: 'Certificate',
    details: { certificateType, studentId },
    ipAddress: req.ip
  });

  res.status(201).json({
    success: true,
    message: 'Certificate generated successfully',
    data: saved
  });
});

/**
 * @desc    Get certificates for a student
 * @route   GET /api/v1/certificates/student/:studentId
 * @access  Private (Admin, Principal, Clerk, Student, Parent)
 */
const getStudentCertificates = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  // Check permissions for student/parent
  if (req.user.role === 'student' && req.user.id !== studentId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view these certificates'
    });
  }

  const filters = {
    studentId,
    schoolId: req.user.schoolId,
    isDeleted: { $ne: true }
  };

  // If student/parent, only show valid certificates
  if (req.user.role === 'student' || req.user.role === 'parent') {
    filters.status = { $in: ['ISSUED', 'VERIFIED'] };
  }

  const certificates = await Certificate.find(filters)
    .populate('studentId', 'name admissionNumber')
    .populate('generatedBy', 'name')
    .sort({ issueDate: -1 });

  res.status(200).json({
    success: true,
    count: certificates.length,
    data: certificates
  });
});

/**
 * @desc    Get certificate by ID
 * @route   GET /api/v1/certificates/:id
 * @access  Private (Admin, Principal, Clerk, Student, Parent)
 */
const getCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findById(req.params.id)
    .populate('studentId', 'name admissionNumber classId sectionId')
    .populate('generatedBy', 'name')
    .populate('verifiedBy', 'name')
    .populate('schoolId', 'name address phone email');

  if (!certificate) {
    return res.status(404).json({
      success: false,
      message: 'Certificate not found'
    });
  }

  // Check permissions for student/parent
  if (req.user.role === 'student' && certificate.studentId._id.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this certificate'
    });
  }

  // Return PDF-ready structured response
  const pdfData = {
    certificateNumber: certificate.certificateNumber,
    certificateType: certificate.formattedType,
    verificationCode: certificate.verificationCode,
    issueDate: certificate.issueDate,
    expiryDate: certificate.expiryDate,
    status: certificate.status,
    isValid: certificate.isValid,
    student: certificate.studentId,
    school: certificate.schoolId,
    data: certificate.dataPayload,
    generatedBy: certificate.generatedBy
  };

  res.status(200).json({
    success: true,
    data: {
      certificate,
      pdfReady: pdfData
    }
  });
});

/**
 * @desc    Verify certificate
 * @route   POST /api/v1/certificates/:id/verify
 * @access  Private (Admin, Principal)
 */
const verifyCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findById(req.params.id);

  if (!certificate) {
    return res.status(404).json({
      success: false,
      message: 'Certificate not found'
    });
  }

  await certificate.verify(req.user.id);

  // Log audit
  await auditLogger.log({
    action: 'CERTIFICATE_VERIFY',
    userId: req.user.id,
    userType: req.user.role,
    schoolId: req.user.schoolId,
    targetId: certificate._id,
    targetType: 'Certificate',
    ipAddress: req.ip
  });

  res.status(200).json({
    success: true,
    message: 'Certificate verified successfully',
    data: certificate
  });
});

/**
 * @desc    Cancel certificate
 * @route   POST /api/v1/certificates/:id/cancel
 * @access  Private (Admin, Principal)
 */
const cancelCertificate = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const certificate = await Certificate.findById(req.params.id);

  if (!certificate) {
    return res.status(404).json({
      success: false,
      message: 'Certificate not found'
    });
  }

  await certificate.cancel(reason, req.user.id);

  // Log audit
  await auditLogger.log({
    action: 'CERTIFICATE_CANCEL',
    userId: req.user.id,
    userType: req.user.role,
    schoolId: req.user.schoolId,
    targetId: certificate._id,
    targetType: 'Certificate',
    details: { reason },
    ipAddress: req.ip
  });

  res.status(200).json({
    success: true,
    message: 'Certificate cancelled successfully',
    data: certificate
  });
});

/**
 * @desc    Delete certificate (soft delete)
 * @route   DELETE /api/v1/certificates/:id
 * @access  Private (Admin)
 */
const deleteCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findById(req.params.id);

  if (!certificate) {
    return res.status(404).json({
      success: false,
      message: 'Certificate not found'
    });
  }

  await certificate.softDelete(req.user.id);

  // Log audit
  await auditLogger.log({
    action: 'CERTIFICATE_DELETE',
    userId: req.user.id,
    userType: req.user.role,
    schoolId: req.user.schoolId,
    targetId: certificate._id,
    targetType: 'Certificate',
    ipAddress: req.ip
  });

  res.status(200).json({
    success: true,
    message: 'Certificate deleted successfully'
  });
});

/**
 * @desc    Verify certificate by code (Public endpoint)
 * @route   GET /api/v1/certificates/verify/:code
 * @access  Public
 */
const verifyByCode = asyncHandler(async (req, res) => {
  const { code } = req.params;

  const certificate = await Certificate.verifyByCode(code);

  if (!certificate) {
    return res.status(404).json({
      success: false,
      message: 'Invalid or expired certificate'
    });
  }

  res.status(200).json({
    success: true,
    data: {
      certificateNumber: certificate.certificateNumber,
      certificateType: certificate.formattedType,
      studentName: certificate.studentId?.name,
      admissionNumber: certificate.studentId?.admissionNumber,
      issueDate: certificate.issueDate,
      status: certificate.status,
      isValid: certificate.isValid,
      isVerified: certificate.isVerified
    }
  });
});

/**
 * @desc    Get certificate templates
 * @route   GET /api/v1/certificates/templates
 * @access  Private (Admin, Principal, Clerk)
 */
const getCertificateTemplates = asyncHandler(async (req, res) => {
  const templates = [
    {
      type: 'TRANSFER_CERTIFICATE',
      name: 'Transfer Certificate (TC)',
      description: 'Issued when a student leaves the school',
      requiredFields: ['studentName', 'className', 'academicYear', 'reason', 'conduct'],
      format: 'standard'
    },
    {
      type: 'CHARACTER_CERTIFICATE',
      name: 'Character Certificate',
      description: 'Certifies student behavior and conduct',
      requiredFields: ['studentName', 'className', 'conduct', 'academicYear'],
      format: 'standard'
    },
    {
      type: 'BONAFIDE_CERTIFICATE',
      name: 'Bonafide Certificate',
      description: 'Confirms student enrollment at the school',
      requiredFields: ['studentName', 'className', 'admissionNumber', 'dateOfBirth'],
      format: 'standard'
    },
    {
      type: 'MERIT_CERTIFICATE',
      name: 'Merit Certificate',
      description: 'Awarded for academic or extracurricular excellence',
      requiredFields: ['studentName', 'achievement', 'date', 'awardedFor'],
      format: 'standard'
    },
    {
      type: 'STUDY_CERTIFICATE',
      name: 'Study Certificate',
      description: 'Confirms period of study at the school',
      requiredFields: ['studentName', 'className', 'fromDate', 'toDate'],
      format: 'standard'
    },
    {
      type: 'ATTENDANCE_CERTIFICATE',
      name: 'Attendance Certificate',
      description: 'Shows student attendance record',
      requiredFields: ['studentName', 'className', 'attendancePercentage', 'period'],
      format: 'standard'
    },
    {
      type: 'LEAVING_CERTIFICATE',
      name: 'Leaving Certificate',
      description: 'Issued when student completes studies or transfers',
      requiredFields: ['studentName', 'className', 'dateOfLeaving', 'reason'],
      format: 'standard'
    },
    {
      type: 'CONDUCT_CERTIFICATE',
      name: 'Conduct Certificate',
      description: 'Attests to student character and behavior',
      requiredFields: ['studentName', 'className', 'conduct', 'period'],
      format: 'standard'
    }
  ];

  res.status(200).json({
    success: true,
    count: templates.length,
    data: templates
  });
});

module.exports = {
  generateCertificate,
  getStudentCertificates,
  getCertificate,
  verifyCertificate,
  cancelCertificate,
  deleteCertificate,
  verifyByCode,
  getCertificateTemplates
};
