/**
 * User Model
 * Core authentication model for all users (admin, doctor, patient)
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  /** Full name of the user */
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },

  /** Unique email used for login */
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },

  /** Hashed password - never store plain text */
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false, // Don't return password in queries by default
  },

  /** Role determines what the user can access */
  role: {
    type: String,
    enum: ['admin', 'doctor', 'patient'],
    default: 'patient',
  },

  /** Soft delete / account suspension flag */
  isActive: {
    type: Boolean,
    default: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Pre-save hook: Hash password before saving to DB
 * Only runs if the password field was actually modified
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  // Salt rounds = 10 is a good balance between security and speed
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Instance method: Compare entered password with hashed DB password
 * @param {string} enteredPassword - Plain text password from login form
 * @returns {Promise<boolean>} - True if passwords match
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
