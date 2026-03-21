/**
 * Auth Routes
 * Handles user registration, login, and profile endpoints.
 */

const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  sendOtp,
  verifyOtp,
} = require('../controllers/authController');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

// Public routes (no authentication required)
router.post('/register', register);
router.post('/login', login);

// Protected routes (must be logged in)
router.get('/me', auth, getMe);
router.post('/send-otp', auth, roleGuard('patient'), sendOtp);
router.post('/verify-otp', auth, roleGuard('patient'), verifyOtp);

module.exports = router;
