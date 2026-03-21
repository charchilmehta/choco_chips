/**
 * Hospital Routes
 * Handles hospital registration, listing, and detail endpoints.
 */

const express = require('express');
const router = express.Router();
const {
  registerHospital,
  getHospitals,
  getHospitalById,
  searchHospitals,
  getMyHospital,
} = require('../controllers/hospitalController');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

// IMPORTANT: More specific routes must come BEFORE routes with :id
// Otherwise /search and /my/hospital would be treated as :id

// EXTRA FEATURE: Search hospitals by location (simulated)
router.get('/search', searchHospitals); // Public

// Doctor's own hospital
router.get('/my/hospital', auth, roleGuard('doctor'), getMyHospital);

// List all approved hospitals (public)
router.get('/', getHospitals);

// Register a new hospital (any logged-in user)
router.post('/', auth, registerHospital);

// Get a single hospital by ID (public)
router.get('/:id', getHospitalById);

module.exports = router;
