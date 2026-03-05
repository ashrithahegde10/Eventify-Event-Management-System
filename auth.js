const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Event = require('../models/Event');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';

/**
 * POST /api/auth/register
 * Register a new user with extended fields
 */
router.post('/register', async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role, phone } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide first name, last name, email, and password',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Create new user
    const user = new User({ 
      firstName, 
      lastName, 
      email, 
      password,
      role: role || 'user',
      phone: phone || '',
    });
    await user.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/login
 * Login user and return JWT token
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        savedEvents: user.savedEvents,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/profile
 * Get current user profile
 */
router.get('/profile', authenticateToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile', authenticateToken, async (req, res, next) => {
  try {
    const { 
      firstName, 
      lastName, 
      phone, 
      dateOfBirth,
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      pincode 
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;

    // Update address fields
    if (addressLine1 !== undefined) user.address.addressLine1 = addressLine1;
    if (addressLine2 !== undefined) user.address.addressLine2 = addressLine2;
    if (landmark !== undefined) user.address.landmark = landmark;
    if (city !== undefined) user.address.city = city;
    if (state !== undefined) user.address.state = state;
    if (pincode !== undefined) user.address.pincode = pincode;

    await user.save();

    // Return updated user without password
    const updatedUser = await User.findById(user._id).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/save-event/:eventId
 * Save/Like an event
 */
router.post('/save-event/:eventId', authenticateToken, async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check if already saved
    const alreadySaved = user.savedEvents.includes(eventId);
    
    if (alreadySaved) {
      // Remove from saved
      user.savedEvents = user.savedEvents.filter(id => id.toString() !== eventId);
      await user.save();
      
      return res.json({
        success: true,
        message: 'Event removed from saved',
        saved: false,
        savedEvents: user.savedEvents,
      });
    } else {
      // Add to saved
      user.savedEvents.push(eventId);
      await user.save();
      
      return res.json({
        success: true,
        message: 'Event saved successfully',
        saved: true,
        savedEvents: user.savedEvents,
      });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/saved-events
 * Get user's saved events
 */
router.get('/saved-events', authenticateToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'savedEvents',
        populate: {
          path: 'creator',
          select: 'name email phone'
        }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      savedEvents: user.savedEvents,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/notifications
 * Get upcoming event notifications (events within 24 hours)
 */
router.get('/notifications', authenticateToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'savedEvents',
        populate: {
          path: 'creator',
          select: 'name email phone'
        }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Filter events happening within next 24 hours
    const upcomingEvents = user.savedEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= now && eventDate <= tomorrow;
    });

    res.json({
      success: true,
      notifications: upcomingEvents,
      count: upcomingEvents.length,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;