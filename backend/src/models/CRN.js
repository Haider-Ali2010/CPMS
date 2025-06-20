const mongoose = require('mongoose');

const crnSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'CRN code is required'],
        trim: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: [true, 'Course reference is required']
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    supervisors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProjectProposal',
        required: false
    }
}, {
    timestamps: true
});

// Add indexes for faster queries
crnSchema.index({ code: 1 }, { unique: true });
crnSchema.index({ course: 1 });

const CRN = mongoose.model('CRN', crnSchema);

module.exports = CRN; 