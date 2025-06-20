const express = require('express');
const router = express.Router();
const methodologyController = require('../controllers/methodologyController');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/methodology/' });

// Upload methodology (students only)
router.post(
    '/:projectGroupId/upload',
    protect,
    authorize('student'),
    upload.single('file'),
    methodologyController.uploadMethodology
);

// Get methodology versions
router.get(
    '/:projectGroupId',
    protect,
    authorize('student', 'supervisor', 'coordinator', 'examiner'),
    methodologyController.getMethodology
);

// Update methodology status (supervisor only)
router.patch(
    '/:projectGroupId/versions/:versionId/status',
    protect,
    authorize('supervisor'),
    methodologyController.updateMethodologyStatus
);

// Download methodology version
router.get(
    '/:projectGroupId/versions/:versionId/download',
    protect,
    authorize('student', 'supervisor', 'coordinator', 'examiner'),
    methodologyController.downloadMethodology
);

module.exports = router; 