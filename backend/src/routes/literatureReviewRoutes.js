const express = require('express');
const router = express.Router();
const literatureReviewController = require('../controllers/literatureReviewController');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/literature-reviews/' });

// Upload literature review (students only)
router.post(
    '/:projectGroupId/upload',
    protect,
    authorize('student'),
    upload.single('file'),
    literatureReviewController.uploadLiteratureReview
);

// Get literature review versions
router.get(
    '/:projectGroupId',
    protect,
    authorize('student', 'supervisor', 'coordinator', 'examiner'),
    literatureReviewController.getLiteratureReview
);

// Update literature review status (supervisor only)
router.patch(
    '/:projectGroupId/versions/:versionId/status',
    protect,
    authorize('supervisor'),
    literatureReviewController.updateLiteratureReviewStatus
);

// Download literature review version
router.get(
    '/:projectGroupId/versions/:versionId/download',
    protect,
    authorize('student', 'supervisor', 'coordinator', 'examiner'),
    literatureReviewController.downloadLiteratureReview
);

module.exports = router; 