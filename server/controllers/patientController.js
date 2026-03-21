/**
 * Patient Controller
 * Handles patient profile management, emergency contacts, govt ID submission,
 * and notifications.
 */

const PatientProfile = require('../models/PatientProfile');
const NotificationLog = require('../models/NotificationLog');
const { generateOTP, sendOTP } = require('../utils/otpSimulator');

/**
 * @route   GET /api/patients/profile
 * @desc    Get the logged-in patient's full profile
 * @access  Private (patient)
 */
const getProfile = async (req, res) => {
  try {
    const profile = await PatientProfile.findOne({ user: req.user.id })
      .populate('user', 'name email createdAt');

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    res.json({ success: true, data: profile });
  } catch (error) {
    console.error('GetProfile error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @route   PUT /api/patients/profile
 * @desc    Update patient profile fields
 * @access  Private (patient)
 */
const updateProfile = async (req, res) => {
  try {
    // Fields the patient is allowed to update
    const {
      dateOfBirth, gender, bloodGroup, allergies,
      chronicConditions, address, city, state,
    } = req.body;

    const profile = await PatientProfile.findOneAndUpdate(
      { user: req.user.id },
      { dateOfBirth, gender, bloodGroup, allergies, chronicConditions, address, city, state },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: profile,
    });
  } catch (error) {
    console.error('UpdateProfile error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @route   POST /api/patients/emergency-contacts
 * @desc    Add or replace the patient's emergency contacts list
 * @access  Private (patient)
 */
const addEmergencyContact = async (req, res) => {
  try {
    const { contacts } = req.body; // Array of { name, relationship, phone }

    if (!contacts || !Array.isArray(contacts)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of contacts.',
      });
    }

    const profile = await PatientProfile.findOneAndUpdate(
      { user: req.user.id },
      { emergencyContacts: contacts },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Emergency contacts updated.',
      data: profile.emergencyContacts,
    });
  } catch (error) {
    console.error('AddEmergencyContact error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @route   POST /api/patients/govt-id
 * @desc    Submit government ID details and trigger OTP verification
 * @access  Private (patient)
 */
const submitGovtId = async (req, res) => {
  try {
    const { govtId, govtIdType, phone } = req.body;

    if (!govtId || !govtIdType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide government ID and its type.',
      });
    }

    // Save the govt ID details (not yet verified)
    const profile = await PatientProfile.findOneAndUpdate(
      { user: req.user.id },
      { govtId, govtIdType, govtIdVerified: false },
      { new: true }
    );

    // Automatically generate and send OTP for verification
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    profile.otpData = { otp, expiresAt };
    await profile.save();

    sendOTP(phone || 'patient@simulation.com', otp);

    res.json({
      success: true,
      message: 'Government ID saved. OTP sent for verification (simulated).',
      data: { expiresAt },
    });
  } catch (error) {
    console.error('SubmitGovtId error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @route   GET /api/patients/notifications
 * @desc    Get all notifications for the logged-in patient
 * @access  Private (patient)
 */
const getNotifications = async (req, res) => {
  try {
    const notifications = await NotificationLog.find({ recipient: req.user.id })
      .sort({ createdAt: -1 }) // Most recent first
      .limit(50); // Limit to last 50 notifications

    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error('GetNotifications error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @route   PUT /api/patients/notifications/:id/read
 * @desc    Mark a specific notification as read
 * @access  Private (patient)
 */
const markNotificationRead = async (req, res) => {
  try {
    const notification = await NotificationLog.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    res.json({
      success: true,
      message: 'Notification marked as read.',
      data: notification,
    });
  } catch (error) {
    console.error('MarkNotificationRead error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  addEmergencyContact,
  submitGovtId,
  getNotifications,
  markNotificationRead,
};
