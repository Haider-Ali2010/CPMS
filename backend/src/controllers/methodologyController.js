const Methodology = require('../models/Methodology');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/methodology';
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

// Upload a new version of methodology
exports.uploadMethodology = async (req, res) => {
    try {
        const { projectGroupId } = req.params;
        const file = req.file;
        const userId = req.user.userId;
        const { message: versionMessage } = req.body;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        let methodology = await Methodology.findOne({ projectGroup: projectGroupId });

        if (!methodology) {
            methodology = new Methodology({
                projectGroup: projectGroupId,
                versions: []
            });
        }

        methodology.versions.push({
            file: file.path,
            fileName: file.originalname,
            uploadedBy: userId,
            status: 'pending',
            message: versionMessage
        });

        await methodology.save();

        res.status(201).json({
            success: true,
            data: methodology
        });
    } catch (error) {
        console.error('Upload Methodology Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get all versions of methodology for a project group
exports.getMethodology = async (req, res) => {
    try {
        const { projectGroupId } = req.params;
        const methodology = await Methodology.findOne({ projectGroup: projectGroupId })
            .populate('versions.uploadedBy', 'name email');

        if (!methodology) {
            return res.status(404).json({ error: 'Methodology not found' });
        }

        res.json({
            success: true,
            data: methodology
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update status of a methodology version
exports.updateMethodologyStatus = async (req, res) => {
    try {
        const { projectGroupId, versionId } = req.params;
        const { status, feedback } = req.body;

        const methodology = await Methodology.findOne({ projectGroup: projectGroupId });
        if (!methodology) {
            return res.status(404).json({ error: 'Methodology not found' });
        }

        const version = methodology.versions.id(versionId);
        if (!version) {
            return res.status(404).json({ error: 'Version not found' });
        }

        version.status = status;
        if (feedback) {
            version.feedback = feedback;
        }

        await methodology.save();

        res.json({
            success: true,
            data: methodology
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Download a specific version of methodology
exports.downloadMethodology = async (req, res) => {
    try {
        const { projectGroupId, versionId } = req.params;
        const methodology = await Methodology.findOne({ projectGroup: projectGroupId });
        
        if (!methodology) {
            return res.status(404).json({ error: 'Methodology not found' });
        }

        const version = methodology.versions.id(versionId);
        if (!version) {
            return res.status(404).json({ error: 'Version not found' });
        }

        res.download(version.file, version.fileName);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}; 