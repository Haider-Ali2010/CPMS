const ProjectGroup = require('../models/ProjectGroup');
const ProjectProposal = require('../models/ProjectProposal');
const Invitation = require('../models/Invitation');
const User = require('../models/User');

// List all available (approved) projects for students
exports.listAvailableProjects = async (req, res) => {
  try {
    // 1. Find all approved and not-full project proposals
    const availableProposals = await ProjectProposal.find({
      status: 'approved',
      $expr: { $lt: ['$currentStudents', '$maxStudents'] }
    }).select('_id');

    const availableProposalIds = availableProposals.map(p => p._id);

    // 2. Find all project groups for these proposals
    const groups = await ProjectGroup.find({ proposal: { $in: availableProposalIds } })
      .populate({
        path: 'proposal',
        populate: { path: 'supervisor', select: 'firstName lastName email' }
      })
      .populate('students', 'firstName lastName email');

    res.json({ success: true, data: groups });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Student joins a project
exports.joinProject = async (req, res) => {
  try {
    const group = await ProjectGroup.findById(req.params.id).populate('proposal');
    if (!group) return res.status(404).json({ success: false, error: 'Project not found' });
    // Check if already joined
    if (group.students.includes(req.user.userId)) {
      return res.status(400).json({ success: false, error: 'Already joined this project' });
    }
    // Check if project is full
    if (group.students.length >= group.proposal.maxStudents) {
      return res.status(400).json({ success: false, error: 'Project is full' });
    }
    group.students.push(req.user.userId);
    await group.save();

    // Increment currentStudents in the related proposal
    await ProjectProposal.findByIdAndUpdate(
      group.proposal._id,
      { $inc: { currentStudents: 1 } }
    );

    res.json({ success: true, data: group });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Send invitation to another student
exports.sendInvitation = async (req, res) => {
  try {
    const { to, project } = req.body;
    if (!to || !project) return res.status(400).json({ success: false, error: 'Missing fields' });

    // Resolve 'to' as either userId or email
    let toUser;
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(to)) {
      toUser = await User.findById(to);
    } else {
      toUser = await User.findOne({ email: to });
    }
    if (!toUser) return res.status(404).json({ success: false, error: 'Recipient user not found' });

    // Prevent duplicate invitations
    const existing = await Invitation.findOne({ project, from: req.user.userId, to: toUser._id, status: 'pending' });
    if (existing) return res.status(400).json({ success: false, error: 'Invitation already sent' });
    const invitation = await Invitation.create({ project, from: req.user.userId, to: toUser._id });
    // Add to project group
    await ProjectGroup.findByIdAndUpdate(project, { $addToSet: { invitations: invitation._id } });
    res.json({ success: true, data: invitation });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// List invitations for the logged-in student
exports.listInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.find({ to: req.user.userId })
      .populate('project')
      .populate('from', 'firstName lastName email');
    res.json({ success: true, data: invitations });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Accept invitation
exports.acceptInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id);
    if (!invitation) return res.status(404).json({ success: false, error: 'Invitation not found' });
    if (invitation.to.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    invitation.status = 'accepted';
    await invitation.save();
    // Add student to project group
    await ProjectGroup.findByIdAndUpdate(invitation.project, { $addToSet: { students: req.user.userId } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Reject invitation
exports.rejectInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id);
    if (!invitation) return res.status(404).json({ success: false, error: 'Invitation not found' });
    if (invitation.to.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    invitation.status = 'rejected';
    await invitation.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// List project groups for the logged-in supervisor
exports.listSupervisorGroups = async (req, res) => {
  try {
    // Find all project groups where the proposal's supervisor is the logged-in user
    const groups = await ProjectGroup.find()
      .populate({
        path: 'proposal',
        populate: { path: 'supervisor', select: 'firstName lastName email' }
      })
      .populate('students', 'firstName lastName email');
    // Filter out groups where proposal is not for this supervisor
    const supervisorGroups = groups.filter(g => g.proposal && g.proposal.supervisor && g.proposal.supervisor._id.toString() === req.user.userId);
    res.json({ success: true, data: supervisorGroups });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get a single project group by ID
exports.getGroupById = async (req, res) => {
  try {
    const group = await ProjectGroup.findById(req.params.id)
      .populate({
        path: 'proposal',
        populate: { path: 'supervisor', select: 'firstName lastName email' }
      })
      .populate('students', 'firstName lastName email');
    if (!group) {
      return res.status(404).json({ success: false, error: 'Project group not found' });
    }
    res.json({ success: true, data: group });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}; 

// List project groups for the logged-in student
exports.listStudentGroups = async (req, res) => {
  try {
    const groups = await ProjectGroup.find({ students: req.user.userId })
      .populate({
        path: 'proposal',
        select: 'title semester status'
      })
      .populate('students', 'firstName lastName email');
    res.json({ success: true, data: groups });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get due date for a specific stage
exports.getDueDate = async (req, res) => {
  try {
    const { groupId, stage } = req.params;
    const group = await ProjectGroup.findById(groupId);
    if (!group) return res.status(404).json({ error: 'Project group not found' });
    const dueDateObj = group.dueDates?.[stage] || {};
    const dueDate = dueDateObj.date;
    const active = dueDateObj.active ?? false;
    res.json({ success: true, dueDate, active });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Set due date for a specific stage
exports.setDueDate = async (req, res) => {
  try {
    const { groupId, stage } = req.params;
    const { dueDate, active } = req.body;
    const group = await ProjectGroup.findById(groupId);
    if (!group) return res.status(404).json({ error: 'Project group not found' });
    if (!group.dueDates) group.dueDates = {};
    group.dueDates[stage] = {
      date: dueDate,
      active: typeof active === 'boolean' ? active : false
    };
    await group.save();
    res.json({ success: true, dueDate: group.dueDates[stage].date, active: group.dueDates[stage].active });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 