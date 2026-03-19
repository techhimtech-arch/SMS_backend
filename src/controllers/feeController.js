const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const FeeStructure = require('../models/FeeStructure');
const StudentFee = require('../models/StudentFee');
const FeePayment = require('../models/FeePayment');
const feeService = require('../services/feeService');
const logger = require('../utils/logger');
const auditLogger = require('../utils/auditLogger');

// Validation middleware for fee structure creation
const validateFeeStructure = [
  body('academicYearId')
    .notEmpty()
    .withMessage('Academic year ID is required')
    .isMongoId()
    .withMessage('Invalid academic year ID'),
  
  body('classId')
    .notEmpty()
    .withMessage('Class ID is required')
    .isMongoId()
    .withMessage('Invalid class ID'),
  
  body('feeType')
    .isIn(['tuition', 'transport', 'admission', 'exam', 'library', 'laboratory', 'sports', 'other'])
    .withMessage('Invalid fee type'),
  
  body('feeName')
    .notEmpty()
    .withMessage('Fee name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Fee name must be between 2 and 100 characters'),
  
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number')
    .isFloat({ min: 0 })
    .withMessage('Amount must be at least 0'),
  
  body('dueDate')
    .isISO8601()
    .withMessage('Due date must be a valid date')
    .custom(value => {
      if (new Date(value) <= new Date()) {
        throw new Error('Due date must be in the future');
      }
      return true;
    })
];

// Validation middleware for payment processing
const validatePayment = [
  body('feeId')
    .notEmpty()
    .withMessage('Fee ID is required')
    .isMongoId()
    .withMessage('Invalid fee ID'),
  
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be at least 0.01'),
  
  body('paymentMethod')
    .isIn(['cash', 'cheque', 'bank_transfer', 'online', 'card', 'upi'])
    .withMessage('Invalid payment method'),
  
  body('transactionId')
    .optional()
    .isString()
    .withMessage('Transaction ID must be a string'),
  
  body('remarks')
    .optional()
    .isString()
    .withMessage('Remarks must be a string')
    .isLength({ max: 500 })
    .withMessage('Remarks must not exceed 500 characters')
];

// Create fee structure
const createFeeStructure = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const feeData = {
    ...req.body,
    createdBy: req.user._id
  };

  const result = await feeService.createFeeStructure(
    feeData,
    req.user._id,
    req.user.schoolId
  );

  res.status(result.success ? 201 : 400).json(result);
});

// Get fee structures
const getFeeStructures = asyncHandler(async (req, res) => {
  const { academicYearId, classId } = req.query;
  const { schoolId } = req.user;

  if (!academicYearId || !classId) {
    return res.status(400).json({
      success: false,
      message: 'Academic year ID and Class ID are required'
    });
  }

  const result = await feeService.getFeeStructures(
    academicYearId,
    classId,
    schoolId
  );

  res.status(result.success ? 200 : 400).json(result);
});

// Get student fee summary
const getStudentFeeSummary = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { academicYearId } = req.query;
  const { schoolId } = req.user;

  if (!academicYearId) {
    return res.status(400).json({
      success: false,
      message: 'Academic year ID is required'
    });
  }

  const result = await feeService.getStudentFeeSummary(
    studentId,
    academicYearId,
    schoolId
  );

  res.status(result.success ? 200 : 400).json(result);
});

// Get class fee summary
const getClassFeeSummary = asyncHandler(async (req, res) => {
  const { classId, academicYearId } = req.query;
  const { schoolId } = req.user;

  if (!classId || !academicYearId) {
    return res.status(400).json({
      success: false,
      message: 'Class ID and Academic year ID are required'
    });
  }

  const result = await feeService.getClassFeeSummary(
    classId,
    academicYearId,
    schoolId
  );

  res.status(result.success ? 200 : 400).json(result);
});

// Process fee payment
const processPayment = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const paymentData = {
    ...req.body,
    collectedBy: req.user._id
  };

  const result = await feeService.processPayment(
    paymentData,
    req.user._id,
    req.user.schoolId
  );

  res.status(result.success ? 201 : 400).json(result);
});

// Get overdue fees
const getOverdueFees = asyncHandler(async (req, res) => {
  const { schoolId } = req.user;

  const result = await feeService.getOverdueFees(schoolId);

  res.status(result.success ? 200 : 400).json(result);
});

// Get payment history
const getPaymentHistory = asyncHandler(async (req, res) => {
  const { schoolId } = req.user;
  const filters = req.query;

  const result = await feeService.getPaymentHistory(filters, schoolId);

  res.status(result.success ? 200 : 400).json(result);
});

// Generate fee reports
const generateFeeReport = asyncHandler(async (req, res) => {
  const { reportType } = req.params;
  const { schoolId } = req.user;
  const filters = req.query;

  const result = await feeService.generateFeeReport(
    reportType,
    filters,
    schoolId
  );

  res.status(result.success ? 200 : 400).json(result);
});

// Send fee reminders
const sendFeeReminders = asyncHandler(async (req, res) => {
  const { reminderType = 'overdue' } = req.body;
  const { schoolId } = req.user;

  const result = await feeService.sendFeeReminders(schoolId, reminderType);

  res.status(result.success ? 200 : 400).json(result);
});

// Get fee dashboard
const getFeeDashboard = asyncHandler(async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { academicYearId, classId } = req.query;

    let dashboardData = {};
    
    if (academicYearId && classId) {
      // Get class-specific data
      const [classSummary, overdueFees] = await Promise.all([
        feeService.getClassFeeSummary(classId, academicYearId, schoolId),
        feeService.getOverdueFees(schoolId)
      ]);
      
      dashboardData = {
        classSummary: classSummary.data,
        totalOverdueFees: overdueFees.totalOverdue,
        totalOverdueAmount: overdueFees.totalOverdueAmount
      };
    } else {
      // Get school-wide data
      const [overdueFees, paymentHistory] = await Promise.all([
        feeService.getOverdueFees(schoolId),
        feeService.getPaymentHistory({ schoolId }, schoolId)
      ]);
      
      dashboardData = {
        totalOverdueFees: overdueFees.totalOverdue,
        totalOverdueAmount: overdueFees.totalOverdueAmount,
        recentPayments: paymentHistory.data.slice(0, 10),
        totalPayments: paymentHistory.totalPayments,
        totalCollection: paymentHistory.totalAmount
      };
    }

    res.status(200).json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    logger.error('Failed to get fee dashboard', {
      error: error.message,
      schoolId: req.user.schoolId
    });

    res.status(500).json({
      success: false,
      message: 'Failed to get fee dashboard'
    });
  }
});

// Get student fee details for payment
const getStudentFeeDetails = asyncHandler(async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academicYearId } = req.query;
    const { schoolId } = req.user;

    if (!academicYearId) {
      return res.status(400).json({
        success: false,
        message: 'Academic year ID is required'
      });
    }

    const feeSummary = await feeService.getStudentFeeSummary(
      studentId,
      academicYearId,
      schoolId
    );

    if (!feeSummary.success) {
      return res.status(400).json(feeSummary);
    }

    // Filter only pending and partial fees for payment
    const payableFees = feeSummary.data.fees.filter(fee => 
      fee.status === 'pending' || fee.status === 'partial'
    );

    res.status(200).json({
      success: true,
      data: {
        studentSummary: feeSummary.data.summary,
        payableFees,
        totalPayable: payableFees.reduce((sum, fee) => sum + fee.balanceAmount, 0)
      }
    });

  } catch (error) {
    logger.error('Failed to get student fee details', {
      error: error.message,
      studentId: req.params.studentId,
      schoolId: req.user.schoolId
    });

    res.status(500).json({
      success: false,
      message: 'Failed to get student fee details'
    });
  }
});

// Get fee receipt
const getFeeReceipt = asyncHandler(async (req, res) => {
  try {
    const { feeId, receiptNumber } = req.params;
    const { schoolId } = req.user;

    // Find fee with specific receipt
    const fee = await ImprovedStudentFee.findOne({
      _id: feeId,
      schoolId,
      'payments.receiptNumber': receiptNumber
    })
    .populate('studentId', 'firstName lastName admissionNumber')
    .populate('classId', 'name')
    .populate('payments.collectedBy', 'name');

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee receipt not found'
      });
    }

    const payment = fee.payments.find(p => p.receiptNumber === receiptNumber);

    res.status(200).json({
      success: true,
      data: {
        receipt: {
          receiptNumber: payment.receiptNumber,
          paymentDate: payment.paymentDate,
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
          transactionId: payment.transactionId,
          remarks: payment.remarks,
          collectedBy: payment.collectedBy,
          student: fee.studentId,
          class: fee.classId,
          feeName: fee.feeName,
          feeType: fee.feeType,
          totalAmount: fee.totalAmount,
          balanceAmount: fee.balanceAmount,
          status: fee.status
        }
      }
    });

  } catch (error) {
    logger.error('Failed to get fee receipt', {
      error: error.message,
      feeId: req.params.feeId,
      schoolId: req.user.schoolId
    });

    res.status(500).json({
      success: false,
      message: 'Failed to get fee receipt'
    });
  }
});

// ============ Phase 5 Advanced Fee Management Methods ============

/**
 * @desc    Generate student fees from fee structure
 * @route   POST /api/v1/fees/generate-student-fees
 * @access  Private (Admin, Accountant)
 */
const generateStudentFees = asyncHandler(async (req, res) => {
  const { studentId, classId, sectionId, academicSessionId, customFeeItems } = req.body;

  // Check if student already has fees for this session
  const existing = await StudentFee.findOne({
    studentId,
    academicYearId: academicSessionId,
    isDeleted: { $ne: true }
  });

  if (existing) {
    return res.status(400).json({
      success: false,
      message: 'Student fees already generated for this academic session'
    });
  }

  let feeItems = [];

  // If custom fee items provided, use them
  if (customFeeItems && customFeeItems.length > 0) {
    feeItems = customFeeItems.map(item => ({
      ...item,
      dueAmount: item.amount,
      status: 'PENDING'
    }));
  } else {
    // Get fee structure for class and generate fee items
    const feeStructure = await FeeStructure.findActiveForClass(classId, academicSessionId);

    if (!feeStructure) {
      return res.status(404).json({
        success: false,
        message: 'No active fee structure found for this class and academic session'
      });
    }

    // Generate fee items from fee structure
    const now = new Date();
    feeItems = feeStructure.feeHeads.map(head => {
      let dueDate = new Date(now);

      switch (head.frequency) {
        case 'MONTHLY':
          dueDate.setMonth(dueDate.getMonth() + 1);
          break;
        case 'QUARTERLY':
          dueDate.setMonth(dueDate.getMonth() + 3);
          break;
        case 'YEARLY':
          dueDate.setMonth(dueDate.getMonth() + 12);
          break;
        default:
          dueDate.setMonth(dueDate.getMonth() + 1);
      }

      return {
        feeHeadId: head._id,
        feeHeadName: head.name,
        amount: head.amount,
        paidAmount: 0,
        dueAmount: head.amount,
        dueDate,
        status: 'PENDING',
        frequency: head.frequency
      };
    });
  }

  const studentFee = new StudentFee({
    studentId,
    classId,
    sectionId,
    academicYearId: academicSessionId,
    schoolId: req.user.schoolId,
    feeItems,
    totalAmount: feeItems.reduce((sum, item) => sum + item.amount, 0),
    paidAmount: 0,
    balanceAmount: feeItems.reduce((sum, item) => sum + item.amount, 0),
    createdBy: req.user.id
  });

  const saved = await studentFee.save();

  await auditLogger.log({
    action: 'STUDENT_FEE_GENERATE',
    userId: req.user.id,
    userType: req.user.role,
    schoolId: req.user.schoolId,
    targetId: saved._id,
    targetType: 'StudentFee',
    details: { studentId, totalAmount: saved.totalAmount },
    ipAddress: req.ip
  });

  res.status(201).json({
    success: true,
    message: 'Student fees generated successfully',
    data: saved
  });
});

/**
 * @desc    Get student fees
 * @route   GET /api/v1/fees/student/:studentId
 * @access  Private (Admin, Accountant, Student, Parent)
 */
const getStudentFees = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { academicSessionId } = req.query;

  // Check permissions for student/parent
  if (req.user.role === 'student' && req.user.id !== studentId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view these fees'
    });
  }

  const filters = { studentId, isDeleted: { $ne: true } };
  if (academicSessionId) filters.academicYearId = academicSessionId;

  const studentFees = await StudentFee.find(filters)
    .populate('studentId', 'name admissionNumber')
    .populate('classId', 'name')
    .populate('sectionId', 'name')
    .populate('academicYearId', 'name year')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: studentFees.length,
    data: studentFees
  });
});

/**
 * @desc    Make fee payment
 * @route   POST /api/v1/fees/pay
 * @access  Private (Admin, Accountant)
 */
const makePayment = asyncHandler(async (req, res) => {
  const {
    studentId,
    studentFeeId,
    feeItemId,
    amountPaid,
    paymentMode,
    transactionId,
    remarks
  } = req.body;

  const studentFee = await StudentFee.findById(studentFeeId);
  if (!studentFee) {
    return res.status(404).json({
      success: false,
      message: 'Student fee record not found'
    });
  }

  const feeItem = studentFee.getFeeItem(feeItemId);
  if (!feeItem) {
    return res.status(404).json({
      success: false,
      message: 'Fee item not found'
    });
  }

  if (amountPaid > feeItem.dueAmount) {
    return res.status(400).json({
      success: false,
      message: `Payment amount cannot exceed due amount of ${feeItem.dueAmount}`
    });
  }

  const receiptNumber = await FeePayment.generateReceiptNumber();

  const payment = new FeePayment({
    studentId,
    studentFeeId,
    feeItemId,
    schoolId: req.user.schoolId,
    academicSessionId: studentFee.academicYearId,
    amountPaid,
    paymentMode,
    transactionId,
    receiptNumber,
    collectedBy: req.user.id,
    feeHeadName: feeItem.feeHeadName,
    remarks,
    createdBy: req.user.id
  });

  const savedPayment = await payment.save();
  await studentFee.addPayment(feeItemId, amountPaid);

  await auditLogger.log({
    action: 'FEE_PAYMENT',
    userId: req.user.id,
    userType: req.user.role,
    schoolId: req.user.schoolId,
    targetId: savedPayment._id,
    targetType: 'FeePayment',
    details: { studentId, amountPaid, receiptNumber },
    ipAddress: req.ip
  });

  res.status(201).json({
    success: true,
    message: 'Payment recorded successfully',
    data: { payment: savedPayment, receiptNumber }
  });
});

/**
 * @desc    Get all payments
 * @route   GET /api/v1/fees/payments
 * @access  Private (Admin, Accountant)
 */
const getPayments = asyncHandler(async (req, res) => {
  const { studentId, academicSessionId, paymentMode, fromDate, toDate, page = 1, limit = 20 } = req.query;

  const filters = { schoolId: req.user.schoolId };

  if (studentId) filters.studentId = studentId;
  if (academicSessionId) filters.academicSessionId = academicSessionId;
  if (paymentMode) filters.paymentMode = paymentMode;
  if (fromDate || toDate) {
    filters.paymentDate = {};
    if (fromDate) filters.paymentDate.$gte = new Date(fromDate);
    if (toDate) filters.paymentDate.$lte = new Date(toDate);
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [payments, total] = await Promise.all([
    FeePayment.find(filters)
      .populate('studentId', 'name admissionNumber')
      .populate('collectedBy', 'name')
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(limitNum),
    FeePayment.countDocuments(filters)
  ]);

  res.status(200).json({
    success: true,
    count: payments.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: payments
  });
});

/**
 * @desc    Get fee dues
 * @route   GET /api/v1/fees/dues
 * @access  Private (Admin, Accountant)
 */
const getFeeDues = asyncHandler(async (req, res) => {
  const { classId, sectionId, academicSessionId, status, page = 1, limit = 20 } = req.query;

  const filters = {
    schoolId: req.user.schoolId,
    'feeItems.status': { $in: ['PENDING', 'PARTIAL', 'OVERDUE'] },
    isDeleted: { $ne: true }
  };

  if (classId) filters.classId = classId;
  if (sectionId) filters.sectionId = sectionId;
  if (academicSessionId) filters.academicYearId = academicSessionId;
  if (status) filters['feeItems.status'] = status;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [dues, total] = await Promise.all([
    StudentFee.find(filters)
      .populate('studentId', 'name admissionNumber')
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('academicYearId', 'name year')
      .sort({ 'feeItems.dueDate': 1 })
      .skip(skip)
      .limit(limitNum),
    StudentFee.countDocuments(filters)
  ]);

  const duesWithItems = dues.map(due => ({
    ...due.toObject(),
    feeItems: due.feeItems.filter(item =>
      ['PENDING', 'PARTIAL', 'OVERDUE'].includes(item.status)
    )
  })).filter(due => due.feeItems.length > 0);

  res.status(200).json({
    success: true,
    count: duesWithItems.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: duesWithItems
  });
});

/**
 * @desc    Process refund
 * @route   POST /api/v1/fees/refund/:paymentId
 * @access  Private (Admin, Accountant)
 */
const processRefund = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const { refundAmount, reason } = req.body;

  const payment = await FeePayment.findById(paymentId);
  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found'
    });
  }

  await payment.processRefund(refundAmount, reason, req.user.id);

  const studentFee = await StudentFee.findById(payment.studentFeeId);
  if (studentFee) {
    const feeItem = studentFee.getFeeItem(payment.feeItemId);
    if (feeItem) {
      feeItem.paidAmount -= refundAmount;
      feeItem.dueAmount += refundAmount;
      if (feeItem.paidAmount <= 0) {
        feeItem.status = 'PENDING';
      } else if (feeItem.paidAmount < feeItem.amount) {
        feeItem.status = 'PARTIAL';
      }
      await studentFee.save();
    }
  }

  await auditLogger.log({
    action: 'FEE_REFUND',
    userId: req.user.id,
    userType: req.user.role,
    schoolId: req.user.schoolId,
    targetId: payment._id,
    targetType: 'FeePayment',
    details: { refundAmount, reason },
    ipAddress: req.ip
  });

  res.status(200).json({
    success: true,
    message: 'Refund processed successfully',
    data: payment
  });
});

module.exports = {
  createFeeStructure,
  getFeeStructures,
  getStudentFeeSummary,
  getClassFeeSummary,
  processPayment,
  getOverdueFees,
  getPaymentHistory,
  generateFeeReport,
  sendFeeReminders,
  getFeeDashboard,
  getStudentFeeDetails,
  getFeeReceipt,
  validateFeeStructure,
  validatePayment,
  // Phase 5 methods
  generateStudentFees,
  getStudentFees,
  makePayment,
  getPayments,
  getFeeDues,
  processRefund
};
