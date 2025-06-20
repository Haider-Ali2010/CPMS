const ProposalJoinRequest = require('../models/ProposalJoinRequest');
const ProjectProposal = require('../models/ProjectProposal');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendJoinRequestNotification } = require('../utils/email');

// Students request to join a proposal
exports.createJoinRequest = async (req, res) => {
  try {
    const { proposalId } = req.params;
    const { studentIds } = req.body; // Array of student IDs

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ error: 'Student IDs are required' });
    }

    // Prevent duplicate requests
    const existing = await ProposalJoinRequest.findOne({
      proposal: proposalId,
      students: { $all: studentIds },
      status: 'pending'
    });
    
    if (existing) {
      return res.status(400).json({ error: 'Request already exists for these students' });
    }

    const request = await ProposalJoinRequest.create({
      proposal: proposalId,
      students: studentIds
    });

    // Find proposal and supervisor for notification
    const proposal = await ProjectProposal.findById(proposalId).populate('supervisor');
    if (proposal && proposal.supervisor) {
      // Create dashboard notification for supervisor
      await Notification.create({
        recipient: proposal.supervisor._id,
        type: 'join_request',
        message: `A group of students has requested to join your proposal: ${proposal.title}`,
        related: request._id
      });

      // Get student names for email
      const students = await User.find({ _id: { $in: studentIds } }).select('firstName lastName email');
      const studentInfo = students.map(s => `${s.firstName} ${s.lastName} (${s.email})`).join(', ');
      
      // Send email notification
      await sendJoinRequestNotification(proposal.supervisor.email, proposal.title, studentInfo);
    }

    res.status(201).json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Supervisor views all requests for their proposals
exports.listSupervisorRequests = async (req, res) => {
  try {
    const supervisorId = req.user.userId;
    // Find proposals by this supervisor
    const proposals = await ProjectProposal.find({ supervisor: supervisorId }).select('_id');
    const proposalIds = proposals.map(p => p._id);
    // Find requests for these proposals
    const requests = await ProposalJoinRequest.find({ proposal: { $in: proposalIds }, status: 'pending' })
      .populate('proposal')
      .populate('students', 'firstName lastName email universityId')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Supervisor approves/registers a group for a proposal
exports.approveJoinRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await ProposalJoinRequest.findById(requestId)
      .populate('proposal')
      .populate('students');
    
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.status !== 'pending') return res.status(400).json({ error: 'Request already processed' });

    // Check if proposal can accept these students
    const proposal = request.proposal;
    if (proposal.currentStudents + request.students.length > proposal.maxStudents) {
      return res.status(400).json({ error: 'Proposal cannot accept more students' });
    }

    // Mark as approved
    request.status = 'approved';
    await request.save();

    // Update proposal's current students count
    proposal.currentStudents += request.students.length;
    await proposal.save();

    res.json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Supervisor rejects a join request
exports.rejectJoinRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await ProposalJoinRequest.findById(requestId);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.status !== 'pending') return res.status(400).json({ error: 'Request already processed' });
    // Mark as rejected
    request.status = 'rejected';
    await request.save();
    res.json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 