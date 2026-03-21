/**
 * DoctorProfile Model
 * Extended profile for users with role = 'doctor'
 * Linked 1-to-1 with the User model
 */

const mongoose = require('mongoose');

const doctorProfileSchema = new mongoose.Schema({
  /** Reference to the User account */
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },

  /** Hospital where the doctor works */
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
  },

  specialization: { type: String },     // e.g. 'Cardiology'
  department: { type: String },         // e.g. 'ICU'
  licenseNumber: { type: String },      // Medical council license

  /** Years of experience */
  experience: { type: Number },

  /** Real-time availability status */
  availabilityStatus: {
    type: String,
    enum: ['available', 'busy', 'offline'],
    default: 'available',
  },

  /**
   * Weekly schedule slots
   * Example: { day: 'Monday', startTime: '09:00', endTime: '17:00', slotDuration: 30 }
   */
  schedule: [
    {
      day: { type: String },          // 'Monday', 'Tuesday', etc.
      startTime: { type: String },    // '09:00'
      endTime: { type: String },      // '17:00'
      slotDuration: { type: Number }, // minutes per appointment slot
    },
  ],

  /** Consultation fee in INR */
  consultationFee: { type: Number },

  /** Doctor's bio / introduction */
  bio: { type: String },

  /** Average rating (0-5) from patients */
  rating: {
    type: Number,
    default: 0,
  },

  /** Total number of consultations completed */
  totalConsultations: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('DoctorProfile', doctorProfileSchema);
