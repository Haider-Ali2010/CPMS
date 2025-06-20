const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  resource: {
    type: String,
    required: true,
    enum: ['course', 'crn', 'proposal', 'group', 'user', 'announcement', 'feedback']
  },
  action: {
    type: String,
    required: true,
    enum: ['create', 'read', 'update', 'delete', 'approve', 'reject', 'invite', 'submit']
  }
}, { timestamps: true });

module.exports = mongoose.model('Permission', permissionSchema); 