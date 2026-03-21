/**
 * HealthMetric Model
 * Stores patient self-reported health metrics like blood pressure, sugar, and heart rate.
 * Each log includes an AI-style analysis of whether the values are normal.
 */

const mongoose = require('mongoose');

const healthMetricSchema = new mongoose.Schema({
  /** Patient who logged these metrics */
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  /**
   * Blood pressure reading
   * Normal: systolic 90-120, diastolic 60-80
   */
  bp: {
    systolic: { type: Number },
    diastolic: { type: Number },
    status: { type: String, enum: ['Normal', 'High', 'Low'] },
  },

  /**
   * Fasting blood sugar in mg/dL
   * Normal: 70-100 mg/dL
   */
  sugar: {
    value: { type: Number },
    status: { type: String, enum: ['Normal', 'High', 'Low'] },
  },

  /**
   * Resting heart rate in beats per minute
   * Normal: 60-100 bpm
   */
  heartRate: {
    value: { type: Number },
    status: { type: String, enum: ['Normal', 'High', 'Low'] },
  },

  /** Summarized overall health status */
  overallStatus: { type: String },

  /** List of health improvement suggestions */
  suggestions: [{ type: String }],

  /** When the metrics were recorded */
  recordedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('HealthMetric', healthMetricSchema);
