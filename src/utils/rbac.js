/**
 * Role-Based Access Control (RBAC) System
 * Defines permissions for different roles in the system
 */

// Define all available permissions
const PERMISSIONS = {
  // User Management
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_MANAGE_OWN: 'user:manage_own',
  
  // Student Management
  STUDENT_CREATE: 'student:create',
  STUDENT_READ: 'student:read',
  STUDENT_UPDATE: 'student:update',
  STUDENT_DELETE: 'student:delete',
  STUDENT_MANAGE_OWN: 'student:manage_own',
  
  // Teacher Management
  TEACHER_CREATE: 'teacher:create',
  TEACHER_READ: 'teacher:read',
  TEACHER_UPDATE: 'teacher:update',
  TEACHER_DELETE: 'teacher:delete',
  
  // Class Management
  CLASS_CREATE: 'class:create',
  CLASS_READ: 'class:read',
  CLASS_UPDATE: 'class:update',
  CLASS_DELETE: 'class:delete',
  
  // Subject Management
  SUBJECT_CREATE: 'subject:create',
  SUBJECT_READ: 'subject:read',
  SUBJECT_UPDATE: 'subject:update',
  SUBJECT_DELETE: 'subject:delete',
  
  // Attendance Management
  ATTENDANCE_CREATE: 'attendance:create',
  ATTENDANCE_READ: 'attendance:read',
  ATTENDANCE_UPDATE: 'attendance:update',
  
  // Fee Management
  FEE_CREATE: 'fee:create',
  FEE_READ: 'fee:read',
  FEE_UPDATE: 'fee:update',
  FEE_DELETE: 'fee:delete',
  
  // Exam Management
  EXAM_CREATE: 'exam:create',
  EXAM_READ: 'exam:read',
  EXAM_UPDATE: 'exam:update',
  EXAM_DELETE: 'exam:delete',
  EXAM_GRADE: 'exam:grade',
  
  // Announcement Management
  ANNOUNCEMENT_CREATE: 'announcement:create',
  ANNOUNCEMENT_READ: 'announcement:read',
  ANNOUNCEMENT_UPDATE: 'announcement:update',
  ANNOUNCEMENT_DELETE: 'announcement:delete',
  
  // Report Management
  REPORT_READ: 'report:read',
  REPORT_GENERATE: 'report:generate',
  
  // System Administration
  SYSTEM_CONFIG: 'system:config',
  SYSTEM_AUDIT: 'system:audit',
  SYSTEM_BACKUP: 'system:backup',
  
  // School Management
  SCHOOL_MANAGE: 'school:manage',
  SCHOOL_SETTINGS: 'school:settings'
};

// Role-based permission mapping
const ROLE_PERMISSIONS = {
  superadmin: Object.values(PERMISSIONS), // All permissions
  
  school_admin: [
    // User Management
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    
    // Student Management
    PERMISSIONS.STUDENT_CREATE,
    PERMISSIONS.STUDENT_READ,
    PERMISSIONS.STUDENT_UPDATE,
    PERMISSIONS.STUDENT_DELETE,
    
    // Teacher Management
    PERMISSIONS.TEACHER_CREATE,
    PERMISSIONS.TEACHER_READ,
    PERMISSIONS.TEACHER_UPDATE,
    PERMISSIONS.TEACHER_DELETE,
    
    // Class Management
    PERMISSIONS.CLASS_CREATE,
    PERMISSIONS.CLASS_READ,
    PERMISSIONS.CLASS_UPDATE,
    PERMISSIONS.CLASS_DELETE,
    
    // Subject Management
    PERMISSIONS.SUBJECT_CREATE,
    PERMISSIONS.SUBJECT_READ,
    PERMISSIONS.SUBJECT_UPDATE,
    PERMISSIONS.SUBJECT_DELETE,
    
    // Attendance Management
    PERMISSIONS.ATTENDANCE_CREATE,
    PERMISSIONS.ATTENDANCE_READ,
    PERMISSIONS.ATTENDANCE_UPDATE,
    
    // Fee Management
    PERMISSIONS.FEE_CREATE,
    PERMISSIONS.FEE_READ,
    PERMISSIONS.FEE_UPDATE,
    PERMISSIONS.FEE_DELETE,
    
    // Exam Management
    PERMISSIONS.EXAM_CREATE,
    PERMISSIONS.EXAM_READ,
    PERMISSIONS.EXAM_UPDATE,
    PERMISSIONS.EXAM_DELETE,
    PERMISSIONS.EXAM_GRADE,
    
    // Announcement Management
    PERMISSIONS.ANNOUNCEMENT_CREATE,
    PERMISSIONS.ANNOUNCEMENT_READ,
    PERMISSIONS.ANNOUNCEMENT_UPDATE,
    PERMISSIONS.ANNOUNCEMENT_DELETE,
    
    // Report Management
    PERMISSIONS.REPORT_READ,
    PERMISSIONS.REPORT_GENERATE,
    
    // School Management
    PERMISSIONS.SCHOOL_MANAGE,
    PERMISSIONS.SCHOOL_SETTINGS
  ],
  
  teacher: [
    // User Management (own profile)
    PERMISSIONS.USER_MANAGE_OWN,
    
    // Student Management (students in their classes)
    PERMISSIONS.STUDENT_READ,
    PERMISSIONS.STUDENT_UPDATE,
    
    // Teacher Management (read colleagues)
    PERMISSIONS.TEACHER_READ,
    
    // Class Management (their assigned classes)
    PERMISSIONS.CLASS_READ,
    
    // Subject Management (subjects they teach)
    PERMISSIONS.SUBJECT_READ,
    
    // Attendance Management
    PERMISSIONS.ATTENDANCE_CREATE,
    PERMISSIONS.ATTENDANCE_READ,
    PERMISSIONS.ATTENDANCE_UPDATE,
    
    // Exam Management
    PERMISSIONS.EXAM_READ,
    PERMISSIONS.EXAM_UPDATE,
    PERMISSIONS.EXAM_GRADE,
    
    // Announcement Management
    PERMISSIONS.ANNOUNCEMENT_READ,
    PERMISSIONS.ANNOUNCEMENT_CREATE,
    
    // Report Management
    PERMISSIONS.REPORT_READ
  ],
  
  accountant: [
    // User Management (own profile)
    PERMISSIONS.USER_MANAGE_OWN,
    
    // Student Management (read only)
    PERMISSIONS.STUDENT_READ,
    
    // Teacher Management (read only)
    PERMISSIONS.TEACHER_READ,
    
    // Class Management (read only)
    PERMISSIONS.CLASS_READ,
    
    // Fee Management (full access)
    PERMISSIONS.FEE_CREATE,
    PERMISSIONS.FEE_READ,
    PERMISSIONS.FEE_UPDATE,
    PERMISSIONS.FEE_DELETE,
    
    // Report Management
    PERMISSIONS.REPORT_READ,
    PERMISSIONS.REPORT_GENERATE,
    
    // Announcement Management
    PERMISSIONS.ANNOUNCEMENT_READ
  ],
  
  parent: [
    // User Management (own profile)
    PERMISSIONS.USER_MANAGE_OWN,
    
    // Student Management (own children)
    PERMISSIONS.STUDENT_READ,
    PERMISSIONS.STUDENT_MANAGE_OWN,
    
    // Teacher Management (read their children's teachers)
    PERMISSIONS.TEACHER_READ,
    
    // Class Management (read their children's classes)
    PERMISSIONS.CLASS_READ,
    
    // Attendance Management (read their children's attendance)
    PERMISSIONS.ATTENDANCE_READ,
    
    // Fee Management (their children's fees)
    PERMISSIONS.FEE_READ,
    
    // Exam Management (their children's results)
    PERMISSIONS.EXAM_READ,
    
    // Announcement Management
    PERMISSIONS.ANNOUNCEMENT_READ,
    
    // Report Management
    PERMISSIONS.REPORT_READ
  ],
  
  student: [
    // User Management (own profile)
    PERMISSIONS.USER_MANAGE_OWN,
    
    // Student Management (own profile)
    PERMISSIONS.STUDENT_MANAGE_OWN,
    
    // Teacher Management (read their teachers)
    PERMISSIONS.TEACHER_READ,
    
    // Class Management (read their class)
    PERMISSIONS.CLASS_READ,
    
    // Attendance Management (read their attendance)
    PERMISSIONS.ATTENDANCE_READ,
    
    // Fee Management (read their fees)
    PERMISSIONS.FEE_READ,
    
    // Exam Management (read their results)
    PERMISSIONS.EXAM_READ,
    
    // Announcement Management
    PERMISSIONS.ANNOUNCEMENT_READ
  ]
};

/**
 * Check if a role has a specific permission
 * @param {string} role - User role
 * @param {string} permission - Permission to check
 * @returns {boolean} - Whether the role has the permission
 */
const hasPermission = (role, permission) => {
  const rolePermissions = ROLE_PERMISSIONS[role] || [];
  return rolePermissions.includes(permission);
};

/**
 * Check if a role has any of the specified permissions
 * @param {string} role - User role
 * @param {Array} permissions - Array of permissions to check
 * @returns {boolean} - Whether the role has any of the permissions
 */
const hasAnyPermission = (role, permissions) => {
  return permissions.some(permission => hasPermission(role, permission));
};

/**
 * Check if a role has all of the specified permissions
 * @param {string} role - User role
 * @param {Array} permissions - Array of permissions to check
 * @returns {boolean} - Whether the role has all the permissions
 */
const hasAllPermissions = (role, permissions) => {
  return permissions.every(permission => hasPermission(role, permission));
};

/**
 * Get all permissions for a role
 * @param {string} role - User role
 * @returns {Array} - Array of permissions
 */
const getRolePermissions = (role) => {
  return ROLE_PERMISSIONS[role] || [];
};

/**
 * Middleware to check if user has required permission
 * @param {string|Array} requiredPermissions - Required permission(s)
 * @param {string} checkType - 'any' or 'all' (default: 'any')
 * @returns {Function} - Express middleware
 */
const requirePermission = (requiredPermissions, checkType = 'any') => {
  return (req, res, next) => {
    const userRole = req.user.role;
    const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
    
    let hasRequiredPermission;
    
    if (checkType === 'all') {
      hasRequiredPermission = hasAllPermissions(userRole, permissions);
    } else {
      hasRequiredPermission = hasAnyPermission(userRole, permissions);
    }
    
    if (!hasRequiredPermission) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: Insufficient permissions',
        required: permissions,
        userRole
      });
    }
    
    next();
  };
};

module.exports = {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRolePermissions,
  requirePermission
};
