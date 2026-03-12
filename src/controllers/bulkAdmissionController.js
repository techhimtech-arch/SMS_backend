const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const asyncHandler = require('express-async-handler');
const admissionService = require('../services/admissionService');
const Class = require('../models/Class');
const Section = require('../models/Section');
const logger = require('../utils/logger');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/admissions';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow CSV and Excel files
  if (file.mimetype === 'text/csv' || 
      file.mimetype === 'application/vnd.ms-excel' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    cb(null, true);
  } else {
    cb(new Error('Only CSV and Excel files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

/**
 * @desc    Bulk create partial admissions from CSV/Excel
 * @route   POST /api/v1/admission/bulk
 * @access  Private (school_admin, teacher)
 */
const bulkPartialAdmissions = asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const filePath = req.file.path;
    const results = [];
    const errors = [];
    const schoolId = req.user.schoolId;
    const admittedBy = req.user._id;

    // Get all classes and sections for mapping
    const classes = await Class.find({ schoolId, isActive: true });
    const sections = await Section.find({ schoolId, isActive: true });

    // Create mapping objects
    const classMap = {};
    classes.forEach(cls => {
      classMap[cls.name.toLowerCase()] = cls._id;
      classMap[cls.name] = cls._id;
    });

    const sectionMap = {};
    sections.forEach(section => {
      const key = `${section.name.toLowerCase()}`;
      sectionMap[key] = section._id;
      sectionMap[section.name] = section._id;
    });

    let processedCount = 0;
    let successCount = 0;

    // Process CSV file
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', async (row) => {
        try {
          processedCount++;

          // Validate required fields
          if (!row.firstName || !row.lastName || !row.gender || !row.dateOfBirth) {
            errors.push({
              row: processedCount,
              data: row,
              error: 'Missing required fields: firstName, lastName, gender, dateOfBirth'
            });
            return;
          }

          // Map class and section if provided
          let classId = null;
          let sectionId = null;

          if (row.className && classMap[row.className.toLowerCase()]) {
            classId = classMap[row.className.toLowerCase()];
          }

          if (row.sectionName && sectionMap[row.sectionName.toLowerCase()]) {
            sectionId = sectionMap[row.sectionName.toLowerCase()];
          }

          // Create partial admission data
          const admissionData = {
            firstName: row.firstName.trim(),
            lastName: row.lastName.trim(),
            gender: row.gender.trim(),
            dateOfBirth: new Date(row.dateOfBirth),
            email: row.email ? row.email.trim() : null,
            phone: row.phone ? row.phone.trim() : null,
            address: row.address ? row.address.trim() : null,
            emergencyContact: row.emergencyContact ? row.emergencyContact.trim() : null,
            classId: classId,
            sectionId: sectionId,
            schoolId: schoolId,
            admittedBy: admittedBy,
            admissionDate: new Date()
          };

          // Create partial admission
          const result = await admissionService.createPartialAdmission(
            admissionData,
            schoolId,
            admittedBy
          );

          if (result.success) {
            successCount++;
            results.push({
              row: processedCount,
              data: row,
              status: 'success',
              studentId: result.data.profile._id,
              message: 'Partial admission created successfully'
            });
          } else {
            errors.push({
              row: processedCount,
              data: row,
              error: result.message
            });
          }

        } catch (error) {
          errors.push({
            row: processedCount,
            data: row,
            error: error.message
          });
        }
      })
      .on('end', async () => {
        // Clean up uploaded file
        fs.unlinkSync(filePath);

        res.status(200).json({
          success: true,
          message: `Bulk admission processed successfully`,
          summary: {
            totalProcessed: processedCount,
            successCount: successCount,
            errorCount: errors.length
          },
          results: results,
          errors: errors
        });
      })
      .on('error', (error) => {
        // Clean up uploaded file on error
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        
        res.status(500).json({
          success: false,
          message: 'Error processing file',
          error: error.message
        });
      });

  } catch (error) {
    logger.error('Bulk admission error', {
      error: error.message,
      schoolId: req.user.schoolId
    });

    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Bulk admission failed',
      error: error.message
    });
  }
});

/**
 * @desc    Get bulk admission template
 * @route   GET /api/v1/admission/bulk/template
 * @access  Private
 */
const getBulkTemplate = asyncHandler(async (req, res) => {
  try {
    const schoolId = req.user.schoolId;

    // Get available classes and sections
    const classes = await Class.find({ schoolId, isActive: true }).select('name');
    const sections = await Section.find({ schoolId, isActive: true }).select('name');

    // Create CSV template
    const template = [
      'firstName,lastName,gender,dateOfBirth,email,phone,address,emergencyContact,className,sectionName',
      'John,Doe,Male,2015-01-01,john@email.com,1234567890,123 Main St,9876543210,Class 1,A',
      'Jane,Smith,Female,2016-02-15,jane@email.com,9876543210,456 Oak Ave,1234567890,Class 1,B'
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=bulk-admission-template.csv');
    res.send(template);

  } catch (error) {
    logger.error('Template generation error', {
      error: error.message,
      schoolId: req.user.schoolId
    });

    res.status(500).json({
      success: false,
      message: 'Failed to generate template',
      error: error.message
    });
  }
});

/**
 * @desc    Complete bulk partial admissions
 * @route   PUT /api/v1/admission/bulk/complete
 * @access  Private (school_admin, teacher)
 */
const bulkCompleteAdmissions = asyncHandler(async (req, res) => {
  try {
    const { studentIds, updates } = req.body;
    const schoolId = req.user.schoolId;
    const completedBy = req.user._id;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Student IDs array is required'
      });
    }

    const results = [];
    const errors = [];
    let successCount = 0;

    for (const studentId of studentIds) {
      try {
        const updateData = {
          ...updates,
          status: 'completed',
          completedAt: new Date(),
          completedBy: completedBy
        };

        const result = await admissionService.completeAdmission(
          studentId,
          updateData,
          schoolId,
          completedBy
        );

        if (result.success) {
          successCount++;
          results.push({
            studentId,
            status: 'success',
            message: 'Admission completed successfully'
          });
        } else {
          errors.push({
            studentId,
            error: result.message
          });
        }

      } catch (error) {
        errors.push({
          studentId,
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Bulk completion processed successfully`,
      summary: {
        totalProcessed: studentIds.length,
        successCount: successCount,
        errorCount: errors.length
      },
      results: results,
      errors: errors
    });

  } catch (error) {
    logger.error('Bulk completion error', {
      error: error.message,
      schoolId: req.user.schoolId
    });

    res.status(500).json({
      success: false,
      message: 'Bulk completion failed',
      error: error.message
    });
  }
});

module.exports = {
  bulkPartialAdmissions,
  getBulkTemplate,
  bulkCompleteAdmissions,
  upload
};
