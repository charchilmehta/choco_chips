/**
 * Appointment Model
 * Represents a scheduled or completed consultation between a patient and doctor.
 * Supports video call integration via WebRTC room IDs.
 */

const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  /** Patient who booked the appointment */
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  /** Doctor assigned to this appointment */
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  /** Hospital where the appointment is held */
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
  },

  /** Type of appointment */
  type: {
    type: String,
    enum: ['normal', 'emergency', 'priority', 'dentist'],
    default: 'normal',
  },

  /** Current status of the appointment */
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled',
  },

  /** Date and time of the appointment */
  appointmentDate: {
    type: Date,
    required: true,
  },

  /** Time slot string e.g. "10:00-10:30" */
  timeSlot: { type: String },

  /** Patient's reported symptoms */
  symptoms: { type: String },

  /** Additional notes from doctor or patient */
  notes: { type: String },

  /**
   * Unique room ID for WebRTC video call
   * Generated using UUID when appointment is booked
   */
  videoRoomId: { type: String },

  /** When the video call started */
  videoCallStartTime: { type: Date },

  /** When the video call ended */
  videoCallEndTime: { type: Date },

  /** AI-calculated risk score (0-100) */
  riskScore: { type: Number },

  /** AI-determined risk level */
  riskLevel: {
    type: String,
    enum: ['high', 'medium', 'low'],
  },

  // EXTRA FEATURE: Track if appointment reminder was sent to patient
  reminderSent: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Appointment', appointmentSchema);
