const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['coordinator', 'supervisor', 'student', 'examiner']
  },
  description: {
    type: String,
    required: true
  },
  permissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  hierarchy: {
    type: Number,
    required: true,
    // Higher number means more privileges
    // coordinator: 4, supervisor: 3, examiner: 2, student: 1
    enum: [1, 2, 3, 4]
  }
}, { timestamps: true });

// Predefined role permissions
roleSchema.statics.initializeRoles = async function() {
  const Permission = mongoose.model('Permission');
  
  // Create basic permissions if they don't exist
  const permissions = {
    // Course permissions
    courseCreate: await Permission.findOneAndUpdate(
      { name: 'course.create' },
      { 
        name: 'course.create',
        description: 'Create new courses',
        resource: 'course',
        action: 'create'
      },
      { upsert: true, new: true }
    ),
    courseRead: await Permission.findOneAndUpdate(
      { name: 'course.read' },
      {
        name: 'course.read',
        description: 'View courses',
        resource: 'course',
        action: 'read'
      },
      { upsert: true, new: true }
    ),
    // Add more permissions as needed
  };

  // Define role permissions
  const roles = [
    {
      name: 'coordinator',
      description: 'Course coordinator with full system access',
      hierarchy: 4,
      permissions: [
        permissions.courseCreate,
        permissions.courseRead,
        // Add more permissions
      ]
    },
    {
      name: 'supervisor',
      description: 'Project supervisor with proposal and group management access',
      hierarchy: 3,
      permissions: [
        permissions.courseRead,
        // Add more permissions
      ]
    },
    {
      name: 'examiner',
      description: 'Project examiner with review and grading access',
      hierarchy: 2,
      permissions: [
        permissions.courseRead,
        // Add more permissions
      ]
    },
    {
      name: 'student',
      description: 'Student with limited access to their own projects',
      hierarchy: 1,
      permissions: [
        permissions.courseRead,
        // Add more permissions
      ]
    }
  ];

  // Create or update roles
  for (const role of roles) {
    await this.findOneAndUpdate(
      { name: role.name },
      role,
      { upsert: true, new: true }
    );
  }
};

module.exports = mongoose.model('Role', roleSchema); 