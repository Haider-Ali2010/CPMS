const express = require('express');
const router = express.Router();
const {
    createProposal,
    getAllProposals,
    getSupervisorProposals,
    getProposal,
    updateProposal,
    submitProposal,
    approveProposal,
    rejectProposal,
    deleteProposal
} = require('../controllers/projectProposalController');
const { protect, authorize } = require('../middleware/auth');
const proposalJoinRequestController = require('../controllers/proposalJoinRequestController');

// Routes accessible by supervisors
router.post('/', protect, authorize('supervisor'), createProposal);
router.get('/', protect, authorize('coordinator', 'supervisor'), getAllProposals);

router.get('/my-proposals', protect, authorize('supervisor'), getSupervisorProposals);

router.get('/:id', protect, authorize('coordinator', 'supervisor', 'student'), getProposal);
router.put('/:id', protect, authorize('supervisor'), updateProposal);
router.delete('/:id', protect, authorize('supervisor'), deleteProposal);

// Proposal submission route
router.put('/:id/submit', protect, authorize('supervisor'), submitProposal);

// Proposal approval/rejection routes (coordinator only)
router.put('/:id/approve', protect, authorize('coordinator'), approveProposal);
router.put('/:id/reject', protect, authorize('coordinator'), rejectProposal);

// Student group requests to join a proposal
router.post('/:proposalId/join-request', protect, authorize('student'), proposalJoinRequestController.createJoinRequest);
// Supervisor views all join requests for their proposals
router.get('/join-requests/supervisor', protect, authorize('supervisor'), proposalJoinRequestController.listSupervisorRequests);
// Supervisor approves a join request
router.post('/join-requests/:requestId/approve', protect, authorize('supervisor'), proposalJoinRequestController.approveJoinRequest);
// Supervisor rejects a join request
router.post('/join-requests/:requestId/reject', protect, authorize('supervisor'), proposalJoinRequestController.rejectJoinRequest);

module.exports = router; 