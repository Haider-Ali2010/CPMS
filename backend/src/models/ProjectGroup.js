const mongoose = require('mongoose');

const projectGroupSchema = new mongoose.Schema({
  proposal: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectProposal', required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  invitations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Invitation' }],
  status: { type: String, enum: ['active', 'full'], default: 'active' },
  dueDates: {
    literatureReview: {
      date: Date,
      active: { type: Boolean, default: false }
    },
    methodology: {
      date: Date,
      active: { type: Boolean, default: false }
    },
    systemAnalysis: {
      date: Date,
      active: { type: Boolean, default: false }
    },
    systemDesign: {
      date: Date,
      active: { type: Boolean, default: false }
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('ProjectGroup', projectGroupSchema); 