/**
 * Grade Calculator Utility
 * Provides configurable grade calculation and grading utilities
 */

// Default grade ranges - can be overridden by school configuration
const DEFAULT_GRADE_RANGES = [
  { grade: 'A+', min: 90, max: 100, description: 'Outstanding' },
  { grade: 'A', min: 80, max: 89.99, description: 'Excellent' },
  { grade: 'B+', min: 70, max: 79.99, description: 'Very Good' },
  { grade: 'B', min: 60, max: 69.99, description: 'Good' },
  { grade: 'C+', min: 50, max: 59.99, description: 'Average' },
  { grade: 'C', min: 40, max: 49.99, description: 'Below Average' },
  { grade: 'D', min: 33, max: 39.99, description: 'Poor' },
  { grade: 'F', min: 0, max: 32.99, description: 'Fail' }
];

/**
 * Calculate grade based on percentage
 * @param {number} percentage - Student's percentage
 * @param {Array} gradeRanges - Custom grade ranges (optional)
 * @returns {Object} Grade information
 */
const calculateGrade = (percentage, gradeRanges = DEFAULT_GRADE_RANGES) => {
  if (typeof percentage !== 'number' || percentage < 0 || percentage > 100) {
    throw new Error('Percentage must be a number between 0 and 100');
  }

  const grade = gradeRanges.find(range => 
    percentage >= range.min && percentage <= range.max
  );

  if (!grade) {
    throw new Error('No grade range found for the given percentage');
  }

  return {
    grade: grade.grade,
    description: grade.description,
    percentage: Math.round(percentage * 100) / 100
  };
};

/**
 * Calculate pass/fail status
 * @param {number} percentage - Student's percentage
 * @param {number} passingPercentage - Passing threshold
 * @returns {string} Status (PASS, FAIL, ABSENT)
 */
const calculateStatus = (percentage, passingPercentage = 40) => {
  if (percentage === null || percentage === undefined) {
    return 'ABSENT';
  }

  return percentage >= passingPercentage ? 'PASS' : 'FAIL';
};

/**
 * Calculate comprehensive result summary
 * @param {Array} marks - Array of marks entries
 * @param {number} passingPercentage - Passing threshold
 * @param {Array} gradeRanges - Custom grade ranges (optional)
 * @returns {Object} Result summary
 */
const calculateResultSummary = (marks, passingPercentage = 40, gradeRanges = DEFAULT_GRADE_RANGES) => {
  if (!Array.isArray(marks) || marks.length === 0) {
    throw new Error('Marks array is required and cannot be empty');
  }

  const validMarks = marks.filter(mark => 
    mark.status !== 'ABSENT' && 
    mark.marksObtained !== null && 
    mark.marksObtained !== undefined
  );

  const totalMarksObtained = validMarks.reduce((sum, mark) => sum + mark.marksObtained, 0);
  const totalMaxMarks = validMarks.reduce((sum, mark) => sum + mark.maxMarks, 0);
  const overallPercentage = totalMaxMarks > 0 ? (totalMarksObtained / totalMaxMarks) * 100 : 0;

  const gradeInfo = calculateGrade(overallPercentage, gradeRanges);
  const status = calculateStatus(overallPercentage, passingPercentage);

  const subjectResults = marks.map(mark => {
    const subjectPercentage = mark.maxMarks > 0 ? (mark.marksObtained / mark.maxMarks) * 100 : 0;
    const subjectGrade = calculateGrade(subjectPercentage, gradeRanges);
    
    return {
      subjectId: mark.subjectId,
      subjectName: mark.subjectName || 'Unknown',
      marksObtained: mark.marksObtained,
      maxMarks: mark.maxMarks,
      percentage: Math.round(subjectPercentage * 100) / 100,
      grade: subjectGrade.grade,
      status: mark.status || calculateStatus(subjectPercentage, passingPercentage),
      remarks: mark.remarks
    };
  });

  return {
    totalMarksObtained,
    totalMaxMarks,
    overallPercentage: Math.round(overallPercentage * 100) / 100,
    grade: gradeInfo.grade,
    gradeDescription: gradeInfo.description,
    status,
    subjectResults,
    summary: {
      totalSubjects: marks.length,
      passedSubjects: validMarks.filter(mark => mark.status === 'PASS').length,
      failedSubjects: validMarks.filter(mark => mark.status === 'FAIL').length,
      absentSubjects: marks.filter(mark => mark.status === 'ABSENT').length
    }
  };
};

/**
 * Calculate class statistics
 * @param {Array} results - Array of student results
 * @param {Array} gradeRanges - Custom grade ranges (optional)
 * @returns {Object} Class statistics
 */
const calculateClassStatistics = (results, gradeRanges = DEFAULT_GRADE_RANGES) => {
  if (!Array.isArray(results) || results.length === 0) {
    return {
      totalStudents: 0,
      averagePercentage: 0,
      passPercentage: 0,
      gradeDistribution: {},
      highestPercentage: 0,
      lowestPercentage: 0
    };
  }

  const validResults = results.filter(result => 
    result.overallPercentage !== null && 
    result.overallPercentage !== undefined
  );

  const totalStudents = results.length;
  const passedStudents = validResults.filter(result => result.status === 'PASS').length;
  const totalPercentage = validResults.reduce((sum, result) => sum + result.overallPercentage, 0);
  const averagePercentage = validResults.length > 0 ? totalPercentage / validResults.length : 0;
  const passPercentage = totalStudents > 0 ? (passedStudents / totalStudents) * 100 : 0;

  const percentages = validResults.map(result => result.overallPercentage);
  const highestPercentage = percentages.length > 0 ? Math.max(...percentages) : 0;
  const lowestPercentage = percentages.length > 0 ? Math.min(...percentages) : 0;

  // Grade distribution
  const gradeDistribution = {};
  gradeRanges.forEach(range => {
    gradeDistribution[range.grade] = validResults.filter(result => 
      result.grade === range.grade
    ).length;
  });

  return {
    totalStudents,
    averagePercentage: Math.round(averagePercentage * 100) / 100,
    passPercentage: Math.round(passPercentage * 100) / 100,
    gradeDistribution,
    highestPercentage: Math.round(highestPercentage * 100) / 100,
    lowestPercentage: Math.round(lowestPercentage * 100) / 100,
    passedStudents,
    failedStudents: totalStudents - passedStudents
  };
};

/**
 * Validate grade ranges
 * @param {Array} gradeRanges - Grade ranges to validate
 * @returns {boolean} True if valid
 */
const validateGradeRanges = (gradeRanges) => {
  if (!Array.isArray(gradeRanges) || gradeRanges.length === 0) {
    return false;
  }

  // Check for required fields
  for (const range of gradeRanges) {
    if (!range.grade || typeof range.min !== 'number' || typeof range.max !== 'number') {
      return false;
    }
    if (range.min < 0 || range.max > 100 || range.min > range.max) {
      return false;
    }
  }

  // Check for overlaps
  for (let i = 0; i < gradeRanges.length; i++) {
    for (let j = i + 1; j < gradeRanges.length; j++) {
      const range1 = gradeRanges[i];
      const range2 = gradeRanges[j];
      
      if (!(range1.max < range2.min || range2.max < range1.min)) {
        return false; // Overlapping ranges
      }
    }
  }

  return true;
};

/**
 * Get grade point for GPA calculation
 * @param {string} grade - Grade letter
 * @param {Object} gradePoints - Custom grade points mapping (optional)
 * @returns {number} Grade point
 */
const getGradePoint = (grade, gradePoints = null) => {
  const defaultGradePoints = {
    'A+': 10.0,
    'A': 9.0,
    'B+': 8.0,
    'B': 7.0,
    'C+': 6.0,
    'C': 5.0,
    'D': 4.0,
    'F': 0.0
  };

  const points = gradePoints || defaultGradePoints;
  return points[grade] || 0.0;
};

/**
 * Calculate GPA
 * @param {Array} subjects - Array of subjects with credits and grades
 * @param {Object} gradePoints - Custom grade points mapping (optional)
 * @returns {number} GPA
 */
const calculateGPA = (subjects, gradePoints = null) => {
  if (!Array.isArray(subjects) || subjects.length === 0) {
    return 0.0;
  }

  let totalGradePoints = 0;
  let totalCredits = 0;

  subjects.forEach(subject => {
    const credits = subject.credits || 1;
    const gradePoint = getGradePoint(subject.grade, gradePoints);
    
    totalGradePoints += gradePoint * credits;
    totalCredits += credits;
  });

  return totalCredits > 0 ? Math.round((totalGradePoints / totalCredits) * 100) / 100 : 0.0;
};

module.exports = {
  calculateGrade,
  calculateStatus,
  calculateResultSummary,
  calculateClassStatistics,
  validateGradeRanges,
  getGradePoint,
  calculateGPA,
  DEFAULT_GRADE_RANGES
};
