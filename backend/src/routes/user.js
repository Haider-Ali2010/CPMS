const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');
const { checkRole } = require('../middleware/checkPermission');
const auditLogger = require('../middleware/auditLogger');

// Student management endpoints (coordinator only)
router.get('/students', protect, checkRole('coordinator'), userController.getAllStudents);
router.post('/students', protect, checkRole('coordinator'), userController.createStudent);
router.put('/students/:id', protect, checkRole('coordinator'), userController.updateStudent);
router.delete('/students/:id', protect, checkRole('coordinator'), userController.deleteStudent);
router.post('/students/bulk', protect, checkRole('coordinator'), userController.bulkCreateStudents);

// Supervisor and examiner management endpoints (coordinator only)
router.get('/supervisors', protect, checkRole('coordinator'), userController.getAllSupervisors);
router.post('/supervisors', protect, checkRole('coordinator'), userController.createSupervisor);
router.post('/supervisors/bulk', protect, checkRole('coordinator'), userController.bulkCreateSupervisors);
router.get('/examiners', protect, checkRole('coordinator'), userController.getAllExaminers);
router.post('/examiners', protect, checkRole('coordinator'), userController.createExaminer);
router.delete('/supervisors/:id', protect, checkRole('coordinator'), userController.deleteSupervisor);

// Get current user's profile
router.get('/me',
  protect,
  auditLogger('read', 'user'),
  userController.getMyProfile
);

// Update current user's profile
router.put('/me',
  protect,
  auditLogger('update', 'user'),
  userController.updateMyProfile
);

// Update current user's password
router.put('/me/password',
  protect,
  auditLogger('update', 'user'),
  userController.updatePassword
);

// Update user preferences
router.put('/me/preferences',
  protect,
  auditLogger('update', 'user'),
  userController.updatePreferences
);

// Upload avatar
router.post('/me/avatar',
  protect,
  auditLogger('update', 'user'),
  userController.uploadAvatar
);

// Get notifications for the logged-in user
router.get('/notifications', protect, userController.getNotifications);
// Mark a notification as read
router.put('/notifications/:id/read', protect, userController.markNotificationRead);

// Get public profile
router.get('/:id',
  protect,
  auditLogger('read', 'user'),
  userController.getPublicProfile
);

module.exports = router; 