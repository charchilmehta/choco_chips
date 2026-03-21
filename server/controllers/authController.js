/**
 * Auth Controller
 * Handles user registration, login, profile retrieval, and OTP-based govt ID verification.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const DoctorProfile = require('../models/DoctorProfile');
const NotificationLog = require('../models/NotificationLog');
const { generatePatientId } = require('../utils/patientIdGenerator');
const { generateOTP, sendOTP, verifyOTP } = require('../utils/otpSimulator');

/**
 * Helper: Generate a signed JWT token for a user
 * @param {string} id - User's MongoDB ObjectId
 * @param {string} role - User's role ('admin', 'doctor', 'patient')
 * @returns {string} Signed JWT token
 */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (patient, doctor, or admin)
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role = 'patient' } = req.body;

    // Check if a user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Create the core user account
    const user = await User.create({ name, email, password, role });

    // Create role-specific profiles after user creation
    if (role === 'patient') {
      // Generate a unique human-readable patient ID
      const patientId = generatePatientId();
      await PatientProfile.create({ user: user._id, patientId });
    } else if (role === 'doctor') {
      // Create an empty doctor profile to be filled later
      await DoctorProfile.create({ user: user._id });
    }

    // Generate JWT token for immediate login
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return token
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Find user and explicitly select the password field (it's hidden by default)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Check if the account is active
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is suspended.' });
    }

    // Compare provided password with hashed password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Fetch role-specific profile to include in response
    let profile = null;
    if (user.role === 'patient') {
      profile = await PatientProfile.findOne({ user: user._id });
    } else if (user.role === 'doctor') {
      profile = await DoctorProfile.findOne({ user: user._id }).populate('hospital');
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: 'Login successful!',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profile,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get currently logged-in user's data
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Fetch role-specific profile
    let profile = null;
    if (user.role === 'patient') {
      profile = await PatientProfile.findOne({ user: user._id });
    } else if (user.role === 'doctor') {
      profile = await DoctorProfile.findOne({ user: user._id }).populate('hospital');
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        profile,
      },
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @route   POST /api/auth/send-otp
 * @desc    Generate and send OTP for govt ID verification (simulated)
 * @access  Private (patient)
 */
const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    // Find the patient's profile
    const patientProfile = await PatientProfile.findOne({ user: req.user.id });
    if (!patientProfile) {
      return res.status(404).json({ success: false, message: 'Patient profile not found.' });
    }

    // Generate a 6-digit OTP
    const otp = generateOTP();

    // Store OTP in the patient profile with a 10-minute expiry
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    patientProfile.otpData = { otp, expiresAt };
    await patientProfile.save();

    // Simulate sending the OTP
    const result = sendOTP(phone || 'patient', otp);

    // Log notification
    await NotificationLog.create({
      recipient: req.user.id,
      type: 'otp',
      message: `OTP sent for govt ID verification (simulated). OTP: ${otp}`,
      metadata: { otp, expiresAt },
    });

    res.json({
      success: true,
      message: result.message,
      data: { expiresAt },
    });
  } catch (error) {
    console.error('SendOTP error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP and mark govt ID as verified
 * @access  Private (patient)
 */
const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;

    const patientProfile = await PatientProfile.findOne({ user: req.user.id });
    if (!patientProfile || !patientProfile.otpData || !patientProfile.otpData.otp) {
      return res.status(400).json({ success: false, message: 'No OTP found. Please request a new one.' });
    }

    // Verify the OTP
    const isValid = verifyOTP(
      patientProfile.otpData.otp,
      otp,
      patientProfile.otpData.expiresAt
    );

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }

    // Mark govt ID as verified and clear OTP data
    patientProfile.govtIdVerified = true;
    patientProfile.otpData = undefined;
    await patientProfile.save();

    res.json({
      success: true,
      message: 'Government ID verified successfully!',
    });
  } catch (error) {
    console.error('VerifyOTP error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { register, login, getMe, sendOtp, verifyOtp };
