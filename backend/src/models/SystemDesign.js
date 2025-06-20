const mongoose = require('mongoose');

const systemDesignSchema = new mongoose.Schema({
    projectGroup: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProjectGroup',
        required: [true, 'Project group is required']
    },
    versions: [{
        file: {
            type: String,  // URL or path to the file
            required: [true, 'File is required']
        },
        fileName: {
            type: String,
            required: [true, 'File name is required']
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Uploader is required']
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        },
        feedback: {
            type: String,
            trim: true
        },
        message: {
            type: String,
            trim: true
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

systemDesignSchema.index({ projectGroup: 1 });
systemDesignSchema.index({ 'versions.uploadedBy': 1 });

module.exports = mongoose.model('SystemDesign', systemDesignSchema); 