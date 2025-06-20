const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Protect middleware - renamed from authenticate for consistency
exports.protect = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Find user and populate role
    const user = await User.findById(decoded.userId).populate('role');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'User account is inactive' });
    }

    // Check if user is locked
    if (user.isLocked()) {
      return res.status(401).json({ message: 'Account is locked. Please try again later' });
    }

    // Add user info to request, use role name string
    req.user = {
      userId: user._id.toString(),
      role: user.role && user.role.name ? user.role.name : user.role
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Authorize middleware for role-based access control
exports.authorize = (...roles) => {
  return (req, res, next) => {
    console.log('Authorize middleware, req.user.role:', req.user ? req.user.role : undefined, 'Allowed roles:', roles);
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
}; 