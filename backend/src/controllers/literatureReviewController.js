const LiteratureReview = require('../models/LiteratureReview');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/literature-reviews';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    fileFilter: function (req, file, cb) {
        // Only allow .doc and .docx files
        if (file.mimetype === 'application/msword' || 
            file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            cb(null, true);
        } else {
            cb(new Error('Only .doc and .docx files are allowed!'), false);
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Upload a new version of literature review
exports.uploadLiteratureReview = async (req, res) => {
    try {
        const { projectGroupId } = req.params;
        const file = req.file;
        const userId = req.user.userId;
        const { message: versionMessage } = req.body;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        let literatureReview = await LiteratureReview.findOne({ projectGroup: projectGroupId });

        if (!literatureReview) {
            literatureReview = new LiteratureReview({
                projectGroup: projectGroupId,
                versions: []
            });
        }

        literatureReview.versions.push({
            file: file.path,
            fileName: file.originalname,
            uploadedBy: userId,
            status: 'pending',
            message: versionMessage
        });

        await literatureReview.save();

        res.status(201).json({
            success: true,
            data: literatureReview
        });
    } catch (error) {
        console.error('Upload Literature Review Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get all versions of literature review for a project group
exports.getLiteratureReview = async (req, res) => {
    try {
        const { projectGroupId } = req.params;
        const literatureReview = await LiteratureReview.findOne({ projectGroup: projectGroupId })
            .populate('versions.uploadedBy', 'name email');

        if (!literatureReview) {
            return res.status(404).json({ error: 'Literature review not found' });
        }

        res.json({
            success: true,
            data: literatureReview
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update status of a literature review version
exports.updateLiteratureReviewStatus = async (req, res) => {
    try {
        const { projectGroupId, versionId } = req.params;
        const { status, feedback } = req.body;

        const literatureReview = await LiteratureReview.findOne({ projectGroup: projectGroupId });
        if (!literatureReview) {
            return res.status(404).json({ error: 'Literature review not found' });
        }

        const version = literatureReview.versions.id(versionId);
        if (!version) {
            return res.status(404).json({ error: 'Version not found' });
        }

        version.status = status;
        if (feedback) {
            version.feedback = feedback;
        }

        await literatureReview.save();

        res.json({
            success: true,
            data: literatureReview
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Download a specific version of literature review
exports.downloadLiteratureReview = async (req, res) => {
    try {
        const { projectGroupId, versionId } = req.params;
        const literatureReview = await LiteratureReview.findOne({ projectGroup: projectGroupId });
        
        if (!literatureReview) {
            return res.status(404).json({ error: 'Literature review not found' });
        }

        const version = literatureReview.versions.id(versionId);
        if (!version) {
            return res.status(404).json({ error: 'Version not found' });
        }

        res.download(version.file, version.fileName);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}; 