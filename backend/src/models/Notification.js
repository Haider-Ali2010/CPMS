const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['join_request', 'other'], required: true },
  message: { type: String, required: true },
  related: { type: mongoose.Schema.Types.ObjectId, required: false }, // e.g., join request or proposal
  read: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema); 