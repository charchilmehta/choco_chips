/**
 * Hospital Model
 * Represents a hospital registered in the system.
 * Hospitals start as 'pending' and must be approved by an admin.
 */

const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  /** Official hospital name */
  name: {
    type: String,
    required: [true, 'Hospital name is required'],
    trim: true,
  },

  /** Whether it is private or government-run */
  type: {
    type: String,
    enum: ['private', 'government'],
    default: 'private',
  },

  address: { type: String },
  city: { type: String },
  state: { type: String },
  pincode: { type: String },
  phone: { type: String },
  email: { type: String },

  /** Official medical registration number */
  registrationNumber: { type: String },

  /** Approval workflow status */
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },

  /** Admin comments on approval or rejection */
  adminNotes: { type: String },

  /** List of departments e.g. ['Cardiology', 'Neurology'] */
  departments: [{ type: String }],

  /** Whether the hospital has 24/7 emergency services */
  emergencyServices: {
    type: Boolean,
    default: true,
  },

  /** Simulated GPS coordinates for location-based features */
  location: {
    lat: { type: Number },
    lng: { type: Number },
  },

  /** Admin who approved/rejected this hospital */
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  approvedAt: { type: Date },

  /** User who submitted this hospital registration */
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Hospital', hospitalSchema);
