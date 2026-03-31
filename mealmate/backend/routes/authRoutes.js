const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { register, login, getMe, updateProfile, changePassword, markNotificationRead } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Validation middleware
const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  body('email')
    .trim()
    .toLowerCase()
    .isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['student', 'owner']).withMessage('Invalid role'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    next();
  }
];

const validateLogin = [
  body('email')
    .trim()
    .toLowerCase()
    .isEmail().withMessage('Valid email is required'),
  body('password')
    .notEmpty().withMessage('Password is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    next();
  }
];

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.put('/notifications/:id/read', protect, markNotificationRead);

module.exports = router;
