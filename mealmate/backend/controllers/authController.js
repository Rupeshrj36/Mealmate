const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

// @desc   Register user
// @route  POST /api/auth/register
// @access Public
const register = async (req, res) => {
  try {
    const { name, email, password, role, college, phone } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered. Please login or use a different email.' });
    }

    // Only allow student or owner role on registration
    const allowedRoles = ['student', 'owner'];
    const userRole = allowedRoles.includes(role) ? role : 'student';

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: userRole,
      college: college ? college.trim() : '',
      phone: phone ? phone.trim() : '',
      isApproved: userRole === 'student' ? true : false  // Owners need admin approval
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: userRole === 'owner'
        ? 'Registration successful! Awaiting admin approval to post menus.'
        : 'Registration successful! Welcome to MealMate.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        college: user.college,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ success: false, message: `${field} already exists` });
    }

    res.status(500).json({ success: false, message: error.message || 'Registration failed. Please try again.' });
  }
};

// @desc   Login
// @route  POST /api/auth/login
// @access Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Find user with password field
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    
    if (!user) {
      console.log(`❌ Login failed: User not found with email: ${normalizedEmail}`);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log(`❌ Login failed: Wrong password for user: ${normalizedEmail}`);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check if account is active
    if (!user.isActive) {
      console.log(`❌ Login failed: Account deactivated for user: ${normalizedEmail}`);
      return res.status(401).json({ success: false, message: 'Account is deactivated. Please contact admin.' });
    }

    // Generate token
    const token = generateToken(user._id);

    console.log(`✅ Login successful: ${user.name} (${normalizedEmail}) - Role: ${user.role}`);

    res.json({
      success: true,
      message: `Welcome back, ${user.name.split(' ')[0]}!`,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        college: user.college,
        phone: user.phone,
        avatar: user.avatar,
        subscriptions: user.subscriptions
      }
    });
  } catch (error) {
    console.error('❌ Login Error:', error.message);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};

// @desc   Get current user profile
// @route  GET /api/auth/me
// @access Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('subscriptions', 'name location');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update profile
// @route  PUT /api/auth/profile
// @access Private
const updateProfile = async (req, res) => {
  try {
    const { name, phone, college, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, college, avatar },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Change password
// @route  PUT /api/auth/change-password
// @access Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Mark notification as read
// @route  PUT /api/auth/notifications/:id/read
// @access Private
const markNotificationRead = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const notif = user.notifications.id(req.params.id);
    if (notif) notif.read = true;
    await user.save();
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword, markNotificationRead };
