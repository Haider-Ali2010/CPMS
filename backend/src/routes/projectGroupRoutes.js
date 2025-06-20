const express = require('express');
const router = express.Router();
const projectGroupController = require('../controllers/projectGroupController');
const { protect, authorize } = require('../middleware/auth');

// List all available projects (approved proposals)
router.get('/available', protect, projectGroupController.listAvailableProjects);
// Student joins a project
router.post('/:id/join', protect, projectGroupController.joinProject);
// Send invitation
router.post('/invite', protect, projectGroupController.sendInvitation);
// List invitations for logged-in student
router.get('/invitations', protect, projectGroupController.listInvitations);
// Accept invitation
router.post('/invitations/:id/accept', protect, projectGroupController.acceptInvitation);
// Reject invitation
router.post('/invitations/:id/reject', protect, projectGroupController.rejectInvitation);
// List project groups for the logged-in supervisor
router.get('/supervisor', protect, projectGroupController.listSupervisorGroups);
// List project groups for the logged-in student
router.get('/student', protect, projectGroupController.listStudentGroups);
// Get a single project group by ID
router.get('/group/:id', protect, async (req, res) => {
  const ProjectGroup = require('../models/ProjectGroup');
  try {
    const group = await ProjectGroup.findById(req.params.id)
      .populate({
        path: 'proposal',
        populate: [
          { path: 'supervisor', select: 'firstName lastName email' },
          { path: 'crn', populate: { path: 'course' } }
        ]
      })
      .populate('students', 'firstName lastName email');
    if (!group) {
      return res.status(404).json({ success: false, error: 'Project group not found' });
    }
    res.json({ success: true, data: group });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
// Get a project group by proposal ID
router.get('/group/by-proposal/:proposalId', protect, async (req, res) => {
  const ProjectGroup = require('../models/ProjectGroup');
  try {
    const group = await ProjectGroup.findOne({ proposal: req.params.proposalId })
      .populate({
        path: 'proposal',
        populate: [
          { path: 'supervisor', select: 'firstName lastName email' },
          { path: 'crn', populate: { path: 'course' } }
        ]
      })
      .populate('students', 'firstName lastName email');
    if (!group) {
      return res.status(404).json({ success: false, error: 'Project group not found' });
    }
    res.json({ success: true, data: group });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
// Get due date for a specific stage
router.get('/:groupId/due-date/:stage', protect, authorize('student', 'supervisor', 'coordinator', 'examiner'), projectGroupController.getDueDate);
// Set due date for a specific stage (supervisor only)
router.post('/:groupId/due-date/:stage', protect, authorize('supervisor'), projectGroupController.setDueDate);

module.exports = router; 