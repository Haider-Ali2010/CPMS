const mongoose = require('mongoose');

const proposalJoinRequestSchema = new mongoose.Schema({
  proposal: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectProposal', required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('ProposalJoinRequest', proposalJoinRequestSchema); 