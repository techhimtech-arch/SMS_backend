const FeeStructure = require('../models/FeeStructure');
const StudentFee = require('../models/StudentFee');
const FeePayment = require('../models/FeePayment');
const asyncHandler = require('express-async-handler');
const ErrorResponse = require('../utils/ErrorResponse');

// POST /api/fees/structure
exports.createFeeStructure = asyncHandler(async (req, res, next) => {
  const { classId, academicYear, tuitionFee, transportFee, examFee, otherCharges } = req.body;

  const existingStructure = await FeeStructure.findOne({
    classId,
    academicYear,
    schoolId: req.user.schoolId,
  });

  if (existingStructure) {
    return next(new ErrorResponse('Fee structure already exists for this class and academic year', 400));
  }

  const feeStructure = await FeeStructure.create({
    classId,
    schoolId: req.user.schoolId,
    academicYear,
    tuitionFee,
    transportFee,
    examFee,
    otherCharges,
  });

  res.status(201).json({ success: true, data: feeStructure });
});

// POST /api/fees/assign/:studentId
exports.assignFeeToStudent = asyncHandler(async (req, res, next) => {
  const { studentId } = req.params;
  const { academicYear } = req.body;

  const feeStructure = await FeeStructure.findOne({
    classId: req.body.classId,
    academicYear,
    schoolId: req.user.schoolId,
  });

  if (!feeStructure) {
    return next(new ErrorResponse('Fee structure not found for this class and academic year', 404));
  }

  const totalAmount =
    feeStructure.tuitionFee +
    feeStructure.transportFee +
    feeStructure.examFee +
    feeStructure.otherCharges;

  const studentFee = await StudentFee.create({
    studentId,
    schoolId: req.user.schoolId,
    academicYear,
    totalAmount,
    balanceAmount: totalAmount,
  });

  res.status(201).json({ success: true, data: studentFee });
});

// POST /api/fees/payment/:studentId
exports.recordFeePayment = asyncHandler(async (req, res, next) => {
  const { studentId } = req.params;
  const { amount, paymentMode } = req.body;

  const studentFee = await StudentFee.findOne({
    studentId,
    schoolId: req.user.schoolId,
  });

  if (!studentFee) {
    return next(new ErrorResponse('Student fee record not found', 404));
  }

  const feePayment = await FeePayment.create({
    studentId,
    schoolId: req.user.schoolId,
    amount,
    paymentMode,
    receivedBy: req.user.userId,
  });

  studentFee.paidAmount += amount;
  studentFee.balanceAmount = studentFee.totalAmount - studentFee.paidAmount;
  await studentFee.save();

  res.status(201).json({ success: true, data: feePayment });
});

// GET /api/fees/student/:studentId
exports.getStudentFeeDetails = asyncHandler(async (req, res, next) => {
  const { studentId } = req.params;

  const studentFee = await StudentFee.findOne({
    studentId,
    schoolId: req.user.schoolId,
  });

  if (!studentFee) {
    return next(new ErrorResponse('Student fee record not found', 404));
  }

  const paymentHistory = await FeePayment.find({
    studentId,
    schoolId: req.user.schoolId,
  });

  res.status(200).json({
    success: true,
    data: {
      totalAmount: studentFee.totalAmount,
      paidAmount: studentFee.paidAmount,
      balanceAmount: studentFee.balanceAmount,
      paymentHistory,
    },
  });
});