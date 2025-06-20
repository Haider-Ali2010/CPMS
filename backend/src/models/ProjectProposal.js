const mongoose = require('mongoose');

const projectProposalSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Project title is required'],
        trim: true
    },
    techStack: [{
        type: String,
        required: [true, 'At least one technology is required'],
        trim: true
    }],
    summary: {
        type: String,
        required: [true, 'Project summary is required'],
        trim: true
    },
    supervisor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Supervisor is required']
    },
    crn: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CRN',
        required: false
    },
    status: {
        type: String,
        enum: ['draft', 'submitted', 'approved', 'rejected'],
        default: 'draft'
    },
    feedback: {
        type: String,
        trim: true
    },
    maxStudents: {
        type: Number,
        required: [true, 'Maximum number of students is required'],
        min: [1, 'Maximum students must be at least 1'],
        max: [5, 'Maximum students cannot exceed 5']
    },
    currentStudents: {
        type: Number,
        default: 0
    },
    semester: {
        type: String,
        required: [true, 'Semester is required'],
        trim: true
    }
}, {
    timestamps: true
});

// Add indexes for faster queries
projectProposalSchema.index({ supervisor: 1, status: 1 });
projectProposalSchema.index({ title: 1 });

// Virtual for checking if proposal is full
projectProposalSchema.virtual('isFull').get(function() {
    return this.currentStudents >= this.maxStudents;
});

// Method to check if proposal can accept more students
projectProposalSchema.methods.canAcceptMoreStudents = function() {
    return this.currentStudents < this.maxStudents;
};

const ProjectProposal = mongoose.model('ProjectProposal', projectProposalSchema);

module.exports = ProjectProposal; 