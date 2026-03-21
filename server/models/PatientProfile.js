/**
 * PatientProfile Model
 * Extended profile for users with role = 'patient'
 * Includes govt ID verification, emergency contacts, and misuse tracking
 */

const mongoose = require('mongoose');

const patientProfileSchema = new mongoose.Schema({
  /** Reference to the core User account */
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },

  /**
   * Human-readable patient ID
   * Format: PAT-YYYY-XXXXXX (e.g., PAT-2024-047291)
   */
  patientId: {
    type: String,
    unique: true,
  },

  /** Government-issued ID number (e.g., Aadhaar number) */
  govtId: { type: String },

  /** Type of government ID provided */
  govtIdType: {
    type: String,
    enum: ['aadhaar', 'pan', 'passport', 'voter_id'],
  },

  /** Whether the govt ID has been verified via OTP */
  govtIdVerified: {
    type: Boolean,
    default: false,
  },

  dateOfBirth: { type: Date },

  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
  },

  /** e.g., 'O+', 'A-', 'B+' */
  bloodGroup: { type: String },

  /** Known allergies */
  allergies: [{ type: String }],

  /** Long-term conditions like diabetes, hypertension */
  chronicConditions: [{ type: String }],

  /**
   * Emergency contacts to notify during emergencies
   * isNotified tracks if they were already alerted
   */
  emergencyContacts: [
    {
      name: { type: String },
      relationship: { type: String },
      phone: { type: String },
      isNotified: { type: Boolean, default: false },
    },
  ],

  address: { type: String },
  city: { type: String },
  state: { type: String },

  /**
   * Misuse tracking system
   * Patients who misuse the emergency button get strikes
   * After 3 strikes, they are restricted
   */
  misuse: {
    strikes: { type: Number, default: 0 },
    restricted: { type: Boolean, default: false },
    warningShown: { type: Boolean, default: false },
  },

  /**
   * OTP data for govt ID verification (simulated)
   * OTP is stored temporarily and expires after a few minutes
   */
  otpData: {
    otp: { type: String },
    expiresAt: { type: Date },
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('PatientProfile', patientProfileSchema);
