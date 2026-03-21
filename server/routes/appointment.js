/**
 * Appointment Routes
 * Handles appointment booking, listing, status updates, and doctor management.
 */

const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getMyAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  getAvailableSlots,
  getDoctors,
  getDoctorSchedule,
  updateDoctorSchedule,
} = require('../controllers/appointmentController');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

// Public: Get all doctors
router.get('/doctors', getDoctors);

// Specific routes before parameterized routes
router.get('/slots', auth, getAvailableSlots);
router.put('/doctors/schedule', auth, roleGuard('doctor'), updateDoctorSchedule);
router.get('/doctors/schedule', auth, getDoctorSchedule);

// Appointment CRUD
router.post('/', auth, roleGuard('patient'), bookAppointment);
router.get('/', auth, getMyAppointments);
router.get('/:id', auth, getAppointmentById);
router.put('/:id/status', auth, roleGuard('doctor'), updateAppointmentStatus);

module.exports = router;
