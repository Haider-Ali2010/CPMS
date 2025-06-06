const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['coordinator', 'supervisor', 'student', 'examiner'],
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema); 