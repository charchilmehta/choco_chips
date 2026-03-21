/**
 * Patient Routes
 * All routes require patient role.
 */

const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  addEmergencyContact,
  submitGovtId,
  getNotifications,
  markNotificationRead,
} = require('../controllers/patientController');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

// All patient routes require authentication and patient role
router.use(auth, roleGuard('patient'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/emergency-contacts', addEmergencyContact);
router.post('/govt-id', submitGovtId);
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);

module.exports = router;
