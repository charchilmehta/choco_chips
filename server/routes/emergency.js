/**
 * Emergency Routes
 * Handles all emergency scenarios.
 * The red-button endpoint is NEVER blocked (no role restrictions beyond auth).
 */

const express = require('express');
const router = express.Router();
const {
  createRedButtonEmergency,
  validateEmergency,
  createAppointmentFromEmergency,
  failSafeEmergency,
  getEmergencyEvents,
  resolveEmergency,
} = require('../controllers/emergencyController');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

// Red button: ANY authenticated patient can trigger - NEVER BLOCKED
router.post('/red-button', auth, roleGuard('patient'), createRedButtonEmergency);

// Validation flow
router.post('/validate', auth, roleGuard('patient'), validateEmergency);
router.post('/from-validation', auth, roleGuard('patient'), createAppointmentFromEmergency);
router.post('/fail-safe', auth, roleGuard('patient'), failSafeEmergency);

// Admin and doctor endpoints
router.get('/', auth, roleGuard('admin', 'doctor'), getEmergencyEvents);
router.put('/:id/resolve', auth, roleGuard('admin', 'doctor'), resolveEmergency);

module.exports = router;
