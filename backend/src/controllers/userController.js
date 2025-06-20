const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Role = require('../models/Role');
const crypto = require('crypto');
const { sendActivationEmail } = require('../utils/email');
const Notification = require('../models/Notification');

// Get current user's profile
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password -refreshTokens -resetPasswordToken -resetPasswordExpires -verificationToken -verificationTokenExpires -loginAttempts -lockUntil')
      .populate('role', 'name description');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

// Update current user's profile
exports.updateMyProfile = async (req, res) => {
  try {
    const allowedUpdates = [
      'firstName', 'lastName', 'displayName', 'phone',
      'department', 'title', 'bio', 'preferences'
    ];

    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    Object.assign(user, updates);
    await user.save();

    res.json(user.toPublicProfile());
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

// Update current user's password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash and save new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating password', error: error.message });
  }
};

// Update user preferences
exports.updatePreferences = async (req, res) => {
  try {
    const { emailNotifications, theme } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (emailNotifications !== undefined) {
      user.preferences.emailNotifications = emailNotifications;
    }
    if (theme) {
      user.preferences.theme = theme;
    }

    await user.save();
    res.json(user.preferences);
  } catch (error) {
    res.status(500).json({ message: 'Error updating preferences', error: error.message });
  }
};

// Upload avatar (placeholder - actual implementation would depend on your file storage solution)
exports.uploadAvatar = async (req, res) => {
  try {
    // This is a placeholder. In a real implementation, you would:
    // 1. Handle file upload
    // 2. Process/optimize the image
    // 3. Store it in your file storage (e.g., AWS S3)
    // 4. Update the user's avatar URL
    
    res.json({ message: 'Avatar upload functionality to be implemented' });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading avatar', error: error.message });
  }
};

// Get public profile (for other users to view)
exports.getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('firstName lastName displayName avatar department title bio')
      .populate('role', 'name');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching public profile', error: error.message });
  }
};

// List all students
exports.getAllStudents = async (req, res) => {
  try {
    const studentRole = await Role.findOne({ name: 'student' });
    if (!studentRole) {
      return res.status(500).json({ message: 'Student role not found' });
    }
    const students = await User.find({ role: studentRole._id })
      .select('-password -refreshTokens -resetPasswordToken -resetPasswordExpires -verificationToken -verificationTokenExpires -loginAttempts -lockUntil')
      .sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
};

// Create a new student
exports.createStudent = async (req, res) => {
  try {
    const studentRole = await Role.findOne({ name: 'student' });
    if (!studentRole) {
      return res.status(500).json({ message: 'Student role not found' });
    }
    const { email, password, firstName, lastName, universityId, ...rest } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const activationToken = crypto.randomBytes(32).toString('hex');
    const activationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    const student = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      universityId,
      role: studentRole._id,
      activationToken,
      activationTokenExpires,
      isVerified: false,
      ...rest
    });
    await student.save();
    await sendActivationEmail(student.email, activationToken);
    res.status(201).json(student.toPublicProfile());
  } catch (error) {
    res.status(500).json({ message: 'Error creating student', error: error.message });
  }
};

// Update a student
exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const allowedUpdates = [
      'firstName', 'lastName', 'displayName', 'phone',
      'department', 'title', 'bio', 'preferences', 'email', 'isActive'
    ];
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});
    const student = await User.findByIdAndUpdate(id, updates, { new: true });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student.toPublicProfile());
  } catch (error) {
    res.status(500).json({ message: 'Error updating student', error: error.message });
  }
};

// Delete a student
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await User.findByIdAndDelete(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting student', error: error.message });
  }
};

// Bulk create students
exports.bulkCreateStudents = async (req, res) => {
  try {
    const { students } = req.body;
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: 'No students provided' });
    }
    const studentRole = await Role.findOne({ name: 'student' });
    if (!studentRole) {
      return res.status(500).json({ message: 'Student role not found' });
    }
    // Prepare student docs
    const docs = await Promise.all(students.map(async (s) => {
      if (!s.email || !s.firstName || !s.lastName || !s.universityId) {
        return null;
      }
      const existing = await User.findOne({ email: s.email });
      if (existing) return null; // skip duplicates
      // Generate a random password if not provided
      const password = s.password || crypto.randomBytes(6).toString('hex');
      const hashedPassword = await bcrypt.hash(password, 10);
      const activationToken = crypto.randomBytes(32).toString('hex');
      const activationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      return {
        email: s.email,
        password: hashedPassword,
        firstName: s.firstName,
        lastName: s.lastName,
        universityId: s.universityId,
        phone: s.phone,
        department: s.department,
        role: studentRole._id,
        activationToken,
        activationTokenExpires,
        isVerified: false,
      };
    }));
    const filteredDocs = docs.filter(Boolean);
    if (filteredDocs.length === 0) {
      return res.status(400).json({ message: 'No valid students to insert' });
    }
    const created = await User.insertMany(filteredDocs);
    // Send activation emails with logging and error catching
    await Promise.all(created.map(async (u) => {
      try {
        console.log('Sending activation email to:', u.email, u.activationToken);
        await sendActivationEmail(u.email, u.activationToken);
        console.log('Sent activation email to:', u.email);
      } catch (err) {
        console.error('Failed to send activation email to:', u.email, err);
      }
    }));
    res.status(201).json(created.map(u => u.toPublicProfile()));
  } catch (error) {
    res.status(500).json({ message: 'Error bulk creating students', error: error.message });
  }
};

// Create a new supervisor
exports.createSupervisor = async (req, res) => {
  try {
    const supervisorRole = await Role.findOne({ name: 'supervisor' });
    if (!supervisorRole) {
      return res.status(500).json({ message: 'Supervisor role not found' });
    }
    const { email, password, firstName, lastName, ...rest } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const activationToken = crypto.randomBytes(32).toString('hex');
    const activationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    const supervisor = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: supervisorRole._id,
      activationToken,
      activationTokenExpires,
      isVerified: false,
      ...rest
    });
    await supervisor.save();
    await sendActivationEmail(supervisor.email, activationToken);
    res.status(201).json(supervisor.toPublicProfile());
  } catch (error) {
    res.status(500).json({ message: 'Error creating supervisor', error: error.message });
  }
};

// Create a new examiner
exports.createExaminer = async (req, res) => {
  try {
    const examinerRole = await Role.findOne({ name: 'examiner' });
    if (!examinerRole) {
      return res.status(500).json({ message: 'Examiner role not found' });
    }
    const { email, password, firstName, lastName, ...rest } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const activationToken = crypto.randomBytes(32).toString('hex');
    const activationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    const examiner = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: examinerRole._id,
      activationToken,
      activationTokenExpires,
      isVerified: false,
      ...rest
    });
    await examiner.save();
    await sendActivationEmail(examiner.email, activationToken);
    res.status(201).json(examiner.toPublicProfile());
  } catch (error) {
    res.status(500).json({ message: 'Error creating examiner', error: error.message });
  }
};

// List all supervisors
exports.getAllSupervisors = async (req, res) => {
  try {
    const supervisorRole = await Role.findOne({ name: 'supervisor' });
    if (!supervisorRole) {
      return res.status(500).json({ message: 'Supervisor role not found' });
    }
    const supervisors = await User.find({ role: supervisorRole._id })
      .select('-password -refreshTokens -resetPasswordToken -resetPasswordExpires -verificationToken -verificationTokenExpires -loginAttempts -lockUntil')
      .sort({ createdAt: -1 });
    res.json(supervisors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching supervisors', error: error.message });
  }
};

// List all examiners
exports.getAllExaminers = async (req, res) => {
  try {
    const examinerRole = await Role.findOne({ name: 'examiner' });
    if (!examinerRole) {
      return res.status(500).json({ message: 'Examiner role not found' });
    }
    const examiners = await User.find({ role: examinerRole._id })
      .select('-password -refreshTokens -resetPasswordToken -resetPasswordExpires -verificationToken -verificationTokenExpires -loginAttempts -lockUntil')
      .sort({ createdAt: -1 });
    res.json(examiners);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching examiners', error: error.message });
  }
};

// Bulk create supervisors
exports.bulkCreateSupervisors = async (req, res) => {
  try {
    const { supervisors } = req.body;
    if (!Array.isArray(supervisors) || supervisors.length === 0) {
      return res.status(400).json({ message: 'No supervisors provided' });
    }
    const supervisorRole = await Role.findOne({ name: 'supervisor' });
    if (!supervisorRole) {
      return res.status(500).json({ message: 'Supervisor role not found' });
    }
    // Prepare supervisor docs
    const skipped = [];
    const docs = await Promise.all(supervisors.map(async (s) => {
      if (!s.email || !s.firstName || !s.lastName || !s.universityId) {
        skipped.push({ ...s, reason: 'Missing required fields' });
        return null;
      }
      const existing = await User.findOne({ email: s.email });
      if (existing) {
        skipped.push({ ...s, reason: 'Duplicate email' });
        return null; // skip duplicates
      }
      // Generate a random password if not provided
      const password = s.password || crypto.randomBytes(6).toString('hex');
      const hashedPassword = await bcrypt.hash(password, 10);
      const activationToken = crypto.randomBytes(32).toString('hex');
      const activationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      return {
        email: s.email,
        password: hashedPassword,
        firstName: s.firstName,
        lastName: s.lastName,
        universityId: s.universityId,
        phone: s.phone,
        role: supervisorRole._id,
        activationToken,
        activationTokenExpires,
        isVerified: false,
      };
    }));
    const filteredDocs = docs.filter(Boolean);
    if (filteredDocs.length === 0) {
      return res.status(400).json({ message: 'No valid supervisors to insert', skipped });
    }
    const created = await User.insertMany(filteredDocs);
    // Send activation emails with logging and error catching
    await Promise.all(created.map(async (u) => {
      try {
        console.log('Sending activation email to:', u.email, u.activationToken);
        await sendActivationEmail(u.email, u.activationToken);
        console.log('Sent activation email to:', u.email);
      } catch (err) {
        console.error('Failed to send activation email to:', u.email, err);
      }
    }));
    res.status(201).json({ created: created.map(u => u.toPublicProfile()), skipped });
  } catch (error) {
    res.status(500).json({ message: 'Error bulk creating supervisors', error: error.message });
  }
};

// Delete a supervisor
exports.deleteSupervisor = async (req, res) => {
  try {
    const { id } = req.params;
    const supervisorRole = await Role.findOne({ name: 'supervisor' });
    if (!supervisorRole) {
      return res.status(500).json({ message: 'Supervisor role not found' });
    }
    const supervisor = await User.findOneAndDelete({ _id: id, role: supervisorRole._id });
    if (!supervisor) {
      return res.status(404).json({ message: 'Supervisor not found' });
    }
    res.json({ message: 'Supervisor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting supervisor', error: error.message });
  }
};

// Get notifications for the logged-in user
exports.getNotifications = async (req, res) => {
  try {
    // Debug log
    // console.log('req.user:', req.user);
    const notifications = await Notification.find({ recipient: req.user.userId || req.user._id })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

// Mark a notification as read
exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: req.user.userId },
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification', error: error.message });
  }
}; 