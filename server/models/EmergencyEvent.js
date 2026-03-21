/**
 * EmergencyEvent Model
 * Tracks emergency events triggered by patients.
 * Supports three types: red_button (instant), validated (AI-checked), fail_safe (abandoned flow)
 */

const mongoose = require('mongoose');

const emergencyEventSchema = new mongoose.Schema({
  /** Patient who triggered the emergency */
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  /** Nearest hospital that received the alert */
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
  },

  /**
   * Type of emergency event:
   * - red_button: Instant SOS without validation
   * - validated: Went through AI risk assessment
   * - fail_safe: Patient started validation but abandoned it
   */
  type: {
    type: String,
    enum: ['red_button', 'validated', 'fail_safe'],
    default: 'red_button',
  },

  /** Current status of the emergency response */
  status: {
    type: String,
    enum: ['active', 'responding', 'resolved'],
    default: 'active',
  },

  /**
   * Patient's location during the emergency
   * In this version, location is simulated
   */
  location: {
    lat: { type: Number },
    lng: { type: Number },
    address: { type: String },
    simulated: { type: Boolean, default: true },
  },

  /** Symptoms reported by patient */
  symptoms: { type: String },

  /** AI-calculated risk score (0-100) */
  riskScore: { type: Number },

  /** AI-determined risk level */
  riskLevel: {
    type: String,
    enum: ['high', 'medium', 'low'],
  },

  /** Whether the hospital emergency team was alerted */
  alertSent: {
    type: Boolean,
    default: false,
  },

  /** Whether emergency contacts were notified */
  emergencyContactsNotified: {
    type: Boolean,
    default: false,
  },

  /** Whether 108/911 helpline call was simulated */
  helplineSimulated: {
    type: Boolean,
    default: false,
  },

  /** Additional notes from responding doctor or admin */
  notes: { type: String },

  /** When the emergency was marked resolved */
  resolvedAt: { type: Date },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('EmergencyEvent', emergencyEventSchema);
