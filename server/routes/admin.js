/**
 * Admin Routes
 * All routes require admin role.
 */

const express = require('express');
const router = express.Router();
const {
  getPendingHospitals,
  approveHospital,
  rejectHospital,
  getAllUsers,
  getMisuseReports,
  getDashboardStats,
} = require('../controllers/adminController');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

// All admin routes require authentication and admin role
router.use(auth, roleGuard('admin'));

router.get('/hospitals/pending', getPendingHospitals);
router.put('/hospitals/:id/approve', approveHospital);
router.put('/hospitals/:id/reject', rejectHospital);
router.get('/users', getAllUsers);
router.get('/misuse-reports', getMisuseReports); // EXTRA FEATURE
router.get('/dashboard', getDashboardStats);

module.exports = router;
