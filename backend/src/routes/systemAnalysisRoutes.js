const express = require('express');
const router = express.Router();
const systemAnalysisController = require('../controllers/systemAnalysisController');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/system-analysis/' });

// Upload system analysis (students only)
router.post(
    '/:projectGroupId/upload',
    protect,
    authorize('student'),
    upload.single('file'),
    systemAnalysisController.uploadSystemAnalysis
);

// Get system analysis versions
router.get(
    '/:projectGroupId',
    protect,
    authorize('student', 'supervisor', 'coordinator', 'examiner'),
    systemAnalysisController.getSystemAnalysis
);

// Update system analysis status (supervisor only)
router.patch(
    '/:projectGroupId/versions/:versionId/status',
    protect,
    authorize('supervisor'),
    systemAnalysisController.updateSystemAnalysisStatus
);

// Download system analysis version
router.get(
    '/:projectGroupId/versions/:versionId/download',
    protect,
    authorize('student', 'supervisor', 'coordinator', 'examiner'),
    systemAnalysisController.downloadSystemAnalysis
);

module.exports = router; 