const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Course title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Course description is required'],
        trim: true
    },
    semester: {
        type: String,
        required: [true, 'Semester is required'],
        trim: true
    },
    coordinator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Course coordinator is required']
    }
}, {
    timestamps: true
});

// Add index for faster queries
courseSchema.index({ title: 1, semester: 1 }, { unique: true });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course; 