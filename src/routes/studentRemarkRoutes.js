const express = require('express');
const router = express.Router();
const {
  addStudentRemark,
  getStudentRemarks,
  getTeacherRemarks,
  updateStudentRemark,
  deleteStudentRemark,
  getRemarksStats
} = require('../controllers/studentRemarkController');
const { protect } = require('../middlewares/authMiddleware');

// All routes are protected
router.use(protect);

// POST /api/v1/student-remarks - Add new remark
router.post('/', addStudentRemark);

// GET /api/v1/student-remarks/student/:studentId - Get remarks for a student
router.get('/student/:studentId', getStudentRemarks);

// GET /api/v1/student-remarks/teacher - Get remarks added by teacher
router.get('/teacher', getTeacherRemarks);

// GET /api/v1/student-remarks/stats - Get remarks statistics
router.get('/stats', getRemarksStats);

// PUT /api/v1/student-remarks/:remarkId - Update remark
router.put('/:remarkId', updateStudentRemark);

// DELETE /api/v1/student-remarks/:remarkId - Delete remark
router.delete('/:remarkId', deleteStudentRemark);

module.exports = router;
