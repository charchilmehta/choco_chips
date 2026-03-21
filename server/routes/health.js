/**
 * Health Routes
 * Handles patient health metric logging and history retrieval.
 */

const express = require('express');
const router = express.Router();
const { logHealthMetrics, getHealthHistory } = require('../controllers/healthController');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

// All health routes are for patients only
router.post('/', auth, roleGuard('patient'), logHealthMetrics);
router.get('/history', auth, roleGuard('patient'), getHealthHistory);

module.exports = router;
