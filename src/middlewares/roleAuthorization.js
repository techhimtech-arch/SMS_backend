const { hasPermission, requirePermission } = require('../utils/rbac');

// Legacy role-based authorization (for backward compatibility)
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: You do not have the required role.',
      });
    }
    next();
  };
};

// Permission-based authorization (recommended for new features)
const authorizePermissions = (permissions, checkType = 'any') => {
  return requirePermission(permissions, checkType);
};

// Resource-based authorization (check if user can access specific resource)
const authorizeResource = (resourceType, action, resourceOwnerField = 'userId') => {
  return (req, res, next) => {
    const userRole = req.user.role;
    const userId = req.user.userId;
    const permission = `${resourceType}:${action}`;
    
    // Check if user has general permission for this action
    if (!hasPermission(userRole, permission)) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: Insufficient permissions for this action',
        required: permission,
        userRole
      });
    }
    
    // For self-management permissions, check if user owns the resource
    if (permission.includes(':manage_own') && req.params.id) {
      if (req.params.id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access forbidden: You can only manage your own resources'
        });
      }
    }
    
    next();
  };
};

module.exports = {
  authorizeRoles,
  authorizePermissions,
  authorizeResource
};