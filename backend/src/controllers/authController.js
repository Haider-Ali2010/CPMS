const User = require('../models/User');
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use.' });
    }
    // Find the role document
    const roleDoc = await Role.findOne({ name: role.toLowerCase() });
    if (!roleDoc) {
      return res.status(400).json({ message: 'Invalid role selected.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    const user = new User({
      email,
      password: hashedPassword,
      role: roleDoc._id,
      isVerified: false,
      verificationToken,
      verificationTokenExpires
    });
    await user.save();
    // Log verification link to console
    const verificationLink = `http://localhost:3000/verify-email?token=${verificationToken}`;
    console.log(`Verify your email by visiting: ${verificationLink}`);
    res.status(201).json({ message: 'User registered successfully. Please check your email to verify your account.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    // Populate the user's role
    const user = await User.findOne({ email }).populate('role');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    // Debug logging
    console.log('user.role:', user.role);
    console.log('user.role.name:', user.role.name);
    // Sign JWT with role name, not ObjectId
    const token = jwt.sign({ userId: user._id, role: user.role.name }, JWT_SECRET, { expiresIn: '1d' });
    // Generate refresh token
    const refreshToken = crypto.randomBytes(64).toString('hex');
    // Store refresh token in DB
    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push(refreshToken);
    await user.save();
    // Return the role as a string
    res.json({ token, refreshToken, role: user.role.name, userId: user._id });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'No user found with that email address.' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
    await user.save();

    // In a real application, you would send an email here with the reset token
    // For development, we'll just return the token
    res.json({ 
      message: 'Password reset token generated successfully.',
      resetToken // Remove this in production
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ message: 'Verification token is required.' });
    }
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });
    if (!user) {
      return res.status(400).json({ message: 'Verification token is invalid or has expired.' });
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { email, refreshToken } = req.body;
    if (!email || !refreshToken) {
      return res.status(400).json({ message: 'Email and refresh token are required.' });
    }
    const user = await User.findOne({ email });
    if (!user || !user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({ message: 'Invalid refresh token.' });
    }
    // Optionally: Remove used refresh token and add a new one (rotation)
    // user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
    // const newRefreshToken = crypto.randomBytes(64).toString('hex');
    // user.refreshTokens.push(newRefreshToken);
    // await user.save();
    // const refreshTokenToReturn = newRefreshToken;
    // For now, reuse the same refresh token
    const token = jwt.sign({ userId: user._id, role: user.role.name }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.activateAccount = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Activation token and password are required.' });
    }

    // Find user with valid activation token
    const user = await User.findOne({
      activationToken: token,
      activationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Activation token is invalid or has expired.' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user document
    user.password = hashedPassword;
    user.isVerified = true;
    user.activationToken = undefined;
    user.activationTokenExpires = undefined;
    await user.save();

    res.json({ message: 'Account activated successfully. You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 