const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { protect } = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');
const auditLogger = require('../middleware/auditLogger');

// Restore authentication for initialization
router.post('/initialize', 
  protect, 
  checkPermission('user', 'create'),
  auditLogger('create', 'role'),
  roleController.initializeRoles
);

// Get all roles
router.get('/', 
  protect, 
  checkPermission('user', 'read'),
  auditLogger('read', 'role'),
  roleController.getRoles
);

// Get role by ID
router.get('/:id', 
  protect, 
  checkPermission('user', 'read'),
  auditLogger('read', 'role'),
  roleController.getRoleById
);

// Create new role
router.post('/', 
  protect, 
  checkPermission('user', 'create'),
  auditLogger('create', 'role'),
  roleController.createRole
);

// Update role
router.put('/:id', 
  protect, 
  checkPermission('user', 'update'),
  auditLogger('update', 'role'),
  roleController.updateRole
);

// Delete role
router.delete('/:id', 
  protect, 
  checkPermission('user', 'delete'),
  auditLogger('delete', 'role'),
  roleController.deleteRole
);

// Get all permissions
router.get('/permissions', 
  protect, 
  checkPermission('user', 'read'),
  auditLogger('read', 'permission'),
  roleController.getPermissions
);

module.exports = router; 