const ProjectProposal = require('../models/ProjectProposal');
const CRN = require('../models/CRN');
const User = require('../models/User');
const ProjectGroup = require('../models/ProjectGroup');
const ProposalJoinRequest = require('../models/ProposalJoinRequest');

// Create a new proposal
exports.createProposal = async (req, res) => {
    try {
        console.log('Proposal create request user:', req.user);
        console.log('Proposal create request body:', req.body);
        
        // Validate required fields
        const requiredFields = ['title', 'techStack', 'summary', 'maxStudents'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        const proposal = new ProjectProposal({
            ...req.body,
            supervisor: req.user.userId,
            status: 'draft'
        });

        console.log('Creating proposal with data:', proposal);
        
        const savedProposal = await proposal.save();
        console.log('Proposal saved successfully:', savedProposal);

        res.status(201).json({
            success: true,
            data: savedProposal
        });
    } catch (error) {
        console.error('Error creating proposal:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Get all proposals
exports.getAllProposals = async (req, res) => {
    try {
        const proposals = await ProjectProposal.find()
            .populate('supervisor', 'firstName lastName email')
            .populate('crn', 'code course')
            .populate('crn.course', 'title')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: proposals.length,
            data: proposals
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get proposals by supervisor
exports.getSupervisorProposals = async (req, res) => {
    try {
        console.log('--- Executing getSupervisorProposals ---');

        const proposals = await ProjectProposal.find({ supervisor: req.user.userId })
            .populate('crn', 'code course')
            .populate('crn.course', 'title')
            .sort({ createdAt: -1 })
            .lean();

        console.log(`Found ${proposals.length} proposals for supervisor ${req.user.userId}`);

        const proposalsWithPending = await Promise.all(proposals.map(async (p) => {
            console.log(`Processing proposal: ${p.title} (ID: ${p._id})`);
            console.log(`Initial currentStudents: ${p.currentStudents}`);

            const pendingRequests = await ProposalJoinRequest.find({
                proposal: p._id,
                status: 'pending'
            });
            
            console.log(`Found ${pendingRequests.length} pending requests for this proposal.`);

            const pendingStudentCount = pendingRequests.reduce((sum, req) => sum + req.students.length, 0);
            console.log(`Calculated pendingStudentCount: ${pendingStudentCount}`);
            
            const finalStudentCount = (p.currentStudents || 0) + pendingStudentCount;
            console.log(`Final calculated student count: ${finalStudentCount}`);

            return {
                ...p,
                currentStudents: finalStudentCount
            };
        }));

        console.log('--- Finished processing proposals, sending response ---');
        console.log('Final data:', JSON.stringify(proposalsWithPending, null, 2));

        res.status(200).json({
            success: true,
            count: proposalsWithPending.length,
            data: proposalsWithPending
        });
    } catch (error) {
        console.error('--- Error in getSupervisorProposals ---', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get single proposal
exports.getProposal = async (req, res) => {
    try {
        const proposal = await ProjectProposal.findById(req.params.id)
            .populate('supervisor', 'firstName lastName email')
            .populate('crn', 'code course')
            .populate('crn.course', 'title');

        if (!proposal) {
            return res.status(404).json({
                success: false,
                error: 'Proposal not found'
            });
        }

        res.status(200).json({
            success: true,
            data: proposal
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Update proposal
exports.updateProposal = async (req, res) => {
    try {
        const proposal = await ProjectProposal.findById(req.params.id);

        if (!proposal) {
            return res.status(404).json({
                success: false,
                error: 'Proposal not found'
            });
        }

        // Only allow updates if proposal is in draft or rejected status
        if (proposal.status !== 'draft' && proposal.status !== 'rejected') {
            return res.status(400).json({
                success: false,
                error: 'Can only update proposals in draft or rejected status'
            });
        }

        // If updating a rejected proposal, set status to draft and clear feedback
        if (proposal.status === 'rejected') {
            req.body.status = 'draft';
            req.body.feedback = undefined;
        }

        // Only allow supervisor to update their own proposal
        if (proposal.supervisor.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this proposal'
            });
        }

        const updatedProposal = await ProjectProposal.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        ).populate('supervisor', 'firstName lastName email')
         .populate('crn', 'code course')
         .populate('crn.course', 'title');

        res.status(200).json({
            success: true,
            data: updatedProposal
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Submit proposal
exports.submitProposal = async (req, res) => {
    try {
        const proposal = await ProjectProposal.findById(req.params.id);

        if (!proposal) {
            return res.status(404).json({
                success: false,
                error: 'Proposal not found'
            });
        }

        // Only allow supervisor to submit their own proposal
        if (proposal.supervisor.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to submit this proposal'
            });
        }

        // Only allow submission if proposal is in draft status
        if (proposal.status !== 'draft') {
            return res.status(400).json({
                success: false,
                error: 'Can only submit proposals in draft status'
            });
        }

        proposal.status = 'submitted';
        await proposal.save();

        res.status(200).json({
            success: true,
            data: proposal
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Approve proposal
exports.approveProposal = async (req, res) => {
    try {
        const proposal = await ProjectProposal.findById(req.params.id);

        if (!proposal) {
            return res.status(404).json({
                success: false,
                error: 'Proposal not found'
            });
        }

        // Only allow coordinator to approve proposals
        if (req.user.role !== 'coordinator') {
            return res.status(403).json({
                success: false,
                error: 'Only coordinators can approve proposals'
            });
        }

        // Only allow approval if proposal is submitted
        if (proposal.status !== 'submitted') {
            return res.status(400).json({
                success: false,
                error: 'Can only approve submitted proposals'
            });
        }

        proposal.status = 'approved';
        // Feedback is optional for approval
        if (typeof req.body.feedback === 'string') {
            proposal.feedback = req.body.feedback;
        }
        await proposal.save();

        // Create a ProjectGroup for the approved proposal
        const existingGroup = await ProjectGroup.findOne({ proposal: proposal._id });
        if (!existingGroup) {
            await ProjectGroup.create({ proposal: proposal._id, students: [] });
        }

        res.status(200).json({
            success: true,
            data: proposal
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Reject proposal
exports.rejectProposal = async (req, res) => {
    try {
        const proposal = await ProjectProposal.findById(req.params.id);

        if (!proposal) {
            return res.status(404).json({
                success: false,
                error: 'Proposal not found'
            });
        }

        // Only allow coordinator to reject proposals
        if (req.user.role !== 'coordinator') {
            return res.status(403).json({
                success: false,
                error: 'Only coordinators can reject proposals'
            });
        }

        // Only allow rejection if proposal is submitted
        if (proposal.status !== 'submitted') {
            return res.status(400).json({
                success: false,
                error: 'Can only reject submitted proposals'
            });
        }

        if (!req.body.feedback) {
            return res.status(400).json({
                success: false,
                error: 'Feedback is required when rejecting a proposal'
            });
        }

        proposal.status = 'rejected';
        proposal.feedback = req.body.feedback;
        await proposal.save();

        res.status(200).json({
            success: true,
            data: proposal
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Delete proposal
exports.deleteProposal = async (req, res) => {
    try {
        console.log('Delete proposal request:', {
            proposalId: req.params.id,
            userId: req.user.userId,
            userRole: req.user.role
        });

        const proposal = await ProjectProposal.findById(req.params.id);

        if (!proposal) {
            console.log('Proposal not found:', req.params.id);
            return res.status(404).json({
                success: false,
                error: 'Proposal not found'
            });
        }

        console.log('Found proposal:', {
            id: proposal._id,
            supervisor: proposal.supervisor,
            status: proposal.status
        });

        // Only allow supervisor to delete their own proposal
        if (proposal.supervisor.toString() !== req.user.userId) {
            console.log('Authorization failed:', {
                proposalSupervisor: proposal.supervisor.toString(),
                requestUserId: req.user.userId
            });
            return res.status(403).json({
                success: false,
                error: 'Not authorized to delete this proposal'
            });
        }

        // Only allow deletion if proposal is in draft status
        if (proposal.status !== 'draft') {
            console.log('Invalid status for deletion:', proposal.status);
            return res.status(400).json({
                success: false,
                error: 'Can only delete proposals in draft status'
            });
        }

        await proposal.deleteOne();
        console.log('Proposal deleted successfully:', req.params.id);

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error('Error deleting proposal:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}; 