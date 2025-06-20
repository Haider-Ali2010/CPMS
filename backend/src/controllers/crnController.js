const CRN = require('../models/CRN');

// Create a new CRN
exports.createCRN = async (req, res) => {
    console.log('CRN create payload:', req.body); // Debug log
    try {
        // Check for duplicate CRN code
        const existingCRN = await CRN.findOne({ code: req.body.code });
        if (existingCRN) {
            return res.status(400).json({
                success: false,
                error: 'This CRN code is already in use.'
            });
        }
        const crn = new CRN(req.body);
        await crn.save();
        // Link CRN to proposal if project (proposal) ID is provided
        if (req.body.project) {
            const ProjectProposal = require('../models/ProjectProposal');
            await ProjectProposal.findByIdAndUpdate(req.body.project, { crn: crn._id });
        }
        res.status(201).json({
            success: true,
            data: crn
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Get all CRNs
exports.getAllCRNs = async (req, res) => {
    try {
        const crns = await CRN.find()
            .populate('course', 'title description semester')
            .populate('students', 'name email')
            .populate('supervisors', 'name email')
            .populate('project', 'title')
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: crns.length,
            data: crns
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get single CRN by ID
exports.getCRN = async (req, res) => {
    try {
        const crn = await CRN.findById(req.params.id)
            .populate('course', 'title description semester')
            .populate('students', 'name email')
            .populate('supervisors', 'name email')
            .populate('project', 'title');
        
        if (!crn) {
            return res.status(404).json({
                success: false,
                error: 'CRN not found'
            });
        }

        res.status(200).json({
            success: true,
            data: crn
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Update CRN
exports.updateCRN = async (req, res) => {
    try {
        const crn = await CRN.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        )
        .populate('course', 'title description semester')
        .populate('students', 'name email')
        .populate('supervisors', 'name email')
        .populate('project', 'title');

        if (!crn) {
            return res.status(404).json({
                success: false,
                error: 'CRN not found'
            });
        }

        res.status(200).json({
            success: true,
            data: crn
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Delete CRN
exports.deleteCRN = async (req, res) => {
    try {
        const crn = await CRN.findByIdAndDelete(req.params.id);

        if (!crn) {
            return res.status(404).json({
                success: false,
                error: 'CRN not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Add student to CRN
exports.addStudent = async (req, res) => {
    try {
        const crn = await CRN.findById(req.params.id);
        
        if (!crn) {
            return res.status(404).json({
                success: false,
                error: 'CRN not found'
            });
        }

        if (!crn.students.includes(req.body.studentId)) {
            crn.students.push(req.body.studentId);
            await crn.save();
        }

        res.status(200).json({
            success: true,
            data: crn
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Add supervisor to CRN
exports.addSupervisor = async (req, res) => {
    try {
        const crn = await CRN.findById(req.params.id);
        
        if (!crn) {
            return res.status(404).json({
                success: false,
                error: 'CRN not found'
            });
        }

        if (!crn.supervisors.includes(req.body.supervisorId)) {
            crn.supervisors.push(req.body.supervisorId);
            await crn.save();
        }

        res.status(200).json({
            success: true,
            data: crn
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}; 