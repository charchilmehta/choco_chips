/**
 * MedicalRecord Model
 * Stores patient visit records including diagnosis, prescriptions, and reports.
 * Created by doctors after a consultation.
 */

const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  /** Patient this record belongs to */
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  /** Doctor who created this record */
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  /** Linked appointment (if any) */
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
  },

  /** Hospital where the visit occurred */
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
  },

  /** Date of the medical visit */
  visitDate: {
    type: Date,
    default: Date.now,
  },

  /** Doctor's notes from the visit */
  visitNotes: { type: String },

  /** Final diagnosis */
  diagnosis: { type: String },

  /**
   * List of medicines prescribed
   * Each prescription has name, dose, frequency, duration, and instructions
   */
  prescriptions: [
    {
      medicineName: { type: String },
      dosage: { type: String },       // e.g., '500mg'
      frequency: { type: String },    // e.g., 'Twice a day'
      duration: { type: String },     // e.g., '7 days'
      instructions: { type: String }, // e.g., 'Take after meals'
    },
  ],

  /**
   * Medical reports (lab tests, scans, etc.)
   * File URLs are simulated strings in this version
   */
  reports: [
    {
      reportName: { type: String },
      reportType: { type: String },   // e.g., 'Blood Test', 'X-Ray'
      fileUrl: { type: String },      // Simulated URL
      uploadedAt: { type: Date, default: Date.now },
    },
  ],

  /** Date for next follow-up visit */
  followUpDate: { type: Date },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
