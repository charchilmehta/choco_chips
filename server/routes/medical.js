/**
 * Medical Routes
 * Handles medical record creation, retrieval, and prescription management.
 */

const express = require('express');
const router = express.Router();
const {
  createRecord,
  getPatientRecords,
  getRecordById,
  addPrescription,
  downloadPrescription,
} = require('../controllers/medicalController');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

// Doctor creates a new medical record
router.post('/', auth, roleGuard('doctor'), createRecord);

// Get all records for a specific patient (doctor or patient)
router.get('/patient/:patientId', auth, getPatientRecords);

// Get single record
router.get('/:id', auth, getRecordById);

// Doctor adds prescription to existing record
router.post('/:id/prescription', auth, roleGuard('doctor'), addPrescription);

// EXTRA FEATURE: Simulate prescription PDF download
router.get('/:id/prescription/download', auth, downloadPrescription);

module.exports = router;
