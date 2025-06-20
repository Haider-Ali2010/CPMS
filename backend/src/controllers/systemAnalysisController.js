const SystemAnalysis = require('../models/SystemAnalysis');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/system-analysis';
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

// Upload a new version of system analysis
exports.uploadSystemAnalysis = async (req, res) => {
    try {
        const { projectGroupId } = req.params;
        const file = req.file;
        const userId = req.user.userId;
        const { message: versionMessage } = req.body;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        let systemAnalysis = await SystemAnalysis.findOne({ projectGroup: projectGroupId });

        if (!systemAnalysis) {
            systemAnalysis = new SystemAnalysis({
                projectGroup: projectGroupId,
                versions: []
            });
        }

        systemAnalysis.versions.push({
            file: file.path,
            fileName: file.originalname,
            uploadedBy: userId,
            status: 'pending',
            message: versionMessage
        });

        await systemAnalysis.save();

        res.status(201).json({
            success: true,
            data: systemAnalysis
        });
    } catch (error) {
        console.error('Upload System Analysis Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get all versions of system analysis for a project group
exports.getSystemAnalysis = async (req, res) => {
    try {
        const { projectGroupId } = req.params;
        const systemAnalysis = await SystemAnalysis.findOne({ projectGroup: projectGroupId })
            .populate('versions.uploadedBy', 'name email');

        if (!systemAnalysis) {
            return res.status(404).json({ error: 'System Analysis not found' });
        }

        res.json({
            success: true,
            data: systemAnalysis
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update status of a system analysis version
exports.updateSystemAnalysisStatus = async (req, res) => {
    try {
        const { projectGroupId, versionId } = req.params;
        const { status, feedback } = req.body;

        const systemAnalysis = await SystemAnalysis.findOne({ projectGroup: projectGroupId });
        if (!systemAnalysis) {
            return res.status(404).json({ error: 'System Analysis not found' });
        }

        const version = systemAnalysis.versions.id(versionId);
        if (!version) {
            return res.status(404).json({ error: 'Version not found' });
        }

        version.status = status;
        if (feedback) {
            version.feedback = feedback;
        }

        await systemAnalysis.save();

        res.json({
            success: true,
            data: systemAnalysis
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Download a specific version of system analysis
exports.downloadSystemAnalysis = async (req, res) => {
    try {
        const { projectGroupId, versionId } = req.params;
        const systemAnalysis = await SystemAnalysis.findOne({ projectGroup: projectGroupId });
        
        if (!systemAnalysis) {
            return res.status(404).json({ error: 'System Analysis not found' });
        }

        const version = systemAnalysis.versions.id(versionId);
        if (!version) {
            return res.status(404).json({ error: 'Version not found' });
        }

        res.download(version.file, version.fileName);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}; 