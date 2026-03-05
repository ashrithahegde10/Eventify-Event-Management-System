// Demonstrates: Express Middleware, JWT verification, Error Handling

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';

/**
 * Middleware to verify JWT token and attach user to request
 * This protects routes that require authentication
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    // Verify token (demonstrates Callbacks and Promises)
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: 'Invalid or expired token',
        });
      }

      // Attach user to request object
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      req.user = user;
      next();
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

module.exports = authenticateToken;