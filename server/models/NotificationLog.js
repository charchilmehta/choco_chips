/**
 * NotificationLog Model
 * Logs all system-generated notifications sent to users.
 * Used for emergency alerts, appointment reminders, OTPs, and misuse warnings.
 */

const mongoose = require('mongoose');

const notificationLogSchema = new mongoose.Schema({
  /** User who receives this notification */
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  /** Category of notification */
  type: {
    type: String,
    enum: [
      'emergency_alert',        // Emergency SOS alert
      'appointment_reminder',   // Upcoming appointment reminder
      'misuse_warning',         // Warning for misusing emergency button
      'contact_notification',   // Notification sent to emergency contact
      'helpline_simulated',     // Simulated 108 helpline call
      'otp',                    // OTP for govt ID verification
    ],
  },

  /** The actual notification message text */
  message: {
    type: String,
    required: true,
  },

  /**
   * Extra data relevant to this notification
   * e.g., { appointmentId: '...', emergencyId: '...' }
   */
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },

  /** Whether the user has read this notification */
  read: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('NotificationLog', notificationLogSchema);
