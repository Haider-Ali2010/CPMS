const express = require('express');
const router = express.Router();
const systemDesignController = require('../controllers/systemDesignController');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/system-design/' });

// Upload system design (students only)
router.post(
    '/:projectGroupId/upload',
    protect,
    authorize('student'),
    upload.single('file'),
    systemDesignController.uploadSystemDesign
);

// Get system design versions
router.get(
    '/:projectGroupId',
    protect,
    authorize('student', 'supervisor', 'coordinator', 'examiner'),
    systemDesignController.getSystemDesign
);

// Update system design status (supervisor only)
router.patch(
    '/:projectGroupId/versions/:versionId/status',
    protect,
    authorize('supervisor'),
    systemDesignController.updateSystemDesignStatus
);

// Download system design version
router.get(
    '/:projectGroupId/versions/:versionId/download',
    protect,
    authorize('student', 'supervisor', 'coordinator', 'examiner'),
    systemDesignController.downloadSystemDesign
);

module.exports = router; 