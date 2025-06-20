const SystemDesign = require('../models/SystemDesign');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/system-design';
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

// Upload a new version of system design
exports.uploadSystemDesign = async (req, res) => {
    try {
        const { projectGroupId } = req.params;
        const file = req.file;
        const userId = req.user.userId;
        const { message: versionMessage } = req.body;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        let systemDesign = await SystemDesign.findOne({ projectGroup: projectGroupId });

        if (!systemDesign) {
            systemDesign = new SystemDesign({
                projectGroup: projectGroupId,
                versions: []
            });
        }

        systemDesign.versions.push({
            file: file.path,
            fileName: file.originalname,
            uploadedBy: userId,
            status: 'pending',
            message: versionMessage
        });

        await systemDesign.save();

        res.status(201).json({
            success: true,
            data: systemDesign
        });
    } catch (error) {
        console.error('Upload System Design Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get all versions of system design for a project group
exports.getSystemDesign = async (req, res) => {
    try {
        const { projectGroupId } = req.params;
        const systemDesign = await SystemDesign.findOne({ projectGroup: projectGroupId })
            .populate('versions.uploadedBy', 'name email');

        if (!systemDesign) {
            return res.status(404).json({ error: 'System Design not found' });
        }

        res.json({
            success: true,
            data: systemDesign
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update status of a system design version
exports.updateSystemDesignStatus = async (req, res) => {
    try {
        const { projectGroupId, versionId } = req.params;
        const { status, feedback } = req.body;

        const systemDesign = await SystemDesign.findOne({ projectGroup: projectGroupId });
        if (!systemDesign) {
            return res.status(404).json({ error: 'System Design not found' });
        }

        const version = systemDesign.versions.id(versionId);
        if (!version) {
            return res.status(404).json({ error: 'Version not found' });
        }

        version.status = status;
        if (feedback) {
            version.feedback = feedback;
        }

        await systemDesign.save();

        res.json({
            success: true,
            data: systemDesign
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Download a specific version of system design
exports.downloadSystemDesign = async (req, res) => {
    try {
        const { projectGroupId, versionId } = req.params;
        const systemDesign = await SystemDesign.findOne({ projectGroup: projectGroupId });
        
        if (!systemDesign) {
            return res.status(404).json({ error: 'System Design not found' });
        }

        const version = systemDesign.versions.id(versionId);
        if (!version) {
            return res.status(404).json({ error: 'Version not found' });
        }

        res.download(version.file, version.fileName);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}; 