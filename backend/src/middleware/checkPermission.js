const Role = require('../models/Role');
const User = require('../models/User');

const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      // Get user's role
      const user = await User.findById(req.user.userId).populate({
        path: 'role',
        populate: {
          path: 'permissions'
        }
      });

      if (!user || !user.role) {
        return res.status(403).json({ message: 'Access denied: No role assigned' });
      }

      // Check if role is active
      if (!user.role.isActive) {
        return res.status(403).json({ message: 'Access denied: Role is inactive' });
      }

      // Check if user has the required permission
      const hasPermission = user.role.permissions.some(
        permission => permission.resource === resource && permission.action === action
      );

      if (!hasPermission) {
        return res.status(403).json({ 
          message: `Access denied: No permission to ${action} ${resource}` 
        });
      }

      // Add role hierarchy to request for potential use in route handlers
      req.user.roleHierarchy = user.role.hierarchy;
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ message: 'Error checking permissions' });
    }
  };
};

// Simple role check middleware
const checkRole = (roleName) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.userId).populate('role');
      if (!user || !user.role || user.role.name !== roleName) {
        return res.status(403).json({ message: `Access denied: Only ${roleName}s allowed` });
      }
      next();
    } catch (error) {
      res.status(500).json({ message: 'Error checking role' });
    }
  };
};

module.exports = checkPermission;
module.exports.checkRole = checkRole; 